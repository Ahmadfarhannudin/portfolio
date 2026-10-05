import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  CardBody,
  CardContainer,
  CardItem,
} from "./ThreeDCard";
import {
  ArrowUpRight,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { PROJECTS_DATA } from "./projects/projectsData";
import { TECH_ICONS, getTechIconUrl } from "./projects/techIcons";
import UnpublishedModal from "./ui/UnpublishedModal";
import "./ui/UnpublishedModal.css";

import "./PortfolioContent.css";

import certAcad from "../assets/portfolio/sertifikat/acad.jpg";
import certAI from "../assets/portfolio/sertifikat/AI.PNG";
import certOxigen1 from "../assets/portfolio/sertifikat/oxigen1.jpg";
import certOxigen2 from "../assets/portfolio/sertifikat/oxigen2.jpg";
import certOxigen3 from "../assets/portfolio/sertifikat/oxigen3.jpg";
import awardLsp from "../assets/portfolio/sertifikat/lsp.png";
import awardUjikom from "../assets/portfolio/sertifikat/ujikom.png";

function isUnpublishedUrl(url) {
  if (!url) return true;
  const v = String(url).trim();
  return !v || v === "#" || v === "/" || v.startsWith("#");
}

/* =========================================================
   DATA — CERTIFICATES
========================================================= */

const CERTIFICATES_DATA = [
  {
    id: "ACAD-SCIRT",
    title: "Acad Scirt submit 2025",
    image:
      certAcad,
  },
  {
    id: "Sertifikat AI Ready ASEAN Goggle",
    title: "Sertifikat AI Ready ASEAN Goggle",
    image:
      certAI,
  },
  {
    id: "Sertifikat Peserta Oxigen",
    title: "Sertifikat Peserta Oxigen",
    image:
      certOxigen1,
  },
];

/* =========================================================
   DATA — AWARDS
========================================================= */

const AWARDS_DATA = [
  {
    id: "Lembaga Sertifikasi Profesi (LSP)",
    title: "Lembaga Sertifikasi Profesi (LSP)",
    image:
      awardLsp,
  },
    {
    id: "Sertifikat Uji Kompetensi SMK",
    title: "Sertifikat Uji Kompetensi SMK",
    image:
      awardUjikom,
  },
  {
    id: "Best Tech Explorer",
    title: "Best Tech Explorer",
    image:
      certOxigen2,
  },
  {
    id: "Best Project Software",
    title: "Best Project divisi Software",
    image:
      certOxigen3,
  },
];

/* =========================================================
   DATA — TECH STACK (untuk tab, bukan halaman detail)
   Filter: hanya 13 tech terpilih, TECH_ICONS tetap utuh
========================================================= */

const PORTFOLIO_TECH_SLUGS = [
  "html5",
  "css3",
  "bootstrap",
  "java",
  "javascript",
  "php",
  "mysql",
  "kotlin",
  "react",
  "vite",
  "figma",
  "laravel",
  "python",
];

const TECH_DATA = PORTFOLIO_TECH_SLUGS.filter((slug) => TECH_ICONS[slug]).map(
  (slug, index) => ({
    id: index + 1,
    slug,
    name: TECH_ICONS[slug].name,
    color: TECH_ICONS[slug].color,
  })
);

/* =========================================================
   CARD GRID
========================================================= */

function CardGrid({ items, renderItem, animationReady, gridClassName }) {
  const itemRefs = useRef([]);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items.length]);

  useEffect(() => {
    const nodes = itemRefs.current.filter(Boolean);

    if (!nodes.length) return;

    gsap.set(nodes, {
      autoAlpha: 0,
      y: 55,
      scale: 0.82,
    });

    hasAnimatedRef.current = false;

    return () => {
      gsap.killTweensOf(nodes);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    if (!animationReady) return;
    if (hasAnimatedRef.current) return;

    const nodes = itemRefs.current.filter(Boolean);

    if (!nodes.length) return;

    hasAnimatedRef.current = true;

    gsap.killTweensOf(nodes);

    gsap.to(nodes, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
      stagger: {
        each: 0.05,
        from: "start",
      },
      overwrite: true,
    });
  }, [animationReady, items]);

  return (
  <div className={gridClassName || "portfolio-grid"}>
    {items.map((item, index) => (
      <div
        className="portfolio-card-motion"
        key={item.id}
        ref={(el) => {
          itemRefs.current[index] = el;
        }}
      >
        {renderItem(item, index)}
      </div>
    ))}
  </div>
  );
}

/* =========================================================
   PROJECT CARD

   Tombol "View Details" navigasi ke /projects/:id lewat
   react-router (bukan href statis lagi).
========================================================= */

function ProjectCard({ project, onUnpublished }) {
  const navigate = useNavigate();

  const handleViewDetails = (e) => {
    e.preventDefault();
    navigate(`/projects/${project.id}`);
  };

  const liveUnpublished = isUnpublishedUrl(project.liveUrl);

  const handleLiveDemo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (liveUnpublished) {
      onUnpublished?.(project.title);
      return;
    }
    window.open(project.liveUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <CardContainer className="inter-var">
      <CardBody className="portfolio-card project-card">

        <CardItem translateZ="100" className="card-image-wrapper">
          <img
            src={project.coverImage}
            alt={project.title}
            className="card-image"
            loading="lazy"
          />
        </CardItem>

        <div className="project-card-content">

          <CardItem translateZ="50" className="card-title">
            {project.title}
          </CardItem>

          <CardItem translateZ="60" className="card-description">
            {project.shortDescription}
          </CardItem>

          <div className="card-footer" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <CardItem
              translateZ={30}
              as="a"
              href={`/projects/${project.id}`}
              onClick={handleViewDetails}
              className="card-button"
            >
              <span>View Details</span>
              <ArrowUpRight size={16} strokeWidth={2} />
            </CardItem>

            {/* <CardItem
              translateZ={30}
              as="button"
              onClick={handleLiveDemo}
              className="card-button card-button--ghost"
            >
              <span>Live Demo</span>
              <ExternalLink size={14} strokeWidth={2} />
            </CardItem> */}
          </div>

        </div>

      </CardBody>
    </CardContainer>
  );
}

/* =========================================================
   CERTIFICATE / AWARD CARD

   Card menyesuaikan rasio asli gambar (landscape/portrait)
   dengan preload dulu untuk mengambil naturalWidth/Height,
   supaya tinggi card tidak fix dan tidak ada crop aneh.

   Klik card -> buka preview fullscreen (onOpenPreview).
========================================================= */

function ImageCard({ item, index, onOpenPreview }) {
  const [ratio, setRatio] = useState(null);
  const [orientation, setOrientation] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setRatio(null);
    setOrientation(null);

    if (!item.image) return;

    const img = new Image();

    img.onload = () => {
      if (cancelled) return;

      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const r = img.naturalWidth / img.naturalHeight;

        setRatio(r);
        setOrientation(r >= 1 ? "landscape" : "portrait");
      }
    };

    img.onerror = () => {
      if (cancelled) return;

      // Fallback aman kalau gambar gagal dimuat.
      setRatio(4 / 3);
      setOrientation("landscape");
    };

    img.src = item.image;

    return () => {
      cancelled = true;
    };
  }, [item.image]);

  return (
    <div
      className={`image-card-plain ${
        orientation ? `image-card-plain--${orientation}` : ""
      }`}
      style={ratio ? { aspectRatio: ratio } : { aspectRatio: "4 / 3" }}
      role="button"
      tabIndex={0}
      aria-label={`Lihat ${item.title} dalam ukuran penuh`}
      onClick={() => onOpenPreview?.(index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenPreview?.(index);
        }
      }}
    >
      <img
        src={item.image}
        alt={item.title}
        className="image-card-plain-img"
        loading="lazy"
      />

      <div className="image-card-plain-overlay" />

      <div className="image-card-plain-title">
        <span>{item.title}</span>
        <ArrowUpRight size={18} strokeWidth={2} />
      </div>
    </div>
  );
}

/* =========================================================
   TECH CARD
========================================================= */

function TechCard({ tech }) {
  const iconUrl = getTechIconUrl(tech.slug);

  return (
    <div
      className="tech-card"
      style={{ "--tech-color": `#${tech.color}` }}
    >
      <div className="tech-icon-wrapper">
        <img
          src={iconUrl}
          alt={tech.name}
          className="tech-icon"
          loading="lazy"
        />
      </div>

      <span className="tech-name">{tech.name}</span>
    </div>
  );
}

/* =========================================================
   IMAGE PREVIEW LIGHTBOX

   Dipakai untuk preview fullscreen certificates & awards.
   Navigasi prev/next mengikuti list yang sedang aktif
   (certificates ATAU awards, tidak tercampur).
========================================================= */

function ImagePreviewLightbox({ list, index, onClose, onPrev, onNext }) {
  const total = list.length;
  const item = list[index];

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      onNext();
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onPrev();
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!item) return null;

  return (
    <motion.div
      className="image-lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      ref={(el) => el?.focus()}
    >
      <button
        type="button"
        className="image-lightbox-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Tutup preview"
      >
        <X size={22} />
      </button>

      {total > 1 && (
        <button
          type="button"
          className="image-lightbox-nav image-lightbox-nav--prev"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Sebelumnya"
        >
          <ChevronLeft size={26} />
        </button>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={item.id}
          className="image-lightbox-content"
          initial={{ scale: 0.92, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 15, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <img src={item.image} alt={item.title} draggable={false} loading="lazy" decoding="async" />

          <div className="image-lightbox-info">
            <span>{item.title}</span>

            {total > 1 && (
              <span>
                {index + 1} / {total}
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {total > 1 && (
        <button
          type="button"
          className="image-lightbox-nav image-lightbox-nav--next"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Berikutnya"
        >
          <ChevronRight size={26} />
        </button>
      )}
    </motion.div>
  );
}

/* =========================================================
   TAB TRANSITION WRAPPER
========================================================= */

function useTabTransition(activeTab, wrapperRef) {
  const [renderedTab, setRenderedTab] = useState(activeTab);
  const prevTabRef = useRef(activeTab);
  const isFirstRef = useRef(true);

  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false;
      prevTabRef.current = activeTab;
      return;
    }

    if (activeTab === prevTabRef.current) return;

    const el = wrapperRef.current;

    if (!el) {
      setRenderedTab(activeTab);
      prevTabRef.current = activeTab;
      return;
    }

    gsap.killTweensOf(el);

    gsap.to(el, {
      opacity: 0,
      y: -18,
      scale: 0.98,
      duration: 0.28,
      ease: "power2.in",
      onComplete: () => {
        setRenderedTab(activeTab);
        prevTabRef.current = activeTab;

        gsap.fromTo(
          el,
          { opacity: 0, y: 18, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
          }
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return renderedTab;
}

/* =========================================================
   MAIN
========================================================= */

export default function PortfolioContent({
  activeTab,
  animationReady = false,
}) {
  const wrapperRef = useRef(null);
  const renderedTab = useTabTransition(activeTab, wrapperRef);
  const [unpublishedOpen, setUnpublishedOpen] = useState(false);
  const [unpublishedTitle, setUnpublishedTitle] = useState("");

  /*
   * Preview lightbox state — dipakai bareng
   * oleh certificates & awards.
   */
  const [previewList, setPreviewList] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  const openPreview = (list, idx) => {
    setPreviewList(list);
    setPreviewIndex(idx);
  };

  const closePreview = () => {
    setPreviewList(null);
  };

  const previewPrev = () => {
    setPreviewIndex((prev) =>
      previewList ? (prev - 1 + previewList.length) % previewList.length : 0
    );
  };

  const previewNext = () => {
    setPreviewIndex((prev) =>
      previewList ? (prev + 1) % previewList.length : 0
    );
  };

  let content = null;

  if (renderedTab === "projects") {
    content = (
      <>
        <CardGrid
          items={PROJECTS_DATA}
          animationReady={animationReady}
          renderItem={(project) => (
            <ProjectCard
              project={project}
              onUnpublished={(t) => {
                setUnpublishedTitle(t);
                setUnpublishedOpen(true);
              }}
            />
          )}
        />
        <UnpublishedModal
          open={unpublishedOpen}
          onClose={() => setUnpublishedOpen(false)}
          title={unpublishedTitle || "Project"}
        />
      </>
    );
  } else if (renderedTab === "certificates") {
  content = (
    <CardGrid
      items={CERTIFICATES_DATA}
      animationReady={animationReady}
      renderItem={(certificate, index) => (
        <ImageCard
          item={certificate}
          index={index}
          onOpenPreview={(idx) => openPreview(CERTIFICATES_DATA, idx)}
        />
      )}
    />
  );
} else if (renderedTab === "awards") {
  content = (
    <CardGrid
      items={AWARDS_DATA}
      animationReady={animationReady}
      renderItem={(award, index) => (
        <ImageCard
          item={award}
          index={index}
          onOpenPreview={(idx) => openPreview(AWARDS_DATA, idx)}
        />
      )}
    />
  );
  } else if (renderedTab === "tech") {
    content = (
      <CardGrid
        items={TECH_DATA}
        animationReady={animationReady}
        gridClassName="tech-grid"
        renderItem={(tech) => <TechCard tech={tech} />}
      />
    );
  }

  return (
  <div className="portfolio-content-wrapper" ref={wrapperRef}>
    {content}

    {createPortal(
      <AnimatePresence>
        {previewList && (
          <ImagePreviewLightbox
            list={previewList}
            index={previewIndex}
            onClose={closePreview}
            onPrev={previewPrev}
            onNext={previewNext}
          />
        )}
      </AnimatePresence>,
      document.body
    )}
  </div>
  );
}