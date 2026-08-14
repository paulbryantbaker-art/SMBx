#!/usr/bin/env python3
"""Parity check: the recalculated workbook must agree with the engine's result.json.
Run AFTER recalc.py. Usage: verify_xlsx.py <model-run-dir>
Exits 1 on any mismatch. This is the guard that catches a builder writing a
formula that computes something other than what the engine computed."""
import json, sys
from openpyxl import load_workbook

d = sys.argv[1].rstrip("/")
res = json.load(open(f"{d}/result.json"))
wb = load_workbook(f"{d}/model.xlsx", data_only=True)
fails = []

def check(name, actual, expected, tol=1e-4):
    if actual is None or expected is None:
        fails.append(f"{name}: missing value (xlsx={actual}, engine={expected})"); return
    if abs(actual - expected) > tol * max(1, abs(expected)):
        fails.append(f"{name}: xlsx={actual} engine={expected}")

m = res["model"]
if m in ("valuation", "sba", "lbo"):
    ny = len(res["inputs"]["financials"]["years"])
    col = chr(ord("B") + ny - 1)
    ab_row = 4 + 9          # r0=3, 9 line items → addbacks at 13
    sde_row, ebd_row = ab_row + 2, ab_row + 3
    e = wb["Earnings"]
    cur = res["current"] if m == "valuation" else res["earnings"]
    check("SDE", e[f"{col}{sde_row}"].value, cur["sde"])
    check("EBITDA", e[f"{col}{ebd_row}"].value, cur["ebitda"])
if m == "valuation" and res.get("range"):
    v = wb["Valuation"]
    check("val low", v["B8"].value, res["range"]["low"])
    check("val mid", v["B9"].value, res["range"]["mid"])
    check("val high", v["B10"].value, res["range"]["high"])
elif m == "sba":
    s = wb["SBA"]
    nl = len(res["loans"])
    tr = 5 + nl + 1
    r = tr + 2
    check("annual debt service", s[f"F{tr}"].value, res["annual_debt_service"])
    check("equity injection", s[f"B{r}"].value, res["structure"]["equity_injection"])
    check("LTV", s[f"B{r+1}"].value, res["structure"]["ltv"])
    check("DSCR ebitda", s[f"B{r+5}"].value, res["dscr"]["on_ebitda"])
    check("DSCR sde", s[f"B{r+6}"].value, res["dscr"]["on_sde"])
elif m == "lbo":
    l = wb["LBO"]
    fr = 12 + 8 + 4  # r0=12, r=r0+8, fr=r+4
    check("IRR", l[f"B{fr+2}"].value, res["returns"]["irr"], tol=1e-3)
    check("MOIC", l[f"B{fr+3}"].value, res["returns"]["moic"], tol=1e-3)
elif m == "earnout":
    w = wb["Earnout"]
    nt = len(res["tranches"])
    check("expected total", w[f"B{5+nt+2}"].value, res["expectedTotal"])
    check("max total", w[f"B{5+nt+3}"].value, res["maxTotal"])

if fails:
    print(f"PARITY FAIL ({m}):"); [print("  " + f) for f in fails]; sys.exit(1)
print(f"parity OK ({m}): xlsx agrees with engine")
