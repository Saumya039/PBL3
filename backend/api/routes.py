from datetime import datetime

from fastapi import APIRouter, HTTPException

from ..scanner.models import ScanRequest, ScanResult
from ..scanner.dynamic.engine import DynamicScanner
from ..scanner.static.engine import StaticScanner
from ..patcher.engine import PatchEngine

router = APIRouter(prefix="/api")

# In-memory store for scan results
scan_store: dict[str, ScanResult] = {}

dynamic_scanner = DynamicScanner()
static_scanner = StaticScanner()
patch_engine = PatchEngine()


@router.get("/health")
async def health():
    return {"status": "ok", "service": "VulnGuard", "version": "1.0.0"}


@router.post("/scan/dynamic")
async def run_dynamic_scan(request: ScanRequest):
    target = request.target.strip()
    if not target.startswith(("http://", "https://")):
        target = f"https://{target}"

    result = ScanResult(target=target, scan_type="dynamic")

    try:
        vulns = await dynamic_scanner.scan(target)
        result.vulnerabilities = vulns
        result.patches = patch_engine.generate_patches(vulns)
        result.completed_at = datetime.utcnow()
        result.compute_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")

    scan_store[result.id] = result
    return result


@router.post("/scan/static")
async def run_static_scan(request: ScanRequest):
    code = request.target
    filename = request.filename or "uploaded_code"

    result = ScanResult(target=filename, scan_type="static")

    try:
        vulns = await static_scanner.scan(code, filename)
        result.vulnerabilities = vulns
        result.patches = patch_engine.generate_patches(vulns)
        result.completed_at = datetime.utcnow()
        result.compute_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    scan_store[result.id] = result
    return result


@router.get("/scan/{scan_id}")
async def get_scan(scan_id: str):
    result = scan_store.get(scan_id)
    if not result:
        raise HTTPException(status_code=404, detail="Scan not found")
    return result
