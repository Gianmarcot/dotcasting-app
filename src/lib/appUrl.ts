/**
 * Base URL to use inside authentication emails (password reset, signup confirm).
 *
 * The Lovable preview origin (id-preview--...) is protected by Lovable's own
 * login wall, so links opened from an email would land on Lovable's sign-in
 * screen instead of the app. In that case we fall back to the published app.
 */
const PUBLISHED_URL = "https://dotcasting-app.lovable.app";

export function getAuthRedirectBase(): string {
  if (typeof window === "undefined") return PUBLISHED_URL;
  const { origin, hostname } = window.location;
  const isPreview =
    hostname.includes("id-preview--") ||
    hostname.includes("lovableproject.com") ||
    hostname === "localhost" ||
    hostname === "127.0.0.1";
  return isPreview ? PUBLISHED_URL : origin;
}
