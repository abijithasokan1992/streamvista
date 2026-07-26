"""
StreamVista Cloud X — B2B Buyer Permission Matrix API Handler
File: backend/app/api/v1/permissions.py
Company: STREAMVISTA (OPC) PRIVATE LIMITED / Crayons Pictures Union
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/v1/permissions", tags=["Buyer Permission Matrix"])

class BuyerPermissionSchema(BaseModel):
    buyer_id: int
    buyer_name: str
    buyer_email: str
    film_id: int
    allow_screener_stream: bool = True
    allow_film_info_download: bool = False
    allow_trailer_download: bool = False
    licensed_territories: List[str] = Field(default_factory=lambda: ["India", "GCC", "Worldwide"])
    validity_period: str = Field(default="3_Years", description="e.g. 1_Year, 3_Years, Perpetual")
    non_sublicensable_flag: bool = True
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# Mock In-Memory DB for permissions state
MOCK_PERMISSIONS_DB: dict[int, BuyerPermissionSchema] = {
    53: BuyerPermissionSchema(
        buyer_id=53,
        buyer_name="Amazon Prime Video Licensing",
        buyer_email="buyer.licensing@amazon.com",
        film_id=7,
        allow_screener_stream=True,
        allow_film_info_download=True,
        allow_trailer_download=True,
        licensed_territories=["India", "North America SVOD"],
        validity_period="3_Years",
        non_sublicensable_flag=True
    )
}

@router.get("/buyer/{buyer_id}", response_model=BuyerPermissionSchema)
async def get_buyer_permissions(buyer_id: int):
    if buyer_id in MOCK_PERMISSIONS_DB:
        return MOCK_PERMISSIONS_DB[buyer_id]
    
    # Return default schema if not found
    return BuyerPermissionSchema(
        buyer_id=buyer_id,
        buyer_name=f"B2B Partner #{buyer_id}",
        buyer_email=f"partner{buyer_id}@buyer.com",
        film_id=7,
        allow_screener_stream=True,
        allow_film_info_download=False,
        allow_trailer_download=False,
        licensed_territories=["India"],
        validity_period="1_Year",
        non_sublicensable_flag=True
    )

@router.post("/buyer/update", response_model=BuyerPermissionSchema)
async def update_buyer_permissions(payload: BuyerPermissionSchema):
    if not payload.non_sublicensable_flag:
        raise HTTPException(
            status_code=400,
            detail="Cannot disable non-sublicensable mandate. All licenses are strictly non-sublicensable."
        )
    
    payload.updated_at = datetime.utcnow().isoformat()
    MOCK_PERMISSIONS_DB[payload.buyer_id] = payload
    return payload
