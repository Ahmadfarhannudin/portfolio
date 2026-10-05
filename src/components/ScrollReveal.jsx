import { motion } from "framer-motion";

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
  const getDirectionOffset = () => {
    switch (direction) {
      case "down":
        return { x: 0, y: -distance };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      case "zoom":
        return { x: 0, y: 0, scale: scale * 0.9 };
      case "up":
      default:
        return { x: 0, y: distance };
    }
  };
  const offset = getDirectionOffset();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y, scale: offset.scale ?? scale, filter: blur ? "blur(12px)" : "none" }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      onViewportEnter={onViewportEnter}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
