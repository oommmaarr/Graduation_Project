/** Local dev always; Vercel builds via vite.config (VERCEL → VITE_ENABLE_DEV_TOOLS). */
export const showTrackDevTools =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_TOOLS === "true";
