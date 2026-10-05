import { useMemo } from "react";
import Meteors from "./Meteors";
import "./SpaceBackground.css";

export default function SpaceBackground({
  meteorCount = 20,
  showMeteors = true,
  showStars = true,
  showNebula = true,
}) {
  const stars = useMemo(() => {
    return Array.from({ length: 100 }, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }));
  }, []);

  return (
    <div className="space-background">
      <div className="space-background-base" />

      {showNebula && (
        <>
          <div className="space-background-nebula space-background-nebula-left" />
          <div className="space-background-nebula space-background-nebula-right" />
          <div className="space-background-nebula space-background-nebula-center" />
        </>
      )}

      {showStars && (
        <div className="space-background-stars">
          {stars.map((star) => (
            <span
              key={star.id}
              className="space-background-star"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {showMeteors && (
        <div className="space-background-meteors">
          <Meteors number={meteorCount} />
        </div>
      )}

      <div className="space-background-glow" />
    </div>
  );
}
