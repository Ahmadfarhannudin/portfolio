import { useEffect, useRef } from "react";
import "./ScrollProgressBar.css";

export default function ScrollProgressBar() {
  const barRef = useRef(null);

  // Progress aktual berdasarkan scroll
  const targetProgressRef = useRef(0);

  // Progress yang sedang ditampilkan
  const currentProgressRef = useRef(0);

  // RAF
  const rafRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    // =========================================================
    // GET SCROLL PROGRESS
    // =========================================================

    const getProgress = () => {
      const scrollTop =
        window.scrollY ||
        document.documentElement.scrollTop ||
        0;

      const scrollHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      if (scrollHeight <= 0) {
        return 0;
      }

      return Math.min(
        Math.max(
          scrollTop / scrollHeight,
          0
        ),
        1
      );
    };

    // =========================================================
    // UPDATE TARGET
    // =========================================================

    const updateTarget = () => {
      targetProgressRef.current =
        getProgress();
    };

    // =========================================================
    // SMOOTH ANIMATION
    // =========================================================

    const animate = () => {
      if (!mounted) return;

      const target =
        targetProgressRef.current;

      const current =
        currentProgressRef.current;

      /*
       * LERP
       *
       * Semakin kecil nilainya:
       * semakin lambat / smooth.
       *
       * 0.08 = sangat smooth
       * 0.10 = smooth
       * 0.15 = lebih responsif
       */

      const ease = 0.09;

      const next =
        current +
        (target - current) * ease;

      currentProgressRef.current =
        next;

      if (barRef.current) {
        barRef.current.style.transform =
          `scaleX(${next})`;
      }

      rafRef.current =
        requestAnimationFrame(animate);
    };

    // =========================================================
    // SCROLL HANDLER
    // =========================================================

    const onScroll = () => {
      updateTarget();
    };

    // =========================================================
    // RESIZE
    // =========================================================

    const onResize = () => {
      updateTarget();
    };

    // =========================================================
    // INITIAL
    // =========================================================

    updateTarget();

    /*
     * Mulai animation loop
     */

    rafRef.current =
      requestAnimationFrame(animate);

    // =========================================================
    // NATIVE SCROLL
    // =========================================================

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      onResize
    );

    // =========================================================
    // LENIS
    // =========================================================

    if (window.__lenis?.on) {
      window.__lenis.on(
        "scroll",
        onScroll
      );
    }

    // =========================================================
    // CLEANUP
    // =========================================================

    return () => {
      mounted = false;

      window.removeEventListener(
        "scroll",
        onScroll
      );

      window.removeEventListener(
        "resize",
        onResize
      );

      if (window.__lenis?.off) {
        window.__lenis.off(
          "scroll",
          onScroll
        );
      }

      if (rafRef.current) {
        cancelAnimationFrame(
          rafRef.current
        );

        rafRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className="scroll-progress-track"
      aria-hidden="true"
    >
      <div
        className="scroll-progress-fill"
        ref={barRef}
      />
    </div>
  );
}