import { useEffect, useState, useRef } from "react";

import SpaceBackground from "./SpaceBackground";

import "./LoadingScreen.css";


/* =========================================================
   GREETINGS
========================================================= */

const GREETINGS = [
  "Hello",
  "Halo",
  "Hola",
  "Bonjour",
  "こんにちは",
  "안녕하세요",
  "你好",
  "Ciao",
  "Hallo",
  "Olá",
  "Привет",
  "مرحبا",
  "नमस्ते",
  "Selamat",
  "Sawubona",
];

const GREETING_INTERVAL = 340;
const TOTAL_DURATION =
  GREETINGS.length * GREETING_INTERVAL;


/* =========================================================
   LOADING SCREEN
========================================================= */

export default function LoadingScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [greetingIndex, setGreetingIndex] = useState(0);

  const [isExiting, setIsExiting] = useState(false);

  const finishedRef = useRef(false);
  const startRef = useRef(null);

  const pageReadyRef = useRef(
    document.readyState === "complete"
  );


  /* =======================================================
     PAGE READY
  ======================================================= */

  useEffect(() => {
    if (pageReadyRef.current) return;

    const markReady = () => {
      pageReadyRef.current = true;
    };

    window.addEventListener(
      "load",
      markReady,
      { once: true }
    );

    const fallback = setTimeout(
      markReady,
      TOTAL_DURATION + 2000
    );

    return () => {
      window.removeEventListener(
        "load",
        markReady
      );

      clearTimeout(fallback);
    };
  }, []);


  /* =======================================================
     LOADING TIMELINE
  ======================================================= */

  useEffect(() => {
    let rafId;

    const tick = (now) => {
      if (startRef.current === null) {
        startRef.current = now;
      }

      const elapsed =
        now - startRef.current;


      /* -----------------------------------------------
         GREETING
      ----------------------------------------------- */

      const index = Math.min(
        GREETINGS.length - 1,
        Math.floor(
          elapsed / GREETING_INTERVAL
        )
      );

      setGreetingIndex(index);


      /* -----------------------------------------------
         PROGRESS
      ----------------------------------------------- */

      const rawPct =
        (elapsed / TOTAL_DURATION) * 100;

      let pct;

      if (elapsed >= TOTAL_DURATION) {
        pct = pageReadyRef.current
          ? 100
          : 99;
      } else {
        pct = Math.min(
          99,
          rawPct
        );
      }

      setProgress(pct);


      if (pct < 100) {
        rafId =
          requestAnimationFrame(tick);
      }
    };

    rafId =
      requestAnimationFrame(tick);

    return () =>
      cancelAnimationFrame(rafId);
  }, []);


  /* =======================================================
     WAIT AT 99%
  ======================================================= */

  useEffect(() => {
    if (progress !== 99) return;

    const interval = setInterval(() => {
      if (pageReadyRef.current) {
        setProgress(100);

        clearInterval(interval);
      }
    }, 100);

    return () =>
      clearInterval(interval);
  }, [progress]);


  /* =======================================================
     FINISH ANIMATION
  ======================================================= */

  useEffect(() => {
    if (
      progress >= 100 &&
      !finishedRef.current
    ) {
      finishedRef.current = true;


      /*
       * Tunggu sebentar setelah 100%
       * agar user sempat melihat completion state.
       */

      const exitTimeout =
        setTimeout(() => {
          setIsExiting(true);
        }, 350);


      const removeTimeout =
        setTimeout(() => {
          onFinish?.();
        }, 1200);


      return () => {
        clearTimeout(exitTimeout);
        clearTimeout(removeTimeout);
      };
    }
  }, [progress, onFinish]);


  /* =======================================================
     UFO — posisi mengikuti progress (0 → 1)
  ======================================================= */

  const p = Math.min(progress, 100) / 100;

  const ufoX = -6 + p * 112; // % lebar layar: masuk kiri, keluar kanan
  const ufoY =
    20 -
    Math.sin(p * Math.PI) * 9 + // lengkung besar
    Math.sin(p * Math.PI * 6) * 1.2; // goyang halus
  const ufoTilt = Math.cos(p * Math.PI * 6) * 5;


  /* =======================================================
     DISPLAY
  ======================================================= */

  return (
    <div
      className={`
        loading-screen
        ${isExiting
          ? "loading-screen--exit"
          : ""}
      `}
    >

      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <div className="loading-bg">
        <SpaceBackground
          meteorCount={8}
          showMeteors={true}
          showStars={true}
          showNebula={true}
        />
      </div>


      {/* ===================================================
          PORTAL
      =================================================== */}

      <div className="loading-portal">

        <div
          className="
            loading-portal-ring
            loading-portal-ring--outer
          "
        />

        <div
          className="
            loading-portal-ring
            loading-portal-ring--inner
          "
        />

        <div className="loading-portal-core" />

      </div>


      {/* ===================================================
          UFO
      =================================================== */}

      <div
        className="loading-ufo"
        style={{
          left: `${ufoX}%`,
          top: `${ufoY}%`,
          transform: `translate(-50%, -50%) rotate(${ufoTilt}deg)`,
        }}
      >
        <svg
          viewBox="0 0 96 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sinar */}
          <path
            className="loading-ufo-beam"
            d="M34 40 L62 40 L82 64 L14 64 Z"
            fill="url(#ufoBeam)"
          />

          {/* Kubah kaca */}
          <path
            d="M32 26 C32 10 64 10 64 26 Z"
            fill="#93c5fd"
            fillOpacity="0.55"
            stroke="#bfdbfe"
            strokeWidth="1.2"
          />
          <ellipse
            cx="48"
            cy="20"
            rx="6"
            ry="3"
            fill="#ffffff"
            fillOpacity="0.35"
          />

          {/* Badan */}
          <ellipse cx="48" cy="30" rx="44" ry="11" fill="#cbd5e1" />
          <ellipse cx="48" cy="27" rx="44" ry="9" fill="#e2e8f0" />
          <ellipse cx="48" cy="36" rx="20" ry="5" fill="#94a3b8" />

          {/* Lampu */}
          <circle className="loading-ufo-light l1" cx="18" cy="31" r="2.6" fill="#22c55e" />
          <circle className="loading-ufo-light l2" cx="33" cy="35" r="2.6" fill="#facc15" />
          <circle className="loading-ufo-light l3" cx="48" cy="37" r="2.6" fill="#3b82f6" />
          <circle className="loading-ufo-light l4" cx="63" cy="35" r="2.6" fill="#facc15" />
          <circle className="loading-ufo-light l5" cx="78" cy="31" r="2.6" fill="#22c55e" />

          <defs>
            <linearGradient
              id="ufoBeam"
              x1="48"
              y1="40"
              x2="48"
              y2="64"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#7fe3ff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#7fe3ff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>


      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div className="loading-content">

        <span
          className="loading-greeting"
          key={greetingIndex}
        >
          {GREETINGS[greetingIndex]}
        </span>


        {/* =================================================
            PROGRESS
        ================================================= */}

        <div className="loading-bar-wrap">

          {(() => {
            const displayPct =
              Math.round(progress);

            return (
              <>
                <div className="loading-bar-labels">

                  <span>
                    Loading
                  </span>

                  <span>
                    {displayPct}%
                  </span>

                </div>


                <div className="loading-bar-track">

                  <div
                    className="loading-bar-fill"
                    style={{
                      width:
                        `${displayPct}%`,
                    }}
                  />

                </div>

              </>
            );
          })()}

        </div>

      </div>


      {/* ===================================================
          CINEMATIC EXIT
      =================================================== */}

      <div className="loading-exit-glow" />

      <div className="loading-exit-flash" />

      <div className="loading-exit-lines">

        <span />
        <span />
        <span />
        <span />

      </div>

    </div>
  );
}