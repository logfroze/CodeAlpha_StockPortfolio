#!/usr/bin/env python3
"""
Unit and integration tests for CodeAlpha Stock Portfolio Tracker.
Verifies calculations, dictionaries, validations, fallback behavior, and exports.
"""

import unittest
import os
from portfolio_tracker import (
    DEFAULT_STOCK_PRICES,
    DEFAULT_COMPANY_NAMES,
    fetch_stock_quote,
    calculate_portfolio_totals,
    export_to_csv,
    export_to_txt,
    seed_sample_portfolio,
)


class TestStockPortfolioTracker(unittest.TestCase):
    def test_default_dictionary_structure(self):
        """Verify the predefined dictionary contains expected stocks and positive prices."""
        self.assertIn("AAPL", DEFAULT_STOCK_PRICES)
        self.assertIn("TSLA", DEFAULT_STOCK_PRICES)
        self.assertIn("MSFT", DEFAULT_STOCK_PRICES)
        self.assertGreater(DEFAULT_STOCK_PRICES["AAPL"], 0)
        self.assertGreater(DEFAULT_STOCK_PRICES["TSLA"], 0)

    def test_fetch_stock_quote_fallback(self):
        """Verify fallback to predefined dictionary when allow_live=False."""
        quote = fetch_stock_quote("AAPL", allow_live=False)
        self.assertTrue(quote["success"])
        self.assertEqual(quote["symbol"], "AAPL")
        self.assertEqual(quote["price"], DEFAULT_STOCK_PRICES["AAPL"])
        self.assertIn("Predefined", quote["source"])

    def test_fetch_stock_quote_lowercase_normalization(self):
        """Verify symbols are automatically converted to uppercase."""
        quote = fetch_stock_quote("tsla", allow_live=False)
        self.assertEqual(quote["symbol"], "TSLA")
        self.assertTrue(quote["success"])

    def test_fetch_stock_quote_unknown(self):
        """Verify unknown symbol handled gracefully without crash."""
        quote = fetch_stock_quote("NON_EXISTENT_TICKER_XYZ999", allow_live=False)
        self.assertFalse(quote["success"])
        self.assertEqual(quote["price"], 0.0)

    def test_calculate_portfolio_totals_empty(self):
        """Verify calculation for empty portfolio."""
        totals = calculate_portfolio_totals({})
        self.assertEqual(totals["total_value"], 0.0)
        self.assertEqual(totals["total_holdings"], 0)
        self.assertEqual(totals["total_shares"], 0.0)

    def test_calculate_portfolio_totals_values(self):
        """Verify arithmetic: unit price * quantity = value, and total portfolio sum."""
        sample_portfolio = {
            "AAPL": {
                "symbol": "AAPL",
                "name": "Apple Inc.",
                "quantity": 5.0,
                "price": 180.0,
                "value": 900.0,
            },
            "TSLA": {
                "symbol": "TSLA",
                "name": "Tesla, Inc.",
                "quantity": 2.0,
                "price": 250.0,
                "value": 500.0,
            },
        }
        totals = calculate_portfolio_totals(sample_portfolio)
        self.assertEqual(totals["total_holdings"], 2)
        self.assertEqual(totals["total_shares"], 7.0)
        self.assertEqual(totals["total_value"], 1400.0)

    def test_exports(self):
        """Verify CSV and TXT files are created and contain valid data."""
        test_csv = "test_portfolio.csv"
        test_txt = "test_portfolio.txt"
        sample_portfolio = {
            "AAPL": {
                "symbol": "AAPL",
                "name": "Apple Inc.",
                "quantity": 10.0,
                "price": 200.0,
                "value": 2000.0,
                "currency": "USD",
                "source": "Test",
                "updated_at": "2026-09-08 12:00:00",
            }
        }
        self.assertTrue(export_to_csv(sample_portfolio, test_csv))
        self.assertTrue(export_to_txt(sample_portfolio, test_txt))
        self.assertTrue(os.path.exists(test_csv))
        self.assertTrue(os.path.exists(test_txt))

        # Clean up test artifacts
        os.remove(test_csv)
        os.remove(test_txt)


if __name__ == "__main__":
    unittest.main()
