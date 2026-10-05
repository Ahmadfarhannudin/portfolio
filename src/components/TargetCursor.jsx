import { useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import "./TargetCursor.css";

/* ─── helpers ─────────────────────────────────────────── */

const getContainingBlock = (element) => {
  let node = element?.parentElement;
  while (node && node !== document.documentElement) {
    const s = getComputedStyle(node);
    if (
      s.transform !== "none" ||
      s.perspective !== "none" ||
      s.filter !== "none" ||
      s.willChange.includes("transform") ||
      s.willChange.includes("perspective") ||
      s.willChange.includes("filter") ||
      /paint|layout|strict|content/.test(s.contain)
    ) return node;
    node = node.parentElement;
  }
  return null;
};

const getOffset = (block) => {
  if (!block) return { x: 0, y: 0 };
  const r = block.getBoundingClientRect();
  return { x: r.left + block.clientLeft, y: r.top + block.clientTop };
};

/* point-in-rects check against querySelectorAll result */
const pointInAreas = (x, y, selector) => {
  const areas = document.querySelectorAll(selector);
  for (let i = 0; i < areas.length; i++) {
    const r = areas[i].getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return true;
  }
  return false;
};

/* ─── component ───────────────────────────────────────── */

const TargetCursor = ({
  targetSelector = ".masonry-item, .wishlist-polaroid",
  areaSelector   = ".wishlist-polaroid-stage, .masonry-section",
  spinDuration   = 2,
  hideDefaultCursor = true,
  hoverDuration  = 0.2,
  parallaxOn     = true,
  cursorColor    = "#ffffff",
  cursorColorOnTarget,
}) => {
  const cursorRef   = useRef(null);
  const cornersRef  = useRef(null);
  const dotRef      = useRef(null);
  const spinTl      = useRef(null);
  const cbRef       = useRef(null); // containing block

  /* live state refs */
  const visibleRef      = useRef(false);
  const snappedRef      = useRef(false);
  const strengthRef     = useRef(0);
  const tickerRef       = useRef(null);
  const activeTargetRef = useRef(null);
  const leaveHandlerRef = useRef(null);
  const mouseRef        = useRef({ x: -9999, y: -9999 });
  const origCursorRef   = useRef("");

  const C = useMemo(() => ({ bw: 3, cs: 12 }), []);

  /* ── show / hide DOM cursor ──────────────────────────── */
  const showCursor = useCallback(() => {
    if (visibleRef.current || !cursorRef.current) return;
    visibleRef.current = true;
    cursorRef.current.style.display = "block";
    origCursorRef.current = document.body.style.cursor;
    if (hideDefaultCursor) document.body.style.cursor = "none";
    document.body.classList.add("target-cursor-active");

    cbRef.current = getContainingBlock(cursorRef.current);
    cornersRef.current = cursorRef.current.querySelectorAll(".target-cursor-corner");
    const off = getOffset(cbRef.current);
    gsap.set(cursorRef.current, {
      xPercent: -50, yPercent: -50,
      x: mouseRef.current.x - off.x,
      y: mouseRef.current.y - off.y,
    });

    spinTl.current?.kill();
    spinTl.current = gsap.timeline({ repeat: -1 }).to(cursorRef.current, {
      rotation: "+=360", duration: spinDuration, ease: "none",
    });
  }, [hideDefaultCursor, spinDuration]);

  const hideCursor = useCallback(() => {
    if (!visibleRef.current) return;
    visibleRef.current = false;

    if (activeTargetRef.current && leaveHandlerRef.current) {
      activeTargetRef.current.removeEventListener("mouseleave", leaveHandlerRef.current);
      activeTargetRef.current = null;
      leaveHandlerRef.current = null;
    }
    if (tickerRef.current) {
      gsap.ticker.remove(tickerRef.current);
      tickerRef.current = null;
    }
    snappedRef.current = false;
    strengthRef.current = 0;

    spinTl.current?.kill();
    document.body.style.cursor = origCursorRef.current || "";
    document.body.classList.remove("target-cursor-active");
    if (cursorRef.current) cursorRef.current.style.display = "none";
  }, []);

  /* ── area watcher (mousemove + touchmove + scroll) ───── */
  useEffect(() => {
    const check = () => {
      const { x, y } = mouseRef.current;
      if (pointInAreas(x, y, areaSelector)) {
        showCursor();
      } else {
        hideCursor();
      }
    };

    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      check();
    };

    const onTouch = (e) => {
      if (e.touches && e.touches[0]) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        check();
      }
    };

    const onScroll = () => check();

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("scroll", onScroll);
      hideCursor();
    };
  }, [areaSelector, showCursor, hideCursor]);

  /* ── cursor follow ───────────────────────────────────── */
  useEffect(() => {
    const updatePos = (clientX, clientY) => {
      if (!visibleRef.current || !cursorRef.current) return;
      const off = getOffset(cbRef.current);
      gsap.to(cursorRef.current, {
        x: clientX - off.x,
        y: clientY - off.y,
        duration: 0.1,
        ease: "power3.out",
      });
    };

    const onMove = (e) => updatePos(e.clientX, e.clientY);
    const onTouch = (e) => {
      if (e.touches && e.touches[0]) {
        updatePos(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  /* ── target snap ─────────────────────────────────────── */
  useEffect(() => {
    const handleTargetOver = (targetEl) => {
      if (!visibleRef.current) return;

      let el = targetEl;
      let target = null;
      while (el && el !== document.body) {
        try { if (el.matches(targetSelector)) { target = el; break; } }
        catch (_) { break; }
        el = el.parentElement;
      }
      if (!target || target === activeTargetRef.current) return;

      if (activeTargetRef.current && leaveHandlerRef.current) {
        activeTargetRef.current.removeEventListener("mouseleave", leaveHandlerRef.current);
      }
      if (tickerRef.current) gsap.ticker.remove(tickerRef.current);

      activeTargetRef.current = target;
      snappedRef.current = true;
      strengthRef.current = 0;

      spinTl.current?.pause();
      gsap.killTweensOf(cursorRef.current, "rotation");
      gsap.set(cursorRef.current, { rotation: 0 });

      const corners = Array.from(cornersRef.current || []);
      if (cursorColorOnTarget) {
        gsap.to(corners, { borderColor: cursorColorOnTarget, duration: 0.15 });
        if (dotRef.current) gsap.to(dotRef.current, { backgroundColor: cursorColorOnTarget, duration: 0.15 });
      }

      const computeCornerPos = () => {
        const rect = target.getBoundingClientRect();
        const off  = getOffset(cbRef.current);
        const { bw, cs } = C;
        return [
          { x: rect.left  - bw        - off.x, y: rect.top    - bw        - off.y },
          { x: rect.right + bw - cs   - off.x, y: rect.top    - bw        - off.y },
          { x: rect.right + bw - cs   - off.x, y: rect.bottom + bw - cs   - off.y },
          { x: rect.left  - bw        - off.x, y: rect.bottom + bw - cs   - off.y },
        ];
      };

      let targetPos = computeCornerPos();

      const ticker = () => {
        if (!cursorRef.current || !cornersRef.current) return;
        const s  = strengthRef.current;
        if (s === 0) return;
        const cx = gsap.getProperty(cursorRef.current, "x");
        const cy = gsap.getProperty(cursorRef.current, "y");
        targetPos = computeCornerPos();
        corners.forEach((corner, i) => {
          const curX = gsap.getProperty(corner, "x");
          const curY = gsap.getProperty(corner, "y");
          gsap.to(corner, {
            x: curX + (targetPos[i].x - cx - curX) * s,
            y: curY + (targetPos[i].y - cy - curY) * s,
            duration: s >= 0.99 ? (parallaxOn ? 0.15 : 0) : 0.05,
            ease: "power1.out",
            overwrite: "auto",
          });
        });
      };
      tickerRef.current = ticker;
      gsap.ticker.add(ticker);

      gsap.to(strengthRef, { current: 1, duration: hoverDuration, ease: "power2.out" });

      const onLeave = () => {
        if (tickerRef.current) { gsap.ticker.remove(tickerRef.current); tickerRef.current = null; }
        activeTargetRef.current = null;
        leaveHandlerRef.current = null;
        snappedRef.current = false;
        strengthRef.current = 0;

        if (cursorColorOnTarget) {
          gsap.to(corners, { borderColor: cursorColor, duration: 0.15 });
          if (dotRef.current) gsap.to(dotRef.current, { backgroundColor: cursorColor, duration: 0.15 });
        }

        const { cs } = C;
        const positions = [
          { x: -cs * 1.5, y: -cs * 1.5 }, { x: cs * 0.5, y: -cs * 1.5 },
          { x: cs * 0.5,  y: cs * 0.5  }, { x: -cs * 1.5, y: cs * 0.5  },
        ];
        corners.forEach((corner, i) =>
          gsap.to(corner, { x: positions[i].x, y: positions[i].y, duration: 0.3, ease: "power3.out" })
        );

        setTimeout(() => {
          if (!activeTargetRef.current && cursorRef.current) {
            spinTl.current?.kill();
            spinTl.current = gsap.timeline({ repeat: -1 }).to(cursorRef.current, {
              rotation: "+=360", duration: spinDuration, ease: "none",
            });
          }
        }, 50);
      };

      leaveHandlerRef.current = onLeave;
      target.addEventListener("mouseleave", onLeave, { once: true });
    };

    const onOver = (e) => handleTargetOver(e.target);
    const onTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        const targetElement = document.elementFromPoint(
          e.touches[0].clientX,
          e.touches[0].clientY
        );
        if (targetElement) handleTargetOver(targetElement);
      }
    };

    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    return () => {
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("touchstart", onTouchStart);
    };
  }, [targetSelector, C, spinDuration, hoverDuration, parallaxOn, cursorColor, cursorColorOnTarget]);

  /* ── click / tap feedback ────────────────────────────── */
  useEffect(() => {
    const dn = () => {
      if (!visibleRef.current) return;
      gsap.to(dotRef.current,   { scale: 0.7, duration: 0.2 });
      gsap.to(cursorRef.current, { scale: 0.9, duration: 0.2 });
    };
    const up = () => {
      if (!visibleRef.current) return;
      gsap.to(dotRef.current,   { scale: 1, duration: 0.2 });
      gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
    };
    window.addEventListener("mousedown", dn);
    window.addEventListener("mouseup",   up);
    window.addEventListener("touchstart", dn, { passive: true });
    window.addEventListener("touchend",   up, { passive: true });
    return () => {
      window.removeEventListener("mousedown", dn);
      window.removeEventListener("mouseup",   up);
      window.removeEventListener("touchstart", dn);
      window.removeEventListener("touchend",   up);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div ref={cursorRef} className="target-cursor-wrapper" style={{ display: "none" }}>
      <div ref={dotRef} className="target-cursor-dot" style={{ backgroundColor: cursorColor }} />
      <div className="target-cursor-corner corner-tl" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-tr" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-br" style={{ borderColor: cursorColor }} />
      <div className="target-cursor-corner corner-bl" style={{ borderColor: cursorColor }} />
    </div>,
    document.body
  );
};

export default TargetCursor;
