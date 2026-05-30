function normalizeRedirectPath(rawRedirect: unknown): string | null {
    if (typeof rawRedirect !== "string") return null;
    if (!rawRedirect.startsWith("/") || rawRedirect.startsWith("//"))
        return null;
    if (rawRedirect.startsWith("/login")) return null;
    return rawRedirect;
}

export function resolvePostLoginPath(
    roleId: number,
    rawRedirect?: unknown,
): string {
    const redirect = normalizeRedirectPath(rawRedirect);

    if (roleId === 1) {
        // 管理员 → /admin
        return redirect?.startsWith("/admin") ? redirect : "/admin";
    }

    console.log(`roleID：${roleId}`);
    if (roleId === 4) {
        // 客服 → /customer
        return redirect?.startsWith("/customer") ? redirect : "/customer";
    }

    // 其他用户（包括专家、普通用户）→ /
    return redirect ?? "/";
}
