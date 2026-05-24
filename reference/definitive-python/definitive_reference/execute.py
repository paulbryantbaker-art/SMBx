from typing import Any, Dict, List

from .calculations import (
    compute_firpta_withholding,
    compute_indemnification_ladder,
    compute_section_1060_allocation,
    compute_working_capital_peg,
)
from .hashing import sha256_hex
from .models import reference_model_descriptors
from .types import (
    DEFINITIVE_REFERENCE_METHODOLOGY_URI,
    DEFINITIVE_REFERENCE_METHODOLOGY_VERSION,
    DEFINITIVE_REFERENCE_PACKAGE_VERSION,
    DEFINITIVE_REFERENCE_SPEC_VERSION,
)


def _envelope(model_id: str, input_value: Dict[str, Any], outputs: Dict[str, Any], warnings: List[str] = None):
    descriptor = reference_model_descriptors.get(model_id)
    if not descriptor:
        raise ValueError(f"Unsupported reference model: {model_id}")

    return {
        "specVersion": DEFINITIVE_REFERENCE_SPEC_VERSION,
        "methodologyUri": DEFINITIVE_REFERENCE_METHODOLOGY_URI,
        "methodologyVersion": DEFINITIVE_REFERENCE_METHODOLOGY_VERSION,
        "referencePackageVersion": DEFINITIVE_REFERENCE_PACKAGE_VERSION,
        "modelId": descriptor["modelId"],
        "modelVersion": descriptor["version"],
        "lineBoundary": descriptor["lineBoundary"],
        "deterministic": True,
        "currencyUnit": "cents",
        "inputHash": sha256_hex(input_value),
        "outputHash": sha256_hex(outputs),
        "authorityRefs": descriptor["authorityRefs"],
        "outputs": outputs,
        "warnings": warnings or [],
    }


def execute_reference_model(run: Dict[str, Any]):
    model_id = run.get("modelId")
    input_value = run.get("input") or {}

    if model_id == "M109":
        return _envelope(model_id, input_value, compute_working_capital_peg(input_value))
    if model_id == "M139":
        return _envelope(
            model_id,
            input_value,
            compute_section_1060_allocation(input_value),
            [
                "Section 1060 allocation is computed from user-supplied values; tax counsel or tax preparer owns return position."
            ],
        )
    if model_id == "M199":
        return _envelope(model_id, input_value, compute_firpta_withholding(input_value))
    if model_id == "M206":
        return _envelope(
            model_id,
            input_value,
            compute_indemnification_ladder(input_value),
            ["Economic indemnity math only; counsel owns clause language and enforceability analysis."],
        )

    raise ValueError(f"Unsupported reference model: {model_id}")
