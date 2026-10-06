import { useRef, useState } from "react";
import "./GlareCard.css";

export default function GlareCard({
  children,
  className = "",
  style = {},
  disableHover = false,
}) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (disableHover) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty("--glare-x", `${x}%`);
    card.style.setProperty("--glare-y", `${y}%`);
  };

  const handleMouseEnter = () => {
    if (disableHover) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (disableHover) return;
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className={`glare-card ${isHovered ? 'glare-card--active' : ''} ${className}`}
      style={style}
      onMouseMove={disableHover ? undefined : handleMouseMove}
      onMouseEnter={disableHover ? undefined : handleMouseEnter}
      onMouseLeave={disableHover ? undefined : handleMouseLeave}
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
