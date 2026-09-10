import { permanentRedirect } from "next/navigation";

/**
 * Proposal links sent before September 2026 used /bookings/draft/…. They live
 * in customers' inboxes and texts, so they keep working — one permanent hop
 * to the current address.
 */
export default async function LegacyProposalLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  permanentRedirect(`/bookings/proposal/${token}`);
}
