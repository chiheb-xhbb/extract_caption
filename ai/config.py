"""
AutoCaption AI – Application Configuration
All settings are readable from environment variables or a .env file.
"""
from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppConfig(BaseSettings):
    """
    Single source of truth for every tunable parameter.
    Override any value by setting the corresponding env var, e.g.
        WHISPER_MODEL=medium COMPUTE_TYPE=int8_float16 uvicorn main:app
    """

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Whisper / CTranslate2 ---
    whisper_model: str = Field(
        default="small",
        description="Model size: tiny | base | small | medium | large-v3",
    )
    compute_type: Literal[
        "float16", "int8_float16", "int8", "float32"
    ] = Field(
        default="float16",
        description="CTranslate2 compute type. float16 is optimal for RTX 2050.",
    )
    device: Literal["cuda", "cpu"] = Field(
        default="cuda",
        description="Inference device. Must be cuda for GPU acceleration.",
    )
    beam_size: int = Field(default=5, ge=1, le=10)
    cpu_threads: int = Field(
        default=4,
        description="CPU threads for CTranslate2 preprocessing.",
    )
    default_language: str = Field(default="fr")

    # --- File upload security ---
    max_upload_bytes: int = Field(
        default=500 * 1024 * 1024,   # 500 MB
        description="Hard limit on uploaded file size in bytes.",
    )
    allowed_mime_prefixes: tuple[str, ...] = Field(
        default=("video/", "audio/", "application/octet-stream"),
        description="Accepted MIME prefixes for uploaded files.",
    )

    # --- API ---
    cors_origins: list[str] = Field(
        default=["http://localhost:8000", "http://127.0.0.1:8000"],
    )
    request_timeout_seconds: int = Field(
        default=600,
        description="Max seconds a /transcribe request may run.",
    )

    # --- FFmpeg ---
    ffmpeg_executable: str = Field(
        default="ffmpeg",
        description="Path or name of ffmpeg binary.",
    )

    # --- Logging ---
    log_level: str = Field(default="INFO")

    @field_validator("whisper_model")
    @classmethod
    def _validate_model(cls, v: str) -> str:
        valid = {"tiny", "base", "small", "medium", "large", "large-v2", "large-v3"}
        if v not in valid:
            raise ValueError(f"whisper_model must be one of {valid}, got '{v}'")
        return v
