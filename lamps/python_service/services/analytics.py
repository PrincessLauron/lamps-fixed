from collections import defaultdict
from typing import Any


def build_summary(state: dict[str, Any]) -> dict[str, Any]:
    assets = state.get("assets", [])
    bookings = state.get("bookings", [])
    alerts = state.get("alerts", [])

    units_by_status: dict[str, int] = defaultdict(int)
    units_by_lab: dict[str, int] = defaultdict(int)
    for asset in assets:
        quantity = asset.get("qty", 0)
        if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 0:
            raise ValueError("Asset quantities must be non-negative integers.")
        units_by_status[str(asset.get("status", "Unknown"))] += quantity
        units_by_lab[str(asset.get("room") or "Unassigned")] += quantity

    open_lost_alerts = sum(
        1 for alert in alerts
        if alert.get("type") == "lost" and alert.get("status") == "open"
    )
    return {
        "totalUnits": sum(units_by_status.values()),
        "unitsByStatus": dict(sorted(units_by_status.items())),
        "unitsByLaboratory": dict(sorted(units_by_lab.items())),
        "bookingsByStatus": _count_by(bookings, "status"),
        "openLostAlerts": open_lost_alerts,
    }


def _count_by(rows: list[dict[str, Any]], field: str) -> dict[str, int]:
    counts: dict[str, int] = defaultdict(int)
    for row in rows:
        counts[str(row.get(field, "Unknown"))] += 1
    return dict(sorted(counts.items()))
