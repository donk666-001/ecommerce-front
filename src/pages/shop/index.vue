<template>
    <div class="page-wrapper">
        <HeaderLayout />

        <div class="hub">
            <section class="hero">
                <div class="hero-label font-serif">
                    WELLNESS SHOP · 颐养好物
                </div>
                <h1 class="font-serif">商城</h1>
                <p class="hero-sub">
                    精选养生产品、节气好物、食疗方材，为你的健康生活添一份匠心之选
                </p>
                <div class="hero-meta">
                    <span class="meta-item"
                        >🛒 养生好物 <strong>即将上线</strong></span
                    >
                    <span class="meta-item"
                        >🎁 积分商城 <strong>敬请期待</strong></span
                    >
                </div>
            </section>

            <div class="empty-card">
                <div class="empty-icon">🛍️</div>
                <h3 class="font-serif">商城正在建设中</h3>
                <p>精选养生好物、节气礼盒、食疗食材即将上架，敬请期待。</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import HeaderLayout from "@/layouts/HeaderLayout.vue";
</script>

<style scoped lang="scss">
.page-wrapper {
    min-height: 100vh;
}

.hub {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 40px 80px;
}

.hero {
    background: linear-gradient(135deg, #fdfaf3 0%, #f0e8d5 100%);
    border: 1px solid var(--gold-soft);
    border-radius: 20px;
    padding: 36px 40px;
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
}
.hero::before {
    content: "物";
    position: absolute;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);
    font-family: "STKaiti", serif;
    font-size: 200px;
    color: var(--gold);
    opacity: 0.1;
    line-height: 1;
    font-weight: 900;
}
.hero-label {
    font-size: 13px;
    color: var(--gold);
    letter-spacing: 4px;
    margin-bottom: 8px;
}
.hero h1 {
    font-family: "STKaiti", serif;
    font-size: 38px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 8px;
}
.hero-sub {
    color: var(--ink-muted);
    font-size: 15px;
    max-width: 580px;
}
.hero-meta {
    display: flex;
    gap: 24px;
    margin-top: 24px;
    font-size: 13px;
}
.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ink-muted);
}
.meta-item strong {
    color: var(--jade);
    font-weight: 600;
}

.empty-card {
    text-align: center;
    padding: 80px 40px;
    background: var(--paper);
    border-radius: 20px;
    border: 1px solid rgba(232, 223, 208, 0.4);
    box-shadow: var(--shadow);
}
.empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
}
.empty-card h3 {
    font-size: 24px;
    color: var(--ink);
    margin-bottom: 12px;
}
.empty-card p {
    font-size: 15px;
    color: var(--ink-muted);
}

@media (max-width: 768px) {
    .hub {
        padding: 20px 16px 60px;
    }
    .hero {
        padding: 24px 20px;
    }
    .hero::before {
        display: none;
    }
}
</style>
