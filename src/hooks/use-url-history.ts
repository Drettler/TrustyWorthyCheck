import { useState, useEffect } from "react";
import type { AnalysisResult } from "@/lib/api/url-check";

export interface HistoryEntry {
  id: string;
  url: string;
  trustScore: number;
  verdict: string;
  checkedAt: string;
  result: AnalysisResult;
}

const HISTORY_KEY = "url-check-history";
const MAX_HISTORY_ITEMS = 20;

export function useUrlHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const addToHistory = (url: string, result: AnalysisResult) => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      url,
      trustScore: result.trustScore,
      verdict: result.verdict,
      checkedAt: new Date().toISOString(),
      result,
    };

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.url !== url);
      const updated = [entry, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  return { history, addToHistory, removeFromHistory, clearHistory };
}
