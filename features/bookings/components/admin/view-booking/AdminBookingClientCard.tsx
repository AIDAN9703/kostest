"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Pencil, Phone, User } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { useToast } from "@/shared/lib/hooks/use-toast";
import { updateBookingSingleField } from "@/features/bookings/booking.mutations";
import { BookingDetailEditableRow } from "@/features/bookings/components/admin/view-booking/BookingDetailEditableRow";
import { useBookingSingleFieldEdit } from "@/features/bookings/components/admin/view-booking/use-booking-single-field-edit";

export type BookingClientSnapshot = {
  customerUserId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  profileImage: string | null;
  /** Bookings tied to the same user account (0 when guest / no userId). */
  lifetimeBookingCount: number;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function lifetimeLabel(count: number, hasAccount: boolean): string {
  if (!hasAccount) return "No linked account";
  if (count === 1) return "1 lifetime booking";
  return `${count} lifetime bookings`;
}

export function AdminBookingClientCard({
  bookingId,
  client,
}: {
  bookingId: string;
  client: BookingClientSnapshot;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    isPending,
    activeField,
    draft,
    setDraft,
    openField,
    cancelEdit,
    saveField,
  } = useBookingSingleFieldEdit(bookingId);

  const [, startNameTransition] = useTransition();
  const nameEditing = activeField === "customerName";
  const displayName = client.customerName?.trim() || "Unnamed client";
  const hasAccount = Boolean(client.customerUserId);
  const interactiveText =
    "text-foreground underline-offset-4 hover:text-primary hover:underline";

  function saveCustomerField() {
    saveField(() => {
      if (!activeField) return null;
      switch (activeField) {
        case "customerName":
          return { field: "customerName", value: String(draft ?? "").trim() };
        case "customerEmail":
          return { field: "customerEmail", value: String(draft ?? "").trim() };
        case "customerPhone":
          return { field: "customerPhone", value: String(draft ?? "").trim() };
        default:
          return null;
      }
    });
  }

  function saveNameOnly() {
    startNameTransition(async () => {
      try {
        const value = String(draft ?? "").trim();
        if (!value) {
          toast({
            variant: "destructive",
            title: "Name required",
            description: "Client name cannot be empty.",
          });
          return;
        }
        const result = await updateBookingSingleField(bookingId, {
          field: "customerName",
          value,
        });
        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Could not save",
            description: result.error ?? "Unknown error",
          });
          return;
        }
        toast({ title: "Saved", description: "Customer name updated." });
        cancelEdit();
        router.refresh();
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Error",
          description: e instanceof Error ? e.message : "Something went wrong",
        });
      }
    });
  }

  const nameLockedOut = activeField !== null && !nameEditing;

  return (
    <Card className="rounded-2xl border border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Client</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/60">
            {client.profileImage ? (
              <Image
                src={client.profileImage}
                alt={displayName}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/15 text-sm font-semibold text-foreground">
                {getInitials(displayName)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {!nameEditing ? (
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {hasAccount ? (
                    <Link
                      href={`/admin/users/${client.customerUserId}`}
                      className={`block truncate text-base font-semibold leading-tight ${interactiveText}`}
                    >
                      {displayName}
                    </Link>
                  ) : (
                    <p className="truncate text-base font-semibold leading-tight text-foreground">
                      {displayName}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {lifetimeLabel(client.lifetimeBookingCount, hasAccount)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                  disabled={nameLockedOut || isPending}
                  aria-label="Edit client name"
                  onClick={() => openField("customerName", client.customerName)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  value={String(draft ?? "")}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                  className="h-9"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isPending}
                    onClick={saveNameOnly}
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 border-t border-border/60 pt-4">
          <BookingDetailEditableRow
            field="customerEmail"
            label="Email"
            hideLabel
            activeField={activeField}
            isPending={isPending}
            onEdit={(field) => openField(field, client.customerEmail)}
            onSave={saveCustomerField}
            onCancel={cancelEdit}
            display={
              client.customerEmail ? (
                <a
                  href={`mailto:${client.customerEmail}`}
                  className={`flex items-center gap-2.5 ${interactiveText}`}
                >
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{client.customerEmail}</span>
                </a>
              ) : (
                <span className="flex items-center gap-2.5 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  —
                </span>
              )
            }
            editSlot={
              <Input
                type="email"
                value={String(draft ?? "")}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                className="h-9"
              />
            }
          />
          <BookingDetailEditableRow
            field="customerPhone"
            label="Phone"
            hideLabel
            activeField={activeField}
            isPending={isPending}
            onEdit={(field) => openField(field, client.customerPhone)}
            onSave={saveCustomerField}
            onCancel={cancelEdit}
            display={
              client.customerPhone ? (
                <a
                  href={`tel:${client.customerPhone.replace(/\s/g, "")}`}
                  className={`flex items-center gap-2.5 ${interactiveText}`}
                >
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{client.customerPhone}</span>
                </a>
              ) : (
                <span className="flex items-center gap-2.5 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  —
                </span>
              )
            }
            editSlot={
              <Input
                type="tel"
                value={String(draft ?? "")}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                className="h-9"
              />
            }
          />
        </div>

        {hasAccount ? (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/admin/users/${client.customerUserId}`}>
              <User className="mr-2 h-4 w-4" />
              View client profile
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
