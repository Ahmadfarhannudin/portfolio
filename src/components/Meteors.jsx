import { motion } from "framer-motion";
import "./Meteors.css";

const meteorData = Array.from({ length: 12 }, (_, index) => ({
  id: index,

  // lebih banyak muncul dari area kiri
  top: Math.random() * 80 - 10,
  left: Math.random() * 80 - 20,

  delay: Math.random() * 8,
  duration: Math.random() * 2 + 3,
  scale: Math.random() * 0.5 + 0.7,
}));

export default function Meteors({ number = 8 }) {
  const items = meteorData.slice(
    0,
    Math.min(number, meteorData.length)
  );

  return (
    <div className="meteors-container">
      {items.map((meteor) => (
        <motion.span
          key={meteor.id}
          className="meteor"
          style={{
            top: `${meteor.top}%`,
            left: `${meteor.left}%`,
            scale: meteor.scale,
          }}
          initial={{
            transform: "rotate(45deg) translateX(0)",
            opacity: 0,
          }}
          animate={{
            transform: "rotate(45deg) translateX(500px)",
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: meteor.duration,
            delay: meteor.delay,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}