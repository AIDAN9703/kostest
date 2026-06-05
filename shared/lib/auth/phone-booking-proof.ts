import { createHmac, timingSafeEqual } from "crypto";

const TTL_MS = 5 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return secret;
}

export function createPhoneBookingProof(userId: string, phone: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = `${userId}|${phone}|${exp}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}

export function verifyPhoneBookingProof(
  proof: string,
): { userId: string; phone: string } | null {
  try {
    const decoded = Buffer.from(proof, "base64url").toString("utf8");
    const lastPipe = decoded.lastIndexOf("|");
    if (lastPipe === -1) return null;

    const payload = decoded.slice(0, lastPipe);
    const sig = decoded.slice(lastPipe + 1);
    const expected = createHmac("sha256", getSecret())
      .update(payload)
      .digest("hex");

    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const [userId, phone, expStr] = payload.split("|");
    if (!userId || !phone || !expStr) return null;
    if (Date.now() > Number(expStr)) return null;

    return { userId, phone };
  } catch {
    return null;
  }
}
