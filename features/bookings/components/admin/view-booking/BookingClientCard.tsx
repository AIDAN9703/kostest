"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Phone, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { updateBookingSingleField } from "@/features/bookings/booking.mutations";
import { useBookingEditMode } from "@/features/bookings/components/admin/view-booking/BookingEditMode";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { adminInitials } from "@/features/inquiries/inquiry-ui";

export interface BookingClientSnapshot {
  customerUserId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  profileImage: string | null;
  lifetimeBookingCount: number;
}

interface BookingClientCardProps {
  bookingId: string;
  client: BookingClientSnapshot;
}

/**
 * Who the booking is for. Read-only until the page-level Edit mode is on;
 * then the contact fields become a small form with one Save.
 */
export function BookingClientCard({ bookingId, client }: BookingClientCardProps) {
  const { editing } = useBookingEditMode();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(client.customerName);
  const [email, setEmail] = useState(client.customerEmail);
  const [phone, setPhone] = useState(client.customerPhone);

  const dirty =
    name !== client.customerName ||
    email !== client.customerEmail ||
    phone !== client.customerPhone;

  function handleSave() {
    startTransition(async () => {
      const updates: Array<{ field: string; value: string }> = [];
      if (name !== client.customerName) updates.push({ field: "customerName", value: name });
      if (email !== client.customerEmail) updates.push({ field: "customerEmail", value: email });
      if (phone !== client.customerPhone) updates.push({ field: "customerPhone", value: phone });

      for (const update of updates) {
        const res = await updateBookingSingleField(bookingId, update);
        if (!res.success) {
          toast({
            title: "Couldn't save client details",
            description: res.error,
            variant: "destructive",
          });
          return;
        }
      }
      toast({ title: "Client details saved" });
      router.refresh();
    });
  }

  const phoneDigits = client.customerPhone.replace(/[^\d+]/g, "");

  return (
    <Card className="rounded-2xl border border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Client</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            {client.profileImage ? (
              <AvatarImage src={client.profileImage} alt={client.customerName} />
            ) : null}
            <AvatarFallback className="text-sm">
              {adminInitials(client.customerName) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{client.customerName || "Unknown"}</p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {client.lifetimeBookingCount}{" "}
              {client.lifetimeBookingCount === 1 ? "lifetime booking" : "lifetime bookings"}
            </p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button
              size="sm"
              className="w-full gap-2"
              disabled={!dirty || isPending}
              onClick={handleSave}
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Save client details
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <ContactRow
              icon={Mail}
              value={client.customerEmail || "—"}
              href={client.customerEmail ? `mailto:${client.customerEmail}` : undefined}
            />
            <ContactRow
              icon={Phone}
              value={client.customerPhone || "—"}
              href={phoneDigits ? `tel:${phoneDigits}` : undefined}
            />
            {client.customerUserId ? (
              <Button asChild variant="outline" size="sm" className="mt-1 w-full gap-2">
                <Link href={`/admin/users/${client.customerUserId}`}>
                  <User className="h-3.5 w-3.5" />
                  View client profile
                </Link>
              </Button>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContactRow({
  icon: Icon,
  value,
  href,
}: {
  icon: typeof Mail;
  value: string;
  href?: string;
}) {
  const content = (
    <span className="flex min-w-0 items-center gap-2 text-sm">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{value}</span>
    </span>
  );
  if (!href) return content;
  return (
    <a href={href} className="block rounded-md transition-colors hover:text-primary-strong">
      {content}
    </a>
  );
}
