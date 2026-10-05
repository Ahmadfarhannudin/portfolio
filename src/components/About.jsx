import { motion } from "./motion";
import {
  ArrowUpRight,
  FileText,
} from "lucide-react";

import {
  useEffect,
  useState,
  lazy,
  Suspense,
} from "react";

import "./About.css";
import Reveal from "./Reveal";
import TechText from "./TechText";
import MagicBento from "./MagicBento";
const Lanyard = lazy(() => import("./Lanyard"));
import MaskedHeading from "./MaskedHeading";
import StarBorder from "./StarBorder";
import EncryptedText from "./EncryptedText";
import ScrollReveal from "./ScrollReveal";
import Timeline from "./Timeline";
import Stats from "./Stats";
import GlareCard from "./GlareCard";
import SpecularBorder from "./SpecularBorder";

import lanyardPhoto from "../assets/portfolio/galery/lanyard.png";
import spidermanPhoto from "../assets/portfolio/spiderman.jfif";

export default function About({
  onPortfolioSelect,
}) {
  /* =========================================================
     MOBILE DETECTION
  ========================================================= */

  const [isMobile, setIsMobile] =
    useState(() => {
      if (
        typeof window === "undefined"
      ) {
        return false;
      }

      return window.innerWidth <= 768;
    });

  /* =========================================================
     ENCRYPTION TRIGGER
  ========================================================= */

  const [encryptionRun, setEncryptionRun] =
    useState(0);

  /* =========================================================
     MOBILE RESIZE
  ========================================================= */

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth <= 768
      );
    };

    checkMobile();

    window.addEventListener(
      "resize",
      checkMobile
    );

    return () => {
      window.removeEventListener(
        "resize",
        checkMobile
      );
    };
  }, []);

  /* =========================================================
     START ENCRYPTED TEXT ON MOUNT + VIEWPORT
  ========================================================= */

  useEffect(() => {
    setEncryptionRun((previous) => previous + 1);
  }, []);

  const triggerEncryption = () => {
    setEncryptionRun((previous) => previous + 1);
  };

  /* =========================================================
     VIEW PROJECTS
  ========================================================= */

  const handleViewProjects = () => {
    document
      .getElementById("projects")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  /* =========================================================
     VIEW RESUME
  ========================================================= */

  const handleViewResume = () => {
    window.open(
      "/resume.pdf",
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section
      id="about"
      className="about-section"
    >
      <div className="about-container">

        {/* ===================================================
            ABOUT SECTION HEADING
        =================================================== */}

        <ScrollReveal
          y={45}
          scale={0.98}
          duration={0.8}
          amount={0.15}
        >
          <header className="about-section-heading">

            <span className="about-section-kicker">
              <span className="about-section-dot" />

              GET TO KNOW ME
            </span>

            <MaskedHeading
              text="About Me"
              direction="up"
              duration={0.8}
              delay={0.1}
              className="about-section-title"
            />

            <p className="about-section-subtitle">
              Discover who I am, what I build,
              <br className="about-subtitle-break" />
              and what drives me.
            </p>

          </header>
        </ScrollReveal>


        {/* ===================================================
            MAGIC BENTO
        =================================================== */}

        <ScrollReveal
          y={60}
          scale={0.98}
          duration={0.9}
          amount={0.08}
          onViewportEnter={triggerEncryption}
        >

          <MagicBento
            textAutoHide={false}
            enableStars={!isMobile}
            enableSpotlight={!isMobile}
            enableBorderGlow={!isMobile}
            disableAnimations={false}
            spotlightRadius={350}
            particleCount={isMobile ? 0 : 10}
            enableTilt={false}
            glowColor="37, 99, 235"
            clickEffect={!isMobile}
            enableMagnetism={false}
          >

            {/* =================================================
                ABOUT MAIN CARD
            ================================================= */}

            <div className="about-main-card-frame">
            <article className="about-main-card">
              
                {/* =================================================
                    LEFT CONTENT
                ================================================= */}

                <div className="about-main-content">

                  {/* =================================================
                      LABEL
                  ================================================= */}

                  <span className="about-card-label">
                    ABOUT ME
                  </span>


                  {/* =================================================
                      GREETING
                  ================================================= */}

                  <span className="about-hello">
                    Hello, I'm
                  </span>


                  {/* =================================================
                      NAME
                  ================================================= */}

                                    <div className="about-name-row about-name-tech">
                    <TechText
                      lines={[
                        { text: "Ahmad", color: "#ffffff", accentColor: "#60a5fa" },
                        { text: "Farhannudin.", color: "#3b82f6", accentColor: "#93c5fd" },
                      ]}
                      align="left"
                      fontSize={72}
                      fontWeight={700}
                      letterSpacing={-0.03}
                      lineHeight={1.02}
                      reach={140}
                      specks={10}
                      labels={false}
                      hideCursor
                    />
                  </div>


                  {/* =================================================
                      DESCRIPTION
                  ================================================= */}

                  <p className="about-text-primary">
                    I am an Informatics Engineering student with a strong interest in web development, UI/UX, artificial intelligence, and digital interactive experiences.
                  </p>

                  <EncryptedText
                    text="To me, every idea is the starting point of something that can be brought to life. I enjoy combining creativity and technical skills to create clean, responsive interfaces and deliver meaningful experiences."
                    className="about-text-secondary"
                    speed={25}
                    revealDelay={800}
                    as="p"
                    trigger={encryptionRun}
                  />


                  {/* =================================================
                      ACTION BUTTONS
                  ================================================= */}

                  <div className="about-actions">

                    {/* VIEW PROJECTS */}

                    <StarBorder
                      color="rgba(59, 130, 246, 0.95)"
                      speed="4s"
                      onClick={
                        handleViewProjects
                      }
                    >

                      <span>
                        View Projects
                      </span>

                      <ArrowUpRight
                        size={16}
                        strokeWidth={1.8}
                      />

                    </StarBorder>


                    {/* VIEW RESUME */}

                    <StarBorder
                      color="rgba(148, 163, 184, 0.65)"
                      speed="6s"
                      className="resume-button"
                      onClick={
                        handleViewResume
                      }
                    >

                      <FileText
                        size={15}
                        strokeWidth={1.8}
                      />

                      <span>
                        View Resume
                      </span>

                    </StarBorder>

                  </div>


                  {/* =================================================
                      META CARDS
                  ================================================= */}

                  <div className="about-meta-grid">

                    {/* =================================================
                        BASED IN
                    ================================================= */}

                    <Reveal className="about-meta-item" y={25} delay={0.15}>

                      <GlareCard
                        className="about-meta-glare"
                      >

                        <div className="about-meta-card">

                          <span className="about-meta-label">
                            BASED IN
                          </span>

                          <strong className="about-meta-value">
                            Indonesia
                          </strong>

                        </div>

                      </GlareCard>

                    </Reveal>


                    {/* =================================================
                        FOCUS
                    ================================================= */}

                    <Reveal className="about-meta-item" y={25} delay={0.3}>

                      <GlareCard
                        className="about-meta-glare"
                      >

                        <div className="about-meta-card">

                          <span className="about-meta-label">
                            FOCUS
                          </span>

                          <strong className="about-meta-value">
                            Web Development
                          </strong>

                        </div>

                      </GlareCard>

                    </Reveal>


                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <Reveal className="about-meta-item" y={25} delay={0.45}>

                      <GlareCard
                        className="about-meta-glare"
                      >

                        <div className="about-meta-card">

                          <span className="about-meta-label">
                            STATUS
                          </span>

                          <strong className="about-meta-value">
                            Learning &amp; Building
                          </strong>

                        </div>

                      </GlareCard>

                    </Reveal>

                  </div>

                </div>


                {/* =================================================
                    RIGHT VISUAL — LANYARD
                ================================================= */}

                {isMobile ? (

                  /* =================================================
                      MOBILE LANYARD
                  ================================================= */

                  <motion.div
                    className="
                      about-main-visual
                      about-main-visual--mobile
                    "

                    initial={{
                      opacity: 0,
                      y: "-55%",
                      x: "28%",
                      rotate: 14,
                      scale: 0.88,
                    }}

                    whileInView={{
                      opacity: 1,
                      y: "0%",
                      x: "0%",
                      rotate: 0,
                      scale: 1,
                    }}

                    viewport={{
                      once: true,
                      amount: 0.2,
                    }}

                    transition={{
                      type: "spring",
                      stiffness: 160,
                      damping: 18,
                      mass: 0.9,
                      delay: 0.15,
                    }}

                    style={{
                      transformOrigin:
                        "50% 0%",
                    }}
                  >

                    <motion.div
                      initial={{
                        rotate: 14,
                      }}

                      whileInView={{
                        rotate: [
                          14,
                          -6,
                          3,
                          -2,
                          0,
                        ],
                      }}

                      viewport={{
                        once: true,
                      }}

                      transition={{
                        delay: 0.55,
                        duration: 1.35,
                        ease: "easeInOut",
                        times: [
                          0,
                          0.33,
                          0.62,
                          0.82,
                          1,
                        ],
                      }}

                      style={{
                        transformOrigin:
                          "50% 0%",
                        height: "100%",
                      }}
                    >

                      <div className="about-lanyard">

                        <Suspense fallback={<div className="w-full h-full min-h-[300px]" />}>
                          <Lanyard
                            key="lanyard-mobile"
                            position={[
                              0,
                              0,
                              15,
                            ]}
                            gravity={[
                              0,
                              -36,
                              0,
                            ]}
                            fov={28}
                            transparent={true}
                            frontImage={
                              lanyardPhoto
                            }
                            backImage={
                              lanyardPhoto
                            }
                            hoverImage={spidermanPhoto}
                            cardScale={3.4}
                          />
                        </Suspense>

                      </div>

                    </motion.div>


                    {/* PROFILE LABEL */}

                    <motion.div
                      className="about-profile-label"

                      initial={{
                        opacity: 0,
                        y: 10,
                      }}

                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}

                      viewport={{
                        once: true,
                        amount: 0.4,
                      }}

                      transition={{
                        duration: 0.6,
                        delay: 0.85,
                      }}
                    >

                      {/* <span className="about-profile-dot" />

                      INTERACTIVE PROFILE */}

                    </motion.div>

                  </motion.div>

                ) : (

                  /* =================================================
                      DESKTOP LANYARD
                  ================================================= */

                  <motion.div
                    className="about-main-visual"

                    initial={{
                      opacity: 0,
                      y: "-85%",
                      x: "22%",
                      rotate: 18,
                      scale: 0.88,
                    }}

                    whileInView={{
                      opacity: 1,
                      y: "0%",
                      x: "0%",
                      rotate: 0,
                      scale: 1,
                    }}

                    viewport={{
                      once: true,
                      amount: 0.08,
                    }}

                    transition={{
                      type: "spring",
                      stiffness: 125,
                      damping: 16,
                      mass: 1.15,
                      delay: 0.15,
                    }}

                    style={{
                      transformOrigin:
                        "50% 0%",
                    }}
                  >

                    <motion.div
                      initial={{
                        rotate: 18,
                      }}

                      whileInView={{
                        rotate: [
                          18,
                          -7,
                          4,
                          -2.5,
                          0,
                        ],
                      }}

                      viewport={{
                        once: true,
                      }}

                      transition={{
                        delay: 0.7,
                        duration: 1.65,
                        ease: "easeInOut",
                        times: [
                          0,
                          0.35,
                          0.62,
                          0.84,
                          1,
                        ],
                      }}

                      style={{
                        transformOrigin:
                          "50% 0%",
                        height: "100%",
                      }}
                    >

                      <div className="about-lanyard">

                        <Suspense fallback={<div className="w-full h-full min-h-[300px]" />}>
                          <Lanyard
                            key="lanyard-desktop"
                            position={[
                              0,
                              0,
                              14.5,
                            ]}
                            gravity={[
                              0,
                              -38,
                              0,
                            ]}
                            fov={26}
                            transparent={true}
                            frontImage={
                              lanyardPhoto
                            }
                            backImage={
                              lanyardPhoto
                            }
                            hoverImage={spidermanPhoto}
                            cardScale={3.1}
                          />
                        </Suspense>

                      </div>

                    </motion.div>


                    {/* PROFILE LABEL */}

                    <motion.div
                      className="about-profile-label"

                      initial={{
                        opacity: 0,
                        y: 15,
                      }}

                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}

                      viewport={{
                        once: true,
                        amount: 0.4,
                      }}

                      transition={{
                        duration: 0.7,
                        delay: 0.95,
                      }}
                    >
{/* 
                      <span className="about-profile-dot" />

                      INTERACTIVE PROFILE */}

                    </motion.div>

                  </motion.div>

                )}

              </article>
            </div>
          </MagicBento>

        </ScrollReveal>


        {/* =====================================================
            TIMELINE
        ===================================================== */}

        <ScrollReveal
          y={60}
          scale={0.98}
          delay={0.15}
          duration={0.85}
          amount={0.1}
        >
          <Timeline />
        </ScrollReveal>


        {/* =====================================================
            STATS
        ===================================================== */}

        <ScrollReveal
          y={60}
          scale={0.98}
          delay={0.2}
          duration={0.85}
          amount={0.1}
        >
          <Stats
            onSelect={
              onPortfolioSelect
            }
          />
        </ScrollReveal>

      </div>
    </section>
  );
}