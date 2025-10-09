"use client"

import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/general-utils';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    return (
        <div className={cn(
            "w-full",
            !isHomePage && "mt-[80px]" // Only add padding on non-home pages
        )}>
            {children}
        </div>
    );
} 