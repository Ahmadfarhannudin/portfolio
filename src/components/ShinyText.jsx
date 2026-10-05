import {
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

import {
  motion,
  useMotionValue,
  useAnimationFrame,
  useTransform,
} from "motion/react";

import "./ShinyText.css";

const ShinyText = ({
  text = "",
  disabled = false,
  speed = 2,
  className = "",
  color = "#b5b5b5",
  shineColor = "#ffffff",
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = "left",
  delay = 0,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  const progress = useMotionValue(0);

  const elapsedRef = useRef(0);
  const lastTimeRef = useRef(null);

  const directionRef = useRef(
    direction === "left" ? 1 : -1
  );

  /*
   * Pastikan speed tidak pernah 0
   * supaya animasi tidak menghasilkan pembagian
   * dengan angka 0.
   */
  const safeSpeed = Math.max(Number(speed) || 2, 0.1);

  const safeDelay = Math.max(Number(delay) || 0, 0);

  const animationDuration = safeSpeed * 1000;
  const delayDuration = safeDelay * 1000;


  /*
   * =========================================
   * ANIMATION
   * =========================================
   */

  useAnimationFrame((time) => {
    if (disabled || isPaused) {
      lastTimeRef.current = null;
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }

    const deltaTime =
      time - lastTimeRef.current;

    lastTimeRef.current = time;

    elapsedRef.current += deltaTime;


    /*
     * =======================================
     * YOYO
     * =======================================
     */

    if (yoyo) {
      const cycleDuration =
        animationDuration + delayDuration;

      const fullCycle =
        cycleDuration * 2;

      const cycleTime =
        elapsedRef.current % fullCycle;


      // Forward
      if (cycleTime < animationDuration) {
        const p =
          (cycleTime / animationDuration) * 100;

        progress.set(
          directionRef.current === 1
            ? p
            : 100 - p
        );

        return;
      }


      // Delay setelah forward
      if (cycleTime < cycleDuration) {
        progress.set(
          directionRef.current === 1
            ? 100
            : 0
        );

        return;
      }


      // Reverse
      if (
        cycleTime <
        cycleDuration + animationDuration
      ) {
        const reverseTime =
          cycleTime - cycleDuration;

        const p =
          100 -
          (reverseTime / animationDuration) *
            100;

        progress.set(
          directionRef.current === 1
            ? p
            : 100 - p
        );

        return;
      }


      // Delay sebelum mulai lagi
      progress.set(
        directionRef.current === 1
          ? 0
          : 100
      );

      return;
    }


    /*
     * =======================================
     * NORMAL LOOP
     * =======================================
     */

    const cycleDuration =
      animationDuration + delayDuration;

    const cycleTime =
      elapsedRef.current % cycleDuration;


    if (cycleTime < animationDuration) {
      const p =
        (cycleTime / animationDuration) * 100;

      progress.set(
        directionRef.current === 1
          ? p
          : 100 - p
      );
    } else {
      /*
       * Shine sudah keluar dari text.
       */
      progress.set(
        directionRef.current === 1
          ? 100
          : 0
      );
    }
  });


  /*
   * =========================================
   * DIRECTION CHANGE
   * =========================================
   */

  useEffect(() => {
    directionRef.current =
      direction === "left" ? 1 : -1;

    elapsedRef.current = 0;
    lastTimeRef.current = null;

    progress.set(
      direction === "left"
        ? 0
        : 100
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction]);


  /*
   * =========================================
   * RESET WHEN SPEED / DELAY CHANGES
   * =========================================
   */

  useEffect(() => {
    elapsedRef.current = 0;
    lastTimeRef.current = null;

    progress.set(
      directionRef.current === 1
        ? 0
        : 100
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed, delay]);


  /*
   * =========================================
   * BACKGROUND POSITION
   * =========================================
   *
   * 0   = shine berada di kanan
   * 100 = shine bergerak ke kiri
   */

  const backgroundPosition = useTransform(
    progress,
    (value) =>
      `${150 - value * 2}% center`
  );


  /*
   * =========================================
   * HOVER
   * =========================================
   */

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  }, [pauseOnHover]);


  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  }, [pauseOnHover]);


  /*
   * =========================================
   * GRADIENT
   * =========================================
   */

  const gradientStyle = {
    backgroundImage: `
      linear-gradient(
        ${spread}deg,
        ${color} 0%,
        ${color} 35%,
        ${shineColor} 50%,
        ${color} 65%,
        ${color} 100%
      )
    `,

    backgroundSize: "200% auto",

    WebkitBackgroundClip: "text",
    backgroundClip: "text",

    WebkitTextFillColor: "transparent",

    color: "transparent",
  };


  /*
   * =========================================
   * RENDER
   * =========================================
   */

  return (
    <motion.span
      className={`shiny-text ${className}`}
      style={{
        ...gradientStyle,
        backgroundPosition,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {text}
    </motion.span>
  );
};

export default ShinyText;