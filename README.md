# CodeAlpha Stock Portfolio Tracker

A beginner-friendly and practical Python terminal application that tracks stock holdings, calculates individual and total portfolio investment values, and fetches real-time market data using the `yfinance` library.

Developed as part of the **CodeAlpha Programming Internship**.

---

## Overview

The **CodeAlpha Stock Portfolio Tracker** allows users to manage their investment portfolio directly from the command line. Users can add stocks and share quantities, calculate their total portfolio net worth, look up real-time quotes, and export their portfolio records to structured `.csv` or formatted `.txt` files.

The program integrates **Yahoo Finance (`yfinance`)** to fetch live market prices, currency, and daily percentage changes, while maintaining a robust **predefined fallback dictionary** of baseline prices to ensure continuous, error-free operation even in offline or rate-limited environments.

---

## Features

- **Real-Time Market Data**: Fetches live stock prices and ticker information via the `yfinance` Python library.
- **Offline / Predefined Fallback**: Built-in dictionary containing major stock tickers and baseline prices if offline or if external APIs are unavailable.
- **Dynamic Investment Calculations**:
  - Individual Stock Investment Value = `Stock Price × Quantity`
  - Total Portfolio Value = `Sum of all individual stock values`
- **Smart Duplicate Handling**: When adding an existing stock, the user can choose to add to the existing quantity or replace it.
- **Input Validation**: Gracefully handles unknown stock symbols, non-numeric values, negative numbers, zero quantities, and invalid menu inputs without crashing.
- **Aligned Formatted Summary Table**: Displays a clean, easy-to-read console table with aligned columns for symbol, company name, quantity, price, value, and data source.
- **Optional File Saving**:
  - Structured **CSV export** (`portfolio_summary.csv`) with full metadata headers.
  - Readable **Text report** (`portfolio_summary.txt`) with timestamps and total portfolio statistics.
- **Quick Price Lookup**: Check live quotes for any stock symbol without modifying the portfolio.
- **Single-Key / Guided Menu Navigation**: Intuitive numbered menu options for smooth user workflow.

---

## Python Concepts Used

This application demonstrates core Python fundamentals:

1. **Dictionaries**: Storing predefined stock catalogs (`DEFAULT_STOCK_PRICES`), company names, individual portfolio holding records, and summary calculations.
2. **User Input / Output**: Clean console prompts, lowercase-to-uppercase string normalization, and formatted tabular output.
3. **Variables & Basic Arithmetic**: Precise multiplication for holding values, cumulative sum for total investment value, and percentages.
4. **Conditional Logic (`if` / `elif` / `else`)**: Handling menu routing, input validation, duplicate holding checks, and yfinance fallback mechanisms.
5. **Loops (`while` / `for`)**: Controlling the interactive application lifecycle and iterating over portfolio items.
6. **Functions**: Modular, reusable functions with single responsibilities and descriptive docstrings.
7. **File Handling**: Using Python's standard `csv` and `open()` file handlers with proper exception handling (`try` / `except`).
8. **Third-Party Integration**: Utilizing `yfinance` for external financial data retrieval with graceful offline degradation.

---

## Available Stocks

The application includes a built-in dictionary of predefined baseline prices:

| Symbol | Company Name | Baseline Price (USD) |
| :--- | :--- | :--- |
| **AAPL** | Apple Inc. | $180.00 |
| **TSLA** | Tesla, Inc. | $250.00 |
| **MSFT** | Microsoft Corporation | $420.00 |
| **GOOGL** | Alphabet Inc. | $175.00 |
| **AMZN** | Amazon.com, Inc. | $190.00 |
| **NVDA** | NVIDIA Corporation | $125.00 |
| **META** | Meta Platforms, Inc. | $500.00 |
| **NFLX** | Netflix, Inc. | $650.00 |
| **AMD** | Advanced Micro Devices | $160.00 |
| **INTC** | Intel Corporation | $30.00 |

*Note: With `yfinance` enabled, you can also look up and track **any** publicly traded stock symbol worldwide (e.g. SPY, QQQ, DIS, IBM).*

---

## How to Run

### Prerequisites

- **Python 3.8+** installed.
- (Recommended) `yfinance` library for real-time market data:
  ```bash
  pip install yfinance
  ```
  *Note: If `yfinance` is not installed, the application will automatically run in offline mode using the predefined baseline dictionary.*

### Execution

Run the script from your terminal:

```bash
python3 portfolio_tracker.py
```

### Automated Demo & Testing

To run the automated demonstration without interactive prompts:

```bash
python3 portfolio_tracker.py --demo
```

To run the unit test suite:

```bash
python3 test_portfolio_tracker.py
```

---

## How to Use

When launched, the program displays a welcome banner and the main menu:

```text
------------------------------------------
               MAIN MENU
------------------------------------------
 [1] View Portfolio Summary
 [2] Add / Update Stock Holding
 [3] Remove Stock from Portfolio
 [4] Refresh Real-time Prices (yfinance)
 [5] Quick Stock Price Lookup
 [6] View Available Baseline Stocks
 [7] Export Portfolio (CSV / TXT)
 [8] Clear Portfolio
 [9] Exit Application
------------------------------------------
```

1. **View Portfolio**: Choose `1` to display current holdings, individual values, and total investment value.
2. **Add Stock**: Choose `2`, enter the stock symbol (e.g., `AAPL`), and enter the quantity owned (e.g., `5`).
3. **Remove Stock**: Choose `3` and enter the symbol to remove from your portfolio.
4. **Refresh Prices**: Choose `4` to fetch the latest real-time market quotes for all your active holdings.
5. **Quick Lookup**: Choose `5` to query any stock's current price and day change.
6. **Export**: Choose `7` to save your summary to CSV or TXT.

---

## Optional File Saving

The application includes built-in export functionality:

1. **CSV Format (`portfolio_summary.csv`)**:
   Standard comma-separated format compatible with Excel, Google Sheets, and data tools. Contains `Symbol`, `Company Name`, `Quantity`, `Price per Share`, `Investment Value`, `Currency`, `Data Source`, and `Last Updated`.
2. **Text Report (`portfolio_summary.txt`)**:
   Formatted plain-text report featuring aligned tabular layout, generation timestamp, and total portfolio valuation.

---

## Project Structure

```text
CodeAlpha_Stock_Portfolio_Tracker/
│
├── portfolio_tracker.py       # Main application source code
├── test_portfolio_tracker.py  # Unit test suite
├── README.md                  # Project documentation & guide
├── portfolio_summary.csv      # Exported CSV report (generated on export)
└── portfolio_summary.txt      # Exported Text report (generated on export)
```

---

## Internship Task

- **Organization**: CodeAlpha
- **Role**: Python Programming Intern
- **Task**: Stock Portfolio Tracker
- **Specification Met**: Python fundamentals, dictionary usage, input validation, mathematical calculations, live market data integration via yfinance, and optional file output.

---

## Author

Developed for the **CodeAlpha Programming Internship** by **CodeAlpha Intern**.
