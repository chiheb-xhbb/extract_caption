"""
AutoCaption AI – POST /transcribe Router

Security:
  - MIME type prefix validation
  - File size limit (from config)
  - Temp files always cleaned in finally block

Timing:
  - upload_ms, ffmpeg_ms, whisper_ms, total_ms all reported
"""
from __future__ import annotations

import logging
import os
import subprocess
import time
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile

from config import AppConfig
from dependencies import get_transcriber
from schemas import TimingMetrics, TranscriptionResponse
from services.transcriber import WhisperTranscriber

logger = logging.getLogger("autocaption.transcribe")

router = APIRouter(tags=["transcription"])

# ── Allowed MIME types for uploaded files ─────────────────────────────────────
_ALLOWED_MIME_PREFIXES = (
    "video/",
    "audio/",
    "application/octet-stream",
    "application/mp4",
    "application/x-matroska",
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _elapsed_ms(started_at: float) -> int:
    return int(round((time.perf_counter() - started_at) * 1000))


def _get_config(request: Request) -> AppConfig:
    return request.app.state.config


def _validate_mime(content_type: Optional[str], filename: Optional[str]) -> None:
    """
    Reject files whose MIME type is clearly not audio or video.
    Falls back to extension check if content-type is missing/octet-stream.
    """
    ct = (content_type or "").lower()
    if any(ct.startswith(prefix) for prefix in _ALLOWED_MIME_PREFIXES):
        return

    # Extension-based fallback
    ext = Path(filename or "").suffix.lower()
    allowed_extensions = {
        ".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv",
        ".m4v", ".ts", ".mts", ".m2ts",
        ".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a", ".wma",
    }
    if ext in allowed_extensions:
        return

    raise HTTPException(
        status_code=422,
        detail=(
            f"Unsupported file type: content_type='{content_type}', extension='{ext}'. "
            f"Only audio and video files are accepted."
        ),
    )


def _run_ffmpeg(
    ffmpeg_exec: str,
    input_path: str,
    output_path: str,
) -> subprocess.CompletedProcess:
    return subprocess.run(
        [
            ffmpeg_exec,
            "-y",       # overwrite output without asking
            "-i", input_path,
            "-ar", "16000",   # 16 kHz
            "-ac", "1",       # mono
            "-f", "wav",
            output_path,
        ],
        capture_output=True,
        timeout=300,
    )


# ── Router ────────────────────────────────────────────────────────────────────

@router.post(
    "/transcribe",
    response_model=TranscriptionResponse,
    summary="Transcribe an uploaded audio/video file",
)
async def transcribe(
    request: Request,
    file: UploadFile = File(..., description="Audio or video file to transcribe"),
    language: str = "fr",
    transcriber: WhisperTranscriber = Depends(get_transcriber),
) -> TranscriptionResponse:
    config: AppConfig = _get_config(request)
    total_started_at = time.perf_counter()

    tmp_video = f"tmp_{uuid.uuid4().hex}.upload"
    tmp_audio = f"tmp_{uuid.uuid4().hex}.wav"

    try:
        # ── 1. Validate MIME ────────────────────────────────────────
        _validate_mime(file.content_type, file.filename)

        # ── 2. Read & save upload ───────────────────────────────────
        upload_started_at = time.perf_counter()
        content = await file.read()
        file_size = len(content)

        if file_size > config.max_upload_bytes:
            raise HTTPException(
                status_code=413,
                detail=(
                    f"File too large: {file_size:,} bytes "
                    f"(limit: {config.max_upload_bytes:,} bytes)."
                ),
            )

        with open(tmp_video, "wb") as fh:
            fh.write(content)

        upload_ms = _elapsed_ms(upload_started_at)
        logger.info(
            "transcribe.upload_saved filename=%s bytes=%s elapsed_ms=%s",
            file.filename, file_size, upload_ms,
        )

        # ── 3. FFmpeg: extract 16 kHz mono WAV ─────────────────────
        ffmpeg_started_at = time.perf_counter()
        proc = _run_ffmpeg(config.ffmpeg_executable, tmp_video, tmp_audio)
        ffmpeg_ms = _elapsed_ms(ffmpeg_started_at)

        logger.info(
            "transcribe.ffmpeg_done returncode=%s elapsed_ms=%s",
            proc.returncode, ffmpeg_ms,
        )

        if proc.returncode != 0:
            stderr_snippet = (proc.stderr or b"")[-500:].decode("utf-8", errors="replace")
            logger.error("transcribe.ffmpeg_error stderr=%s", stderr_snippet)
            raise HTTPException(
                status_code=500,
                detail=f"FFmpeg failed (exit {proc.returncode}): {stderr_snippet}",
            )

        # ── 4. Whisper transcription ────────────────────────────────
        whisper_started_at = time.perf_counter()
        logger.info(
            "transcribe.whisper_start language=%s filename=%s",
            language, file.filename,
        )

        segments, info, word_count = transcriber.transcribe(
            tmp_audio,
            language=language,
            whisper_started_at=whisper_started_at,
        )
        whisper_ms = _elapsed_ms(whisper_started_at)
        total_ms = _elapsed_ms(total_started_at)

        logger.info(
            "transcribe.done segments=%s words=%s duration=%.2f language=%s "
            "whisper_ms=%s total_ms=%s",
            len(segments), word_count, info.duration, info.language,
            whisper_ms, total_ms,
        )

        return TranscriptionResponse(
            language=info.language,
            duration=round(info.duration, 3),
            segment_count=len(segments),
            word_count=word_count,
            captions=segments,
            timing=TimingMetrics(
                upload_ms=upload_ms,
                ffmpeg_ms=ffmpeg_ms,
                whisper_ms=whisper_ms,
                total_ms=total_ms,
            ),
        )

    except HTTPException:
        logger.warning(
            "transcribe.http_exception elapsed_ms=%s", _elapsed_ms(total_started_at),
        )
        raise

    except subprocess.TimeoutExpired:
        elapsed = _elapsed_ms(total_started_at)
        logger.error("transcribe.ffmpeg_timeout elapsed_ms=%s", elapsed)
        raise HTTPException(status_code=504, detail="FFmpeg processing timed out.")

    except Exception as exc:
        elapsed = _elapsed_ms(total_started_at)
        logger.exception("transcribe.failed elapsed_ms=%s error=%s", elapsed, exc)
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {exc}",
        )

    finally:
        for path in (tmp_video, tmp_audio):
            if os.path.exists(path):
                try:
                    os.remove(path)
                except OSError as e:
                    logger.warning("transcribe.cleanup_failed path=%s error=%s", path, e)
