#!/usr/bin/env python3
"""
CodeAlpha - Python - Task 02: Stock Portfolio Tracker
======================================================
A practical Python console application to track stocks, calculate individual
and total portfolio investment values, and fetch real-time market data using yfinance.

Features:
- Real-time stock prices fetched via yfinance library
- Predefined fallback dictionary of baseline stock prices for offline reliability
- Validated user inputs (stock symbols, positive quantities, duplicate handling)
- Formatted portfolio summary table with clean numeric calculations
- Optional file export to CSV and TXT formats
- Beginner-friendly, modular structure adhering to Python best practices
"""

import sys
import os
import csv
import json
from datetime import datetime

# Attempt to import yfinance for real-time market quotes
try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    yf = None
    YFINANCE_AVAILABLE = False


# Predefined baseline stock prices (demonstrates dictionary usage & offline fallback)
DEFAULT_STOCK_PRICES = {
    "AAPL": 180.00,
    "TSLA": 250.00,
    "MSFT": 420.00,
    "GOOGL": 175.00,
    "AMZN": 190.00,
    "NVDA": 125.00,
    "META": 500.00,
    "NFLX": 650.00,
    "AMD": 160.00,
    "INTC": 30.00,
}

# Predefined company names for standard catalog
DEFAULT_COMPANY_NAMES = {
    "AAPL": "Apple Inc.",
    "TSLA": "Tesla, Inc.",
    "MSFT": "Microsoft Corporation",
    "GOOGL": "Alphabet Inc.",
    "AMZN": "Amazon.com, Inc.",
    "NVDA": "NVIDIA Corporation",
    "META": "Meta Platforms, Inc.",
    "NFLX": "Netflix, Inc.",
    "AMD": "Advanced Micro Devices",
    "INTC": "Intel Corporation",
}


def fetch_stock_quote(symbol: str, allow_live: bool = True) -> dict:
    """
    Fetch real-time stock quote for a given symbol using yfinance.
    Falls back gracefully to the predefined dictionary if yfinance is
    unavailable, offline, or returns invalid data.
    
    Returns a dictionary containing:
        - symbol: str
        - name: str
        - price: float
        - currency: str
        - source: 'Real-time (yfinance)' or 'Predefined'
        - change_pct: float or None
    """
    symbol = symbol.strip().upper()
    
    # 1. Try fetching live data via yfinance if enabled
    if allow_live and YFINANCE_AVAILABLE:
        try:
            ticker = yf.Ticker(symbol)
            fast_info = getattr(ticker, "fast_info", None)
            
            live_price = None
            if fast_info:
                live_price = fast_info.get("last_price") or fast_info.get("lastPrice")
            
            # Fallback to info dict or recent history if fast_info is missing
            if live_price is None or live_price <= 0:
                info = ticker.info or {}
                live_price = (
                    info.get("currentPrice")
                    or info.get("regularMarketPrice")
                    or info.get("previousClose")
                )
            
            if live_price is None or live_price <= 0:
                hist = ticker.history(period="2d")
                if not hist.empty and "Close" in hist:
                    live_price = float(hist["Close"].iloc[-1])

            if live_price and live_price > 0:
                company_name = symbol
                currency = "USD"
                change_pct = None
                
                try:
                    if fast_info:
                        currency = fast_info.get("currency", "USD") or "USD"
                        prev_close = fast_info.get("previous_close") or fast_info.get("previousClose")
                        if prev_close and prev_close > 0:
                            change_pct = ((live_price - prev_close) / prev_close) * 100.0
                    
                    info = ticker.info or {}
                    company_name = (
                        info.get("shortName")
                        or info.get("longName")
                        or DEFAULT_COMPANY_NAMES.get(symbol, symbol)
                    )
                except Exception:
                    company_name = DEFAULT_COMPANY_NAMES.get(symbol, symbol)
                
                return {
                    "symbol": symbol,
                    "name": company_name,
                    "price": round(float(live_price), 2),
                    "currency": currency,
                    "source": "Real-time (yfinance)",
                    "change_pct": round(change_pct, 2) if change_pct is not None else None,
                    "success": True,
                }
        except Exception as e:
            # Network issue or rate-limit; continue to fallback
            pass

    # 2. Fallback to predefined stock prices dictionary
    if symbol in DEFAULT_STOCK_PRICES:
        return {
            "symbol": symbol,
            "name": DEFAULT_COMPANY_NAMES.get(symbol, f"{symbol} Corp."),
            "price": DEFAULT_STOCK_PRICES[symbol],
            "currency": "USD",
            "source": "Predefined (Offline Fallback)",
            "change_pct": None,
            "success": True,
        }

    return {
        "symbol": symbol,
        "name": symbol,
        "price": 0.0,
        "currency": "USD",
        "source": "Unavailable",
        "change_pct": None,
        "success": False,
        "error": f"Symbol '{symbol}' not found in real-time market or predefined database.",
    }


def display_welcome():
    """Display the introductory welcome banner."""
    print("=" * 68)
    print("          CODEALPHA STOCK PORTFOLIO TRACKER (PYTHON)")
    print("=" * 68)
    print(" Track stocks, calculate investment values, and fetch real-time")
    print(" market quotes powered by Yahoo Finance (yfinance).")
    if YFINANCE_AVAILABLE:
        print(" [Status: Real-time yfinance data ACTIVE]")
    else:
        print(" [Status: Running in Offline Mode with Predefined Prices]")
    print("=" * 68)


def display_available_stocks():
    """Display the catalog of predefined popular stocks."""
    print("\n--- Predefined Popular Stocks & Baseline Prices ---")
    print(f"{'Symbol':<8} {'Company Name':<28} {'Base Price':<12}")
    print("-" * 52)
    for sym, price in DEFAULT_STOCK_PRICES.items():
        name = DEFAULT_COMPANY_NAMES.get(sym, sym)
        print(f"{sym:<8} {name:<28} ${price:>8.2f}")
    print("-" * 52)
    print("Note: Any valid ticker symbol (e.g., NVDA, MSFT, INTC) can also be")
    print("fetched live in real-time from Yahoo Finance.")


def get_valid_symbol(allow_cancel: bool = True) -> str:
    """
    Prompt user for a stock symbol and validate it.
    Returns uppercase symbol or empty string if user cancels.
    """
    while True:
        prompt = "Enter Stock Symbol (or 'C' to cancel): " if allow_cancel else "Enter Stock Symbol: "
        user_input = input(prompt).strip().upper()

        if allow_cancel and user_input == "C":
            return ""

        if not user_input:
            print(" [Error] Stock symbol cannot be empty. Please try again.")
            continue

        if not user_input.replace(".", "").isalnum():
            print(" [Error] Invalid format. Symbols should contain letters and numbers (e.g. AAPL, BRK.B).")
            continue

        return user_input


def get_valid_quantity(allow_cancel: bool = True) -> float:
    """
    Prompt user for quantity and validate that it is a positive number.
    Returns float quantity or -1 if user cancels.
    """
    while True:
        prompt = "Enter Quantity owned (or 'C' to cancel): " if allow_cancel else "Enter Quantity owned: "
        user_input = input(prompt).strip()

        if allow_cancel and user_input.upper() == "C":
            return -1.0

        try:
            qty = float(user_input)
            if qty <= 0:
                print(" [Error] Quantity must be greater than zero (positive number).")
                continue
            return qty
        except ValueError:
            print(" [Error] Invalid input. Please enter a valid numerical quantity (e.g., 5 or 2.5).")


def add_or_update_stock(portfolio: dict, allow_live: bool = True):
    """
    Guides the user through adding or updating a stock in the portfolio.
    Calculates individual stock value and updates the portfolio dictionary.
    """
    print("\n>>> Add / Update Stock Holding")
    symbol = get_valid_symbol()
    if not symbol:
        print(" Action cancelled.")
        return

    print(f" Fetching quote for {symbol}...")
    quote = fetch_stock_quote(symbol, allow_live=allow_live)

    if not quote["success"]:
        print(f" [Error] {quote.get('error', 'Unable to retrieve quote.')}")
        choice = input(" Would you like to enter a manual price for this stock? (y/n): ").strip().lower()
        if choice == "y":
            while True:
                try:
                    manual_price = float(input(f" Enter price for {symbol}: $").strip())
                    if manual_price <= 0:
                        print(" [Error] Price must be greater than zero.")
                        continue
                    quote = {
                        "symbol": symbol,
                        "name": f"{symbol} Holding",
                        "price": round(manual_price, 2),
                        "currency": "USD",
                        "source": "Manual Entry",
                        "change_pct": None,
                        "success": True,
                    }
                    break
                except ValueError:
                    print(" [Error] Please enter a valid numerical price.")
        else:
            print(" Stock not added.")
            return

    # Check if stock already exists in portfolio
    existing_holding = portfolio.get(symbol)
    if existing_holding:
        print(f"\n [Notice] '{symbol}' is already in your portfolio with {existing_holding['quantity']:.2f} shares.")
        print(" 1. Add to existing quantity")
        print(" 2. Replace quantity")
        print(" 3. Cancel")
        mode = input(" Choose an option (1-3): ").strip()

        if mode == "3":
            print(" Action cancelled.")
            return
        elif mode == "1":
            add_qty = get_valid_quantity()
            if add_qty < 0:
                print(" Action cancelled.")
                return
            new_qty = existing_holding["quantity"] + add_qty
        elif mode == "2":
            new_qty = get_valid_quantity()
            if new_qty < 0:
                print(" Action cancelled.")
                return
        else:
            print(" Invalid choice. Action cancelled.")
            return
    else:
        new_qty = get_valid_quantity()
        if new_qty < 0:
            print(" Action cancelled.")
            return

    # Calculate individual investment value
    unit_price = quote["price"]
    inv_value = round(unit_price * new_qty, 2)

    portfolio[symbol] = {
        "symbol": symbol,
        "name": quote["name"],
        "quantity": new_qty,
        "price": unit_price,
        "value": inv_value,
        "currency": quote["currency"],
        "source": quote["source"],
        "change_pct": quote["change_pct"],
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    print("\n [Success] Holding saved successfully!")
    print(f" -> Stock:       {symbol} ({quote['name']})")
    print(f" -> Quantity:    {new_qty:.2f} shares")
    print(f" -> Unit Price:  ${unit_price:,.2f} ({quote['source']})")
    print(f" -> Total Value: ${inv_value:,.2f} {quote['currency']}")


def remove_stock(portfolio: dict):
    """Remove a stock from the portfolio dictionary."""
    if not portfolio:
        print("\n [Notice] Your portfolio is currently empty.")
        return

    print("\n>>> Remove Stock Holding")
    print(" Current symbols in portfolio:", ", ".join(portfolio.keys()))
    symbol = input(" Enter stock symbol to remove (or 'C' to cancel): ").strip().upper()

    if symbol == "C":
        print(" Action cancelled.")
        return

    if symbol in portfolio:
        removed = portfolio.pop(symbol)
        print(f" [Success] Removed {symbol} ({removed['quantity']:.2f} shares, valued at ${removed['value']:,.2f}).")
    else:
        print(f" [Error] '{symbol}' was not found in your portfolio.")


def calculate_portfolio_totals(portfolio: dict) -> dict:
    """
    Calculate summary totals across the entire portfolio.
    Returns total investment value, total holdings count, and total shares.
    """
    total_value = 0.0
    total_shares = 0.0

    for holding in portfolio.values():
        total_value += holding.get("value", 0.0)
        total_shares += holding.get("quantity", 0.0)

    return {
        "total_value": round(total_value, 2),
        "total_holdings": len(portfolio),
        "total_shares": round(total_shares, 2),
    }


def display_portfolio_summary(portfolio: dict):
    """
    Display a formatted summary table of the portfolio including individual
    stock investment values and overall total investment.
    """
    print("\n" + "=" * 76)
    print("                        PORTFOLIO SUMMARY")
    print("=" * 76)

    if not portfolio:
        print("\n   Your portfolio is empty. Choose 'Add Stock' to get started.\n")
        print("=" * 76)
        return

    # Table Header
    print(f"{'Stock':<8} {'Company Name':<22} {'Qty':<10} {'Price':<12} {'Value':<14} {'Source'}")
    print("-" * 76)

    totals = calculate_portfolio_totals(portfolio)

    for symbol, item in sorted(portfolio.items()):
        name_short = item["name"][:20] if len(item["name"]) > 20 else item["name"]
        qty_str = f"{item['quantity']:,.2f}"
        price_str = f"${item['price']:,.2f}"
        val_str = f"${item['value']:,.2f}"
        source_label = "Live" if "Real-time" in item.get("source", "") else "Predefined"

        print(f"{symbol:<8} {name_short:<22} {qty_str:<10} {price_str:<12} {val_str:<14} {source_label}")

    print("-" * 76)
    print(f" Total Holdings: {totals['total_holdings']} stocks    |    Total Shares: {totals['total_shares']:,.2f}")
    print(f" TOTAL PORTFOLIO VALUE:  ${totals['total_value']:,.2f} USD")
    print("=" * 76)


def refresh_portfolio_quotes(portfolio: dict):
    """
    Refetches live market quotes via yfinance for all stocks in the portfolio,
    updating prices and recalculating individual values.
    """
    if not portfolio:
        print("\n [Notice] Your portfolio is empty. Nothing to refresh.")
        return

    print(f"\n Refreshing real-time market quotes for {len(portfolio)} holding(s)...")
    for symbol, holding in portfolio.items():
        quote = fetch_stock_quote(symbol, allow_live=True)
        if quote["success"]:
            holding["price"] = quote["price"]
            holding["name"] = quote["name"]
            holding["source"] = quote["source"]
            holding["change_pct"] = quote["change_pct"]
            holding["value"] = round(holding["quantity"] * quote["price"], 2)
            holding["updated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"  [OK] {symbol:<6} -> ${quote['price']:,.2f} ({quote['source']})")
        else:
            print(f"  [--] {symbol:<6} -> Failed to update live quote, retained previous price.")

    print("\n [Success] Portfolio refresh complete.")
    display_portfolio_summary(portfolio)


def quick_stock_lookup():
    """Look up a stock's live or predefined price without adding it."""
    print("\n>>> Quick Stock Price Lookup")
    symbol = get_valid_symbol()
    if not symbol:
        return

    print(f" Fetching quote for {symbol}...")
    quote = fetch_stock_quote(symbol, allow_live=True)

    if quote["success"]:
        print("-" * 48)
        print(f" Symbol:      {quote['symbol']}")
        print(f" Company:     {quote['name']}")
        print(f" Price:       ${quote['price']:,.2f} {quote['currency']}")
        print(f" Data Source: {quote['source']}")
        if quote.get("change_pct") is not None:
            sign = "+" if quote["change_pct"] >= 0 else ""
            print(f" Day Change:  {sign}{quote['change_pct']:.2f}%")
        print("-" * 48)
    else:
        print(f" [Error] {quote.get('error', 'Unable to find symbol.')}")


def export_to_csv(portfolio: dict, filename: str = "portfolio_summary.csv") -> bool:
    """
    Export the current portfolio to a structured CSV file.
    Includes headers and handles file errors gracefully.
    """
    if not portfolio:
        print(" [Notice] Portfolio is empty. Nothing to export.")
        return False

    try:
        totals = calculate_portfolio_totals(portfolio)
        with open(filename, mode="w", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            # Write Header
            writer.writerow([
                "Symbol",
                "Company Name",
                "Quantity",
                "Price per Share",
                "Investment Value",
                "Currency",
                "Data Source",
                "Last Updated",
            ])

            # Write Rows
            for symbol, item in sorted(portfolio.items()):
                writer.writerow([
                    symbol,
                    item["name"],
                    f"{item['quantity']:.4f}",
                    f"{item['price']:.2f}",
                    f"{item['value']:.2f}",
                    item.get("currency", "USD"),
                    item.get("source", "N/A"),
                    item.get("updated_at", ""),
                ])

            # Summary row
            writer.writerow([])
            writer.writerow(["TOTAL", f"{totals['total_holdings']} Holdings", f"{totals['total_shares']:.4f}", "", f"{totals['total_value']:.2f}", "USD", "", ""])

        print(f"\n [Success] Portfolio successfully saved to CSV file: '{filename}'")
        return True
    except IOError as e:
        print(f"\n [Error] Failed to write CSV file '{filename}': {e}")
        return False


def export_to_txt(portfolio: dict, filename: str = "portfolio_summary.txt") -> bool:
    """
    Export the current portfolio to a clean, formatted TXT report.
    """
    if not portfolio:
        print(" [Notice] Portfolio is empty. Nothing to export.")
        return False

    try:
        totals = calculate_portfolio_totals(portfolio)
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        with open(filename, mode="w", encoding="utf-8") as txtfile:
            txtfile.write("=" * 76 + "\n")
            txtfile.write("                    CODEALPHA STOCK PORTFOLIO REPORT\n")
            txtfile.write("=" * 76 + "\n")
            txtfile.write(f" Generated: {now_str}\n")
            txtfile.write("=" * 76 + "\n\n")

            txtfile.write(f"{'Stock':<8} {'Company Name':<22} {'Qty':<10} {'Price':<12} {'Value':<14} {'Source'}\n")
            txtfile.write("-" * 76 + "\n")

            for symbol, item in sorted(portfolio.items()):
                name_short = item["name"][:20] if len(item["name"]) > 20 else item["name"]
                qty_str = f"{item['quantity']:,.2f}"
                price_str = f"${item['price']:,.2f}"
                val_str = f"${item['value']:,.2f}"
                src = "Live" if "Real-time" in item.get("source", "") else "Predefined"
                txtfile.write(f"{symbol:<8} {name_short:<22} {qty_str:<10} {price_str:<12} {val_str:<14} {src}\n")

            txtfile.write("-" * 76 + "\n")
            txtfile.write(f" Total Holdings: {totals['total_holdings']} stocks    |    Total Shares: {totals['total_shares']:,.2f}\n")
            txtfile.write(f" TOTAL PORTFOLIO VALUE:  ${totals['total_value']:,.2f} USD\n")
            txtfile.write("=" * 76 + "\n")

        print(f"\n [Success] Portfolio successfully saved to TXT file: '{filename}'")
        return True
    except IOError as e:
        print(f"\n [Error] Failed to write TXT file '{filename}': {e}")
        return False


def handle_export_menu(portfolio: dict):
    """Submenu to choose file saving format (CSV or TXT)."""
    if not portfolio:
        print("\n [Notice] Your portfolio is empty. Add stocks before exporting.")
        return

    print("\n--- Export Portfolio ---")
    print(" 1. Export as CSV (.csv)")
    print(" 2. Export as Text Report (.txt)")
    print(" 3. Export both formats")
    print(" 4. Cancel")
    choice = input(" Select an option (1-4): ").strip()

    if choice == "1":
        fname = input(" Enter filename [default: portfolio_summary.csv]: ").strip() or "portfolio_summary.csv"
        if not fname.endswith(".csv"):
            fname += ".csv"
        export_to_csv(portfolio, fname)
    elif choice == "2":
        fname = input(" Enter filename [default: portfolio_summary.txt]: ").strip() or "portfolio_summary.txt"
        if not fname.endswith(".txt"):
            fname += ".txt"
        export_to_txt(portfolio, fname)
    elif choice == "3":
        export_to_csv(portfolio, "portfolio_summary.csv")
        export_to_txt(portfolio, "portfolio_summary.txt")
    elif choice == "4":
        print(" Export cancelled.")
    else:
        print(" Invalid choice.")


def seed_sample_portfolio() -> dict:
    """Generates an initial sample portfolio for quick evaluation."""
    sample_symbols = [("AAPL", 5.0), ("TSLA", 2.0), ("MSFT", 3.0)]
    portfolio = {}
    for sym, qty in sample_symbols:
        quote = fetch_stock_quote(sym, allow_live=True)
        if quote["success"]:
            portfolio[sym] = {
                "symbol": sym,
                "name": quote["name"],
                "quantity": qty,
                "price": quote["price"],
                "value": round(qty * quote["price"], 2),
                "currency": quote["currency"],
                "source": quote["source"],
                "change_pct": quote.get("change_pct"),
                "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            }
    return portfolio


def run_interactive_cli():
    """Main interactive terminal loop for user engagement."""
    display_welcome()
    portfolio = {}

    # Prompt whether to load sample test data
    load_sample = input("\n Would you like to start with sample portfolio holdings (AAPL, TSLA, MSFT)? (y/n): ").strip().lower()
    if load_sample == "y":
        portfolio = seed_sample_portfolio()
        print(" [Loaded sample portfolio with 3 holdings]")
        display_portfolio_summary(portfolio)

    while True:
        print("\n" + "-" * 42)
        print("               MAIN MENU")
        print("-" * 42)
        print(" [1] View Portfolio Summary")
        print(" [2] Add / Update Stock Holding")
        print(" [3] Remove Stock from Portfolio")
        print(" [4] Refresh Real-time Prices (yfinance)")
        print(" [5] Quick Stock Price Lookup")
        print(" [6] View Available Baseline Stocks")
        print(" [7] Export Portfolio (CSV / TXT)")
        print(" [8] Clear Portfolio")
        print(" [9] Exit Application")
        print("-" * 42)

        choice = input(" Enter your choice (1-9): ").strip()

        if choice == "1":
            display_portfolio_summary(portfolio)
        elif choice == "2":
            add_or_update_stock(portfolio, allow_live=True)
        elif choice == "3":
            remove_stock(portfolio)
        elif choice == "4":
            refresh_portfolio_quotes(portfolio)
        elif choice == "5":
            quick_stock_lookup()
        elif choice == "6":
            display_available_stocks()
        elif choice == "7":
            handle_export_menu(portfolio)
        elif choice == "8":
            confirm = input(" Are you sure you want to clear your portfolio? (y/n): ").strip().lower()
            if confirm == "y":
                portfolio.clear()
                print(" [Success] Portfolio cleared.")
        elif choice == "9":
            display_portfolio_summary(portfolio)
            print("\n Thank you for using CodeAlpha Stock Portfolio Tracker! Goodbye.\n")
            break
        else:
            print(" [Error] Invalid selection. Please choose a number from 1 to 9.")


def main():
    """Entry point with CLI argument support."""
    # CLI Argument Flags for automation, testing, or API integration
    if "--demo" in sys.argv:
        print("Running Automated Demo Mode...")
        display_welcome()
        p = seed_sample_portfolio()
        display_portfolio_summary(p)
        export_to_csv(p, "portfolio_summary.csv")
        export_to_txt(p, "portfolio_summary.txt")
        print("Demo completed successfully.")
        return

    if "--quote" in sys.argv:
        idx = sys.argv.index("--quote")
        if idx + 1 < len(sys.argv):
            symbol = sys.argv[idx + 1]
            quote = fetch_stock_quote(symbol, allow_live=True)
            print(json.dumps(quote))
        else:
            print(json.dumps({"success": False, "error": "Missing symbol argument"}))
        return

    if "--calc-holdings" in sys.argv:
        idx = sys.argv.index("--calc-holdings")
        if idx + 1 < len(sys.argv):
            try:
                holdings_input = json.loads(sys.argv[idx + 1])
                # holdings_input: dict like {"AAPL": 5.0, "TSLA": 2.0}
                res_portfolio = {}
                for sym, qty in holdings_input.items():
                    q = fetch_stock_quote(sym, allow_live=True)
                    price = q.get("price", 0.0)
                    val = round(float(qty) * price, 2)
                    res_portfolio[sym.upper()] = {
                        "symbol": sym.upper(),
                        "name": q.get("name", sym.upper()),
                        "quantity": float(qty),
                        "price": price,
                        "value": val,
                        "currency": q.get("currency", "USD"),
                        "source": q.get("source", "N/A"),
                        "change_pct": q.get("change_pct"),
                        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    }
                totals = calculate_portfolio_totals(res_portfolio)
                print(json.dumps({"portfolio": res_portfolio, "totals": totals, "success": True}))
            except Exception as ex:
                print(json.dumps({"success": False, "error": str(ex)}))
        return

    if "--json" in sys.argv:
        # Output sample or empty portfolio as JSON
        p = seed_sample_portfolio()
        totals = calculate_portfolio_totals(p)
        data = {
            "portfolio": p,
            "totals": totals,
            "yfinance_active": YFINANCE_AVAILABLE,
        }
        print(json.dumps(data))
        return

    # Run the interactive CLI loop
    run_interactive_cli()


if __name__ == "__main__":
    main()
