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

function normalizeWhatsAppPhone(value: unknown): string {
  if (typeof value !== "string") return "";

  let candidate = value.trim();
  if (!candidate) return "";

  if (/^https?:\/\//i.test(candidate)) {
    try {
      const url = new URL(candidate);
      if (url.protocol !== "https:" || url.username || url.password) return "";

      if (url.hostname === "wa.me") {
        candidate = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      } else if (
        (url.hostname === "api.whatsapp.com" ||
          url.hostname === "web.whatsapp.com") &&
        url.pathname === "/send"
      ) {
        candidate = url.searchParams.get("phone") ?? "";
      } else {
        return "";
      }
    } catch {
      return "";
    }
  }

  if (!/^\+?[\d\s().-]+$/.test(candidate)) return "";
  const digits = candidate.replace(/\D/g, "");
  const normalizedInput = digits.startsWith("00") ? digits.slice(2) : digits;
  if (/^01[0125]\d{8}$/.test(normalizedInput)) {
    return `20${normalizedInput.slice(1)}`;
  }
  if (/^201[0125]\d{8}$/.test(normalizedInput)) return normalizedInput;
  return /^\d{8,15}$/.test(normalizedInput) &&
    !normalizedInput.startsWith("0")
    ? normalizedInput
    : "";
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
    whatsapp: normalizeWhatsAppPhone(stored.whatsapp),
  };
}
