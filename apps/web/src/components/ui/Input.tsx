import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, mono = false, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-mono text-[#888888] uppercase tracking-widest"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full px-4 py-3 text-sm",
            "bg-[#111111] border border-[#2A2A2A]",
            "text-[#F0EBE1] placeholder:text-[#555555]",
            "focus:outline-none focus:border-[#FF5C00]",
            "transition-colors duration-150",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            mono ? "font-mono" : "",
            error ? "border-[#ef4444]" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {error && (
          <p className="text-xs text-[#ef4444] font-mono">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
