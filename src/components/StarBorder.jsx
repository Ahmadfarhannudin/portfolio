import "./StarBorder.css";

export default function StarBorder({
  children,
  className = "",
  color = "rgba(59, 130, 246, 0.9)",
  speed = "5s",
  thickness = 1,
  onClick,
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`star-border ${className}`}
      style={{
        "--star-color": color,
        "--star-speed": speed,
        "--star-thickness": `${thickness}px`,
      }}
    >
      <span className="star-border-glow" />
      <span className="star-border-content">
        {children}
      </span>
    </button>
  );
}