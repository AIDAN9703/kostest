"use client"

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/general-utils';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    return (
        <div className={cn(
            "w-full",
            !isHomePage && "mt-[64px]" // Only add padding on non-home pages
        )}>
            {children}
        </div>
    );
} 