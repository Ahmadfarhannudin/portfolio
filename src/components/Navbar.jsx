export default function Navbar() {
  const links = ["Home", "About", "Portfolio", "Contact"];

  return (
    <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-auto flex justify-center">
      <div className="flex items-center gap-0.5 sm:gap-1 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl px-1.5 py-1.5 sm:px-2 sm:py-2 shadow-[0_0_40px_-12px_rgba(80,110,255,0.4)] max-w-full overflow-x-auto no-scrollbar">
        {links.map((link, i) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              i === 0
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            {link}
          </a>
        ))}
      </div>
    </nav>
  );
}
