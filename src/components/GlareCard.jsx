import { useRef, useState } from "react";
import "./GlareCard.css";

export default function GlareCard({
  children,
  className = "",
  style = {},
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty("--glare-x", `${x}%`);
    card.style.setProperty("--glare-y", `${y}%`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className={`glare-card ${isHovered ? 'glare-card--active' : ''} ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="glare-card-border-glow" />
      <div className="glare-card-corner-line" />
      <div className="glare-card-shine" />
      <div className="glare-card-content">
        {children}
      </div>
    </div>
  );
}
