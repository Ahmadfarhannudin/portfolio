import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, X, Clock3 } from "lucide-react";

export default function UnpublishedModal({ open, onClose, title = "Project" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="unpublished-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          aria-label="Project belum dipublish"
        >
          <motion.div
            className="unpublished-modal"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="unpublished-close" onClick={onClose} aria-label="Tutup">
              <X size={16} />
            </button>

            <div className="unpublished-icon">
              <Rocket size={22} />
            </div>

            <h3 className="unpublished-title">Belum Dipublish</h3>
            <p className="unpublished-desc">
              <strong>{title}</strong> belum tersedia untuk Live Demo. Project masih dalam tahap persiapan / belum di-deploy.
            </p>

            <div className="unpublished-meta">
              <Clock3 size={14} />
              <span>Coming soon — cek kembali nanti</span>
            </div>

            <div className="unpublished-actions">
              <button className="unpublished-btn unpublished-btn--ghost" onClick={onClose}>
                Tutup
              </button>
              <button
                className="unpublished-btn unpublished-btn--primary"
                onClick={onClose}
              >
                Mengerti
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
