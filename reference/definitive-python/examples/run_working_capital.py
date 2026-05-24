import json

from definitive_reference import execute_reference_model


run = execute_reference_model(
    {
        "modelId": "M109",
        "input": {
            "months": [
                {
                    "month": "2026-01",
                    "accountsReceivableCents": 50000000,
                    "inventoryCents": 25000000,
                    "prepaidExpensesCents": 5000000,
                    "accountsPayableCents": 20000000,
                    "accruedExpensesCents": 10000000,
                },
                {
                    "month": "2026-02",
                    "accountsReceivableCents": 52000000,
                    "inventoryCents": 26000000,
                    "prepaidExpensesCents": 4000000,
                    "accountsPayableCents": 21000000,
                    "accruedExpensesCents": 9500000,
                },
                {
                    "month": "2026-03",
                    "accountsReceivableCents": 54000000,
                    "inventoryCents": 24500000,
                    "prepaidExpensesCents": 4500000,
                    "accountsPayableCents": 21500000,
                    "accruedExpensesCents": 11000000,
                },
            ]
        },
    }
)

print(json.dumps(run, indent=2))
