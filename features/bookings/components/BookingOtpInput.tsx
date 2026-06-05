"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/shared/lib/utils/general-utils";

const CODE_LENGTH = 6;

interface BookingOtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function normalizeCode(raw: string) {
  return raw.replace(/\D/g, "").slice(0, CODE_LENGTH);
}

/**
 * Six visual digit boxes with one real input underneath for typing, paste,
 * and SMS autofill (`autoComplete="one-time-code"`).
 */
export function BookingOtpInput({ value, onChange, disabled }: BookingOtpInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const applyCode = (raw: string) => {
    onChange(normalizeCode(raw));
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={CODE_LENGTH}
        value={value}
        disabled={disabled}
        aria-label="Verification code"
        onChange={(e) => applyCode(e.target.value)}
        onPaste={(e) => {
          e.preventDefault();
          applyCode(e.clipboardData.getData("text"));
        }}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        className="absolute inset-0 z-10 h-full w-full cursor-text border-0 bg-transparent text-2xl font-semibold tracking-[0.55em] text-transparent caret-transparent outline-none selection:bg-transparent"
      />
      <div
        className="flex gap-2"
        onClick={() => inputRef.current?.focus()}
        aria-hidden
      >
        {Array.from({ length: CODE_LENGTH }).map((_, index) => {
          const digit = value[index] ?? "";
          const isActive = value.length === index;

          return (
            <div
              key={index}
              className={cn(
                "flex h-[3.25rem] flex-1 items-center justify-center rounded-2xl bg-gray-100 text-2xl font-semibold tabular-nums text-foreground transition-colors",
                digit && "bg-white",
                isActive && "bg-white ring-2 ring-gray-200/80",
              )}
            >
              {digit}
            </div>
          );
        })}
      </div>
    </div>
  );
}
