"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { format } from "date-fns";
import type { GeoEntry, TimeSeriesEntry } from "@/lib/queries/useAnalytics";

// ─── Shared tooltip style ──────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: "#111111",
  border: "1px solid #2A2A2A",
  borderRadius: 0,
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 11,
  color: "#F0EBE1",
};

// ─── Time Series Chart ──────────────────────────────────────────────
export function TimeSeriesChart({ data }: { data: TimeSeriesEntry[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(new Date(d.date), "MMM dd"),
  }));

  return (
    <div className="border border-[#2A2A2A] bg-[#111111] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-sans font-semibold text-[#F0EBE1]">Clicks over time</h3>
        <span className="font-mono text-xs text-[#555555]">
          {data.length} data points
        </span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={formatted} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF5C00" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#FF5C00" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1A1A1A" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#555555", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#555555", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#2A2A2A" }} />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#FF5C00"
            strokeWidth={2}
            fill="url(#clickGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#FF5C00", stroke: "#0A0A0A", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Geo Bar Chart ──────────────────────────────────────────────────
const GEO_COLORS = ["#FF5C00", "#CC4A00", "#FF7A2E", "#FF9966", "#FFB399", "#888888"];

export function GeoChart({ data }: { data: GeoEntry[] }) {
  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 12);
  const total = sorted.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="border border-[#2A2A2A] bg-[#111111] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-sans font-semibold text-[#F0EBE1]">Clicks by country</h3>
        <span className="font-mono text-xs text-[#555555]">
          {data.length} countries
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="font-mono text-xs text-[#555555] py-8 text-center">No geo data yet.</p>
      ) : (
        <>
          {/* Bar chart */}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sorted} margin={{ top: 4, right: 16, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="#1A1A1A" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="country"
                tick={{ fill: "#555555", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#555555", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1A1A1A" }} />
              <Bar dataKey="count" name="Clicks" maxBarSize={40}>
                {sorted.map((_, i) => (
                  <Cell key={i} fill={GEO_COLORS[i % GEO_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Table breakdown */}
          <div className="mt-4 border-t border-[#1A1A1A] pt-4 space-y-2">
            {sorted.slice(0, 6).map((entry, i) => (
              <div key={entry.country} className="flex items-center gap-3">
                <div
                  className="w-2 h-2 shrink-0"
                  style={{ backgroundColor: GEO_COLORS[i % GEO_COLORS.length] }}
                />
                <span className="font-mono text-xs text-[#888888] flex-1">{entry.country}</span>
                <span className="font-mono text-xs text-[#F0EBE1]">{entry.count}</span>
                <span className="font-mono text-xs text-[#555555] w-12 text-right">
                  {((entry.count / total) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Stats Card ──────────────────────────────────────────────────────
export function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-[#2A2A2A] bg-[#111111] p-6">
      <p className="font-mono text-xs text-[#555555] uppercase tracking-widest mb-3">{label}</p>
      <p className="font-mono text-3xl font-bold text-[#FF5C00]">{value}</p>
      {sub && <p className="font-mono text-xs text-[#555555] mt-1">{sub}</p>}
    </div>
  );
}
