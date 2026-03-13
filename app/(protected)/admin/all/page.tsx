import { auth } from "@/auth";
import { bookingService } from "@/features/bookings/booking.service";
import { inquiryService } from "@/features/inquiries/inquiry.service";
import AdminAllContent from "./AdminAllContent";

export default async function AllPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">Admin access required</p>
        </div>
      </div>
    );
  }

  const [bookingsResult, inquiriesResult] = await Promise.all([
    bookingService.getAllBookings({ limit: 100 }),
    inquiryService.getAllInquiries({ limit: 100 }),
  ]);

  const items = [
    ...bookingsResult.bookings.map((b) => {
      const needsAttention =
        b.bookingStatus === "PENDING" || b.bookingStatus === "DRAFT";
      return {
        id: b.id,
        type: "booking" as const,
        customerName: b.customerName || "N/A",
        customerEmail: b.customerEmail || "",
        date: b.startDateTime,
        status: b.bookingStatus,
        href: `/admin/bookings/${b.id}`,
        amount: b.totalAmountCents ? b.totalAmountCents / 100 : null,
        needsAttention,
        // Ops fields for inline editing on All page
        bookingId: b.id,
        opsDurationHours: b.opsDurationHours,
        opsExpenseCents: b.opsExpenseCents,
        opsRevenueCents: b.opsRevenueCents,
        opsBalanceOwnerCents: b.opsBalanceOwnerCents,
        opsBalanceClientCents: b.opsBalanceClientCents,
        opsCrewName: b.opsCrewName,
        opsContractSigned: b.opsContractSigned,
        opsCaptainPaid: b.opsCaptainPaid,
        opsAgentCode: b.opsAgentCode,
        opsCommissionCents: b.opsCommissionCents,
        opsSourceOverride: b.opsSourceOverride,
      };
    }),
    ...inquiriesResult.inquiries.map((i) => {
      const needsAttention =
        i.outcome === "OPEN" && i.stage === "NEEDS_CONTACT";
      return {
        id: i.id,
        type: "inquiry" as const,
        customerName: i.name,
        customerEmail: i.email,
        date: i.date ?? i.createdAt,
        status: i.stage,
        href: `/admin/inquiries/${i.id}`,
        amount: null as number | null,
        needsAttention,
      };
    }),
  ].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Everything at a glance
        </h1>
        <p className="mt-2 text-muted-foreground">
          Unified view of all bookings and inquiries. Filter, search, and sort
          to find what you need.
        </p>
      </div>

      <AdminAllContent items={items} />
    </div>
  );
}
