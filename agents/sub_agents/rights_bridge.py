"""Rights Bridge A2A sub-agent boundary."""


def run(payload: dict) -> dict:
    """Accept a rights operation for the production orchestration layer."""
    return {"agent": "rights_bridge", "status": "accepted", "payload": payload}
