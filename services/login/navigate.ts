export type LoginRouter = {
  push: (href: string) => void;
  refresh: () => void;
};

/**
 * Same-origin paths use the App Router; absolute URLs on another host use full navigation.
 */
export function goAfterLogin(router: LoginRouter, redirectUrl: string): void {
  if (typeof window === "undefined") return;

  try {
    const resolved = new URL(redirectUrl, window.location.origin);
    const isSameOrigin = resolved.origin === window.location.origin;
    const path = `${resolved.pathname}${resolved.search}${resolved.hash}`;
    if (isSameOrigin) {
      router.push(path);
      router.refresh();
      return;
    }
  } catch {
    /* fall through */
  }

  if (redirectUrl.startsWith("/") && !redirectUrl.startsWith("//")) {
    router.push(redirectUrl);
    router.refresh();
    return;
  }

  window.location.assign(redirectUrl);
}
