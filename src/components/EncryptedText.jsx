import { useEffect, useRef, useState } from "react";

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

function generateEncryptedText(text) {
  return text
    .split("")
    .map((char) => {
      if (char === " ") return " ";

      if (char === "\n") return "\n";

      return CHARS[Math.floor(Math.random() * CHARS.length)];
    })
    .join("");
}

export default function EncryptedText({
  text = "",
  className = "",
  speed = 40,
  revealDelay = 0,
  as: Tag = "span",

  // Trigger dari parent
  trigger = 0,
}) {
  const [display, setDisplay] = useState(() =>
    generateEncryptedText(text)
  );

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // ============================================================
    // CLEANUP ANIMASI LAMA
    // ============================================================

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // ============================================================
    // TEXT KOSONG
    // ============================================================

    if (!text) {
      setDisplay("");
      return;
    }

    // ============================================================
    // REDUCED MOTION
    // ============================================================

    if (
      typeof window !== "undefined" &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      setDisplay(text);
      return;
    }

    // ============================================================
    // RESET KE RANDOM
    // ============================================================

    setDisplay(generateEncryptedText(text));

    let iteration = 0;

    // ============================================================
    // START ANIMATION
    // ============================================================

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        iteration += 1;

        setDisplay(
          text
            .split("")
            .map((char, index) => {
              if (char === " ") {
                return " ";
              }

              if (char === "\n") {
                return "\n";
              }

              // Sudah direveal
              if (index < iteration) {
                return char;
              }

              // Masih encrypted
              return CHARS[
                Math.floor(
                  Math.random() * CHARS.length
                )
              ];
            })
            .join("")
        );

        // ========================================================
        // ANIMATION COMPLETE
        // ========================================================

        if (iteration >= text.length) {
          clearInterval(intervalRef.current);

          intervalRef.current = null;

          // Pastikan teks asli
          setDisplay(text);
        }
      }, Math.max(15, speed));
    }, Math.max(0, revealDelay));

    // ============================================================
    // CLEANUP
    // ============================================================

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);

        intervalRef.current = null;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);

        timeoutRef.current = null;
      }
    };
  }, [
    text,
    speed,
    revealDelay,
    trigger,
  ]);

  return (
    <Tag className={className}>
      {display}
    </Tag>
  );
}