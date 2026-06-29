"""
AutoCaption AI – FastAPI Dependency Providers
Provides the singleton WhisperTranscriber via FastAPI's DI system.
The transcriber is stored on app.state and injected via Depends().
"""
from __future__ import annotations

from fastapi import Depends, Request

from services.transcriber import WhisperTranscriber


def get_transcriber(request: Request) -> WhisperTranscriber:
    """
    FastAPI dependency: resolve the WhisperTranscriber from app.state.
    Raises RuntimeError (→ 500) if called before startup is complete.
    """
    transcriber: WhisperTranscriber = request.app.state.transcriber
    if not transcriber.is_ready:
        raise RuntimeError("Transcriber is not ready yet. Service is still starting up.")
    return transcriber
