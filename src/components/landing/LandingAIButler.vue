<!-- src/components/landing/LandingAIButler.vue -->
<template>
    <section
        ref="sectionEl"
        class="ai-butler"
        id="ai-butler-section"
    >
        <div class="ai-blob ai-blob-1 drifting-1" />
        <div class="ai-blob ai-blob-2 drifting-2" />
        <div class="container">
            <div class="ai-inner">
                <!-- 左侧 -->
                <div class="ai-left">
                    <h2
                        class="section-title"
                        data-animate="from-left"
                        style="--delay: 80ms"
                    >
                        你的专属<br />东方健康顾问
                    </h2>
                    <p
                        class="section-sub"
                        data-animate="from-left"
                        style="--delay: 160ms"
                    >
                        基于中医体质理论 × 节气时令 ×
                        大语言模型，随时为你解答健康问题、生成个性方案。
                    </p>
                    <ul class="ai-feats">
                        <li
                            v-for="(f, i) in feats"
                            :key="f.name"
                            class="ai-feat"
                            data-animate="from-left"
                            :style="{ '--delay': `${240 + i * 90}ms` }"
                        >
                            <div class="ai-feat-icon">{{ f.icon }}</div>
                            <div>
                                <div class="ai-feat-name">{{ f.name }}</div>
                                <div class="ai-feat-desc">{{ f.desc }}</div>
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- 右侧聊天窗口 -->
                <div
                    class="ai-right"
                    data-animate="from-right"
                    style="--delay: 200ms"
                >
                    <div class="chat-window">
                        <div class="chat-header">
                            <div class="chat-avatar">🤖</div>
                            <div>
                                <div class="chat-name">颐养 AI 管家</div>
                                <div class="chat-status">
                                    <span class="chat-dot" />在线服务中
                                </div>
                            </div>
                            <div class="chat-badge">由 DeepSeek 驱动</div>
                        </div>
                        <div class="chat-body">
                            <div class="chat-sys">
                                今天是芒种节气 🌾 已为你生成专属建议
                            </div>
                            <div
                                v-for="msg in messages"
                                :key="msg.id"
                                class="chat-row"
                                :class="[msg.role, { show: msg.visible }]"
                            >
                                <div
                                    v-if="msg.type === 'bubble'"
                                    class="chat-bubble"
                                    :class="msg.role"
                                    v-html="msg.html"
                                />
                                <div v-else class="chat-referral">
                                    <div class="referral-left">
                                        <div class="referral-icon">👩‍⚕️</div>
                                        <div>
                                            <div class="referral-name">
                                                张明慧 · 主任中医师
                                            </div>
                                            <div class="referral-org">
                                                北京协和医院 · 气虚调理专家
                                            </div>
                                        </div>
                                    </div>
                                    <button class="referral-btn">
                                        立即问诊
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="chat-input-bar">
                            <input
                                class="chat-input"
                                type="text"
                                placeholder="向 AI 管家提问…"
                                readonly
                            />
                            <button class="chat-send">
                                <svg
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { useScrollAnimate } from "@/composables/landing/useScrollAnimate";

/**
 * AI 管家展示区块
 * 左侧功能特性列表，右侧聊天窗口演示
 * 进入视口时逐条显示对话消息
 */

const sectionEl = ref<HTMLElement | null>(null);

// 功能特性列表
const feats = [
    {
        icon: "🌿",
        name: "节气健康日历",
        desc: "每日推送当令饮食、作息与穴位建议",
    },
    {
        icon: "🧬",
        name: "体质辨识分析",
        desc: "问答式评估，生成九大体质专属方案",
    },
    { icon: "💬", name: "实时健康问答", desc: "随时提问，中西医知识融合解答" },
    {
        icon: "👩‍⚕️",
        name: "智能转诊推荐",
        desc: "识别需专业就诊情况，一键连接名医",
    },
];

// 聊天消息，visible 用于控制动画显示
const messages = reactive([
    {
        id: 1,
        role: "ai",
        type: "bubble",
        visible: false,
        html: "芒种时节，暑热渐盛，湿气偏重。根据你的<strong>气虚体质</strong>，今日建议：<br><br>🍲 <strong>饮食</strong>：薏仁赤小豆粥，健脾祛湿<br>🛏 <strong>作息</strong>：午后小憩 20 分钟，补充阳气<br>💧 <strong>补水</strong>：温水为主，少喝冷饮",
    },
    {
        id: 2,
        role: "user",
        type: "bubble",
        visible: false,
        html: "最近容易胸闷气短，有什么调理方法吗？",
    },
    {
        id: 3,
        role: "ai",
        type: "bubble",
        visible: false,
        html: "胸闷气短在气虚体质中较常见，芒种湿热更易加重。<br><br>✅ 可尝试<strong>黄芪枸杞茶</strong>，每日一杯补气固表<br>✅ 练习<strong>腹式深呼吸</strong>，每次 5 分钟<br>✅ 避免剧烈运动，选择<strong>八段锦</strong>代替",
    },
    {
        id: 4,
        role: "ai",
        type: "referral",
        visible: false,
        html: "",
    },
]);

// 消息逐条出现的延迟时间
const REVEAL_DELAYS = [300, 1400, 2600, 3800];
let revealed = false;

onMounted(() => {
    const el = sectionEl.value;
    if (!el) return;

    // 使用 useScrollAnimate 处理左侧元素入场动画
    useScrollAnimate(el);

    // 使用 IntersectionObserver 监听区块进入视口，逐条显示聊天消息
    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0]?.isIntersecting && !revealed) {
                revealed = true;
                messages.forEach((msg, i) => {
                    setTimeout(() => {
                        msg.visible = true;
                    }, REVEAL_DELAYS[i]);
                });
                observer.disconnect();
            }
        },
        { threshold: 0.2 },
    );
    observer.observe(el);
});
</script>

<style lang="scss" scoped>
.ai-butler {
    padding: 108px 0;
    background: rgba(6, 14, 5, 0.5);
    position: relative;
    overflow: hidden;
    z-index: 1;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 48px;
}

// 背景毛玻璃效果斑点
.ai-blob {
    position: absolute;
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    filter: blur(60px);
    pointer-events: none;
}

.ai-blob-1 {
    right: -50px;
    top: -30px;
    width: 300px;
    height: 260px;
    background: rgba(93, 112, 82, 0.1);
}

.ai-blob-2 {
    left: -40px;
    bottom: -40px;
    width: 240px;
    height: 200px;
    background: rgba(193, 140, 93, 0.08);
    border-radius: 30% 70% 60% 40% / 50% 40% 60% 50%;
}

// 双列布局
.ai-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
    position: relative;
    z-index: 1;
}

// ========== 左侧：文本内容 ==========

.section-title {
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    font-weight: 500;
    color: white;
    line-height: 1.5;
    font-family: "STKaiti", "KaiTi", "STSong", serif;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.25);
    text-wrap: balance;
}

.section-sub {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.8;
    max-width: 520px;
    margin-top: 14px;
}

// 功能特性列表
.ai-feats {
    list-style: none;
    margin-top: 36px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.ai-feat {
    display: flex;
    align-items: flex-start;
    gap: 16px;
}

.ai-feat-icon {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: 12px;
    background: rgba(93, 112, 82, 0.2);
    border: 1px solid rgba(93, 112, 82, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    transition: transform 0.3s;

    .ai-feat:hover & {
        transform: scale(1.12) rotate(-5deg);
    }
}

.ai-feat-name {
    font-size: 15px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 3px;
}

.ai-feat-desc {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.6;
}

// ========== 右侧：聊天窗口 ==========

.ai-right {
    display: flex;
    justify-content: center;
}

.chat-window {
    width: 100%;
    max-width: 440px;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
        0 24px 64px rgba(0, 0, 0, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    background: rgba(12, 20, 10, 0.72);
}

// 聊天窗口头部
.chat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
}

.chat-avatar {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    flex-shrink: 0;
    background: linear-gradient(
        135deg,
        rgba(93, 112, 82, 0.7),
        rgba(70, 90, 60, 0.9)
    );
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 1px solid rgba(93, 112, 82, 0.4);
}

.chat-name {
    font-size: 14px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
}

.chat-status {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.42);
    margin-top: 2px;
}

.chat-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.4;
    }
}

.chat-badge {
    margin-left: auto;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    padding: 3px 10px;
}

// 聊天窗口内容区
.chat-body {
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 280px;
}

.chat-sys {
    text-align: center;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.04);
    border-radius: 999px;
    padding: 5px 14px;
    margin: 0 auto;
}

// 消息行：AI 和用户分别左右对齐，进入动画
.chat-row {
    display: flex;
    opacity: 0;
    transform: translateY(8px);
    transition:
        opacity 0.5s ease,
        transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);

    &.show {
        opacity: 1;
        transform: none;
    }

    &.ai {
        justify-content: flex-start;
    }

    &.user {
        justify-content: flex-end;
    }
}

// 聊天气泡
.chat-bubble {
    max-width: 88%;
    border-radius: 16px;
    padding: 12px 14px;
    font-size: 13px;
    line-height: 1.7;

    &.ai {
        background: rgba(93, 112, 82, 0.18);
        border: 1px solid rgba(93, 112, 82, 0.25);
        color: rgba(255, 255, 255, 0.82);
        border-bottom-left-radius: 4px;
    }

    &.user {
        background: rgba(93, 112, 82, 0.45);
        border: 1px solid rgba(93, 112, 82, 0.5);
        color: rgba(255, 255, 255, 0.9);
        border-bottom-right-radius: 4px;
    }
}

// 转诊卡片
.chat-referral {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: rgba(193, 140, 93, 0.12);
    border: 1px solid rgba(193, 140, 93, 0.25);
    border-radius: 14px;
    padding: 12px 14px;
    max-width: 88%;
}

.referral-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.referral-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    flex-shrink: 0;
    background: linear-gradient(
        135deg,
        rgba(93, 112, 82, 0.6),
        rgba(193, 140, 93, 0.6)
    );
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.referral-name {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.85);
}

.referral-org {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.42);
    margin-top: 2px;
}

.referral-btn {
    flex-shrink: 0;
    background: rgba(193, 140, 93, 0.55);
    border: 1px solid rgba(193, 140, 93, 0.5);
    color: rgba(255, 255, 255, 0.9);
    border-radius: 999px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;

    &:hover {
        background: rgba(193, 140, 93, 0.75);
    }
}

// 聊天输入栏
.chat-input-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.03);
}

.chat-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    padding: 9px 16px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    outline: none;
    font-family: inherit;
}

.chat-send {
    width: 36px;
    height: 36px;
    border-radius: 999px;
    flex-shrink: 0;
    background: rgba(93, 112, 82, 0.6);
    border: 1px solid rgba(93, 112, 82, 0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: rgba(93, 112, 82, 0.85);
    }
}
</style>
