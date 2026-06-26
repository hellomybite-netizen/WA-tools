"use client";
import { useState, useRef, useEffect } from "react";
import { DATE_PRESETS, DatePreset, DateRange, getDateRange, formatDateLabel } from "@/lib/date-filter";

interface DateFilterProps {
  preset: DatePreset;
  customRange: DateRange;
  onChange: (preset: DatePreset, range: DateRange) => void;
}

export default function DateFilter({ preset, customRange, onChange }: DateFilterProps) {
  const [open, setOpen] = useState(false);
  const [localFrom, setLocalFrom] = useState(() => toInputDate(customRange.from));
  const [localTo, setLocalTo]     = useState(() => toInputDate(customRange.to));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectPreset(key: DatePreset) {
    if (key === "custom") { setOpen(true); return; }
    const range = getDateRange(key);
    onChange(key, range);
    setOpen(false);
  }

  function applyCustom() {
    const from = new Date(localFrom);
    const to   = new Date(localTo);
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) return;
    onChange("custom", { from, to });
    setOpen(false);
  }

  const range = getDateRange(preset, customRange);
  const label = DATE_PRESETS.find(p => p.key === preset)?.label ?? "Custom";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-gray-400">📅</span>
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-400 hidden sm:inline">{formatDateLabel(range)}</span>
        <span className="text-gray-400 text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white border rounded-lg shadow-lg w-64">
          <div className="p-1">
            {DATE_PRESETS.filter(p => p.key !== "custom").map(p => (
              <button
                key={p.key}
                onClick={() => selectPreset(p.key)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  preset === p.key ? "bg-green-50 text-green-700 font-medium" : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {p.label}
                <span className="text-xs text-gray-400 ml-2">
                  {formatDateLabel(getDateRange(p.key))}
                </span>
              </button>
            ))}
          </div>
          <div className="border-t p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Custom Range</p>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">Dari</label>
                <input
                  type="date"
                  value={localFrom}
                  onChange={e => setLocalFrom(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm mt-0.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Sampai</label>
                <input
                  type="date"
                  value={localTo}
                  onChange={e => setLocalTo(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm mt-0.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <button
                onClick={applyCustom}
                className="w-full bg-green-600 text-white rounded py-1.5 text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function toInputDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
