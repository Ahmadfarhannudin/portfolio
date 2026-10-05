import { useEffect, useRef } from "react";
import "./GlowCursor.css";

export default function GlowCursor({
  color = "#3b82f6",
  secondaryColor = "#8b5cf6",
  enabled = true,
}) {
  const canvasRef = useRef(null);
  const propsRef = useRef({ color, secondaryColor, enabled });
  propsRef.current = { color, secondaryColor, enabled };

  useEffect(() => {
    if (!enabled) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");

    const head = { x: -100, y: -100, vx: 0, vy: 0, speed: 0 };
    const history = []; // array of {x,y,age}
    const MAX_HISTORY = 24;
    const TRAIL_LIFE = 0.55; // seconds
    const IDLE_TIMEOUT = 150; // ms without movement considered idle
    const SPAWN_INTERVAL = 16; // ms between history samples

    let raf = 0;
    let lastMoveTime = 0;
    let lastSampleTime = 0;
    let visible = 0; // 0 = hidden, 1 = visible (animated)

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const hexToRgb = (hex) => {
      const v = (hex || "#3b82f6").replace("#", "");
      return {
        r: parseInt(v.substring(0, 2), 16),
        g: parseInt(v.substring(2, 4), 16),
        b: parseInt(v.substring(4, 6), 16),
      };
    };

    const onMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      // calculate velocity (per-second normalized)
      const dx = x - head.x;
      const dy = y - head.y;
      head.vx = dx;
      head.vy = dy;
      head.speed = Math.min(Math.hypot(dx, dy) / 16, 1); // 0..1

      head.x = x;
      head.y = y;
      lastMoveTime = performance.now();
    };

    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        onMove({
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
        });
      }
    };

    const onTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        head.x = e.touches[0].clientX;
        head.y = e.touches[0].clientY;
        onMove({
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
        });
      }
    };

    const onTouchEnd = () => {
      lastMoveTime = performance.now();
    };

    const render = (now) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const idle = now - lastMoveTime > IDLE_TIMEOUT;
      const targetVisible = idle ? 0 : 1;
      // smooth fade in/out
      visible += (targetVisible - visible) * 0.18;

      // sample history periodically (only when visible enough)
      if (
        visible > 0.05 &&
        now - lastSampleTime > SPAWN_INTERVAL &&
        !idle
      ) {
        history.unshift({ x: head.x, y: head.y, age: 0 });
        if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
        lastSampleTime = now;
      }

      // age history & drop dead
      for (let i = history.length - 1; i >= 0; i--) {
        history[i].age += 1 / 60;
        if (history[i].age > TRAIL_LIFE) history.splice(i, 1);
      }

      if (visible < 0.02 || history.length === 0) {
        // no movement & fading out → keep rendering to clear
        raf = requestAnimationFrame(render);
        return;
      }

      const c1 = hexToRgb(propsRef.current.color);
      const c2 = hexToRgb(propsRef.current.secondaryColor);
      const time = now * 0.001;
      const pulse = 0.85 + Math.sin(time * 6) * 0.15;

      ctx.globalCompositeOperation = "screen";

      // ── 1. Wide ambient halo around cursor head ──
      const haloR = 70 + head.speed * 60;
      const halo = ctx.createRadialGradient(
        head.x,
        head.y,
        0,
        head.x,
        head.y,
        haloR
      );
      halo.addColorStop(
        0,
        `rgba(${c1.r},${c1.g},${c1.b},${0.32 * visible})`
      );
      halo.addColorStop(
        0.5,
        `rgba(${c2.r},${c2.g},${c2.b},${0.10 * visible})`
      );
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(head.x, head.y, haloR, 0, Math.PI * 2);
      ctx.fill();

      // ── 2. Trail history (rendered back-to-front so newest is brightest) ──
      for (let i = history.length - 1; i >= 0; i--) {
        const p = history[i];
        const progress = i / history.length;
        const lifeFade = 1 - p.age / TRAIL_LIFE;

        if (lifeFade <= 0) continue;

        const r = Math.round(c1.r + (c2.r - c1.r) * progress);
        const g = Math.round(c1.g + (c2.g - c1.g) * progress);
        const b = Math.round(c1.b + (c2.b - c1.b) * progress);

        // glow halo per point
        const glowR = (16 - progress * 10) * lifeFade;
        const glowAlpha = (1 - progress) * 0.5 * lifeFade * visible;

        if (glowR > 0 && glowAlpha > 0) {
          const grad = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            glowR
          );
          grad.addColorStop(
            0,
            `rgba(${r},${g},${b},${glowAlpha})`
          );
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        // connect to previous (newer) point with a tapered line
        if (i < history.length - 1) {
          const next = history[i + 1];
          const lineW = (1 - progress * 0.85) * 3.5 * lifeFade;
          const lineAlpha =
            (1 - progress) * 0.7 * lifeFade * visible;

          ctx.strokeStyle = `rgba(${r},${g},${b},${lineAlpha})`;
          ctx.lineWidth = lineW;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        }
      }

      // ── 3. Bright hotspot at head (only when moving) ──
      if (head.speed > 0.05) {
        const hotR = 22 * pulse;
        const hot = ctx.createRadialGradient(
          head.x,
          head.y,
          0,
          head.x,
          head.y,
          hotR
        );
        hot.addColorStop(
          0,
          `rgba(255,255,255,${0.5 * visible})`
        );
        hot.addColorStop(
          0.25,
          `rgba(${c1.r},${c1.g},${c1.b},${0.45 * visible})`
        );
        hot.addColorStop(
          1,
          `rgba(${c1.r},${c1.g},${c1.b},0)`
        );
        ctx.fillStyle = hot;
        ctx.beginPath();
        ctx.arc(head.x, head.y, hotR, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 4. Pulsing center dot (only when visible) ──
      const dotR = 3 + head.speed * 2;
      const dot = ctx.createRadialGradient(
        head.x,
        head.y,
        0,
        head.x,
        head.y,
        dotR
      );
      dot.addColorStop(
        0,
        `rgba(255,255,255,${0.95 * visible})`
      );
      dot.addColorStop(
        1,
        `rgba(${c1.r},${c1.g},${c1.b},0)`
      );
      ctx.fillStyle = dot;
      ctx.beginPath();
      ctx.arc(head.x, head.y, dotR, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(render);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("mouseout", (e) => {
      if (!e.relatedTarget && !e.toElement) {
        lastMoveTime = 0;
      }
    });

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      className="glow-cursor-canvas"
      aria-hidden="true"
    />
  );
}
