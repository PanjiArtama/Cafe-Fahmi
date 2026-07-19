/**
 * Resolves image URLs for both development and production environments.
 *
 * In development:
 *   VITE_API_URL = "http://localhost:5005"
 *   /uploads/menu/image.jpg → http://localhost:5005/uploads/menu/image.jpg
 *
 * In production (nginx):
 *   VITE_API_URL = "/api"
 *   /uploads/menu/image.jpg → /uploads/menu/image.jpg (served directly by nginx)
 *   Absolute URLs (http/https) are returned as-is.
 */

const baseUrl = import.meta.env.VITE_API_URL;

/**
 * Resolve an image path from the backend to a full URL.
 * Handles /uploads/* paths correctly for both dev and production.
 * @param {string} path - The image path (e.g. "/uploads/menu/image.jpg")
 * @returns {string} The resolved URL
 */
export const resolveImageUrl = (path) => {
    if (!path) return '';

    // Already a full URL — use as-is
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    // /uploads/* paths: in production, nginx serves these directly
    // In development, they need the backend base URL prefix
    if (path.startsWith('/uploads/')) {
        // If baseUrl is a relative path like "/api", serve uploads directly from root
        // If baseUrl is an absolute URL like "http://localhost:5005", prepend it
        if (baseUrl.startsWith('http')) {
            return `${baseUrl}${path}`;
        }
        // Production: nginx serves /uploads/ directly
        return path;
    }

    // Other API paths
    return `${baseUrl}${path}`;
};
