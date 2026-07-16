/** Class that scopes admin CSS variables onto an element (for portaled UI). */
export function adminShellClassName() {
  return "admin-theme";
}

/** Whether the live page is inside the admin shell (client-only). */
export function isAdminShellActive(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(document.querySelector("[data-admin-theme]"));
}
