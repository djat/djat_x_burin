from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from burin.kernel import verify_seal

router = APIRouter(prefix="/api/burin", tags=["burin"])


class VerifySealRequest(BaseModel):
    seal: dict
    trusted_pubkeys_hex: list[str] | None = None


@router.post("/verify")
def verify_burin_seal(req: VerifySealRequest):
    pubkeys = []
    if req.trusted_pubkeys_hex:
        pubkeys = [bytes.fromhex(k.replace("0x", "")) for k in req.trusted_pubkeys_hex]
    report = verify_seal(req.seal, trusted_pubkeys=pubkeys or None)
    return {
        "ok": report.ok,
        "message": str(report),
        "disclaimer": "Burin proves consistency, not ground truth.",
    }


@router.get("/health")
def burin_health():
    return {"status": "ok", "substrate": "burin", "kernel_license": "PolyForm-Noncommercial-1.0.0"}
