import { useRef } from "react";
import { useIsCoarsePointer } from "../hooks/useMediaQuery";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

import {
  GraduationCap,
  Briefcase,
} from "lucide-react";

import "./Timeline.css";

/* =========================================================
   TIMELINE DATA
========================================================= */

const timelineData = [
  {
    type: "education",
    period: "2024 - Sekarang",
    title: "Teknik Informatika",
    place: "Universitas Teknologi Bandung",
    description:
      "Mendalami dasar ilmu komputer, pemrograman, basis data, dan pengembangan aplikasi melalui perkuliahan serta proyek.",
    tags: [
      "Pemrograman",
      "Basis Data",
      "Algoritma",
      "Pengembangan Aplikasi",
    ],
  },

  {
    type: "work",
    period: "Praktik Kerja Lapangan (PKL)",
    title: "Peserta PKL",
    place: "PT Metanouva Informatika",
    description:
      "Mendapat pengalaman kerja di lingkungan perusahaan teknologi informasi, menerapkan keterampilan pemrograman, membantu pengerjaan tugas teknis, dan berkolaborasi dalam tim.",
    tags: [
      "Pemrograman",
      "Pengembangan Perangkat Lunak",
      "Kerja Tim",
    ],
  },

  {
    type: "education",
    period: "2021 - 2024",
    title: "Rekayasa Perangkat Lunak",
    place: "SMK Wiraswasta",
    description:
      "Mempelajari proses pembuatan perangkat lunak, mulai dari logika pemrograman dan perancangan aplikasi hingga pengelolaan basis data.",
    tags: [
      "Pemrograman",
      "Basis Data",
      "Perancangan Aplikasi",
      "Web Development",
    ],
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function Timeline() {
  const containerRef = useRef(null);
  const isCoarsePointer = useIsCoarsePointer();

  /* =======================================================
     SCROLL PROGRESS
  ======================================================= */

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: [
      "start 80%",
      "end 60%",
    ],
  });

  /* =======================================================
     SMOOTH SPRING
  ======================================================= */

  const smoothProgress = useSpring(
    scrollYProgress,
    {
      stiffness: isCoarsePointer ? 40 : 60,
      damping: isCoarsePointer ? 25 : 20,
      mass: 0.5,
      restDelta: 0.001,
    }
  );

  /* =======================================================
     LINE HEIGHT
  ======================================================= */

  const lineHeight = useTransform(
    smoothProgress,
    [0, 1],
    ["0%", "100%"]
  );

  /* =======================================================
     LINE GLOW
  ======================================================= */

  const glowOpacity = useTransform(
    smoothProgress,
    [0, 0.05, 1],
    [0, 1, 1]
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="timeline-wrapper"
      ref={containerRef}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="timeline-header">

        <span className="timeline-kicker">
          <span className="timeline-dot" />
          MY PATH SO FAR
        </span>

        <h3 className="timeline-title">
          Journey Timeline
        </h3>

        <p className="timeline-subtitle">
          Perjalanan pendidikan dan pengalaman
          kerja yang membentuk kemampuan saya
          saat ini.
        </p>

      </div>

      {/* ===================================================
          TRACK
      =================================================== */}

      <div className="timeline-track">

        {/* BACKGROUND LINE */}

        <div className="timeline-line-track" />

        {/* ACTIVE LINE */}

        <motion.div
          className="timeline-line-fill"
          style={{
            height: lineHeight,
            opacity: glowOpacity,
          }}
        />

        {/* LINE HEAD */}

        <motion.div
          className="timeline-line-head"
          style={{
            top: lineHeight,
            opacity: glowOpacity,
          }}
        />

        {/* =================================================
            TIMELINE ITEMS
        ================================================= */}

        {timelineData.map((item, index) => {

          const Icon =
            item.type === "education"
              ? GraduationCap
              : Briefcase;

          const side =
            index % 2 === 0
              ? "left"
              : "right";

          const isLeft =
            side === "left";

          const ease = [
            0.16,
            1,
            0.3,
            1,
          ];

          return (
            <motion.div
              key={`${item.title}-${index}`}
              className={`timeline-item timeline-item--${side}`}

              initial={{
                opacity: 0,

                x: isLeft
                  ? -55
                  : 55,

                y: 28,

                rotate: isLeft
                  ? -1.5
                  : 1.5,

                scale: 0.96,

                filter: isCoarsePointer ? "blur(0px)" : "blur(10px)",
              }}

              whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
                rotate: 0,
                scale: 1,
                filter: "blur(0px)",
              }}

              viewport={{
                once: true,
                amount: 0.35,
              }}

              transition={{
                duration: isCoarsePointer ? 0.65 : 0.9,
                delay: index * 0.12,
                ease,
              }}
            >

              {/* =================================================
                  CARD
              ================================================= */}

              <div className="timeline-card">

                <span className="timeline-period">
                  {item.period}
                </span>

                <h4 className="timeline-item-title">
                  {item.title}
                </h4>

                <p className="timeline-place">
                  {item.place}
                </p>

                <p className="timeline-description">
                  {item.description}
                </p>

                <div className="timeline-tags">

                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="timeline-tag"
                    >
                      {tag}
                    </span>
                  ))}

                </div>

              </div>

              {/* =================================================
                  MARKER
                  
                  Marker tetap di tengah garis.
                  z-index tinggi agar GARIS BERADA DI BELAKANG.
              ================================================= */}

              <motion.div
                className="timeline-marker"

                initial={{
                  scale: 0.6,
                  opacity: 0,
                }}

                whileInView={{
                  scale: 1,
                  opacity: 1,
                }}

                viewport={{
                  once: true,
                  amount: 0.5,
                }}

                transition={{
                  duration: 0.5,
                  delay: 0.15,
                  ease: [
                    0.34,
                    1.56,
                    0.64,
                    1,
                  ],
                }}
              >

                <Icon
                  size={16}
                  strokeWidth={1.8}
                />

              </motion.div>

            </motion.div>
          );
        })}

      </div>
    </div>
  );
}