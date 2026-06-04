<template>
    <article class="capability-card" :class="`capability-card--${card.kind}`">
        <div class="card-topline">
            <div class="card-seal">{{ card.seal }}</div>
            <div>
                <p class="card-kicker">{{ card.kicker }}</p>
                <h3 class="card-title">{{ card.title }}</h3>
            </div>
            <span class="card-status">{{ card.status }}</span>
        </div>

        <p class="card-summary">{{ card.summary }}</p>

        <div v-if="card.kind === 'seasonal'" class="seasonal-panel">
            <div class="season-meter">
                <div class="meter-ring">
                    <span class="meter-value">72</span>
                    <span class="meter-label">湿热指数</span>
                </div>
            </div>
            <div class="season-plan">
                <div class="plan-row">
                    <span>06:40</span>
                    <strong>陈皮薏仁粥</strong>
                    <em>健脾祛湿</em>
                </div>
                <div class="plan-row">
                    <span>12:50</span>
                    <strong>午后小憩 20 分钟</strong>
                    <em>养心气</em>
                </div>
                <div class="plan-row">
                    <span>21:10</span>
                    <strong>阴陵泉按揉</strong>
                    <em>左右各 3 分钟</em>
                </div>
            </div>
        </div>

        <div v-else-if="card.kind === 'butler'" class="butler-panel">
            <div class="chat-line chat-line--ai">
                <span>AI</span>
                <p>芒种后湿气偏重，你昨晚深睡偏少，今日建议减少冷饮。</p>
            </div>
            <div class="chat-line chat-line--user">
                <p>下午容易犯困怎么办？</p>
            </div>
            <div class="chat-line chat-line--ai">
                <span>AI</span>
                <p>安排 8 分钟呼吸练习，晚餐加入山药和莲子，先观察 3 天。</p>
            </div>
            <div class="butler-tags">
                <span>体质：气虚夹湿</span>
                <span>建议可信度 91%</span>
            </div>
        </div>

        <div v-else-if="card.kind === 'sleep'" class="sleep-panel">
            <div class="sleep-score">
                <span>83</span>
                <em>睡眠分</em>
            </div>
            <div class="sleep-bars">
                <div
                    v-for="bar in sleepBars"
                    :key="bar.name"
                    class="sleep-bar"
                    :style="{ '--bar-width': bar.width }"
                >
                    <span>{{ bar.name }}</span>
                    <div><i /></div>
                    <em>{{ bar.time }}</em>
                </div>
            </div>
            <div class="sleep-note">
                入睡提前 18 分钟，夜醒 2 次，建议把茶饮调整到 16:00 前。
            </div>
        </div>

        <div v-else-if="card.kind === 'course'" class="course-panel">
            <div class="course-main">
                <span>正在学习</span>
                <strong>四君子汤的现代应用</strong>
                <em>第 4 讲，脾胃调养与日常食疗</em>
            </div>
            <div class="course-progress">
                <div><i /></div>
                <span>完成 68%</span>
            </div>
            <div class="course-list">
                <span>今晚 20:00 直播答疑</span>
                <span>附赠 7 日茶饮计划</span>
            </div>
        </div>

        <div v-else class="consult-panel">
            <div class="doctor-card">
                <div class="doctor-avatar-wrap">
                    <div class="doctor-avatar">陈</div>
                    <span class="online-dot" aria-hidden="true" />
                </div>
                <div>
                    <strong>陈若岚 主任中医师</strong>
                    <span>上海中医药大学附属医院</span>
                </div>
            </div>
            <div class="consult-queue">
                <div>
                    <span>预计等待</span>
                    <strong>12 分钟</strong>
                </div>
                <div>
                    <span>擅长方向</span>
                    <strong>睡眠与体质调理</strong>
                </div>
            </div>
            <button class="consult-button" type="button">发起问诊</button>
        </div>
    </article>
</template>

<script lang="ts" setup>
interface CapabilityStoryCard {
    kind: "seasonal" | "butler" | "sleep" | "course" | "consult";
    seal: string;
    kicker: string;
    title: string;
    status: string;
    summary: string;
}

defineProps<{
    card: CapabilityStoryCard;
}>();

const sleepBars = [
    { name: "深睡", width: "42%", time: "1h 48m" },
    { name: "浅睡", width: "68%", time: "4h 05m" },
    { name: "快速眼动", width: "35%", time: "1h 12m" },
];
</script>

<style lang="scss" scoped>
@keyframes onlinePulse {
    0%   { transform: scale(1);   opacity: 0.7; }
    65%  { transform: scale(2.5); opacity: 0;   }
    100% { transform: scale(1);   opacity: 0;   }
}

@keyframes buttonShimmer {
    0%   { left: -80%; }
    55%  { left: 135%; }
    100% { left: 135%; }
}

.capability-card {
    position: relative;
    min-height: 468px;
    padding: 24px;
    color: rgba(247, 251, 239, 0.94);
    border-radius: 16px;
    overflow: hidden;
    background:
        radial-gradient(
            circle at 16% 10%,
            rgba(169, 197, 157, 0.18),
            transparent 34%
        ),
        linear-gradient(145deg, rgba(15, 35, 23, 0.96), rgba(7, 18, 12, 0.98));
    border: 1px solid rgba(171, 199, 164, 0.2);
    box-shadow:
        0 6px 8px rgba(0, 0, 0, 0.24),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    transition:
        transform 0.42s var(--ld-ease-out),
        border-color 0.32s var(--ld-ease-out),
        background 0.42s var(--ld-ease-out);

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
            linear-gradient(
                110deg,
                transparent 0%,
                rgba(255, 255, 255, 0.08) 42%,
                transparent 58%
            ),
            radial-gradient(
                circle at 80% 0%,
                rgba(201, 181, 119, 0.13),
                transparent 32%
            );
        opacity: 0;
        transform: translateX(-22%);
        transition:
            opacity 0.42s var(--ld-ease-out),
            transform 0.62s var(--ld-ease-out);
    }

    &:hover {
        transform: translateY(-4px);
        border-color: rgba(191, 218, 178, 0.34);

        &::before {
            opacity: 1;
            transform: translateX(18%);
        }
    }
}

.card-topline {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 14px;
    align-items: start;
}

.card-seal {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(113, 144, 102, 0.24);
    border: 1px solid rgba(188, 217, 170, 0.24);
    color: rgba(237, 249, 220, 0.98);
    font-family: "STKaiti", "KaiTi", "STSong", serif;
    font-size: 24px;
    line-height: 1;
}

.card-kicker {
    margin: 1px 0 4px;
    font-size: 12px;
    color: rgba(222, 232, 202, 0.56);
}

.card-title {
    margin: 0;
    font-size: clamp(1.32rem, 2vw, 1.65rem);
    font-weight: 700;
    line-height: 1.25;
    text-wrap: balance;
}

.card-status {
    border-radius: 999px;
    padding: 5px 10px;
    font-size: 11px;
    color: rgba(235, 246, 218, 0.78);
    background: rgba(232, 241, 211, 0.08);
    border: 1px solid rgba(232, 241, 211, 0.12);
    white-space: nowrap;
}

.card-summary {
    position: relative;
    z-index: 1;
    max-width: 33ch;
    margin: 18px 0 22px;
    color: rgba(231, 238, 221, 0.68);
    font-size: 14px;
    line-height: 1.75;
}

.seasonal-panel,
.butler-panel,
.sleep-panel,
.course-panel,
.consult-panel {
    position: relative;
    z-index: 1;
}

.seasonal-panel {
    display: grid;
    grid-template-columns: minmax(138px, 158px) 1fr;
    gap: 22px;
    align-items: center;
}

.season-meter {
    display: grid;
    place-items: center;
    align-self: center;
}

.meter-ring {
    position: relative;
    display: grid;
    place-items: center;
    width: 132px;
    height: 132px;
    border-radius: 50%;
    background:
        radial-gradient(circle at center, rgba(10, 24, 15, 0.96) 57%, transparent 58%),
        conic-gradient(
            from -70deg,
            rgba(184, 213, 164, 0.95) 0 72%,
            rgba(255, 255, 255, 0.1) 72% 100%
        );
    box-shadow:
        inset 0 0 18px rgba(210, 235, 192, 0.1),
        0 10px 24px rgba(0, 0, 0, 0.16);

    &::after {
        content: "";
        position: absolute;
        inset: 15px;
        border-radius: inherit;
        border: 1px solid rgba(221, 239, 202, 0.08);
        pointer-events: none;
    }
}

.meter-value {
    position: absolute;
    top: 50%;
    left: 50%;
    display: block;
    transform: translate(-50%, -58%);
    font-size: 42px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: 0;
    font-variant-numeric: tabular-nums;
    text-align: center;
}

.meter-label {
    position: absolute;
    left: 50%;
    bottom: 28px;
    display: block;
    margin: 0;
    transform: translateX(-50%);
    font-size: 11px;
    line-height: 1;
    color: rgba(231, 238, 221, 0.52);
    white-space: nowrap;
    text-align: center;
}

.season-plan {
    display: grid;
    gap: 10px;
}

.plan-row {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 4px 12px;
    align-items: baseline;
    min-height: 58px;
    padding: 12px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.055);
    border: 1px solid rgba(255, 255, 255, 0.07);

    span {
        font-size: 12px;
        line-height: 1;
        color: rgba(219, 232, 203, 0.46);
        font-variant-numeric: tabular-nums;
    }

    strong {
        font-size: 13px;
        font-weight: 700;
        line-height: 1.28;
    }

    em {
        grid-column: 2;
        font-style: normal;
        font-size: 11px;
        color: rgba(199, 217, 178, 0.58);
    }
}

.butler-panel {
    display: grid;
    gap: 12px;
}

.chat-line {
    max-width: 90%;
    border-radius: 16px;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.065);
    border: 1px solid rgba(255, 255, 255, 0.08);

    p {
        margin: 0;
        color: rgba(239, 246, 230, 0.75);
        font-size: 13px;
        line-height: 1.65;
    }

    span {
        display: inline-grid;
        place-items: center;
        width: 24px;
        height: 24px;
        margin-bottom: 8px;
        border-radius: 8px;
        color: rgba(239, 246, 230, 0.88);
        background: rgba(133, 160, 117, 0.25);
        font-size: 11px;
        font-weight: 800;
    }
}

.chat-line--user {
    justify-self: end;
    background: rgba(114, 143, 102, 0.32);
}

.butler-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;

    span {
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 11px;
        color: rgba(226, 239, 210, 0.72);
        background: rgba(232, 241, 211, 0.07);
    }
}

.sleep-panel {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 20px;
    align-items: center;
}

.sleep-score {
    width: 116px;
    height: 152px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    background:
        radial-gradient(circle at 50% 24%, rgba(194, 220, 178, 0.22), transparent 38%),
        rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.09);

    span {
        font-size: 42px;
        font-weight: 800;
        line-height: 1;
    }

    em {
        margin-top: -20px;
        font-size: 12px;
        font-style: normal;
        color: rgba(231, 238, 221, 0.54);
    }
}

.sleep-bars {
    display: grid;
    gap: 14px;
}

.sleep-bar {
    display: grid;
    grid-template-columns: 58px 1fr 58px;
    align-items: center;
    gap: 10px;

    span,
    em {
        color: rgba(231, 238, 221, 0.58);
        font-size: 12px;
        font-style: normal;
    }

    div {
        height: 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.09);
        overflow: hidden;
    }

    i {
        display: block;
        width: var(--bar-width);
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, rgba(130, 161, 116, 0.78), rgba(210, 213, 165, 0.9));
    }
}

.sleep-note {
    grid-column: 1 / -1;
    border-radius: 14px;
    padding: 13px 14px;
    color: rgba(232, 239, 223, 0.7);
    background: rgba(255, 255, 255, 0.055);
    border: 1px solid rgba(255, 255, 255, 0.07);
    font-size: 13px;
    line-height: 1.7;
}

.course-main {
    padding: 16px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);

    span,
    em {
        display: block;
        color: rgba(231, 238, 221, 0.54);
        font-size: 12px;
        font-style: normal;
    }

    strong {
        display: block;
        margin: 8px 0 6px;
        font-size: 18px;
        line-height: 1.35;
    }
}

.course-progress {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 18px;

    div {
        flex: 1;
        height: 9px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.09);
        overflow: hidden;
    }

    i {
        display: block;
        width: 68%;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, rgba(196, 182, 117, 0.85), rgba(142, 169, 124, 0.92));
    }

    span {
        color: rgba(231, 238, 221, 0.62);
        font-size: 12px;
    }
}

.course-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 16px;

    span {
        border-radius: 12px;
        padding: 12px;
        color: rgba(232, 239, 223, 0.68);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.07);
        font-size: 12px;
        line-height: 1.55;
    }
}

.doctor-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);

    strong,
    span {
        display: block;
    }

    strong {
        font-size: 15px;
        margin-bottom: 4px;
    }

    span {
        color: rgba(231, 238, 221, 0.52);
        font-size: 12px;
    }
}

.doctor-avatar-wrap {
    position: relative;
    flex: 0 0 auto;
}

.doctor-avatar {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(145deg, rgba(128, 156, 110, 0.78), rgba(185, 154, 105, 0.78));
    color: rgba(255, 255, 255, 0.95);
    font-size: 19px;
    font-weight: 800;
}

.online-dot {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: oklch(0.72 0.18 145);
    border: 2px solid rgba(7, 18, 12, 0.96);

    &::after {
        content: '';
        position: absolute;
        inset: -3px;
        border-radius: 50%;
        background: oklch(0.72 0.18 145 / 0.42);
        animation: onlinePulse 2s ease-out infinite;
    }
}

.consult-queue {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 14px;

    div {
        border-radius: 14px;
        padding: 13px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.07);
        transition: background 0.2s, border-color 0.2s;
        cursor: default;

        &:hover {
            background: rgba(255, 255, 255, 0.09);
            border-color: rgba(255, 255, 255, 0.13);
        }
    }

    span,
    strong {
        display: block;
    }

    span {
        margin-bottom: 4px;
        color: rgba(231, 238, 221, 0.5);
        font-size: 12px;
    }

    strong {
        font-size: 14px;
        line-height: 1.35;
    }
}

.consult-button {
    position: relative;
    overflow: hidden;
    width: 100%;
    margin-top: 16px;
    border: 0;
    border-radius: 999px;
    padding: 12px 18px;
    color: rgba(9, 20, 12, 0.96);
    background: rgba(229, 238, 211, 0.92);
    font-weight: 800;
    cursor: pointer;
    transition:
        transform 0.22s var(--ld-ease-out),
        background 0.22s var(--ld-ease-out),
        box-shadow 0.22s var(--ld-ease-out);

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: -80%;
        width: 50%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.36),
            transparent
        );
        transform: skewX(-18deg);
        animation: buttonShimmer 3.2s ease-in-out infinite 1.8s;
    }

    &:hover {
        transform: translateY(-2px);
        background: rgba(246, 250, 236, 0.98);
        box-shadow: 0 6px 22px rgba(186, 210, 152, 0.3);
    }

    &:active {
        transform: translateY(0);
        transition-duration: 0.08s;
    }
}

@media (max-width: 520px) {
    .capability-card {
        min-height: auto;
        padding: 20px;
        border-radius: 16px;
    }

    .card-topline {
        grid-template-columns: auto 1fr;
    }

    .card-status {
        grid-column: 2;
        justify-self: start;
        margin-top: -6px;
    }

    .seasonal-panel,
    .sleep-panel,
    .consult-queue,
    .course-list {
        grid-template-columns: 1fr;
    }

    .sleep-score,
    .meter-ring {
        margin: 0 auto;
    }
}
</style>
