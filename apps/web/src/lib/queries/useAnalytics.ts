import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface UrlStats {
  shortCode: string;
  clickCount: number;
  uniqueClicks?: number;
  createdAt: string;
}

export interface GeoEntry {
  country: string;
  count: number;
}

export interface TimeSeriesEntry {
  date: string;
  clicks: number;
}

export const ANALYTICS_KEYS = {
  stats: (code: string) => ["analytics", code, "stats"] as const,
  geo: (code: string) => ["analytics", code, "geo"] as const,
  time: (code: string) => ["analytics", code, "time"] as const,
};

export function useStats(shortCode: string) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.stats(shortCode),
    queryFn: async () => {
      const { data } = await api.get<{ data: UrlStats }>(`/analytics/${shortCode}`);
      return data.data;
    },
    enabled: !!shortCode,
  });
}

export function useGeo(shortCode: string) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.geo(shortCode),
    queryFn: async () => {
      const { data } = await api.get<{ data: GeoEntry[] }>(`/analytics/${shortCode}/geo`);
      return data.data;
    },
    enabled: !!shortCode,
  });
}

export function useTimeSeries(shortCode: string) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.time(shortCode),
    queryFn: async () => {
      const { data } = await api.get<{ data: TimeSeriesEntry[] }>(`/analytics/${shortCode}/time`);
      return data.data;
    },
    enabled: !!shortCode,
  });
}
