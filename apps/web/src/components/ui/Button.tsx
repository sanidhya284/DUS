import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[#FF5C00] text-[#0A0A0A] font-semibold hover:bg-[#CC4A00] active:scale-[0.98]",
  ghost:
    "bg-transparent text-[#F0EBE1] hover:bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3F3F3F]",
  danger:
    "bg-transparent text-[#ef4444] border border-[#ef4444] hover:bg-[#ef4444] hover:text-[#0A0A0A]",
  outline:
    "bg-transparent text-[#FF5C00] border border-[#FF5C00] hover:bg-[#FF5C00] hover:text-[#0A0A0A]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-4 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading, disabled, children, className = "", ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center gap-2 font-medium",
          "transition-all duration-150 cursor-pointer",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "focus-visible:outline-2 focus-visible:outline-[#FF5C00] focus-visible:outline-offset-2",
          variantStyles[variant],
          sizeStyles[size],
          className,
        ].join(" ")}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
