import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate,
  Link,
} from "react-router-dom";

import { gsap } from "gsap";

import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  UserRound,
  ChevronRight,
} from "lucide-react";

import UnpublishedModal from "../ui/UnpublishedModal";
import "../ui/UnpublishedModal.css";

import { getProjectById } from "./projectsData";

import {
  TECH_ICONS,
  getTechIconUrl,
} from "./techIcons";

import ImageCarousel from "./ImageCarousel";
import AppleCardsCarousel from "./AppleCardsCarousel";

import "./ProjectDetail.css";


/* =========================================================
   GITHUB ICON

   Tidak menggunakan lucide-react karena Github
   merupakan brand icon.
========================================================= */

function GithubIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.9 5.33.9 11.6c0 5.02 3.26 9.27 7.78 10.77.57.1.78-.25.78-.55 0-.27-.01-1.15-.02-2.09-3.16.69-3.83-1.34-3.83-1.34-.52-1.32-1.26-1.68-1.26-1.68-1.03-.7.08-.68.08-.68 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.16a10.9 10.9 0 0 1 5.74 0c2.19-1.47 3.15-1.16 3.15-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.65 5.31-5.18 5.59.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.66.79.55A11.1 11.1 0 0 0 23.1 11.6C23.1 5.33 18.27.5 12 .5Z" />
    </svg>
  );
}


/* =========================================================
   PROJECT DETAIL PAGE
========================================================= */

function isUnpublishedUrl(url) {
  if (!url) return true;
  const v = String(url).trim();
  return !v || v === "#" || v === "/" || v.startsWith("#");
}

/* =========================================================
   NAVIGASI KE BAGIAN TERTENTU DI HOME

   Dipakai oleh breadcrumb "Home" (scroll ke atas) dan
   breadcrumb "Portfolio" (scroll ke section #portfolio).
   Keduanya SENGAJA beda tujuan — lihat pemakaiannya di
   bawah, jangan disatukan lagi jadi satu handler.
========================================================= */

function goToHomeSection(navigate, sectionId) {
  navigate("/");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!sectionId) {
        window.scrollTo({ top: 0, behavior: "instant" });

        if (window.__lenis?.scrollTo) {
          window.__lenis.scrollTo(0, { immediate: true });
        }

        return;
      }

      const el = document.getElementById(sectionId);

      if (!el) return;

      if (window.__lenis?.scrollTo) {
        window.__lenis.scrollTo(el, { offset: -20 });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

export default function ProjectDetail() {
  const { id } = useParams();

  const navigate = useNavigate();

  const project = getProjectById(id);

  const [unpublishedOpen, setUnpublishedOpen] = useState(false);
  const [unpublishedTitle, setUnpublishedTitle] = useState("");


  /* =======================================================
     SCROLL TO TOP + PAGE ANIMATION
  ======================================================= */

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });

    if (window.__lenis?.scrollTo) {
      window.__lenis.scrollTo(0, {
        immediate: true,
      });
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".project-detail-animate",
        {
          opacity: 0,
          y: 28,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
        }
      );
    });

    return () => {
      ctx.revert();
    };
  }, [id]);


  /* =======================================================
     BACK BUTTON — KEMBALI KE HALAMAN SEBELUMNYA

     Sebelumnya, tombol ini SELALU memaksa navigate("/") lalu
     scroll ke #portfolio — jadi persis sama seperti breadcrumb
     "Portfolio", padahal fungsinya harus beda:

       - "Kembali" (tombol back)  -> kembali ke HALAMAN
         SEBELUMNYA di riwayat browser (mis. Google, halaman
         project lain, atau Portfolio — tergantung dari mana
         user datang).
       - Breadcrumb "Portfolio"   -> SELALU ke section
         Portfolio di Home (ini memang tujuannya, dibiarkan).

     window.history.state.idx (disuntik oleh library history
     yang dipakai react-router) menunjukkan kedalaman riwayat
     SESI ini. Kalau > 0, berarti ada halaman sebelumnya yang
     bisa dituju dengan navigate(-1). Kalau 0 atau tidak ada
     (mis. user membuka link project ini langsung / refresh),
     tidak ada riwayat untuk kembali — barulah fallback ke
     Portfolio di Home.
  ======================================================= */

  const handleBack = () => {
    const canGoBack =
      typeof window !== "undefined" &&
      window.history.state &&
      typeof window.history.state.idx === "number" &&
      window.history.state.idx > 0;

    if (canGoBack) {
      navigate(-1);
      return;
    }

    goToHomeSection(navigate, "portfolio");
  };


  /* =======================================================
     PROJECT NOT FOUND
  ======================================================= */

  if (!project) {
    return (
      <section className="project-detail-section">
        <div className="project-detail-container">

          <div className="project-not-found">

            <h2>
              Project tidak ditemukan
            </h2>

            <p>
              Project yang kamu cari
              sepertinya tidak ada.
            </p>

            <Link
              to="/"
              className="project-back-link"
            >
              <ArrowLeft
                size={18}
                strokeWidth={2}
              />

              <span>
                Kembali ke Portfolio
              </span>
            </Link>

          </div>

        </div>
      </section>
    );
  }


  /* =======================================================
     IMAGE SOURCE

     Carousel hero dan gallery di bawah sengaja
     memakai dua field TERPISAH:

       - carouselImages
         -> ImageCarousel di hero

       - galleryImages
         -> AppleCardsCarousel di Galeri

     Keduanya fallback dengan aman kalau field-nya
     kosong / belum diisi di projectsData.
  ======================================================= */

  const carouselImages =
    Array.isArray(
      project.carouselImages
    ) &&
    project.carouselImages.length > 0
      ? project.carouselImages
      : project.coverImage
        ? [project.coverImage]
        : [];


  const galleryImages =
    Array.isArray(
      project.galleryImages
    ) &&
    project.galleryImages.length > 0
      ? project.galleryImages
      : [];


  /* =======================================================
     APPLE CARDS CAROUSEL DATA

     AppleCardsCarousel membutuhkan format:

     {
       id,
       category,
       title,
       src
     }

     galleryImages tetap berupa array URL biasa.
  ======================================================= */

  const galleryItems =
    galleryImages.map(
      (src, index) => ({
        id: `${
          project.id ||
          project.title ||
          "project"
        }-gallery-${index}`,

        category:
          "PROJECT GALLERY",

        title: `${
          project.title
        } — Preview ${index + 1}`,

        src,
      })
    );


  /* =======================================================
     MAIN CONTENT
  ======================================================= */

  return (
    <section className="project-detail-section">

      <div className="project-detail-container">


        {/* =================================================
            TOPBAR
        ================================================= */}

        <div className="project-topbar project-detail-animate">


          {/* =================================================
              BACK BUTTON

              Lihat handleBack di atas: sekarang benar-benar
              kembali ke halaman sebelumnya, BUKAN selalu
              dipaksa ke Home/Portfolio.
          ================================================= */}

          <button
            type="button"
            className="project-back-link"
            onClick={handleBack}
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            <span>Kembali</span>
          </button>


          {/* =================================================
              BREADCRUMB

              "Home"      -> ke atas halaman Home.
              "Portfolio" -> ke section Portfolio di Home.
              Keduanya SENGAJA berbeda tujuan (tidak diubah).
          ================================================= */}

          <nav
            className="project-breadcrumb"
            aria-label="Breadcrumb"
          >

          <Link
            to="/"
            className="project-breadcrumb-link"
            onClick={(e) => {
              e.preventDefault();
              goToHomeSection(navigate, null);
            }}
          >
            Home
          </Link>

          <ChevronRight
            size={14}
            strokeWidth={2.5}
            className="project-breadcrumb-separator"
          />

          <Link
            to="/"
            className="project-breadcrumb-link"
            onClick={(e) => {
              e.preventDefault();
              goToHomeSection(navigate, "portfolio");
            }}
          >
            Portfolio
          </Link>

            <ChevronRight
              size={14}
              strokeWidth={2.5}
              className="project-breadcrumb-separator"
            />

            <span className="project-breadcrumb-current">
              {project.title}
            </span>

          </nav>

        </div>


        {/* =================================================
            HERO
        ================================================= */}

        <div className="project-hero project-detail-animate">


          {/* =================================================
              HERO IMAGE / CAROUSEL
          ================================================= */}

          <div className="project-hero-image-wrapper">

            {carouselImages.length > 0 ? (

              <ImageCarousel
                images={
                  carouselImages
                }
                alt={
                  project.title
                }
                className="project-hero-carousel"
              />

            ) : (

              <div className="project-image-empty">
                <span>
                  Tidak ada gambar project
                </span>
              </div>

            )}

            <div className="project-hero-overlay" />

          </div>


          {/* =================================================
              HERO CONTENT
          ================================================= */}

          <div className="project-hero-content">

            <h1 className="project-title">
              {project.title}
            </h1>


            <p className="project-short-description">
              {
                project.shortDescription
              }
            </p>


            {/* =================================================
                META
            ================================================= */}

            <div className="project-meta">

              {project.role && (
                <span className="project-meta-item">

                  <UserRound
                    size={15}
                    strokeWidth={2}
                  />

                  {project.role}

                </span>
              )}


              {project.duration && (
                <span className="project-meta-item">

                  <Calendar
                    size={15}
                    strokeWidth={2}
                  />

                  {
                    project.duration
                  }

                </span>
              )}

            </div>


            {/* =================================================
                PROJECT LINKS
            ================================================= */}

            <div className="project-links">


              {/* =================================================
                  LIVE DEMO
              ================================================= */}

              {project.liveUrl && !isUnpublishedUrl(project.liveUrl) ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link-button project-link-button--primary"
                >
                  <span>Live Demo</span>
                  <ExternalLink size={16} strokeWidth={2} />
                </a>
              ) : (
                <button
                  type="button"
                  className="project-link-button project-link-button--primary project-link-button--muted"
                  onClick={() => {
                    setUnpublishedTitle(project.title);
                    setUnpublishedOpen(true);
                  }}
                >
                  <span>Live Demo</span>
                  <ExternalLink size={16} strokeWidth={2} />
                </button>
              )}


              {/* =================================================
                  SOURCE CODE
              ================================================= */}

              {project.githubUrl && !isUnpublishedUrl(project.githubUrl) ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link-button"
                >
                  <GithubIcon size={16} />
                  <span>Source Code</span>
                </a>
              ) : project.githubUrl ? (
                <button
                  type="button"
                  className="project-link-button project-link-button--muted"
                  onClick={() => {
                    setUnpublishedTitle(project.title);
                    setUnpublishedOpen(true);
                  }}
                >
                  <GithubIcon size={16} />
                  <span>Source Code</span>
                </button>
              ) : null}

            </div>

          </div>

        </div>


        {/* =================================================
            BODY GRID
        ================================================= */}

        <div className="project-body-grid">


          {/* =================================================
              MAIN COLUMN
          ================================================= */}

          <div className="project-main-column project-detail-animate">


            {/* =================================================
                ABOUT PROJECT
            ================================================= */}

            <div className="project-panel">

              <h2 className="project-panel-title">
                Tentang Project
              </h2>

              <p className="project-description">
                {
                  project.description
                }
              </p>

            </div>


            {/* =================================================
                HIGHLIGHTS
            ================================================= */}

            {project.highlights?.length > 0 && (

              <div className="project-panel">

                <h2 className="project-panel-title">
                  Highlight
                </h2>


                <ul className="project-highlights">

                  {project.highlights.map(
                    (
                      point,
                      index
                    ) => (

                      <li
                        key={index}
                      >
                        {point}
                      </li>

                    )
                  )}

                </ul>

              </div>

            )}


            {/* =================================================
                GALLERY

                Sumber data:
                project.galleryImages

                Berbeda dari:
                project.carouselImages

                carouselImages -> Hero
                galleryImages  -> Gallery
            ================================================= */}

            {galleryItems.length > 0 && (

              <div className="project-panel project-gallery-panel">

                {/* =========================================
                    GALLERY HEADER
                ========================================= */}

                <div className="project-gallery-header">

                  <div>

                    <span className="project-gallery-eyebrow">
                      PROJECT SHOWCASE
                    </span>

                    <h2 className="project-panel-title">
                      Galeri
                    </h2>

                  </div>


                  <span className="project-gallery-count">
                    {
                      galleryItems.length
                    }{" "}
                    photos
                  </span>

                </div>


                {/* =========================================
                    APPLE CARDS CAROUSEL
                ========================================= */}

                <AppleCardsCarousel
                  data={
                    galleryItems
                  }
                />

              </div>

            )}

          </div>


          {/* =================================================
              SIDEBAR — TECH STACK
          ================================================= */}

          <aside className="project-sidebar project-detail-animate">

            <div className="project-panel">

              <h2 className="project-panel-title">
                Tech Stack
              </h2>


              <div className="project-tech-list">

                {project.techStack?.map(
                  (slug) => {

                    const tech =
                      TECH_ICONS[
                        slug
                      ];


                    if (!tech) {
                      return null;
                    }


                    return (
                      <div
                        className="project-tech-chip"
                        key={slug}
                        style={{
                          "--tech-color": `#${tech.color}`,
                        }}
                      >

                        <img
                          src={
                            getTechIconUrl(
                              slug
                            )
                          }
                          alt={
                            tech.name
                          }
                          loading="lazy"
                        />

                        <span>
                          {
                            tech.name
                          }
                        </span>

                      </div>
                    );

                  }
                )}

              </div>

            </div>

          </aside>

        </div>

      </div>

      <UnpublishedModal
        open={unpublishedOpen}
        onClose={() => setUnpublishedOpen(false)}
        title={unpublishedTitle || project.title}
      />
    </section>
  );
}