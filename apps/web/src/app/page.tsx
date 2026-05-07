import Link from "next/link";

const features = [
  {
    id: "01",
    title: "Sub-millisecond redirects",
    desc: "Redis-cached hot path. Every redirect resolves in under 5ms at the edge.",
  },
  {
    id: "02",
    title: "Plan-aware rate limiting",
    desc: "Anon: 5/min. Free: 30/min. Pro: 100/min. Enforced at the middleware layer.",
  },
  {
    id: "03",
    title: "Real-time analytics",
    desc: "Click counts, geo distribution, and time-series graphs. Updated on every hit.",
  },
  {
    id: "04",
    title: "Custom aliases",
    desc: "Pro users can claim any available alias. Short codes are Base62, always unique.",
  },
  {
    id: "05",
    title: "RS256 JWT auth",
    desc: "Asymmetric key signing. Access tokens expire in 15m. Refresh tokens in 7d.",
  },
  {
    id: "06",
    title: "Link expiry",
    desc: "Set an expiry date on any link. Expired links return 410 Gone automatically.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      {/* ─── Navigation ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2A2A2A] bg-[#0A0A0A]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-mono text-sm text-[#FF5C00] font-bold tracking-widest uppercase">
            DUS
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="font-mono text-xs text-[#888888] hover:text-[#F0EBE1] transition-colors px-3 py-1.5 border border-transparent hover:border-[#2A2A2A]"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="font-mono text-xs bg-[#FF5C00] text-[#0A0A0A] px-4 py-2 font-semibold hover:bg-[#CC4A00] transition-colors"
            >
              Get started →
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────────── */}
      <section className="pt-14 min-h-screen flex flex-col justify-center px-6">
        <div className="max-w-7xl mx-auto w-full py-24">
          {/* Terminal badge */}
          <div className="animate-fade-up mb-8">
            <span className="font-mono text-xs text-[#888888] border border-[#2A2A2A] px-3 py-1.5 inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
              v1.0 — production ready
            </span>
          </div>

          {/* Massive headline */}
          <h1
            className="animate-fade-up delay-100 font-sans font-black leading-none tracking-tighter text-[#F0EBE1]"
            style={{ fontSize: "clamp(4rem, 14vw, 16rem)" }}
          >
            SHORT
            <span className="text-[#FF5C00]">.</span>
          </h1>

          {/* Sub-heading row */}
          <div className="animate-fade-up delay-200 mt-6 flex flex-col sm:flex-row items-start sm:items-end gap-6">
            <p className="text-[#888888] text-lg max-w-md leading-relaxed">
              A distributed URL shortener built for developers.
              <br />
              Sub-millisecond redirects. Real-time analytics. No bloat.
            </p>
            <div className="flex-1" />
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="font-mono text-sm bg-[#FF5C00] text-[#0A0A0A] px-8 py-4 font-bold hover:bg-[#CC4A00] transition-colors inline-flex items-center gap-2"
              >
                Start shortening
                <span className="text-[#0A0A0A]/60">→</span>
              </Link>
              <Link
                href="/login"
                className="font-mono text-sm text-[#F0EBE1] border border-[#2A2A2A] px-8 py-4 hover:border-[#3F3F3F] hover:bg-[#111111] transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="animate-fade-up delay-300 mt-16 border-t border-[#2A2A2A] pt-8 grid grid-cols-2 md:grid-cols-4 gap-0">
            {[
              { label: "Redirect latency", value: "<5ms" },
              { label: "Uptime", value: "99.9%" },
              { label: "Rate limit (Pro)", value: "100/min" },
              { label: "Token expiry", value: "15m / 7d" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border-r border-[#2A2A2A] last:border-r-0 px-6 first:pl-0"
              >
                <div className="font-mono text-2xl font-bold text-[#FF5C00]">
                  {stat.value}
                </div>
                <div className="font-mono text-xs text-[#555555] mt-1 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ──────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="font-mono text-xs text-[#FF5C00] uppercase tracking-widest">
              System capabilities
            </span>
            <h2 className="font-sans font-black text-3xl md:text-5xl text-[#F0EBE1] mt-2 tracking-tight">
              Built for scale.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.id}
                className="border border-[#2A2A2A] p-8 hover:border-[#FF5C00] hover:bg-[#111111] transition-all duration-200 group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="font-mono text-xs text-[#FF5C00] mb-4 tracking-widest">
                  {f.id}
                </div>
                <h3 className="font-sans font-bold text-lg text-[#F0EBE1] mb-3 group-hover:text-white transition-colors">
                  {f.title}
                </h3>
                <p className="font-mono text-xs text-[#555555] leading-relaxed group-hover:text-[#888888] transition-colors">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Strip ──────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[#2A2A2A] bg-[#FF5C00]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-sans font-black text-3xl md:text-5xl text-[#0A0A0A] tracking-tight leading-none">
              Your links.
              <br />
              Your data.
            </h2>
            <p className="font-mono text-sm text-[#0A0A0A]/70 mt-4">
              No trackers. No ads. No black-box algorithms.
            </p>
          </div>
          <Link
            href="/register"
            className="font-mono text-sm bg-[#0A0A0A] text-[#FF5C00] px-10 py-5 font-bold hover:bg-[#1A1A1A] transition-colors whitespace-nowrap inline-flex items-center gap-3"
          >
            Create free account
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="px-6 py-8 border-t border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-xs text-[#555555]">
            © 2025 DUS — Distributed URL Shortener
          </span>
          <div className="flex items-center gap-6">
            <Link href="/login" className="font-mono text-xs text-[#555555] hover:text-[#888888] transition-colors">
              Login
            </Link>
            <Link href="/register" className="font-mono text-xs text-[#555555] hover:text-[#888888] transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
