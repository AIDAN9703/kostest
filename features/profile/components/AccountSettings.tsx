"use client";

import { useState } from "react";
import { User, Shield, Bell, CreditCard, MapPin, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { StripePortalButton } from "./StripePortalButton";
import { SettingsField } from "./SettingsField";
import { SettingsFieldGroup } from "./SettingsFieldGroup";
import { updateUserProfile } from "@/features/profile/actions/profile-actions";
import { UserProfile } from "@/features/profile/profile.types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils/general-utils";
import { emailSchema, phoneSchema } from "@/shared/lib/validation/common";
import { useToast } from "@/shared/lib/hooks/use-toast";

interface AccountSettingsProps {
  user: UserProfile;
}

type SettingsTab = "personal" | "address" | "security" | "notifications" | "payments";

const tabs = [
  { id: "personal" as SettingsTab, label: "Personal information", icon: User },
  { id: "address" as SettingsTab, label: "Address", icon: MapPin },
  { id: "security" as SettingsTab, label: "Login & security", icon: Shield },
  { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
  { id: "payments" as SettingsTab, label: "Payments", icon: CreditCard },
];

/**
 * Personal Information Tab Content
 */
function PersonalInfoTab({ user }: { user: UserProfile }) {
  const handleSave = async (field: string, value: string | null) => {
    const result = await updateUserProfile({ [field]: value });
    return result;
  };

  const handleSaveMultiple = async (fields: Record<string, string | null>) => {
    const result = await updateUserProfile(fields);
    return result;
  };

  return (
    <div className="space-y-0">
      <SettingsFieldGroup
        label="Legal name"
        displayValue={
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : null
        }
        fields={[
          {
            key: "firstName",
            label: "First name",
            placeholder: "Enter your first name",
            required: true,
          },
          {
            key: "lastName",
            label: "Last name",
            placeholder: "Enter your last name",
            required: true,
          },
        ]}
        values={{
          firstName: user.firstName || null,
          lastName: user.lastName || null,
        }}
        description="This is the name on your travel document."
        onSave={handleSaveMultiple}
      />
      <SettingsField
        label="Preferred first name"
        value={user.firstName || null}
        type="text"
        placeholder="Enter your first name"
        onSave={(value) => handleSave("firstName", value)}
      />
      <SettingsField
        label="Email address"
        value={user.email}
        type="email"
        maskValue
        onSave={async (value) => {
          // Validate email
          const result = emailSchema.safeParse(value);
          if (!result.success) {
            return { error: "Please enter a valid email address" };
          }
          return handleSave("email", value);
        }}
        required
      />
      <SettingsField
        label="Phone number"
        value={user.phoneNumber || null}
        type="tel"
        placeholder="+1 (555) 123-4567"
        maskValue
        description="Contact number for confirmed bookings and account security."
        onSave={async (value) => {
          if (value) {
            const result = phoneSchema.safeParse(value);
            if (!result.success) {
              return { error: "Please enter a valid phone number" };
            }
          }
          return handleSave("phoneNumber", value);
        }}
      />
      <SettingsField
        label="Bio"
        value={user.bio || null}
        type="textarea"
        placeholder="Tell us about yourself..."
        onSave={(value) => handleSave("bio", value)}
      />
    </div>
  );
}

/**
 * Address Tab Content - All fields grouped together
 */
function AddressTab({ user }: { user: UserProfile }) {
  const handleSaveMultiple = async (fields: Record<string, string | null>) => {
    const result = await updateUserProfile(fields);
    return result;
  };

  const addressParts = [
    (user as any).address,
    user.city,
    user.state,
    (user as any).postalCode,
    user.country,
  ].filter(Boolean);

  const displayValue = addressParts.length > 0 ? addressParts.join(", ") : null;

  return (
    <div className="space-y-0">
      <SettingsFieldGroup
        label="Residential address"
        displayValue={displayValue}
        fields={[
          {
            key: "country",
            label: "Country / region",
            placeholder: "United States",
          },
          {
            key: "address",
            label: "Street address",
            placeholder: "Enter street address",
          },
          {
            key: "city",
            label: "City / town",
            placeholder: "City",
            gridCols: 2,
          },
          {
            key: "state",
            label: "State / territory",
            placeholder: "State",
            gridCols: 2,
          },
          {
            key: "postalCode",
            label: "ZIP code",
            placeholder: "ZIP code",
          },
        ]}
        values={{
          country: user.country || null,
          address: (user as any).address || null,
          city: user.city || null,
          state: user.state || null,
          postalCode: (user as any).postalCode || null,
        }}
        onSave={handleSaveMultiple}
      />
    </div>
  );
}

/**
 * Security Tab Content
 */
function SecurityTab({ user }: { user: UserProfile }) {
  return (
    <div className="space-y-0">
      <div className="flex items-start justify-between py-4 border-b border-gray-200">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">Password</h3>
          <p className="text-sm mt-1 text-gray-900">••••••••</p>
          <p className="text-xs text-gray-500 mt-1">
            You can change your password here.
          </p>
        </div>
        <button className="text-sm text-gray-600 hover:text-gray-900 underline ml-4">
          Edit
        </button>
      </div>
      <div className="flex items-start justify-between py-4 border-b border-gray-200">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">Identity verification</h3>
          <p className="text-sm mt-1 text-gray-900">
            {user.identityVerified ? "Verified" : "Not verified"}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Notifications Tab Content
 */
function NotificationsTab({ user }: { user: UserProfile }) {
  return (
    <div className="space-y-0">
      <div className="py-4 border-b border-gray-200">
        <p className="text-sm text-gray-500">
          Notification settings coming soon.
        </p>
      </div>
    </div>
  );
}

/**
 * Payments Tab Content
 */
function PaymentsTab({ user }: { user: UserProfile }) {
  return (
    <div className="space-y-0">
      <div className="flex flex-col gap-2 py-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">
          Receipts & invoices
        </h3>
        <p className="text-sm text-gray-500">
          View payment history, download receipts, and manage payment methods.
        </p>
        <StripePortalButton />
      </div>
    </div>
  );
}

/**
 * Main Account Settings Component - Airbnb style
 */
export function AccountSettings({ user }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("personal");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [selectedMobileTab, setSelectedMobileTab] = useState<SettingsTab | null>(null);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  const renderTabContent = (tabId: SettingsTab) => {
    switch (tabId) {
      case "personal":
        return <PersonalInfoTab user={user} />;
      case "address":
        return <AddressTab user={user} />;
      case "security":
        return <SecurityTab user={user} />;
      case "notifications":
        return <NotificationsTab user={user} />;
      case "payments":
        return <PaymentsTab user={user} />;
      default:
        return <PersonalInfoTab user={user} />;
    }
  };

  const handleMobileTabClick = (tabId: SettingsTab) => {
    setSelectedMobileTab(tabId);
    setMobileSheetOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[600px]">
      {/* Mobile: List View Navigation */}
      <div className="lg:hidden">
        <h2 className="text-xl font-semibold mb-6">Account settings</h2>
        <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleMobileTabClick(tab.id)}
                className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{tab.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            );
          })}
        </div>

        {/* Mobile: Slide-in Sheet for Tab Content */}
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setMobileSheetOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <SheetTitle className="text-xl font-semibold">
                  {selectedMobileTab ? tabs.find((t) => t.id === selectedMobileTab)?.label : ""}
                </SheetTitle>
              </div>
            </SheetHeader>
            <div className="mt-6">
              {selectedMobileTab && renderTabContent(selectedMobileTab)}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Left Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200 pr-6">
        <h2 className="text-xl font-semibold mb-6">Account settings</h2>
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                  activeTab === tab.id
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Desktop: Right Content Area */}
      <div className="hidden lg:block flex-1 lg:pl-8">
        <div className="max-w-2xl">
          <h3 className="text-xl font-semibold mb-6">{activeTabData?.label}</h3>
          {renderTabContent(activeTab)}
        </div>
      </div>
    </div>
  );
}
