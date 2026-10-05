import { useEffect, useRef } from "react";
import "./MaskedHeading.css";

export default function MaskedHeading({
  text = "",
  className = "",
  duration = 0.8,
  delay = 0,
  direction = "up",
  once = true,
}) {
  const headingRef = useRef(null);

  useEffect(() => {
    const element = headingRef.current;

    if (!element) return;

    const words = element.querySelectorAll(".masked-heading-word");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("masked-heading-visible");

          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          element.classList.remove("masked-heading-visible");
        }
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(element);

    words.forEach((word, index) => {
      word.style.setProperty(
        "--masked-duration",
        `${duration}s`
      );

      word.style.setProperty(
        "--masked-delay",
        `${delay + index * 0.08}s`
      );
    });

    return () => observer.disconnect();
  }, [duration, delay, once]);

  const words = text.split(" ");

  return (
    <h2
      ref={headingRef}
      className={`masked-heading ${direction} ${className}`}
      aria-label={text}
    >
      {words.map((word, index) => (
        <span
          className="masked-heading-mask"
          key={`${word}-${index}`}
        >
          <span className="masked-heading-word">
            {word}
          </span>
        </span>
      ))}
    </h2>
  );
}