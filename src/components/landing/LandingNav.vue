<!-- 落地页悬浮导航组件：支持滚动后样式切换，点击跳转登录页 -->
<template>
    <nav class="navbar">
        <div class="navbar-inner" :class="{ scrolled }">
            <a class="nav-logo" href="#" @click.prevent>
                <div class="nav-logo-blob">颐</div>
                <span class="nav-logo-name">颐养阁</span>
            </a>
            <div class="nav-links">
                <span class="nav-link">功能介绍</span>
                <span class="nav-link">专家团队</span>
                <span class="nav-link">用户评价</span>
                <span class="nav-link">名医健康圈</span>
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

/** 监听滚动事件，更新 scrolled 状态 */
function onScroll() {
    scrolled.value = scrollY > 80;
}

/** 跳转到登录/注册页 */
function goLogin() {
    router.push("/login");
}

onMounted(() => window.addEventListener("scroll", onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener("scroll", onScroll));
</script>

<style lang="scss" scoped>
/* 固定定位导航栏容器，悬浮在页面顶部 */
.navbar {
    position: fixed;
    top: 16px;
    left: 0;
    right: 0;
    z-index: 200;
    padding: 0 40px;
}

/* 毛玻璃效果的导航内容区，滚动后切换为深色背景 */
.navbar-inner {
    max-width: 1200px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 999px;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    gap: 24px;
    box-shadow:
        0 4px 24px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.25);
    transition: all 0.4s ease;

    /* 滚动超过 80px 后切换为深色风格 */
    &.scrolled {
        background: rgba(20, 26, 16, 0.72);
        border-color: rgba(93, 112, 82, 0.25);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
    }
}

/* Logo 区：有机形状图标 + 品牌名称 */
.nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;
}

.nav-logo-blob {
    width: 34px;
    height: 34px;
    background: var(--ld-cinnabar);
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 13px;
    font-weight: 800;
    box-shadow: 0 2px 8px rgba(179, 60, 44, 0.4);
}

.nav-logo-name {
    font-size: 16px;
    font-weight: 700;
    color: white;
}

/* 导航链接列表 */
.nav-links {
    display: flex;
    gap: 4px;
    flex: 1;
}

.nav-link {
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: rgba(255, 255, 255, 0.12);
        color: white;
    }
}

/* 右侧操作区：登录/注册按钮 */
.nav-actions {
    margin-left: auto;
}

.btn-primary-nav {
    padding: 8px 20px;
    border-radius: 999px;
    background: white;
    color: var(--ld-moss);
    border: none;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    transition: all 0.25s;

    &:hover {
        transform: scale(1.04);
    }
}
</style>
