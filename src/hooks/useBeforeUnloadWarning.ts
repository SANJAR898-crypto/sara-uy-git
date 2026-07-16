"use client";

import { useEffect } from "react";

/** Warns the user with the browser's native confirm dialog before they leave
 * the page (reload / close tab) while `when` is true — e.g. an in-progress,
 * unsaved listing wizard. */
export function useBeforeUnloadWarning(when: boolean) {
  useEffect(() => {
    if (!when) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [when]);
}
