"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useUrls, useDeleteUrl, useToggleUrl, type UrlItem } from "@/lib/queries/useUrls";

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

function UrlRow({ item, onDelete }: { item: UrlItem; onDelete: (code: string) => void }) {
  const { mutate: toggle, isPending: toggling } = useToggleUrl();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  function copy(text: string, code: string) {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <tr className="border-b border-[#1A1A1A] hover:bg-[#111111] transition-colors group">
      {/* Short code */}
      <td className="px-4 py-4 align-top">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-[#FF5C00]">{item.shortCode}</span>
          {item.customAlias && <Badge variant="custom">alias</Badge>}
        </div>
        <button
          onClick={() => copy(item.shortUrl, item.shortCode)}
          className="font-mono text-xs text-[#555555] hover:text-[#888888] transition-colors mt-1 cursor-pointer"
        >
          {copiedCode === item.shortCode ? "✓ copied" : "copy link"}
        </button>
      </td>

      {/* Original URL */}
      <td className="px-4 py-4 align-top max-w-xs">
        <a
          href={item.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-[#888888] hover:text-[#F0EBE1] transition-colors break-all"
          title={item.originalUrl}
        >
          {truncate(item.originalUrl, 60)}
        </a>
      </td>

      {/* Clicks */}
      <td className="px-4 py-4 align-top text-right">
        <span className="font-mono text-sm text-[#F0EBE1] font-bold">
          {item.clickCount.toLocaleString()}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-4 align-top">
        <Badge variant={item.isActive ? "active" : "inactive"}>
          {item.isActive ? "active" : "inactive"}
        </Badge>
      </td>

      {/* Created */}
      <td className="px-4 py-4 align-top">
        <span className="font-mono text-xs text-[#555555]">
          {format(new Date(item.createdAt), "MMM dd, yy")}
        </span>
        {item.expiresAt && (
          <div className="font-mono text-xs text-[#eab308] mt-0.5">
            exp {format(new Date(item.expiresAt), "MMM dd")}
          </div>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-4 align-top">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/dashboard/${item.shortCode}`}>
            <Button variant="ghost" size="sm">Analytics</Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            loading={toggling}
            onClick={() => toggle({ shortCode: item.shortCode, isActive: !item.isActive })}
          >
            {item.isActive ? "Pause" : "Resume"}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(item.shortCode)}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function UrlTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useUrls(page, 20);
  const { mutate: deleteUrl } = useDeleteUrl();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function handleDeleteClick(code: string) {
    if (deleteConfirm === code) {
      deleteUrl(code);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(code);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  if (isLoading) {
    return (
      <div className="border border-[#2A2A2A] p-12 flex items-center justify-center">
        <div className="font-mono text-sm text-[#555555] flex items-center gap-3">
          <span className="w-4 h-4 border-2 border-[#FF5C00] border-t-transparent rounded-full animate-spin" />
          Loading links…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[#ef4444] p-8">
        <p className="font-mono text-sm text-[#ef4444]">Failed to load links.</p>
      </div>
    );
  }

  const urls = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  if (urls.length === 0) {
    return (
      <div className="border border-[#2A2A2A] p-12 text-center">
        <p className="font-mono text-sm text-[#555555]">No links yet. Shorten your first URL above.</p>
      </div>
    );
  }

  return (
    <div className="border border-[#2A2A2A]">
      <div className="px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between">
        <span className="font-sans font-semibold text-[#F0EBE1]">
          Your links
        </span>
        <span className="font-mono text-xs text-[#555555]">
          {total} total
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#2A2A2A]">
              {["Short code", "Original URL", "Clicks", "Status", "Created", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 font-mono text-xs text-[#555555] uppercase tracking-widest whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {urls.map((item) => (
              <UrlRow
                key={item.shortCode}
                item={deleteConfirm === item.shortCode
                  ? { ...item }
                  : item
                }
                onDelete={handleDeleteClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="border-t border-[#2A2A2A] px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </Button>
          <span className="font-mono text-xs text-[#555555]">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 20 >= total}
          >
            Next →
          </Button>
        </div>
      )}

      {deleteConfirm && (
        <div className="border-t border-[#ef4444] bg-[#ef444411] px-6 py-3">
          <p className="font-mono text-xs text-[#ef4444]">
            Click Delete again on <strong>{deleteConfirm}</strong> to confirm. (Auto-cancels in 3s)
          </p>
        </div>
      )}
    </div>
  );
}
