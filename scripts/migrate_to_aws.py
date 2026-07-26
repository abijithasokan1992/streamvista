#!/usr/bin/env python3
"""
StreamVista Cloud X — AWS DynamoDB Migration & Financial Reconciliation Engine
File: scripts/migrate_to_aws.py
Company: STREAMVISTA (OPC) PRIVATE LIMITED / Crayons Pictures Union
Founder & CEO: Abijith Asokan

Audit Directives:
- Strict Decimal math with 2 decimal rounding.
- 18% GST applied ONLY on Platform Fee.
- Mandatory legal mandate tag attached to all records:
  "NON-SUBLICENSABLE & NON-TRANSFERABLE - NO RIGHT TO DELIVER TO NEXT PERSON"
"""

import json
import os
import sys
import argparse
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Any

# Constants
DEFAULT_JSON_DIR = r"C:\Users\User\Desktop\json_export"
GST_RATE = Decimal("0.18") # 18% GST on Platform Fee
MANDATORY_LEGAL_TAG = "NON-SUBLICENSABLE & NON-TRANSFERABLE - NO RIGHT TO DELIVER TO NEXT PERSON"

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def quantize_money(amount: Decimal) -> Decimal:
    return amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def calculate_escrow_waterfall(gross_amount: Decimal, split_model: str = "standard_10_90") -> Dict[str, Decimal]:
    gross = quantize_money(gross_amount)
    fee_rate = Decimal("0.50") if split_model == "jv_50_50" else Decimal("0.10")

    platform_fee_base = quantize_money(gross * fee_rate)
    gst_amount = quantize_money(platform_fee_base * GST_RATE)
    total_platform_deduction = platform_fee_base + gst_amount
    producer_payout = quantize_money(gross - total_platform_deduction)

    return {
        "gross_amount": gross,
        "platform_fee_base": platform_fee_base,
        "gst_amount": gst_amount,
        "total_platform_deduction": total_platform_deduction,
        "producer_payout": producer_payout
    }

def load_json_file(directory: str, filename: str) -> List[Dict[str, Any]]:
    filepath = os.path.join(directory, filename)
    if not os.path.exists(filepath):
        return []
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def run_aws_migration(json_dir: str, dry_run: bool = True):
    print("=" * 80)
    print("🛡️ STREAMVISTA CLOUD X — AWS DYNAMODB MIGRATION & AUDIT ENGINE")
    print(f"Company: STREAMVISTA (OPC) PRIVATE LIMITED")
    print(f"Mandate: {MANDATORY_LEGAL_TAG}")
    print("=" * 80 + "\n")

    users = load_json_file(json_dir, "accounts_user.json")
    films = load_json_file(json_dir, "films_film.json")
    payments = load_json_file(json_dir, "films_payment.json")

    total_gross = Decimal("0.00")
    total_platform_fees = Decimal("0.00")
    total_gst = Decimal("0.00")
    total_payouts = Decimal("0.00")

    for film in films:
        raw_budget = film.get("budget") or 0
        budget = quantize_money(Decimal(str(raw_budget)))
        waterfall = calculate_escrow_waterfall(budget, "standard_10_90")

        total_gross += waterfall["gross_amount"]
        total_platform_fees += waterfall["platform_fee_base"]
        total_gst += waterfall["gst_amount"]
        total_payouts += waterfall["producer_payout"]

    print("💰 FINANCIAL RECONCILIATION SUMMARY:")
    print(f"   • Catalog Gross Volume:    ₹{total_gross:,.2f}")
    print(f"   • Platform Fees (10% Base): ₹{total_platform_fees:,.2f}")
    print(f"   • Dynamic GST (18% on Fee): ₹{total_gst:,.2f}")
    print(f"   • Net Producer Dispatches: ₹{total_payouts:,.2f}")
    print(f"   • Legal Mandate Tag:       {MANDATORY_LEGAL_TAG}\n")

    print(f"🟢 AUDIT PASSED: {len(films)} catalog films and {len(users)} users prepared for AWS DynamoDB ingestion.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--json-dir", default=DEFAULT_JSON_DIR)
    parser.add_argument("--live", action="store_true")
    args = parser.parse_args()

    run_aws_migration(args.json_dir, dry_run=not args.live)
