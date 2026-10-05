import { useEffect, useRef, useState } from "react";

/* =========================================================
   LazyMount — render children hanya saat container mendekati
   viewport (IntersectionObserver).

   Dipakai untuk komponen berat (WebGL / physics) agar
   engine-nya tidak di-load sebelum benar-benar dibutuhkan:
   - Lanyard (rapier physics + drei)
   - Globe3D (three.js)
   - CircularGallery (ogl)

   Setelah terlihat sekali, observer dilepas dan children
   tetap ter-mount (tidak di-unmount saat scroll menjauh).
========================================================= */

export default function LazyMount({
  children,
  fallback = null,
  rootMargin = "500px",
  minHeight = 300,
  className = "",
  style,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);

      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);

          io.disconnect();
        }
      },
      { rootMargin }
    );

    io.observe(el);

    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={
        visible
          ? style
          : { ...style, minHeight }
      }
    >
      {visible ? children : fallback}
    </div>
  );
}
