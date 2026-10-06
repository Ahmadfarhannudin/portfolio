import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "./motion";
import { MapPin } from "lucide-react";
import "./Wishlist.css";

/* =========================================================
   WISHLIST DATA
========================================================= */

import allianzArena from "../assets/portfolio/wislist/Allianz Arena jerman.jfif";
import bandaNeira from "../assets/portfolio/wislist/Banda Neira,Maluku, Indonesia.jfif";
import gunungFuji from "../assets/portfolio/wislist/Gunung Fuji, Jepang.jfif";
import gunungRinjani from "../assets/portfolio/wislist/Gunung rinjani,NTT, Indonesia.jfif";
import labuanBajo from "../assets/portfolio/wislist/Labuan Bajo, NTT, Indonesia.jfif";
import lauterbrunnen from "../assets/portfolio/wislist/Lauterbrunnen, Switzerland.jfif";
import lofotenIslands from "../assets/portfolio/wislist/Lofoten Islands, Norway.jfif";
import mekkah from "../assets/portfolio/wislist/Mekkah.jfif";
import ranuKumbolo from "../assets/portfolio/wislist/Ranu Kumbolo, Semeru, Indonesia.jfif";

const WISHLIST = [
  { id: 1, title: "Ranu Kumbolo, Semeru, Indonesia", location: "Ranu Kumbolo, Jawa Timur, Indonesia", image: ranuKumbolo, rotate: -7, lat: -8.0187, lng: 112.9517, mapsQuery: "Ranu Kumbolo" },
  { id: 2, title: "Mekkah", location: "Mekkah, Arab Saudi", image: mekkah, rotate: 5, lat: 21.4225, lng: 39.8262, mapsQuery: "Masjid al-Haram" },
  { id: 3, title: "Lofoten Islands, Norway", location: "Reine, Lofoten, Nordland, Norwegia", image: lofotenIslands, rotate: -4, lat: 67.9326, lng: 13.0890, mapsQuery: "Reine, Lofoten" },
  { id: 4, title: "Lauterbrunnen, Switzerland", location: "Lauterbrunnen, Swiss", image: lauterbrunnen, rotate: 6, lat: 46.5937, lng: 7.9091, mapsQuery: "Lauterbrunnen" },
  { id: 5, title: "Labuan Bajo, NTT, Indonesia", location: "Labuan Bajo, Nusa Tenggara Timur, Indonesia", image: labuanBajo, rotate: -5, lat: -8.4960, lng: 119.8877, mapsQuery: "Labuan Bajo" },
  { id: 6, title: "Gunung Rinjani, NTB, Indonesia", location: "Gunung Rinjani, Nusa Tenggara Barat, Indonesia", image: gunungRinjani, rotate: 3, lat: -8.4113, lng: 116.4572, mapsQuery: "Gunung Rinjani" },
  { id: 7, title: "Gunung Fuji, Jepang", location: "Gunung Fuji, Jepang", image: gunungFuji, rotate: -3, lat: 35.3606, lng: 138.7274, mapsQuery: "Gunung Fuji" },
  { id: 8, title: "Banda Neira, Maluku, Indonesia", location: "Banda Neira, Maluku, Indonesia", image: bandaNeira, rotate: 4, lat: -4.5219, lng: 129.8967, mapsQuery: "Banda Neira" },
  { id: 9, title: "Allianz Arena, Jerman", location: "Allianz Arena, München, Jerman", image: allianzArena, rotate: -5, lat: 48.2188, lng: 11.6247, mapsQuery: "Allianz Arena" },
];

/* =========================================================
   GRID LAYOUT GENERATOR
========================================================= */

const CARD_RATIO = 1.32; // tinggi kartu = lebar * rasio (sesuaikan bila CSS berbeda)
const JITTER = [
  [-2, 3],
  [2, -2],
  [-2, 2],

  [2, -3],
  [-2, 3],
  [2, -2],

  [-2, 2],
  [2, -3],
  [-1, 3],
];

function buildLayout({ cols, cardWidth, gapX, rowPitch, count = WISHLIST.length }) {
  const rows = Math.ceil(count / cols);
  const pitchX = cardWidth + gapX;
  const stageWidth = cols * cardWidth + (cols - 1) * gapX;
  const stageHeight = Math.round(
    (rows - 1) * rowPitch + cardWidth * CARD_RATIO + 36
  );

  const positions = Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const inRow = Math.min(cols, count - row * cols);
    const rowOffset = ((cols - inRow) * pitchX) / 2; // baris terakhir ditengahkan
    const [jx, jy] = JITTER[i % JITTER.length];
    return {
      x: Math.round(rowOffset + col * pitchX + jx),
      y: Math.round(row * rowPitch + jy),
    };
  });

  return { stageWidth, stageHeight, cardWidth, positions };
}

const LAYOUTS = {
  /*
   * DESKTOP
   * 3 kolom dengan jarak yang seimbang.
   */
  desktop: buildLayout({
    cols: 3,
    cardWidth: 175,
    gapX: 52,
    rowPitch: 265,
  }),

  /*
   * LAPTOP
   */
  laptop: buildLayout({
    cols: 3,
    cardWidth: 158,
    gapX: 40,
    rowPitch: 235,
  }),

  /*
   * TABLET
   */
  tablet: buildLayout({
    cols: 3,
    cardWidth: 150,
    gapX: 30,
    rowPitch: 225,
  }),

  /*
   * MOBILE
   */
  mobile: buildLayout({
    cols: 2,
    cardWidth: 140,
    gapX: 24,
    rowPitch: 200,
  }),

  /*
   * SMALL MOBILE
   */
  smallMobile: buildLayout({
    cols: 2,
    cardWidth: 118,
    gapX: 18,
    rowPitch: 170,
  }),
};

/* =========================================================
   BREAKPOINT HOOK
========================================================= */

function getBreakpoint(width) {
  if (width <= 390) return "smallMobile";
  if (width <= 600) return "mobile";
  if (width <= 900) return "tablet";
  if (width <= 1150) return "laptop";
  return "desktop";
}

function useResponsiveLayout() {
  const [breakpoint, setBreakpoint] = useState(() =>
    typeof window !== "undefined"
      ? getBreakpoint(window.innerWidth)
      : "desktop"
  );

  useEffect(() => {
    let rafId = null;

    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setBreakpoint(getBreakpoint(window.innerWidth));
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return LAYOUTS[breakpoint];
}

/* =========================================================
   TYPEWRITER TITLE
========================================================= */

function TypewriterTitle() {
  const text = "My Wishlist";

  return (
    <div className="wishlist-title-wrap">
      <motion.div
        className="wishlist-title-line"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />

      <h2 className="wishlist-title">
        {text.split("").map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: index * 0.055, duration: 0.35 }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </h2>
    </div>
  );
}

/* =========================================================
   DRAGGABLE POLAROID (throw + tilt + glare, tanpa bocor)
========================================================= */

function DraggablePolaroid({
  item,
  position,
  cardWidth,
  stageWidth,
  stageHeight,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const spring = { stiffness: 140, damping: 18, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [14, -14]), spring);
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-14, 14]), spring);
  const glareOpacity = useSpring(
    useTransform(mouseX, [-100, 0, 100], [0.28, 0, 0.28]),
    spring
  );
  const swing = useSpring(item.rotate, { stiffness: 120, damping: 12, mass: 0.6 });

  const cardHeight = cardWidth * CARD_RATIO;
  const pad = 12;
  const constraints = {
    left: -position.x - pad,
    right: stageWidth - position.x - cardWidth + pad,
    top: -position.y - pad,
    bottom: stageHeight - position.y - cardHeight + pad,
  };

  const handleMouseMove = (e) => {
    if (isDragging || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  };

  const resetTilt = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Cegah seleksi teks & scroll halaman selama drag
  const lockPage = () => {
    document.body.classList.add("wishlist-dragging");
    window.__lenis?.stop?.();
  };
  const unlockPage = () => {
    document.body.classList.remove("wishlist-dragging");
    window.__lenis?.start?.();
  };

  // Pastikan terbuka lagi kalau komponen unmount saat drag
  useEffect(() => () => unlockPage(), []);

  return (
    <motion.div
      ref={cardRef}
      className={`wishlist-polaroid cursor-target ${isDragging ? "is-dragging" : ""}`}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: cardWidth,
        x,
        y,
        rotate: swing,
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
        zIndex: isDragging ? 100 : 1,
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        cursor: isDragging ? "grabbing" : "grab",
        "--initial-rotate": `${item.rotate}deg`,
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      whileHover={isDragging ? undefined : { scale: 1.03 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      onPointerDown={(e) => e.stopPropagation()}
      onDragStartCapture={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      drag
      dragConstraints={constraints}
      dragElastic={0.18}
      dragMomentum
      dragTransition={{
        power: 0.35,
        timeConstant: 260,
        bounceStiffness: 220,
        bounceDamping: 18,
      }}
      whileDrag={{ scale: 1.1 }}
      onDragStart={() => {
        setIsDragging(true);
        resetTilt();
        lockPage();
        window.getSelection?.()?.removeAllRanges();
      }}
      onDrag={(_, info) => {
        const tilt = Math.max(-28, Math.min(28, info.velocity.x / 40));
        swing.set(item.rotate + tilt);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        unlockPage();
        swing.set(item.rotate);
      }}
    >
      <div className="wishlist-polaroid-photo" style={{ position: "relative" }}>
        <img src={item.image} alt={item.title} draggable="false" loading="lazy" decoding="async" />
        <div className="wishlist-photo-overlay" />
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: glareOpacity,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%)",
            mixBlendMode: "overlay",
          }}
        />
      </div>

      <div className="wishlist-polaroid-info">
        <h3>{item.title}</h3>
        <div className="wishlist-polaroid-location">
          <MapPin size={12} strokeWidth={2.2} />
          <span>{item.location}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   MAIN WISHLIST
========================================================= */

export default function Wishlist() {
  const layout = useResponsiveLayout();

  return (
    <section className="wishlist-section" id="wishlist">
      <div className="wishlist-container">
        <div className="wishlist-content">
          <motion.div
            className="wishlist-eyebrow"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <span className="wishlist-eyebrow-dot" />
            <span>TRAVEL &amp; DREAMS</span>
          </motion.div>

          <TypewriterTitle />

          <motion.p
            className="wishlist-description"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            A collection of places I dream of visiting, capturing
            moments, landscapes, and experiences I want to discover
            someday.
          </motion.p>

          <motion.div
            className="wishlist-polaroid-stage"
            style={{
              position: "relative",
              width: layout.stageWidth,
              height: layout.stageHeight,
              overflow: "visible",
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5 }}
          >
            {WISHLIST.map((item, index) => (
              <DraggablePolaroid
                key={item.id}
                item={item}
                position={layout.positions[index]}
                cardWidth={layout.cardWidth}
                stageWidth={layout.stageWidth}
                stageHeight={layout.stageHeight}
              />
            ))}

            <div className="wishlist-stage-hint">
              <span>drag the memories</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}