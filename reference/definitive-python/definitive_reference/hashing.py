import hashlib
import json
from typing import Any


def stable_stringify(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def sha256_hex(value: Any) -> str:
    return hashlib.sha256(stable_stringify(value).encode("utf-8")).hexdigest()
