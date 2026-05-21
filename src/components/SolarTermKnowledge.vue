<template>
    <div class="solar-term-knowledge">
        <!-- 当前节气主卡 -->
        <section class="main-card-section">
            <el-card class="main-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <h2>{{ currentSolarTerm.name }}</h2>
                        <span class="date-range">{{
                            currentSolarTerm.dateRange
                        }}</span>
                    </div>
                </template>
                <div class="card-content">
                    <p class="health-summary">
                        {{ currentSolarTerm.healthSummary }}
                    </p>
                </div>
            </el-card>
        </section>

        <!-- 节气导航栏 -->
        <section class="navigation-section">
            <div class="nav-container">
                <el-scrollbar>
                    <div class="solar-term-nav">
                        <el-button
                            v-for="term in solarTerms"
                            :key="term.id"
                            :type="
                                currentSolarTerm.id === term.id ? 'primary' : ''
                            "
                            :plain="currentSolarTerm.id !== term.id"
                            @click="switchSolarTerm(term)"
                            class="nav-button"
                        >
                            {{ term.name }}
                        </el-button>
                    </div>
                </el-scrollbar>
            </div>
        </section>

        <!-- 节气养生要点 -->
        <section class="health-points-section">
            <el-card class="health-points-card">
                <template #header>
                    <div class="card-header">
                        <h3>{{ currentSolarTerm.name }}养生要点</h3>
                    </div>
                </template>

                <el-tabs v-model="activeTab" class="health-tabs">
                    <el-tab-pane label="饮食" name="diet">
                        <div class="tab-content">
                            <h4>食疗推荐</h4>
                            <ul
                                v-if="
                                    currentSolarTerm.diet?.recommendations
                                        ?.length
                                "
                            >
                                <li
                                    v-for="(item, index) in currentSolarTerm
                                        .diet.recommendations"
                                    :key="index"
                                >
                                    {{ item }}
                                </li>
                            </ul>
                            <p v-else class="no-info">内容中未提及相关信息</p>

                            <h4>宜食食材</h4>
                            <ul
                                v-if="
                                    currentSolarTerm.diet?.suitableFoods?.length
                                "
                            >
                                <li
                                    v-for="(food, index) in currentSolarTerm
                                        .diet.suitableFoods"
                                    :key="index"
                                >
                                    {{ food }}
                                </li>
                            </ul>
                            <p v-else class="no-info">内容中未提及相关信息</p>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="起居" name="lifestyle">
                        <div class="tab-content">
                            <h4>作息建议</h4>
                            <p
                                v-if="
                                    currentSolarTerm.lifestyle?.scheduleAdvice
                                "
                            >
                                {{ currentSolarTerm.lifestyle.scheduleAdvice }}
                            </p>
                            <p v-else class="no-info">内容中未提及相关信息</p>

                            <h4>睡眠时辰</h4>
                            <p v-if="currentSolarTerm.lifestyle?.sleepTime">
                                {{ currentSolarTerm.lifestyle.sleepTime }}
                            </p>
                            <p v-else class="no-info">内容中未提及相关信息</p>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="运动" name="exercise">
                        <div class="tab-content">
                            <h4>适合运动</h4>
                            <ul
                                v-if="
                                    currentSolarTerm.exercise
                                        ?.suitableActivities?.length
                                "
                            >
                                <li
                                    v-for="(activity, index) in currentSolarTerm
                                        .exercise.suitableActivities"
                                    :key="index"
                                >
                                    {{ activity }}
                                </li>
                            </ul>
                            <p v-else class="no-info">内容中未提及相关信息</p>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="情志" name="emotion">
                        <div class="tab-content">
                            <h4>情绪调节</h4>
                            <p v-if="currentSolarTerm.emotion?.moodRegulation">
                                {{ currentSolarTerm.emotion.moodRegulation }}
                            </p>
                            <p v-else class="no-info">内容中未提及相关信息</p>

                            <h4>心理养护</h4>
                            <p
                                v-if="
                                    currentSolarTerm.emotion?.psychologicalCare
                                "
                            >
                                {{ currentSolarTerm.emotion.psychologicalCare }}
                            </p>
                            <p v-else class="no-info">内容中未提及相关信息</p>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-card>
        </section>

        <!-- 节气推荐食疗方 -->
        <section class="recipe-section">
            <el-card class="recipe-card">
                <template #header>
                    <div class="card-header">
                        <h3>{{ currentSolarTerm.name }}推荐食疗方</h3>
                    </div>
                </template>

                <div class="recipe-grid">
                    <el-row :gutter="20">
                        <el-col
                            v-for="recipe in currentSolarTerm.recipes"
                            :key="recipe.id"
                            :xs="24"
                            :sm="12"
                            :md="8"
                            :lg="6"
                        >
                            <el-card
                                class="recipe-item"
                                shadow="hover"
                                @click="showRecipeDetail(recipe)"
                            >
                                <div class="recipe-image">
                                    <img
                                        :src="recipe.image"
                                        :alt="recipe.name"
                                        @error="
                                            handleImageError(
                                                $event,
                                                recipe.name,
                                            )
                                        "
                                    />
                                </div>
                                <div class="recipe-info">
                                    <h4>{{ recipe.name }}</h4>
                                    <p class="recipe-effect">
                                        {{ recipe.effect }}
                                    </p>
                                    <span
                                        class="recipe-nature"
                                        :class="recipe.nature.toLowerCase()"
                                    >
                                        {{ recipe.nature }}
                                    </span>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </div>
            </el-card>
        </section>

        <!-- 食谱详情弹窗 -->
        <el-dialog
            v-model="dialogVisible"
            :title="selectedRecipe?.name"
            width="600px"
        >
            <div v-if="selectedRecipe" class="recipe-detail">
                <div class="detail-image">
                    <img
                        :src="selectedRecipe.image"
                        :alt="selectedRecipe.name"
                        @error="handleImageError($event, selectedRecipe.name)"
                    />
                </div>
                <div class="detail-content">
                    <h4>配料</h4>
                    <p>
                        {{
                            selectedRecipe.ingredients || "内容中未提及相关信息"
                        }}
                    </p>

                    <h4>步骤</h4>
                    <p>{{ selectedRecipe.steps || "内容中未提及相关信息" }}</p>

                    <h4>功效</h4>
                    <p>
                        {{
                            selectedRecipe.detailedEffect ||
                            selectedRecipe.effect
                        }}
                    </p>

                    <h4>禁忌人群</h4>
                    <p>
                        {{
                            selectedRecipe.contraindications ||
                            "内容中未提及相关信息"
                        }}
                    </p>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

// 定义节气数据类型
interface SolarTermDiet {
    recommendations?: string[];
    suitableFoods?: string[];
}

interface SolarTermLifestyle {
    scheduleAdvice?: string;
    sleepTime?: string;
}

interface SolarTermExercise {
    suitableActivities?: string[];
}

interface SolarTermEmotion {
    moodRegulation?: string;
    psychologicalCare?: string;
}

interface Recipe {
    id: number;
    name: string;
    image: string;
    effect: string;
    nature: string;
    ingredients?: string;
    steps?: string;
    detailedEffect?: string;
    contraindications?: string;
}

interface SolarTerm {
    id: number;
    name: string;
    dateRange: string;
    healthSummary: string;
    diet?: SolarTermDiet;
    lifestyle?: SolarTermLifestyle;
    exercise?: SolarTermExercise;
    emotion?: SolarTermEmotion;
    recipes: Recipe[];
}

// 24节气数据（这里只包含立夏的完整数据，其他节气为示例结构）
const solarTerms = ref<SolarTerm[]>([
    {
        id: 1,
        name: "立春",
        dateRange: "2026年2月3日 — 2月18日",
        healthSummary:
            "立春在天为风、在地为木、在人为肝。养生当以养肝为要，宜舒展、勿抑郁、戒怒气。早起晚睡，可疏肝气。",
        recipes: [],
    },
    {
        id: 2,
        name: "雨水",
        dateRange: "2026年2月19日 — 3月5日",
        healthSummary:
            "雨水在天为湿、在地为土、在人为脾。养生当以健脾为要，宜温和、勿寒凉、戒思虑。早睡早起，可健脾胃。",
        recipes: [],
    },
    {
        id: 3,
        name: "惊蛰",
        dateRange: "2026年3月6日 — 3月20日",
        healthSummary:
            "惊蛰在天为雷、在地为动、在人为胆。养生当以养胆为要，宜活跃、勿沉闷、戒惊恐。适度运动，可畅胆气。",
        recipes: [],
    },
    {
        id: 4,
        name: "春分",
        dateRange: "2026年3月21日 — 4月4日",
        healthSummary:
            "春分在天为平、在地为衡、在人为阴阳平衡。养生当以调和为要，宜均衡、勿偏颇、戒极端。作息规律，可保平衡。",
        recipes: [],
    },
    {
        id: 5,
        name: "清明",
        dateRange: "2026年4月5日 — 4月19日",
        healthSummary:
            "清明在天为清、在地为明、在人为肺。养生当以清肺为要，宜清新、勿浊重、戒悲伤。户外活动，可清肺气。",
        recipes: [],
    },
    {
        id: 6,
        name: "谷雨",
        dateRange: "2026年4月20日 — 5月4日",
        healthSummary:
            "谷雨在天为雨、在地为谷、在人为胃。养生当以养胃为要，宜温润、勿干燥、戒饥饱。饮食有节，可养胃气。",
        recipes: [],
    },
    {
        id: 7,
        name: "立夏",
        dateRange: "2026年5月5日 — 5月20日",
        healthSummary:
            "立夏在天为暑、在地为火、在人为心。养生当以养心为要，宜清淡、勿大汗、戒躁怒。子午小憩，可补心阴。",
        diet: {
            recommendations: [
                "多食苦瓜、莲子心、绿豆等清热降火食物",
                "推荐麦冬、太子参泡水代茶饮以益气养阴",
            ],
            suitableFoods: ["苦瓜", "莲子心", "绿豆", "麦冬", "太子参"],
        },
        lifestyle: {
            scheduleAdvice: "内容中未提及相关信息",
            sleepTime: "内容中未提及相关信息",
        },
        exercise: {
            suitableActivities: [],
        },
        emotion: {
            moodRegulation: "内容中未提及相关信息",
            psychologicalCare: "内容中未提及相关信息",
        },
        recipes: [
            {
                id: 1,
                name: "莲子百合粥",
                image: "/images/recipes/lotus-lily-porridge.jpg",
                effect: "养心安神",
                nature: "微寒",
                ingredients: "莲子30g、百合20g、大米100g",
                steps: "1. 莲子、百合洗净浸泡2小时\n2. 大米淘洗干净\n3. 所有材料放入锅中，加水适量\n4. 大火煮开后转小火熬煮至粥稠\n5. 可根据口味加入适量冰糖",
                detailedEffect:
                    "具有养心安神、润肺止咳的功效，适合夏季心烦失眠者食用",
                contraindications: "脾胃虚寒者慎用",
            },
            {
                id: 2,
                name: "凉拌苦瓜",
                image: "/images/recipes/cold-bitter-melon.jpg",
                effect: "清心降火",
                nature: "凉性",
                ingredients: "苦瓜1根、蒜末适量、香油少许",
                steps: "1. 苦瓜洗净去瓤切片\n2. 用盐腌制10分钟去除苦味\n3. 清水冲洗干净沥干\n4. 加入蒜末、香油拌匀即可",
                detailedEffect: "清热解毒、明目降火，适合夏季上火、目赤肿痛者",
                contraindications: "孕妇及脾胃虚寒者不宜多食",
            },
            {
                id: 3,
                name: "绿豆汤",
                image: "/images/recipes/green-bean-soup.jpg",
                effect: "清热解毒",
                nature: "寒性",
                ingredients: "绿豆100g、冰糖适量",
                steps: "1. 绿豆洗净浸泡2小时\n2. 锅中加水烧开\n3. 放入绿豆大火煮开\n4. 转小火煮至绿豆开花\n5. 加入冰糖调味",
                detailedEffect: "清热解毒、消暑利尿，是夏季理想的清凉饮品",
                contraindications: "体质虚寒者不宜过量饮用",
            },
            {
                id: 4,
                name: "麦冬茶",
                image: "/images/recipes/ophiopogon-tea.jpg",
                effect: "益气养阴",
                nature: "微寒",
                ingredients: "麦冬10g、开水适量",
                steps: "1. 麦冬洗净\n2. 放入杯中\n3. 冲入沸水\n4. 加盖焖泡10分钟即可饮用",
                detailedEffect:
                    "养阴生津、润肺清心，适合夏季口干舌燥、心烦失眠者",
                contraindications: "脾胃虚寒者慎用",
            },
        ],
    },
    {
        id: 8,
        name: "小满",
        dateRange: "2026年5月21日 — 6月5日",
        healthSummary:
            "小满在天为热、在地为盛、在人为脾。养生当以健脾为要,宜清淡、勿油腻、戒贪凉。适度运动,可健脾气。",
        diet: {
            recommendations: [
                "多食赤小豆、薏苡仁、冬瓜等利湿食物",
                "推荐山药、茯苓煮粥以健脾祛湿",
            ],
            suitableFoods: ["赤小豆", "薏苡仁", "冬瓜", "山药", "茯苓"],
        },
        lifestyle: {
            scheduleAdvice: "早起晚睡，顺应阳气充盛",
            sleepTime: "建议晚上11点前入睡，早上6-7点起床",
        },
        exercise: {
            suitableActivities: ["慢跑", "太极拳", "八段锦", "散步"],
        },
        emotion: {
            moodRegulation: "保持心情舒畅，避免急躁",
            psychologicalCare: "心静自然凉，调息凝神",
        },
        recipes: [
            {
                id: 5,
                name: "薏苡仁粥",
                image: "/images/recipes/coix-porridge.jpg",
                effect: "健脾祛湿",
                nature: "微寒",
                ingredients: "薏苡仁50g、大米100g",
                steps: "1. 薏苡仁洗净浸泡3小时\n2. 大米淘洗干净\n3. 所有材料放入锅中，加水适量\n4. 大火煮开后转小火熬煮至粥稠",
                detailedEffect: "具有健脾渗湿、清热排脓的功效，适合湿热体质者",
                contraindications: "孕妇慎用，津液不足者不宜",
            },
            {
                id: 6,
                name: "冬瓜排骨汤",
                image: "/images/recipes/winter-melon-soup.jpg",
                effect: "清热利湿",
                nature: "凉性",
                ingredients: "冬瓜500g、排骨300g、姜片适量",
                steps: "1. 排骨焯水去腥\n2. 冬瓜去皮切块\n3. 锅中加水烧开，放入排骨和姜片\n4. 小火炖煮1小时后加入冬瓜\n5. 继续煮20分钟，加盐调味",
                detailedEffect: "清热解毒、利尿消肿，是夏季理想的养生汤品",
                contraindications: "脾胃虚寒者不宜多食",
            },
        ],
    },
    {
        id: 9,
        name: "芒种",
        dateRange: "2026年6月6日 — 6月20日",
        healthSummary:
            "芒种在天为湿、在地为土、在人为脾胃。养生当以健脾祛湿为要，宜清淡、勿生冷、戒饱食。勤换衣被，防湿热侵袭。",
        diet: {
            recommendations: [
                "多食扁豆、豇豆、玉米等健脾食物",
                "推荐荷叶、藿香泡水以化湿醒脾",
            ],
            suitableFoods: ["扁豆", "豇豆", "玉米", "荷叶", "藿香"],
        },
        lifestyle: {
            scheduleAdvice: "晚睡早起，中午小憩",
            sleepTime: "建议晚上11点前入睡，中午休息30分钟",
        },
        exercise: {
            suitableActivities: ["游泳", "瑜伽", "晨练", "太极"],
        },
        emotion: {
            moodRegulation: "保持愉快心情，避免烦躁",
            psychologicalCare: "静心养性，避暑纳凉",
        },
        recipes: [
            {
                id: 7,
                name: "荷叶粥",
                image: "/images/recipes/lotus-leaf-porridge.jpg",
                effect: "清暑化湿",
                nature: "平性",
                ingredients: "鲜荷叶1张、大米100g、冰糖适量",
                steps: "1. 荷叶洗净煎汁\n2. 用荷叶汁煮粥\n3. 粥成后加入冰糖调味",
                detailedEffect: "具有清暑利湿、升发清阳的功效",
                contraindications: "体质虚弱者慎用",
            },
            {
                id: 8,
                name: "扁豆山药粥",
                image: "/images/recipes/hyam-bean-porridge.jpg",
                effect: "健脾化湿",
                nature: "平性",
                ingredients: "扁豆30g、山药30g、大米100g",
                steps: "1. 扁豆、山药洗净\n2. 与大米同煮成粥\n3. 可根据口味加入适量白糖",
                detailedEffect: "健脾养胃、化湿止泻，适合脾虚湿盛者",
                contraindications: "便秘者不宜多食",
            },
        ],
    },
    {
        id: 10,
        name: "夏至",
        dateRange: "2026年6月21日 — 7月6日",
        healthSummary:
            "夏至在天为热、在地为火、在人为心。养生当以养心清热为要，宜清凉、勿暴晒、戒大怒。昼长夜短，当顺阴阳。",
        diet: {
            recommendations: [
                "多食西瓜、黄瓜、番茄等清热生津食物",
                "推荐金银花、菊花泡茶以清热解毒",
            ],
            suitableFoods: ["西瓜", "黄瓜", "番茄", "金银花", "菊花"],
        },
        lifestyle: {
            scheduleAdvice: "晚睡早起，避开烈日",
            sleepTime: "建议晚上10:30前入睡，早上6点前起床",
        },
        exercise: {
            suitableActivities: ["游泳", "晨跑", "傍晚散步", "水中健身"],
        },
        emotion: {
            moodRegulation: "心静自然凉，忌大喜大悲",
            psychologicalCare: "调息宁心，避暑养阴",
        },
        recipes: [
            {
                id: 9,
                name: "西瓜翠衣汤",
                image: "/images/recipes/watermelon-soup.jpg",
                effect: "清热解暑",
                nature: "寒性",
                ingredients: "西瓜翠衣200g、冰糖适量",
                steps: "1. 西瓜翠衣洗净切块\n2. 加水煮沸\n3. 小火煮15分钟\n4. 加入冰糖调味",
                detailedEffect: "清热解暑、利尿降压，是夏季消暑佳品",
                contraindications: "脾胃虚寒者不宜饮用",
            },
            {
                id: 10,
                name: "凉拌黄瓜",
                image: "/images/recipes/cold-cucumber.jpg",
                effect: "清热生津",
                nature: "凉性",
                ingredients: "黄瓜2根、蒜末适量、醋少许",
                steps: "1. 黄瓜洗净拍碎\n2. 加入蒜末、醋、盐拌匀\n3. 淋上香油即可",
                detailedEffect: "清热解毒、生津止渴，适合夏季食用",
                contraindications: "腹泻者不宜多食",
            },
        ],
    },
    {
        id: 11,
        name: "小暑",
        dateRange: "2026年7月7日 — 7月22日",
        healthSummary:
            "小暑在天为暑、在地为热、在人为心脾。养生当以清暑健脾为要，宜清淡、勿贪凉、戒疲劳。防暑降温，养护心脾。",
        diet: {
            recommendations: [
                "多食莲藕、荷叶、绿豆等清暑食物",
                "推荐西洋参、麦冬泡水以益气养阴",
            ],
            suitableFoods: ["莲藕", "荷叶", "绿豆", "西洋参", "麦冬"],
        },
        lifestyle: {
            scheduleAdvice: "避免高温时段外出，注意防暑",
            sleepTime: "保证充足睡眠，建议午休30-60分钟",
        },
        exercise: {
            suitableActivities: ["室内运动", "游泳", "早晚锻炼", "瑜伽"],
        },
        emotion: {
            moodRegulation: "保持心态平和，避免中暑烦躁",
            psychologicalCare: "静心降火，清凉度夏",
        },
        recipes: [
            {
                id: 11,
                name: "莲藕排骨汤",
                image: "/images/recipes/lotus-root-soup.jpg",
                effect: "清热健脾",
                nature: "平性",
                ingredients: "莲藕500g、排骨300g、姜片适量",
                steps: "1. 排骨焯水\n2. 莲藕去皮切块\n3. 所有材料放入锅中\n4. 大火煮开后转小火炖煮2小时\n5. 加盐调味",
                detailedEffect: "健脾开胃、清热养血，适合夏季食欲不振者",
                contraindications: "糖尿病患者不宜多食",
            },
            {
                id: 12,
                name: "酸梅汤",
                image: "/images/recipes/plum-soup.jpg",
                effect: "生津止渴",
                nature: "凉性",
                ingredients: "乌梅50g、山楂30g、甘草10g、冰糖适量",
                steps: "1. 所有材料洗净\n2. 加水浸泡30分钟\n3. 大火煮开后转小火煮30分钟\n4. 过滤后加入冰糖\n5. 冷藏后饮用更佳",
                detailedEffect: "生津止渴、消食化积，是传统消暑饮品",
                contraindications: "胃酸过多者慎用",
            },
        ],
    },
    {
        id: 12,
        name: "大暑",
        dateRange: "2026年7月23日 — 8月7日",
        healthSummary:
            "大暑在天为酷热、在地为蒸腾、在人为心肾。养生当以清热养阴为要，宜清凉、勿燥热、戒耗散。避暑纳凉，固护阴液。",
        diet: {
            recommendations: [
                "多食苦瓜、冬瓜、丝瓜等清热食物",
                "推荐石斛、生地煲汤以滋阴清热",
            ],
            suitableFoods: ["苦瓜", "冬瓜", "丝瓜", "石斛", "生地"],
        },
        lifestyle: {
            scheduleAdvice: "避免正午外出，注意补水",
            sleepTime: "保证睡眠质量，可适当延长睡眠时间",
        },
        exercise: {
            suitableActivities: [
                "室内健身",
                "水中运动",
                "清晨锻炼",
                "静态拉伸",
            ],
        },
        emotion: {
            moodRegulation: "心静凉爽，避免情绪激动",
            psychologicalCare: "修身养性，安然度夏",
        },
        recipes: [
            {
                id: 13,
                name: "石斛老鸭汤",
                image: "/images/recipes/dendrobium-duck-soup.jpg",
                effect: "滋阴清热",
                nature: "微寒",
                ingredients: "石斛20g、老鸭1只、姜片适量",
                steps: "1. 老鸭处理干净\n2. 石斛洗净\n3. 所有材料放入炖盅\n4. 隔水炖煮3-4小时\n5. 加盐调味",
                detailedEffect: "滋阴清热、养胃生津，适合阴虚火旺者",
                contraindications: "脾胃虚寒者慎用",
            },
            {
                id: 14,
                name: "丝瓜蛋汤",
                image: "/images/recipes/luffa-egg-soup.jpg",
                effect: "清热凉血",
                nature: "凉性",
                ingredients: "丝瓜1根、鸡蛋2个、葱花适量",
                steps: "1. 丝瓜去皮切片\n2. 鸡蛋打散\n3. 锅中加水烧开，放入丝瓜\n4. 煮2分钟后倒入蛋液\n5. 加盐、葱花调味",
                detailedEffect: "清热化痰、凉血解毒，适合夏季食用",
                contraindications: "体虚便溏者不宜多食",
            },
        ],
    },
    {
        id: 13,
        name: "立秋",
        dateRange: "2026年8月8日 — 8月22日",
        healthSummary:
            "立秋在天为燥、在地为金、在人为肺。养生当以润肺养阴为要，宜滋润、勿辛辣、戒悲忧。早卧早起，收敛神气。",
        diet: {
            recommendations: [
                "多食梨、百合、银耳等润肺食物",
                "推荐蜂蜜、杏仁食用以润燥养肺",
            ],
            suitableFoods: ["梨", "百合", "银耳", "蜂蜜", "杏仁"],
        },
        lifestyle: {
            scheduleAdvice: "早卧早起，与鸡俱兴",
            sleepTime: "建议晚上10点前入睡，早上6-7点起床",
        },
        exercise: {
            suitableActivities: ["慢跑", "登山", "太极", "呼吸操"],
        },
        emotion: {
            moodRegulation: "保持内心宁静，避免悲秋情绪",
            psychologicalCare: "收敛神气，使志安宁",
        },
        recipes: [
            {
                id: 15,
                name: "冰糖雪梨",
                image: "/images/recipes/rock-sugar-pear.jpg",
                effect: "润肺止咳",
                nature: "凉性",
                ingredients: "雪梨2个、冰糖30g、枸杞适量",
                steps: "1. 雪梨去皮去核\n2. 放入碗中，加入冰糖和枸杞\n3. 隔水蒸30分钟即可",
                detailedEffect: "润肺止咳、清热化痰，适合秋燥咳嗽者",
                contraindications: "脾胃虚寒者不宜多食",
            },
            {
                id: 16,
                name: "百合银耳羹",
                image: "/images/recipes/lily-tremella-soup.jpg",
                effect: "滋阴润肺",
                nature: "平性",
                ingredients: "百合30g、银耳20g、冰糖适量",
                steps: "1. 银耳泡发撕小朵\n2. 百合洗净\n3. 所有材料放入锅中\n4. 小火慢炖2小时至粘稠",
                detailedEffect: "滋阴润燥、养颜美容，适合秋季养生",
                contraindications: "风寒咳嗽者不宜",
            },
        ],
    },
    {
        id: 14,
        name: "处暑",
        dateRange: "2026年8月23日 — 9月7日",
        healthSummary:
            "处暑在天为凉、在地为收、在人为肺脾。养生当以养阴润燥为要，宜温润、勿寒凉、戒生冷。增减衣物，预防感冒。",
        diet: {
            recommendations: [
                "多食芝麻、核桃、糯米等润燥食物",
                "推荐沙参、玉竹煲汤以养阴润肺",
            ],
            suitableFoods: ["芝麻", "核桃", "糯米", "沙参", "玉竹"],
        },
        lifestyle: {
            scheduleAdvice: "早睡早起，注意保暖",
            sleepTime: "建议晚上10:30前入睡，早上6-7点起床",
        },
        exercise: {
            suitableActivities: ["散步", "太极", "登山", "伸展运动"],
        },
        emotion: {
            moodRegulation: "保持乐观，避免秋愁",
            psychologicalCare: "安神定志，收敛心神",
        },
        recipes: [
            {
                id: 17,
                name: "芝麻糊",
                image: "/images/recipes/sesame-paste.jpg",
                effect: "润燥养颜",
                nature: "平性",
                ingredients: "黑芝麻100g、糯米50g、冰糖适量",
                steps: "1. 黑芝麻炒香\n2. 糯米浸泡后磨浆\n3. 加入黑芝麻一起磨细\n4. 加水煮开，加入冰糖搅拌",
                detailedEffect: "滋补肝肾、润燥滑肠，适合秋季食用",
                contraindications: "腹泻者不宜多食",
            },
            {
                id: 18,
                name: "沙参玉竹汤",
                image: "/images/recipes/glehnia-bamboo-soup.jpg",
                effect: "养阴润肺",
                nature: "微寒",
                ingredients: "沙参20g、玉竹20g、瘦肉200g",
                steps: "1. 药材洗净\n2. 瘦肉焯水\n3. 所有材料放入锅中\n4. 加水煲2小时，加盐调味",
                detailedEffect: "养阴清肺、益胃生津，适合阴虚燥咳者",
                contraindications: "风寒感冒者不宜",
            },
        ],
    },
    {
        id: 15,
        name: "白露",
        dateRange: "2026年9月8日 — 9月22日",
        healthSummary:
            "白露在天为露、在地为润、在人为肺肾。养生当以润肺补肾为要，宜滋润、勿干燥、戒寒凉。保暖防寒，养护肺肾。",
        diet: {
            recommendations: [
                "多食龙眼、山药、莲子等补益食物",
                "推荐枸杞、红枣泡茶以滋补肝肾",
            ],
            suitableFoods: ["龙眼", "山药", "莲子", "枸杞", "红枣"],
        },
        lifestyle: {
            scheduleAdvice: "早卧早起，注意足部保暖",
            sleepTime: "建议晚上10点前入睡，早上6-7点起床",
        },
        exercise: {
            suitableActivities: ["慢跑", "太极", "登山", "气功"],
        },
        emotion: {
            moodRegulation: "保持心境平和，避免忧伤",
            psychologicalCare: "宁神静志，安度金秋",
        },
        recipes: [
            {
                id: 19,
                name: "龙眼红枣粥",
                image: "/images/recipes/longan-date-porridge.jpg",
                effect: "补血安神",
                nature: "温性",
                ingredients: "龙眼肉20g、红枣10枚、大米100g",
                steps: "1. 红枣去核\n2. 与龙眼肉、大米同煮\n3. 煮至粥稠即可",
                detailedEffect: "补益心脾、养血安神，适合气血不足者",
                contraindications: "上火者不宜多食",
            },
            {
                id: 20,
                name: "山药枸杞汤",
                image: "/images/recipes/yam-goji-soup.jpg",
                effect: "健脾补肾",
                nature: "平性",
                ingredients: "山药200g、枸杞20g、排骨300g",
                steps: "1. 排骨焯水\n2. 山药去皮切块\n3. 所有材料放入锅中\n4. 炖煮2小时，加盐调味",
                detailedEffect: "健脾益肾、明目养肝，适合秋季进补",
                contraindications: "感冒发热者不宜",
            },
        ],
    },
    {
        id: 16,
        name: "秋分",
        dateRange: "2026年9月23日 — 10月7日",
        healthSummary:
            "秋分在天为平、在地为衡、在人为阴阳平衡。养生当以调和阴阳为要，宜均衡、勿偏颇、戒极端。起居有常，饮食有节。",
        diet: {
            recommendations: [
                "多食石榴、葡萄、甘蔗等应季水果",
                "推荐百合、莲子煮粥以养心安神",
            ],
            suitableFoods: ["石榴", "葡萄", "甘蔗", "百合", "莲子"],
        },
        lifestyle: {
            scheduleAdvice: "早睡早起，顺应昼夜平分",
            sleepTime: "建议晚上10:30前入睡，早上6-7点起床",
        },
        exercise: {
            suitableActivities: ["登山", "慢跑", "太极", "骑行"],
        },
        emotion: {
            moodRegulation: "保持心态平衡，避免情绪波动",
            psychologicalCare: "阴阳调和，心境安宁",
        },
        recipes: [
            {
                id: 21,
                name: "百合莲子粥",
                image: "/images/recipes/lily-lotus-porridge.jpg",
                effect: "养心安神",
                nature: "平性",
                ingredients: "百合30g、莲子30g、大米100g",
                steps: "1. 百合、莲子洗净浸泡\n2. 与大米同煮\n3. 煮至粥稠，可加冰糖调味",
                detailedEffect: "养心安神、健脾补肾，适合秋季养生",
                contraindications: "便秘者莲子不宜多食",
            },
            {
                id: 22,
                name: "石榴汁",
                image: "/images/recipes/pomegranate-juice.jpg",
                effect: "生津止渴",
                nature: "温性",
                ingredients: "石榴2个、蜂蜜适量",
                steps: "1. 石榴剥籽\n2. 榨汁过滤\n3. 加入蜂蜜调味\n4. 可直接饮用",
                detailedEffect: "生津止渴、收敛固涩，适合秋季饮用",
                contraindications: "便秘者不宜多饮",
            },
        ],
    },
    {
        id: 17,
        name: "寒露",
        dateRange: "2026年10月8日 — 10月22日",
        healthSummary:
            "寒露在天为寒、在地为冷、在人为肺胃。养生当以暖胃润肺为要，宜温热、勿寒凉、戒生冷。添衣保暖，防寒护阳。",
        diet: {
            recommendations: [
                "多食柿子、板栗、花生等温补食物",
                "推荐生姜、红糖煮水以温中散寒",
            ],
            suitableFoods: ["柿子", "板栗", "花生", "生姜", "红糖"],
        },
        lifestyle: {
            scheduleAdvice: "早睡早起，注意颈部保暖",
            sleepTime: "建议晚上10点前入睡，早上6-7点起床",
        },
        exercise: {
            suitableActivities: ["慢跑", "太极", "登山", "室内健身"],
        },
        emotion: {
            moodRegulation: "保持积极心态，避免抑郁",
            psychologicalCare: "温暖心灵，抵御寒意",
        },
        recipes: [
            {
                id: 23,
                name: "板栗鸡汤",
                image: "/images/recipes/chestnut-chicken-soup.jpg",
                effect: "温补脾胃",
                nature: "温性",
                ingredients: "板栗200g、鸡肉500g、姜片适量",
                steps: "1. 鸡肉焯水\n2. 板栗去皮\n3. 所有材料放入锅中\n4. 炖煮2小时，加盐调味",
                detailedEffect: "健脾养胃、补肾强筋，适合秋季进补",
                contraindications: "上火者不宜多食",
            },
            {
                id: 24,
                name: "生姜红糖水",
                image: "/images/recipes/ginger-brown-sugar.jpg",
                effect: "温中散寒",
                nature: "热性",
                ingredients: "生姜30g、红糖50g",
                steps: "1. 生姜切片\n2. 加水煮沸\n3. 小火煮10分钟\n4. 加入红糖搅拌溶解",
                detailedEffect: "温中散寒、暖胃止痛，适合受寒时饮用",
                contraindications: "阴虚火旺者不宜",
            },
        ],
    },
    {
        id: 18,
        name: "霜降",
        dateRange: "2026年10月23日 — 11月6日",
        healthSummary:
            "霜降在天为霜、在地为凝、在人为脾胃。养生当以健脾养胃为要，宜温补、勿寒凉、戒生冷。保暖防冻，养护脾胃。",
        diet: {
            recommendations: [
                "多食牛肉、羊肉、萝卜等温补食物",
                "推荐党参、黄芪煲汤以补气健脾",
            ],
            suitableFoods: ["牛肉", "羊肉", "萝卜", "党参", "黄芪"],
        },
        lifestyle: {
            scheduleAdvice: "早睡晚起，注意关节保暖",
            sleepTime: "建议晚上10点前入睡，早上7点起床",
        },
        exercise: {
            suitableActivities: ["慢跑", "太极", "健身", "爬山"],
        },
        emotion: {
            moodRegulation: "保持乐观，避免悲秋",
            psychologicalCare: "养精蓄锐，迎接冬季",
        },
        recipes: [
            {
                id: 25,
                name: "萝卜牛腩汤",
                image: "/images/recipes/radish-beef-soup.jpg",
                effect: "健脾养胃",
                nature: "温性",
                ingredients: "白萝卜500g、牛腩300g、姜片适量",
                steps: "1. 牛腩焯水\n2. 萝卜去皮切块\n3. 所有材料放入锅中\n4. 炖煮2-3小时，加盐调味",
                detailedEffect: "健脾开胃、补中益气，适合秋冬进补",
                contraindications: "体质燥热者不宜多食",
            },
            {
                id: 26,
                name: "党参黄芪汤",
                image: "/images/recipes/codonopsis-astragalus-soup.jpg",
                effect: "补气健脾",
                nature: "温性",
                ingredients: "党参20g、黄芪20g、瘦肉200g",
                steps: "1. 药材洗净\n2. 瘦肉焯水\n3. 所有材料放入锅中\n4. 煲2小时，加盐调味",
                detailedEffect: "补中益气、健脾养胃，适合气虚体质者",
                contraindications: "实热证者不宜",
            },
        ],
    },
    {
        id: 19,
        name: "立冬",
        dateRange: "2026年11月7日 — 11月21日",
        healthSummary:
            "立冬在天为寒、在地为水、在人为肾。养生当以补肾藏精为要，宜温补、勿寒凉、戒泄耗。早卧晚起，必待日光。",
        diet: {
            recommendations: [
                "多食黑豆、黑芝麻、核桃等补肾食物",
                "推荐当归、羊肉煲汤以温补气血",
            ],
            suitableFoods: ["黑豆", "黑芝麻", "核桃", "当归", "羊肉"],
        },
        lifestyle: {
            scheduleAdvice: "早卧晚起，以待日光",
            sleepTime: "建议晚上10点前入睡，早上7-8点起床",
        },
        exercise: {
            suitableActivities: ["室内运动", "太极", "瑜伽", "温和锻炼"],
        },
        emotion: {
            moodRegulation: "保持内心平静，避免惊恐",
            psychologicalCare: "藏精守神，静待春生",
        },
        recipes: [
            {
                id: 27,
                name: "当归羊肉汤",
                image: "/images/recipes/angelica-lamb-soup.jpg",
                effect: "温补气血",
                nature: "热性",
                ingredients: "当归20g、羊肉500g、姜片适量",
                steps: "1. 羊肉焯水去膻\n2. 当归洗净\n3. 所有材料放入锅中\n4. 炖煮2-3小时，加盐调味",
                detailedEffect: "温中补虚、养血活血，适合冬季进补",
                contraindications: "实热证者不宜",
            },
            {
                id: 28,
                name: "黑豆核桃粥",
                image: "/images/recipes/black-bean-walnut-porridge.jpg",
                effect: "补肾益智",
                nature: "平性",
                ingredients: "黑豆50g、核桃仁30g、大米100g",
                steps: "1. 黑豆浸泡过夜\n2. 与核桃仁、大米同煮\n3. 煮至粥稠即可",
                detailedEffect: "补肾益精、健脑益智，适合肾虚者",
                contraindications: "消化不良者不宜多食",
            },
        ],
    },
    {
        id: 20,
        name: "小雪",
        dateRange: "2026年11月22日 — 12月6日",
        healthSummary:
            "小雪在天为雪、在地为冰、在人为肾阳。养生当以温补肾阳为要，宜温热、勿寒凉、戒生冷。保暖御寒，养护阳气。",
        diet: {
            recommendations: [
                "多食桂圆、红枣、枸杞等温补食物",
                "推荐杜仲、巴戟天煲汤以补肾壮阳",
            ],
            suitableFoods: ["桂圆", "红枣", "枸杞", "杜仲", "巴戟天"],
        },
        lifestyle: {
            scheduleAdvice: "早睡晚起，注意头部保暖",
            sleepTime: "建议晚上10点前入睡，早上7-8点起床",
        },
        exercise: {
            suitableActivities: ["室内健身", "太极", "八段锦", "温和运动"],
        },
        emotion: {
            moodRegulation: "保持心情愉悦，避免抑郁",
            psychologicalCare: "温暖心灵，阳光过冬",
        },
        recipes: [
            {
                id: 29,
                name: "桂圆红枣茶",
                image: "/images/recipes/longan-date-tea.jpg",
                effect: "补血养心",
                nature: "温性",
                ingredients: "桂圆肉20g、红枣10枚、红糖适量",
                steps: "1. 红枣去核\n2. 与桂圆肉一起煮\n3. 煮20分钟后加入红糖\n4. 代茶饮用",
                detailedEffect: "补益心脾、养血安神，适合气血不足者",
                contraindications: "上火者不宜多饮",
            },
            {
                id: 30,
                name: "杜仲猪腰汤",
                image: "/images/recipes/eucommia-kidney-soup.jpg",
                effect: "补肾壮阳",
                nature: "温性",
                ingredients: "杜仲20g、猪腰2个、姜片适量",
                steps: "1. 猪腰处理干净\n2. 杜仲洗净\n3. 所有材料放入锅中\n4. 炖煮2小时，加盐调味",
                detailedEffect: "补肝肾、强筋骨，适合肾虚腰痛者",
                contraindications: "阴虚火旺者不宜",
            },
        ],
    },
    {
        id: 21,
        name: "大雪",
        dateRange: "2026年12月7日 — 12月21日",
        healthSummary:
            "大雪在天为寒、在地为冻、在人为肾精。养生当以固肾填精为要，宜温补、勿泄耗、戒寒冷。深居简出，保养精气。",
        diet: {
            recommendations: [
                "多食海参、鲍鱼、鹿茸等滋补食物",
                "推荐熟地、山茱萸煲汤以滋补肾精",
            ],
            suitableFoods: ["海参", "鲍鱼", "鹿茸", "熟地", "山茱萸"],
        },
        lifestyle: {
            scheduleAdvice: "早睡晚起，避寒就温",
            sleepTime: "建议晚上9:30前入睡，早上7-8点起床",
        },
        exercise: {
            suitableActivities: ["室内运动", "瑜伽", "太极", "静态锻炼"],
        },
        emotion: {
            moodRegulation: "保持心境安宁，避免浮躁",
            psychologicalCare: "静养精神，蓄势待发",
        },
        recipes: [
            {
                id: 31,
                name: "海参粥",
                image: "/images/recipes/sea-cucumber-porridge.jpg",
                effect: "补肾益精",
                nature: "温性",
                ingredients: "海参2条、大米100g、姜片适量",
                steps: "1. 海参泡发切段\n2. 大米淘洗\n3. 所有材料放入锅中\n4. 煮至粥稠，加盐调味",
                detailedEffect: "补肾益精、养血润燥，适合冬季进补",
                contraindications: "感冒发热者不宜",
            },
            {
                id: 32,
                name: "熟地山茱萸汤",
                image: "/images/recipes/rehmannia-cornus-soup.jpg",
                effect: "滋补肾精",
                nature: "温性",
                ingredients: "熟地20g、山茱萸15g、排骨300g",
                steps: "1. 药材洗净\n2. 排骨焯水\n3. 所有材料放入锅中\n4. 煲2小时，加盐调味",
                detailedEffect: "滋补肝肾、填精益髓，适合肾精不足者",
                contraindications: "脾胃虚寒者慎用",
            },
        ],
    },
    {
        id: 22,
        name: "冬至",
        dateRange: "2026年12月22日 — 2027年1月4日",
        healthSummary:
            "冬至在天为阴极、在地为阳生、在人为肾元。养生当以培补肾元为要，宜大补、勿耗散、戒寒冷。一阳初生，静养为宜。",
        diet: {
            recommendations: [
                "多食饺子、汤圆、羊肉等传统食物",
                "推荐人参、鹿茸炖汤以大补元气",
            ],
            suitableFoods: ["饺子", "汤圆", "羊肉", "人参", "鹿茸"],
        },
        lifestyle: {
            scheduleAdvice: "早睡晚起，保护阳气",
            sleepTime: "建议晚上9:30前入睡，早上7-8点起床",
        },
        exercise: {
            suitableActivities: ["室内活动", "太极", "八段锦", "轻微运动"],
        },
        emotion: {
            moodRegulation: "保持内心喜悦，避免悲伤",
            psychologicalCare: "静极生动，涵养元气",
        },
        recipes: [
            {
                id: 33,
                name: "人参鸡汤",
                image: "/images/recipes/ginseng-chicken-soup.jpg",
                effect: "大补元气",
                nature: "热性",
                ingredients: "人参15g、土鸡1只、红枣10枚",
                steps: "1. 土鸡处理干净\n2. 人参、红枣洗净\n3. 所有材料放入炖盅\n4. 隔水炖煮4小时，加盐调味",
                detailedEffect: "大补元气、复脉固脱，适合体虚者冬季进补",
                contraindications: "实热证者不宜，儿童慎用",
            },
            {
                id: 34,
                name: "羊肉饺子",
                image: "/images/recipes/lamb-dumplings.jpg",
                effect: "温中补虚",
                nature: "热性",
                ingredients: "羊肉500g、面粉500g、白菜300g、调料适量",
                steps: "1. 羊肉剁馅\n2. 白菜切碎挤水\n3. 调馅包饺\n4. 煮熟食用",
                detailedEffect: "温中散寒、补虚益气，是冬至传统美食",
                contraindications: "上火者不宜多食",
            },
        ],
    },
    {
        id: 23,
        name: "小寒",
        dateRange: "2027年1月5日 — 1月19日",
        healthSummary:
            "小寒在天为严寒、在地为冰冻、在人为肾阳。养生当以温阳散寒为要，宜温热、勿寒冷、戒生冷。数九寒天，保暖第一。",
        diet: {
            recommendations: [
                "多食辣椒、花椒、胡椒等温热食物",
                "推荐附子、干姜煲汤以回阳救逆",
            ],
            suitableFoods: ["辣椒", "花椒", "胡椒", "附子", "干姜"],
        },
        lifestyle: {
            scheduleAdvice: "早睡晚起，注意全身保暖",
            sleepTime: "建议晚上9:30前入睡，早上7-8点起床",
        },
        exercise: {
            suitableActivities: ["室内运动", "热身运动", "太极", "缓和锻炼"],
        },
        emotion: {
            moodRegulation: "保持热情，避免冷漠",
            psychologicalCare: "温暖内心，驱散寒意",
        },
        recipes: [
            {
                id: 35,
                name: "麻辣火锅",
                image: "/images/recipes/spicy-hotpot.jpg",
                effect: "温阳散寒",
                nature: "热性",
                ingredients: "辣椒50g、花椒30g、各种食材适量",
                steps: "1. 准备底料\n2. 炒制火锅底料\n3. 加水煮沸\n4. 涮煮各种食材",
                detailedEffect: "温中散寒、活血通络，适合冬季食用",
                contraindications: "上火、痔疮患者不宜",
            },
            {
                id: 36,
                name: "胡椒猪肚汤",
                image: "/images/recipes/pepper-stomach-soup.jpg",
                effect: "温中散寒",
                nature: "热性",
                ingredients: "白胡椒20g、猪肚1个、姜片适量",
                steps: "1. 猪肚处理干净\n2. 白胡椒捣碎\n3. 所有材料放入锅中\n4. 炖煮2-3小时，加盐调味",
                detailedEffect: "温中散寒、健脾养胃，适合胃寒者",
                contraindications: "胃热者不宜",
            },
        ],
    },
    {
        id: 24,
        name: "大寒",
        dateRange: "2027年1月20日 — 2月3日",
        healthSummary:
            "大寒在天为极寒、在地为凝固、在人为肾气。养生当以固肾保暖为要，宜大温、勿极寒、戒泄耗。寒冬将尽，静待春归。",
        diet: {
            recommendations: [
                "多食糯米、红枣、桂圆等温补食物",
                "推荐肉桂、吴茱萸煮水以温肾助阳",
            ],
            suitableFoods: ["糯米", "红枣", "桂圆", "肉桂", "吴茱萸"],
        },
        lifestyle: {
            scheduleAdvice: "早睡晚起，防寒保暖",
            sleepTime: "建议晚上9:30前入睡，早上7-8点起床",
        },
        exercise: {
            suitableActivities: ["室内活动", "温和运动", "伸展操", "气功"],
        },
        emotion: {
            moodRegulation: "保持希望，期待春天",
            psychologicalCare: "守得云开见月明，静待春暖花开",
        },
        recipes: [
            {
                id: 37,
                name: "八宝饭",
                image: "/images/recipes/eight-treasure-rice.jpg",
                effect: "温补气血",
                nature: "温性",
                ingredients:
                    "糯米500g、红枣50g、桂圆50g、莲子30g、百合30g、薏米30g、红豆30g、绿豆30g",
                steps: "1. 糯米浸泡过夜\n2. 各种材料准备好\n3. 糯米蒸熟\n4. 铺上各种果料\n5. 再蒸30分钟即可",
                detailedEffect: "补益气血、健脾养胃，是传统节日食品",
                contraindications: "糖尿病患者不宜多食",
            },
            {
                id: 38,
                name: "肉桂奶茶",
                image: "/images/recipes/cinnamon-milk-tea.jpg",
                effect: "温肾助阳",
                nature: "热性",
                ingredients: "肉桂粉5g、红茶10g、牛奶200ml、红糖适量",
                steps: "1. 红茶冲泡\n2. 加入热牛奶\n3. 撒入肉桂粉\n4. 加入红糖调味",
                detailedEffect: "温肾助阳、暖胃散寒，适合冬季饮用",
                contraindications: "阴虚火旺者不宜",
            },
        ],
    },
]);

// 当前选中的节气（默认为立夏）
const currentSolarTermId = ref(7);
const activeTab = ref("diet");
const dialogVisible = ref(false);
const selectedRecipe = ref<Recipe | null>(null);

// 计算当前节气
const currentSolarTerm = computed<SolarTerm>(() => {
    return (
        solarTerms.value.find((term) => term.id === currentSolarTermId.value) ||
        solarTerms.value[0]!
    );
});

// 切换节气
const switchSolarTerm = (term: SolarTerm) => {
    currentSolarTermId.value = term.id;
    activeTab.value = "diet"; // 重置为饮食tab
};

// 显示食谱详情
const showRecipeDetail = (recipe: Recipe) => {
    selectedRecipe.value = recipe;
    dialogVisible.value = true;
};

// 处理图片加载错误
const handleImageError = (event: Event, recipeName: string) => {
    const target = event.target as HTMLImageElement;
    // 阻止默认错误处理
    event.preventDefault();
    event.stopPropagation();

    // 创建一个占位div替换img元素
    const placeholder = document.createElement("div");
    placeholder.style.width = "100%";
    placeholder.style.height = "100%";
    placeholder.style.background =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    placeholder.style.display = "flex";
    placeholder.style.alignItems = "center";
    placeholder.style.justifyContent = "center";
    placeholder.style.color = "white";
    placeholder.style.fontSize = "14px";
    placeholder.style.borderRadius = "4px";
    placeholder.textContent = recipeName;

    // 替换img元素
    if (target.parentNode) {
        target.parentNode.replaceChild(placeholder, target);
    }
};
</script>

<style scoped lang="scss">
.solar-term-knowledge {
    .main-card-section {
        margin-bottom: 30px;

        .main-card {
            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;

                h2 {
                    margin: 0;
                    color: #333;
                    font-size: 24px;
                }

                .date-range {
                    color: #999;
                    font-size: 14px;
                }
            }

            .card-content {
                .health-summary {
                    font-size: 16px;
                    line-height: 1.8;
                    color: #666;
                    margin: 0;
                }
            }
        }
    }

    .navigation-section {
        margin-bottom: 30px;

        .nav-container {
            background: #fff;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            .solar-term-nav {
                display: flex;
                gap: 10px;
                flex-wrap: nowrap;

                .nav-button {
                    white-space: nowrap;
                }
            }
        }
    }

    .health-points-section {
        margin-bottom: 30px;

        .health-points-card {
            .card-header {
                h3 {
                    margin: 0;
                    color: #333;
                }
            }

            .health-tabs {
                .tab-content {
                    padding: 20px 0;

                    h4 {
                        color: #409eff;
                        margin-top: 20px;
                        margin-bottom: 10px;

                        &:first-child {
                            margin-top: 0;
                        }
                    }

                    ul {
                        list-style-type: disc;
                        padding-left: 20px;
                        margin: 10px 0;

                        li {
                            margin-bottom: 8px;
                            line-height: 1.6;
                        }
                    }

                    .no-info {
                        color: #999;
                        font-style: italic;
                        margin: 10px 0;
                    }
                }
            }
        }
    }

    .recipe-section {
        .recipe-card {
            .card-header {
                h3 {
                    margin: 0;
                    color: #333;
                }
            }

            .recipe-grid {
                .recipe-item {
                    cursor: pointer;
                    transition: all 0.3s ease;
                    height: 100%;

                    &:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    }

                    .recipe-image {
                        width: 100%;
                        height: 150px;
                        overflow: hidden;
                        border-radius: 4px;
                        margin-bottom: 10px;

                        img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
                    }

                    .recipe-info {
                        h4 {
                            margin: 0 0 8px 0;
                            color: #333;
                            font-size: 16px;
                        }

                        .recipe-effect {
                            margin: 0 0 8px 0;
                            color: #666;
                            font-size: 14px;
                        }

                        .recipe-nature {
                            display: inline-block;
                            padding: 2px 8px;
                            border-radius: 12px;
                            font-size: 12px;
                            font-weight: bold;

                            &.微寒 {
                                background-color: #e3f2fd;
                                color: #1976d2;
                            }

                            &.凉性 {
                                background-color: #e8f5e8;
                                color: #388e3c;
                            }

                            &.温性 {
                                background-color: #fff3e0;
                                color: #f57c00;
                            }

                            &.寒性 {
                                background-color: #fce4ec;
                                color: #c2185b;
                            }

                            &.热性 {
                                background-color: #ffebee;
                                color: #d32f2f;
                            }
                        }
                    }
                }
            }
        }
    }

    .recipe-detail {
        .detail-image {
            width: 100%;
            height: 200px;
            margin-bottom: 20px;
            border-radius: 8px;
            overflow: hidden;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .detail-content {
            h4 {
                color: #409eff;
                margin-top: 15px;
                margin-bottom: 8px;

                &:first-child {
                    margin-top: 0;
                }
            }

            p {
                margin: 0 0 15px 0;
                line-height: 1.6;
                color: #666;
            }
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .solar-term-knowledge {
        .main-card-section {
            .main-card {
                .card-header {
                    flex-direction: column;
                    align-items: flex-start;

                    .date-range {
                        margin-top: 5px;
                    }
                }
            }
        }

        .navigation-section {
            .nav-container {
                .solar-term-nav {
                    .nav-button {
                        font-size: 12px;
                        padding: 8px 12px;
                    }
                }
            }
        }
    }
}
</style>
