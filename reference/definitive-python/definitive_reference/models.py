from .authorities import sample_authorities


reference_model_descriptors = {
    "M109": {
        "modelId": "M109",
        "name": "Working capital peg",
        "version": "M109.reference.v0.1",
        "gates": ["G7", "G14", "G15"],
        "lineBoundary": "deterministic_compute_only",
        "authorityRefs": [sample_authorities["workingCapital"]],
        "inputSchemaName": "WorkingCapitalPegInput",
        "outputSchemaName": "WorkingCapitalPegOutput",
    },
    "M139": {
        "modelId": "M139",
        "name": "Section 1060 residual-method allocation",
        "version": "M139.reference.v0.1",
        "gates": ["G15"],
        "lineBoundary": "computed_for_professional_review",
        "authorityRefs": [sample_authorities["section1060"]],
        "inputSchemaName": "Section1060AllocationInput",
        "outputSchemaName": "Section1060AllocationOutput",
    },
    "M199": {
        "modelId": "M199",
        "name": "FIRPTA withholding v1.1",
        "version": "M199.reference.v0.1",
        "gates": ["G15", "G30"],
        "lineBoundary": "deterministic_compute_only",
        "authorityRefs": [sample_authorities["firpta"]],
        "inputSchemaName": "FirptaWithholdingInput",
        "outputSchemaName": "FirptaWithholdingOutput",
    },
    "M206": {
        "modelId": "M206",
        "name": "Indemnification ladder",
        "version": "M206.reference.v0.1",
        "gates": ["G1", "G8"],
        "lineBoundary": "computed_for_professional_review",
        "authorityRefs": [sample_authorities["indemnity"]],
        "inputSchemaName": "IndemnificationLadderInput",
        "outputSchemaName": "IndemnificationLadderOutput",
    },
}


def list_reference_models():
    return list(reference_model_descriptors.values())
