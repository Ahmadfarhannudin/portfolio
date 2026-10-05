import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  duration = 0.85,
  direction = "up",
  distance = 45,
  scale = 0.96,
  blur = true,
  amount = 0.12,
  onViewportEnter,
}) => {
  // Di HP: matikan animasi blur (GPU killer) & percepat durasi
  const [isCoarse, setIsCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsCoarse(mq.matches);
    const fn = (e) => setIsCoarse(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  const reduceMotion = useReducedMotion();

  const effectiveBlur = blur && !isCoarse;
  // Percepat ~40% di HP agar scroll terasa ringan
  const effectiveDuration = isCoarse ? Math.max(0.3, duration * 0.6) : duration;
  const effectiveDistance = isCoarse ? Math.round(distance * 0.6) : distance;
  const effectiveDelay = isCoarse ? delay * 0.5 : delay;
  const getDirectionOffset = () => {
    switch (direction) {
      case "down":
        return { x: 0, y: -effectiveDistance };
      case "left":
        return { x: effectiveDistance, y: 0 };
      case "right":
        return { x: -effectiveDistance, y: 0 };
      case "zoom":
        return { x: 0, y: 0, scale: scale * 0.9 };
      case "up":
      default:
        return { x: 0, y: effectiveDistance };
    }
  };
  const offset = getDirectionOffset();
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y, scale: offset.scale ?? scale, filter: effectiveBlur ? "blur(12px)" : "none" }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      onViewportEnter={onViewportEnter}
      transition={{ duration: effectiveDuration, delay: effectiveDelay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
