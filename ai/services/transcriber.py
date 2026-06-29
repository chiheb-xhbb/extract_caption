"""
AutoCaption AI – WhisperTranscriber Service
Owns the WhisperModel lifecycle: loads once at startup, provides a
thread-safe transcribe() method, and optionally warms up the GPU.
"""
from __future__ import annotations

import logging
import os
import tempfile
import time
import wave
from pathlib import Path
from typing import Optional

from faster_whisper import WhisperModel

from config import AppConfig
from schemas import SegmentResult, TimingMetrics, TranscriptionResponse, WordResult

logger = logging.getLogger("autocaption.transcriber")


class WhisperTranscriber:
    """
    Singleton-like service wrapping faster-whisper.

    Usage:
        transcriber = WhisperTranscriber(config)
        transcriber.load()          # call once at startup
        transcriber.warmup()        # optional – pre-JIT GPU kernels
        result = transcriber.transcribe(audio_path, language)
        transcriber.unload()        # call on shutdown
    """

    def __init__(self, config: AppConfig) -> None:
        self._config = config
        self._model: Optional[WhisperModel] = None
        self._ready: bool = False

    # ── Lifecycle ──────────────────────────────────────────────────────────

    def load(self) -> None:
        """Load the WhisperModel onto GPU. Raises on any failure."""
        cfg = self._config
        logger.info(
            "transcriber.model_loading model=%s device=%s compute_type=%s",
            cfg.whisper_model, cfg.device, cfg.compute_type,
        )
        t0 = time.perf_counter()
        self._model = WhisperModel(
            cfg.whisper_model,
            device=cfg.device,
            compute_type=cfg.compute_type,
            cpu_threads=cfg.cpu_threads,
        )
        elapsed = int((time.perf_counter() - t0) * 1000)
        logger.info("transcriber.model_ready elapsed_ms=%s", elapsed)
        self._ready = True

    def warmup(self) -> None:
        """
        Run a silent 1-second audio clip through the model to pre-JIT all GPU
        kernels. Prevents the first real request from paying compilation cost.
        """
        if not self._ready or self._model is None:
            raise RuntimeError("Cannot warm up – model is not loaded.")

        logger.info("transcriber.warmup_start")
        t0 = time.perf_counter()

        # Write a 1-second silent WAV to a temp file
        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        try:
            with wave.open(tmp.name, "w") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(16000)
                wf.writeframes(b"\x00\x00" * 16000)  # 1 second of silence

            segments, _ = self._model.transcribe(tmp.name, language="en")
            # Consume the generator – this is where compilation happens
            _ = list(segments)
        except Exception:  # noqa: BLE001
            logger.warning("transcriber.warmup_failed", exc_info=True)
        finally:
            try:
                os.unlink(tmp.name)
            except OSError:
                pass

        elapsed = int((time.perf_counter() - t0) * 1000)
        logger.info("transcriber.warmup_done elapsed_ms=%s", elapsed)

    def unload(self) -> None:
        """Release the model and VRAM."""
        self._model = None
        self._ready = False
        logger.info("transcriber.model_unloaded")

    @property
    def is_ready(self) -> bool:
        return self._ready

    # ── Transcription ──────────────────────────────────────────────────────

    def transcribe(
        self,
        audio_path: str | Path,
        language: str,
        *,
        whisper_started_at: float,
    ) -> tuple[list[SegmentResult], object, int]:
        """
        Transcribe an audio file. Returns (segments, info, word_count).

        Parameters
        ----------
        audio_path   : Path to the 16 kHz mono WAV file.
        language     : ISO language code or 'auto' for auto-detection.
        whisper_started_at: perf_counter timestamp used for progress logging.

        Returns
        -------
        segments    : List of SegmentResult objects (fully materialised).
        info        : faster-whisper TranscriptionInfo (language, duration…).
        word_count  : Total number of words across all segments.
        """
        if not self._ready or self._model is None:
            raise RuntimeError("Model is not loaded.")

        cfg = self._config
        lang: Optional[str] = language if language != "auto" else None

        raw_segments, info = self._model.transcribe(
            str(audio_path),
            language=lang,
            word_timestamps=True,
            beam_size=cfg.beam_size,
        )

        segments: list[SegmentResult] = []
        word_count = 0

        for seg in raw_segments:
            words: list[WordResult] = []
            if seg.words:
                words = [
                    WordResult(
                        word=w.word.strip(),
                        start=round(w.start, 3),
                        end=round(w.end, 3),
                    )
                    for w in seg.words
                ]
                word_count += len(words)

            segments.append(
                SegmentResult(
                    id=len(segments) + 1,
                    text=seg.text.strip(),
                    start=round(seg.start, 3),
                    end=round(seg.end, 3),
                    words=words,
                )
            )

            # Progress logging at first segment and every 25 after
            n = len(segments)
            if n == 1 or n % 25 == 0:
                elapsed_ms = int((time.perf_counter() - whisper_started_at) * 1000)
                logger.info(
                    "transcriber.progress segments=%s words=%s elapsed_ms=%s",
                    n, word_count, elapsed_ms,
                )

        return segments, info, word_count
