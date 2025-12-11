"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils/general-utils";
import {
  ADMIN_NAV_ITEMS,
  ADMIN_FOOTER_NAV_ITEMS,
} from "@/shared/lib/constants/navigation-data";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen transition-all duration-300 ease-in-out bg-primary text-white rounded-tr-3xl rounded-br-3xl",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 h-16">
        {!isCollapsed && (
          <Link href="/" className="flex items-center">
            <Image
              src="/icons/logo.png"
              alt="KOS Yachts Admin"
              width={32}
              height={32}
              className="mr-3"
            />
            <span className="text-lg font-semibold font-poppins">
              KOS Admin
            </span>
          </Link>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 text-white/80 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pl-2 overflow-y-auto font-poppins">
        <ul className="space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative isolate flex items-center px-3 py-2.5 text-white/85 hover:bg-white/10 rounded-tl-3xl rounded-bl-3xl transition-colors",
                    isActive &&
                      "text-primary bg-white hover:bg-white z-20 before:content-[''] after:content-[''] before:absolute after:absolute before:pointer-events-none after:pointer-events-none before:right-0 before:-top-8 after:right-0 after:-bottom-8 before:h-8 before:w-8 after:h-8 after:w-8 before:rounded-full after:rounded-full before:shadow-[16px_16px_0_0_white] after:shadow-[16px_-16px_0_0_white]",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0",
                      isActive ? "text-primary" : "text-white/80"
                    )}
                  >
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="ml-3 text-sm font-medium">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4">
        <ul className="space-y-1">
          {ADMIN_FOOTER_NAV_ITEMS.map((item) => {
            const isDanger = "variant" in item && item.variant === "danger";

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-md text-white/85 transition-colors",
                    isDanger
                      ? "hover:bg-red-500/10 hover:text-white"
                      : "hover:bg-white/10",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <span className="h-5 w-5 shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="ml-3 text-sm">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
