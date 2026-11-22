import unittest

from services.analytics import build_summary


class AnalyticsTests(unittest.TestCase):
    def test_summarizes_units_bookings_alerts_and_laboratories(self):
        state = {
            "assets": [
                {"qty": 2, "status": "In Service", "room": "Embedded Laboratory"},
                {"qty": 1, "status": "Lost", "room": None},
            ],
            "bookings": [{"status": "Pending"}, {"status": "Approved"}],
            "alerts": [
                {"type": "lost", "status": "open"},
                {"type": "lost", "status": "resolved"},
                {"type": "booking", "status": "open"},
            ],
        }

        self.assertEqual(
            build_summary(state),
            {
                "totalUnits": 3,
                "unitsByStatus": {"In Service": 2, "Lost": 1},
                "unitsByLaboratory": {"Embedded Laboratory": 2, "Unassigned": 1},
                "bookingsByStatus": {"Approved": 1, "Pending": 1},
                "openLostAlerts": 1,
            },
        )

    def test_rejects_invalid_asset_quantities(self):
        for quantity in (-1, 1.5, True, "2"):
            with self.subTest(quantity=quantity):
                with self.assertRaises(ValueError):
                    build_summary({"assets": [{"qty": quantity}]})


if __name__ == "__main__":
    unittest.main()
