"""
StreamVista Cloud X — FastAPI Main Entry Point
File: backend/main.py
Company: STREAMVISTA (OPC) PRIVATE LIMITED / Crayons Pictures Union
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.v1.escrow import router as escrow_router
from backend.app.api.v1.permissions import router as permissions_router

app = FastAPI(
    title="StreamVista Cloud X API Engine",
    description="Production-grade API for B2B Film Licensing, Escrow Splits, and Buyer Permissions Matrix",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(escrow_router)
app.include_router(permissions_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "StreamVista Cloud X FastAPI Engine",
        "company": "STREAMVISTA (OPC) PRIVATE LIMITED",
        "mandate": "NON-SUBLICENSABLE & NON-TRANSFERABLE"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
