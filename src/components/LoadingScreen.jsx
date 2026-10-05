import { memo, useEffect, useState, useRef } from "react";

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

const GREETING_INTERVAL = 200;
const TOTAL_DURATION = GREETINGS.length * GREETING_INTERVAL;

const LoadingGreeting = memo(function LoadingGreeting({ index }) {
  return (
    <span className="loading-greeting" key={index}>
      {GREETINGS[index]}
    </span>
  );
});

/* =========================================================
   LOADING SCREEN
========================================================= */

export default function LoadingScreen({ onFinish }) {
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const finishedRef = useRef(false);
  const startRef = useRef(null);
  const pageReadyRef = useRef(document.readyState === "complete");
  const ufoRef = useRef(null);
  const barRef = useRef(null);
  const pctRef = useRef(null);
  const greetingRef = useRef(0);

  /* =======================================================
     PAGE READY
  ======================================================= */

  useEffect(() => {
    if (pageReadyRef.current) return;

    const markReady = () => {
      pageReadyRef.current = true;
    };

    window.addEventListener("load", markReady, { once: true });
    const fallback = setTimeout(markReady, TOTAL_DURATION + 2000);

    return () => {
      window.removeEventListener("load", markReady);
      clearTimeout(fallback);
    };
  }, []);

  /* =======================================================
     TIMELINE — RAF hanya mengubah DOM. React rerender hanya
     saat greeting berubah, jadi gerak mulus tanpa beban state.
  ======================================================= */

  useEffect(() => {
    startRef.current = performance.now();
    let rafId;
    let done = false;
    let lastDisplay = -1;

    const finish = () => {
      if (done || finishedRef.current) return;
      done = true;
      finishedRef.current = true;
      setTimeout(() => setIsExiting(true), 280);
      setTimeout(() => onFinish?.(), 900);
    };

    const applyProgress = (pct) => {
      const p = Math.min(pct, 100) / 100;
      const ufoX = -6 + p * 112;
      const ufoY = 20 - Math.sin(p * Math.PI) * 9;
      const display = Math.round(pct);

      if (ufoRef.current) {
        ufoRef.current.style.transform = `translate3d(${ufoX}vw, ${ufoY}vh, 0)`;
      }

      // Teks dan bar hanya diubah saat angka persen berganti.
      if (display !== lastDisplay) {
        lastDisplay = display;
        if (barRef.current) barRef.current.style.width = `${display}%`;
        if (pctRef.current) pctRef.current.textContent = `${display}%`;
      }
    };

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const nextIndex = Math.min(
        GREETINGS.length - 1,
        Math.floor(elapsed / GREETING_INTERVAL)
      );

      if (nextIndex !== greetingRef.current) {
        greetingRef.current = nextIndex;
        setGreetingIndex(nextIndex);
      }

      const rawPct = (elapsed / TOTAL_DURATION) * 100;
      const pct = elapsed >= TOTAL_DURATION
        ? (pageReadyRef.current ? 100 : 99)
        : Math.min(99, rawPct);

      applyProgress(pct);

      if (pct >= 100) {
        finish();
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [onFinish]);

  return (
    <div className={`loading-screen ${isExiting ? "loading-screen--exit" : ""}`}>
      <div className="loading-bg" />

      <div
        ref={ufoRef}
        className="loading-ufo"
        style={{ transform: "translate3d(-6vw, 20vh, 0)" }}
      >
        <svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            className="loading-ufo-beam"
            d="M34 40 L62 40 L82 64 L14 64 Z"
            fill="url(#ufoBeam)"
          />
          <path
            d="M32 26 C32 10 64 10 64 26 Z"
            fill="#93c5fd"
            fillOpacity="0.55"
            stroke="#bfdbfe"
            strokeWidth="1.2"
          />
          <ellipse cx="48" cy="20" rx="6" ry="3" fill="#ffffff" fillOpacity="0.35" />
          <ellipse cx="48" cy="30" rx="44" ry="11" fill="#cbd5e1" />
          <ellipse cx="48" cy="27" rx="44" ry="9" fill="#e2e8f0" />
          <ellipse cx="48" cy="36" rx="20" ry="5" fill="#94a3b8" />
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

      <div className="loading-content">
        <LoadingGreeting index={greetingIndex} />

        <div className="loading-bar-wrap">
          <div className="loading-bar-labels">
            <span>Loading</span>
            <span ref={pctRef}>0%</span>
          </div>
          <div className="loading-bar-track">
            <div ref={barRef} className="loading-bar-fill" style={{ width: "0%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
