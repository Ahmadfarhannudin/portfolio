import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { MapPin } from "lucide-react";

const Globe3D = lazy(() => import("./ui/3d-globe").then(m => ({ default: m.Globe3D })));
import "./Wishlist.css";

/* =========================================================
   SINGLE SOURCE OF TRUTH
   Polaroid + marker globe dibuat dari data yang sama,
   jadi isi wishlist dan globe selalu cocok.
   lat/lng juga dipakai tombol "Lihat di Maps".
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
].map((item) => ({
  ...item,
  thumb: item.image,
}));

/* Urutan rute di globe (berdasarkan id) */
const ROUTE_ORDER = [9, 4, 3, 7, 8, 5, 6, 1, 2];

const wishlistMarkers = ROUTE_ORDER.map((id) => {
  const item = WISHLIST.find((w) => w.id === id);
  return {
    id: item.id,
    lat: item.lat,
    lng: item.lng,
    label: item.title,
    location: item.location,
    mapsQuery: item.mapsQuery, // baris baru
    mapsUrl: item.mapsUrl,     // opsional, lihat bagian 4
    image: item.thumb,
  };
});

// Arc menyambung berurutan dan menutup loop di akhir
const wishlistArcs = wishlistMarkers.map((_, i) => [
  i,
  (i + 1) % wishlistMarkers.length,
]);

/* =========================================================
   GRID LAYOUT GENERATOR
   Jumlah posisi selalu sama dengan jumlah kartu, lebar stage
   dihitung dari kartu sehingga tidak melebar ke area globe.
========================================================= */

const CARD_RATIO = 1.32; // tinggi kartu = lebar * rasio (sesuaikan bila CSS berbeda)
const JITTER = [
  [0, 4], [4, -4], [-3, 3], [4, -3], [-4, 4],
  [3, -4], [-3, 3], [4, -4], [0, 3],
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
  desktop: buildLayout({ cols: 3, cardWidth: 150, gapX: 24, rowPitch: 212 }),
  laptop: buildLayout({ cols: 3, cardWidth: 135, gapX: 22, rowPitch: 192 }),
  tablet: buildLayout({ cols: 3, cardWidth: 160, gapX: 24, rowPitch: 224 }),
  mobile: buildLayout({ cols: 2, cardWidth: 140, gapX: 22, rowPitch: 200 }),
  smallMobile: buildLayout({ cols: 2, cardWidth: 118, gapX: 18, rowPitch: 170 }),
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
  onDragStateChange,
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
        onDragStateChange?.(true);
        window.getSelection?.()?.removeAllRanges();
      }}
      onDrag={(_, info) => {
        const tilt = Math.max(-28, Math.min(28, info.velocity.x / 40));
        swing.set(item.rotate + tilt);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        unlockPage();
        onDragStateChange?.(false);
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
   GLOBE SECTION
   dragActive = true → pointer-events globe dimatikan
========================================================= */

function WishlistGlobe({ dragActive }) {
  const config = useMemo(
    () => ({
      radius: 1.55,
      globeColor: "#ffffff",
      textureUrl:
        "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
      bumpMapUrl:
        "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg",
      showAtmosphere: false,
      atmosphereIntensity: 0,
      bumpScale: 0.045,
      autoRotateSpeed: 0.18,
      enableZoom: true,
      minDistance: 4.3,
      maxDistance: 7,
      backgroundColor: null,
      markerSize: 0.045,

      showArcs: true,
      arcs: wishlistArcs,
      arcColor: "#38bdf8",
      arcOpacity: 0.45,
      arcHeight: 0.38,
      arcSpeed: 0.28,
      arcPulseColor: "#7fe3ff",
      arcPulseSize: 0.04,
      arcEndpointGlow: true,
      arcEndpointGlowColor: "#7fe3ff",
      arcEndpointGlowSpeed: 1.1,
    }),
    []
  );

  return (
    <motion.div
      className="wishlist-globe-area"
      style={{ pointerEvents: dragActive ? "none" : "auto" }}
      initial={{ opacity: 0, x: 80 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="wishlist-globe">
        <Suspense fallback={<div className="w-full h-full min-h-[350px]" />}>
          <Globe3D markers={wishlistMarkers} config={config} />
        </Suspense>
      </div>
    </motion.div>
  );
}

/* =========================================================
   MAIN WISHLIST
========================================================= */

export default function Wishlist() {
  const layout = useResponsiveLayout();
  const [dragActive, setDragActive] = useState(false);

  return (
    <>
      <section className="wishlist-section" id="wishlist">
        <div className="wishlist-container">
        {/* LEFT CONTENT */}
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
              maxWidth: "100%",
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
                onDragStateChange={setDragActive}
              />
            ))}

            <div className="wishlist-stage-hint">
              <span>drag the memories</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT GLOBE */}
        <WishlistGlobe dragActive={dragActive} />
      </div>
    </section>
    </>
  );
}