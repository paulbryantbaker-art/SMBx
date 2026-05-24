#!/usr/bin/env python3

import json
import pathlib
import sys
from typing import Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "reference" / "definitive-python"))

from definitive_reference import (  # noqa: E402
    DEFINITIVE_REFERENCE_METHODOLOGY_URI,
    DEFINITIVE_REFERENCE_SPEC_VERSION,
    execute_reference_model,
    list_reference_models,
)


def get_path(value: Any, dotted_path: str) -> Any:
    current = value
    for segment in dotted_path.split("."):
        if isinstance(current, list):
            current = current[int(segment)]
        else:
            current = current.get(segment)
    return current


def assert_condition(condition: bool, label: str) -> None:
    if not condition:
        raise AssertionError(label)


def assert_equal(actual: Any, expected: Any, label: str) -> None:
    if actual != expected:
        raise AssertionError(f"{label}: expected {expected!r}, got {actual!r}")


def assert_includes(actual: Any, expected: Any, label: str) -> None:
    if isinstance(actual, list):
        if expected not in actual:
            raise AssertionError(f"{label}: expected list to include {expected!r}, got {actual!r}")
        return

    if isinstance(actual, str) and isinstance(expected, str):
        if expected not in actual:
            raise AssertionError(f"{label}: expected string to include {expected!r}, got {actual!r}")
        return

    raise AssertionError(f"{label}: cannot apply includes to {actual!r}")


CASE_FILE = ROOT / "testing" / "definitive" / "reference" / "v1" / "reference-implementation.cases.json"
cases = json.loads(CASE_FILE.read_text())
passed = 0
failed = 0

print("\nDEFINITIVE Python reference smoke")
print(f"Loaded {len(cases)} cases from {CASE_FILE.relative_to(ROOT)}")

assert_condition(len(list_reference_models()) >= 4, "reference model descriptors should expose at least four models")

for item in cases:
    try:
        run = execute_reference_model({"modelId": item["modelId"], "input": item["input"]})
        assert_equal(run["specVersion"], DEFINITIVE_REFERENCE_SPEC_VERSION, f"{item['id']} package spec version")
        assert_equal(run["methodologyUri"], DEFINITIVE_REFERENCE_METHODOLOGY_URI, f"{item['id']} package methodology uri")
        assert_equal(run["specVersion"], item["expect"]["specVersion"], f"{item['id']} expected spec version")
        assert_equal(run["methodologyUri"], item["expect"]["methodologyUri"], f"{item['id']} expected methodology uri")
        assert_equal(run["lineBoundary"], item["expect"]["lineBoundary"], f"{item['id']} line boundary")
        assert_equal(run["deterministic"], True, f"{item['id']} deterministic flag")
        assert_equal(run["currencyUnit"], "cents", f"{item['id']} currency unit")
        assert_condition(len(run["inputHash"]) == 64, f"{item['id']} input hash should be sha256")
        assert_condition(len(run["outputHash"]) == 64, f"{item['id']} output hash should be sha256")
        assert_condition(len(run["authorityRefs"]) >= 1, f"{item['id']} should include sample authority refs")
        assert_condition(
            all(ref["id"].startswith("AUTH.SAMPLE.") for ref in run["authorityRefs"]),
            f"{item['id']} should not expose production authority data",
        )

        for expectation in item["expect"]["fields"]:
            actual = get_path(run, expectation["path"])
            if "equals" in expectation:
                assert_equal(actual, expectation["equals"], f"{item['id']} {expectation['path']}")
            if "includes" in expectation:
                assert_includes(actual, expectation["includes"], f"{item['id']} {expectation['path']}")

        passed += 1
        print(f"PASS {item['id']}")
    except Exception as error:  # noqa: BLE001
        failed += 1
        print(f"FAIL {item['id']}: {error}", file=sys.stderr)

print(f"\nPython reference smoke complete: {passed} passed, {failed} failed")
if failed:
    sys.exit(1)
