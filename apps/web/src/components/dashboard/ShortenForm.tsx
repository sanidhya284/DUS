"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useShortenUrl } from "@/lib/queries/useUrls";

export function ShortenForm() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate: shorten, isPending, error } = useShortenUrl();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorMsg = (error as any)?.response?.data?.error?.message ?? (error ? "Failed to shorten" : null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    shorten(
      {
        originalUrl: url,
        alias: alias || undefined,
        expiresAt: expiresAt || undefined,
      },
      {
        onSuccess: (data) => {
          setResult({ shortUrl: data.shortUrl, shortCode: data.shortCode });
          setUrl("");
          setAlias("");
          setExpiresAt("");
        },
      }
    );
  }

  function copyToClipboard() {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-[#2A2A2A] bg-[#111111] p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-sans font-bold text-lg text-[#F0EBE1]">
          Shorten a URL
        </h2>
        <span className="font-mono text-xs text-[#555555] border border-[#2A2A2A] px-2 py-1">
          POST /api/urls
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="shorten-url"
          label="Long URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/very/long/path?with=params"
          mono
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="shorten-alias"
            label="Custom alias (optional)"
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="my-link"
            mono
          />
          <Input
            id="shorten-expires"
            label="Expires at (optional)"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            mono
          />
        </div>

        {errorMsg && (
          <p className="font-mono text-xs text-[#ef4444] border border-[#ef4444] px-3 py-2">
            ✗ {errorMsg}
          </p>
        )}

        <Button type="submit" loading={isPending} size="md" className="self-start">
          {isPending ? "Shortening…" : "Generate short link →"}
        </Button>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-6 border border-[#FF5C00] bg-[#FF5C0008] p-4 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex-1 overflow-hidden">
            <p className="font-mono text-xs text-[#FF5C00] uppercase tracking-widest mb-1">
              Short URL
            </p>
            <p className="font-mono text-sm text-[#F0EBE1] truncate">{result.shortUrl}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="shrink-0"
          >
            {copied ? "✓ Copied" : "Copy"}
          </Button>
        </div>
      )}
    </div>
  );
}
