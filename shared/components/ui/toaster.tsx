"use client";

import { usePathname } from "next/navigation";
import { useToast } from "@/shared/lib/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/shared/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();
  // Toasts portal to <body>, outside the admin's token scope — stamping the
  // viewport keeps them dark in the admin (same pattern as every other
  // portaled admin surface) and light everywhere else.
  const pathname = usePathname();
  const inAdmin = pathname?.startsWith("/admin") ?? false;

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport className={inAdmin ? "admin-theme" : undefined} />
    </ToastProvider>
  );
}
