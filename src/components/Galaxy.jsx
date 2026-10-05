import { useRef } from "react";

export default function GlareCard({
  children,
  className = "",
}) {
  const cardRef = useRef(null);

  const handleMouseMove = (event) => {
    const card = cardRef.current;

    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) / rect.width) * 100;

    const y =
      ((event.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty("--glare-x", `${x}%`);
    card.style.setProperty("--glare-y", `${y}%`);
    card.style.setProperty("--glare-opacity", "1");
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;

    if (!card) return;

    card.style.setProperty("--glare-opacity", "0");
  };

  return (
    <div
      ref={cardRef}
      className={`glare-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated border */}
      <div className="glare-card-border-glow" />

      {/* Cursor glare */}
      <div className="glare-card-shine" />

      {/* Content */}
      <div className="glare-card-content">
        {children}
      </div>
    </div>
  );
}