<template>
    <div>
        <div class="grid-2" style="grid-template-columns: 1.2fr 1fr">
            <div
                class="solar-hero"
                :style="heroStyle"
                :data-decor="currentTerm.decor"
            >
                <span class="solar-tag">{{ currentTerm.tag }}</span>
                <div class="solar-name">{{ currentTerm.name }}</div>
                <div class="solar-date">
                    {{ currentTerm.dateRange }} · {{ currentTerm.subtitle }}
                </div>
                <p class="solar-desc">{{ currentTerm.desc }}</p>
                <div v-if="isLoading || apiError" class="api-state">
                    {{ isLoading ? "正在同步后端节气数据..." : apiError }}
                </div>
                <div class="term-selector">
                    <button
                        class="term-nav"
                        type="button"
                        aria-label="向左浏览节气"
                        @click="scrollTerms(-1)"
                    >
                        ‹
                    </button>
                    <div ref="termWheelRef" class="term-wheel">
                        <button
                            v-for="term in solarTerms"
                            :key="term"
                            class="term-chip"
                            :class="{ now: term === currentTerm.name }"
                            type="button"
                            :data-term="term"
                            @click="selectTerm(term)"
                        >
                            {{ term }}
                        </button>
                    </div>
                    <button
                        class="term-nav"
                        type="button"
                        aria-label="向右浏览节气"
                        @click="scrollTerms(1)"
                    >
                        ›
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-title">
                    <span class="dot"></span>{{ currentTerm.name }}养生要点
                </div>
                <div class="tab-bar">
                    <button
                        v-for="cat in ['饮食', '起居', '运动', '情志']"
                        :key="cat"
                        :class="{ active: activeTipTab === cat }"
                        @click="activeTipTab = cat"
                    >
                        {{ cat }}
                    </button>
                </div>
                <div class="tip-list">
                    <div
                        v-for="tip in currentTips"
                        :key="tip.title"
                        class="tip-row"
                    >
                        <span class="icon">{{ tip.icon }}</span>
                        <div class="text">
                            <strong>{{ tip.title }}</strong
                            ><br />{{ tip.content }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 20px">
            <div class="row">
                <div class="card-title" style="margin: 0">
                    <span class="dot"></span>{{ currentTerm.name }}推荐食疗方
                </div>
                <button
                    class="btn btn-ghost"
                    type="button"
                    aria-haspopup="dialog"
                    :aria-expanded="showRecipeModal"
                    @click="showRecipeModal = true"
                >
                    查看全部 {{ allRecipes.length }} 道 →
                </button>
            </div>
            <div class="recipe-grid">
                <div
                    v-for="recipe in recipes"
                    :key="recipe.name"
                    class="recipe-card"
                    @click="selectedRecipe = recipe"
                >
                    <div class="recipe-img">{{ recipe.emoji }}</div>
                    <div class="recipe-name">{{ recipe.name }}</div>
                    <div class="recipe-tag">{{ recipe.tag }}</div>
                </div>
            </div>
        </div>

        <Teleport to="body">
            <div
                v-if="showRecipeModal"
                class="recipe-modal-backdrop"
                @click.self="showRecipeModal = false"
            >
                <section
                    ref="modalRef"
                    class="recipe-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="recipe-modal-title"
                    tabindex="-1"
                    @keydown.esc="showRecipeModal = false"
                >
                    <div class="recipe-modal-head">
                        <div>
                            <p class="recipe-modal-kicker">
                                {{ currentTerm.name }}养心食单
                            </p>
                            <h2 id="recipe-modal-title">
                                {{ currentTerm.name }}推荐食疗方
                            </h2>
                            <p>
                                后端已同步
                                {{ allRecipes.length }}
                                道食疗方，可按节气轮换食用。
                            </p>
                        </div>
                        <button
                            class="modal-close"
                            type="button"
                            aria-label="关闭食谱弹窗"
                            @click="showRecipeModal = false"
                        >
                            ×
                        </button>
                    </div>

                    <div class="recipe-modal-grid">
                        <article
                            v-for="recipe in allRecipes"
                            :key="recipe.name"
                            class="recipe-modal-card"
                            @click="selectedRecipe = recipe"
                        >
                            <div class="recipe-modal-emoji">
                                {{ recipe.emoji }}
                            </div>
                            <div class="recipe-modal-content">
                                <div class="recipe-modal-title">
                                    {{ recipe.name }}
                                </div>
                                <div class="recipe-modal-tag">
                                    {{ recipe.tag }}
                                </div>
                                <p>{{ recipe.effect }}</p>
                                <p class="recipe-usage">
                                    {{ recipe.usageNote }}
                                </p>
                            </div>
                        </article>
                    </div>
                </section>
            </div>
        </Teleport>

        <Teleport to="body">
            <Transition name="recipe-detail">
                <div
                    v-if="selectedRecipe"
                    class="recipe-detail-backdrop"
                    @click.self="selectedRecipe = null"
                >
                    <section
                        class="recipe-detail"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="recipe-detail-title"
                    >
                        <button
                            class="modal-close detail-close"
                            type="button"
                            aria-label="关闭食谱详情"
                            @click="selectedRecipe = null"
                        >
                            ×
                        </button>
                        <div class="recipe-detail-emoji">
                            {{ selectedRecipe.emoji }}
                        </div>
                        <div class="recipe-modal-kicker">
                            {{ currentTerm.name }}节气食疗
                        </div>
                        <h2 id="recipe-detail-title">
                            {{ selectedRecipe.name }}
                        </h2>
                        <div class="recipe-detail-tag">
                            {{ selectedRecipe.tag }}
                        </div>
                        <p>{{ selectedRecipe.effect }}</p>
                        <p class="recipe-detail-note">
                            {{ selectedRecipe.usageNote }}
                        </p>
                        <button
                            class="btn"
                            type="button"
                            @click="selectedRecipe = null"
                        >
                            加入今日食单
                        </button>
                    </section>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from "vue";
import {
    ApiSeasonalHealth,
    type SeasonalHealthDTO,
    type SeasonalRecipeDTO,
} from "@/network";

type Recipe = {
    id: number;
    name: string;
    emoji: string;
    tag: string;
    effect: string;
    usageNote: string;
    propertyLevel: number;
};

type HealthTip = {
    icon: string;
    title: string;
    content: string;
};

type SolarTermInfo = {
    name: string;
    tag: string;
    dateRange: string;
    subtitle: string;
    desc: string;
    decor: string;
    heroStart: string;
    heroEnd: string;
    accent: string;
    accentSoft: string;
};

const solarTerms = [
    "立春",
    "雨水",
    "惊蛰",
    "春分",
    "清明",
    "谷雨",
    "立夏",
    "小满",
    "芒种",
    "夏至",
    "小暑",
    "大暑",
    "立秋",
    "处暑",
    "白露",
    "秋分",
    "寒露",
    "霜降",
    "立冬",
    "小雪",
    "大雪",
    "冬至",
    "小寒",
    "大寒",
];

const termThemeGroups = [
    [
        {
            decor: "🌱",
            heroStart: "#e5f0df",
            heroEnd: "#f7f3dc",
            accent: "#6f8f66",
            accentSoft: "#edf5e8",
        },
        {
            decor: "💧",
            heroStart: "#e2eef0",
            heroEnd: "#f5f3e4",
            accent: "#5f8790",
            accentSoft: "#e7f1f3",
        },
        {
            decor: "🌩️",
            heroStart: "#e7eee2",
            heroEnd: "#f4edd8",
            accent: "#7b8b55",
            accentSoft: "#eef2e4",
        },
        {
            decor: "🌸",
            heroStart: "#f1e8e8",
            heroEnd: "#f5f2df",
            accent: "#b56f7b",
            accentSoft: "#f7eaed",
        },
        {
            decor: "🍃",
            heroStart: "#e6f0e5",
            heroEnd: "#f7f2e5",
            accent: "#658a68",
            accentSoft: "#edf4ed",
        },
        {
            decor: "🌧️",
            heroStart: "#e1eddf",
            heroEnd: "#f0f0dc",
            accent: "#6c8d5a",
            accentSoft: "#ebf3e7",
        },
    ],
    [
        {
            decor: "🌿",
            heroStart: "#ddebe3",
            heroEnd: "#edf4ef",
            accent: "#5c8374",
            accentSoft: "#e8f0ec",
        },
        {
            decor: "🌾",
            heroStart: "#e5efdc",
            heroEnd: "#f4f2dc",
            accent: "#6f8b5f",
            accentSoft: "#edf3df",
        },
        {
            decor: "🌾",
            heroStart: "#e2eddf",
            heroEnd: "#f5efd7",
            accent: "#6a8267",
            accentSoft: "#eef2df",
        },
        {
            decor: "☀️",
            heroStart: "#e2eef0",
            heroEnd: "#f7f1df",
            accent: "#5d8490",
            accentSoft: "#e6f1f3",
        },
        {
            decor: "☀️",
            heroStart: "#eef0dc",
            heroEnd: "#fff2dc",
            accent: "#8c7d4c",
            accentSoft: "#f5efd3",
        },
        {
            decor: "🔥",
            heroStart: "#f0ead8",
            heroEnd: "#fff1df",
            accent: "#9a7650",
            accentSoft: "#f5e6d8",
        },
    ],
    [
        {
            decor: "🍂",
            heroStart: "#f2eadc",
            heroEnd: "#f7efe3",
            accent: "#a77b4f",
            accentSoft: "#f4eadc",
        },
        {
            decor: "🌤️",
            heroStart: "#efe8d8",
            heroEnd: "#f8f1e7",
            accent: "#9d7b53",
            accentSoft: "#f5ecdf",
        },
        {
            decor: "💧",
            heroStart: "#e5edf0",
            heroEnd: "#f6efe4",
            accent: "#6f8791",
            accentSoft: "#edf3f5",
        },
        {
            decor: "🍁",
            heroStart: "#f0e5da",
            heroEnd: "#f7eddc",
            accent: "#a66f52",
            accentSoft: "#f5e8dd",
        },
        {
            decor: "🌫️",
            heroStart: "#e8ece5",
            heroEnd: "#f1eadf",
            accent: "#74866f",
            accentSoft: "#eef2eb",
        },
        {
            decor: "❄️",
            heroStart: "#ece9e3",
            heroEnd: "#f6eee4",
            accent: "#876f64",
            accentSoft: "#f1ebe6",
        },
    ],
    [
        {
            decor: "🌰",
            heroStart: "#e8edf0",
            heroEnd: "#f3efe9",
            accent: "#647b8a",
            accentSoft: "#edf2f4",
        },
        {
            decor: "❄️",
            heroStart: "#e5edf2",
            heroEnd: "#f2f1ec",
            accent: "#5f7f9a",
            accentSoft: "#eaf1f6",
        },
        {
            decor: "☃️",
            heroStart: "#e3ebf1",
            heroEnd: "#f5f3ef",
            accent: "#617b93",
            accentSoft: "#eaf0f5",
        },
        {
            decor: "🌙",
            heroStart: "#e7ebf3",
            heroEnd: "#f6f2e9",
            accent: "#68799b",
            accentSoft: "#ecf0f7",
        },
        {
            decor: "🧊",
            heroStart: "#e6eef3",
            heroEnd: "#f4f6f2",
            accent: "#5f8595",
            accentSoft: "#eaf3f6",
        },
        {
            decor: "❄️",
            heroStart: "#e8eef4",
            heroEnd: "#f3f4ee",
            accent: "#667d99",
            accentSoft: "#edf2f7",
        },
    ],
];

const termInfo = solarTerms.reduce(
    (acc, term, index) => {
        const seasonIndex = Math.floor(index / 6);
        const termTheme =
            termThemeGroups[seasonIndex]?.[index % 6] ??
            termThemeGroups[1]![0]!;
        acc[term] = {
            name: term,
            tag:
                index === 6
                    ? "当前节气 · 第 7 个"
                    : `二十四节气 · 第 ${index + 1} 个`,
            dateRange:
                index === 6 ? "2026年5月5日 — 5月20日" : "节气周期 · 约 15 天",
            subtitle:
                index < 6
                    ? "春生舒展，调肝养阳"
                    : index < 9
                      ? "暑气渐长，养心护脾"
                      : "盛夏清养，防暑生津",
            desc:
                index < 6
                    ? `${term}时节宜顺应春生之气，轻食少怒，舒展筋骨，帮助阳气缓缓升发。`
                    : index < 9
                      ? `${term}前后暑湿渐起，宜清淡养心、顾护脾胃，饮食重在生津而不过寒。`
                      : index < 12
                        ? `${term}进入盛夏，防暑热耗气伤津，适合早晚活动，午间小憩，饮食少辛燥。`
                        : index < 18
                          ? `${term}时节燥气渐起，宜润肺护肤、早睡早起，少食辛辣煎烤。`
                          : `${term}时节寒气渐盛，宜温养肾阳、护住肩颈腰腹，运动以微微发热为度。`,
            ...termTheme,
        };
        return acc;
    },
    {} as Record<string, SolarTermInfo>,
);

termInfo["立夏"] = {
    name: "立夏",
    tag: "二十四节气 · 第 7 个",
    dateRange: "2026年5月5日 — 5月20日",
    subtitle: "暮春送夏，万物茂长",
    desc: "立夏在天为暑、在地为火、在人为心。养生当以养心为要，宜清淡、勿大汗、戒躁怒。子午小憩，可补心阴。",
    decor: "🌿",
    heroStart: "#ddebe3",
    heroEnd: "#edf4ef",
    accent: "#5c8374",
    accentSoft: "#e8f0ec",
};

const selectedTermName = ref("小满");
const seasonalHealth = ref<SeasonalHealthDTO | null>(null);
const isCurrentTermData = ref(false);
const isLoading = ref(false);
const apiError = ref("");
let requestSerial = 0;

const currentTerm = computed<SolarTermInfo>(() => {
    const fallback = termInfo[selectedTermName.value] ?? termInfo["立夏"]!;
    const solarTerm = seasonalHealth.value?.solarTerm;
    if (!solarTerm) return fallback;

    const theme = termInfo[solarTerm.termName] ?? fallback;
    return {
        ...theme,
        name: solarTerm.termName,
        tag: isCurrentTermData.value
            ? `当前节气 · 第 ${solarTerm.termNo} 个`
            : `二十四节气 · 第 ${solarTerm.termNo} 个`,
        dateRange: `${formatDate(solarTerm.startTime)} — ${formatDate(solarTerm.endTime)}`,
        subtitle: solarTerm.shortDesc,
        desc: solarTerm.longDesc,
    };
});
const heroStyle = computed<Record<string, string>>(() => ({
    "--term-hero-start": currentTerm.value.heroStart,
    "--term-hero-end": currentTerm.value.heroEnd,
    "--term-accent": currentTerm.value.accent,
    "--term-accent-soft": currentTerm.value.accentSoft,
}));
const activeTipTab = ref("饮食");
const termWheelRef = ref<HTMLElement | null>(null);

const fallbackTips: Record<string, HealthTip[]> = {
    饮食: [
        {
            icon: "🥗",
            title: "清心降火",
            content: "多食苦瓜、莲子心、绿豆，助养心血、清心火。",
        },
        {
            icon: "🍵",
            title: "益气养阴",
            content: "推荐麦冬、太子参泡水代茶饮，缓解暮春疲乏。",
        },
        {
            icon: "⚠️",
            title: "忌生冷油腻",
            content: "立夏脾胃尚弱，过食冰品易致腹泻、湿困。",
        },
    ],
    起居: [
        {
            icon: "🌅",
            title: "晚睡早起",
            content: "22:30入睡，06:00起床，中午小憩20分钟养心阳。",
        },
        {
            icon: "🏠",
            title: "避免贪凉",
            content: "空调温度不低于26°C，避免直吹，夜间盖薄被。",
        },
        {
            icon: "🛁",
            title: "温水泡脚",
            content: "睡前温水泡脚15分钟，引火归元、助眠安神。",
        },
    ],
    运动: [
        {
            icon: "🧘",
            title: "适度运动",
            content: "推荐八段锦、太极、傍晚散步，避免大汗淋漓伤阴。",
        },
        {
            icon: "🌳",
            title: "户外活动",
            content: "清晨或傍晚户外活动30分钟，接地气、舒畅肝气。",
        },
        {
            icon: "💪",
            title: "勿过劳",
            content: "运动以微出汗为度，汗为心之液，过汗伤心阴。",
        },
    ],
    情志: [
        {
            icon: "😊",
            title: "保持平和",
            content: "立夏心阳偏旺，忌大喜大怒，宜养花、听琴、冥想。",
        },
        {
            icon: "🎵",
            title: "五音疗心",
            content: "多听徵调音乐（如《紫竹调》），入心经、安神定志。",
        },
        {
            icon: "🧘",
            title: "午间静坐",
            content: "午时（11-13点）静坐闭目养神10分钟，心肾相交。",
        },
    ],
};

const contentTypeName: Record<number, string> = {
    1: "饮食",
    2: "起居",
    3: "运动",
    4: "情志",
};

const backendTips = computed<Record<string, HealthTip[]>>(() => {
    const tips: Record<string, HealthTip[]> = {
        饮食: [],
        起居: [],
        运动: [],
        情志: [],
    };

    seasonalHealth.value?.healthContents
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .forEach((content) => {
            const groupName = contentTypeName[content.contentType];
            if (!groupName) return;
            tips[groupName]?.push({
                icon: content.contentIcon,
                title: content.contentTitle,
                content: content.contentText,
            });
        });

    return tips;
});

const currentTips = computed(() => {
    const fromBackend = backendTips.value[activeTipTab.value];
    return fromBackend && fromBackend.length > 0
        ? fromBackend
        : fallbackTips[activeTipTab.value] || [];
});

const showRecipeModal = ref(false);
const selectedRecipe = ref<Recipe | null>(null);
const modalRef = ref<HTMLElement | null>(null);

const fallbackRecipes: Recipe[] = [
    {
        id: 1,
        name: "莲子百合粥",
        emoji: "🍵",
        tag: "养心安神 · 微寒",
        effect: "莲子养心，百合润肺，适合心烦少眠、入夏易燥的人群。",
        usageNote: "晚餐或睡前少量温服更佳。",
        propertyLevel: 5,
    },
    {
        id: 2,
        name: "凉拌苦瓜",
        emoji: "🥒",
        tag: "清心降火 · 凉性",
        effect: "苦瓜清暑热，佐以少量蒜醋开胃，适合口苦咽干时少量食用。",
        usageNote: "脾胃虚寒者少食。",
        propertyLevel: 3,
    },
    {
        id: 3,
        name: "桑葚冰糖饮",
        emoji: "🫐",
        tag: "滋阴补血 · 平性",
        effect: "桑葚滋阴养血，温饮更护脾胃，适合熬夜后眼干、口干。",
        usageNote: "午后温饮即可，血糖偏高者减糖。",
        propertyLevel: 5,
    },
    {
        id: 4,
        name: "麦冬太子参汤",
        emoji: "🍲",
        tag: "益气生津 · 微凉",
        effect: "麦冬养阴，太子参补气，适合暮春入夏疲乏、汗后口渴。",
        usageNote: "汗后口渴、疲乏时少量温服。",
        propertyLevel: 4,
    },
    {
        id: 5,
        name: "椰子炖乌鸡",
        emoji: "🥥",
        tag: "滋补养颜 · 温性",
        effect: "椰香清润，乌鸡温补，适合气血不足但不宜大补的人群。",
        usageNote: "一周 1 到 2 次，外感发热时暂停。",
        propertyLevel: 7,
    },
    {
        id: 6,
        name: "薄荷柠檬茶",
        emoji: "🌿",
        tag: "疏风清热 · 凉性",
        effect: "薄荷清利头目，柠檬生津，适合午后困倦、胸闷不舒。",
        usageNote: "午后温饮，胃寒者减少薄荷用量。",
        propertyLevel: 3,
    },
    {
        id: 7,
        name: "绿豆薏米粥",
        emoji: "🍚",
        tag: "清热利湿 · 凉性",
        effect: "绿豆清热，薏米利湿，适合暑热初起、身体困重时食用。",
        usageNote: "湿重困倦时可食，孕期慎用薏米。",
        propertyLevel: 3,
    },
    {
        id: 8,
        name: "荷叶冬瓜汤",
        emoji: "🥣",
        tag: "清暑化湿 · 凉性",
        effect: "荷叶升清，冬瓜利水，适合立夏后闷热、水肿与食欲不佳。",
        usageNote: "午餐或晚餐配汤，体寒者少量。",
        propertyLevel: 3,
    },
    {
        id: 9,
        name: "酸梅乌梅饮",
        emoji: "🫖",
        tag: "生津敛汗 · 平性",
        effect: "乌梅敛汗生津，酸甘化阴，适合出汗后口渴、胃口欠佳。",
        usageNote: "出汗后温饮，胃酸多者少量。",
        propertyLevel: 5,
    },
    {
        id: 10,
        name: "茯苓山药羹",
        emoji: "🍠",
        tag: "健脾宁心 · 平性",
        effect: "茯苓健脾渗湿，山药补脾养胃，适合脾胃虚弱、湿困乏力。",
        usageNote: "早餐或晚餐均可，宜温热食用。",
        propertyLevel: 6,
    },
    {
        id: 11,
        name: "百合银耳羹",
        emoji: "🍐",
        tag: "润燥安神 · 微寒",
        effect: "百合清心安神，银耳滋阴润燥，适合夜间心烦、皮肤干燥。",
        usageNote: "睡前 2 小时少量温服，少糖更佳。",
        propertyLevel: 4,
    },
    {
        id: 12,
        name: "西洋参麦冬茶",
        emoji: "🍃",
        tag: "益气养阴 · 微凉",
        effect: "西洋参补气不燥，麦冬养阴生津，适合气短乏力、口干少津。",
        usageNote: "白天代茶少量饮用，失眠者晚间慎用。",
        propertyLevel: 4,
    },
];

const allRecipes = computed(() => {
    const backendRecipes = seasonalHealth.value?.dietTherapyRecipes ?? [];
    return backendRecipes.length > 0
        ? backendRecipes.map(mapRecipeFromBackend)
        : fallbackRecipes;
});

const recipes = computed(() => allRecipes.value.slice(0, 6));

async function selectTerm(term: string) {
    selectedTermName.value = term;
    activeTipTab.value = "饮食";
    await nextTick();
    const selectedChip = Array.from(
        termWheelRef.value?.querySelectorAll<HTMLElement>(".term-chip") ?? [],
    ).find((chip) => chip.dataset.term === term);
    selectedChip?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
    });
    await loadSeasonalHealthByName(term);
}

function scrollTerms(direction: number) {
    termWheelRef.value?.scrollBy({
        left: direction * 260,
        behavior: "smooth",
    });
}

function mapRecipeFromBackend(recipe: SeasonalRecipeDTO): Recipe {
    return {
        id: recipe.id,
        name: recipe.foodName,
        emoji: getRecipeEmoji(recipe.foodName),
        tag: `属性等级 ${recipe.propertyLevel}`,
        effect: recipe.effectText,
        usageNote: recipe.usageNote,
        propertyLevel: recipe.propertyLevel,
    };
}

function getRecipeEmoji(foodName: string) {
    if (foodName.includes("莲子") || foodName.includes("茶")) return "🍵";
    if (foodName.includes("山药")) return "🍠";
    if (foodName.includes("银耳")) return "🍐";
    if (foodName.includes("薏米") || foodName.includes("小米")) return "🍚";
    if (foodName.includes("南瓜")) return "🎃";
    if (foodName.includes("姜") || foodName.includes("枣")) return "🫖";
    if (foodName.includes("苦瓜")) return "🥒";
    if (foodName.includes("汤") || foodName.includes("羹")) return "🥣";
    return "🍲";
}

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value.split("T")[0] || value;
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

async function loadCurrentSeasonalHealth() {
    await loadSeasonalHealth(
        () => ApiSeasonalHealth.getCurrent(),
        "小满",
        true,
    );
}

async function loadSeasonalHealthByName(termName: string) {
    await loadSeasonalHealth(
        () => ApiSeasonalHealth.getByName(termName),
        termName,
        false,
    );
}

async function loadSeasonalHealth(
    loader: () => Promise<SeasonalHealthDTO>,
    fallbackTermName: string,
    isCurrent: boolean,
) {
    const currentRequest = ++requestSerial;
    isLoading.value = true;
    apiError.value = "";
    selectedTermName.value = fallbackTermName;
    seasonalHealth.value = null;
    isCurrentTermData.value = isCurrent;

    try {
        const data = await loader();
        if (currentRequest !== requestSerial) return;
        selectedTermName.value = data.solarTerm.termName;
        seasonalHealth.value = data;
        isCurrentTermData.value = isCurrent;
    } catch (error) {
        console.error("节气养生接口请求失败", error);
        if (currentRequest !== requestSerial) return;
        seasonalHealth.value = null;
        isCurrentTermData.value = false;
        selectedTermName.value = fallbackTermName;
        apiError.value = "后端接口暂不可用，已显示本地兜底内容";
    } finally {
        if (currentRequest === requestSerial) {
            isLoading.value = false;
        }
    }
}

onMounted(() => {
    void loadCurrentSeasonalHealth();
});

watch(showRecipeModal, async (visible) => {
    if (typeof document !== "undefined") {
        document.body.style.overflow = visible ? "hidden" : "";
    }

    if (visible) {
        await nextTick();
        modalRef.value?.focus();
    }
});

onBeforeUnmount(() => {
    if (typeof document !== "undefined") {
        document.body.style.overflow = "";
    }
});
</script>

<style scoped lang="scss">
.solar-hero {
    background: linear-gradient(
        135deg,
        var(--term-hero-start) 0%,
        var(--term-hero-end) 100%
    );
    border-radius: 16px;
    padding: 32px;
    position: relative;
    overflow: hidden;
    transition: background 0.28s ease;
}
.solar-hero::after {
    content: attr(data-decor);
    position: absolute;
    right: -10px;
    bottom: -10px;
    font-size: 160px;
    opacity: 0.15;
    pointer-events: none;
    z-index: 0;
}
.solar-hero > * {
    position: relative;
    z-index: 1;
}
.solar-tag {
    display: inline-block;
    background: var(--term-accent);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    margin-bottom: 12px;
}
.solar-name {
    font-family: "STKaiti", serif;
    font-size: 48px;
    color: var(--ink);
    font-weight: 600;
}
.solar-date {
    color: var(--ink-muted);
    margin-top: 4px;
    font-size: 14px;
}
.solar-desc {
    margin-top: 16px;
    max-width: 380px;
    color: var(--ink);
    line-height: 1.7;
    font-size: 14px;
}
.api-state {
    display: inline-flex;
    align-items: center;
    margin-top: 12px;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.72);
    color: var(--term-accent);
    font-size: 12px;
    box-shadow: var(--shadow);
}

.term-selector {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) 34px;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
}
.term-nav {
    width: 34px;
    height: 34px;
    border: 1px solid rgba(92, 131, 116, 0.24);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.72);
    color: var(--term-accent);
    cursor: pointer;
    font-size: 20px;
    line-height: 1;
    transition: all 0.2s;
}
.term-nav:hover {
    background: var(--term-accent-soft);
    border-color: var(--term-accent);
    transform: translateY(-1px);
}
.term-wheel {
    display: flex;
    gap: 8px;
    min-width: 0;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-behavior: smooth;
    scroll-padding-inline: 12px;
    padding: 4px 2px;
    padding-bottom: 8px;
    scrollbar-width: thin;
    scrollbar-color: var(--term-accent) rgba(255, 255, 255, 0.62);
}
.term-wheel::-webkit-scrollbar {
    height: 8px;
}
.term-wheel::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.62);
    border-radius: 999px;
}
.term-wheel::-webkit-scrollbar-thumb {
    background: var(--term-accent);
    border-radius: 999px;
    border: 2px solid rgba(255, 255, 255, 0.62);
}
.term-chip {
    flex-shrink: 0;
    padding: 8px 14px;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 20px;
    font-family: inherit;
    font-size: 13px;
    color: var(--ink-muted);
    cursor: pointer;
    transition: all 0.2s;
}
.term-chip:hover {
    border-color: var(--term-accent);
    color: var(--term-accent);
    transform: translateY(-1px);
}
.term-chip.now {
    background: var(--term-accent);
    color: white;
    border-color: var(--term-accent);
    box-shadow: 0 6px 14px rgba(60, 50, 30, 0.12);
}
.term-chip:focus-visible,
.term-nav:focus-visible {
    outline: 2px solid var(--term-accent);
    outline-offset: 2px;
}

.tab-bar {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    background: var(--cream);
    padding: 4px;
    border-radius: 10px;
}
.tab-bar button {
    flex: 1;
    background: transparent;
    border: none;
    padding: 8px 12px;
    font-family: inherit;
    font-size: 13px;
    color: var(--ink-muted);
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
}
.tab-bar button.active {
    background: var(--paper);
    color: var(--jade);
    box-shadow: var(--shadow);
}

.tip-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.tip-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: var(--paper-warm);
    border-radius: 10px;
    border-left: 3px solid var(--jade);
}
.tip-row .icon {
    font-size: 20px;
}
.tip-row .text {
    font-size: 14px;
    color: var(--ink);
    line-height: 1.6;
}
.tip-row .text strong {
    color: var(--jade);
}

.recipe-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
}
.recipe-card {
    background: var(--paper-warm);
    border-radius: 12px;
    padding: 16px;
    border: 1px solid var(--line);
    cursor: pointer;
    transition: all 0.2s;
}
.recipe-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}
.recipe-img {
    height: 80px;
    background: linear-gradient(135deg, var(--gold-soft), var(--jade-soft));
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    margin-bottom: 10px;
}
.recipe-name {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
}
.recipe-tag {
    font-size: 11px;
    color: var(--ink-muted);
}

.card {
    background: var(--paper);
    border-radius: 14px;
    padding: 24px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4);
}
.card-title {
    font-family: "STKaiti", serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.card-title .dot {
    width: 4px;
    height: 16px;
    background: var(--jade);
    border-radius: 2px;
}
.grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}
.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}
.btn {
    background: var(--jade);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 22px;
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}
.btn:hover {
    background: var(--ink);
    transform: translateY(-1px);
}
.btn-ghost {
    background: transparent;
    color: var(--jade);
    border: 1px solid var(--jade);
}
.btn-ghost:hover {
    background: var(--jade-soft);
}
.btn:focus-visible,
.modal-close:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 3px;
}

.recipe-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 20px;
    background: rgba(44, 54, 57, 0.38);
}
.recipe-modal {
    width: min(980px, 100%);
    max-height: min(720px, calc(100vh - 64px));
    overflow: auto;
    background: var(--paper);
    border: 1px solid rgba(232, 223, 208, 0.72);
    border-radius: 16px;
    box-shadow: 0 24px 60px rgba(44, 54, 57, 0.22);
    padding: 24px;
    outline: none;
}
.recipe-modal-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 20px;
}
.recipe-modal-kicker {
    color: var(--gold-deep);
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 4px;
}
.recipe-modal-head h2 {
    font-family: "STKaiti", serif;
    font-size: 24px;
    font-weight: 600;
    color: var(--ink);
    line-height: 1.25;
}
.recipe-modal-head p:not(.recipe-modal-kicker) {
    color: var(--ink-muted);
    font-size: 13px;
    margin-top: 6px;
    max-width: 520px;
}
.modal-close {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border: 1px solid var(--line);
    border-radius: 50%;
    background: var(--paper-warm);
    color: var(--ink-muted);
    cursor: pointer;
    font-size: 24px;
    line-height: 1;
    transition: all 0.2s;
}
.modal-close:hover {
    background: var(--jade-soft);
    color: var(--jade);
    border-color: var(--jade-light);
}
.recipe-modal-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
}
.recipe-modal-card {
    display: flex;
    gap: 12px;
    min-width: 0;
    padding: 14px;
    background: var(--paper-warm);
    border: 1px solid var(--line);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
}
.recipe-modal-card:hover {
    border-color: var(--jade-light);
    box-shadow: var(--shadow);
    transform: translateY(-1px);
}
.recipe-modal-emoji {
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--gold-soft), var(--jade-soft));
    border-radius: 12px;
    font-size: 28px;
}
.recipe-modal-content {
    min-width: 0;
}
.recipe-modal-title {
    color: var(--ink);
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 2px;
}
.recipe-modal-tag {
    color: var(--jade);
    font-size: 11px;
    margin-bottom: 6px;
}
.recipe-modal-content p {
    color: var(--ink-muted);
    font-size: 12px;
    line-height: 1.6;
}
.recipe-modal-content .recipe-usage {
    margin-top: 6px;
    color: var(--gold-deep);
}
.recipe-detail-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1002;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(44, 54, 57, 0.32);
}
.recipe-detail {
    position: relative;
    width: min(430px, 100%);
    padding: 28px;
    border-radius: 18px;
    background: var(--paper);
    border: 1px solid rgba(232, 223, 208, 0.72);
    box-shadow: 0 24px 60px rgba(44, 54, 57, 0.22);
    text-align: center;
}
.recipe-detail-emoji {
    width: 84px;
    height: 84px;
    margin: 0 auto 14px;
    border-radius: 22px;
    background: linear-gradient(135deg, var(--gold-soft), var(--jade-soft));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 42px;
}
.recipe-detail h2 {
    font-family: "STKaiti", serif;
    font-size: 26px;
    color: var(--ink);
    line-height: 1.2;
}
.recipe-detail-tag {
    display: inline-block;
    margin-top: 8px;
    padding: 4px 12px;
    border-radius: 999px;
    background: var(--jade-soft);
    color: var(--jade);
    font-size: 12px;
}
.recipe-detail p {
    margin: 14px auto 18px;
    color: var(--ink-muted);
    font-size: 13px;
    line-height: 1.8;
    max-width: 320px;
}
.recipe-detail .recipe-detail-note {
    margin-top: -8px;
    color: var(--gold-deep);
}
.detail-close {
    position: absolute;
    top: 16px;
    right: 16px;
}
.recipe-detail-enter-active,
.recipe-detail-leave-active {
    transition: opacity 0.22s ease;
}
.recipe-detail-enter-active .recipe-detail,
.recipe-detail-leave-active .recipe-detail {
    transition: transform 0.22s ease;
}
.recipe-detail-enter-from,
.recipe-detail-leave-to {
    opacity: 0;
}
.recipe-detail-enter-from .recipe-detail,
.recipe-detail-leave-to .recipe-detail {
    transform: translateY(16px) scale(0.98);
}

@media (max-width: 900px) {
    .grid-2,
    .recipe-grid {
        grid-template-columns: 1fr;
    }
    .recipe-modal-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 640px) {
    .row {
        align-items: flex-start;
        flex-direction: column;
        gap: 12px;
    }
    .recipe-modal-backdrop {
        align-items: flex-end;
        padding: 16px;
    }
    .recipe-modal {
        max-height: calc(100vh - 32px);
        padding: 20px;
    }
    .recipe-modal-head {
        gap: 12px;
    }
    .recipe-modal-grid {
        grid-template-columns: 1fr;
    }
    .recipe-modal-card {
        padding: 12px;
    }
}
</style>
