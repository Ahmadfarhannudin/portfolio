import { useEffect, useRef, useState } from "react";
import "./Reveal.css";

/* =========================================================
   Reveal — entrance animation CSS-only (tanpa JS loop).

   Lebih mulus dari framer-motion whileInView di HP kentang
   karena animasi jalan di compositor thread (GPU), bukan
   di main thread yang lagi sibuk (physics, WebGL, dll).

   Pakai: <Reveal delay={0.15} y={24}><Card /></Reveal>
========================================================= */

export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 24,
  as: Tag = "div",
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
      style={{
        "--reveal-delay": `${delay}s`,
        "--reveal-y": `${y}px`,
      }}
    >
      {children}
    </Tag>
  );
}
