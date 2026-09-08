import React, { useState, useEffect } from "react";
import { Copy, Check, Download, FileText, Code2 } from "lucide-react";

export const CodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<"tracker" | "readme" | "test">("tracker");
  const [codes, setCodes] = useState<{ pythonCode: string; testCode: string; readme: string }>({
    pythonCode: "",
    testCode: "",
    readme: "",
  });
  const [, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/source-code")
      .then((res) => res.json())
      .then((data) => {
        setCodes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getActiveContent = () => {
    if (activeFile === "tracker") return codes.pythonCode;
    if (activeFile === "readme") return codes.readme;
    return codes.testCode;
  };

  const getActiveFileName = () => {
    if (activeFile === "tracker") return "portfolio_tracker.py";
    if (activeFile === "readme") return "README.md";
    return "test_portfolio_tracker.py";
  };

  const copyContent = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden mb-6">
      {/* Tab bar */}
      <div className="bg-zinc-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveFile("tracker")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono transition ${
              activeFile === "tracker"
                ? "bg-white text-zinc-900 shadow-xs border border-zinc-200 font-medium"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-zinc-400" />
            portfolio_tracker.py
          </button>

          <button
            onClick={() => setActiveFile("test")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono transition ${
              activeFile === "test"
                ? "bg-white text-zinc-900 shadow-xs border border-zinc-200 font-medium"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-zinc-400" />
            test_portfolio_tracker.py
          </button>

          <button
            onClick={() => setActiveFile("readme")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono transition ${
              activeFile === "readme"
                ? "bg-white text-zinc-900 shadow-xs border border-zinc-200 font-medium"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            README.md
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyContent}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy code"}
          </button>

          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(getActiveContent())}`}
            download={getActiveFileName()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        </div>
      </div>

      {/* Code Display Canvas */}
      <div className="p-4 bg-zinc-950 font-mono text-xs text-zinc-200 leading-relaxed overflow-x-auto min-h-[420px] max-h-[600px] select-text">
        <pre className="whitespace-pre">{getActiveContent() || "# Loading source file..."}</pre>
      </div>
    </div>
  );
};
