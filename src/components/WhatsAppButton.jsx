import { motion } from "framer-motion";
import "./WhatsAppButton.css";

/* =========================================================
   WHATSAPP FLOATING BUTTON
   Ganti PHONE_NUMBER dengan nomormu (format internasional,
   tanpa "+", tanpa spasi. Contoh Indonesia: 6281234567890)
========================================================= */

const PHONE_NUMBER = "628979299872";
const DEFAULT_MESSAGE = "Halo, saya tertarik untuk menghubungi Anda.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-fab"
      aria-label="Hubungi saya lewat WhatsApp"
      initial={{ opacity: 0, scale: 0, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
    >
      <span className="whatsapp-fab-ping" />

      <svg viewBox="0 0 32 32" fill="currentColor" className="whatsapp-fab-icon">
        <path d="M16.01 2.67c-7.35 0-13.32 5.97-13.32 13.32 0 2.35.62 4.63 1.79 6.65L2.67 29.33l6.86-1.79a13.26 13.26 0 0 0 6.47 1.65h.01c7.35 0 13.32-5.97 13.32-13.32S23.36 2.67 16.01 2.67Zm0 24.37h-.01a11.06 11.06 0 0 1-5.63-1.54l-.4-.24-4.07 1.06 1.09-3.97-.26-.41a11.03 11.03 0 0 1-1.69-5.9c0-6.1 4.96-11.06 11.06-11.06 2.96 0 5.73 1.15 7.82 3.24a10.98 10.98 0 0 1 3.24 7.82c0 6.1-4.96 11-11.05 11Zm6.06-8.27c-.33-.17-1.96-.97-2.27-1.08-.3-.11-.53-.17-.75.17-.22.33-.86 1.08-1.06 1.31-.2.22-.39.25-.72.08-.33-.17-1.4-.52-2.66-1.65-.98-.88-1.65-1.96-1.84-2.29-.19-.33-.02-.51.15-.68.15-.15.33-.39.5-.58.17-.2.22-.33.33-.55.11-.22.06-.42-.03-.58-.08-.17-.75-1.81-1.03-2.48-.27-.65-.55-.56-.75-.57l-.64-.01c-.22 0-.58.08-.88.42-.3.33-1.15 1.13-1.15 2.75s1.18 3.19 1.34 3.41c.17.22 2.32 3.55 5.63 4.98.79.34 1.4.54 1.88.7.79.25 1.51.21 2.08.13.63-.1 1.96-.8 2.24-1.57.28-.77.28-1.43.19-1.57-.08-.14-.3-.22-.63-.39Z" />
      </svg>
    </motion.a>
  );
}