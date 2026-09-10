"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "../../lib/browser.js";

export function SmoothScrollProvider({ children }) {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    let frame = 0;
    let lenis;
    let cancelled = false;
    const stopLenis = () => lenis?.stop();
    const startLenis = () => lenis?.start();

    const boot = async () => {
      try {
        const Lenis = (await import("lenis")).default;
        if (cancelled) return;

        lenis = new Lenis({
          // 1.18s of easing on every wheel tick is what read as "lag": the page
          // kept gliding long after the gesture stopped. 0.72 keeps the smooth
          // feel while staying responsive.
          duration: 0.72,
          easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1.4,
          // Touch devices already scroll smoothly; running Lenis there costs
          // frames and fights the native gesture.
          syncTouch: false,
          smoothTouch: false,
        });
        window.__yairoLenis = lenis;

        if (document.documentElement.classList.contains("is-profile-open")) {
          lenis.stop();
        }

        const raf = (time) => {
          lenis?.raf(time);
          frame = requestAnimationFrame(raf);
        };

        frame = requestAnimationFrame(raf);
      } catch {
        document.documentElement.style.scrollBehavior = "smooth";
      }
    };

    document.addEventListener("yairo:lock-scroll", stopLenis);
    document.addEventListener("yairo:unlock-scroll", startLenis);
    boot();

    return () => {
      cancelled = true;
      document.removeEventListener("yairo:lock-scroll", stopLenis);
      document.removeEventListener("yairo:unlock-scroll", startLenis);
      if (frame) cancelAnimationFrame(frame);
      if (window.__yairoLenis === lenis) {
        delete window.__yairoLenis;
      }
      lenis?.destroy();
    };
  }, []);

  return children;
}
