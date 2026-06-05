"use client";

import { Switch } from "@/shared/components/ui/switch";

export default function CharterDetailsForm() {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">Preferences</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Optional — you can change these anytime in your account.
        </p>
      </div>

      <div>
        <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
          <span className="text-sm text-foreground">
            Email me charter offers and news
          </span>
          <Switch defaultChecked aria-label="Email offers and news" />
        </label>

        <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
          <span className="text-sm text-foreground">
            Text me updates and reminders
          </span>
          <Switch aria-label="Text updates and reminders" />
        </label>
      </div>
    </section>
  );
}
