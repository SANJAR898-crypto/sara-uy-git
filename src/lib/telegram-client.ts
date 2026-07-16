"use client";

/**
 * Client-side helpers for interacting with the Telegram Mini App WebApp SDK.
 * All functions are safe to call outside of Telegram (plain browser preview) —
 * they simply no-op or fall back to web-standard behaviour.
 */

interface TelegramWebApp {
  initData: string;
  ready: () => void;
  expand: () => void;
  close?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  colorScheme?: string;
  themeParams?: Record<string, string>;
  openTelegramLink?: (url: string) => void;
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
  switchInlineQuery?: (query: string, choose_chat_types?: string[]) => void;
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  MainButton?: {
    text: string;
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    enable: () => void;
    disable: () => void;
  };
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function isInsideTelegram(): boolean {
  const webApp = getTelegramWebApp();
  return Boolean(webApp?.initData);
}

export function hapticTap(style: "light" | "medium" | "heavy" = "light") {
  getTelegramWebApp()?.HapticFeedback?.impactOccurred(style);
}

export function hapticSuccess() {
  getTelegramWebApp()?.HapticFeedback?.notificationOccurred("success");
}

/** Opens a t.me link either through the Telegram SDK (in-app) or a normal tab. */
export function openTelegramChat(username: string) {
  const url = `https://t.me/${username.replace(/^@/, "")}`;
  const webApp = getTelegramWebApp();
  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(url);
  } else if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/** Initiates a phone call via the tel: scheme. */
export function callPhone(phone: string) {
  if (typeof window !== "undefined") {
    window.location.href = `tel:${phone}`;
  }
}

/** Shares a URL — uses Telegram share sheet, Web Share API, or clipboard as fallback. */
export async function shareLink(url: string, text?: string): Promise<"telegram" | "webshare" | "clipboard" | "none"> {
  const webApp = getTelegramWebApp();
  if (webApp?.openTelegramLink) {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text ?? "")}`;
    webApp.openTelegramLink(shareUrl);
    return "telegram";
  }
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ url, text });
      return "webshare";
    } catch {
      /* user cancelled */
    }
  }
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    return "clipboard";
  }
  return "none";
}

/** Registers the Telegram BackButton to trigger `onBack`, hides it on unmount. */
export function useTelegramBackButtonHandler() {
  return { attach: attachBackButton };
}

function attachBackButton(onBack: () => void) {
  const webApp = getTelegramWebApp();
  if (!webApp?.BackButton) return () => {};
  webApp.BackButton.show();
  webApp.BackButton.onClick(onBack);
  return () => {
    webApp.BackButton?.offClick(onBack);
    webApp.BackButton?.hide();
  };
}

export { attachBackButton };
