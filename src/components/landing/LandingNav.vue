<!-- 落地页悬浮导航组件：支持滚动后样式切换，点击跳转登录页 -->
<template>
    <nav class="navbar">
        <div class="navbar-inner" :class="{ scrolled }">
            <a class="nav-logo" href="#" @click.prevent>
                <div class="nav-logo-blob">颐</div>
                <span class="nav-logo-name">颐养阁</span>
            </a>
            <div class="nav-divider" aria-hidden="true" />
            <div class="nav-links">
                <button
                    v-for="link in navLinks"
                    :key="link.label"
                    class="nav-link"
                    type="button"
                    @click="scrollToSection(link.selector)"
                >
                    {{ link.label }}
                </button>
            </div>
            <div class="nav-actions">
                <button class="btn-primary-nav" @click="goLogin">
                    前往登录 / 注册
                </button>
            </div>
        </div>
    </nav>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

/** 路由实例，用于跳转登录页 */
const router = useRouter();
/** 是否已滚动超过阈值（80px） */
const scrolled = ref(false);

const navLinks = [
    { label: "功能介绍", selector: "#capability-story-section" },
    { label: "专家团队", selector: ".experts" },
    { label: "用户评价", selector: ".testimonials" },
    { label: "名医健康圈", selector: "#ai-butler-section" },
];

/** 监听滚动事件，更新 scrolled 状态 */
function onScroll() {
    scrolled.value = scrollY > 80;
}

function scrollToSection(selector: string) {
    const target = document.querySelector<HTMLElement>(selector);
    if (!target) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
    });
}

/** 跳转到登录/注册页 */
function goLogin() {
    router.push("/login");
}

onMounted(() => window.addEventListener("scroll", onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener("scroll", onScroll));
</script>

<style lang="scss" scoped>
.navbar {
    position: fixed;
    top: 16px;
    left: 0;
    right: 0;
    z-index: 200;
    padding: 0 40px;
}

.navbar-inner {
    max-width: 1200px;
    margin: 0 auto;
    background: rgba(8, 18, 10, 0.38);
    backdrop-filter: blur(20px) saturate(1.5) brightness(1.05);
    -webkit-backdrop-filter: blur(20px) saturate(1.5) brightness(1.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    padding: 8px 10px 8px 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.22),
        inset 0 1px 0 rgba(255, 255, 255, 0.14),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1);
    transition:
        background 0.36s ease,
        border-color 0.36s ease,
        box-shadow 0.36s ease;

    &.scrolled {
        background: rgba(8, 16, 9, 0.82);
        border-color: rgba(255, 255, 255, 0.1);
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.36),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
}

/* ── Logo ── */
.nav-logo {
    display: flex;
    align-items: center;
    gap: 9px;
    text-decoration: none;
    flex-shrink: 0;
    padding: 2px 4px;
}

.nav-logo-blob {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.96);
    /* 珠红色 */
    background: linear-gradient(
        145deg,
        oklch(0.58 0.21 25),
        oklch(0.40 0.23 18)
    );
    border: 1px solid oklch(0.62 0.18 28 / 0.5);
    box-shadow:
        inset 0 1px 0 rgba(255, 200, 180, 0.25),
        0 0 14px oklch(0.52 0.22 22 / 0.45),
        0 2px 6px rgba(0, 0, 0, 0.28);
}

.nav-logo-name {
    font-size: 16px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: 0.04em;
}

/* ── 中间分隔线 ── */
.nav-divider {
    width: 1px;
    height: 18px;
    background: rgba(255, 255, 255, 0.12);
    flex-shrink: 0;
    margin: 0 6px;
}

/* ── 导航链接 ── */
.nav-links {
    display: flex;
    gap: 2px;
    flex: 1;
}

.nav-link {
    position: relative;
    border: 0;
    padding: 7px 15px;
    border-radius: 999px;
    background: transparent;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.68);
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.01em;
    transition:
        color 0.22s ease,
        background 0.22s ease;

    &::after {
        content: '';
        position: absolute;
        bottom: 5px;
        left: 50%;
        transform: translateX(-50%) scaleX(0);
        width: 16px;
        height: 1.5px;
        border-radius: 999px;
        background: rgba(210, 235, 185, 0.7);
        transition: transform 0.24s ease;
    }

    &:hover {
        color: rgba(255, 255, 255, 0.96);
        background: rgba(255, 255, 255, 0.07);

        &::after {
            transform: translateX(-50%) scaleX(1);
        }
    }

    &:focus-visible {
        outline: 2px solid rgba(221, 239, 202, 0.6);
        outline-offset: 2px;
    }
}

/* ── 右侧登录按钮 ── */
.nav-actions {
    margin-left: auto;
    flex-shrink: 0;
}

.btn-primary-nav {
    padding: 9px 22px;
    border-radius: 999px;
    background: rgba(240, 248, 228, 0.94);
    color: rgba(18, 42, 22, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.22);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.02em;
    box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.55);
    transition:
        transform 0.22s ease,
        background 0.22s ease,
        box-shadow 0.22s ease;

    &:hover {
        transform: translateY(-1px);
        background: rgba(252, 255, 245, 0.99);
        box-shadow:
            0 6px 18px rgba(0, 0, 0, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
    }

    &:active {
        transform: translateY(0) scale(0.98);
        transition-duration: 0.08s;
    }

    &:focus-visible {
        outline: 2px solid rgba(221, 239, 202, 0.75);
        outline-offset: 3px;
    }
}

@media (max-width: 880px) {
    .navbar {
        top: 10px;
        padding: 0 20px;
    }

    .nav-links,
    .nav-divider {
        display: none;
    }
}

@media (max-width: 520px) {
    .navbar {
        padding: 0 12px;
    }

    .navbar-inner {
        padding: 7px 10px;
    }

    .nav-logo-name {
        font-size: 15px;
    }

    .btn-primary-nav {
        padding: 8px 14px;
        font-size: 12px;
    }
}
</style>
