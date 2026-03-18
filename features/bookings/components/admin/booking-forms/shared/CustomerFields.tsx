"use client";

import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { UserSelect } from "@/features/users/components/UserSelect";
import { User, UserCircle } from "lucide-react";

interface CustomerFieldsProps {
  customerType: "existing_user" | "guest";
  onCustomerTypeChange: (v: "existing_user" | "guest") => void;
  selectedUserId: string;
  onSelectedUserIdChange: (v: string) => void;
  customerName: string;
  onCustomerNameChange: (v: string) => void;
  customerEmail: string;
  onCustomerEmailChange: (v: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (v: string) => void;
  numberOfPassengers: number;
  onNumberOfPassengersChange: (v: number) => void;
}

export function CustomerFields({
  customerType,
  onCustomerTypeChange,
  selectedUserId,
  onSelectedUserIdChange,
  customerName,
  onCustomerNameChange,
  customerEmail,
  onCustomerEmailChange,
  customerPhone,
  onCustomerPhoneChange,
  numberOfPassengers,
  onNumberOfPassengersChange,
}: CustomerFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Customer type</Label>
        <RadioGroup
          value={customerType}
          onValueChange={(v) => onCustomerTypeChange(v as "existing_user" | "guest")}
          className="grid grid-cols-2 gap-2"
        >
          <Label
            htmlFor="customer-existing"
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
              customerType === "existing_user" ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <RadioGroupItem value="existing_user" id="customer-existing" className="sr-only" />
            <UserCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="text-left">
              <p className="font-medium">Existing user</p>
              <p className="text-xs text-muted-foreground">Link to account</p>
            </div>
          </Label>
          <Label
            htmlFor="customer-guest"
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
              customerType === "guest" ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <RadioGroupItem value="guest" id="customer-guest" className="sr-only" />
            <User className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="text-left">
              <p className="font-medium">Guest</p>
              <p className="text-xs text-muted-foreground">One-off booking</p>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {customerType === "existing_user" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select user</Label>
            <UserSelect
              value={selectedUserId}
              onChange={onSelectedUserIdChange}
              placeholder="Search by name or email..."
              allowCreate
            />
          </div>
          <div className="space-y-2">
            <Label>Passengers *</Label>
            <Input
              type="number"
              min={1}
              value={numberOfPassengers}
              onChange={(e) => onNumberOfPassengersChange(Number(e.target.value))}
              required
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Customer Name *</Label>
            <Input
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Client full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Customer Email *</Label>
            <Input
              type="email"
              value={customerEmail}
              onChange={(e) => onCustomerEmailChange(e.target.value)}
              placeholder="name@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Customer Phone</Label>
            <Input
              value={customerPhone}
              onChange={(e) => onCustomerPhoneChange(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label>Passengers *</Label>
            <Input
              type="number"
              min={1}
              value={numberOfPassengers}
              onChange={(e) => onNumberOfPassengersChange(Number(e.target.value))}
              required
            />
          </div>
        </div>
      )}
    </div>
  );
}
