import Image from "next/image";
import { AvatarFallback } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils/general-utils";

interface DefaultUserAvatarFallbackProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
};

export function DefaultUserAvatarFallback({
  size = "md",
  className,
}: DefaultUserAvatarFallbackProps) {
  const iconSize = sizeMap[size];

  return (
    <AvatarFallback
      className={cn("bg-gray-100 flex items-center justify-center", className)}
    >
      <Image
        src="/icons/user.svg"
        alt="User"
        width={iconSize}
        height={iconSize}
        className="opacity-60"
      />
    </AvatarFallback>
  );
}
