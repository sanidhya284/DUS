import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface UrlItem {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  customAlias: boolean;
  expiresAt?: string;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
}

interface UrlListResponse {
  data: UrlItem[];
  meta: { page: number; limit: number; total: number };
}

interface ShortenInput {
  originalUrl: string;
  alias?: string;
  expiresAt?: string;
}

export const URL_KEYS = {
  all: ["urls"] as const,
  list: (page: number, limit: number) => ["urls", page, limit] as const,
};

export function useUrls(page = 1, limit = 20) {
  return useQuery({
    queryKey: URL_KEYS.list(page, limit),
    queryFn: async () => {
      const { data } = await api.get<UrlListResponse>(`/urls?page=${page}&limit=${limit}`);
      return data;
    },
  });
}

export function useShortenUrl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ShortenInput) => {
      const { data } = await api.post<{ data: UrlItem }>("/urls", input);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: URL_KEYS.all });
    },
  });
}

export function useDeleteUrl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (shortCode: string) => {
      await api.delete(`/urls/${shortCode}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: URL_KEYS.all });
    },
  });
}

export function useToggleUrl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ shortCode, isActive }: { shortCode: string; isActive: boolean }) => {
      await api.patch(`/urls/${shortCode}`, { isActive });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: URL_KEYS.all });
    },
  });
}
