"""
StreamVista Cloud X — Escrow Contract & Financial Split API Handler
File: backend/app/api/v1/escrow.py
Company: STREAMVISTA (OPC) PRIVATE LIMITED / Crayons Pictures Union
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from decimal import Decimal, ROUND_HALF_UP
from typing import Literal
from datetime import datetime

router = APIRouter(prefix="/api/v1/escrow", tags=["B2B Escrow & Financials"])

GST_RATE = Decimal("0.18") # 18% GST on Platform Fee

class EscrowCreateRequest(BaseModel):
    film_id: int = Field(..., description="ID of the film being licensed")
    film_title: str = Field(..., description="Title name")
    buyer_id: int = Field(..., description="ID of the licensing buyer")
    buyer_email: str = Field(..., description="Buyer email address")
    gross_amount: Decimal = Field(..., gt=0, description="Gross licensing fee in USD or INR")
    currency: str = Field(default="USD", description="Currency code (USD/INR)")
    split_model: Literal["standard_10_90", "jv_50_50"] = Field(
        default="standard_10_90",
        description="Revenue split model: 10% platform / 90% producer OR 50% JV"
    )
    territories: list[str] = Field(default=["North America SVOD"], description="Licensed territories")
    license_period_years: int = Field(default=3, description="Duration of license in years")
    non_sublicensable_mandate_accepted: bool = Field(
        ...,
        description="Must be true: Mandatory acceptance of Non-Sublicensable & Non-Transferable terms"
    )

class EscrowLedgerResponse(BaseModel):
    contract_id: str
    film_title: str
    buyer_email: str
    gross_amount: Decimal
    currency: str
    split_model: str
    platform_fee_base: Decimal
    gst_amount_18pct: Decimal
    total_platform_deduction: Decimal
    net_producer_payout: Decimal
    legal_mandate: str
    locked_at: str

@router.post("/create", response_model=EscrowLedgerResponse, status_code=status.HTTP_201_CREATED)
async def create_escrow_contract(payload: EscrowCreateRequest):
    if not payload.non_sublicensable_mandate_accepted:
        raise HTTPException(
            status_code=400,
            detail="Mandatory rule violation: Licensing contract must accept strict NON-SUBLICENSABLE & NON-TRANSFERABLE terms."
        )

    gross = payload.gross_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    
    if payload.split_model == "jv_50_50":
        fee_rate = Decimal("0.50")
    else:
        fee_rate = Decimal("0.10")

    platform_fee_base = (gross * fee_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    gst_amount = (platform_fee_base * GST_RATE).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    total_platform_deduction = platform_fee_base + gst_amount
    net_producer_payout = (gross - total_platform_deduction).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    contract_id = f"ESC-{payload.film_id}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    return EscrowLedgerResponse(
        contract_id=contract_id,
        film_title=payload.film_title,
        buyer_email=payload.buyer_email,
        gross_amount=gross,
        currency=payload.currency,
        split_model=payload.split_model,
        platform_fee_base=platform_fee_base,
        gst_amount_18pct=gst_amount,
        total_platform_deduction=total_platform_deduction,
        net_producer_payout=net_producer_payout,
        legal_mandate="NON-SUBLICENSABLE & NON-TRANSFERABLE (NO RIGHT TO DELIVER TO NEXT PERSON)",
        locked_at=datetime.utcnow().isoformat()
    )
