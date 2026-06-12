import { getAppSettings } from "@/features/app-settings/app-settings.service";
import { AdminSettingsClient } from "@/features/app-settings/components/AdminSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getAppSettings();
  return <AdminSettingsClient settings={settings} />;
}
