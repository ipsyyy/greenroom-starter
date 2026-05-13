"use client";

import { useState } from "react";

interface ParsedDeal {
  guarantee: number | null;
  percentage: number | null;
  venueSplit: number | null;
  expenseCap: number | null;
  hospitalityCap: number | null;
  walkoutPotThreshold: number | null;
  walkoutPotPercentage: number | null;
  notes: string;
}

interface DealParserProps {
  dealNotes: string;
}

export function DealParser({ dealNotes }: DealParserProps) {
  const [parsed, setParsed] = useState<ParsedDeal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleParse() {
    setLoading(true);
    setError(null);
    setParsed(null);

    try {
      const response = await fetch("/api/parse-deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealNotes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse");
      }

      setParsed(data.parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-brand-200/60 bg-brand-50/30 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[13px] font-semibold text-ink-900">
            AI Deal Parser
          </div>
          <div className="text-[12px] text-ink-500 mt-0.5">
            Extract structured deal terms from Mariana's free-text notes
          </div>
        </div>
        <button
          onClick={handleParse}
          disabled={loading}
          className="px-4 py-2 bg-brand-700 text-white text-[12.5px] font-medium rounded-lg hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Parsing..." : "Parse with AI ✦"}
        </button>
      </div>

      {error && (
        <div className="text-[12px] text-rose-700 bg-rose-50 rounded-lg p-3 mt-3">
          {error}
        </div>
      )}

      {parsed && (
        <div className="mt-4 space-y-2">
          <div className="text-[10px] text-ink-400 uppercase tracking-wider mb-3">
            Extracted deal terms
          </div>

          <div className="grid grid-cols-2 gap-2">
            {parsed.guarantee != null && (
              <div className="bg-white rounded-lg p-3 ring-1 ring-ink-200/60">
                <div className="text-[10px] text-ink-400 mb-1">Guarantee</div>
                <div className="text-[14px] font-mono font-semibold text-ink-900">
                  ${parsed.guarantee.toLocaleString()}
                </div>
              </div>
            )}

            {parsed.percentage != null && (
              <div className="bg-white rounded-lg p-3 ring-1 ring-ink-200/60">
                <div className="text-[10px] text-ink-400 mb-1">
                  Artist split
                </div>
                <div className="text-[14px] font-mono font-semibold text-ink-900">
                  {(parsed.percentage * 100).toFixed(0)}%
                </div>
              </div>
            )}

            {parsed.expenseCap != null && (
              <div className="bg-white rounded-lg p-3 ring-1 ring-ink-200/60">
                <div className="text-[10px] text-ink-400 mb-1">
                  Expense cap
                </div>
                <div className="text-[14px] font-mono font-semibold text-ink-900">
                  ${parsed.expenseCap.toLocaleString()}
                </div>
              </div>
            )}

            {parsed.hospitalityCap != null && (
              <div className="bg-white rounded-lg p-3 ring-1 ring-ink-200/60">
                <div className="text-[10px] text-ink-400 mb-1">
                  Hospitality cap
                </div>
                <div className="text-[14px] font-mono font-semibold text-ink-900">
                  ${parsed.hospitalityCap.toLocaleString()}
                </div>
              </div>
            )}

            {parsed.walkoutPotThreshold != null && (
              <div className="bg-white rounded-lg p-3 ring-1 ring-ink-200/60">
                <div className="text-[10px] text-ink-400 mb-1">
                  Walkout pot threshold
                </div>
                <div className="text-[14px] font-mono font-semibold text-ink-900">
                  ${parsed.walkoutPotThreshold.toLocaleString()}
                </div>
              </div>
            )}

            {parsed.walkoutPotPercentage != null && (
              <div className="bg-white rounded-lg p-3 ring-1 ring-ink-200/60">
                <div className="text-[10px] text-ink-400 mb-1">
                  Walkout pot %
                </div>
                <div className="text-[14px] font-mono font-semibold text-ink-900">
                  {(parsed.walkoutPotPercentage * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </div>

          {parsed.notes && (
            <div className="mt-3 bg-amber-50 rounded-lg p-3 ring-1 ring-amber-200/60">
              <div className="text-[10px] text-amber-700 font-medium mb-1">
                ⚠ AI flagged ambiguity
              </div>
              <div className="text-[12px] text-ink-700 leading-relaxed">
                {parsed.notes}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}