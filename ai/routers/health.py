"""
AutoCaption AI – Health & Readiness Routers
  GET /health  – liveness probe (always 200 while the process is running)
  GET /ready   – readiness probe (503 until the Whisper model is loaded)
"""
from __future__ import annotations

import importlib.metadata as _meta
import sys

from fastapi import APIRouter, HTTPException, Request

router = APIRouter(tags=["health"])


def _pkg_version(pkg: str) -> str:
    try:
        return _meta.version(pkg)
    except _meta.PackageNotFoundError:
        return "not-installed"


@router.get("/health", summary="Liveness probe")
def health() -> dict:
    """Always returns 200 while the process is alive."""
    return {
        "status": "ok",
        "python": sys.version.split()[0],
        "faster_whisper": _pkg_version("faster-whisper"),
        "ctranslate2": _pkg_version("ctranslate2"),
        "fastapi": _pkg_version("fastapi"),
    }


@router.get("/ready", summary="Readiness probe")
def ready(request: Request) -> dict:
    """
    Returns 200 once the Whisper model has finished loading.
    Returns 503 while the model is still loading or if startup failed.
    """
    transcriber = getattr(request.app.state, "transcriber", None)
    if transcriber is None or not transcriber.is_ready:
        raise HTTPException(
            status_code=503,
            detail="Service is not ready – Whisper model is still loading.",
        )
    return {
        "ready": True,
        "model": request.app.state.config.whisper_model,
        "device": request.app.state.config.device,
        "compute_type": request.app.state.config.compute_type,
    }
