const DEFAULT_API_BASE_URL = "/e-commerce/api";

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export function buildApiUrl(path: string) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    if (/^https?:\/\//i.test(API_BASE_URL)) {
        return `${API_BASE_URL.replace(/\/$/, "")}${normalizedPath}`;
    }
    return `${API_BASE_URL.replace(/\/$/, "")}${normalizedPath}`;
}
