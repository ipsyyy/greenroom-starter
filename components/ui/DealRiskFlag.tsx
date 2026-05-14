"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface DealRiskFlagProps {
  dealNotes: string;
  showDate: string;
}

export function DealRiskFlag({ dealNotes, showDate }: DealRiskFlagProps) {
  const [risk, setRisk] = useState<{
    hasAmbiguity: boolean;
    summary: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Only show for upcoming shows
  const isUpcoming = new Date(showDate) > new Date();

  useEffect(() => {
    if (!isUpcoming || !dealNotes) {
      setLoading(false);
      return;
    }

    async function checkRisk() {
      try {
        const response = await fetch("/api/parse-deal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dealNotes }),
        });
        const data = await response.json();
        if (data.success && data.parsed.notes) {
          setRisk({
            hasAmbiguity: true,
            summary: data.parsed.notes,
          });
        } else {
          setRisk({ hasAmbiguity: false, summary: "" });
        }
      } catch {
        setRisk(null);
      } finally {
        setLoading(false);
      }
    }

    checkRisk();
  }, [dealNotes, isUpcoming]);

  if (!isUpcoming || loading || !risk?.hasAmbiguity) return null;

  return (
    <div className="mb-8 mt-1 rounded-lg bg-rose-50/50 ring-1 ring-rose-200/60 p-5 flex gap-3">
      <AlertTriangle className="h-4 w-4 text-rose-700 mt-0.5 shrink-0" />
      <div>
        <div className="eyebrow text-[10px] text-rose-800 mb-1.5">
          ⚠ AI flagged deal ambiguity — resolve before show night
        </div>
        <div className="text-[13px] text-ink-800 leading-relaxed">
          {risk.summary}
        </div>
        <div className="text-[11.5px] text-ink-500 mt-2">
          Ambiguous deal terms caught now save a 2am dispute. Email the agent today.
        </div>
      </div>
    </div>
  );
}