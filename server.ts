import express from "express";
import path from "path";
import fs from "fs";
import { execFile, exec } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

const PYTHON_CMD = process.platform === "win32" ? "python" : "python3";

app.use(express.json());

// API: Quick quote lookup using Python yfinance
app.get("/api/quote", (req, res) => {
  const symbol = (req.query.symbol as string || "").trim().toUpperCase();
  if (!symbol) {
    return res.status(400).json({ success: false, error: "Symbol is required" });
  }

  execFile(PYTHON_CMD, ["portfolio_tracker.py", "--quote", symbol], (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    try {
      const data = JSON.parse(stdout.trim());
      res.json(data);
    } catch (e) {
      res.status(500).json({ success: false, error: "Invalid JSON from Python runner", raw: stdout });
    }
  });
});

// API: Calculate entire portfolio with live yfinance prices
app.post("/api/calc-holdings", (req, res) => {
  const { holdings } = req.body;
  if (!holdings || typeof holdings !== "object") {
    return res.status(400).json({ success: false, error: "Invalid holdings payload" });
  }

  const holdingsJson = JSON.stringify(holdings);
  execFile(PYTHON_CMD, ["portfolio_tracker.py", "--calc-holdings", holdingsJson], (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    try {
      const data = JSON.parse(stdout.trim());
      res.json(data);
    } catch (e) {
      res.status(500).json({ success: false, error: "Failed to parse Python calculation output", raw: stdout });
    }
  });
});

// API: Run CLI command and stream terminal output
app.post("/api/run-cli", (req, res) => {
  const { action, symbol, qty } = req.body;
  let command = `${PYTHON_CMD} portfolio_tracker.py --demo`;

  if (action === "test") {
    command = `${PYTHON_CMD} test_portfolio_tracker.py`;
  } else if (action === "quote" && symbol) {
    command = `${PYTHON_CMD} portfolio_tracker.py --quote ${symbol}`;
  } else if (action === "json") {
    command = `${PYTHON_CMD} portfolio_tracker.py --json`;
  } else if (action === "demo") {
    command = `${PYTHON_CMD} portfolio_tracker.py --demo`;
  }

  exec(command, { timeout: 15000 }, (error, stdout, stderr) => {
    res.json({
      success: !error,
      command,
      stdout: stdout || "",
      stderr: stderr || (error ? error.message : ""),
      code: error ? error.code : 0,
    });
  });
});

// API: Read python source code and documentation for in-app code review
app.get("/api/source-code", (req, res) => {
  try {
    const pythonCode = fs.readFileSync(path.join(process.cwd(), "portfolio_tracker.py"), "utf-8");
    const testCode = fs.readFileSync(path.join(process.cwd(), "test_portfolio_tracker.py"), "utf-8");
    const readme = fs.readFileSync(path.join(process.cwd(), "README.md"), "utf-8");
    res.json({ pythonCode, testCode, readme });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// API: Download CSV
app.get("/api/download/csv", (req, res) => {
  const filePath = path.join(process.cwd(), "portfolio_summary.csv");
  if (!fs.existsSync(filePath)) {
    // Generate default
    exec(`${PYTHON_CMD} portfolio_tracker.py --demo`, () => {
      if (fs.existsSync(filePath)) {
        res.download(filePath, "portfolio_summary.csv");
      } else {
        res.status(404).send("File not generated");
      }
    });
    return;
  }
  res.download(filePath, "portfolio_summary.csv");
});

// API: Download TXT
app.get("/api/download/txt", (req, res) => {
  const filePath = path.join(process.cwd(), "portfolio_summary.txt");
  if (!fs.existsSync(filePath)) {
    exec(`${PYTHON_CMD} portfolio_tracker.py --demo`, () => {
      if (fs.existsSync(filePath)) {
        res.download(filePath, "portfolio_summary.txt");
      } else {
        res.status(404).send("File not generated");
      }
    });
    return;
  }
  res.download(filePath, "portfolio_summary.txt");
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
