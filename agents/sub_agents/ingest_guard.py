"""Ingest Guard A2A sub-agent boundary."""


def run(payload: dict) -> dict:
    """Validate an ingest request without mutating external state."""
    return {"agent": "ingest_guard", "status": "accepted", "payload": payload}
