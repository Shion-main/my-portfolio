/** Resolves a site-root path (e.g. "media/work/korte/live-desktop.webp") against the deploy base. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const EMAIL = "create@by-shion.dev";
