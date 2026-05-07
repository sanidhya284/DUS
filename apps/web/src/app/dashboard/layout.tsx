"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/lib/queries/useAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hydrateFromStorage, user } = useAuthStore();
  const logout = useLogout();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!isAuthenticated) {
      const token = localStorage.getItem("dus_access_token");
      if (!token) router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <span className="font-mono text-sm text-[#555555]">Authenticating…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Top nav */}
      <nav className="sticky top-0 z-40 border-b border-[#2A2A2A] bg-[#0A0A0A]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-mono text-sm text-[#FF5C00] font-bold tracking-widest uppercase hover:text-[#CC4A00] transition-colors">
            DUS
          </Link>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-[#555555] hidden sm:block">
              {user?.email}
            </span>
            <span className="font-mono text-xs border border-[#FF5C00] text-[#FF5C00] px-2 py-0.5 uppercase">
              {user?.plan ?? "free"}
            </span>
            <button
              onClick={logout}
              className="font-mono text-xs text-[#555555] hover:text-[#ef4444] transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
