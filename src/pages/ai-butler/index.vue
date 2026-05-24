<template>
    <div class="page-wrapper">
        <HeaderLayout />

        <main class="hub">
            <!-- Slim Hero -->
            <section class="hero">
                <div class="hero-text">
                    <div class="hero-label">AI WELLNESS STEWARD · 私人养生 AI 助理</div>
                    <h1 class="font-serif">AI 管家</h1>
                    <p class="hero-sub">小荷，立夏快乐 ☀️ 我可以帮你<strong style="color:var(--jade);">答养生疑问、做个性化计划、推荐适合的好物</strong> —— 在同一段对话里都能完成。</p>
                </div>
                <div class="hero-meta">
                    <span class="meta-item">💬 今日 <strong>3 次</strong></span>
                    <span class="meta-item">🌿 计划 <strong>第 14 / 30 天</strong></span>
                    <span class="meta-item">⭐ 完成率 <strong>78%</strong></span>
                </div>
            </section>

            <div class="chat-app">
                <!-- Left Sidebar -->
                <aside class="side">
                    <div class="side-section">
                        <button class="new-chat-btn" @click="newChat">＋ 开启新对话</button>
                    </div>

                    <div class="side-section">
                        <div class="side-title">AI 管家可以帮你</div>

                        <div class="cap-item qa">
                            <div class="cap-head"><div class="ico">💬</div><h6>回答养生问题</h6></div>
                            <div class="desc">基于平台知识库的多轮问答，附文章引用</div>
                            <button class="example" @click="send('立夏怎么养心？')">💡 立夏怎么养心？</button>
                        </div>

                        <div class="cap-item plan">
                            <div class="cap-head"><div class="ico">🌿</div><h6>制定个性化养生计划</h6></div>
                            <div class="desc">饮食 / 节气 / 睡眠 / 运动 四维一键生成</div>
                            <button class="example" @click="send('给我做一份立夏养心 7 天计划')">🌿 给我做一份 7 天计划</button>
                        </div>

                        <div class="cap-item reco">
                            <div class="cap-head"><div class="ico">🛒</div><h6>推荐适合你的商品</h6></div>
                            <div class="desc">综合体质 / 节气 / 计划三维度选品并解释理由</div>
                            <button class="example" @click="send('推荐一些适合江南体质的养心好物')">🛒 推荐养心好物</button>
                        </div>
                    </div>

                    <div class="side-section">
                        <div class="side-title">我的偏好（个性化基础）</div>
                        <div class="profile-chip" @click="toast('⚙ 打开偏好设置抽屉（演示）')">
                            <div class="prow"><span>体质</span><span>江南 · 气虚偏湿</span></div>
                            <div class="prow"><span>目标</span><span>养心 · 祛湿</span></div>
                            <div class="prow"><span>过敏</span><span>花生 · 芒果</span></div>
                            <div class="prow"><span>所在地</span><span>江浙</span></div>
                            <div class="edit">⚙ 编辑我的偏好</div>
                        </div>
                    </div>

                    <div class="side-section">
                        <div class="side-title">历史对话</div>
                        <div class="history-list">
                            <div class="history-group">今天</div>
                            <div class="history-item" :class="{ active: activeHistory === 0 }" @click="activeHistory = 0">
                                <h6>立夏养心 + 7 天计划</h6>
                                <div class="time">14:32</div>
                            </div>
                            <div class="history-item" :class="{ active: activeHistory === 1 }" @click="activeHistory = 1">
                                <h6>气虚体质能吃当归吗</h6>
                                <div class="time">11:08</div>
                            </div>
                            <div class="history-group">本周</div>
                            <div class="history-item" :class="{ active: activeHistory === 2 }" @click="activeHistory = 2">
                                <h6>湿气重怎么调理</h6>
                                <div class="time">昨天</div>
                            </div>
                            <div class="history-item" :class="{ active: activeHistory === 3 }" @click="activeHistory = 3">
                                <h6>八段锦哪一式护肝</h6>
                                <div class="time">前天</div>
                            </div>
                            <div class="history-item" :class="{ active: activeHistory === 4 }" @click="activeHistory = 4">
                                <h6>夏天泡什么茶最养生</h6>
                                <div class="time">5月22日</div>
                            </div>
                        </div>
                    </div>
                </aside>

                <!-- Main chat -->
                <div class="main">
                    <div class="chat-body" ref="chatBodyEl">
                        <!-- Initial static messages -->
                        <template v-if="!isNewChat">
                            <div class="msg-row me">
                                <div class="msg-avatar user">荷</div>
                                <div class="bubble-wrap">
                                    <div class="bubble bub-me">立夏到了，我这种江南体质应该怎么养心呀？</div>
                                </div>
                            </div>

                            <div class="msg-row">
                                <div class="msg-avatar ai">智</div>
                                <div class="bubble-wrap">
                                    <span class="bub-tag">AI 管家 · 回答问题</span>
                                    <div class="bubble bub-ai">
                                        立夏时节人体心阳偏旺。结合你的<strong style="color:var(--jade);">江南体质（气虚偏湿）</strong>，养心建议从这三方面：<br><br>
                                        <strong>① 饮食</strong>：清淡、多吃红色养心食材（红豆、桂圆、莲子），少吃生冷油腻。<br>
                                        <strong>② 作息</strong>：晚睡早起（22:30 - 06:30），中午小憩 20 分钟养心阳。<br>
                                        <strong>③ 运动</strong>：避免大汗淋漓，推荐八段锦、太极、傍晚散步。
                                        <div class="artifact-citations">
                                            <div class="citation-card">
                                                <div class="ico">📜</div>
                                                <div class="info"><h6>立夏养心三要点 · 张景行</h6><div class="meta">养生智库 · 节气专题</div></div>
                                                <div class="arrow">›</div>
                                            </div>
                                            <div class="citation-card">
                                                <div class="ico" style="background:var(--jade-soft);color:var(--jade);">🌿</div>
                                                <div class="info"><h6>江南体质 · 调养手册</h6><div class="meta">养生智库 · 体质辨识</div></div>
                                                <div class="arrow">›</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="msg-actions">
                                        <button class="msg-action" @click="toast('感谢反馈 🙏')">👍 有用</button>
                                        <button class="msg-action" @click="toast('已收到，AI 会改进')">👎</button>
                                        <button class="msg-action" @click="toast('🔄 AI 重新生成中…')">🔄 换一种说法</button>
                                        <button class="msg-action" @click="toast('⭐ 已收藏')">⭐ 收藏</button>
                                    </div>
                                </div>
                            </div>

                            <div class="msg-row me">
                                <div class="msg-avatar user">荷</div>
                                <div class="bubble-wrap">
                                    <div class="bubble bub-me">那就帮我做一份这周的养心计划吧</div>
                                </div>
                            </div>

                            <div class="msg-row full">
                                <div class="msg-avatar ai">智</div>
                                <div class="bubble-wrap">
                                    <span class="bub-tag" style="background:var(--gold-soft);color:var(--gold-deep);">AI 管家 · 制定计划</span>
                                    <div class="bubble bub-ai">
                                        已综合你的体质、立夏节气和近 7 天打卡数据，为你生成下面这份 7 天养心计划。可以一键加入打卡、随时让我替换某一项。

                                        <div class="artifact-plan">
                                            <div class="artifact-head">
                                                <span class="seal">7 天计划</span>
                                                <h5>立夏养心 · 个性化养生方案</h5>
                                                <div class="meta">5/5 - 5/11 · 江南体质</div>
                                            </div>
                                            <div class="plan-dims">
                                                <div class="plan-dim diet">
                                                    <div class="dim-head"><div class="ico">🍵</div>饮食</div>
                                                    <div class="row"><span class="t">早餐</span><span class="c"><strong>莲子百合粥</strong> · 黄芪枸杞茶</span></div>
                                                    <div class="row"><span class="t">午餐</span><span class="c"><strong>薏米山药排骨汤</strong> · 时蔬</span></div>
                                                    <div class="row"><span class="t">晚餐</span><span class="c"><strong>小米南瓜粥</strong> · 凉拌木耳</span></div>
                                                    <div class="row"><span class="t">忌口</span><span class="c" style="color:var(--cinnabar);">冰镇饮料 / 辛辣火锅 / 生冷海鲜</span></div>
                                                </div>
                                                <div class="plan-dim solar">
                                                    <div class="dim-head"><div class="ico">🌿</div>节气调养</div>
                                                    <div class="row"><span class="t">主调</span><span class="c"><strong>养心阳，护脾胃</strong></span></div>
                                                    <div class="row"><span class="t">情志</span><span class="c">戒怒戒躁，心情舒畅</span></div>
                                                    <div class="row"><span class="t">穴位</span><span class="c">每日按揉 <strong>内关 · 神门</strong> 各 3 分钟</span></div>
                                                    <div class="row"><span class="t">茶饮</span><span class="c">麦冬玉竹茶（养心阴）</span></div>
                                                </div>
                                                <div class="plan-dim sleep">
                                                    <div class="dim-head"><div class="ico">🌙</div>睡眠</div>
                                                    <div class="row"><span class="t">就寝</span><span class="c"><strong>22:30 - 23:00</strong></span></div>
                                                    <div class="row"><span class="t">起床</span><span class="c"><strong>06:30</strong> 顺应阳气升发</span></div>
                                                    <div class="row"><span class="t">午休</span><span class="c">12:30 小憩 20-30 分钟</span></div>
                                                    <div class="row"><span class="t">睡前</span><span class="c">温水泡脚 15 分钟，加艾叶</span></div>
                                                </div>
                                                <div class="plan-dim exercise">
                                                    <div class="dim-head"><div class="ico">🧘</div>运动</div>
                                                    <div class="row"><span class="t">每日</span><span class="c"><strong>八段锦 15 分钟</strong>（早间 6:45）</span></div>
                                                    <div class="row"><span class="t">周三六</span><span class="c">傍晚快走 30 分钟（19:00 后）</span></div>
                                                    <div class="row"><span class="t">周末</span><span class="c">瑜伽 / 太极任选 45 分钟</span></div>
                                                    <div class="row"><span class="t">提醒</span><span class="c" style="color:var(--cinnabar);">避免大汗后立即洗冷水澡</span></div>
                                                </div>
                                            </div>
                                            <div class="artifact-actions">
                                                <button class="btn-sm gold" @click="toast('📌 已加入元气社区打卡')">📌 加入元气社区每日打卡</button>
                                                <button class="btn-sm ghost" @click="toast('🔄 重新生成中…')">🔄 重新生成</button>
                                                <button class="btn-sm ghost" @click="toast('✏️ 进入微调模式')">✏️ 微调</button>
                                                <button class="btn-sm ghost" @click="toast('📤 生成分享海报')">📤 分享海报</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="msg-row me">
                                <div class="msg-avatar user">荷</div>
                                <div class="bubble-wrap">
                                    <div class="bubble bub-me">这个计划用得上的食材推荐我买几个？</div>
                                </div>
                            </div>

                            <div class="msg-row full">
                                <div class="msg-avatar ai">智</div>
                                <div class="bubble-wrap">
                                    <span class="bub-tag" style="background:var(--pink-soft);color:var(--pink);">AI 管家 · 智能推荐</span>
                                    <div class="bubble bub-ai">
                                        基于你的方案 + 江南体质 + 立夏节气，从平台精选了 4 款好物。每件下方都说明了"为什么推给你"。

                                        <div class="artifact-recos">
                                            <div class="reco-grid">
                                                <div class="reco-card">
                                                    <div class="thumb" style="background:linear-gradient(135deg,var(--jade-soft),var(--gold-soft));">🌸</div>
                                                    <div class="body">
                                                        <h6>有机莲子 500g · 福建建宁</h6>
                                                        <div class="reason">你的早餐"莲子百合粥"需要</div>
                                                        <div class="price-row"><span class="price">¥48</span><button class="add-btn" @click="addToCart($event)">+ 加购</button></div>
                                                    </div>
                                                </div>
                                                <div class="reco-card">
                                                    <div class="thumb" style="background:linear-gradient(135deg,var(--bamboo-soft),var(--jade-soft));">🍵</div>
                                                    <div class="body">
                                                        <h6>麦冬玉竹养心茶 · 立夏限定</h6>
                                                        <div class="reason">就是你方案里的茶饮</div>
                                                        <div class="price-row"><span class="price">¥98</span><button class="add-btn" @click="addToCart($event)">+ 加购</button></div>
                                                    </div>
                                                </div>
                                                <div class="reco-card">
                                                    <div class="thumb" style="background:linear-gradient(135deg,var(--gold-soft),var(--bamboo-soft));">🌿</div>
                                                    <div class="body">
                                                        <h6>艾叶足浴包 · 12 袋</h6>
                                                        <div class="reason">你的方案"睡前泡脚"</div>
                                                        <div class="price-row"><span class="price">¥38</span><button class="add-btn" @click="addToCart($event)">+ 加购</button></div>
                                                    </div>
                                                </div>
                                                <div class="reco-card">
                                                    <div class="thumb" style="background:linear-gradient(135deg,var(--gold-soft),var(--jade-soft));">🌾</div>
                                                    <div class="body">
                                                        <h6>黄芪片 250g · 内蒙古道地</h6>
                                                        <div class="reason">补气虚 + 早餐茶饮可用</div>
                                                        <div class="price-row"><span class="price">¥88</span><button class="add-btn" @click="addToCart($event)">+ 加购</button></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="artifact-actions" style="margin-top:12px;">
                                                <button class="btn-sm" @click="toast('🛒 已全部加入购物车')">🛒 全部加入购物车（¥272）</button>
                                                <button class="btn-sm ghost" @click="toast('🔄 重新选品中…')">🔄 换一组</button>
                                                <button class="btn-sm ghost" @click="toast('已标记不感兴趣')">🚫 不感兴趣</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="msg-row me">
                                <div class="msg-avatar user">荷</div>
                                <div class="bubble-wrap">
                                    <div class="bubble bub-me">对了，我最近还有点胸闷，会不会是心脏出问题了？</div>
                                </div>
                            </div>

                            <div class="msg-row">
                                <div class="msg-avatar ai">智</div>
                                <div class="bubble-wrap">
                                    <span class="bub-tag" style="background:var(--cinnabar-soft);color:var(--cinnabar);">AI 管家 · 转专家</span>
                                    <div class="bubble bub-ai">
                                        胸闷可能与多种原因有关，<strong>具体诊断需由专业医师判断</strong>。AI 不作医疗结论，但我可以帮你直接转到名医健康圈，由医师团队的 AI 先做预问诊：
                                        <div class="handoff-card">
                                            <h6>🩺 该问题建议向医师咨询</h6>
                                            <p>胸闷涉及心血管判断。你可以前往「名医健康圈」向擅长该方向的医师咨询，医师那一侧会有专属 AI 先帮你预问诊。</p>
                                            <button class="handoff-btn" @click="toast('→ 跳转到名医健康圈（演示）')">前往名医健康圈 →</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <!-- Dynamic messages -->
                        <template v-for="(msg, idx) in messages" :key="idx">
                            <div v-if="msg.kind === 'me'" class="msg-row me">
                                <div class="msg-avatar user">荷</div>
                                <div class="bubble-wrap">
                                    <div class="bubble bub-me">{{ msg.text }}</div>
                                </div>
                            </div>

                            <div v-else class="msg-row" :class="{ full: msg.cap === 'plan' || msg.cap === 'reco' }">
                                <div class="msg-avatar ai">智</div>
                                <div class="bubble-wrap">
                                    <span class="bub-tag" :style="msg.tagStyle">{{ msg.tagText }}</span>
                                    <div class="bubble bub-ai" v-html="msg.html"></div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- Quick prompts -->
                    <div class="quick-prompts">
                        <button class="quick-prompt" @click="send('给我做一份这个月的养生计划')"><span class="tagico">🌿</span> 做一份本月计划</button>
                        <button class="quick-prompt" @click="send('推荐适合气虚体质的药材')"><span class="tagico">🛒</span> 推荐适合的药材</button>
                        <button class="quick-prompt" @click="send('夏季失眠怎么调理')"><span class="tagico">💬</span> 失眠调理</button>
                        <button class="quick-prompt" @click="send('八段锦哪一式护肝')"><span class="tagico">💬</span> 八段锦护肝</button>
                        <button class="quick-prompt" @click="send('孩子积食怎么按摩')"><span class="tagico">💬</span> 小儿积食</button>
                        <button class="quick-prompt" @click="send('给我推荐节气养生礼盒')"><span class="tagico">🛒</span> 节气礼盒</button>
                    </div>

                    <!-- Input -->
                    <div class="chat-input-wrap">
                        <div class="chat-input-row">
                            <button class="icon-btn" title="语音输入" @click="toast('🎙 语音输入（演示）')">🎙</button>
                            <input type="text" v-model="chatInput" placeholder="问养生问题 / 让 AI 做计划 / 让 AI 推荐商品 —— 都在这里说" @keydown.enter="send()" />
                            <button class="icon-btn" title="附件" @click="toast('📎 附件（演示）')">📎</button>
                            <button class="send-btn" @click="send()">发送 →</button>
                        </div>
                        <div class="disclaimer">⚠️ AI 生成内容，仅供参考。涉及诊断 / 用药请咨询专业医师。</div>
                    </div>
                </div>
            </div>
        </main>

        <div class="toast" :class="{ show: toastVisible }">{{ toastMsg }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";
import HeaderLayout from "@/layouts/HeaderLayout.vue";

// ---- Keywords ----
const EMERGENCY = ['胸痛', '呼吸困难', '出血', '昏迷', '剧烈痛'];
const MEDICAL = ['胸闷', '头晕', '腹痛', '心悸', '皮疹', '诊断', '处方', '吃什么药'];
const PLAN = ['计划', '方案', '安排', '7 天', '一周', '本月', '怎么吃', '怎么作息'];
const RECO = ['推荐', '买', '购买', '商品', '药材', '茶', '礼盒'];

// ---- State ----
const chatInput = ref("");
const messages = ref<Message[]>([]);
const isNewChat = ref(false);
const activeHistory = ref(0);
const chatBodyEl = ref<HTMLElement | null>(null);

// ---- Toast ----
const toastVisible = ref(false);
const toastMsg = ref("");
let toastTimer: ReturnType<typeof setTimeout>;
function toast(msg: string) {
    toastMsg.value = msg;
    toastVisible.value = true;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastVisible.value = false; }, 1800);
}

// ---- Scroll ----
function scrollDown() {
    nextTick(() => {
        if (chatBodyEl.value) chatBodyEl.value.scrollTop = chatBodyEl.value.scrollHeight;
    });
}

// ---- Message types ----
interface Message {
    kind: 'me' | 'ai';
    text?: string;
    cap?: string;
    tagStyle?: string;
    tagText?: string;
    html?: string;
}

// ---- AI Response generators ----
function makePlanArtifact(): string {
    return `已综合你的体质、节气与作息为你生成方案：
      <div class="artifact-plan">
        <div class="artifact-head">
          <span class="seal">7 天计划</span>
          <h5>个性化养生方案</h5>
          <div class="meta">演示版</div>
        </div>
        <div class="plan-dims">
          <div class="plan-dim diet"><div class="dim-head"><div class="ico">🍵</div>饮食</div>
            <div class="row"><span class="t">早</span><span class="c">莲子百合粥</span></div>
            <div class="row"><span class="t">午</span><span class="c">薏米山药排骨汤</span></div>
            <div class="row"><span class="t">晚</span><span class="c">小米南瓜粥</span></div></div>
          <div class="plan-dim solar"><div class="dim-head"><div class="ico">🌿</div>节气</div>
            <div class="row"><span class="t">主调</span><span class="c">养心阳，护脾胃</span></div>
            <div class="row"><span class="t">穴位</span><span class="c">内关 · 神门</span></div></div>
          <div class="plan-dim sleep"><div class="dim-head"><div class="ico">🌙</div>睡眠</div>
            <div class="row"><span class="t">就寝</span><span class="c">22:30</span></div>
            <div class="row"><span class="t">起床</span><span class="c">06:30</span></div></div>
          <div class="plan-dim exercise"><div class="dim-head"><div class="ico">🧘</div>运动</div>
            <div class="row"><span class="t">每日</span><span class="c">八段锦 15 分钟</span></div></div>
        </div>
        <div class="artifact-actions">
          <button class="btn-sm gold">📌 加入打卡</button>
          <button class="btn-sm ghost">🔄 重新生成</button>
        </div>
      </div>`;
}

function makeRecoArtifact(): string {
    return `为你精选了几款，每件附推荐理由：
      <div class="artifact-recos">
        <div class="reco-grid">
          <div class="reco-card"><div class="thumb" style="background:var(--jade-soft);">🌸</div>
            <div class="body"><h6>有机莲子 500g</h6><div class="reason">养心首选</div>
            <div class="price-row"><span class="price">¥48</span><button class="add-btn">+ 加购</button></div></div></div>
          <div class="reco-card"><div class="thumb" style="background:var(--bamboo-soft);">🍵</div>
            <div class="body"><h6>麦冬玉竹养心茶</h6><div class="reason">立夏节气限定</div>
            <div class="price-row"><span class="price">¥98</span><button class="add-btn">+ 加购</button></div></div></div>
          <div class="reco-card"><div class="thumb" style="background:var(--gold-soft);">🌿</div>
            <div class="body"><h6>艾叶足浴包</h6><div class="reason">配合睡前泡脚</div>
            <div class="price-row"><span class="price">¥38</span><button class="add-btn">+ 加购</button></div></div></div>
          <div class="reco-card"><div class="thumb" style="background:var(--pink-soft);">🌾</div>
            <div class="body"><h6>黄芪片 250g</h6><div class="reason">补气虚体质</div>
            <div class="price-row"><span class="price">¥88</span><button class="add-btn">+ 加购</button></div></div></div>
        </div>
        <div class="artifact-actions" style="margin-top:12px;">
          <button class="btn-sm">🛒 全部加购</button>
          <button class="btn-sm ghost">🔄 换一组</button>
        </div>
      </div>`;
}

function makeHandoffArtifact(): string {
    return `这个问题已偏向医疗诊断范畴，AI 管家不作结论。建议你转到名医健康圈，由专业医师那一侧的 AI 先做预问诊：
      <div class="handoff-card">
        <h6>🩺 该问题建议向医师咨询</h6>
        <p>涉及医疗判断需要专业医师，AI 不作诊断。</p>
        <button class="handoff-btn">前往名医健康圈 →</button>
      </div>`;
}

function makeQAArtifact(): string {
    return `已收到。基于你的<strong>江南体质 + 立夏节气</strong>，我会从养生智库找出最相关的内容为你回答（演示）。
      <div class="artifact-citations">
        <div class="citation-card"><div class="ico">📜</div>
          <div class="info"><h6>相关文献</h6><div class="meta">养生智库</div></div><div class="arrow">›</div></div>
      </div>`;
}

function aiReply(userText: string) {
    let cap: string, tagStyle: string, tagText: string, html: string;

    if (EMERGENCY.some(k => userText.includes(k))) {
        cap = 'handoff';
        tagStyle = 'background:var(--cinnabar-soft);color:var(--cinnabar);';
        tagText = 'AI 管家 · 转专家';
        html = `⚠️ <strong style="color:var(--cinnabar);">检测到危急信号</strong>，请立即停止使用 AI 问答，<strong>线下就医或拨打 120</strong>。`;
    } else if (MEDICAL.some(k => userText.includes(k))) {
        cap = 'handoff';
        tagStyle = 'background:var(--cinnabar-soft);color:var(--cinnabar);';
        tagText = 'AI 管家 · 转专家';
        html = makeHandoffArtifact();
    } else if (PLAN.some(k => userText.includes(k))) {
        cap = 'plan';
        tagStyle = 'background:var(--gold-soft);color:var(--gold-deep);';
        tagText = 'AI 管家 · 制定计划';
        html = makePlanArtifact();
    } else if (RECO.some(k => userText.includes(k))) {
        cap = 'reco';
        tagStyle = 'background:var(--pink-soft);color:var(--pink);';
        tagText = 'AI 管家 · 智能推荐';
        html = makeRecoArtifact();
    } else {
        cap = 'qa';
        tagStyle = '';
        tagText = 'AI 管家 · 回答问题';
        html = makeQAArtifact();
    }

    messages.value.push({ kind: 'ai', cap, tagStyle, tagText, html });
    scrollDown();
}

function send(prefill?: string) {
    const text = (prefill || chatInput.value).trim();
    if (!text) return;
    messages.value.push({ kind: 'me', text });
    chatInput.value = '';
    scrollDown();
    setTimeout(() => aiReply(text), 600);
}

// ---- New chat ----
function newChat() {
    isNewChat.value = true;
    messages.value = [];
    toast('已开启新对话');
}

// ---- Delegated click handler for dynamic v-html content ----
onMounted(() => {
    chatBodyEl.value?.addEventListener('click', handleArtifactClick);
});

// ---- Add to cart ----
function addToCart(event: Event) {
    event.stopPropagation();
    const btn = event.target as HTMLButtonElement;
    btn.textContent = '✓ 已加购';
    btn.style.background = 'var(--bamboo)';
    toast('🛒 已加入购物车');
}

// ---- Handle artifact button clicks in dynamic content ----
function handleArtifactClick(event: Event) {
    const t = event.target as HTMLElement;
    if (t.classList.contains('add-btn')) {
        event.stopPropagation();
        t.textContent = '✓ 已加购';
        t.style.background = 'var(--bamboo)';
        toast('🛒 已加入购物车');
    } else if (t.classList.contains('handoff-btn')) {
        toast('→ 跳转到名医健康圈（演示）');
    } else if (t.classList.contains('btn-sm')) {
        const txt = t.textContent || '';
        if (txt.includes('打卡')) toast('📌 已加入元气社区打卡');
        else if (txt.includes('重新生成')) toast('🔄 重新生成中…');
        else if (txt.includes('全部加购')) toast('🛒 已全部加入购物车');
        else if (txt.includes('换一组')) toast('🔄 重新选品中…');
        else if (txt.includes('微调')) toast('✏️ 进入微调模式');
        else if (txt.includes('分享')) toast('📤 生成分享海报');
    }
}
</script>

<style scoped lang="scss">
.page-wrapper { min-height: 100vh; }

.hub { max-width: 1280px; margin: 0 auto; padding: 28px 40px 60px; }

// Hero
.hero {
    background: linear-gradient(135deg, #E4EFE8 0%, #EDF4EF 50%, #FDFAF3 100%);
    border: 1px solid var(--jade-soft);
    border-radius: 18px; padding: 24px 32px; margin-bottom: 20px;
    position: relative; overflow: hidden;
    display: flex; align-items: center; gap: 24px;
}
.hero::before {
    content: '智'; position: absolute; right: 36px; top: 50%; transform: translateY(-50%);
    font-family: "STKaiti", serif; font-size: 150px;
    color: var(--jade); opacity: 0.12; line-height: 1; font-weight: 900;
}
.hero-text { flex: 1; z-index: 1; }
.hero-label { font-size: 12px; color: var(--jade); letter-spacing: 3px; margin-bottom: 4px; }
.hero h1 { font-family: "STKaiti", serif; font-size: 26px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
.hero-sub { color: var(--ink-muted); font-size: 13px; }
.hero-meta { display: flex; gap: 20px; font-size: 12px; flex-wrap: wrap; z-index: 1; }
.meta-item { display: flex; align-items: center; gap: 6px; color: var(--ink-muted); }
.meta-item strong { color: var(--jade); font-weight: 600; }

// Chat App
.chat-app {
    background: var(--paper); border-radius: 16px; box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4); overflow: hidden;
    display: grid; grid-template-columns: 280px 1fr; min-height: 720px;
}

// Sidebar
.side {
    background: var(--paper-warm); border-right: 1px solid var(--line-soft);
    display: flex; flex-direction: column;
}
.side-section { padding: 16px; border-bottom: 1px solid var(--line-soft); }
.side-section:last-child { border-bottom: none; flex: 1; overflow-y: auto; }
.side-title {
    font-family: "STKaiti", serif; font-size: 13px; color: var(--ink-muted);
    margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
    letter-spacing: 1px;
}
.side-title::before {
    content: ''; width: 3px; height: 12px; background: var(--jade); border-radius: 2px;
}
.new-chat-btn {
    width: 100%; background: var(--jade); color: white; border: none;
    padding: 10px; border-radius: 10px; font-family: inherit;
    font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
}
.new-chat-btn:hover { background: var(--ink); }

.cap-item {
    background: var(--paper); border: 1px solid var(--line); border-radius: 10px;
    padding: 10px 12px; margin-bottom: 8px; cursor: default; transition: all .2s;
}
.cap-item:last-child { margin-bottom: 0; }
.cap-item .cap-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.cap-item .ico {
    width: 26px; height: 26px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;
}
.cap-item.qa .ico { background: var(--jade-soft); color: var(--jade); }
.cap-item.plan .ico { background: var(--gold-soft); color: var(--gold-deep); }
.cap-item.reco .ico { background: var(--pink-soft); color: var(--pink); }
.cap-item h6 { font-size: 13px; color: var(--ink); font-weight: 600; }
.cap-item .desc { font-size: 11px; color: var(--ink-muted); margin-bottom: 6px; line-height: 1.5; }
.cap-item .example {
    font-size: 11px; color: var(--jade); cursor: pointer; padding: 4px 8px;
    background: var(--paper-warm); border-radius: 6px; display: inline-block;
    transition: all .2s; font-family: inherit; border: 1px solid transparent;
}
.cap-item .example:hover { background: var(--jade-soft); border-color: var(--jade-light); }

.history-list { display: flex; flex-direction: column; gap: 2px; }
.history-group { font-size: 11px; color: var(--ink-muted); padding: 8px 10px 4px; font-family: "STKaiti", serif; }
.history-item {
    padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: all .2s;
}
.history-item:hover { background: var(--paper); }
.history-item.active { background: var(--paper); border-left: 3px solid var(--jade); padding-left: 7px; }
.history-item h6 {
    font-size: 12px; font-weight: 600; color: var(--ink);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;
}
.history-item .time { font-size: 10px; color: var(--ink-muted); }

.profile-chip {
    background: var(--paper); border: 1px solid var(--line); border-radius: 10px;
    padding: 12px; cursor: pointer; transition: all .2s;
}
.profile-chip:hover { box-shadow: var(--shadow); }
.profile-chip .prow {
    display: flex; justify-content: space-between; font-size: 12px;
    padding: 3px 0; color: var(--ink-soft);
}
.profile-chip .prow span:first-child { color: var(--ink-muted); }
.profile-chip .edit {
    text-align: center; color: var(--jade); font-size: 11px;
    margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--line);
    font-family: "STKaiti", serif;
}

// Main chat
.main {
    background: linear-gradient(to bottom, var(--cream) 0%, var(--paper-warm) 100%);
    display: flex; flex-direction: column;
}
.chat-body {
    flex: 1; padding: 28px 36px; overflow-y: auto;
    display: flex; flex-direction: column; gap: 22px;
    max-height: 600px;
}
.msg-row { display: flex; gap: 14px; max-width: 92%; }
.msg-row.me { align-self: flex-end; flex-direction: row-reverse; }
.msg-row.full { max-width: 100%; }
.msg-avatar {
    width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 600;
}
.msg-avatar.ai {
    background: linear-gradient(135deg, var(--jade), var(--jade-light));
    color: white; font-family: "STKaiti", serif;
}
.msg-avatar.user { background: var(--gold-soft); color: var(--gold-deep); }
.bubble-wrap { display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1; }
.msg-row.me .bubble-wrap { align-items: flex-end; }
.bub-tag {
    display: inline-block; font-size: 10px; padding: 1px 8px; border-radius: 4px;
    background: var(--jade-soft); color: var(--jade); font-weight: 600;
}
.bubble {
    padding: 14px 18px; border-radius: 14px; font-size: 14px; line-height: 1.75;
    box-shadow: 0 1px 4px rgba(60, 50, 30, 0.04);
}
.bub-ai { background: var(--paper); color: var(--ink); border: 1px solid var(--line); border-top-left-radius: 4px; }
.bub-me { background: var(--jade); color: white; border-top-right-radius: 4px; }

.msg-actions { display: flex; gap: 6px; margin-top: 4px; }
.msg-action {
    background: transparent; border: 1px solid var(--line); border-radius: 6px;
    padding: 3px 9px; font-family: inherit; color: var(--ink-muted); cursor: pointer;
    transition: all .2s; font-size: 11px;
}
.msg-action:hover { background: var(--cream); color: var(--ink); border-color: var(--ink-muted); }

// Citations
.artifact-citations { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
.citation-card {
    background: var(--paper-warm); border-radius: 10px; padding: 8px 12px;
    display: flex; align-items: center; gap: 10px; border-left: 3px solid var(--gold);
    cursor: pointer; transition: all .2s;
}
.citation-card:hover { background: var(--gold-soft); }
.citation-card .ico {
    width: 26px; height: 26px; border-radius: 6px; background: var(--gold-soft);
    color: var(--gold-deep); display: flex; align-items: center; justify-content: center;
    font-size: 13px; flex-shrink: 0;
}
.citation-card .info { flex: 1; min-width: 0; }
.citation-card .info h6 { font-size: 12px; color: var(--ink); margin-bottom: 2px; }
.citation-card .info .meta { font-size: 11px; color: var(--ink-muted); }
.citation-card .arrow { color: var(--ink-muted); }

// Plan artifact
.artifact-plan {
    background: linear-gradient(135deg, #FDFAF3 0%, #EDF4EF 100%);
    border: 1.5px solid var(--jade-light); border-radius: 14px;
    padding: 18px; margin-top: 12px;
}
.artifact-head {
    display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
    padding-bottom: 10px; border-bottom: 1px dashed var(--line);
}
.artifact-head .seal {
    background: var(--jade); color: white; border-radius: 6px;
    padding: 3px 10px; font-size: 11px; font-weight: 600;
    font-family: "STKaiti", serif;
}
.artifact-head h5 { font-family: "STKaiti", serif; font-size: 16px; flex: 1; }
.artifact-head .meta { font-size: 11px; color: var(--ink-muted); }

.plan-dims { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.plan-dim {
    background: var(--paper); border: 1px solid var(--line); border-radius: 10px;
    padding: 12px 14px;
}
.plan-dim .dim-head {
    display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
    font-family: "STKaiti", serif; font-size: 13px; font-weight: 600;
}
.plan-dim .ico {
    width: 24px; height: 24px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center; font-size: 13px;
}
.plan-dim.diet .ico { background: var(--gold-soft); color: var(--gold-deep); }
.plan-dim.solar .ico { background: var(--jade-soft); color: var(--jade); }
.plan-dim.sleep .ico { background: var(--moon-soft); color: var(--moon); }
.plan-dim.exercise .ico { background: var(--bamboo-soft); color: var(--bamboo); }
.plan-dim .row {
    font-size: 12px; padding: 4px 0; color: var(--ink-soft); line-height: 1.6;
    display: flex; gap: 6px; align-items: flex-start;
}
.plan-dim .row .t {
    font-family: "STKaiti", serif; color: var(--ink-muted); flex-shrink: 0; width: 36px;
}
.plan-dim .row .c strong { color: var(--ink); }

.artifact-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.artifact-actions .btn-sm {
    background: var(--jade); color: white; border: none; border-radius: 18px;
    padding: 6px 14px; font-size: 12px; cursor: pointer; font-family: inherit; font-weight: 500;
    display: inline-flex; align-items: center; gap: 4px;
}
.artifact-actions .btn-sm:hover { background: var(--ink); }
.artifact-actions .btn-sm.ghost { background: transparent; border: 1px solid var(--jade); color: var(--jade); }
.artifact-actions .btn-sm.ghost:hover { background: var(--jade-soft); }
.artifact-actions .btn-sm.gold { background: linear-gradient(135deg, var(--gold), var(--gold-deep)); }

// Product reco
.artifact-recos {
    background: var(--paper-warm); border-radius: 14px; padding: 14px;
    margin-top: 12px; border: 1px solid var(--line);
}
.reco-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.reco-card {
    background: var(--paper); border: 1px solid var(--line); border-radius: 10px;
    overflow: hidden; cursor: pointer; transition: all .2s; display: flex; flex-direction: column;
}
.reco-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.reco-card .thumb {
    height: 70px; display: flex; align-items: center; justify-content: center; font-size: 32px;
}
.reco-card .body { padding: 8px 10px; flex: 1; display: flex; flex-direction: column; }
.reco-card h6 { font-size: 12px; line-height: 1.4; margin-bottom: 4px; }
.reco-card .reason {
    font-size: 10px; color: var(--ink-muted); margin-bottom: 6px;
    line-height: 1.4; padding-left: 6px; border-left: 2px solid var(--jade);
}
.reco-card .price-row { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.reco-card .price { color: var(--cinnabar); font-family: "STKaiti", serif; font-size: 14px; font-weight: 700; }
.reco-card .add-btn {
    background: var(--jade); color: white; border: none; border-radius: 5px;
    padding: 3px 8px; font-size: 10px; cursor: pointer; font-family: inherit;
}
.reco-card .add-btn:hover { background: var(--ink); }

// Handoff
.handoff-card {
    background: linear-gradient(135deg, #FBEEF1 0%, var(--cinnabar-soft) 100%);
    border: 1.5px dashed var(--cinnabar); border-radius: 12px;
    padding: 14px; margin-top: 12px;
}
.handoff-card h6 { font-family: "STKaiti", serif; font-size: 13px; color: var(--cinnabar); margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
.handoff-card p { font-size: 12px; color: var(--ink-soft); margin-bottom: 10px; line-height: 1.6; }
.handoff-btn {
    background: var(--cinnabar); color: white; border: none; border-radius: 18px;
    padding: 6px 14px; font-size: 12px; cursor: pointer; font-family: inherit; font-weight: 600;
}

// Quick prompts
.quick-prompts {
    padding: 10px 36px; background: var(--paper);
    display: flex; gap: 8px; overflow-x: auto; border-top: 1px solid var(--line-soft);
}
.quick-prompts::-webkit-scrollbar { height: 4px; }
.quick-prompts::-webkit-scrollbar-thumb { background: var(--line); border-radius: 2px; }
.quick-prompt {
    flex-shrink: 0; padding: 6px 14px; background: var(--cream);
    border: 1px solid var(--line); border-radius: 14px; font-size: 12px;
    color: var(--ink-soft); cursor: pointer; transition: all .2s; font-family: inherit;
    display: inline-flex; align-items: center; gap: 4px;
}
.quick-prompt:hover { background: var(--jade-soft); border-color: var(--jade); color: var(--jade); }
.quick-prompt .tagico { font-size: 11px; }

// Chat Input
.chat-input-wrap { background: var(--paper); border-top: 1px solid var(--line-soft); padding: 14px 36px 18px; }
.chat-input-row {
    background: var(--paper-warm); border: 1.5px solid var(--line); border-radius: 14px;
    display: flex; gap: 8px; align-items: center; padding: 8px 12px;
}
.chat-input-row:focus-within { border-color: var(--jade); box-shadow: 0 0 0 3px rgba(92, 131, 116, 0.1); }
.chat-input-row input {
    flex: 1; border: none; outline: none; padding: 8px;
    font-size: 14px; font-family: inherit; background: transparent;
}
.chat-input-row input::placeholder { color: var(--ink-muted); }
.icon-btn {
    width: 32px; height: 32px; border-radius: 8px; background: transparent;
    border: none; cursor: pointer; font-size: 16px; color: var(--ink-muted);
    display: flex; align-items: center; justify-content: center; transition: all .2s;
}
.icon-btn:hover { background: var(--cream); color: var(--jade); }
.send-btn {
    background: var(--jade); color: white; border: none; border-radius: 10px;
    padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
    display: flex; align-items: center; gap: 4px;
}
.send-btn:hover { background: var(--ink); }
.disclaimer { font-size: 11px; color: var(--ink-muted); margin-top: 8px; text-align: center; }

// Toast
.toast {
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: var(--ink); color: white; padding: 12px 24px; border-radius: 24px;
    font-size: 13px; box-shadow: var(--shadow-lg); opacity: 0; transition: all .3s;
    z-index: 1000; pointer-events: none;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(-6px); }

@media (max-width: 1024px) {
    .chat-app { grid-template-columns: 1fr; }
    .side { display: none; }
    .plan-dims { grid-template-columns: 1fr; }
    .reco-grid { grid-template-columns: repeat(2, 1fr); }
    .chat-body, .quick-prompts, .chat-input-wrap { padding-left: 20px; padding-right: 20px; }
    .hero { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>

<!-- 以下样式不加 scoped，给 v-html 动态内容使用 -->
<style lang="scss">
// v-html 动态内容样式（与原型严格一致）
.artifact-citations { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
.citation-card {
    background: var(--paper-warm); border-radius: 10px; padding: 8px 12px;
    display: flex; align-items: center; gap: 10px; border-left: 3px solid var(--gold);
    cursor: pointer;
}
.citation-card .ico {
    width: 26px; height: 26px; border-radius: 6px; background: var(--gold-soft);
    color: var(--gold-deep); display: flex; align-items: center; justify-content: center;
    font-size: 13px; flex-shrink: 0;
}
.citation-card .info { flex: 1; min-width: 0; }
.citation-card .info h6 { font-size: 12px; color: var(--ink); margin-bottom: 2px; }
.citation-card .info .meta { font-size: 11px; color: var(--ink-muted); }
.citation-card .arrow { color: var(--ink-muted); }

.artifact-plan {
    background: linear-gradient(135deg, #FDFAF3 0%, #EDF4EF 100%);
    border: 1.5px solid var(--jade-light); border-radius: 14px;
    padding: 18px; margin-top: 12px;
}
.artifact-head {
    display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
    padding-bottom: 10px; border-bottom: 1px dashed var(--line);
}
.artifact-head .seal {
    background: var(--jade); color: white; border-radius: 6px;
    padding: 3px 10px; font-size: 11px; font-weight: 600;
    font-family: "STKaiti", serif;
}
.artifact-head h5 { font-family: "STKaiti", serif; font-size: 16px; flex: 1; }
.artifact-head .meta { font-size: 11px; color: var(--ink-muted); }

.plan-dims { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.plan-dim {
    background: var(--paper); border: 1px solid var(--line); border-radius: 10px;
    padding: 12px 14px;
}
.plan-dim .dim-head {
    display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
    font-family: "STKaiti", serif; font-size: 13px; font-weight: 600;
}
.plan-dim .ico {
    width: 24px; height: 24px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center; font-size: 13px;
}
.plan-dim.diet .ico { background: var(--gold-soft); color: var(--gold-deep); }
.plan-dim.solar .ico { background: var(--jade-soft); color: var(--jade); }
.plan-dim.sleep .ico { background: var(--moon-soft); color: var(--moon); }
.plan-dim.exercise .ico { background: var(--bamboo-soft); color: var(--bamboo); }
.plan-dim .row {
    font-size: 12px; padding: 4px 0; color: var(--ink-soft); line-height: 1.6;
    display: flex; gap: 6px; align-items: flex-start;
}
.plan-dim .row .t {
    font-family: "STKaiti", serif; color: var(--ink-muted); flex-shrink: 0; width: 36px;
}
.plan-dim .row .c strong { color: var(--ink); }

.artifact-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.artifact-actions .btn-sm {
    background: var(--jade); color: white; border: none; border-radius: 18px;
    padding: 6px 14px; font-size: 12px; cursor: pointer; font-family: inherit; font-weight: 500;
    display: inline-flex; align-items: center; gap: 4px;
}
.artifact-actions .btn-sm.ghost { background: transparent; border: 1px solid var(--jade); color: var(--jade); }
.artifact-actions .btn-sm.gold { background: linear-gradient(135deg, var(--gold), var(--gold-deep)); }

.artifact-recos {
    background: var(--paper-warm); border-radius: 14px; padding: 14px;
    margin-top: 12px; border: 1px solid var(--line);
}
.reco-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.reco-card {
    background: var(--paper); border: 1px solid var(--line); border-radius: 10px;
    overflow: hidden; cursor: pointer; display: flex; flex-direction: column;
}
.reco-card .thumb {
    height: 70px; display: flex; align-items: center; justify-content: center; font-size: 32px;
}
.reco-card .body { padding: 8px 10px; flex: 1; display: flex; flex-direction: column; }
.reco-card h6 { font-size: 12px; line-height: 1.4; margin-bottom: 4px; }
.reco-card .reason {
    font-size: 10px; color: var(--ink-muted); margin-bottom: 6px;
    line-height: 1.4; padding-left: 6px; border-left: 2px solid var(--jade);
}
.reco-card .price-row { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.reco-card .price { color: var(--cinnabar); font-family: "STKaiti", serif; font-size: 14px; font-weight: 700; }
.reco-card .add-btn {
    background: var(--jade); color: white; border: none; border-radius: 5px;
    padding: 3px 8px; font-size: 10px; cursor: pointer; font-family: inherit;
}

.handoff-card {
    background: linear-gradient(135deg, #FBEEF1 0%, var(--cinnabar-soft) 100%);
    border: 1.5px dashed var(--cinnabar); border-radius: 12px;
    padding: 14px; margin-top: 12px;
}
.handoff-card h6 { font-family: "STKaiti", serif; font-size: 13px; color: var(--cinnabar); margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
.handoff-card p { font-size: 12px; color: var(--ink-soft); margin-bottom: 10px; line-height: 1.6; }
.handoff-btn {
    background: var(--cinnabar); color: white; border: none; border-radius: 18px;
    padding: 6px 14px; font-size: 12px; cursor: pointer; font-family: inherit; font-weight: 600;
}
</style>
