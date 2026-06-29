"""
AutoCaption AI – Startup Diagnostics Banner
Prints a structured summary of the runtime environment on every startup.
"""
from __future__ import annotations

import importlib.metadata as _meta
import logging
import platform
import shutil
import subprocess
import sys
from typing import Optional

logger = logging.getLogger("autocaption.diagnostics")

_SEP = "=" * 65
_COL = 32  # label column width


def _pkg_version(pkg: str) -> str:
    try:
        return _meta.version(pkg)
    except _meta.PackageNotFoundError:
        return "NOT INSTALLED"


def _ffmpeg_version(executable: str) -> str:
    try:
        result = subprocess.run(
            [executable, "-version"],
            capture_output=True, text=True, timeout=5,
        )
        first_line = result.stdout.splitlines()[0] if result.stdout else ""
        # "ffmpeg version 6.1.2-..." → "6.1.2-..."
        parts = first_line.split()
        return parts[2] if len(parts) >= 3 else first_line
    except (FileNotFoundError, subprocess.TimeoutExpired, IndexError):
        return "NOT FOUND"


def _row(label: str, value: str, *, ok: Optional[bool] = None) -> str:
    icon = " ✓" if ok is True else (" ✗" if ok is False else "  ")
    return f"  {icon}  {label:<{_COL}} {value}"


def print_startup_diagnostics(config: object, audit: object) -> None:  # type: ignore[type-arg]
    """
    Print the full startup diagnostics banner to stdout.
    Accepts AppConfig and CudaAuditReport objects by duck-typing to avoid
    circular imports.
    """
    gpu = audit.gpu_info  # type: ignore[attr-defined]
    cfg = config           # AppConfig instance

    lines: list[str] = [
        "",
        _SEP,
        "  AutoCaption AI Service – Startup Diagnostics",
        _SEP,
        "",
        "  ── Python & Framework ──────────────────────────────────",
        _row("Python", sys.version.split()[0]),
        _row("Platform", platform.platform()),
        _row("FastAPI", _pkg_version("fastapi")),
        _row("Uvicorn", _pkg_version("uvicorn")),
        _row("Pydantic", _pkg_version("pydantic")),
        "",
        "  ── Transcription Stack ─────────────────────────────────",
        _row("faster-whisper", _pkg_version("faster-whisper")),
        _row("ctranslate2", _pkg_version("ctranslate2")),
        "",
        "  ── CUDA / GPU ──────────────────────────────────────────",
        _row("GPU detected", "YES" if gpu.available else "NO", ok=gpu.available),
        _row("GPU name", gpu.name),
        _row("Compute capability", gpu.compute_capability),
        _row("Driver version", gpu.driver_version),
        _row("VRAM total", f"{gpu.vram_total_mb} MB"),
        _row("VRAM used at startup", f"{gpu.vram_used_mb} MB"),
        _row("VRAM free", f"{gpu.vram_free_mb} MB"),
        "",
        "  ── CUDA DLL Check ──────────────────────────────────────",
    ]

    for r in audit.dll_results:  # type: ignore[attr-defined]
        status = r.found_at or "MISSING"
        lines.append(_row(r.dll_name, status, ok=r.found))

    lines += [
        "",
        "  ── Model Configuration ─────────────────────────────────",
        _row("Model name", cfg.whisper_model),   # type: ignore[attr-defined]
        _row("Device", cfg.device),              # type: ignore[attr-defined]
        _row("Compute type", cfg.compute_type),  # type: ignore[attr-defined]
        _row("Beam size", str(cfg.beam_size)),   # type: ignore[attr-defined]
        _row("Default language", cfg.default_language),  # type: ignore[attr-defined]
        "",
        "  ── External Tools ──────────────────────────────────────",
        _row("FFmpeg", _ffmpeg_version(cfg.ffmpeg_executable)),  # type: ignore[attr-defined]
        "",
        "  ── CUDA PyPI Packages ──────────────────────────────────",
        _row("nvidia-cublas-cu12", _pkg_version("nvidia-cublas-cu12")),
        _row("nvidia-cuda-runtime-cu12", _pkg_version("nvidia-cuda-runtime-cu12")),
        _row("nvidia-cublas-cu11 (should be absent)", _pkg_version("nvidia-cublas-cu11")),
    ]

    if audit.warnings:  # type: ignore[attr-defined]
        lines += ["", "  ── Warnings ────────────────────────────────────────────"]
        for w in audit.warnings:  # type: ignore[attr-defined]
            lines.append(f"  ⚠  {w}")

    if audit.recommendations:  # type: ignore[attr-defined]
        lines += ["", "  ── Recommendations ─────────────────────────────────────"]
        for r in audit.recommendations:  # type: ignore[attr-defined]
            lines.append(f"  →  {r}")

    if audit.critical_errors:  # type: ignore[attr-defined]
        lines += ["", "  ── CRITICAL ERRORS ─────────────────────────────────────"]
        for e in audit.critical_errors:  # type: ignore[attr-defined]
            lines.append(f"  ✗  {e}")

    lines += ["", _SEP, ""]

    banner = "\n".join(lines)
    print(banner, flush=True)
    logger.info("autocaption.startup_diagnostics_complete")
