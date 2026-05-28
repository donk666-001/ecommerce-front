function normalizeRedirectPath(rawRedirect: unknown): string | null {
    if (typeof rawRedirect !== "string") return null;
    if (!rawRedirect.startsWith("/") || rawRedirect.startsWith("//")) return null;
    if (rawRedirect.startsWith("/login")) return null;
    return rawRedirect;
}

export function resolvePostLoginPath(roleId: number, rawRedirect?: unknown): string {
    const redirect = normalizeRedirectPath(rawRedirect);

    if (roleId === 1) {
        return redirect?.startsWith("/admin") ? redirect : "/admin";
    }

    return redirect ?? "/";
}
