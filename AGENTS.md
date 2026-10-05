# AGENTS.md

React 19 + Vite portfolio with 3D effects (Three.js via @react-three/fiber), animations (Framer Motion, GSAP), smooth scroll (Lenis).

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run lint      # Run Oxlint
npm run preview   # Preview production build
```

**No typecheck script.** Project uses JS, not TS.

## Stack

- **React 19.2.8** (latest, uses new features)
- **Vite 8** with `@vitejs/plugin-react` (uses Oxc transform)
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin
- **Oxlint** for linting (not ESLint)
- **3D**: `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`, `three`
- **Animation**: `framer-motion`, `gsap`, `motion`
- **Smooth scroll**: `lenis` (initialized in App.jsx, exposed as `window.__lenis`)
- **Icons**: `lucide-react`

## Architecture

- Entry: `src/main.jsx` → `src/App.jsx`
- Components: `src/components/` (20+ components including Hero, About, SpaceBackground, GlowCursor, etc.)
- Lenis smooth scroll initialized once in App.jsx useEffect, cleanup on unmount
- SpaceBackground and GlowCursor mounted as fixed overlays in App
- `.glb` files configured as assets in `vite.config.js`

## Conventions

- JSX files (no TypeScript)
- Tailwind for styling
- React 19 patterns (no legacy code)
- Oxlint rules enforce React hooks and component export patterns

## Gotchas

- Uses Oxlint, not ESLint. Config: `.oxlintrc.json`
- Tailwind 4 (latest) with Vite plugin (not PostCSS plugin)
- 3D assets must be in `vite.config.js` `assetsInclude` array
- Lenis instance stored at `window.__lenis` for external access
