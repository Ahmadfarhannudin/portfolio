/* =========================================================
   motion-lite — drop-in replacement untuk framer-motion.

   Di desktop: teruskan 100% ke framer-motion (animasi asli).
   Di HP (pointer: coarse): semua animasi entrance
   (initial/whileInView) diganti CSS reveal super ringan —
   tanpa JS loop, tanpa blur, tanpa spring. Scroll jadi mulus.

   Hooks & AnimatePresence tetap dari framer-motion asli.

   Pakai: ganti `from "framer-motion"` jadi `from "./motion"`
   (atau path relatif sesuai lokasi file).
========================================================= */

import {
  motion as fmMotion,
  AnimatePresence as FmAnimatePresence,
  useScroll as fmUseScroll,
  useSpring as fmUseSpring,
  useTransform as fmUseTransform,
  useMotionValue as fmUseMotionValue,
  useReducedMotion as fmUseReducedMotion,
  useInView as fmUseInView,
  useAnimation as fmUseAnimation,
  isMotionValue as fmIsMotionValue,
} from "framer-motion";
import { useEffect, useRef, useState, forwardRef } from "react";
import "./motion-lite.css";

export const AnimatePresence = FmAnimatePresence;
export const useScroll = fmUseScroll;
export const useSpring = fmUseSpring;
export const useTransform = fmUseTransform;
export const useMotionValue = fmUseMotionValue;
export const useReducedMotion = fmUseReducedMotion;
export const useInView = fmUseInView;
export const useAnimation = fmUseAnimation;

function useIsCoarse() {
  const [coarse, setCoarse] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const fn = (e) => setCoarse(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  return coarse;
}

/* Lite component: di HP, abaikan props animasi framer-motion,
   ganti dengan CSS reveal sekali jalan via IntersectionObserver. */
function makeLite(Tag) {
  const Lite = forwardRef(function Lite(
    {
      initial,
      whileInView,
      whileHover,
      whileTap,
      viewport,
      transition,
      onViewportEnter,
      ...props
    },
    ref
  ) {
    const coarse = useIsCoarse();
    const innerRef = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      if (!coarse) return;
      const el = innerRef.current;
      if (!el) return undefined;

      if (typeof IntersectionObserver === "undefined") {
        setVisible(true);
        return undefined;
      }

      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (onViewportEnter) onViewportEnter();
            io.disconnect();
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
      );

      io.observe(el);
      return () => io.disconnect();
    }, [coarse, onViewportEnter]);

    /* Desktop: framer-motion asli, tidak diubah */
    if (!coarse) {
      const FmTag = fmMotion[Tag];
      return (
        <FmTag
          ref={ref}
          initial={initial}
          whileInView={whileInView}
          whileHover={whileHover}
          whileTap={whileTap}
          viewport={viewport}
          transition={transition}
          onViewportEnter={onViewportEnter}
          {...props}
        />
      );
    }

    /* Jika style berisi MotionValue (mis. garis progress timeline),
       tetap pakai framer-motion asli walau di HP */
    const style = props.style;
    const hasMotionValue =
      style &&
      typeof style === "object" &&
      Object.values(style).some((v) => fmIsMotionValue(v));

    if (hasMotionValue) {
      const FmTag = fmMotion[Tag];
      return (
        <FmTag
          ref={ref}
          initial={initial}
          whileInView={whileInView}
          whileHover={whileHover}
          whileTap={whileTap}
          viewport={viewport}
          transition={transition}
          onViewportEnter={onViewportEnter}
          {...props}
        />
      );
    }

    /* HP: elemen biasa + CSS reveal ringan */
    const setRefs = (el) => {
      innerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    // whileHover/whileTap di HP tidak relevan (tidak ada hover)
    return (
      <Tag
        ref={setRefs}
        {...props}
        className={`${props.className || ""} lite-reveal${
          visible ? " lite-visible" : ""
        }`}
      />
    );
  });

  Lite.displayName = `Lite(${Tag})`;
  return Lite;
}

/* Tag yang dipakai di repo ini */
const tags = [
  "div",
  "span",
  "p",
  "h1",
  "h2",
  "h3",
  "article",
  "section",
  "li",
  "ul",
  "button",
  "a",
  "img",
];

export const motion = Object.fromEntries(
  tags.map((t) => [t, makeLite(t)])
);
