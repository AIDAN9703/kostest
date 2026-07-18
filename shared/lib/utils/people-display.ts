/**
 * Display helpers for people (admins, customers) shared across admin surfaces.
 */

export type AdminOption = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  username?: string | null;
  profileImage: string | null;
};

export function adminDisplayName(a: Pick<AdminOption, "firstName" | "lastName" | "email">) {
  return [a.firstName, a.lastName].filter(Boolean).join(" ") || a.email;
}

export function adminInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
