<template>
    <div>
        <div class="grid-2" style="grid-template-columns: 1fr 1.2fr;">
            <div class="constitution-card">
                <div style="font-size: 12px; color: var(--gold); letter-spacing: 2px;">YOUR BODY TYPE</div>
                <div class="constitution-name">阴虚兼气郁</div>
                <div class="constitution-sub">主体质 阴虚 (68 分) · 兼体质 气郁 (52 分)</div>

                <svg class="radar" viewBox="0 0 200 200">
                    <polygon points="100,20 175,60 175,140 100,180 25,140 25,60" fill="none" stroke="#C9A55C" stroke-opacity="0.3"/>
                    <polygon points="100,40 154,72 154,128 100,160 46,128 46,72" fill="none" stroke="#C9A55C" stroke-opacity="0.3"/>
                    <polygon points="100,60 133,80 133,120 100,140 67,120 67,80" fill="none" stroke="#C9A55C" stroke-opacity="0.3"/>
                    <polygon points="100,30 165,60 150,135 90,170 35,130 50,55" fill="#C9A55C" fill-opacity="0.3" stroke="#C9A55C" stroke-width="2"/>
                    <text x="100" y="15" text-anchor="middle" font-size="11" fill="#6B7C7A">阴虚</text>
                    <text x="185" y="62" text-anchor="middle" font-size="11" fill="#6B7C7A">气郁</text>
                    <text x="185" y="145" text-anchor="middle" font-size="11" fill="#6B7C7A">血瘀</text>
                    <text x="100" y="195" text-anchor="middle" font-size="11" fill="#6B7C7A">平和</text>
                    <text x="15" y="145" text-anchor="middle" font-size="11" fill="#6B7C7A">湿热</text>
                    <text x="15" y="62" text-anchor="middle" font-size="11" fill="#6B7C7A">气虚</text>
                </svg>
                <button class="btn" style="margin-top: 8px;">重新测试体质</button>
            </div>

            <div class="card">
                <div class="row">
                    <div class="card-title" style="margin: 0;"><span class="dot"></span>经络穴位</div>
                    <div style="font-size: 12px; color: var(--ink-muted);">点击穴位查看主治</div>
                </div>
                <div class="meridian-body">
                    <span class="body-figure">🧍</span>
                    <div class="acupoint" style="top: 28%; left: 48%;"></div>
                    <div class="acupoint" style="top: 42%; left: 35%;"></div>
                    <div class="acupoint" style="top: 42%; left: 60%;"></div>
                    <div class="acupoint" style="top: 55%; left: 50%;"></div>
                    <div class="acupoint" style="top: 70%; left: 42%;"></div>
                    <div class="acupoint" style="top: 70%; left: 58%;"></div>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 12px; font-size: 13px;">
                    <span class="acu-tag">膻中 · 宁心安神</span>
                    <span class="acu-tag">内关 · 和胃宽胸</span>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 20px;">
            <div class="row">
                <div class="card-title" style="margin: 0;"><span class="dot"></span>为你推荐的中医课程</div>
                <button class="btn btn-ghost">查看全部 →</button>
            </div>
            <div class="grid-4">
                <div v-for="course in courses" :key="course.name" class="course-card">
                    <div class="course-img">{{ course.emoji }}</div>
                    <div class="course-body">
                        <div class="course-name">{{ course.name }}</div>
                        <div class="course-meta">{{ course.meta }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const courses = [
    { name: "八段锦入门", emoji: "🧘", meta: "12 节 · 王老师 · 已学 3 节" },
    { name: "阴阳五行精讲", emoji: "📖", meta: "8 节 · 李教授 · 未开始" },
    { name: "太极二十四式", emoji: "☯️", meta: "24 节 · 张师傅 · 未开始" },
    { name: "面诊舌诊基础", emoji: "👐", meta: "6 节 · 陈医师 · 已学 1 节" },
];
</script>

<style scoped lang="scss">
.constitution-card {
    background: linear-gradient(135deg, #FAF6EE 0%, #F5EBD3 100%);
    border-radius: 16px;
    padding: 28px;
    position: relative;
    overflow: hidden;
}
.constitution-card::after {
    content: '医'; position: absolute; right: -10px; bottom: -30px;
    font-family: "STKaiti", serif; font-size: 160px;
    color: var(--gold); opacity: 0.1; font-weight: 900;
}
.constitution-name {
    font-family: "STKaiti", serif;
    font-size: 32px; color: var(--ink); font-weight: 600;
}
.constitution-sub { color: var(--ink-muted); margin-top: 6px; font-size: 14px; }

.radar { width: 220px; height: 220px; margin: 20px auto 0; }

.meridian-body {
    height: 280px;
    background: linear-gradient(180deg, var(--jade-soft), var(--paper-warm));
    border-radius: 14px;
    position: relative;
    display: flex; align-items: center; justify-content: center;
}
.body-figure { font-size: 120px; opacity: 0.4; }
.acupoint {
    position: absolute;
    width: 14px; height: 14px;
    background: var(--cinnabar);
    border: 2px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 0 0 rgba(179, 60, 44, 0.5);
    animation: pulse 2s infinite;
}
@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(179, 60, 44, 0.5); }
    100% { box-shadow: 0 0 0 10px rgba(179, 60, 44, 0); }
}
.acu-tag {
    display: inline-block;
    background: var(--cinnabar); color: white;
    padding: 4px 12px; border-radius: 12px; font-size: 12px;
}

.course-card {
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all .2s;
}
.course-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
.course-img {
    height: 100px;
    background: linear-gradient(135deg, var(--gold-soft), var(--jade-soft));
    display: flex; align-items: center; justify-content: center;
    font-size: 36px;
}
.course-body { padding: 12px; }
.course-name { font-size: 14px; font-weight: 600; }
.course-meta { font-size: 11px; color: var(--ink-muted); margin-top: 4px; }

.card {
    background: var(--paper); border-radius: 14px; padding: 24px;
    box-shadow: var(--shadow); border: 1px solid rgba(232, 223, 208, 0.4);
}
.card-title {
    font-family: "STKaiti", serif; font-size: 18px; font-weight: 600;
    color: var(--ink); margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
}
.card-title .dot { width: 4px; height: 16px; background: var(--jade); border-radius: 2px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.btn {
    background: var(--jade); color: white; border: none;
    padding: 10px 20px; border-radius: 22px; font-family: inherit;
    font-size: 13px; cursor: pointer; transition: all .2s;
}
.btn:hover { background: var(--ink); transform: translateY(-1px); }
.btn-ghost { background: transparent; color: var(--jade); border: 1px solid var(--jade); }
.btn-ghost:hover { background: var(--jade-soft); }

@media (max-width: 900px) { .grid-2, .grid-4 { grid-template-columns: 1fr; } }
</style>
