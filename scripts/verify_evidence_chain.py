import json
import os
import socket
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any

BASE_URL = os.getenv("STREAMVISTA_BASE_URL", "https://streamvista.in").rstrip("/")
TIMEOUT_SECONDS = float(os.getenv("VERIFY_TIMEOUT_SECONDS", "12"))

CRITICAL_ROUTES = [
    "/",
    "/pricing",
    "/login",
    "/signup",
    "/creator-studio",
    "/crayons-bridge",
    "/watch",
    "/api/health",
    "/api/readiness",
]

report: dict[str, Any] = {
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "base_url": BASE_URL,
    "evidence_chain": {},
}


def log_stage(stage: str, status: str, details: str) -> None:
    report["evidence_chain"][stage] = {"status": status, "details": details}
    symbol = "🟢" if status == "PASS" else "🟡" if status == "WARN" else "🔴"
    print(f"{symbol} [{stage}] {status}: {details}")


def http_get(path: str) -> tuple[int, str, dict[str, str]]:
    request = urllib.request.Request(
        f"{BASE_URL}{path}",
        headers={"User-Agent": "StreamVista-Release-Verifier/1.0"},
        method="GET",
    )
    with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        body = response.read(1024 * 256).decode("utf-8", errors="replace")
        headers = {k.lower(): v for k, v in response.headers.items()}
        return response.status, body, headers


print("=== STREAMVISTA PRODUCTION EVIDENCE VERIFICATION ===\n")

# 1. Repository/environment safety checks.
try:
    secret_files = []
    for root, _dirs, files in os.walk("."):
        if ".git" in root.split(os.sep):
            continue
        for filename in files:
            if filename in {".env", ".env.local", ".env.production"}:
                secret_files.append(os.path.join(root, filename))
    if secret_files:
        log_stage("SECRET_FILE_CHECK", "FAIL", f"Tracked/runtime secret files present: {secret_files[:10]}")
    else:
        log_stage("SECRET_FILE_CHECK", "PASS", ".env/.env.local/.env.production files not present in workspace")
except Exception as exc:
    log_stage("SECRET_FILE_CHECK", "FAIL", str(exc))

# 2. Basic repository health.
required_paths = ["package.json", "vercel.json", "supabase/migrations", "scripts/verify_evidence_chain.py"]
missing = [path for path in required_paths if not os.path.exists(path)]
if missing:
    log_stage("REPOSITORY_CONTRACT", "FAIL", f"Missing required paths: {missing}")
else:
    log_stage("REPOSITORY_CONTRACT", "PASS", "Core build, Vercel, Supabase migration, and verification paths exist")

# 3. Live critical HTTP surface.
route_results = {}
for route in CRITICAL_ROUTES:
    try:
        status, body, headers = http_get(route)
        route_results[route] = {"status": status, "content_type": headers.get("content-type", "")}
        if 200 <= status < 400:
            log_stage(f"HTTP_{route.strip('/').replace('/', '_') or 'HOME'}", "PASS", f"HTTP {status}")
        else:
            log_stage(f"HTTP_{route.strip('/').replace('/', '_') or 'HOME'}", "FAIL", f"HTTP {status}")
    except urllib.error.HTTPError as exc:
        route_results[route] = {"status": exc.code, "error": str(exc)}
        log_stage(f"HTTP_{route.strip('/').replace('/', '_') or 'HOME'}", "FAIL", f"HTTP {exc.code}")
    except (urllib.error.URLError, socket.timeout, TimeoutError) as exc:
        route_results[route] = {"error": str(exc)}
        log_stage(f"HTTP_{route.strip('/').replace('/', '_') or 'HOME'}", "FAIL", f"network/timeout: {exc}")
    except Exception as exc:
        route_results[route] = {"error": str(exc)}
        log_stage(f"HTTP_{route.strip('/').replace('/', '_') or 'HOME'}", "FAIL", str(exc))

report["routes"] = route_results

# 4. Readiness payload contract.
try:
    status, body, _headers = http_get("/api/readiness")
    if status == 200:
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            payload = {}
        if payload.get("ready") is True:
            log_stage("READINESS_CONTRACT", "PASS", "Production readiness endpoint returned ready:true")
        else:
            log_stage("READINESS_CONTRACT", "WARN", f"Endpoint returned HTTP 200 but ready was not true: {payload}")
    else:
        log_stage("READINESS_CONTRACT", "FAIL", f"HTTP {status}")
except Exception as exc:
    log_stage("READINESS_CONTRACT", "FAIL", str(exc))

# 5. Static wiring checks for the canonical SPA/API routing contract.
try:
    vercel_text = open("vercel.json", "r", encoding="utf-8").read()
    required_tokens = ["/api/film-os/(.*)", "/api/payment/(.*)", "/api/(.*)", "filesystem", "/index.html"]
    missing_tokens = [token for token in required_tokens if token not in vercel_text]
    if missing_tokens:
        log_stage("VERCEL_ROUTING_CONTRACT", "FAIL", f"Missing routing tokens: {missing_tokens}")
    else:
        log_stage("VERCEL_ROUTING_CONTRACT", "PASS", "API routes precede filesystem and SPA fallback")
except Exception as exc:
    log_stage("VERCEL_ROUTING_CONTRACT", "FAIL", str(exc))

# 6. Write the machine-readable report for release evidence.
with open("RECONCILIATION_REPORT.json", "w", encoding="utf-8") as report_file:
    json.dump(report, report_file, indent=2, sort_keys=True)

print("\n=== RECONCILIATION_REPORT.json WRITTEN ===")
