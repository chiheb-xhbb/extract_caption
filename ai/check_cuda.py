"""
AutoCaption AI – CUDA Environment Quick-Check Script
Run this standalone (without the server) to verify your CUDA setup:

    venv\Scripts\python.exe check_cuda.py

Prints a full diagnostic and exits 0 (OK) or 1 (problems found).
"""
from __future__ import annotations

import sys

# Ensure the ai/ dir is on the path when run directly
import os
sys.path.insert(0, os.path.dirname(__file__))

from gpu import assert_cuda_ready, run_cuda_audit
from diagnostics import print_startup_diagnostics


class _FakeConfig:
    """Minimal stub so print_startup_diagnostics can format the banner."""
    whisper_model = "small"
    device = "cuda"
    compute_type = "float16"
    beam_size = 5
    default_language = "fr"
    ffmpeg_executable = "ffmpeg"


def main() -> int:
    print("\nRunning CUDA environment audit…\n")
    audit = run_cuda_audit()
    print_startup_diagnostics(_FakeConfig(), audit)

    if audit.critical_errors:
        print("\n[FAIL] Critical errors detected. Fix them before starting the server.\n")
        return 1

    print("\n[OK] CUDA environment looks healthy. You can start the server.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
