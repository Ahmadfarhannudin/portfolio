import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

import "./NotFound.css";

/* =========================================================
   404 NOT FOUND PAGE
========================================================= */

export default function NotFound() {
  return (
    <section className="notfound-section">
      <div className="notfound-stars" aria-hidden="true">
        <span className="notfound-star notfound-star-1" />
        <span className="notfound-star notfound-star-2" />
        <span className="notfound-star notfound-star-3" />
        <span className="notfound-star notfound-star-4" />
        <span className="notfound-star notfound-star-5" />
      </div>

      <motion.div
        className="notfound-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* =================================================
            FLOATING ASTRONAUT / PLANET GRAPHIC
        ================================================= */}

        <motion.div
          className="notfound-planet"
          animate={{ y: [0, -14, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="70" fill="url(#nf-planet-gradient)" />
            <ellipse
              cx="100"
              cy="100"
              rx="98"
              ry="26"
              stroke="#3b82f6"
              strokeOpacity="0.5"
              strokeWidth="2"
            />
            <circle cx="70" cy="80" r="8" fill="#1e3a8a" opacity="0.5" />
            <circle cx="130" cy="120" r="12" fill="#1e3a8a" opacity="0.4" />
            <circle cx="110" cy="70" r="5" fill="#1e3a8a" opacity="0.4" />
            <defs>
              <radialGradient id="nf-planet-gradient" cx="0.35" cy="0.35" r="0.8">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="55%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e40af" />
              </radialGradient>
            </defs>
          </svg>
        </motion.div>

        <h1 className="notfound-code">404</h1>

        <h2 className="notfound-title">Halaman tidak ditemukan</h2>

        <p className="notfound-description">
          Sepertinya halaman yang kamu cari sudah pindah, dihapus, atau
          alamatnya salah ketik. Yuk kembali ke jalur yang benar.
        </p>

        <div className="notfound-actions">
          <Link to="/" className="notfound-button notfound-button--primary">
            <Home size={17} strokeWidth={2} />
            <span>Kembali ke Beranda</span>
          </Link>

          <button
            type="button"
            className="notfound-button"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={17} strokeWidth={2} />
            <span>Halaman Sebelumnya</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
}