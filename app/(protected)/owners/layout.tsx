import { ReactNode } from "react";
import { requireOwner } from "@/shared/lib/utils/auth-utils";
import { QueryProvider } from "@/shared/lib/providers/QueryProvider";

export default async function OwnersLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireOwner();

  return (
    <QueryProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-poppins text-primary">
        <main>{children}</main>
      </div>
    </QueryProvider>
  );
}
