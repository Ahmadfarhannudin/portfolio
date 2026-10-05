import { ArrowUpRight, Check } from "lucide-react";
import "./FindMe.css";

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 448 512" fill="#0A66C2" aria-hidden="true" {...props}>
    <path d="M100.28 448H7.4V148.9h92.88zm-46.44-341C24.09 107 0 82.27 0 51.79a53.79 53.79 0 0 1 107.58 0c0 30.48-24.1 55.21-53.74 55.21zM447.9 448h-92.68V302.4c0-34.7-.7-79.34-48.29-79.34-48.29 0-55.69 37.7-55.69 76.66V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.28 61.9 111.28 142.3z" />
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 496 512" fill="#ffffff" aria-hidden="true" {...props}>
    <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 448 512" aria-hidden="true" {...props}>
    <defs>
      <linearGradient id="ig-gradient-findme" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FEDA75" />
        <stop offset="25%" stopColor="#FA7E1E" />
        <stop offset="50%" stopColor="#D62976" />
        <stop offset="75%" stopColor="#962FBF" />
        <stop offset="100%" stopColor="#4F5BD5" />
      </linearGradient>
    </defs>
    <path
      fill="url(#ig-gradient-findme)"
      d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
    />
  </svg>
);

const WhatsappIcon = (props) => (
  <svg viewBox="0 0 448 512" fill="#25D366" aria-hidden="true" {...props}>
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
  </svg>
);

const links = [
  { name: "LinkedIn", handle: "@ahmadfarhan", icon: LinkedinIcon, url: "https://linkedin.com/in/username", accent: "#4a9df0" },
  { name: "GitHub", handle: "@Ahmadfarhannudin", icon: GithubIcon, url: "https://github.com/Ahmadfarhannudin", accent: "#a78bfa" },
  { name: "Instagram", handle: "@frhnnamor_", icon: InstagramIcon, url: "https://www.instagram.com/frhnnamor_?stkn=MTJpdTE3cXpicTUzdQ==", accent: "#f0568c" },
  { name: "WhatsApp", handle: "+62 8979-299-872", icon: WhatsappIcon, url: "https://wa.me/628979299872", accent: "#25D366" },
];

/* =========================================================
   PRICING — estimasi proyek website freelance Indonesia.
   Harga akhir mengikuti desain, konten, dan integrasi.
========================================================= */
const WA_NUMBER = "628979299872";

const plans = [
  {
    name: "Starter Plan",
    tagline: "Cocok untuk promosi produk, personal branding, event, atau bisnis mikro.",
    price: "Rp 850rb",
    period: "per proyek",
    accent: "#2563eb",
    popular: false,
    ctaText: "Pesan Paket Starter",
    subNote: "Estimasi pengerjaan 3 - 5 hari kerja",
    features: [
      "1 Halaman Landing Page Responsive",
      "Custom UI/UX & Copywriting Guidance",
      "Tombol Direct WhatsApp & Form Kontak",
      "Integrasi Social Media & Google Maps",
      "Optimasi SEO Basic & Fast Loading",
      "Garansi Bug & 2x Revisi Minor",
    ],
  },
  {
    name: "Builder Plan",
    tagline: "Untuk UMKM, Perusahaan, Organisasi, atau Brand yang butuh Company Profile lengkap.",
    price: "Rp 2,5jt",
    period: "per proyek",
    accent: "#8b5cf6",
    popular: true,
    ctaText: "Pesan Paket Builder",
    subNote: "Estimasi pengerjaan 7 - 10 hari kerja",
    features: [
      "Hingga 5 - 7 Halaman Responsive",
      "Desain Custom Premium & Animasi Modern",
      "Halaman Layanan, Portfolio & About Us",
      "SEO On-Page & Google Indexing Setup",
      "Integrasi Email Form & CMS Admin",
      "Gratis Maintenance 1 Bulan & 3x Revisi",
    ],
  },
  {
    name: "Expert Plan",
    tagline: "Untuk sistem bisnis khusus, SaaS, E-Commerce, atau Web Application kompleks.",
    price: "Rp 5,5jt+",
    period: "estimasi sesuai skenario proyek",
    accent: "#ec4899",
    popular: false,
    ctaText: "Konsultasi Custom App",
    subNote: "Estimasi pengerjaan 14 - 30 hari kerja",
    features: [
      "Custom Full-Stack Web Development",
      "System Architecture, Database & API",
      "Authentication & Multi-role User Dashboard",
      "Integrasi Payment Gateway & Third-Party API",
      "Cloud Deployment & Performance Tuning",
      "Support Technical & Bug Fix 30 Hari",
    ],
  },
];

const waLink = (planName) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Halo Farhan, saya tertarik dengan paket "${planName}". Boleh diskusi lebih lanjut?`
  )}`;

export default function FindMe() {
  return (
    <>
      {/* ================= FIND ME ================= */}
      <section className="findme-wrap" aria-labelledby="findme-title">
        <div className="findme-header">
          <span className="findme-line" />
          <div className="findme-heading">
            <h3 id="findme-title" className="findme-title">
              <span className="findme-dot" />
              Find me
            </h3>
            <p className="findme-subtitle">Atau terhubung langsung lewat platform di bawah ini</p>
          </div>
          <span className="findme-line" />
        </div>
        <ul className="findme-grid">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.name}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="findme-card" style={{ "--accent": link.accent }}>
                  <span className="findme-icon">
                    <Icon width={22} height={22} />
                  </span>
                  <span className="findme-text">
                    <span className="findme-name">{link.name}</span>
                    <span className="findme-handle">{link.handle}</span>
                  </span>
                  <span className="findme-arrow">
                    <ArrowUpRight size={16} strokeWidth={2.2} />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ================= PRICING ================= */}
      <section className="findme-wrap pricing-wrap" aria-labelledby="pricing-title">
        <div className="findme-header">
          <span className="findme-line" />
          <div className="findme-heading">
            <h3 id="pricing-title" className="findme-title">
              <span className="findme-dot" />
              Pricing
            </h3>
            <p className="findme-subtitle">Estimasi harga website. Pilih paket sesuai kebutuhan proyekmu</p>
          </div>
          <span className="findme-line" />
        </div>

        <ul className="pricing-grid">
          {plans.map((plan) => (
            <li key={plan.name}>
              <article
                className={`pricing-card${plan.popular ? " is-popular" : ""}`}
                style={{ "--accent": plan.accent }}
              >
                {plan.popular && <span className="pricing-badge">Terpopuler</span>}

                <div className="pricing-header">
                  <h4 className="pricing-name">{plan.name}</h4>
                  <p className="pricing-tagline">{plan.tagline}</p>
                </div>

                <ul className="pricing-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check size={13} strokeWidth={2.8} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="pricing-footer">
                  <h5 className="pricing-price-text">{plan.price}</h5>
                  <p className="pricing-period">{plan.period}</p>

                  <a
                    className="pricing-cta"
                    href={waLink(plan.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {plan.ctaText}
                  </a>

                  <p className="pricing-subnote">{plan.subNote}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <p className="pricing-note">
          Harga merupakan estimasi jasa pembuatan website; belum termasuk domain, hosting, lisensi berbayar, dan biaya layanan pihak ketiga. Ruang lingkup, konten, serta kebutuhan integrasi dibahas sebelum harga final disepakati.
        </p>
      </section>
    </>
  );
}