<template>
    <div>
        <div class="grid-2" style="grid-template-columns: 1.2fr 1fr;">
            <div class="solar-hero">
                <span class="solar-tag">{{ currentTerm.tag }}</span>
                <div class="solar-name">{{ currentTerm.name }}</div>
                <div class="solar-date">{{ currentTerm.dateRange }} · {{ currentTerm.subtitle }}</div>
                <p class="solar-desc">{{ currentTerm.desc }}</p>
                <div class="term-wheel">
                    <div
                        v-for="term in solarTerms"
                        :key="term"
                        class="term-chip"
                        :class="{ now: term === currentTerm.name }"
                    >{{ term }}</div>
                </div>
            </div>

            <div class="card">
                <div class="card-title"><span class="dot"></span>{{ currentTerm.name }}养生要点</div>
                <div class="tab-bar">
                    <button
                        v-for="cat in ['饮食', '起居', '运动', '情志']"
                        :key="cat"
                        :class="{ active: activeTipTab === cat }"
                        @click="activeTipTab = cat"
                    >{{ cat }}</button>
                </div>
                <div class="tip-list">
                    <div v-for="tip in currentTips" :key="tip.title" class="tip-row">
                        <span class="icon">{{ tip.icon }}</span>
                        <div class="text"><strong>{{ tip.title }}</strong><br>{{ tip.content }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 20px;">
            <div class="row">
                <div class="card-title" style="margin: 0;"><span class="dot"></span>{{ currentTerm.name }}推荐食疗方</div>
                <button class="btn btn-ghost">查看全部 12 道 →</button>
            </div>
            <div class="recipe-grid">
                <div v-for="recipe in recipes" :key="recipe.name" class="recipe-card">
                    <div class="recipe-img">{{ recipe.emoji }}</div>
                    <div class="recipe-name">{{ recipe.name }}</div>
                    <div class="recipe-tag">{{ recipe.tag }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const currentTerm = {
    name: "立夏",
    tag: "当前节气 · 第 7 个",
    dateRange: "2026年5月5日 — 5月20日",
    subtitle: "暮春送夏，万物茂长",
    desc: "立夏在天为暑、在地为火、在人为心。养生当以养心为要，宜清淡、勿大汗、戒躁怒。子午小憩，可补心阴。",
};

const solarTerms = ["立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑"];

const activeTipTab = ref("饮食");

const allTips: Record<string, { icon: string; title: string; content: string }[]> = {
    "饮食": [
        { icon: "🥗", title: "清心降火", content: "多食苦瓜、莲子心、绿豆，助养心血、清心火。" },
        { icon: "🍵", title: "益气养阴", content: "推荐麦冬、太子参泡水代茶饮，缓解暮春疲乏。" },
        { icon: "⚠️", title: "忌生冷油腻", content: "立夏脾胃尚弱，过食冰品易致腹泻、湿困。" },
    ],
    "起居": [
        { icon: "🌅", title: "晚睡早起", content: "22:30入睡，06:00起床，中午小憩20分钟养心阳。" },
        { icon: "🏠", title: "避免贪凉", content: "空调温度不低于26°C，避免直吹，夜间盖薄被。" },
        { icon: "🛁", title: "温水泡脚", content: "睡前温水泡脚15分钟，引火归元、助眠安神。" },
    ],
    "运动": [
        { icon: "🧘", title: "适度运动", content: "推荐八段锦、太极、傍晚散步，避免大汗淋漓伤阴。" },
        { icon: "🌳", title: "户外活动", content: "清晨或傍晚户外活动30分钟，接地气、舒畅肝气。" },
        { icon: "💪", title: "勿过劳", content: "运动以微出汗为度，汗为心之液，过汗伤心阴。" },
    ],
    "情志": [
        { icon: "😊", title: "保持平和", content: "立夏心阳偏旺，忌大喜大怒，宜养花、听琴、冥想。" },
        { icon: "🎵", title: "五音疗心", content: "多听徵调音乐（如《紫竹调》），入心经、安神定志。" },
        { icon: "🧘", title: "午间静坐", content: "午时（11-13点）静坐闭目养神10分钟，心肾相交。" },
    ],
};

const currentTips = computed(() => allTips[activeTipTab.value]);

const recipes = [
    { name: "莲子百合粥", emoji: "🍵", tag: "养心安神 · 微寒" },
    { name: "凉拌苦瓜", emoji: "🥒", tag: "清心降火 · 凉性" },
    { name: "桑葚冰糖饮", emoji: "🫐", tag: "滋阴补血 · 平性" },
    { name: "麦冬太子参汤", emoji: "🍲", tag: "益气生津 · 微凉" },
    { name: "椰子炖乌鸡", emoji: "🥥", tag: "滋补养颜 · 温性" },
    { name: "薄荷柠檬茶", emoji: "🌿", tag: "疏风清热 · 凉性" },
];
</script>

<style scoped lang="scss">
.solar-hero {
    background: linear-gradient(135deg, #DDEBE3 0%, #EDF4EF 100%);
    border-radius: 16px;
    padding: 32px;
    position: relative;
    overflow: hidden;
}
.solar-hero::after {
    content: '🌿'; position: absolute; right: -10px; bottom: -10px;
    font-size: 160px; opacity: 0.15;
}
.solar-tag {
    display: inline-block;
    background: var(--jade); color: white;
    padding: 4px 12px; border-radius: 12px; font-size: 12px;
    margin-bottom: 12px;
}
.solar-name {
    font-family: "STKaiti", serif;
    font-size: 48px; color: var(--ink); font-weight: 600;
}
.solar-date { color: var(--ink-muted); margin-top: 4px; font-size: 14px; }
.solar-desc {
    margin-top: 16px; max-width: 380px;
    color: var(--ink); line-height: 1.7; font-size: 14px;
}

.term-wheel {
    display: flex; gap: 8px; overflow-x: auto; padding: 4px 0;
    margin-top: 20px; padding-bottom: 8px;
}
.term-wheel::-webkit-scrollbar { height: 4px; }
.term-wheel::-webkit-scrollbar-thumb { background: var(--line); border-radius: 2px; }
.term-chip {
    flex-shrink: 0;
    padding: 8px 14px;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 20px;
    font-size: 13px;
    color: var(--ink-muted);
    cursor: pointer;
    transition: all .2s;
}
.term-chip:hover { border-color: var(--jade); color: var(--jade); }
.term-chip.now { background: var(--jade); color: white; border-color: var(--jade); }

.tab-bar {
    display: flex; gap: 4px; margin-bottom: 16px;
    background: var(--cream); padding: 4px; border-radius: 10px;
}
.tab-bar button {
    flex: 1; background: transparent; border: none;
    padding: 8px 12px; font-family: inherit; font-size: 13px;
    color: var(--ink-muted); cursor: pointer; border-radius: 8px;
    transition: all .2s;
}
.tab-bar button.active { background: var(--paper); color: var(--jade); box-shadow: var(--shadow); }

.tip-list { display: flex; flex-direction: column; gap: 12px; }
.tip-row {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px; background: var(--paper-warm);
    border-radius: 10px; border-left: 3px solid var(--jade);
}
.tip-row .icon { font-size: 20px; }
.tip-row .text { font-size: 14px; color: var(--ink); line-height: 1.6; }
.tip-row .text strong { color: var(--jade); }

.recipe-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.recipe-card {
    background: var(--paper-warm);
    border-radius: 12px;
    padding: 16px;
    border: 1px solid var(--line);
    cursor: pointer;
    transition: all .2s;
}
.recipe-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
.recipe-img {
    height: 80px;
    background: linear-gradient(135deg, var(--gold-soft), var(--jade-soft));
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 36px; margin-bottom: 10px;
}
.recipe-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.recipe-tag { font-size: 11px; color: var(--ink-muted); }

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
.row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.btn {
    background: var(--jade); color: white; border: none;
    padding: 10px 20px; border-radius: 22px; font-family: inherit;
    font-size: 13px; cursor: pointer; transition: all .2s;
}
.btn:hover { background: var(--ink); transform: translateY(-1px); }
.btn-ghost { background: transparent; color: var(--jade); border: 1px solid var(--jade); }
.btn-ghost:hover { background: var(--jade-soft); }

@media (max-width: 900px) {
    .grid-2, .recipe-grid { grid-template-columns: 1fr; }
}
</style>
