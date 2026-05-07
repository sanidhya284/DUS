"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { useStats, useGeo, useTimeSeries } from "@/lib/queries/useAnalytics";
import { TimeSeriesChart, GeoChart, StatCard } from "@/components/analytics/Charts";

function Skeleton() {
  return (
    <div className="border border-[#2A2A2A] bg-[#111111] p-6 animate-pulse">
      <div className="h-3 w-32 bg-[#1A1A1A] mb-4" />
      <div className="h-48 bg-[#1A1A1A]" />
    </div>
  );
}

export default function AnalyticsPage() {
  const params = useParams<{ shortCode: string }>();
  const shortCode = params.shortCode;
  const { data: stats } = useStats(shortCode);
  const { data: geo, isLoading: geoLoading } = useGeo(shortCode);
  const { data: timeSeries, isLoading: timeLoading } = useTimeSeries(shortCode);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <Link
          href="/dashboard"
          className="font-mono text-xs text-[#555555] hover:text-[#FF5C00] transition-colors inline-flex items-center gap-1 mb-4"
        >
          ← Back to dashboard
        </Link>
        <p className="font-mono text-xs text-[#FF5C00] uppercase tracking-widest mb-1">
          Analytics
        </p>
        <h1 className="font-sans font-black text-3xl md:text-4xl text-[#F0EBE1] tracking-tight font-mono">
          /{shortCode}
        </h1>
        {stats && (
          <p className="font-mono text-xs text-[#555555] mt-2 truncate max-w-lg">
            → {stats.shortCode}
          </p>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#2A2A2A] mb-6 animate-fade-up delay-100">
        <StatCard
          label="Total clicks"
          value={stats?.clickCount?.toLocaleString() ?? "—"}
          sub="All time"
        />
        <StatCard
          label="Countries"
          value={geo?.length ?? "—"}
          sub="Unique origins"
        />
        <StatCard
          label="Created"
          value={stats?.createdAt ? format(new Date(stats.createdAt), "MMM dd, yyyy") : "—"}
          sub="First shortened"
        />
        <StatCard
          label="Short code"
          value={shortCode}
          sub="Identifier"
        />
      </div>

      {/* Charts */}
      <div className="space-y-6 animate-fade-up delay-200">
        {/* Time series */}
        {timeLoading ? (
          <Skeleton />
        ) : timeSeries && timeSeries.length > 0 ? (
          <TimeSeriesChart data={timeSeries} />
        ) : (
          <div className="border border-[#2A2A2A] bg-[#111111] p-8 text-center">
            <p className="font-mono text-xs text-[#555555]">No click data yet for time series.</p>
          </div>
        )}

        {/* Geo chart */}
        {geoLoading ? (
          <Skeleton />
        ) : geo ? (
          <GeoChart data={geo} />
        ) : null}
      </div>

      {/* Raw data table */}
      {timeSeries && timeSeries.length > 0 && (
        <div className="mt-6 border border-[#2A2A2A] animate-fade-up delay-300">
          <div className="px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between">
            <span className="font-sans font-semibold text-sm text-[#F0EBE1]">
              Daily breakdown
            </span>
            <span className="font-mono text-xs text-[#555555]">
              {timeSeries.length} days
            </span>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#111111]">
                <tr className="border-b border-[#2A2A2A]">
                  {["Date", "Clicks"].map((h) => (
                    <th key={h} className="px-6 py-3 font-mono text-xs text-[#555555] uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...timeSeries].reverse().map((entry) => (
                  <tr key={entry.date} className="border-b border-[#1A1A1A] hover:bg-[#111111]">
                    <td className="px-6 py-3 font-mono text-xs text-[#888888]">
                      {format(new Date(entry.date), "EEEE, MMM dd yyyy")}
                    </td>
                    <td className="px-6 py-3 font-mono text-sm text-[#F0EBE1] font-bold">
                      {entry.clicks.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
