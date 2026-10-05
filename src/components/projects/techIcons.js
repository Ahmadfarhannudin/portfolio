/* =========================================================
   TECH ICONS

   Sumber tunggal (single source of truth) untuk logo
   teknologi di seluruh aplikasi — dipakai oleh tab
   "Tech Stack" maupun badge tech di halaman detail project.

   Sumber utama: CDN simpleicons.org
   https://cdn.simpleicons.org/{slug}/{warna}/{warna-dark-opsional}

   Catatan:
   - "slug" opsional dipakai kalau slug CDN berbeda dari key
     objek ini (misal "java" -> key tetap "java" tapi slug CDN
     memakai "openjdk", karena Simple Icons menghapus icon Java
     akibat komplain trademark dari Oracle: lihat
     https://github.com/simple-icons/simple-icons/issues/7374).
   - "dark" opsional dipakai untuk icon berwarna hitam (000000)
     supaya tetap terlihat di background gelap.
========================================================= */

export const TECH_ICONS = {
  // --- Markup & Styling ---
  html5: { name: "HTML5", color: "E34F26" },
  css3: { name: "CSS3", color: "1572B6" },
  css3: { name: "CSS3", color: "1572B6" },
  sass: { name: "Sass", color: "CC6699" },
  less: { name: "Less", color: "1D365D" },
  tailwindcss: { name: "Tailwind CSS", color: "06B6D4" },
  bootstrap: { name: "Bootstrap", color: "7952B3" },
  bulma: { name: "Bulma", color: "00D1B2" },

  // --- Languages ---
  javascript: { name: "JavaScript", color: "F7DF1E" },
  typescript: { name: "TypeScript", color: "3178C6" },
  php: { name: "PHP", color: "777BB4" },
  python: { name: "Python", color: "3776AB" },
  // Java dihapus dari Simple Icons (trademark Oracle) -> pakai OpenJDK
  java: { name: "Java", slug: "openjdk", color: "5382A1" },
  kotlin: { name: "Kotlin", color: "7F52FF" },
  swift: { name: "Swift", color: "F05138" },
  dart: { name: "Dart", color: "0175C2" },
  go: { name: "Go", color: "00ADD8" },
  rust: { name: "Rust", color: "000000", dark: "F5F5F5" },
  cplusplus: { name: "C++", color: "00599C" },
  csharp: { name: "C#", color: "239120" },
  ruby: { name: "Ruby", color: "CC342D" },
  r: { name: "R", color: "276DC3" },
  lua: { name: "Lua", color: "2C2D72" },
  perl: { name: "Perl", color: "39457E" },
  scala: { name: "Scala", color: "DC322F" },
  elixir: { name: "Elixir", color: "4B275F" },
  haskell: { name: "Haskell", color: "5D4F85" },

  // --- Frontend Frameworks/Libraries ---
  react: { name: "React", color: "61DAFB" },
  vuedotjs: { name: "Vue.js", color: "4FC08D" },
  angular: { name: "Angular", color: "DD0031" },
  svelte: { name: "Svelte", color: "FF3E00" },
  nextdotjs: { name: "Next.js", color: "000000", dark: "F5F5F5" },
  nuxt: { name: "Nuxt", color: "00DC82" },
  jquery: { name: "jQuery", color: "0769AD" },
  alpinedotjs: { name: "Alpine.js", color: "8BC0D0" },
  redux: { name: "Redux", color: "764ABC" },

  // --- Backend Frameworks ---
  laravel: { name: "Laravel", color: "FF2D20" },
  nodedotjs: { name: "Node.js", color: "5FA04E" },
  express: { name: "Express", color: "000000", dark: "F5F5F5" },
  nestjs: { name: "NestJS", color: "E0234E" },
  django: { name: "Django", color: "092E20" },
  flask: { name: "Flask", color: "000000", dark: "F5F5F5" },
  fastapi: { name: "FastAPI", color: "009688" },
  spring: { name: "Spring", color: "6DB33F" },
  codeigniter: { name: "CodeIgniter", color: "EF4223" },
  symfony: { name: "Symfony", color: "000000", dark: "F5F5F5" },
  rubyonrails: { name: "Ruby on Rails", color: "CC0000" },

  // --- Mobile ---
  flutter: { name: "Flutter", color: "02569B" },
  android: { name: "Android", color: "3DDC84" },
  ios: { name: "iOS", color: "000000", dark: "F5F5F5" },

  // --- Build Tools & Testing ---
  vite: { name: "Vite", color: "646CFF" },
  webpack: { name: "Webpack", color: "8DD6F9" },
  babel: { name: "Babel", color: "F9DC3E" },
  eslint: { name: "ESLint", color: "4B32C3" },
  prettier: { name: "Prettier", color: "F7B93E" },
  vitest: { name: "Vitest", color: "6E9F18" },
  jest: { name: "Jest", color: "C21325" },

  // --- Databases ---
  mysql: { name: "MySQL", color: "4479A1" },
  postgresql: { name: "PostgreSQL", color: "4169E1" },
  sqlite: { name: "SQLite", color: "003B57" },
  mongodb: { name: "MongoDB", color: "47A248" },
  redis: { name: "Redis", color: "FF4438" },
  firebase: { name: "Firebase", color: "FFCA28" },
  supabase: { name: "Supabase", color: "3ECF8E" },
  mariadb: { name: "MariaDB", color: "003545" },

  // --- DevOps / Cloud / Tools ---
  git: { name: "Git", color: "F05032" },
  github: { name: "GitHub", color: "181717", dark: "F5F5F5" },
  gitlab: { name: "GitLab", color: "FC6D26" },
  docker: { name: "Docker", color: "2496ED" },
  kubernetes: { name: "Kubernetes", color: "326CE5" },
  amazonaws: { name: "AWS", color: "232F3E", dark: "F5F5F5" },
  googlecloud: { name: "Google Cloud", color: "4285F4" },
  vercel: { name: "Vercel", color: "000000", dark: "F5F5F5" },
  netlify: { name: "Netlify", color: "00C7B7" },
  nginx: { name: "Nginx", color: "009639" },
  postman: { name: "Postman", color: "FF6C37" },
  linux: { name: "Linux", color: "FCC624" },
  graphql: { name: "GraphQL", color: "E10098" },
  npm: { name: "npm", color: "CB3837" },
  yarn: { name: "Yarn", color: "2C8EBB" },

  // --- Design ---
  figma: { name: "Figma", color: "F24E1E" },
};

export function getTechIconUrl(slug) {
  const tech = TECH_ICONS[slug];

  if (!tech) return null;

  const cdnSlug = tech.slug || slug;

  // Kalau ada warna khusus dark mode, pakai format 3-parameter CDN-nya
  if (tech.dark) {
    return `https://cdn.simpleicons.org/${cdnSlug}/${tech.color}/${tech.dark}`;
  }

  return `https://cdn.simpleicons.org/${cdnSlug}/${tech.color}`;
}