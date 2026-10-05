import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "./ImageCarousel.css";

/* =========================================================
   IMAGE CAROUSEL

   Features:
   - Auto slide
   - Mouse drag
   - Touch swipe
   - Smooth animation
   - Dot indicator
   - Keyboard navigation
   - Pause on hover
   - Pause while dragging
   - Responsive desktop & mobile
   - Click image -> fullscreen preview
   - Lightbox navigation
   - Lightbox drag/swipe to change photo
   - Individual image ratio
   - Preload images before calculating ratio
   - No refresh required
========================================================= */

export default function ImageCarousel({
  images = [],
  alt = "",
  className = "",
}) {
  /* =======================================================
     STATE
  ======================================================= */

  const [current, setCurrent] = useState(0);

  const [dragX, setDragX] = useState(0);

  const [isDragging, setIsDragging] = useState(false);

  const [isHovered, setIsHovered] = useState(false);

  /*
   * Ratio setiap gambar.
   *
   * Contoh:
   * [
   *   1.777, // 16:9
   *   0.8,   // 4:5
   *   1.5,   // 3:2
   * ]
   */
  const [imageRatios, setImageRatios] = useState([]);

  /*
   * Ratio gambar yang sedang aktif.
   */
  const [ratio, setRatio] = useState(null);

  /*
   * Menandakan semua gambar sudah selesai
   * diproses untuk mendapatkan naturalWidth /
   * naturalHeight.
   */
  const [imagesReady, setImagesReady] = useState(false);

  /* =======================================================
     LIGHTBOX STATE
  ======================================================= */

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [lightboxIndex, setLightboxIndex] = useState(0);

  /* =======================================================
     REFS
  ======================================================= */

  const viewportRef = useRef(null);

  const pointerStartX = useRef(0);

  const pointerCurrentX = useRef(0);

  const isPointerDragging = useRef(false);

  /*
   * Digunakan untuk membedakan:
   *
   * tap/click
   * vs
   * drag/swipe
   *
   * Supaya ketika user swipe carousel,
   * lightbox tidak ikut terbuka.
   */
  const didDrag = useRef(false);

  /*
   * Sama seperti didDrag, tapi khusus
   * untuk drag di dalam LIGHTBOX.
   */
  const lightboxDidDrag = useRef(false);

  /* =======================================================
     TOTAL IMAGES
  ======================================================= */

  const total = images.length;

  /* =======================================================
     PRELOAD + CALCULATE ALL IMAGE RATIOS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    /*
     * Reset ketika images berubah.
     */
    setCurrent(0);
    setRatio(null);
    setImageRatios([]);
    setImagesReady(false);

    if (!images.length) {
      return;
    }

    /*
     * Load semua gambar terlebih dahulu.
     *
     * Ini penting agar carousel tidak perlu
     * menunggu refresh browser untuk mengetahui
     * ukuran gambar.
     */
    const loadImages = async () => {
      const loadedRatios = await Promise.all(
        images.map(
          (src) =>
            new Promise((resolve) => {
              const img = new Image();

              img.onload = () => {
                if (
                  img.naturalWidth > 0 &&
                  img.naturalHeight > 0
                ) {
                  resolve(
                    img.naturalWidth /
                      img.naturalHeight
                  );
                } else {
                  resolve(null);
                }
              };

              img.onerror = () => {
                resolve(null);
              };

              img.src = src;
            })
        )
      );

      /*
       * Component sudah berubah / unmount.
       */
      if (cancelled) {
        return;
      }

      /*
       * Simpan semua ratio.
       */
      setImageRatios(loadedRatios);

      /*
       * Gunakan ratio foto pertama
       * sebagai ratio awal.
       */
      const firstValidRatio =
        loadedRatios.find(
          (value) =>
            typeof value === "number" &&
            value > 0
        );

      if (firstValidRatio) {
        setRatio(firstValidRatio);
      }

      setImagesReady(true);
    };

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [images]);

  /* =======================================================
     UPDATE RATIO WHEN CURRENT IMAGE CHANGES
  ======================================================= */

  useEffect(() => {
    if (
      imageRatios.length &&
      imageRatios[current]
    ) {
      setRatio(imageRatios[current]);
    }
  }, [current, imageRatios]);

  /* =======================================================
     GO TO
  ======================================================= */

  const goTo = useCallback(
    (index) => {
      if (!total) {
        return;
      }

      setCurrent(
        ((index % total) + total) % total
      );
    },
    [total]
  );

  /* =======================================================
     NEXT
  ======================================================= */

  const next = useCallback(() => {
    if (!total) {
      return;
    }

    setCurrent(
      (prev) => (prev + 1) % total
    );
  }, [total]);

  /* =======================================================
     PREVIOUS
  ======================================================= */

  const prev = useCallback(() => {
    if (!total) {
      return;
    }

    setCurrent(
      (prev) =>
        (prev - 1 + total) % total
    );
  }, [total]);

  /* =======================================================
     AUTOPLAY
  ======================================================= */

  useEffect(() => {
    if (total <= 1) {
      return;
    }

    /*
     * Jangan mulai autoplay sebelum gambar
     * selesai diproses.
     */
    if (!imagesReady) {
      return;
    }

    if (
      isHovered ||
      isDragging ||
      lightboxOpen
    ) {
      return;
    }

    const interval = setInterval(() => {
      next();
    }, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [
    total,
    imagesReady,
    isHovered,
    isDragging,
    lightboxOpen,
    next,
  ]);

  /* =======================================================
     OPEN LIGHTBOX
  ======================================================= */

  const openLightbox = useCallback(
    (index) => {
      setLightboxIndex(index);

      setLightboxOpen(true);

      document.body.style.overflow = "hidden";
    },
    []
  );

  /* =======================================================
     CLOSE LIGHTBOX
  ======================================================= */

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);

    document.body.style.overflow = "";
  }, []);

  /* =======================================================
     LIGHTBOX NEXT
  ======================================================= */

  const lightboxNext = useCallback(() => {
    if (!total) {
      return;
    }

    setLightboxIndex(
      (prev) => (prev + 1) % total
    );
  }, [total]);

  /* =======================================================
     LIGHTBOX PREVIOUS
  ======================================================= */

  const lightboxPrev = useCallback(() => {
    if (!total) {
      return;
    }

    setLightboxIndex(
      (prev) =>
        (prev - 1 + total) % total
    );
  }, [total]);

  /* =======================================================
     KEYBOARD
  ======================================================= */

  const handleKeyDown = (e) => {
    /*
     * LIGHTBOX KEYBOARD
     */

    if (lightboxOpen) {
      if (e.key === "Escape") {
        e.preventDefault();

        closeLightbox();

        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();

        lightboxNext();

        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();

        lightboxPrev();

        return;
      }

      return;
    }

    /*
     * CAROUSEL KEYBOARD
     */

    if (e.key === "ArrowRight") {
      e.preventDefault();

      next();
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();

      prev();
    }

    if (e.key === "Home") {
      e.preventDefault();

      goTo(0);
    }

    if (e.key === "End") {
      e.preventDefault();

      goTo(total - 1);
    }

    /*
     * Buka lightbox untuk foto yang
     * sedang aktif via keyboard.
     */
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();

      openLightbox(current);
    }
  };

  /* =======================================================
     POINTER DOWN (CAROUSEL)
  ======================================================= */

  const handlePointerDown = (e) => {
    if (
      e.pointerType === "mouse" &&
      e.button !== 0
    ) {
      return;
    }

    pointerStartX.current = e.clientX;

    pointerCurrentX.current = e.clientX;

    isPointerDragging.current = true;

    didDrag.current = false;

    setIsDragging(true);

    setDragX(0);

    try {
      e.currentTarget.setPointerCapture(
        e.pointerId
      );
    } catch {
      // Ignore
    }
  };

  /* =======================================================
     POINTER MOVE (CAROUSEL)
  ======================================================= */

  const handlePointerMove = (e) => {
    if (!isPointerDragging.current) {
      return;
    }

    const delta =
      e.clientX -
      pointerStartX.current;

    pointerCurrentX.current = e.clientX;

    /*
     * Kalau perpindahan cukup jauh,
     * anggap sebagai DRAG bukan TAP/CLICK.
     */
    if (Math.abs(delta) > 8) {
      didDrag.current = true;
    }

    /*
     * Kalau cuma 1 gambar, tidak perlu
     * geser track secara visual.
     */
    if (total > 1) {
      setDragX(delta * 0.9);
    }
  };

  /* =======================================================
     POINTER UP (CAROUSEL)

     Semua keputusan final terjadi di sini:
     - apakah ini SWIPE (pindah slide)
     - apakah ini TAP (buka lightbox)

     Sengaja TIDAK memakai onClick di elemen
     manapun, karena click event bisa "hilang"
     akibat kombinasi setPointerCapture + re-render
     state di antara pointerdown -> pointerup.
  ======================================================= */

  const handlePointerUp = (e) => {
    if (!isPointerDragging.current) {
      return;
    }

    const delta =
      pointerCurrentX.current -
      pointerStartX.current;

    const viewportWidth =
      viewportRef.current
        ?.offsetWidth || 1;

    const threshold = Math.max(
      50,
      viewportWidth * 0.12
    );

    if (total > 1) {
      if (delta < -threshold) {
        next();
      } else if (delta > threshold) {
        prev();
      }
    }

    isPointerDragging.current = false;

    setIsDragging(false);

    setDragX(0);

    try {
      if (
        e.currentTarget.hasPointerCapture?.(
          e.pointerId
        )
      ) {
        e.currentTarget.releasePointerCapture(
          e.pointerId
        );
      }
    } catch {
      // Ignore
    }

    /*
     * Kalau ini TAP (bukan drag/swipe),
     * buka lightbox untuk foto yang
     * sedang aktif.
     */
    if (!didDrag.current) {
      openLightbox(current);
    }

    /*
     * Reset setelah event selesai
     * diproses browser.
     */
    setTimeout(() => {
      didDrag.current = false;
    }, 0);
  };

  /* =======================================================
     POINTER CANCEL (CAROUSEL)
  ======================================================= */

  const handlePointerCancel = (e) => {
    if (!isPointerDragging.current) {
      return;
    }

    isPointerDragging.current = false;

    didDrag.current = true;

    setIsDragging(false);

    setDragX(0);

    try {
      if (
        e.currentTarget.hasPointerCapture?.(
          e.pointerId
        )
      ) {
        e.currentTarget.releasePointerCapture(
          e.pointerId
        );
      }
    } catch {
      // Ignore
    }
  };

  /* =======================================================
     HOVER
  ======================================================= */

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    if (!isPointerDragging.current) {
      setIsHovered(false);
    }
  };

  /* =======================================================
     LIGHTBOX DRAG HANDLERS

     Dipakai oleh <motion.div> di dalam lightbox
     lewat prop drag="x" bawaan framer-motion,
     jadi tidak perlu pointer-capture manual lagi.
  ======================================================= */

  const handleLightboxDragStart = () => {
    lightboxDidDrag.current = false;
  };

  const handleLightboxDrag = (_e, info) => {
    if (Math.abs(info.offset.x) > 8) {
      lightboxDidDrag.current = true;
    }
  };

  const handleLightboxDragEnd = (_e, info) => {
    const swipeDistance = 120;
    const swipeVelocity = 500;

    if (
      info.offset.x < -swipeDistance ||
      info.velocity.x < -swipeVelocity
    ) {
      lightboxNext();
    } else if (
      info.offset.x > swipeDistance ||
      info.velocity.x > swipeVelocity
    ) {
      lightboxPrev();
    }

    /*
     * Reset flag sesaat setelah drag
     * selesai supaya klik background
     * (untuk menutup lightbox) tidak
     * ikut ke-trigger tanpa sengaja.
     */
    setTimeout(() => {
      lightboxDidDrag.current = false;
    }, 0);
  };

  /* =======================================================
     TRANSFORM
  ======================================================= */

  const trackTransform = `
    translate3d(
      calc(-${current * 100}% + ${dragX}px),
      0,
      0
    )
  `;

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!images.length) {
    return null;
  }

  /* =======================================================
     CURRENT LIGHTBOX IMAGE
  ======================================================= */

  const lightboxImage =
    images[lightboxIndex];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <div
        className={`image-carousel ${className}`}
        tabIndex={0}
        role="region"
        aria-label={`${alt} gallery`}
        onKeyDown={handleKeyDown}
      >
        {/* =================================================
            VIEWPORT
        ================================================= */}

        <div
          ref={viewportRef}
          className={`image-carousel-viewport ${
            isDragging
              ? "image-carousel-viewport--dragging"
              : ""
          }`}
          style={
            ratio
              ? {
                  aspectRatio: ratio,
                }
              : {
                  aspectRatio: "16 / 9",
                }
          }
          onPointerDown={
            handlePointerDown
          }
          onPointerMove={
            handlePointerMove
          }
          onPointerUp={handlePointerUp}
          onPointerCancel={
            handlePointerCancel
          }
          onPointerEnter={
            handlePointerEnter
          }
          onPointerLeave={
            handlePointerLeave
          }
        >
          {/* ===============================================
              TRACK
          =============================================== */}

          <div
            className="image-carousel-track"
            style={{
              transform: trackTransform,

              transition: isDragging
                ? "none"
                : "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)",

              cursor: "pointer",
            }}
          >
            {images.map(
              (src, index) => (
                <div
                  className={`image-carousel-slide ${
                    index === current
                      ? "image-carousel-slide--active"
                      : ""
                  }`}
                  key={`${src}-${index}`}
                >
                  <img
                    src={src}
                    alt={`${alt} ${
                      index + 1
                    }`}
                    loading="eager"
                    draggable={false}
                  />
                </div>
              )
            )}
          </div>

          {/* =================================================
              COUNTER
          ================================================= */}

          {total > 1 && (
            <span className="image-carousel-counter">
              {current + 1} / {total}
            </span>
          )}

          {/* =================================================
              PROGRESS
          ================================================= */}

          {total > 1 && (
            <div
              className="image-carousel-progress"
              aria-hidden="true"
            >
              <div
                key={`${current}-${isHovered}`}
                className={`image-carousel-progress-bar ${
                  isHovered || isDragging
                    ? "image-carousel-progress-bar--paused"
                    : ""
                }`}
              />
            </div>
          )}

          {/* =================================================
              DOTS
          ================================================= */}

          {total > 1 && (
            <div
              className="image-carousel-dots"
              aria-label="Pilih gambar"
            >
              {images.map(
                (_, index) => (
                  <button
                    type="button"
                    key={index}
                    className={`image-carousel-dot ${
                      index === current
                        ? "image-carousel-dot--active"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();

                      goTo(index);
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                    }}
                    aria-label={`Ke foto ${
                      index + 1
                    }`}
                    aria-current={
                      index === current
                        ? "true"
                        : undefined
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================
          LIGHTBOX
      =================================================== */}

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="image-lightbox"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            onClick={() => {
              /*
               * Jangan tutup lightbox kalau
               * user baru saja selesai drag
               * foto (bukan klik background).
               */
              if (lightboxDidDrag.current) {
                return;
              }

              closeLightbox();
            }}
          >
            {/* =============================================
                CLOSE
            ============================================= */}

            <button
              type="button"
              className="image-lightbox-close"
              onClick={(e) => {
                e.stopPropagation();

                closeLightbox();
              }}
              aria-label="Tutup preview"
            >
              <X size={22} />
            </button>

            {/* =============================================
                PREVIOUS
            ============================================= */}

            {total > 1 && (
              <button
                type="button"
                className="image-lightbox-nav image-lightbox-nav--prev"
                onClick={(e) => {
                  e.stopPropagation();

                  lightboxPrev();
                }}
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft size={26} />
              </button>
            )}

            {/* =============================================
                IMAGE

                Bisa digeser kanan/kiri pakai mouse
                atau jari (drag="x" dari framer-motion).
                Kalau geseran cukup jauh/cepat -> pindah
                foto. Kalau tidak -> otomatis balik ke
                tengah (snap back) berkat dragConstraints.
            ============================================= */}

            <AnimatePresence
              mode="wait"
              initial={false}
            >
              <motion.div
                key={lightboxIndex}
                className="image-lightbox-content"
                initial={{
                  scale: 0.92,
                  y: 15,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  y: 0,
                  opacity: 1,
                }}
                exit={{
                  scale: 0.92,
                  y: 15,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.3,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                onClick={(e) =>
                  e.stopPropagation()
                }
                drag={
                  total > 1 ? "x" : false
                }
                dragConstraints={{
                  left: 0,
                  right: 0,
                }}
                dragElastic={0.75}
                onDragStart={
                  handleLightboxDragStart
                }
                onDrag={handleLightboxDrag}
                onDragEnd={
                  handleLightboxDragEnd
                }
                whileDrag={{
                  cursor: "grabbing",
                }}
                style={{
                  cursor:
                    total > 1
                      ? "grab"
                      : "default",
                  touchAction: "none",
                }}
              >
                <img
                  src={lightboxImage}
                  alt={`${alt} ${
                    lightboxIndex + 1
                  }`}
                  draggable={false}
                />

                <div className="image-lightbox-info">
                  <span>
                    {lightboxIndex + 1}
                    {" / "}
                    {total}
                  </span>

                  <p>
                    Geser foto atau klik
                    di luar untuk menutup
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* =============================================
                NEXT
            ============================================= */}

            {total > 1 && (
              <button
                type="button"
                className="image-lightbox-nav image-lightbox-nav--next"
                onClick={(e) => {
                  e.stopPropagation();

                  lightboxNext();
                }}
                aria-label="Foto berikutnya"
              >
                <ChevronRight size={26} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}