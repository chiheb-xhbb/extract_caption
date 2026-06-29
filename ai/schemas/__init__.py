"""AutoCaption AI – Pydantic schemas for transcription requests / responses."""
from __future__ import annotations

from pydantic import BaseModel, Field


class WordResult(BaseModel):
    word: str
    start: float
    end: float


class SegmentResult(BaseModel):
    id: int
    text: str
    start: float
    end: float
    words: list[WordResult] = Field(default_factory=list)


class TimingMetrics(BaseModel):
    upload_ms: int
    ffmpeg_ms: int
    whisper_ms: int
    total_ms: int


class TranscriptionResponse(BaseModel):
    language: str
    duration: float
    segment_count: int
    word_count: int
    captions: list[SegmentResult]
    timing: TimingMetrics
