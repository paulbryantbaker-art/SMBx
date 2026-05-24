import math
from typing import Any, Dict


def _money(value: Any) -> int:
    if isinstance(value, (int, float)) and math.isfinite(value):
        return _round_js(value)
    return 0


def _round_js(value: float) -> int:
    return math.floor(value + 0.5)


def _bps_amount(base_cents: int, bps: int) -> int:
    return _round_js((base_cents * bps) / 10000)


def compute_working_capital_peg(input_value: Dict[str, Any]) -> Dict[str, Any]:
    months = input_value.get("months") or []
    if not months:
        raise ValueError("WorkingCapitalPegInput.months must include at least one month")

    monthly_normalized_nwc = []
    for month in months:
        current_assets_cents = (
            _money(month.get("accountsReceivableCents"))
            + _money(month.get("inventoryCents"))
            + _money(month.get("prepaidExpensesCents"))
        )
        current_liabilities_cents = (
            _money(month.get("accountsPayableCents"))
            + _money(month.get("accruedExpensesCents"))
            + _money(month.get("deferredRevenueCents"))
        )
        monthly_normalized_nwc.append(
            {
                "month": month.get("month"),
                "currentAssetsCents": current_assets_cents,
                "currentLiabilitiesCents": current_liabilities_cents,
                "normalizedNwcCents": current_assets_cents - current_liabilities_cents,
            }
        )

    total = sum(month["normalizedNwcCents"] for month in monthly_normalized_nwc)
    return {
        "monthlyNormalizedNwc": monthly_normalized_nwc,
        "trailingMonthCount": len(monthly_normalized_nwc),
        "pegCents": _round_js(total / len(monthly_normalized_nwc)),
    }


def compute_section_1060_allocation(input_value: Dict[str, Any]) -> Dict[str, Any]:
    total_consideration_cents = _money(input_value.get("purchasePriceCents")) + _money(
        input_value.get("assumedLiabilitiesCents")
    )
    fair_market_values = input_value.get("fairMarketValuesCents") or {}
    allocation = {
        "classI": 0,
        "classII": 0,
        "classIII": 0,
        "classIV": 0,
        "classV": 0,
        "classVI": 0,
        "classVII": 0,
    }
    remaining = total_consideration_cents

    for class_id in ["classI", "classII", "classIII", "classIV", "classV", "classVI"]:
        fair_market_value = max(0, _money(fair_market_values.get(class_id)))
        allocated = min(fair_market_value, remaining)
        allocation[class_id] = allocated
        remaining -= allocated

    allocation["classVII"] = max(0, remaining)
    return {
        "totalConsiderationCents": total_consideration_cents,
        "allocation": allocation,
        "residualClassVIICents": allocation["classVII"],
    }


def compute_firpta_withholding(input_value: Dict[str, Any]) -> Dict[str, Any]:
    if not input_value.get("sellerIsForeignPerson"):
        return {
            "withholdingRateBps": 0,
            "withholdingCents": 0,
            "exemptionReason": "seller_not_foreign_person",
            "buyerFilingDueDaysAfterTransfer": None,
            "forms": [],
        }

    amount_realized_cents = _money(input_value.get("amountRealizedCents"))
    residence = input_value.get("buyerWillUseAsResidence") is True
    withholding_rate_bps = 1500
    exemption_reason = None

    if residence and amount_realized_cents <= 30000000:
        withholding_rate_bps = 0
        exemption_reason = "personal_residence_300k_or_less"
    elif residence and amount_realized_cents <= 100000000:
        withholding_rate_bps = 1000

    return {
        "withholdingRateBps": withholding_rate_bps,
        "withholdingCents": _bps_amount(amount_realized_cents, withholding_rate_bps),
        "exemptionReason": exemption_reason,
        "buyerFilingDueDaysAfterTransfer": 20,
        "forms": ["8288", "8288-A"],
    }


def compute_indemnification_ladder(input_value: Dict[str, Any]) -> Dict[str, Any]:
    transaction_value_cents = _money(input_value.get("transactionValueCents"))
    cap_cents = _bps_amount(transaction_value_cents, int(input_value.get("capBps") or 0))
    basket_cents = _bps_amount(transaction_value_cents, int(input_value.get("basketBps") or 0))
    losses_cents = max(0, _money(input_value.get("lossesCents")))

    if input_value.get("basketStyle") == "tipping":
        recoverable_before_cap_cents = losses_cents if losses_cents > basket_cents else 0
    else:
        recoverable_before_cap_cents = max(0, losses_cents - basket_cents)

    recoverable_after_cap_cents = min(recoverable_before_cap_cents, cap_cents)
    return {
        "capCents": cap_cents,
        "basketCents": basket_cents,
        "lossesCents": losses_cents,
        "recoverableBeforeCapCents": recoverable_before_cap_cents,
        "recoverableAfterCapCents": recoverable_after_cap_cents,
        "buyerRetainedLossCents": losses_cents - recoverable_after_cap_cents,
    }
