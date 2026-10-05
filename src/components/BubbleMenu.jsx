import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import {
  FolderKanban,
  ScrollText,
  Trophy,
  Layers,
} from "lucide-react";

import "./BubbleMenu.css";

/* =========================================================
   ICONS
========================================================= */

const ICONS = {
  Projects: FolderKanban,
  Certificates: ScrollText,
  Awards: Trophy,
  "Tech Stack": Layers,
  Tech: Layers,
};

/* =========================================================
   DEFAULT ITEMS
========================================================= */

const DEFAULT_ITEMS = [
  {
    label: "Projects",
    href: "#projects",
    ariaLabel: "Projects",
    rotation: -2,
    hoverStyles: {
      bgColor: "#3b82f6",
      textColor: "#ffffff",
    },
  },

  {
    label: "Certificates",
    href: "#certificates",
    ariaLabel: "Certificates",
    rotation: 2,
    hoverStyles: {
      bgColor: "#6366f1",
      textColor: "#ffffff",
    },
  },

  {
    label: "Awards",
    href: "#awards",
    ariaLabel: "Awards",
    rotation: -2,
    hoverStyles: {
      bgColor: "#8b5cf6",
      textColor: "#ffffff",
    },
  },

  {
    label: "Tech Stack",
    href: "#tech",
    ariaLabel: "Tech Stack",
    rotation: 2,
    hoverStyles: {
      bgColor: "#06b6d4",
      textColor: "#ffffff",
    },
  },
];

/* =========================================================
   BUBBLE MENU
========================================================= */

export default function BubbleMenu({
  items,
  onItemClick,
  activeTab,
  onAnimationComplete,
}) {
  const containerRef = useRef(null);

  const bubbleItemsRef = useRef([]);

  const hasAnimatedRef = useRef(false);
const hasTriggeredCardsRef = useRef(false);
  const menuItems =
    items?.length
      ? items
      : DEFAULT_ITEMS;


  /* =======================================================
     ENTRY ANIMATION

     Trigger:
     IntersectionObserver

     BUKAN:
     - ready
     - ScrollTrigger
     - whileInView
  ======================================================= */

  useEffect(() => {
    const container =
      containerRef.current;

    const bubbles =
      bubbleItemsRef.current.filter(
        Boolean
      );


    if (!container || !bubbles.length) {
      return;
    }


    /* =====================================================
       RESET
    ===================================================== */

    hasAnimatedRef.current = false;
    hasTriggeredCardsRef.current = false; // ⭐ tambahkan ini

    gsap.killTweensOf(bubbles);


    gsap.set(bubbles, {
      autoAlpha: 0,
      y: 55,
      scale: 0.82,
    });


    /* =====================================================
       ANIMATE
    ===================================================== */

const animateBubbles = () => {
  if (hasAnimatedRef.current) {
    return;
  }

  hasAnimatedRef.current = true;

  gsap.killTweensOf(bubbles);

gsap.to(bubbles, {
  autoAlpha: 1,
  y: 0,
  scale: 1,
  duration: 0.85,
  ease: "power4.out",

  stagger: {
    each: 0.13,
    from: "start",
  },

  overwrite: true,

  // ⭐ Trigger card Portfolio saat animasi bubble
  // sudah ~70% selesai (bukan menunggu 100%),
  // supaya jeda ke card terasa lebih rapat.
  onUpdate: function () {
    if (
      this.progress() >= 0.7 &&
      !hasTriggeredCardsRef.current
    ) {
      hasTriggeredCardsRef.current = true;
      onAnimationComplete?.();
    }
  },
});
};


    /* =====================================================
       INTERSECTION OBSERVER

       Portfolio harus masuk viewport terlebih dahulu.
    ===================================================== */

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {

            if (
              entry.isIntersecting
            ) {
              animateBubbles();

              /*
               * Hanya animasi satu kali
               * selama component hidup.
               */
              observer.unobserve(
                entry.target
              );
            }

          });
        },
        {
          /*
           * 20% container terlihat
           * → mulai animasi
           */
          threshold: 0.2,

          /*
           * Sedikit lebih awal sebelum
           * benar-benar masuk viewport.
           */
          rootMargin:
            "0px 0px -40px 0px",
        }
      );


    observer.observe(container);


    /* =====================================================
       FALLBACK

       Kalau element ternyata sudah berada
       di viewport ketika observer dibuat.
    ===================================================== */

    const rect =
      container.getBoundingClientRect();

    const viewportHeight =
      window.innerHeight ||
      document.documentElement
        .clientHeight;


    const alreadyVisible =
      rect.top <
        viewportHeight * 0.8 &&
      rect.bottom >
        viewportHeight * 0.2;


    if (alreadyVisible) {
      requestAnimationFrame(() => {
        animateBubbles();
      });
    }


    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      observer.disconnect();

      gsap.killTweensOf(bubbles);
    };

  }, [menuItems.length]);


  /* =========================================================
     HOVER
========================================================= */

  useEffect(() => {
    const wrappers =
      bubbleItemsRef.current.filter(
        Boolean
      );


    const cleanup = [];


    wrappers.forEach((wrapper) => {

      const link =
        wrapper.querySelector(
          ".pill-link"
        );


      if (!link) return;


      const handleMouseEnter = () => {

        gsap.to(link, {
          y: -6,

          scale: 1.02,

          duration: 0.35,

          ease: "expo.out",

          overwrite: true,
        });

      };


      const handleMouseLeave = () => {

        gsap.to(link, {
          y: 0,

          scale: 1,

          duration: 0.45,

          ease:
            "elastic.out(1, 0.75)",

          overwrite: true,
        });

      };


      link.addEventListener(
        "mouseenter",
        handleMouseEnter
      );

      link.addEventListener(
        "mouseleave",
        handleMouseLeave
      );


      cleanup.push(() => {

        link.removeEventListener(
          "mouseenter",
          handleMouseEnter
        );

        link.removeEventListener(
          "mouseleave",
          handleMouseLeave
        );

      });

    });


    return () => {
      cleanup.forEach(
        (fn) => fn()
      );
    };

  }, [menuItems.length]);


  /* =========================================================
     RENDER
========================================================= */

  return (
    <div
      ref={containerRef}
      className="bubble-menu-inline"
    >

      <ul
        className="pill-list"
        role="menu"
        aria-label="Portfolio categories"
      >

        {menuItems.map(
          (item, idx) => {

            const Icon =
              item.icon ||
              ICONS[item.label] ||
              FolderKanban;


const normalizedLabel =
  item.label
    .toLowerCase()
    .replace(
      /\s+/g,
      "-"
    );


    const isTechMatch =
      normalizedLabel === "tech-stack" &&
      activeTab === "tech";

    const isActive =
      activeTab ===
        normalizedLabel ||
      activeTab ===
        item.label.toLowerCase() ||
      isTechMatch;


            return (
              <li
                key={idx}

                role="none"

                className="pill-col"

                ref={(el) => {
                  bubbleItemsRef.current[
                    idx
                  ] = el;
                }}
              >

                <a
                  role="menuitem"

                  href={item.href}

                  aria-label={
                    item.ariaLabel ||
                    item.label
                  }

                  className={`
                    pill-link
                    ${
                      isActive
                        ? "pill-link--active"
                        : ""
                    }
                  `}

                  data-rot={`${
                    item.rotation ?? 0
                  }deg`}

                  style={{
                    "--item-rot":
                      `${
                        item.rotation ?? 0
                      }deg`,

                    "--hover-bg":
                      item.hoverStyles
                        ?.bgColor ||
                      "#3b82f6",

                    "--hover-color":
                      item.hoverStyles
                        ?.textColor ||
                      "#ffffff",
                  }}

                  onClick={(e) => {

                    e.preventDefault();

                    onItemClick?.(
                      item.label
                    );

                  }}
                >

                  <span
                    className="pill-icon"
                    aria-hidden
                  >
                    <Icon
                      size={20}
                      strokeWidth={2}
                    />
                  </span>


                  <span className="pill-label">
                    {item.label}
                  </span>


                  <span
                    className="pill-arrow"
                    aria-hidden
                  >
                    ↗
                  </span>

                </a>

              </li>
            );

          }
        )}

      </ul>

    </div>
  );
}