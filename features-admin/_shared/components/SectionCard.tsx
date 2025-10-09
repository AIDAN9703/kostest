import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, subtitle, children, className = "" }: SectionCardProps) {
  return (
    <div className={`flex-1 flex flex-col bg-white rounded-2xl border border-gray-200/70 shadow-xs ${className}`}>
      <div className="flex-shrink-0 p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

