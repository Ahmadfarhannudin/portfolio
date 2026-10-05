import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  assetsInclude: ["**/*.glb"],

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const nm = id.replace(/\\/g, '/').split('/node_modules/')[1];
          if (!nm) return;

          const pkg = nm.startsWith('@')
            ? nm.split('/').slice(0, 2).join('/')
            : nm.split('/')[0];

          if (
            pkg === 'react' ||
            pkg === 'react-dom' ||
            pkg === 'react-router' ||
            pkg === 'react-router-dom' ||
            pkg === 'scheduler'
          ) {
            return 'vendor-react';
          }
          if (
            pkg === 'three' ||
            pkg.startsWith('@react-three/') ||
            pkg === '@react-spring' ||
            pkg.startsWith('@dimforge/')
          ) {
            return 'vendor-three';
          }
          if (pkg === 'framer-motion' || pkg === 'motion-dom' || pkg === 'motion-utils') {
            return 'vendor-motion';
          }
          if (pkg === 'gsap') return 'vendor-gsap';
          if (pkg === 'lenis') return 'vendor-lenis';
          if (pkg === 'lucide-react' || pkg === 'clsx' || pkg === 'tailwind-merge') {
            return 'vendor-ui';
          }
          if (pkg === 'ogl' || pkg === 'meshline') return 'vendor-ogl';
          if (pkg.startsWith('@supabase/')) return 'vendor-supabase';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'oxc',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'three'],
  },
});