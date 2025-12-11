"use client";

import { ReactNode, useEffect, useRef } from "react";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Dropdown({ isOpen, onClose, children, className = "" }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200/70 py-2 z-50 ${className}`}
    >
      {children}
    </div>
  );
}

interface DropdownItemProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  variant?: "default" | "danger";
}

export function DropdownItem({ onClick, icon, label, variant = "default" }: DropdownItemProps) {
  const baseStyles = "flex items-center px-4 py-2.5 text-sm transition-all rounded-lg mx-2 my-1";
  const variantStyles = variant === "danger"
    ? "text-red-600 hover:bg-red-50 font-semibold"
    : "text-gray-700 hover:bg-gray-50 font-medium";

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} w-full`}
    >
      <span className={`mr-3 h-4 w-4 ${variant === "danger" ? "text-red-500" : "text-primary"}`}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function DropdownDivider() {
  return <div className="border-t border-gray-100 my-2 mx-2" />;
}

export function DropdownHeader({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-2 border-b border-gray-100">
      <span className="text-xs font-bold text-primary uppercase tracking-wide">
        {children}
      </span>
    </div>
  );
}

