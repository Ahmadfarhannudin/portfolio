import {
  useEffect,
  useRef,
  useState,
} from "react";

import { AnimatePresence, motion,  } from "../motion";

import {
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";

import "./AppleCardsCarousel.css";


/* =========================================================
   PHONE CARD
========================================================= */

function Card({
  card,
  index,
  onOpen,
}) {
  return (
    <motion.article
      className="apple-phone-card"
      initial={{
        opacity: 0,
        y: 35,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -8,
      }}
      onClick={() => onOpen(card)}
    >

      {/* =================================================
          PHONE BODY
      ================================================= */}

      <div className="apple-phone-frame">

        {/* ===============================================
            SIDE BUTTONS
        =============================================== */}

        <span className="phone-side-button phone-side-button-1" />
        <span className="phone-side-button phone-side-button-2" />
        <span className="phone-side-button phone-side-button-3" />


        {/* ===============================================
            SCREEN
        =============================================== */}

        <div className="apple-phone-screen">

          {/* =============================================
              TOP BAR
          ============================================= */}

          <div className="phone-status-bar">

            <span className="phone-time">
              9:41
            </span>

            <div className="phone-status-icons">

              <span className="phone-signal">
                ●●●
              </span>

              <span className="phone-wifi">
                ◔
              </span>

              <span className="phone-battery">
                ▬
              </span>

            </div>

          </div>


          {/* =============================================
              DYNAMIC ISLAND
          ============================================= */}

          <div className="phone-dynamic-island">
            <span />
            <span />
          </div>


          {/* =============================================
              SCREEN IMAGE
          ============================================= */}

          <div className="phone-image-wrapper">

            <img
              src={card.src}
              alt={card.title}
              className="apple-phone-image"
              loading="lazy"
              draggable="false"
            />

          </div>


          {/* =============================================
              SCREEN OVERLAY
          ============================================= */}

          <div className="phone-screen-overlay" />


          {/* =============================================
              PROJECT LABEL
          ============================================= */}

          <div className="phone-project-info">

            <span className="phone-project-category">
              {card.category}
            </span>

            <h3 className="phone-project-title">
              {card.title}
            </h3>

          </div>


          {/* =============================================
              HOME INDICATOR
          ============================================= */}

          <span className="phone-home-indicator" />

        </div>

      </div>


      {/* =================================================
          NUMBER
      ================================================= */}

      <span className="apple-phone-number">
        {String(index + 1).padStart(2, "0")}
      </span>

    </motion.article>
  );
}


/* =========================================================
   CAROUSEL
========================================================= */

function Carousel({
  items = [],
}) {

  const trackRef =
    useRef(null);

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(false);

  const [activeCard, setActiveCard] =
    useState(null);


  /* =======================================================
     UPDATE SCROLL
  ======================================================= */

  const updateScrollState = () => {

    const element =
      trackRef.current;

    if (!element) {
      return;
    }

    const maxScroll =
      element.scrollWidth -
      element.clientWidth;

    setCanScrollLeft(
      element.scrollLeft > 5
    );

    setCanScrollRight(
      element.scrollLeft <
        maxScroll - 5
    );
  };


  /* =======================================================
     INITIALIZE
  ======================================================= */

  useEffect(() => {

    updateScrollState();

    const element =
      trackRef.current;

    if (!element) {
      return;
    }

    element.addEventListener(
      "scroll",
      updateScrollState,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      updateScrollState
    );

    return () => {

      element.removeEventListener(
        "scroll",
        updateScrollState
      );

      window.removeEventListener(
        "resize",
        updateScrollState
      );

    };

  }, [items.length]);


  /* =======================================================
     SCROLL
  ======================================================= */

  const scroll = (
    direction
  ) => {

    const element =
      trackRef.current;

    if (!element) {
      return;
    }

    const card =
      element.querySelector(
        ".apple-phone-card"
      );

    const cardWidth =
      card?.getBoundingClientRect()
        .width || 300;

    const gap = 30;

    const distance =
      (cardWidth + gap) * 2;

    element.scrollBy({

      left:
        direction === "left"
          ? -distance
          : distance,

      behavior: "smooth",

    });

  };


  /* =======================================================
     KEYBOARD
  ======================================================= */

  const handleKeyDown = (
    event
  ) => {

    if (
      event.key ===
      "ArrowLeft"
    ) {
      scroll("left");
    }

    if (
      event.key ===
      "ArrowRight"
    ) {
      scroll("right");
    }

  };


  /* =======================================================
     EMPTY
  ======================================================= */

  if (!items.length) {
    return null;
  }


  return (
    <>

      {/* ===================================================
          CAROUSEL
      =================================================== */}

      <div className="apple-phone-carousel">


        {/* ===============================================
            TRACK
        =============================================== */}

        <div
          ref={trackRef}
          className="apple-phone-track"
          tabIndex={0}
          onKeyDown={
            handleKeyDown
          }
          role="region"
          aria-label="Project gallery"
        >

          {items.map(
            (item, index) => (

              <Card
                key={
                  item.id ||
                  item.src ||
                  index
                }
                card={item}
                index={index}
                onOpen={
                  setActiveCard
                }
              />

            )
          )}

        </div>


        {/* ===============================================
            CONTROLS
        =============================================== */}

        <div className="apple-phone-controls">

          <div className="apple-phone-counter">

            <span>
              {items.length}
            </span>

            <i />

            <span>
              PHOTOS
            </span>

          </div>


          <div className="apple-phone-buttons">

            <button
              type="button"
              className="apple-phone-button"
              onClick={() =>
                scroll("left")
              }
              disabled={
                !canScrollLeft
              }
              aria-label="Previous"
            >

              <ArrowLeft
                size={17}
              />

            </button>


            <button
              type="button"
              className="apple-phone-button"
              onClick={() =>
                scroll("right")
              }
              disabled={
                !canScrollRight
              }
              aria-label="Next"
            >

              <ArrowRight
                size={17}
              />

            </button>

          </div>

        </div>

      </div>


      {/* =================================================
          FULLSCREEN PREVIEW
      ================================================= */}

      <AnimatePresence>

        {activeCard && (

          <motion.div
            className="apple-phone-modal"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setActiveCard(null)
            }
          >

            <motion.div
              className="apple-phone-modal-content"
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.92,
                y: 20,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                type="button"
                className="apple-phone-modal-close"
                onClick={() =>
                  setActiveCard(null)
                }
                aria-label="Close preview"
              >

                <X size={20} />

              </button>


              <div className="modal-phone-frame">

                <div className="modal-phone-screen">

                  <div className="modal-phone-island" />

                  <img
                    src={
                      activeCard.src
                    }
                    alt={
                      activeCard.title
                    }
                    loading="lazy"
                    decoding="async"
                  />

                </div>

              </div>


              <div className="apple-phone-modal-info">

                <span>
                  {
                    activeCard.category
                  }
                </span>

                <h3>
                  {
                    activeCard.title
                  }
                </h3>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </>
  );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AppleCardsCarousel({
  data = [],
}) {

  const cards =
    data.map(
      (card, index) => ({
        ...card,

        id:
          card.id ||
          `gallery-${index}`,
      })
    );

  return (
    <Carousel
      items={cards}
    />
  );
}


export {
  Card,
  Carousel,
};