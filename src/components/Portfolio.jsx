import {
  useState,
  useRef,
  lazy,
  Suspense,
} from "react";

import { motion, useReducedMotion,  } from "./motion";

import BubbleMenu from "./BubbleMenu";
import PortfolioContent from "./PortfolioContent";
import DriftWall from "./DriftWall";
const CircularGallery = lazy(() => import("./CircularGallery"));
import Folder from "./Folder";
import Wishlist from "./Wishlist";

import c1 from "../assets/portfolio/galery/circular/barudak cuanki.jpeg";
import c2 from "../assets/portfolio/galery/circular/barudak esemka.jpeg";
import c3 from "../assets/portfolio/galery/circular/biasa si persib.jpeg";
import c4 from "../assets/portfolio/galery/circular/hoki juara 1.jpeg";
import c5 from "../assets/portfolio/galery/circular/hunting buku.jpeg";
import c6 from "../assets/portfolio/galery/circular/keluarga alit.jpeg";
import c7 from "../assets/portfolio/galery/circular/lagi ngopi.jpeg";
import c8 from "../assets/portfolio/galery/circular/lomba mamasakan.jpeg";
import c9 from "../assets/portfolio/galery/circular/muncak dulu.jpeg";
import c10 from "../assets/portfolio/galery/circular/oxigen dulu.jpeg";
import c11 from "../assets/portfolio/galery/circular/si persib.jpeg";
import c12 from "../assets/portfolio/galery/circular/suntikan persib.jpeg";
import c13 from "../assets/portfolio/galery/circular/NFE.jpeg";
import c14 from "../assets/portfolio/galery/circular/wisuda esemka.jpeg";

import mBiasa from "../assets/portfolio/galery/masonry/biasa.jpeg";
import mBlueWhite from "../assets/portfolio/galery/masonry/blue and white.jpeg";
import mBraga1 from "../assets/portfolio/galery/masonry/braga 1.jpeg";
import mBraga2 from "../assets/portfolio/galery/masonry/braga 2.jpeg";
import mBuku from "../assets/portfolio/galery/masonry/buku.jpeg";
import mCurug from "../assets/portfolio/galery/masonry/curug horor.jpeg";
import mGabut from "../assets/portfolio/galery/masonry/gabut.jpeg";
import mGbla from "../assets/portfolio/galery/masonry/gbla.jpeg";
import mKonvoi from "../assets/portfolio/galery/masonry/konvoi.jpeg";
import mLembang from "../assets/portfolio/galery/masonry/lembang.jpeg";
import mNgopi from "../assets/portfolio/galery/masonry/ngopi.jpeg";
import mPangradinan from "../assets/portfolio/galery/masonry/pangradinan.jpeg";
import mSunrise from "../assets/portfolio/galery/masonry/sunrise.jpeg";
import mTetapHidup from "../assets/portfolio/galery/masonry/tetap hidup !!!.jpeg";
import mWa from "../assets/portfolio/galery/masonry/WhatsApp Image 2026-09-28 at 16.07.11.jpeg";

import "./Portfolio.css";
import LazyMount from "./LazyMount";


/* =========================================================
   SLIDE IN
========================================================= */

function SlideIn({
  from = "left",
  delay = 0,
  amount = 0.25,
  children,
}) {
  const reduce =
    useReducedMotion();

  if (reduce) {
    return <div>{children}</div>;
  }


  const distance = 120;

  const x =
    from === "left"
      ? -distance
      : distance;


  return (
    <motion.div
      initial={{
        opacity: 0,
        x,
      }}

      whileInView={{
        opacity: 1,
        x: 0,
      }}

      viewport={{
        once: true,
        amount,

        margin:
          "0px 0px -60px 0px",
      }}

      transition={{
        duration: 0.9,

        delay,

        ease: [
          0.16,
          1,
          0.3,
          1,
        ],
      }}
    >
      {children}
    </motion.div>
  );
}


/* =========================================================
   PORTFOLIO
========================================================= */

export default function Portfolio({
  activeTab,
  onTabChange,
}) {

  /* =======================================================
     MENU
  ======================================================= */

  const portfolioItems = [
    {
      label: "Projects",
      href: "#projects",
      rotation: -3,

      hoverStyles: {
        bgColor: "#3b82f6",
        textColor: "#ffffff",
      },
    },

    {
      label: "Certificates",
      href: "#certificates",
      rotation: 2.5,

      hoverStyles: {
        bgColor: "#6366f1",
        textColor: "#ffffff",
      },
    },

    {
      label: "Awards",
      href: "#awards",
      rotation: -2.2,

      hoverStyles: {
        bgColor: "#8b5cf6",
        textColor: "#ffffff",
      },
    },

    {
      label: "Tech Stack",
      href: "#tech",
      rotation: 3,

      hoverStyles: {
        bgColor: "#06b6d4",
        textColor: "#ffffff",
      },
    },
  ];


  /* =======================================================
     STATE
  ======================================================= */

  const [showDriftWall, setShowDriftWall] =
    useState(false);

  // ⭐ Trigger untuk animasi card PortfolioContent.
  // Baru jadi true setelah animasi BubbleMenu selesai.
  const [animationReady, setAnimationReady] =
    useState(false);


  const driftWallRef =
    useRef(null);


  /* =======================================================
     FOLDER
  ======================================================= */

  const handleFolderOpen = (
    isOpen
  ) => {
    setShowDriftWall(isOpen);


    if (!isOpen) return;


    setTimeout(() => {
      if (!driftWallRef.current) {
        return;
      }


      if (window.__lenis) {
        window.__lenis.scrollTo(
          driftWallRef.current,
          {
            duration: 1.6,

            easing: (t) =>
              1 -
              Math.pow(
                1 - t,
                3
              ),

            offset: -20,
          }
        );
      }

      else {
        driftWallRef.current.scrollIntoView(
          {
            behavior: "smooth",
            block: "start",
          }
        );
      }
    }, 650);
  };


  /* =======================================================
     MENU CLICK
  ======================================================= */

  const handleMenuClick = (
    label
  ) => {
    const tabMap = {
      Projects: "projects",

      Certificates:
        "certificates",

      Awards: "awards",

      "Tech Stack": "tech",
    };


    const nextTab =
      tabMap[label] ||
      "projects";


    onTabChange?.(nextTab);
  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      id="portfolio"
      className="portfolio-section"
    >

      <div className="portfolio-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <SlideIn from="left">

          <div className="portfolio-header">

            <h2 className="portfolio-title">

              <span className="title-gradient">
                Portfolio
              </span>

            </h2>


            <p className="portfolio-subtitle">
              Explore my work,
              achievements, and
              technical expertise
            </p>

          </div>

        </SlideIn>


        {/* =================================================
            BUBBLE MENU

            ready digunakan sebagai trigger.
            onAnimationComplete akan memicu
            animasi card di PortfolioContent
            setelah animasi bubble selesai.
        ================================================= */}

        <div className="bubble-menu-animation-wrapper">

          <div className="bubble-menu-wrapper">

            <BubbleMenu
  items={portfolioItems}
  onItemClick={handleMenuClick}
  activeTab={activeTab}
  onAnimationComplete={() => {
    setAnimationReady(true);
  }}
/>

          </div>

        </div>


        {/* =================================================
            CONTENT

            animationReady dioper ke sini supaya
            card baru animasi masuk setelah
            BubbleMenu selesai animasi.
        ================================================= */}

        <PortfolioContent
  key={activeTab}
  activeTab={activeTab}
  animationReady={animationReady}
/>
        {/* =================================================
            FOLDER
        ================================================= */}

        <SlideIn from="left">

          <div className="folder-section">

            <Folder
              color="#3b82f6"
              size={1.2}
              isOpen={showDriftWall}
              onOpenChange={
                handleFolderOpen
              }
            />

          </div>

        </SlideIn>


        {/* =================================================
            DRIFT WALL + CIRCULAR GALLERY (hanya setelah klik album)
        ================================================= */}

        {showDriftWall && (
          <>

            <SlideIn
              from="right"
              amount={0.15}
            >

              <div
                className="masonry-section"
                ref={driftWallRef}
              >

                <DriftWall
                  onClose={() => setShowDriftWall(false)}
                  items={[
                    { id: "m-biasa", img: mBiasa, title: "biasa", height: 280 },
                    { id: "m-blue-white", img: mBlueWhite, title: "blue and white", height: 520 },
                    { id: "m-braga1", img: mBraga1, title: "braga 1", height: 500 },
                    { id: "m-braga2", img: mBraga2, title: "braga 2", height: 500 },
                    { id: "m-buku", img: mBuku, title: "buku", height: 540 },
                    { id: "m-curug", img: mCurug, title: "curug horor", height: 500 },
                    { id: "m-gabut", img: mGabut, title: "gabut", height: 540 },
                    { id: "m-gbla", img: mGbla, title: "gbla", height: 520 },
                    { id: "m-konvoi", img: mKonvoi, title: "konvoi", height: 520 },
                    { id: "m-lembang", img: mLembang, title: "lembang", height: 520 },
                    { id: "m-ngopi", img: mNgopi, title: "ngopi", height: 520 },
                    { id: "m-pangradinan", img: mPangradinan, title: "pangradinan", height: 520 },
                    { id: "m-sunrise", img: mSunrise, title: "sunrise", height: 280 },
                    { id: "m-tetap-hidup", img: mTetapHidup, title: "tetap hidup !!!", height: 520 },
                    { id: "m-wa", img: mWa, title: "maen ps", height: 520 },
                  ]}
                />

              </div>

            </SlideIn>


            <SlideIn
              from="left"
              amount={0.15}
            >

              <div className="circular-gallery-section">

                <LazyMount minHeight={256} fallback={<div className="w-full h-64" />}>
<Suspense fallback={<div className="w-full h-64" />}>
                  <CircularGallery
                    bend={3}
                    textColor="#ffffff"
                    borderRadius={0.05}
                    scrollSpeed={2}
                    scrollEase={0.05}
                    items={[
                      { image: c1, text: 'barudak cuanki' },
                      { image: c2, text: 'barudak esemka' },
                      { image: c3, text: 'biasa si persib' },
                      { image: c4, text: 'hoki juara 1' },
                      { image: c5, text: 'hunting buku' },
                      { image: c6, text: 'keluarga alit' },
                      { image: c7, text: 'lagi ngopi' },
                      { image: c8, text: 'lomba mamasakan' },
                      { image: c9, text: 'muncak dulu' },
                      { image: c10, text: 'oxigen dulu' },
                      { image: c11, text: 'si persib' },
                      { image: c12, text: 'suntikan persib' },
                      { image: c13, text: 'NFE' },
                      { image: c14, text: 'wisuda esemka' },
                    ]}
                  />
                </Suspense>
</LazyMount>

                <p className="circular-gallery-hint">
                  drag • scroll • arrow keys
                </p>

              </div>
            </SlideIn>

          </>
        )}

        {/* =================================================
            WISHLIST — selalu tampil di bawah CircularGallery,
            tanpa perlu klik album dulu
        ================================================= */}

        <SlideIn from="left" amount={0.1}>
          <div className="wishlist-section-wrapper" style={{ marginTop: '40px' }}>
            <Wishlist />
          </div>
        </SlideIn>


      </div>

    </section>
  );
}