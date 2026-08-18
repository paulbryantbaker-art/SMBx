#!/usr/bin/env python3
"""Build dashboard.html from result.json — self-contained, house design tokens
(Guber v5.2: #FAFAFA bg, #1A1A18 text, terra #D4714E as functional accent only)."""
import json, sys, html

def money(v):
    if v is None: return "—"
    return f"(${abs(v):,.0f})" if v < 0 else f"${v:,.0f}"
def pct(v): return "—" if v is None else f"{v*100:.1f}%"
def mult(v): return "—" if v is None else f"{v:.2f}x"
def ratio(v): return "—" if v is None else f"{v:.2f}"

CSS = """
body{margin:0;background:#FAFAFA;color:#1A1A18;font:15px/1.55 Inter,-apple-system,'Segoe UI',sans-serif;padding:40px 24px}
.wrap{max-width:960px;margin:0 auto}
h1{font-family:Sora,Inter,sans-serif;font-weight:800;font-size:26px;margin:0 0 4px}
h2{font-family:Sora,Inter,sans-serif;font-weight:600;font-size:17px;margin:34px 0 12px}
.sub{color:#6E6A63;font-size:13px;margin-bottom:8px}
.engine{color:#6E6A63;font-size:12px;border-left:3px solid #D4714E;padding-left:10px;margin:14px 0 4px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:18px 0}
.tile{background:#fff;border:1px solid #eeeef0;border-radius:12px;padding:16px 18px}
.tile .l{font-size:12px;color:#6E6A63;text-transform:uppercase;letter-spacing:.04em}
.tile .v{font-family:Sora,Inter,sans-serif;font-weight:800;font-size:22px;margin-top:4px}
.tile .v.accent{color:#D4714E}
table{border-collapse:collapse;width:100%;background:#fff;border:1px solid #eeeef0;border-radius:12px;overflow:hidden}
th,td{padding:8px 12px;text-align:right;font-size:13.5px;border-bottom:1px solid #eeeef0}
th{background:#FAF8F4;color:#44403C;font-weight:600}
th:first-child,td:first-child{text-align:left}
.pass{color:#1a7a3c;font-weight:600}.fail{color:#b3261e;font-weight:600}
.note{color:#6E6A63;font-size:12px;margin-top:22px}
"""

def tile(label, value, accent=False):
    return f'<div class="tile"><div class="l">{html.escape(label)}</div><div class="v{" accent" if accent else ""}">{value}</div></div>'

def table(headers, rows):
    th = "".join(f"<th>{html.escape(str(h))}</th>" for h in headers)
    trs = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return f"<table><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table>"

def render(res):
    m = res["model"]
    name = (res.get("inputs", {}).get("deal", {}) or {}).get("business") or \
           (res.get("inputs", {}).get("deal", {}) or {}).get("name") or m
    parts = [f'<h1>{html.escape(str(name))}</h1>',
             f'<div class="sub">{m.upper()} model · run {res["run"]["date"]}</div>',
             f'<div class="engine">Engine: {html.escape(res["run"]["engine"])} · Formulas: METHODOLOGY_V17 §5.0</div>']
    if m == "valuation":
        c = res["current"]
        parts.append('<div class="tiles">' + tile(f'SDE ({c["year"]})', money(c["sde"]))
                     + tile(f'Adj. EBITDA ({c["year"]})', money(c["ebitda"]))
                     + tile("Verified add-backs", money(c["verified_addbacks"])) + "</div>")
        if res.get("range"):
            r = res["range"]
            parts.append("<h2>Valuation range</h2><div class='tiles'>"
                         + tile(f'Low ({mult(r["multiple_low"])})', money(r["low"]))
                         + tile("Mid", money(r["mid"]), accent=True)
                         + tile(f'High ({mult(r["multiple_high"])})', money(r["high"])) + "</div>"
                         + f'<div class="note">Multiple basis: {r["basis"]} · Source: {html.escape(r["multiple_source"])}</div>')
        parts.append("<h2>Per-year normalization</h2>" + table(
            ["Year", "SDE", "Adj. EBITDA", "Verified add-backs"],
            [[y["year"], money(y["sde"]), money(y["ebitda"]), money(y["verified_addbacks"])] for y in res["perYear"]]))
    elif m == "sba":
        d = res["dscr"]
        badge = lambda ok: f'<span class="{"pass" if ok else "fail"}">{"PASS" if ok else "FAIL"}</span>'
        parts.append('<div class="tiles">'
                     + tile("DSCR on EBITDA", ratio(d["on_ebitda"]), accent=True)
                     + tile("DSCR on SDE", ratio(d["on_sde"]))
                     + tile("Annual debt service", money(res["annual_debt_service"]))
                     + tile("Equity injection", money(res["structure"]["equity_injection"])) + "</div>")
        parts.append("<h2>Tests</h2>" + table(["Test", "Threshold", "Result"], [
            ["SBA 7(a)", "DSCR ≥ 1.25", badge(d["sba_pass"])],
            ["Conventional", "DSCR ≥ 1.50", badge(d["conventional_pass"])],
            ["Risk matrix", f'LTV {pct(res["structure"]["ltv"])}',
             html.escape(f'{res["risk"]["score"]} — {res["risk"]["recommendation"]}') if res.get("risk") else "—"]]))
        parts.append("<h2>Loans</h2>" + table(["Loan", "Principal", "Rate", "Term", "Monthly", "Annual"],
            [[html.escape(l["name"]), money(l["principal"]), pct(l["rate"]), f'{l["termYears"]} yrs',
              money(l["monthlyPayment"]), money(l["monthlyPayment"]*12)] for l in res["loans"]]))
    elif m == "lbo":
        r = res["returns"]; a = res["assumptions"]
        parts.append('<div class="tiles">' + tile("IRR", pct(r["irr"]), accent=True)
                     + tile("MOIC", mult(r["moic"])) + tile("Equity invested", money(a["equity_invested"]))
                     + tile("Entry → exit", f'{mult(a["entry_multiple"])} → {mult(a["exit_multiple"])}') + "</div>")
        parts.append("<h2>Pro forma</h2>" + table(
            ["Year", "Revenue", "EBITDA", "Debt service", "FCF to equity", "DSCR"],
            [[y["year"], money(y["revenue"]), money(y["ebitda"]), money(y["debt_service"]),
              money(y["fcf_to_equity"]), ratio(y["dscr"])] for y in res["proForma"]]))
        if res.get("sensitivity"):
            s = res["sensitivity"]
            parts.append("<h2>IRR sensitivity — growth × exit multiple</h2>" + table(
                ["growth \\ exit", *[mult(x) for x in s["exits"]]],
                [[pct(row["growth"]), *[pct(c["irr"]) for c in row["cells"]]] for row in s["rows"]]))
    elif m == "earnout":
        parts.append('<div class="tiles">' + tile("Base price", money(res["base"]))
                     + tile("Expected total", money(res["expectedTotal"]), accent=True)
                     + tile("Max total", money(res["maxTotal"])) + "</div>")
        parts.append(table(["Tranche", "Amount", "Probability", "Expected", "Trigger"],
            [[html.escape(t["label"]), money(t["amount"]), pct(t["probability"]),
              money(t["amount"]*t["probability"]), html.escape(t.get("trigger",""))] for t in res["tranches"]]))
    elif m == "compare":
        parts.append("<h2>Deals side-by-side</h2>" + table(
            ["Metric", *[html.escape(d["name"]) for d in res["deals"]]],
            [["Basis", *[d["earnings"]["basis"] for d in res["deals"]]],
             ["Basis amount", *[money(d["earnings"]["basisAmount"]) for d in res["deals"]]],
             ["Valuation low", *[money((d.get("valuation_range") or {}).get("low")) for d in res["deals"]]],
             ["Valuation high", *[money((d.get("valuation_range") or {}).get("high")) for d in res["deals"]]],
             ["Purchase price", *[money(d.get("purchase_price")) for d in res["deals"]]],
             ["DSCR", *[ratio(d.get("dscr")) for d in res["deals"]]],
             ["Risk", *[html.escape(d.get("risk") or "—") for d in res["deals"]]],
             ["IRR", *[pct(d.get("irr")) for d in res["deals"]]],
             ["MOIC", *[mult(d.get("moic")) for d in res["deals"]]]]))
    parts.append('<div class="note">Internal analysis. Deterministic output of the deal math workbench — same inputs always produce the same numbers. Not a valuation opinion; no figure here is publishable studio output.</div>')
    return ('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{html.escape(str(name))} — {m}</title><style>{CSS}</style></head>'
            f'<body><div class="wrap">{"".join(parts)}</div></body></html>')

if __name__ == "__main__":
    res = json.load(open(sys.argv[1]))
    open(sys.argv[2], "w").write(render(res))
