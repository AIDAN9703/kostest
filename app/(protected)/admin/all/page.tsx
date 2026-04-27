import { auth } from "@/auth";
import { bookingService } from "@/features/bookings/services/booking.service";
import { inquiryService } from "@/features/inquiries/inquiry.service";
import { userService } from "@/features/users/user.service";
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

  const [bookingsResult, inquiriesResult, admins] = await Promise.all([
    bookingService.getAllBookings({ limit: 100 }),
    inquiryService.getAllInquiries({ limit: 100 }),
    userService.getAdmins(),
  ]);

  const items = [
    ...bookingsResult.bookings.map((b) => ({
        id: b.id,
        type: "booking" as const,
        customerName: b.customerName || "N/A",
        customerEmail: b.customerEmail || "",
        customerPhone: b.customerPhone ?? null,
        /** Charter / trip start — used for sort and date range */
        sortDate: b.startDateTime,
        date: b.startDateTime,
        endDate: b.endDateTime ?? null,
        href: `/admin/bookings/${b.id}`,
        amount: b.totalAmountCents ? b.totalAmountCents / 100 : null,
        // Ops fields for inline editing on All page
        bookingId: b.id,
        totalAmountCents: b.totalAmountCents ?? null,
        opsExpenseCents: b.opsExpenseCents,
        opsGmvCents: b.opsGmvCents,
        opsPaidCents: b.opsPaidCents,
        opsSentToOwnerCents: b.opsSentToOwnerCents,
        opsCrewName: b.opsCrewName,
        opsContractSigned: b.opsContractSigned,
        opsConnected: b.opsConnected,
        opsClientPaid: b.opsClientPaid,
        opsCaptainPaid: b.opsCaptainPaid,
        opsAllPaid: b.opsAllPaid,
        opsSheetsSent: b.opsSheetsSent,
        opsAgentCode: b.opsAgentCode,
        opsCommissionAgentCents: b.opsCommissionAgentCents,
        opsCommissionKosCents: b.opsCommissionKosCents,
        opsCommissionCents: b.opsCommissionCents,
        opsSourceOverride: b.opsSourceOverride,
        assignedAdminId: b.assignedAdminId,
        adminAllRowHighlight: b.adminAllRowHighlight ?? null,
      })),
    ...inquiriesResult.inquiries.map((i) => ({
        id: i.id,
        type: "inquiry" as const,
        customerName: i.name,
        customerEmail: i.email,
        customerPhone: i.phone ?? null,
        /** Preferred trip date only — not request/created time */
        sortDate: i.date ?? null,
        date: i.date ?? i.createdAt,
        endDate: null,
        href: `/admin/inquiries/${i.id}`,
        amount: null as number | null,
        needsContact: i.outcome === "OPEN" && i.stage === "NEEDS_CONTACT",
        adminAllRowHighlight: i.adminAllRowHighlight ?? null,
      })),
  ].sort((a, b) => {
    if (!a.sortDate && !b.sortDate) return 0;
    if (!a.sortDate) return 1;
    if (!b.sortDate) return -1;
    return new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime();
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Everything at a glance
        </h1>
        <p className="mt-2 text-muted-foreground">
          Unified view of all bookings and inquiries. Filter, search, and sort to find what you
          need.
        </p>
      </div>

      <AdminAllContent items={items} admins={admins} />
    </div>
  );
}
