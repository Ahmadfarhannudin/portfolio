import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import Lenis from "lenis";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import ScrollProgressBar from "./components/ScrollProgressBar";

import {
  Home,
  User,
  Briefcase,
  Mail,
} from "lucide-react";

import { NavBar } from "./components/ui/tubelight-navbar";

import Hero from "./components/Hero";
import About from "./components/About";
import Portfolio from "./components/Portfolio";
import Contact from "./components/Contact";
import NotFound from "./components/NotFound";

import SpaceBackground from "./components/SpaceBackground";
import TargetCursor from "./components/TargetCursor";
import { useIsCoarsePointer } from "./hooks/useMediaQuery";

import LoadingScreen from "./components/LoadingScreen";

import WhatsAppButton from "./components/WhatsAppButton";

/* =========================================================
   LAZY LOADED ROUTES
   Diload on-demand untuk reduce initial bundle size
========================================================= */

const ProjectDetail = lazy(() => import("./components/projects/ProjectDetail"));

/* =========================================================
   KNOWN ROUTES

   Dipakai untuk mendeteksi apakah URL saat ini VALID
   (cocok salah satu Route yang benar-benar ada) atau tidak.
   Kalau tidak valid, LoadingScreen dilewati sepenuhnya dan
   halaman langsung menampilkan NotFound — tidak perlu
   menunggu animasi loading yang memang ditujukan untuk
   konten utama.
========================================================= */

function isKnownRoute(pathname) {
  if (pathname === "/") {
    return true;
  }

  // Cocok dengan pola "/projects/:id" (id apa pun, satu segmen)
  if (/^\/projects\/[^/]+\/?$/.test(pathname)) {
    return true;
  }

  return false;
}

/* =========================================================
   NAVBAR WRAPPER
========================================================= */

function NavBarWrapper({ items, ready }) {
  const location = useLocation();

  if (location.pathname.startsWith("/projects/")) {
    return null;
  }

  return (
    <NavBar
      items={items}
      ready={ready}
    />
  );
}

/* =========================================================
   HOME PAGE
========================================================= */

function HomePage({
  ready,
  portfolioTab,
  onTabChange,
  onPortfolioSelect,
}) {
  return (
    <>
      {/* =====================================================
          HERO
      ===================================================== */}

      <Hero ready={ready} />

      {/* =====================================================
          ABOUT

          ready diteruskan ke About agar EncryptedText
          baru mulai setelah LoadingScreen selesai.
      ===================================================== */}

      <About
        onPortfolioSelect={onPortfolioSelect}
      />

      {/* =====================================================
          PORTFOLIO
      ===================================================== */}

      <Portfolio
        activeTab={portfolioTab}
        onTabChange={onTabChange}
      />

      {/* =====================================================
          CONTACT
      ===================================================== */}

      <Contact />
    </>
  );
}

/* =========================================================
   APP CONTENT
   ---------------------------------------------------------
   Semua logic (loading, Lenis, dsb) dipindah ke sini —
   komponen ini ada DI DALAM <BrowserRouter>, jadi bisa
   memakai useLocation() untuk tahu URL saat ini SEBELUM
   memutuskan apakah perlu menampilkan LoadingScreen.
========================================================= */

function AppContent() {
  const location = useLocation();
  const isCoarsePointer = useIsCoarsePointer();

  const knownRoute = isKnownRoute(
    location.pathname
  );

  /* =========================================================
     STATE

     Untuk URL yang TIDAK valid, isLoading langsung di-set
     false sejak awal (tidak pernah true), jadi LoadingScreen
     tidak pernah dirender sama sekali — tidak ada flash
     loading screen sebelum pindah ke NotFound.
  ========================================================= */

  const [portfolioTab, setPortfolioTab] =
    useState("projects");

  const [isLoading, setIsLoading] =
    useState(knownRoute);

  /* =========================================================
     NAVIGATION ITEMS
  ========================================================= */

  const navItems = [
    {
      name: "Home",
      url: "#home",
      icon: Home,
    },
    {
      name: "About",
      url: "#about",
      icon: User,
    },
    {
      name: "Portfolio",
      url: "#portfolio",
      icon: Briefcase,
    },
    {
      name: "Contact",
      url: "#contact",
      icon: Mail,
    },
  ];

  /* =========================================================
     FORCE PAGE START FROM TOP
     (dilewati untuk URL yang tidak valid — halaman NotFound
     tidak butuh reset scroll/Lenis serumit halaman utama)
  ========================================================= */

  useEffect(() => {
    if (!knownRoute) {
      return;
    }

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const hardReset = () => {
      window.scrollTo(0, 0);

      document.documentElement.scrollTop = 0;

      document.body.scrollTop = 0;

      if (window.__lenis?.scrollTo) {
        window.__lenis.scrollTo(0, {
          immediate: true,
        });
      }
    };

    /* =======================================================
       LOADING AKTIF
    ======================================================= */

    if (isLoading) {
      document.body.style.overflow = "hidden";

      hardReset();

      requestAnimationFrame(() => {
        hardReset();
      });
    }

    /* =======================================================
       LOADING SELESAI
    ======================================================= */

    else {
      document.body.style.overflow = "";

      /*
       * Tunggu satu frame agar LoadingScreen benar-benar
       * selesai sebelum section mulai melakukan animasi.
       */

      requestAnimationFrame(() => {
        hardReset();

        /*
         * Frame kedua memastikan layout sudah selesai.
         */

        requestAnimationFrame(() => {
          window.dispatchEvent(
            new Event("portfolio-ready")
          );
        });
      });

      /*
       * Safety reset
       */

      setTimeout(() => {
        hardReset();
      }, 50);
    }

    /* =======================================================
       BACK / FORWARD CACHE
    ======================================================= */

    const onPageShow = () => {
      hardReset();
    };

    window.addEventListener(
      "pageshow",
      onPageShow
    );

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener(
        "pageshow",
        onPageShow
      );
    };
  }, [isLoading, knownRoute]);

  /* =========================================================
     LENIS
     (dilewati untuk URL yang tidak valid)
  ========================================================= */

  useEffect(() => {
    if (!knownRoute) {
      return;
    }

    /*
     * Jangan membuat Lenis ketika loading.
     */

    if (isLoading) return;

    const lenis = new Lenis({
      duration: isCoarsePointer ? 0.5 : 1.05,
      easing: (t) =>
        Math.min(
          1,
          1.001 - Math.pow(2, -10 * t)
        ),
      smoothWheel: !isCoarsePointer,
      syncTouch: false,
      touchMultiplier: 1,
    });

    window.__lenis = lenis;

    /* =======================================================
       MULAI DARI ATAS
    ======================================================= */

    lenis.scrollTo(0, {
      immediate: true,
    });

    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);

      lenis.scrollTo(0, {
        immediate: true,
      });
    });

    /* =======================================================
       RAF
    ======================================================= */

    let rafId;

    const raf = (time) => {
      lenis.raf(time);

      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);

      lenis.destroy();

      window.__lenis = null;
    };
  }, [isLoading, knownRoute, isCoarsePointer]);

  /* =========================================================
     PORTFOLIO SELECT
  ========================================================= */

  const handlePortfolioSelect =
    useCallback(
      (tab) => {
        const normalized =
          tab.toLowerCase();

        const map = {
          projects: "projects",

          certificates:
            "certificates",

          awards: "awards",

          tech: "tech",

          "tech stack": "tech",
        };

        const next =
          map[normalized] ||
          "projects";

        setPortfolioTab(next);

        /*
         * Tunggu React selesai update.
         */

        requestAnimationFrame(() => {
          const el =
            document.getElementById(
              "portfolio"
            );

          if (!el) return;

          if (
            window.__lenis?.scrollTo
          ) {
            window.__lenis.scrollTo(
              el,
              {
                offset: -20,
              }
            );
          } else {
            el.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        });
      },
      []
    );

  /* =========================================================
     RENDER — URL TIDAK VALID
     ---------------------------------------------------------
     Langsung tampilkan NotFound, TANPA LoadingScreen, TANPA
     Navbar, dan tanpa efek berat lain (Lenis dsb) yang memang
     hanya relevan untuk halaman utama.
  ========================================================= */

  if (!knownRoute) {
    return (
      <>
        <ScrollProgressBar />

        <main
          className="
            relative
            min-h-screen
            bg-[#020617]
            text-white
            overflow-hidden
          "
        >
          <div
            className="
              fixed
              inset-0
              z-0
              pointer-events-none
            "
          >
            <SpaceBackground
              meteorCount={isCoarsePointer ? 1 : 3}
              showMeteors={!isCoarsePointer}
              showStars={true}
              starCount={isCoarsePointer ? 28 : 60}
              showNebula={!isCoarsePointer}
            />
          </div>



          <div className="relative z-10">
            <NotFound />
          </div>

          <WhatsAppButton />
        </main>
      </>
    );
  }

  /* =========================================================
     RENDER — URL VALID (alur normal, tidak berubah)
  ========================================================= */

  return (
    <>

      {/* =====================================================
           SCROLL PROGRESS
      ===================================================== */}

      <ScrollProgressBar />

      {/* =====================================================
           LOADING SCREEN
      ===================================================== */}

      {isLoading && (
        <LoadingScreen
          onFinish={() => {
            setIsLoading(false);
          }}
        />
      )}

      {/* =====================================================
           MAIN
      ===================================================== */}

      <main
        className="
          relative
          min-h-screen
          bg-[#020617]
          text-white
          overflow-hidden
        "
      >

        {/* ===================================================
            SPACE BACKGROUND
        =================================================== */}

        <div
          className="
            fixed
            inset-0
            z-0
            pointer-events-none
          "
        >
          <SpaceBackground
            meteorCount={isCoarsePointer ? 1 : 3}
            showMeteors={!isCoarsePointer}
            showStars={true}
            starCount={isCoarsePointer ? 28 : 60}
            showNebula={!isCoarsePointer}
          />
        </div>

        {/* ===================================================
            TARGET CURSOR
        =================================================== */}

        {!isCoarsePointer && (
          <TargetCursor
            areaSelector=".wishlist-polaroid-stage, .masonry-section"
            targetSelector=".masonry-item, .wishlist-polaroid"
            cursorColor="#ffffff"
            cursorColorOnTarget="#8b5cf6"
          />
        )}


        {/* ===================================================
            NAVBAR
        =================================================== */}

        <NavBarWrapper
          items={navItems}
          ready={!isLoading}
        />

        {/* ===================================================
            ROUTES
        =================================================== */}

        <div
          className="
            relative
            z-10
          "
        >
          <Routes>

            {/* =================================================
                HOME
            ================================================= */}

            <Route
              path="/"
              element={
                <HomePage
                  ready={!isLoading}
                  portfolioTab={portfolioTab}
                  onTabChange={
                    handlePortfolioSelect
                  }
                  onPortfolioSelect={
                    handlePortfolioSelect
                  }
                />
              }
            />

            {/* =================================================
                PROJECT DETAIL
            ================================================= */}

            <Route
              path="/projects/:id"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                      <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    </div>
                  }
                >
                  <ProjectDetail />
                </Suspense>
              }
            />

          </Routes>
        </div>
               <WhatsAppButton />
      </main>
    </>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;