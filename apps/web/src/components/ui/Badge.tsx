type BadgeVariant = "active" | "inactive" | "pro" | "free" | "custom";

const styles: Record<BadgeVariant, string> = {
  active: "border-[#22c55e] text-[#22c55e]",
  inactive: "border-[#555555] text-[#555555]",
  pro: "border-[#FF5C00] text-[#FF5C00]",
  free: "border-[#888888] text-[#888888]",
  custom: "border-[#eab308] text-[#eab308]",
};

export function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5",
        "text-xs font-mono uppercase tracking-wider",
        "border",
        styles[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
