import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";

import "./Hero.css";

import SpotifyNowPlaying from "./SpotifyNowPlaying";
import RotatingText from "./RotatingText";

/* =========================================================
   GITHUB ICON
========================================================= */

const GithubIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="#ffffff"
    {...props}
  >
    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.15c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.78 2.71 1.26 3.37.97.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47-.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.15v3.19c0 .3.21.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
  </svg>
);

/* =========================================================
   LINKEDIN ICON
========================================================= */

const LinkedinIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="#0A66C2"
    {...props}
  >
    <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45h3.56z" />
  </svg>
);

/* =========================================================
   INSTAGRAM ICON
========================================================= */

const InstagramIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    {...props}
  >
    <defs>
      <linearGradient
        id="ig-gradient"
        x1="0%"
        y1="100%"
        x2="100%"
        y2="0%"
      >
        <stop offset="0%" stopColor="#FEDA75" />
        <stop offset="25%" stopColor="#FA7E1E" />
        <stop offset="50%" stopColor="#D62976" />
        <stop offset="75%" stopColor="#962FBF" />
        <stop offset="100%" stopColor="#4F5BD5" />
      </linearGradient>
    </defs>

    <path
      fill="url(#ig-gradient)"
      d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.24 2.23.41.56.21.96.47 1.38.89.42.42.68.82.89 1.38.17.42.36 1.05.41 2.23.06 1.27.07 1.65.07 4.86 0 3.2-.01 3.58-.07 4.85-.05 1.17-.24 1.8-.41 2.23-.21.56-.47.96-.89 1.38-.42.42-.82.68-1.38.89-.42.17-1.05.36-2.23.41-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.86-.07-1.17-.05-1.8-.24-2.23-.41a3.7 3.7 0 0 1-1.38-.89 3.7 3.7 0 0 1-.89-1.38c-.17-.42-.36-1.05-.41-2.23-.06-1.27-.07-1.65-.07-4.85 0-3.2.01-3.58.07-4.86.05-1.27.24-2.15.41-2.23.21-.56.47-.96.89-1.38.42-.42.82-.68 1.38-.89.42-.17 1.05-.36 2.23-.41C8.33.01 8.74 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-11.4a1.44 1.44 0 1 0 1.44 1.44A1.44 1.44 0 0 0 18.4 4.6z"
    />
  </svg>
);

/* =========================================================
   HERO
========================================================= */

export default function Hero({ ready = true }) {
  const socialIcons = [
    {
      Icon: GithubIcon,
      href: "https://github.com/Ahmadfarhannudin",
      label: "GitHub",
    },
    {
      Icon: LinkedinIcon,
      href: "https://linkedin.com/in/username-kamu",
      label: "LinkedIn",
    },
    {
      Icon: InstagramIcon,
      href: "https://www.instagram.com/frhnnamor_?stkn=MTJpdTE3cXpicTUzdQ==",
      label: "Instagram",
    },
  ];

  /*
    `ready` dikirim dari App (= !isLoading).
    Animasi masuk baru dimulai setelah LoadingScreen selesai.
  */

  const reduceMotion = useReducedMotion();

  const state = ready ? "show" : "hidden";

  const base = reduceMotion ? 0 : 0.15;

  return (
    <section
      id="home"
      className="hero-section"
    >
      <div className="hero-content">
        <div className="hero-grid">

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <motion.div
            className="hero-left"
            initial="hidden"
            animate={state}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.11,
                  delayChildren: base,
                },
              },
            }}
          >

            {/* HERO TITLE */}

            <motion.h1
              className="hero-title"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 44,
                  filter: "blur(12px)",
                },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transitionEnd: {
                    filter: "none",
                  },
                  transition: {
                    duration: 0.85,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
            >
              <span className="hero-title-blue">
                Every idea
              </span>

              <br />

              <span className="hero-title-white">
                has its own story
              </span>
            </motion.h1>

            {/* ROTATING TEXT */}

            <motion.div
              className="hero-rotating"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 28,
                },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.65,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
            >
              <RotatingText />
            </motion.div>

            {/* DESCRIPTION */}

            <motion.p
              className="hero-description"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 28,
                  filter: "blur(10px)",
                },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transitionEnd: {
                    filter: "none",
                  },
                  transition: {
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
            >
              Masa depan adalah ruang tanpa batas bagi mereka
              yang berani bermimpi, bereksperimen, dan mengubah
              gagasan menjadi kenyataan.
            </motion.p>

            {/* ACTION BUTTONS */}

            <motion.div
              className="hero-actions"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 24,
                },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
            >
              <a
                href="#portfolio"
                className="hero-project-button"
              >
                <span>Project</span>
                <ArrowUpRight size={16} />
              </a>

              <a
                href="#contact"
                className="hero-contact-button"
              >
                <span>Contact Me</span>
                <ArrowRight size={16} />
              </a>
            </motion.div>

            {/* SOCIAL MEDIA */}

            <motion.div
              className="hero-social"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 20,
                },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
            >
              <p className="hero-social-title">
                FIND ME
              </p>

              <div className="hero-social-list">
                {socialIcons.map(
                  ({ Icon, href, label }, index) => (
                    <a
                      key={index}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="hero-social-button"
                    >
                      <Icon
                        width={16}
                        height={16}
                      />
                    </a>
                  )
                )}
              </div>
            </motion.div>

          </motion.div>

          {/* =================================================
              RIGHT CONTENT
          ================================================= */}

          <motion.div
            className="hero-right"
            initial={{
              opacity: 0,
              x: 70,
              scale: 0.96,
              filter: "blur(12px)",
            }}
            animate={
              ready
                ? {
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    transitionEnd: {
                      filter: "none",
                    },
                  }
                : {
                    opacity: 0,
                    x: 70,
                    scale: 0.96,
                    filter: "blur(12px)",
                  }
            }
            transition={{
              duration: 0.95,
              delay: base + 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="hero-spotify">
              <SpotifyNowPlaying />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}