"""QC Sentinel A2A sub-agent boundary."""


def run(payload: dict) -> dict:
    """Accept a QC request for the production orchestration layer."""
    return {"agent": "qc_sentinel", "status": "accepted", "payload": payload}
