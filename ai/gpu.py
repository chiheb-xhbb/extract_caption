"""
AutoCaption AI – GPU / CUDA Validator
Checks required CUDA DLLs before the Whisper model is loaded, and collects
GPU hardware facts for the startup diagnostics banner.
"""
from __future__ import annotations

import ctypes
import os
import sys
import subprocess
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

logger = logging.getLogger("autocaption.gpu")

# ──────────────────────────────────────────────────────────────────────────────
# Required DLLs for ctranslate2 >= 4.x compiled against CUDA 12
# ──────────────────────────────────────────────────────────────────────────────
REQUIRED_CUDA12_DLLS: list[str] = [
    "cublas64_12.dll",
    "cublasLt64_12.dll",
    "cudart64_12.dll",
]

# cuDNN 9 is bundled inside the ctranslate2 wheel – we don't list it here.


@dataclass
class DllCheckResult:
    dll_name: str
    found: bool
    found_at: Optional[str] = None
    fix_hint: Optional[str] = None


@dataclass
class GpuInfo:
    available: bool = False
    name: str = "N/A"
    compute_capability: str = "N/A"
    vram_total_mb: int = 0
    vram_used_mb: int = 0
    vram_free_mb: int = 0
    driver_version: str = "N/A"
    cuda_runtime_version: str = "N/A"
    cudnn_version: str = "N/A"


@dataclass
class CudaAuditReport:
    dll_results: list[DllCheckResult] = field(default_factory=list)
    gpu_info: GpuInfo = field(default_factory=GpuInfo)
    all_dlls_found: bool = False
    missing_dll_names: list[str] = field(default_factory=list)
    critical_errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    recommendations: list[str] = field(default_factory=list)


# ──────────────────────────────────────────────────────────────────────────────
# DLL search helpers
# ──────────────────────────────────────────────────────────────────────────────

def _dll_search_dirs() -> list[Path]:
    """
    Return the ordered list of directories where Windows / Python will look for
    DLLs. Mirrors the actual DLL loading order used by ctranslate2.
    """
    dirs: list[Path] = []

    # 1. Site-packages of the current venv / interpreter
    for path_str in sys.path:
        p = Path(path_str)
        if p.is_dir():
            dirs.append(p)
            # nvidia-cublas-cu12 drops DLLs one level up under nvidia/cublas/bin
            dirs.extend(p.rglob("nvidia/*/bin"))  # type: ignore[return-value]

    # 2. System PATH
    for path_str in os.environ.get("PATH", "").split(os.pathsep):
        p = Path(path_str)
        if p.is_dir():
            dirs.append(p)

    # 3. CUDA_PATH / CUDA_HOME
    for env_var in ("CUDA_PATH", "CUDA_HOME", "CUDA_PATH_V12_4"):
        cuda_root = os.environ.get(env_var, "")
        if cuda_root:
            dirs.append(Path(cuda_root) / "bin")

    return dirs


def _find_dll(name: str) -> Optional[str]:
    """Try every known search dir, then try ctypes as a last resort."""
    for d in _dll_search_dirs():
        candidate = d / name
        if candidate.exists():
            return str(candidate)

    # ctypes will use the OS DLL loader – catches CUDA Toolkit on PATH
    try:
        ctypes.WinDLL(name)  # type: ignore[attr-defined]
        return f"<loaded via OS loader>"
    except (OSError, AttributeError):
        pass

    return None


FIX_HINTS: dict[str, str] = {
    "cublas64_12.dll": (
        "Run: pip install 'nvidia-cublas-cu12==12.4.5.8'  "
        "OR install CUDA Toolkit 12.x and add its bin\\ to PATH."
    ),
    "cublasLt64_12.dll": (
        "Included in nvidia-cublas-cu12. Same fix as cublas64_12.dll."
    ),
    "cudart64_12.dll": (
        "Run: pip install 'nvidia-cuda-runtime-cu12==12.4.127'  "
        "OR install CUDA Toolkit 12.x and add its bin\\ to PATH."
    ),
}


# ──────────────────────────────────────────────────────────────────────────────
# GPU info collection via nvidia-smi
# ──────────────────────────────────────────────────────────────────────────────

def _run_smi(*query_args: str) -> Optional[str]:
    """Run nvidia-smi with --query-gpu and return raw CSV output."""
    try:
        result = subprocess.run(
            ["nvidia-smi", f"--query-gpu={','.join(query_args)}", "--format=csv,noheader,nounits"],
            capture_output=True, text=True, timeout=10,
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    return None


def _run_smi_query(field: str) -> Optional[str]:
    output = _run_smi(field)
    if output:
        return output.strip()
    return None


def collect_gpu_info() -> GpuInfo:
    info = GpuInfo()

    smi_output = _run_smi("name", "driver_version", "memory.total", "memory.used", "memory.free", "compute_cap")
    if smi_output is None:
        info.available = False
        return info

    parts = [p.strip() for p in smi_output.split(",")]
    if len(parts) < 6:
        return info

    info.available = True
    info.name = parts[0]
    info.driver_version = parts[1]
    try:
        info.vram_total_mb = int(parts[2])
        info.vram_used_mb = int(parts[3])
        info.vram_free_mb = int(parts[4])
    except ValueError:
        pass
    info.compute_capability = parts[5]

    # CUDA runtime version via nvcc or ctranslate2
    try:
        import ctranslate2  # noqa: PLC0415
        info.cuda_runtime_version = getattr(ctranslate2, "__version__", "unknown")
    except ImportError:
        pass

    # cuDNN version via ctranslate2 internal
    try:
        import ctranslate2  # noqa: PLC0415
        info.cudnn_version = str(getattr(ctranslate2, "cudnn_version", "bundled-9.x"))
    except ImportError:
        pass

    return info


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────

def run_cuda_audit() -> CudaAuditReport:
    """
    Perform a full CUDA environment audit.
    Returns a report with DLL check results, GPU info, and actionable hints.
    Raises no exceptions – callers decide how to handle failures.
    """
    report = CudaAuditReport()
    report.gpu_info = collect_gpu_info()

    if not report.gpu_info.available:
        report.critical_errors.append(
            "nvidia-smi not found or failed. GPU/CUDA unavailable on this machine."
        )
        return report

    # Check each required DLL
    for dll_name in REQUIRED_CUDA12_DLLS:
        found_at = _find_dll(dll_name)
        result = DllCheckResult(
            dll_name=dll_name,
            found=found_at is not None,
            found_at=found_at,
            fix_hint=FIX_HINTS.get(dll_name) if found_at is None else None,
        )
        report.dll_results.append(result)

        if not result.found:
            report.missing_dll_names.append(dll_name)

    report.all_dlls_found = len(report.missing_dll_names) == 0

    if not report.all_dlls_found:
        missing = ", ".join(report.missing_dll_names)
        report.critical_errors.append(
            f"Missing CUDA 12 DLL(s): {missing}\n"
            f"ctranslate2 >= 4.x requires these files at runtime.\n"
            f"Fix: pip install nvidia-cublas-cu12==12.4.5.8 nvidia-cuda-runtime-cu12==12.4.127"
        )

    # Check for mismatched cu11 packages still installed
    try:
        import importlib.metadata as _meta  # noqa: PLC0415
        cu11_packages = []
        for pkg in ("nvidia-cublas-cu11", "nvidia-cuda-runtime-cu11", "nvidia-cudnn-cu11"):
            try:
                _meta.version(pkg)
                cu11_packages.append(pkg)
            except _meta.PackageNotFoundError:
                pass
        if cu11_packages:
            report.warnings.append(
                f"CUDA 11 PyPI packages still installed: {cu11_packages}. "
                f"They cannot satisfy ctranslate2's CUDA 12 requirements. "
                f"Remove them with: pip uninstall -y {' '.join(cu11_packages)}"
            )
    except Exception:  # noqa: BLE001
        pass

    # VRAM recommendation for RTX 2050
    if report.gpu_info.vram_total_mb > 0 and report.gpu_info.vram_total_mb < 4500:
        report.recommendations.append(
            f"GPU has {report.gpu_info.vram_total_mb} MB VRAM. "
            f"Use model=small with compute_type=float16 for optimal performance."
        )

    return report


def assert_cuda_ready(report: CudaAuditReport) -> None:
    """
    Raise a RuntimeError with a full diagnostic message if CUDA is not ready.
    Call this before loading the Whisper model.
    """
    if report.critical_errors:
        details = "\n".join(report.critical_errors)
        hints = "\n".join(
            r.fix_hint for r in report.dll_results if r.fix_hint
        )
        raise RuntimeError(
            f"\n{'='*60}\n"
            f"CUDA STARTUP CHECK FAILED\n"
            f"{'='*60}\n"
            f"{details}\n"
            f"\nFix instructions:\n{hints}\n"
            f"{'='*60}\n"
        )
