import ImageKit from "imagekit";

/**
 * Server-only ImageKit client (uploads, file management).
 *
 * Never import this from client components — the private key must stay on the
 * server. Client-safe URL helpers live in `imagekit.service.ts`.
 */
let client: ImageKit | null = null;

export function getImageKit(): ImageKit {
  if (!client) {
    client = new ImageKit({
      publicKey:
        process.env.IMAGEKIT_PUBLIC_KEY ||
        process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
        "",
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
      urlEndpoint:
        process.env.IMAGEKIT_URL_ENDPOINT ||
        process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
        "",
    });
  }
  return client;
}
