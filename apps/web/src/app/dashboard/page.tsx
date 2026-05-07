import { ShortenForm } from "@/components/dashboard/ShortenForm";
import { UrlTable } from "@/components/dashboard/UrlTable";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Page header */}
      <div className="mb-8 animate-fade-up">
        <p className="font-mono text-xs text-[#FF5C00] uppercase tracking-widest mb-1">
          Dashboard
        </p>
        <h1 className="font-sans font-black text-3xl md:text-4xl text-[#F0EBE1] tracking-tight">
          Manage links.
        </h1>
      </div>

      {/* Shorten form */}
      <div className="mb-6 animate-fade-up delay-100">
        <ShortenForm />
      </div>

      {/* URL Table */}
      <div className="animate-fade-up delay-200">
        <UrlTable />
      </div>
    </div>
  );
}
