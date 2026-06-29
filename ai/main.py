"""
AutoCaption AI Service – Application Entry Point
-------------------------------------------------
Clean architecture with:
  - asynccontextmanager lifespan (no deprecated @app.on_event)
  - Windows CUDA DLL pre-loading (MUST run before ctranslate2 import)
  - CUDA audit + fail-fast before model load
  - Singleton WhisperTranscriber injected via app.state
  - Structured logging
  - CORS middleware
  - Modular routers
"""
from __future__ import annotations

# ── CRITICAL: Pre-load CUDA DLL directories on Windows ───────────────────────
# This MUST run before any ctranslate2 / faster-whisper import.
# ctranslate2.__init__ only adds its own package dir; nvidia-cublas-cu12 and
# nvidia-cuda-runtime-cu12 drop DLLs under site-packages/nvidia/*/bin/ which
# Windows' DLL loader won't find unless we explicitly register those dirs.
import os
import sys

if sys.platform == "win32":
    _add_dll_dir = getattr(os, "add_dll_directory", None)
    if _add_dll_dir is not None:
        import site
        for _sp in site.getsitepackages():
            # nvidia-cublas-cu12, nvidia-cuda-runtime-cu12, etc. all use this layout
            for _nvidia_pkg in (
                "nvidia/cublas/bin",
                "nvidia/cuda_runtime/bin",
                "nvidia/cudnn/bin",
            ):
                _dll_dir = os.path.join(_sp, _nvidia_pkg.replace("/", os.sep))
                if os.path.isdir(_dll_dir):
                    _add_dll_dir(_dll_dir)
                    # Also add to PATH so child processes (ffmpeg, etc.) can find them
                    os.environ["PATH"] = _dll_dir + os.pathsep + os.environ.get("PATH", "")
        del _add_dll_dir
    del _sp, _nvidia_pkg, _dll_dir  # type: ignore[name-defined]
# ─────────────────────────────────────────────────────────────────────────────

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import AppConfig
from diagnostics import print_startup_diagnostics
from gpu import assert_cuda_ready, run_cuda_audit
from routers.health import router as health_router
from routers.transcribe import router as transcribe_router
from services.transcriber import WhisperTranscriber

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s – %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger("autocaption")


# ── Application Factory ───────────────────────────────────────────────────────

def create_app(config: AppConfig | None = None) -> FastAPI:
    """
    Build and return the FastAPI application.
    Accepts an optional AppConfig for testing; defaults to reading from env.
    """
    if config is None:
        config = AppConfig()

    logging.getLogger().setLevel(config.log_level.upper())

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        # ── STARTUP ────────────────────────────────────────────────
        logger.info("autocaption.startup_begin")

        # 1. Stash config on app.state (accessible in routers via request.app.state)
        app.state.config = config

        # 2. CUDA / DLL audit – MUST run before model load
        logger.info("autocaption.cuda_audit_start")
        audit = run_cuda_audit()
        print_startup_diagnostics(config, audit)

        # 3. Fail fast if any critical dependency is missing
        assert_cuda_ready(audit)

        # 4. Load Whisper model
        transcriber = WhisperTranscriber(config)
        app.state.transcriber = transcriber
        transcriber.load()

        # 5. Warm up GPU kernels with a silent clip
        transcriber.warmup()

        logger.info("autocaption.startup_complete – service is ready")
        yield

        # ── SHUTDOWN ───────────────────────────────────────────────
        logger.info("autocaption.shutdown_begin")
        transcriber.unload()
        logger.info("autocaption.shutdown_complete")

    app = FastAPI(
        title="AutoCaption AI Service",
        version="2.0.0",
        description=(
            "GPU-accelerated audio/video transcription using "
            "Faster-Whisper + CTranslate2 on CUDA."
        ),
        lifespan=lifespan,
    )

    # ── Middleware ─────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

    # ── Routers ────────────────────────────────────────────────────────────
    app.include_router(health_router)
    app.include_router(transcribe_router)

    return app


# ── Runnable entry point ──────────────────────────────────────────────────────
app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8001,
        log_level="info",
        reload=False,
    )
