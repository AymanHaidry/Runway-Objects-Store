import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Env handling (safe for both dev + Vercel)
const isDev = process.env.NODE_ENV !== "production";

const port = Number(process.env.PORT) || 3000;
const basePath = process.env.BASE_PATH || "/";

// Replit secrets fix (kept as-is but safer)
const supabaseUrl =
  process.env.VITE_SUPABASE_ANON_KEY?.startsWith("http")
    ? process.env.VITE_SUPABASE_ANON_KEY
    : process.env.VITE_SUPABASE_URL?.startsWith("http")
    ? process.env.VITE_SUPABASE_URL
    : "";

const supabaseAnonKey =
  process.env.VITE_SUPABASE_URL?.startsWith("eyJ")
    ? process.env.VITE_SUPABASE_URL
    : process.env.VITE_SUPABASE_ANON_KEY?.startsWith("eyJ")
    ? process.env.VITE_SUPABASE_ANON_KEY
    : "";

export default defineConfig(async () => {
  // Load Replit-only plugins dynamically (DEV ONLY)
  const replitPlugins =
    isDev && process.env.REPL_ID
      ? [
          runtimeErrorOverlay(),
          (await import("@replit/vite-plugin-cartographer")).cartographer({
            root: path.resolve(import.meta.dirname, ".."),
          }),
          (await import("@replit/vite-plugin-dev-banner")).devBanner(),
        ]
      : [];

  return {
    base: basePath,

    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_ANON_KEY":
        JSON.stringify(supabaseAnonKey),
    },

    plugins: [react(), tailwindcss(), ...replitPlugins],

    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(
          import.meta.dirname,
          "..",
          "..",
          "attached_assets"
        ),
      },
      dedupe: ["react", "react-dom"],
    },

    root: path.resolve(import.meta.dirname),

    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },

    // Dev server only (ignored by Vercel production)
    server: isDev
      ? {
          port,
          strictPort: true,
          host: "0.0.0.0",
          allowedHosts: true,
          fs: {
            strict: true,
          },
        }
      : undefined,

    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
