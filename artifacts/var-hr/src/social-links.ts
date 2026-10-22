import type { PlatformSocialLinks } from "@workspace/api-client-react";

export type { PlatformSocialLinks };

export const EMPTY_SOCIAL_LINKS: PlatformSocialLinks = {
  facebook: "",
  instagram: "",
  linkedin: "",
  x: "",
  youtube: "",
  tiktok: "",
  whatsapp: "",
};

function isSafeSocialUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function normalizeSocialLinks(value: unknown): PlatformSocialLinks {
  const stored =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const normalize = (key: keyof PlatformSocialLinks) => {
    const candidate = typeof stored[key] === "string" ? stored[key].trim() : "";
    return candidate && isSafeSocialUrl(candidate) ? candidate : "";
  };

  return {
    facebook: normalize("facebook"),
    instagram: normalize("instagram"),
    linkedin: normalize("linkedin"),
    x: normalize("x"),
    youtube: normalize("youtube"),
    tiktok: normalize("tiktok"),
    whatsapp: normalize("whatsapp"),
  };
}
