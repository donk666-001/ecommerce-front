<template>
    <div class="page-wrapper">
        <HeaderLayout />

        <main class="hub">
            <!-- Hero -->
        <section class="hero">
            <div class="hero-label font-serif">FAMOUS DOCTOR CIRCLE · 名医健康圈</div>
            <h1 class="font-serif">{{ heroTitle }}</h1>
            <p class="hero-sub">{{ heroSub }}</p>
            <div class="hero-meta">
                <template v-if="!isExpertView">
                    <span class="meta-item">👩‍⚕️ 入驻专家 <strong>286 位</strong></span>
                    <span class="meta-item">📚 健康内容 <strong>3,420 篇</strong></span>
                    <span class="meta-item">🎓 在售课程 <strong>128 门</strong></span>
                    <span class="meta-item">💬 今日服务 <strong>1,256 次</strong></span>
                </template>
                <template v-else>
                    <span class="meta-item">⏳ 待接诊 <strong style="color:var(--cinnabar);">3</strong></span>
                    <span class="meta-item">📖 今日阅读 <strong>2,148</strong></span>
                    <span class="meta-item">🎓 在售课程 <strong>5</strong></span>
                    <span class="meta-item">⭐ 综合评分 <strong>4.9</strong></span>
                </template>
            </div>
        </section>

        <!-- Tabs -->
        <nav class="tabs">
            <button
                v-for="tab in visibleTabs"
                :key="tab.name"
                class="tab"
                :class="{ active: activeTab === tab.name }"
                @click="switchTab(tab.name)"
            >
                <span class="tab-icon">{{ tab.icon }}</span>
                {{ tab.label }}
                <span v-if="tab.badge" class="role-mini">{{ tab.badge }}</span>
            </button>
        </nav>

        <!-- ===== Module 1: 圈内首页 ===== -->
        <div v-show="activeTab === 'm1'" class="panel">
            <div class="space-y">
                <!-- Solar term banner -->
                <div class="card" style="background: linear-gradient(135deg, #F5EBD3 0%, #E8F0EC 100%); border: none;">
                    <div style="display:flex; align-items:center; gap:24px;">
                        <div style="font-family: 'STKaiti', serif; font-size:64px; color: var(--gold-deep); font-weight:700;">立夏</div>
                        <div style="flex:1;">
                            <div style="font-size:13px; color: var(--gold-deep); letter-spacing:3px; margin-bottom:4px;">2026 · 5 · 5 · 节气专题</div>
                            <h3 style="font-family:'STKaiti',serif; font-size:22px; margin-bottom:6px;">名家说立夏 · 养心护阳，顺应天时</h3>
                            <p style="color: var(--ink-muted); font-size:14px;">张景行主任带你从作息、饮食、运动三方面调养心阳，立夏专题已收录 12 篇医师原创内容。</p>
                        </div>
                        <button class="btn btn-gold">进入专题</button>
                    </div>
                </div>

                <!-- Recommended doctors -->
                <div class="card">
                    <div class="card-title">
                        <span class="dot"></span>推荐专家
                        <span class="extra">在线 12 位 · <a href="#" style="color: var(--jade); text-decoration:none;">查看全部 →</a></span>
                    </div>
                    <div class="doctor-grid">
                        <div v-for="doc in doctors" :key="doc.name" class="doctor-card">
                            <div class="doctor-avatar">{{ doc.emoji }}</div>
                            <div class="doctor-name font-serif">{{ doc.name }}</div>
                            <div class="doctor-title">{{ doc.title }}</div>
                            <div class="doctor-specs">
                                <span v-for="spec in doc.specs" :key="spec" class="pill" :class="spec.class">{{ spec.label }}</span>
                            </div>
                            <div class="doctor-stats">
                                <span>⭐ {{ doc.rating }}</span>
                                <span>💬 {{ doc.consults }}</span>
                                <span>📜 {{ doc.articles }}</span>
                            </div>
                            <button class="btn btn-sm" style="margin-top:12px; width:100%;">向{{ doc.gender === 'm' ? '他' : '她' }}咨询</button>
                        </div>
                    </div>
                </div>

                <!-- Content + Courses -->
                <div class="grid-2">
                    <div class="card">
                        <div class="card-title">
                            <span class="dot"></span>名家创作
                            <span class="extra"><a href="#" style="color: var(--jade); text-decoration:none;">更多 →</a></span>
                        </div>
                        <div class="content-list">
                            <div v-for="article in articles" :key="article.title" class="content-row">
                                <div class="content-cover" :style="article.coverBg">{{ article.emoji }}</div>
                                <div class="content-info">
                                    <h4>{{ article.title }}</h4>
                                    <div class="content-meta">
                                        <span>{{ article.author }}</span>
                                        <span class="pill" :class="article.tagClass">{{ article.tag }}</span>
                                        <span>· {{ article.reads }} 阅读</span>
                                        <span v-if="article.stars">· {{ article.stars }} 收藏</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-title">
                            <span class="dot"></span>名家课程
                            <span class="extra"><a href="#" style="color: var(--jade); text-decoration:none;">课程库 →</a></span>
                        </div>
                        <div class="course-grid">
                            <div v-for="course in courses" :key="course.title" class="course-card">
                                <div class="course-thumb" :style="{ background: course.bg }">
                                    {{ course.emoji }}
                                    <span v-if="course.badge" class="badge">{{ course.badge }}</span>
                                </div>
                                <div class="course-body">
                                    <h4>{{ course.title }}</h4>
                                    <div class="author">{{ course.author }}</div>
                                    <div class="price">
                                        ¥{{ course.price }}
                                        <small v-if="course.original">¥{{ course.original }}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ===== Module 2: 在线咨询 ===== -->
        <div v-show="activeTab === 'm2'" class="panel">
            <div class="space-y">
                <!-- AI flow diagram -->
                <div class="card">
                    <div class="card-title">
                        <span class="dot"></span>咨询服务模式 · AI 与人工同页协同
                        <span class="extra">同一会话页面 · 接待人从 AI 流转到专家</span>
                    </div>
                    <div class="flow-diagram">
                        <div class="flow-grid">
                            <div class="flow-node ai"><div class="ico">🤖</div><h6>AI 预问诊</h6><p>第一时间响应<br>追问症状细节</p></div>
                            <div class="flow-node ai"><div class="ico">🔍</div><h6>风险初筛</h6><p>识别危急信号<br>给出生活建议</p></div>
                            <div class="flow-node handoff"><div class="ico">🔄</div><h6>转人工</h6><p>关键词 / 意图 / 风控<br>三重触发</p></div>
                            <div class="flow-node handoff"><div class="ico">📋</div><h6>AI 小结移交</h6><p>结构化预问诊<br>免重复问诊</p></div>
                            <div class="flow-node expert"><div class="ico">👨‍⚕️</div><h6>专家接诊</h6><p>专业回答<br>调理建议</p></div>
                        </div>
                        <div style="margin-top:16px; padding-top:16px; border-top:1px dashed var(--line); display:flex; gap:24px; flex-wrap:wrap; font-size:12px; color: var(--ink-muted);">
                            <span>💡 <strong style="color:var(--ink);">"AI 咨询"和"转诊接待"是同一个会话页面</strong>。AI 助手先接待，识别到转人工意图后专家接入，整条消息时间线（含 AI 历史 + 小结 + 人工对话）完整保留 — 用户、专家看到的就是同一张对话。</span>
                        </div>
                    </div>
                </div>

                <!-- View switcher -->
                <div class="view-switcher">
                    <div class="view-switcher-label">演示视角 · 同一会话的两端：</div>
                    <div class="view-tabs">
                        <button class="view-tab" :class="{ active: consultView === 'user' }" @click="consultView = 'user'">👤 普通用户视角 · 我向医生咨询</button>
                        <button class="view-tab" :class="{ active: consultView === 'expert' }" @click="consultView = 'expert'">⚕️ 认证专家视角 · 接诊队列 + 同一对话</button>
                    </div>
                </div>

                <!-- User-view pane -->
                <div v-show="consultView === 'user'" class="view-pane">
                    <div class="chat-shell">
                        <div class="chat-main">
                            <div class="chat-head">
                                <div class="ava font-serif">張</div>
                                <div class="who">
                                    <h4>张景行 主任医师 <span class="pill pill-jade">在线</span></h4>
                                    <div class="sub">浙江省中医院 · 中医内科 · ⭐ 4.9</div>
                                </div>
                                <button class="btn btn-ghost btn-sm">查看主页</button>
                            </div>

                            <div class="chat-body" ref="chatBodyEl">
                                <div class="msg-row">
                                    <div class="msg-avatar ai">AI</div>
                                    <div class="bubble-wrap">
                                        <span class="bub-tag">智能预问诊</span>
                                        <div class="bubble bub-ai">您好，我是张医生的智能助手。先帮您做一个简短的预问诊，方便医生更高效为您解答。请问您主要想咨询哪方面的不适？</div>
                                    </div>
                                </div>

                                <div v-for="(msg, idx) in consultMessages" :key="idx">
                                    <!-- User message -->
                                    <div v-if="msg.kind === 'me'" class="msg-row me">
                                        <div class="msg-avatar user">小</div>
                                        <div class="bubble-wrap">
                                            <div class="bubble" :class="msg.handoff ? 'bub-me handoff' : 'bub-me'">{{ msg.text }}</div>
                                        </div>
                                    </div>
                                    <!-- AI message -->
                                    <div v-else-if="msg.kind === 'ai'" class="msg-row">
                                        <div class="msg-avatar ai">AI</div>
                                        <div class="bubble-wrap">
                                            <span v-if="msg.tag" class="bub-tag">{{ msg.tag }}</span>
                                            <div class="bubble bub-ai">{{ msg.text }}</div>
                                        </div>
                                    </div>
                                    <!-- System message -->
                                    <div v-else-if="msg.kind === 'sys'" class="msg-row sys">
                                        <div class="sys-tip" :class="{ success: msg.success }">{{ msg.text }}</div>
                                    </div>
                                    <!-- Expert message -->
                                    <div v-else-if="msg.kind === 'expert'" class="msg-row">
                                        <div class="msg-avatar expert">張</div>
                                        <div class="bubble-wrap">
                                            <div class="bubble bub-user">{{ msg.text }}</div>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="showAiSummary" class="ai-summary">
                                    <h6>📋 AI 预问诊小结（已自动移交医生）<span class="seal">已留痕</span></h6>
                                    <dl>
                                        <dt>主诉</dt><dd>胸闷气短 3 天，下午加重</dd>
                                        <dt>伴随</dt><dd>轻微心悸</dd>
                                        <dt>诱因</dt><dd>近期加班、睡眠不足</dd>
                                        <dt>既往</dt><dd>无高血压 / 心脏病史，未规律服药</dd>
                                        <dt>风险初筛</dt><dd class="risk">中 · 建议结合心电图排查心血管系统</dd>
                                        <dt>建议方向</dt><dd>中医偏胸痹 / 气滞证；结合舌脉辨证，必要时转线下</dd>
                                    </dl>
                                </div>
                            </div>

                            <div class="chat-input">
                                <button class="handoff-chip" @click="triggerHandoff">🔄 转人工</button>
                                <input type="text" v-model="chatInputText" placeholder="输入您想咨询的问题…" @keydown.enter="sendMessage" />
                                <button class="btn btn-sm" @click="sendMessage">发送</button>
                            </div>
                        </div>

                        <aside class="chat-side">
                            <h5><span class="dot"></span>三种触发"转人工"</h5>
                            <div class="tip-list" style="font-size:12px;">
                                <div class="tip-row" style="padding:10px;">
                                    <span class="icon">🔤</span>
                                    <div class="text" style="font-size:12px;"><strong>关键词触发</strong><br>转人工 / 找医生 / 人工客服 / 真人</div>
                                </div>
                                <div class="tip-row gold" style="padding:10px;">
                                    <span class="icon">🧠</span>
                                    <div class="text" style="font-size:12px;"><strong>意图模型</strong><br>"AI 我不要再聊了"等语义识别</div>
                                </div>
                                <div class="tip-row cinnabar" style="padding:10px;">
                                    <span class="icon">🚨</span>
                                    <div class="text" style="font-size:12px;"><strong>风控强制</strong><br>识别到危急信号自动转接 + 提示就医</div>
                                </div>
                            </div>

                            <div class="side-section">
                                <h5><span class="dot"></span>专家推荐内容</h5>
                                <div class="recommend-item">
                                    <div class="ico">📜</div>
                                    <div class="info"><h6>立夏养心三要点</h6><div class="meta">张景行 · 图文</div></div>
                                </div>
                                <div class="recommend-item">
                                    <div class="ico" style="background:var(--gold-soft); color:var(--gold-deep);">🎓</div>
                                    <div class="info"><h6>21 天体质辨识与调理</h6><div class="meta">¥199 · 21 课时</div></div>
                                </div>
                            </div>
                        </aside>
                    </div>
                    <div class="view-explain">
                        <span class="ve-ico">👤</span>
                        <div><strong>这是普通用户看到的咨询页面。</strong>用户进入后，AI 先接待预问诊；用户随时可在输入框点击「转人工」或直接输入"转人工"等触发词。专家接入后，对话在同一页面继续，无需重开。</div>
                    </div>
                </div>

                <!-- Expert-view pane -->
                <div v-show="consultView === 'expert'" class="view-pane">
                    <div class="triage-shell">
                        <div class="triage-queue">
                            <div class="queue-tabs">
                                <button class="queue-tab" :class="{ on: queueTab === 'pending' }" @click="queueTab = 'pending'">待接诊 3</button>
                                <button class="queue-tab" :class="{ on: queueTab === 'active' }" @click="queueTab = 'active'">咨询中 2</button>
                                <button class="queue-tab" :class="{ on: queueTab === 'done' }" @click="queueTab = 'done'">已完成</button>
                            </div>
                            <div class="queue-list">
                                <div class="q-item" :class="{ active: activeQueueItem === 0 }" @click="activeQueueItem = 0">
                                    <div class="q-head">
                                        <div class="q-ava">荷</div>
                                        <span class="q-name">小荷</span>
                                        <span class="pill pill-cinnabar">转人工</span>
                                    </div>
                                    <div class="q-preview">胸闷气短 3 天，下午加重…</div>
                                    <div class="q-time urgent">12 秒前 · 请尽快接入</div>
                                    <span class="red-dot"></span>
                                </div>
                                <div class="q-item" :class="{ active: activeQueueItem === 1 }" @click="activeQueueItem = 1">
                                    <div class="q-head">
                                        <div class="q-ava">月</div>
                                        <span class="q-name">阿月</span>
                                        <span class="pill pill-cinnabar">转人工</span>
                                    </div>
                                    <div class="q-preview">经期腹痛较以往加重，热敷不缓解…</div>
                                    <div class="q-time urgent">2 分钟前 · 请尽快接入</div>
                                    <span class="red-dot"></span>
                                </div>
                                <div class="q-item" :class="{ active: activeQueueItem === 2 }" @click="activeQueueItem = 2">
                                    <div class="q-head">
                                        <div class="q-ava">林</div>
                                        <span class="q-name">林先生</span>
                                        <span class="pill pill-moon">AI 接待中</span>
                                    </div>
                                    <div class="q-preview">想了解一下我的体质类型…</div>
                                    <div class="q-time">5 分钟前 · AI 处理中</div>
                                </div>
                                <div style="padding:10px 14px; font-size:11px; color:var(--ink-muted); font-family:'STKaiti',serif; border-top:1px solid var(--line);">— 已咨询 —</div>
                                <div class="q-item" :class="{ active: activeQueueItem === 3 }" @click="activeQueueItem = 3">
                                    <div class="q-head">
                                        <div class="q-ava">王</div>
                                        <span class="q-name">王女士</span>
                                        <span class="pill pill-bamboo">已完成</span>
                                    </div>
                                    <div class="q-preview">非常感谢医生，按方调理后好多了！</div>
                                    <div class="q-time">昨天 14:32</div>
                                </div>
                            </div>
                        </div>

                        <div class="triage-conv">
                            <div class="chat-head">
                                <div class="ava" style="background:linear-gradient(135deg,var(--gold),var(--cinnabar));">荷</div>
                                <div class="who">
                                    <h4>小荷 · 32 岁 · 女 <span class="pill pill-jade">首次咨询</span></h4>
                                    <div class="sub">江南体质 · 来源：张医生主页「向他咨询」入口</div>
                                </div>
                                <button class="btn btn-ghost btn-sm">结束咨询</button>
                            </div>

                            <div class="chat-body" style="max-height:540px;">
                                <div class="msg-row"><div class="msg-avatar ai">AI</div><div class="bubble-wrap"><span class="bub-tag">智能预问诊 · 已结束</span><div class="bubble bub-ai">您好，我是张医生的智能助手。先帮您做一个简短的预问诊，方便医生更高效为您解答。请问您主要想咨询哪方面的不适？</div></div></div>
                                <div class="msg-row me"><div class="msg-avatar user">荷</div><div class="bubble-wrap"><div class="bubble bub-user">最近三天总觉得胸闷气短，下午尤其明显。</div></div></div>
                                <div class="msg-row"><div class="msg-avatar ai">AI</div><div class="bubble-wrap"><span class="bub-tag">AI · 追问</span><div class="bubble bub-ai">了解。① 有没有伴随心悸或冒汗？② 之前有过类似情况吗？③ 是否有高血压、心脏病史？</div></div></div>
                                <div class="msg-row me"><div class="msg-avatar user">荷</div><div class="bubble-wrap"><div class="bubble bub-user">有轻微心悸，之前没有。最近一直加班、睡得很少，没有慢性病。</div></div></div>
                                <div class="msg-row me"><div class="msg-avatar user">荷</div><div class="bubble-wrap"><div class="bubble bub-user" style="background:var(--cinnabar-soft); color:var(--cinnabar); border-color:rgba(179,60,44,.25);">转人工</div></div></div>
                                <div class="msg-row sys"><div class="sys-tip">⏳ 用户请求转人工 · 触发词命中 · 会话已分配给你 · 12 秒前</div></div>
                                <div class="ai-summary">
                                    <h6>📋 AI 预问诊小结<span class="seal">已留痕</span></h6>
                                    <dl>
                                        <dt>主诉</dt><dd>胸闷气短 3 天，下午加重</dd>
                                        <dt>伴随</dt><dd>轻微心悸</dd>
                                        <dt>诱因</dt><dd>近期加班、睡眠不足</dd>
                                        <dt>既往</dt><dd>无高血压 / 心脏病史</dd>
                                        <dt>风险初筛</dt><dd class="risk">中 · 建议结合心电图排查心血管</dd>
                                        <dt>建议方向</dt><dd>中医偏胸痹 / 气滞证；结合舌脉辨证</dd>
                                    </dl>
                                </div>
                                <div class="msg-row sys"><div class="sys-tip" style="background:var(--paper-warm); color:var(--ink-muted); border-color:var(--line);">— 你尚未发言 · 请尽快接入 —</div></div>
                            </div>

                            <div class="chat-input">
                                <button class="handoff-chip" style="background:var(--gold-soft); color:var(--gold-deep); border-color:rgba(201,165,92,.4);">💬 快捷回复</button>
                                <input type="text" placeholder="输入回复 · 持证医师可发送图文调理方案" />
                                <button class="btn btn-sm">发送</button>
                            </div>
                        </div>

                        <aside class="triage-side">
                            <h5><span style="background:var(--cinnabar);width:3px;height:12px;display:inline-block;border-radius:2px;"></span>用户健康档案</h5>
                            <div class="archive-list">
                                <div class="ar-row"><span>体质</span><span>江南 · 气虚</span></div>
                                <div class="ar-row"><span>年龄性别</span><span>32 岁 · 女</span></div>
                                <div class="ar-row"><span>身高体重</span><span>165 / 54kg</span></div>
                                <div class="ar-row"><span>既往病史</span><span>无</span></div>
                                <div class="ar-row"><span>过敏史</span><span>无</span></div>
                                <div class="ar-row"><span>近 30 天</span><span>首次咨询</span></div>
                            </div>

                            <div class="side-section">
                                <h5><span style="background:var(--moon);width:3px;height:12px;display:inline-block;border-radius:2px;"></span>AI 接待设置</h5>
                                <div class="switch-row" :class="{ off: !switchStates.autoPreAsk }" @click="toggleSwitch('autoPreAsk')"><span>AI 自动预问诊</span><span class="toggle"></span></div>
                                <div class="switch-row" :class="{ off: !switchStates.autoHandoff }" @click="toggleSwitch('autoHandoff')"><span>转人工自动识别</span><span class="toggle"></span></div>
                                <div class="switch-row" :class="{ off: !switchStates.offHours }" @click="toggleSwitch('offHours')"><span>非工作时间托管</span><span class="toggle"></span></div>
                                <div style="margin-top:10px; font-size:11px; color:var(--ink-muted);">转人工触发词：</div>
                                <div class="keyword-list">
                                    <span>转人工</span><span>找医生</span><span>人工客服</span><span>真人</span><span>转专家</span>
                                </div>
                            </div>

                            <div class="side-section">
                                <h5><span style="background:var(--gold);width:3px;height:12px;display:inline-block;border-radius:2px;"></span>挂载推荐</h5>
                                <div class="recommend-item">
                                    <div class="ico">📜</div><div class="info"><h6>立夏养心三要点</h6><div class="meta">我的内容</div></div>
                                </div>
                                <div class="recommend-item">
                                    <div class="ico" style="background:var(--gold-soft);color:var(--gold-deep);">🎓</div><div class="info"><h6>21 天体质辨识与调理</h6><div class="meta">¥199 · 我的课程</div></div>
                                </div>
                                <button class="btn btn-ghost btn-sm" style="width:100%; margin-top:6px; justify-content:center;">挂载到会话</button>
                            </div>
                        </aside>
                    </div>
                    <div class="view-explain expert">
                        <span class="ve-ico">⚕️</span>
                        <div><strong>这是认证专家看到的同一个页面。</strong>左侧是会话队列 — 既包含 AI 正在接待的（如「林先生 · AI 接待中」），也包含已请求转人工的（红点提醒）。中间打开的对话就是用户视角里那条会话的 <em>另一面</em>，AI 历史 + 预问诊小结自动呈现，免重复问诊。</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ===== Module 3: 个人主页 ===== -->
        <div v-show="activeTab === 'm3'" class="panel">
            <div class="space-y">
                <div class="profile-cover">
                    <div class="ava-big">荷</div>
                    <h2>小荷</h2>
                    <p>普通用户 · 已注册 142 天 · 江南体质 · ID 88231</p>
                </div>

                <div class="stat-grid">
                    <div class="stat-cell"><div class="n">12</div><div class="l">收藏内容</div></div>
                    <div class="stat-cell"><div class="n">3</div><div class="l">已购课程</div></div>
                    <div class="stat-cell"><div class="n">5</div><div class="l">咨询次数</div></div>
                    <div class="stat-cell"><div class="n">2</div><div class="l">关注专家</div></div>
                </div>

                <div class="grow-card">
                    <span class="new-tag">★ NEW</span>
                    <h3>成为颐养阁认证专家</h3>
                    <p>有医师 / 营养师 / 康复师 / 养生达人资质？加入名医健康圈，开启内容创作、课程发布与在线问诊三重通道，让专业被更多人看见。</p>
                    <div class="benefit-row">
                        <div class="benefit"><div class="ico">📈</div>平台流量扶持</div>
                        <div class="benefit"><div class="ico">💰</div>课程 / 咨询变现</div>
                        <div class="benefit"><div class="ico">🏅</div>官方认证徽章</div>
                        <div class="benefit"><div class="ico">🔒</div>资质加密保护</div>
                    </div>
                    <button class="btn btn-gold" @click="switchTab('m4')">前往认证申请 →</button>
                    <span style="margin-left:12px; font-size:12px; color: var(--ink-muted);">已认证？<a href="#" style="color: var(--jade);">登录专家账号</a></span>
                </div>

                <div class="card">
                    <div class="card-title"><span class="dot"></span>我的账户</div>
                    <div class="menu-grid">
                        <div v-for="menu in profileMenus" :key="menu.title" class="menu-cell">
                            <div class="ico">{{ menu.ico }}</div>
                            <div class="info"><h5>{{ menu.title }}</h5><p>{{ menu.sub }}</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ===== Module 4: 专家认证 ===== -->
        <div v-show="activeTab === 'm4'" class="panel">
            <div class="space-y">
                <div class="card">
                    <div class="card-title" style="justify-content:center;"><span class="dot"></span>认证进度</div>
                    <div class="stepper">
                        <div class="step done"><div class="num">✓</div><div class="lab">基本信息</div></div>
                        <div class="step on"><div class="num">2</div><div class="lab">资质上传</div></div>
                        <div class="step"><div class="num">3</div><div class="lab">视频面审</div></div>
                        <div class="step"><div class="num">4</div><div class="lab">签约</div></div>
                        <div class="step"><div class="num">5</div><div class="lab">开通</div></div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title"><span class="dot"></span>选择入驻角色 <span class="extra">不同角色对应不同权限</span></div>
                    <div class="role-grid">
                        <div v-for="(role, idx) in certRoles" :key="role.title" class="role-card" :class="{ active: selectedRole === idx }" @click="selectedRole = idx">
                            <div class="ico">{{ role.ico }}</div>
                            <h5>{{ role.title }}</h5>
                            <div class="req">{{ role.req }}</div>
                            <div class="perm">{{ role.perm }}</div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">
                        <span class="dot"></span>上传资质材料
                        <span class="extra">🔒 加密存储 · 仅审核员可见 · 支持撤销</span>
                    </div>
                    <div class="upload-grid">
                        <div v-for="slot in uploadSlots" :key="slot.label" class="upload-slot" :class="{ done: slot.done }">
                            <span class="ico">{{ slot.done ? '✓' : '＋' }}</span>
                            <div>{{ slot.label }}</div>
                            <small style="display:block;margin-top:4px;font-size:11px;">{{ slot.hint }}</small>
                            <span class="req-tag" :class="{ optional: slot.optional }">{{ slot.optional ? '可选' : '必填' }}</span>
                        </div>
                    </div>

                    <div class="privacy-note" style="margin-top:18px;">
                        <strong style="color:var(--moon);">隐私保护承诺：</strong>所有上传的证件材料采用 HTTPS 传输 + 服务端列加密 + 仅授权审核员可解密查看；
                        认证撤销后保留 90 天再彻底删除（满足审计周期）；公开展示页面仅显示「角色 + 认证机构」，不展示证件号与扫描件原图。
                    </div>

                    <div style="display:flex; gap:12px; margin-top:18px;">
                        <button class="btn btn-ghost" style="flex:1;">暂存草稿</button>
                        <button class="btn" style="flex:2;">提交审核 · 预计 1-5 个工作日反馈</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ===== Module 5: 专家工作台 ===== -->
        <div v-show="activeTab === 'm5'" class="panel">
            <div class="space-y">
                <div class="expert-hero">
                    <div class="greet">张医生，午安</div>
                    <div class="greet-sub">立夏 · 阳气方盛 · 今日为您匹配了 3 位待接诊用户</div>
                    <div class="expert-stats">
                        <div class="expert-stat urgent"><div class="n">3</div><div class="l">⏳ 待接诊（请求转人工）</div></div>
                        <div class="expert-stat"><div class="n">2.1k</div><div class="l">📖 今日内容阅读</div></div>
                        <div class="expert-stat"><div class="n">5</div><div class="l">🎓 在售课程</div></div>
                        <div class="expert-stat"><div class="n">4.9</div><div class="l">⭐ 综合服务评分</div></div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title"><span class="dot"></span>快捷工作台</div>
                    <div class="quick-grid">
                        <div class="quick-cell" @click="switchTab('m2'); consultView = 'expert'">
                            <div class="ico">💬</div><div class="lab">咨询会话</div><span class="badge">3</span>
                        </div>
                        <div class="quick-cell" @click="toast('功能演示中')"><div class="ico">📝</div><div class="lab">写内容</div></div>
                        <div class="quick-cell" @click="toast('功能演示中')"><div class="ico">🎓</div><div class="lab">发课程</div></div>
                        <div class="quick-cell" @click="toast('功能演示中')"><div class="ico">📊</div><div class="lab">数据看板</div></div>
                        <div class="quick-cell" @click="toast('功能演示中')"><div class="ico">💰</div><div class="lab">收益结算</div></div>
                        <div class="quick-cell" @click="toast('功能演示中')"><div class="ico">⚙️</div><div class="lab">AI 接待设置</div></div>
                    </div>
                </div>

                <div class="grid-2">
                    <div class="card">
                        <div class="card-title">
                            <span class="dot"></span>我的内容
                            <span class="extra"><a href="#" style="color:var(--jade);text-decoration:none;">管理 →</a></span>
                        </div>
                        <div class="work-list">
                            <div class="work-row">
                                <div class="thumb">📜</div>
                                <div class="info"><h5>立夏后这样喝粥，养心宁神事半功倍</h5><div class="meta"><span class="pill pill-jade">已发布</span><span>8.2k 阅读 · 312 收藏</span></div></div>
                                <div class="actions"><button class="btn btn-ghost btn-sm">数据</button></div>
                            </div>
                            <div class="work-row review">
                                <div class="thumb">⏳</div>
                                <div class="info"><h5>夏季心阳调养系列（直播预告）</h5><div class="meta"><span class="pill pill-gold">审核中</span><span>提交于 2h 前</span></div></div>
                                <div class="actions"><button class="btn btn-ghost btn-sm">查看</button></div>
                            </div>
                            <div class="work-row rejected">
                                <div class="thumb">✕</div>
                                <div class="info"><h5>某某方"根治"失眠 —— 真相是…</h5><div class="meta"><span class="pill pill-cinnabar">未通过</span><span>违规用语：根治</span></div></div>
                                <div class="actions"><button class="btn btn-cinnabar btn-sm">修改重提</button></div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-title">
                            <span class="dot"></span>我的课程
                            <span class="extra"><a href="#" style="color:var(--jade);text-decoration:none;">管理 →</a></span>
                        </div>
                        <div class="work-list">
                            <div class="work-row">
                                <div class="thumb">🌿</div>
                                <div class="info"><h5>21 天体质辨识与调理</h5><div class="meta"><span class="pill pill-jade">上架中</span><span>1,286 学员 · ⭐ 4.9 · ¥256k 收益</span></div></div>
                                <div class="actions"><button class="btn btn-ghost btn-sm">章节</button></div>
                            </div>
                            <div class="work-row review">
                                <div class="thumb">⏳</div>
                                <div class="info"><h5>名家说立夏 · 7 天调养课</h5><div class="meta"><span class="pill pill-gold">审核中</span><span>第 5 节待补充</span></div></div>
                                <div class="actions"><button class="btn btn-ghost btn-sm">编辑</button></div>
                            </div>
                            <div class="work-row" style="background:rgba(255,255,255,0.5); border-style:dashed;">
                                <div class="thumb" style="background:var(--paper); border:1px dashed var(--line); color:var(--ink-muted);">＋</div>
                                <div class="info"><h5 style="color:var(--ink-muted);">创建新课程</h5><div class="meta">封面 → 章节 → 定价 → 提交审核</div></div>
                                <div class="actions"><button class="btn btn-gold btn-sm">立即创建</button></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Legend -->
        <div class="legend-strip">
            <strong style="color:var(--ink);">消息图例：</strong>
            <span><i style="background:#E8EDF3;"></i>AI 消息（月白蓝）</span>
            <span><i style="background:#FFFFFF;border:1px solid #E8DFD0;"></i>用户消息（宣纸白）</span>
            <span><i style="background:#5C8374;"></i>专家消息（竹青绿）</span>
            <span><i style="background:#FAE5E0;"></i>系统提示（朱砂红）</span>
            <span><i style="background:#FFFCF3;border:1.5px dashed #C9A55C;"></i>AI 预问诊小结（暗金）</span>
        </div>

        </main>

        <div class="toast" :class="{ show: toastVisible }">{{ toastMsg }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import HeaderLayout from "@/layouts/HeaderLayout.vue";

// ---- Role view ----
const isExpertView = ref(false);
const heroTitle = computed(() => isExpertView.value ? '专家工作台 · 名医健康圈' : '名医健康圈');
const heroSub = computed(() =>
    isExpertView.value
        ? '欢迎回来，张景行医生。今日有 3 位用户请求转人工，2 篇内容获得首页推荐，预计周收益 ¥3,820。'
        : '汇聚执业医师、营养师、康复治疗师与养生达人，提供专业内容、系统课程与一对一健康咨询 —— AI 助手先接待，复杂问题随时转人工。'
);

// ---- Tabs ----
const activeTab = ref("m1");
const allTabs = [
    { name: "m1", icon: "🏠", label: "圈内首页" },
    { name: "m2", icon: "💬", label: "在线咨询", badge: "AI ↔ 人工" },
    { name: "m3", icon: "👤", label: "个人主页" },
    { name: "m4", icon: "📝", label: "专家认证" },
    { name: "m5", icon: "⚕️", label: "专家工作台", badge: "认证" },
];
const visibleTabs = computed(() => allTabs);

function switchTab(name: string) {
    activeTab.value = name;
    window.scrollTo({ top: document.querySelector(".tabs")!.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
}

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

// ---- Module 1 data ----
const doctors = [
    { name: "张景行", emoji: "👨‍⚕️", title: "浙江省中医院 · 主任医师", specs: [{ label: "心脑血管", class: "pill-cinnabar" }, { label: "中医内科", class: "pill-jade" }], rating: "4.9", consults: "2.3k", articles: "86", gender: "m" },
    { name: "李清和", emoji: "👩‍⚕️", title: "广州中医药大学一附院 · 副主任", specs: [{ label: "妇科", class: "pill-pink" }, { label: "调经种子", class: "pill-jade" }], rating: "4.8", consults: "1.8k", articles: "64", gender: "f" },
    { name: "周一谦", emoji: "🥗", title: "注册营养师 · 公共营养硕士", specs: [{ label: "膳食营养", class: "pill-bamboo" }, { label: "体质调理", class: "pill-gold" }], rating: "4.7", consults: "956", articles: "42", gender: "m" },
];

const articles = [
    { title: "立夏后这样喝粥，养心宁神事半功倍", author: "张景行", tag: "图文", tagClass: "pill-jade", emoji: "📜", reads: "8.2k", stars: "312", coverBg: undefined },
    { title: "3 分钟学会·缓解经期腹痛的穴位按摩", author: "李清和", tag: "短视频", tagClass: "pill-cinnabar", emoji: "🎥", reads: "1.5w", coverBg: "background:linear-gradient(135deg,var(--pink-soft),var(--gold-soft));" },
    { title: "问答 · 长期熬夜的人，应该怎么喝茶？", author: "周一谦", tag: "问答", tagClass: "pill-bamboo", emoji: "🍵", reads: "3.4k", coverBg: "background:linear-gradient(135deg,var(--bamboo-soft),var(--jade-soft));" },
];

const courses = [
    { title: "21 天体质辨识与调理", emoji: "🌿", bg: "linear-gradient(135deg,var(--jade-soft),var(--pink-soft))", badge: "爆款", author: "张景行 · 21 课时", price: "199", original: "299" },
    { title: "四季药膳实战课", emoji: "🍲", bg: "linear-gradient(135deg,var(--gold-soft),var(--pink-soft))", badge: "", author: "周一谦 · 24 课时", price: "299", original: "" },
    { title: "八段锦零基础入门", emoji: "🧘", bg: "linear-gradient(135deg,var(--jade-soft),var(--bamboo-soft))", badge: "", author: "王师傅 · 8 课时", price: "99", original: "" },
    { title: "女性月经调理 30 讲", emoji: "💆", bg: "linear-gradient(135deg,var(--pink-soft),var(--jade-soft))", badge: "", author: "李清和 · 30 课时", price: "399", original: "" },
];

// ---- Module 2: Consult ----
const consultView = ref("user");
const chatInputText = ref("");
const showAiSummary = ref(false);
const HANDOFF_WORDS = ["转人工", "找医生", "人工客服", "真人", "转专家"];

const consultMessages = ref<{ kind: string; text: string; tag?: string; handoff?: boolean; success?: boolean }[]>([]);

function sendMessage() {
    const text = chatInputText.value.trim();
    if (!text) return;
    consultMessages.value.push({ kind: "me", text, handoff: HANDOFF_WORDS.some(k => text.includes(k)) });
    chatInputText.value = "";
    const isHandoff = HANDOFF_WORDS.some(k => text.includes(k));
    if (isHandoff) {
        setTimeout(() => {
            consultMessages.value.push({ kind: "sys", text: "⏳ 已识别\"转人工\"意图 · 触发词命中 · 正在为您转接…" });
            setTimeout(() => {
                showAiSummary.value = true;
                setTimeout(() => {
                    consultMessages.value.push({ kind: "sys", text: "✓ 张景行 主任医师 已接入会话", success: true });
                    setTimeout(() => {
                        consultMessages.value.push({ kind: "expert", text: "您好，我看到了 AI 的初步问询。最近加班确实容易引发肝郁气滞型胸闷。请把舌头伸出来拍张照片我看一下，另外今晚之前避免饮浓茶咖啡。" });
                    }, 600);
                }, 300);
            }, 1200);
        }, 600);
    } else {
        setTimeout(() => {
            consultMessages.value.push({ kind: "ai", text: "好的，已记录您的描述。请问还有其他症状吗？(随时可以发送「转人工」让医生本人接入)", tag: "AI · 跟进" });
        }, 600);
    }
}

function triggerHandoff() {
    chatInputText.value = "转人工";
    sendMessage();
}

// ---- Module 2: Expert view ----
const queueTab = ref("pending");
const activeQueueItem = ref(0);
const switchStates = ref({ autoPreAsk: true, autoHandoff: true, offHours: false });
function toggleSwitch(key: keyof typeof switchStates.value) {
    switchStates.value[key] = !switchStates.value[key];
}

// ---- Module 3 ----
const profileMenus = [
    { ico: "📚", title: "我的课程", sub: "3 门 · 1 门学习中" },
    { ico: "💬", title: "咨询记录", sub: "5 次 · 1 次未评价" },
    { ico: "❤️", title: "我的收藏", sub: "12 篇内容" },
    { ico: "📦", title: "我的订单", sub: "2 个待发货" },
    { ico: "🏥", title: "健康档案", sub: "体质：江南" },
    { ico: "⚙️", title: "账号与隐私", sub: "账号安全 · 偏好" },
];

// ---- Module 4 ----
const selectedRole = ref(0);
const certRoles = [
    { ico: "⚕️", title: "执业医师", req: "医师资格证\n执业证 · 职称证", perm: "✓ 全功能 · 可诊疗" },
    { ico: "🥗", title: "注册营养师", req: "营养师证书\n学历证明", perm: "✓ 膳食营养咨询" },
    { ico: "🧘", title: "康复治疗师", req: "康复治疗师证\n培训证明", perm: "✓ 康复训练指导" },
    { ico: "🌱", title: "养生达人", req: "实名 + 作品集\n平台考核", perm: "✓ 内容 / 课程\n✗ 不可诊断处方" },
];

const uploadSlots = [
    { label: "身份证人像面", done: true, hint: "已上传 · 已核验", optional: false },
    { label: "身份证国徽面", done: true, hint: "已上传 · 已核验", optional: false },
    { label: "医师资格证书", done: true, hint: "已上传 · 已核验", optional: false },
    { label: "执业医师证", done: false, hint: "jpg / png / pdf · ≤ 5MB", optional: false },
    { label: "职称证明", done: false, hint: "加分项 · 可暂不上传", optional: true },
    { label: "个人简介 / 擅长方向", done: false, hint: "文字说明，500 字以内", optional: false },
];
</script>

<style scoped lang="scss">
.page-wrapper { min-height: 100vh; }

.hub { max-width: 1200px; margin: 0 auto; padding: 32px 40px 80px; }

// Hero
.hero {
    background: linear-gradient(135deg, #FDFAF3 0%, #F0E8D5 100%);
    border: 1px solid var(--gold-soft);
    border-radius: 20px; padding: 36px 40px; margin-bottom: 28px;
    position: relative; overflow: hidden;
}
.hero::before {
    content: '醫'; position: absolute; right: 30px; top: 50%; transform: translateY(-50%);
    font-family: "STKaiti", serif; font-size: 200px; color: var(--cinnabar);
    opacity: 0.10; line-height: 1; font-weight: 900;
}
.hero-label { font-size: 13px; color: var(--cinnabar); letter-spacing: 4px; margin-bottom: 8px; font-family: "STKaiti", serif; }
.hero h1 { font-family: "STKaiti", serif; font-size: 38px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
.hero-sub { color: var(--ink-muted); font-size: 15px; max-width: 600px; }
.hero-meta { display: flex; gap: 24px; margin-top: 24px; font-size: 13px; flex-wrap: wrap; }
.meta-item { display: flex; align-items: center; gap: 8px; color: var(--ink-muted); }
.meta-item strong { color: var(--jade); font-weight: 600; }

// Tabs
.tabs {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;
    margin-bottom: 28px; background: var(--paper);
    border-radius: 14px; padding: 8px; box-shadow: var(--shadow);
}
.tab {
    background: transparent; border: none; padding: 14px 8px;
    cursor: pointer; border-radius: 10px; font-family: inherit;
    color: var(--ink-muted); font-size: 13px; transition: all .25s;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.tab-icon { font-size: 22px; }
.tab:hover { background: var(--cream); color: var(--ink); }
.tab.active {
    background: linear-gradient(135deg, var(--jade), var(--jade-light));
    color: white; box-shadow: 0 4px 12px rgba(92, 131, 116, 0.3);
}
.role-mini {
    display: inline-block; font-size: 9px; padding: 1px 5px;
    border-radius: 3px; background: var(--gold-soft); color: var(--gold-deep);
    margin-top: 2px; font-weight: 600;
}
.tab.active .role-mini { background: rgba(255,255,255,0.25); color: white; }

// Panels
.panel { animation: fadeIn .4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

// Common
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
.card-title .extra { margin-left: auto; font-size: 12px; color: var(--ink-muted); font-weight: 400; font-family: inherit; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.space-y > * + * { margin-top: 20px; }

// Buttons
.btn {
    background: var(--jade); color: white; border: none;
    padding: 10px 20px; border-radius: 22px; font-family: inherit;
    font-size: 13px; cursor: pointer; transition: all .2s;
    display: inline-flex; align-items: center; gap: 6px;
}
.btn:hover { background: var(--ink); transform: translateY(-1px); }
.btn-ghost { background: transparent; color: var(--jade); border: 1px solid var(--jade); }
.btn-ghost:hover { background: var(--jade-soft); color: var(--jade); }
.btn-gold { background: linear-gradient(135deg, var(--gold), var(--gold-deep)); }
.btn-gold:hover { background: var(--gold-deep); }
.btn-cinnabar { background: var(--cinnabar); }
.btn-cinnabar:hover { background: #92301F; }
.btn-sm { padding: 6px 14px; font-size: 12px; }

// Pills
.pill { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
.pill-jade { background: var(--jade-soft); color: var(--jade); }
.pill-gold { background: var(--gold-soft); color: var(--gold-deep); }
.pill-cinnabar { background: var(--cinnabar-soft); color: var(--cinnabar); }
.pill-moon { background: var(--moon-soft); color: var(--moon); }
.pill-bamboo { background: var(--bamboo-soft); color: var(--bamboo); }
.pill-pink { background: var(--pink-soft); color: var(--pink); }

// Tip rows
.tip-list { display: flex; flex-direction: column; gap: 12px; }
.tip-row {
    display: flex; align-items: flex-start; gap: 12px; padding: 12px;
    background: var(--paper-warm); border-radius: 10px; border-left: 3px solid var(--jade);
}
.tip-row.gold { border-left-color: var(--gold); }
.tip-row.cinnabar { border-left-color: var(--cinnabar); }
.tip-row .icon { font-size: 20px; }
.tip-row .text { font-size: 14px; color: var(--ink); line-height: 1.6; }
.tip-row .text strong { color: var(--jade); }

// Doctor cards
.doctor-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.doctor-card {
    background: var(--paper-warm); border: 1px solid var(--line); border-radius: 14px;
    padding: 18px; text-align: center; transition: all .2s; cursor: pointer;
}
.doctor-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); border-color: var(--jade-light); }
.doctor-avatar {
    width: 64px; height: 64px; border-radius: 50%;
    background: linear-gradient(135deg, var(--jade-soft), var(--gold-soft));
    display: flex; align-items: center; justify-content: center;
    font-size: 30px; margin: 0 auto 10px;
}
.doctor-name { font-family: "STKaiti", serif; font-size: 16px; font-weight: 600; margin-bottom: 2px; }
.doctor-title { font-size: 11px; color: var(--ink-muted); margin-bottom: 8px; }
.doctor-specs { display: flex; gap: 4px; justify-content: center; flex-wrap: wrap; margin-bottom: 10px; }
.doctor-stats { font-size: 11px; color: var(--ink-muted); display: flex; justify-content: center; gap: 10px; }

// Content List
.content-list { display: flex; flex-direction: column; gap: 14px; }
.content-row {
    display: flex; gap: 14px; padding: 14px;
    background: var(--paper-warm); border-radius: 12px; cursor: pointer; transition: all .2s;
}
.content-row:hover { background: var(--cream); transform: translateX(2px); }
.content-cover {
    width: 96px; height: 72px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--jade-soft), var(--gold-soft));
    display: flex; align-items: center; justify-content: center; font-size: 32px;
}
.content-info { flex: 1; min-width: 0; }
.content-info h4 { font-size: 14px; color: var(--ink); margin-bottom: 6px; line-height: 1.5; font-weight: 600; }
.content-meta { font-size: 12px; color: var(--ink-muted); display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

// Course Grid
.course-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.course-card {
    background: var(--paper-warm); border: 1px solid var(--line); border-radius: 12px;
    overflow: hidden; transition: all .2s; cursor: pointer;
}
.course-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
.course-thumb {
    height: 110px; background: linear-gradient(135deg, var(--jade-soft), var(--pink-soft));
    display: flex; align-items: center; justify-content: center; font-size: 44px;
    position: relative;
}
.course-thumb .badge {
    position: absolute; top: 10px; left: 10px; background: var(--cinnabar); color: white;
    font-size: 11px; padding: 3px 8px; border-radius: 6px; font-weight: 600;
}
.course-body { padding: 14px; }
.course-body h4 { font-size: 14px; margin-bottom: 6px; line-height: 1.4; }
.course-body .author { font-size: 12px; color: var(--ink-muted); margin-bottom: 8px; }
.course-body .price { color: var(--cinnabar); font-family: "STKaiti", serif; font-size: 18px; font-weight: 700; }
.course-body .price small { font-size: 11px; color: var(--ink-muted); font-weight: 400; text-decoration: line-through; margin-left: 6px; font-family: inherit; }

// Flow Diagram
.flow-diagram {
    background: linear-gradient(135deg, var(--moon-soft) 0%, var(--paper-warm) 100%);
    border-radius: 14px; padding: 24px; border: 1px solid var(--line);
}
.flow-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; align-items: stretch; }
.flow-node {
    background: var(--paper); border: 1.5px solid var(--line); border-radius: 12px;
    padding: 14px 10px; text-align: center; position: relative; transition: all .2s;
}
.flow-node.ai { border-color: var(--moon); background: var(--moon-soft); }
.flow-node.handoff { border-color: var(--cinnabar); background: var(--cinnabar-soft); }
.flow-node.expert { border-color: var(--jade); background: var(--jade-soft); }
.flow-node .ico { font-size: 24px; margin-bottom: 6px; }
.flow-node h6 { font-family: "STKaiti", serif; font-size: 13px; margin-bottom: 4px; }
.flow-node p { font-size: 11px; color: var(--ink-muted); line-height: 1.5; }
.flow-node:not(:last-child)::after {
    content: '→'; position: absolute; right: -10px; top: 50%; transform: translateY(-50%);
    color: var(--ink-muted); font-size: 16px; font-weight: 700;
}

// View Switcher
.view-switcher {
    background: var(--paper); border: 1px solid var(--line); border-radius: 14px;
    padding: 14px 18px; box-shadow: var(--shadow);
    display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
}
.view-switcher-label {
    font-family: "STKaiti", serif; font-size: 14px; color: var(--ink); font-weight: 600;
    display: flex; align-items: center; gap: 8px;
}
.view-switcher-label::before {
    content: ''; width: 4px; height: 16px; background: var(--cinnabar); border-radius: 2px;
}
.view-tabs {
    display: flex; gap: 6px; background: var(--cream); padding: 4px;
    border-radius: 24px; flex: 1; min-width: 320px;
}
.view-tab {
    flex: 1; background: transparent; border: none; padding: 9px 18px;
    border-radius: 20px; font-family: inherit; font-size: 13px;
    color: var(--ink-muted); cursor: pointer; transition: all .25s; font-weight: 500;
}
.view-tab:hover { color: var(--ink); }
.view-tab.active {
    background: var(--paper); color: var(--jade); font-weight: 600;
    box-shadow: var(--shadow);
}
.view-pane { animation: fadeIn .3s ease; }
.view-explain {
    margin-top: 14px; padding: 14px 18px; border-radius: 12px;
    background: var(--paper-warm); border-left: 3px solid var(--jade);
    display: flex; gap: 12px; align-items: flex-start; font-size: 13px; color: var(--ink-soft);
    line-height: 1.7;
}
.view-explain.expert { border-left-color: var(--gold); background: #FFFCF3; }
.view-explain .ve-ico { font-size: 22px; flex-shrink: 0; }
.view-explain strong { color: var(--ink); }
.view-explain em { color: var(--cinnabar); font-style: normal; font-weight: 600; padding: 0 2px; }

// Chat Shell
.chat-shell {
    background: var(--paper); border-radius: 14px; box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4); overflow: hidden;
    display: grid; grid-template-columns: 1fr 280px; min-height: 600px;
}
.chat-main { display: flex; flex-direction: column; border-right: 1px solid var(--line-soft); }
.chat-head {
    padding: 16px 20px; border-bottom: 1px solid var(--line-soft);
    display: flex; align-items: center; gap: 12px; background: var(--paper-warm);
}
.chat-head .ava {
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg, var(--jade), var(--bamboo)); color: white;
    display: flex; align-items: center; justify-content: center; font-family: "STKaiti", serif; font-size: 18px; font-weight: 700;
}
.chat-head .who { flex: 1; }
.chat-head .who h4 { font-family: "STKaiti", serif; font-size: 16px; margin-bottom: 2px; display: flex; align-items: center; gap: 8px; }
.chat-head .who .sub { font-size: 12px; color: var(--ink-muted); }
.chat-body {
    flex: 1; padding: 20px; overflow-y: auto;
    display: flex; flex-direction: column; gap: 14px;
    background: linear-gradient(to bottom, var(--cream) 0%, var(--paper-warm) 100%);
    max-height: 480px;
}
.msg-row { display: flex; gap: 10px; max-width: 80%; }
.msg-row.me { align-self: flex-end; flex-direction: row-reverse; }
.msg-row.sys { align-self: center; max-width: 88%; }
.msg-avatar {
    width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 600;
}
.msg-avatar.ai { background: var(--moon-soft); color: var(--moon); }
.msg-avatar.user { background: var(--gold-soft); color: var(--gold-deep); }
.msg-avatar.expert { background: linear-gradient(135deg, var(--jade), var(--bamboo)); color: white; }
.bubble-wrap { display: flex; flex-direction: column; gap: 4px; }
.msg-row.me .bubble-wrap { align-items: flex-end; }
.bub-tag {
    display: inline-block; font-size: 10px; padding: 1px 7px; border-radius: 4px;
    background: var(--moon-soft); color: var(--moon); font-weight: 600;
}
.bubble {
    padding: 10px 14px; border-radius: 12px; font-size: 13.5px; line-height: 1.6;
    box-shadow: 0 1px 4px rgba(60, 50, 30, 0.04);
}
.bub-ai { background: var(--moon-soft); color: var(--ink); border-top-left-radius: 4px; }
.bub-user { background: var(--paper); color: var(--ink); border: 1px solid var(--line); border-top-left-radius: 4px; }
.bub-me { background: var(--jade); color: white; border-top-right-radius: 4px; }
.bub-me.handoff { background: var(--cinnabar); }
.sys-tip {
    background: var(--cinnabar-soft); color: var(--cinnabar);
    border-radius: 10px; padding: 8px 16px; font-size: 12px; text-align: center;
    border: 1px dashed rgba(179, 60, 44, 0.3);
}
.sys-tip.success { background: var(--bamboo-soft); color: var(--bamboo); border-color: rgba(91, 140, 90, 0.3); }
.ai-summary {
    background: #FFFCF3; border: 1.5px dashed var(--gold); border-radius: 12px;
    padding: 14px 16px; align-self: stretch; max-width: none;
}
.ai-summary h6 {
    font-family: "STKaiti", serif; font-size: 14px; color: var(--gold-deep);
    margin-bottom: 10px; display: flex; align-items: center; gap: 6px; font-weight: 600;
}
.ai-summary h6 .seal { background: var(--gold); color: white; font-size: 10px; padding: 2px 6px; border-radius: 3px; margin-left: auto; font-weight: 600; }
.ai-summary dl { display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; font-size: 12.5px; }
.ai-summary dt { color: var(--ink-muted); font-weight: 600; }
.ai-summary dd { color: var(--ink); }
.ai-summary .risk { color: var(--cinnabar); font-weight: 600; }

.chat-input {
    background: var(--paper); border-top: 1px solid var(--line-soft); padding: 14px;
    display: flex; gap: 10px; align-items: center;
}
.handoff-chip {
    background: var(--cinnabar-soft); color: var(--cinnabar); border: 1px solid rgba(179, 60, 44, 0.25);
    border-radius: 16px; padding: 7px 14px; font-size: 12px; cursor: pointer; font-weight: 600;
    font-family: inherit; flex-shrink: 0;
}
.handoff-chip:hover { background: var(--cinnabar); color: white; }
.chat-input input {
    flex: 1; border: 1px solid var(--line); border-radius: 18px; padding: 9px 16px;
    font-size: 13px; font-family: inherit; outline: none; background: var(--paper-warm);
}
.chat-input input:focus { border-color: var(--jade); background: var(--paper); }

.chat-side { padding: 20px; overflow-y: auto; background: var(--paper-warm); }
.chat-side h5 {
    font-family: "STKaiti", serif; font-size: 14px; color: var(--ink);
    margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--line-soft);
    display: flex; align-items: center; gap: 6px;
}
.chat-side h5 .dot { width: 3px; height: 12px; background: var(--jade); border-radius: 2px; }
.archive-list { font-size: 12px; line-height: 1.9; }
.archive-list .ar-row { display: flex; justify-content: space-between; padding: 2px 0; }
.archive-list .ar-row span:first-child { color: var(--ink-muted); }
.archive-list .ar-row span:last-child { color: var(--ink); font-weight: 500; }
.side-section { margin-top: 20px; }
.recommend-item {
    display: flex; gap: 10px; padding: 10px; background: var(--paper);
    border-radius: 10px; margin-bottom: 8px; cursor: pointer; align-items: center;
    border: 1px solid var(--line); font-size: 12px;
}
.recommend-item .ico { width: 32px; height: 32px; border-radius: 8px; background: var(--jade-soft); color: var(--jade); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.recommend-item .info { flex: 1; min-width: 0; }
.recommend-item h6 { font-size: 12px; margin-bottom: 2px; }
.recommend-item .meta { font-size: 11px; color: var(--ink-muted); }

// Triage Shell
.triage-shell {
    background: var(--paper); border-radius: 14px; box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4); overflow: hidden;
    display: grid; grid-template-columns: 220px 1fr 240px; min-height: 640px;
}
.triage-queue {
    background: var(--paper-warm); border-right: 1px solid var(--line-soft);
    display: flex; flex-direction: column;
}
.queue-tabs {
    display: flex; padding: 12px; gap: 4px; border-bottom: 1px solid var(--line-soft);
    background: var(--paper);
}
.queue-tab {
    flex: 1; padding: 8px; background: transparent; border: none; font-family: inherit;
    font-size: 12px; color: var(--ink-muted); cursor: pointer; border-radius: 6px; transition: all .2s;
}
.queue-tab.on { background: var(--jade-soft); color: var(--jade); font-weight: 600; }
.queue-list { flex: 1; overflow-y: auto; }
.q-item {
    padding: 14px; border-bottom: 1px solid var(--line-soft); cursor: pointer;
    position: relative; transition: all .2s;
}
.q-item:hover { background: var(--paper); }
.q-item.active { background: var(--paper); border-left: 3px solid var(--jade); padding-left: 11px; }
.q-item .q-head { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.q-item .q-ava {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--moon-soft); color: var(--moon);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600;
}
.q-item .q-name { font-size: 13px; font-weight: 600; }
.q-item .q-preview { font-size: 12px; color: var(--ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-left: 40px; }
.q-item .q-time { font-size: 11px; margin-top: 4px; margin-left: 40px; color: var(--ink-muted); }
.q-item .q-time.urgent { color: var(--cinnabar); font-weight: 600; }
.q-item .red-dot {
    position: absolute; top: 14px; right: 14px; width: 8px; height: 8px;
    background: var(--cinnabar); border-radius: 50%;
}

.triage-conv { display: flex; flex-direction: column; background: var(--paper); }
.triage-conv .chat-body { max-height: 540px; }
.triage-side { padding: 18px; background: var(--paper-warm); border-left: 1px solid var(--line-soft); overflow-y: auto; }

.switch-row {
    display: flex; justify-content: space-between; align-items: center; padding: 8px 0;
    font-size: 13px; color: var(--ink-soft); cursor: pointer;
}
.switch-row .toggle {
    width: 36px; height: 20px; background: var(--jade); border-radius: 10px;
    position: relative; transition: background .2s;
}
.switch-row .toggle::after {
    content: ''; position: absolute; top: 2px; right: 2px; width: 16px; height: 16px;
    background: white; border-radius: 50%; transition: all .2s;
}
.switch-row.off .toggle { background: var(--line); }
.switch-row.off .toggle::after { left: 2px; right: auto; }

.keyword-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.keyword-list span { font-size: 11px; padding: 3px 8px; background: var(--moon-soft); color: var(--moon); border-radius: 8px; }

// Profile Cover
.profile-cover {
    background: linear-gradient(135deg, var(--jade) 0%, var(--moon) 100%);
    border-radius: 16px; padding: 32px; color: white;
    position: relative; overflow: hidden;
}
.profile-cover::after {
    content: '荷'; position: absolute; right: 40px; top: 50%; transform: translateY(-50%);
    font-family: "STKaiti", serif; font-size: 140px; color: rgba(255,255,255,0.12); font-weight: 700;
}
.profile-cover .ava-big {
    width: 80px; height: 80px; border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--gold-deep));
    border: 3px solid white; display: flex; align-items: center; justify-content: center;
    font-size: 32px; font-family: "STKaiti", serif; font-weight: 700;
    margin-bottom: 14px; box-shadow: var(--shadow-lg);
}
.profile-cover h2 { font-family: "STKaiti", serif; font-size: 22px; margin-bottom: 4px; }
.profile-cover p { font-size: 13px; opacity: 0.9; }
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-cell { background: var(--paper-warm); border-radius: 12px; padding: 18px; text-align: center; border: 1px solid var(--line); }
.stat-cell .n { font-family: "STKaiti", serif; font-size: 26px; font-weight: 700; color: var(--jade); }
.stat-cell .l { font-size: 12px; color: var(--ink-muted); margin-top: 4px; }

.grow-card {
    background: linear-gradient(135deg, #FFFCF3 0%, #FAE5E0 100%);
    border: 2px solid var(--gold); border-radius: 16px; padding: 28px;
    position: relative; overflow: hidden;
}
.grow-card::before {
    content: '印'; position: absolute; right: 30px; top: 50%; transform: translateY(-50%);
    font-family: "STKaiti", serif; font-size: 130px; color: rgba(201, 165, 92, 0.15);
    font-weight: 700;
}
.grow-card .new-tag {
    display: inline-block; background: var(--cinnabar); color: white;
    font-size: 11px; padding: 3px 10px; border-radius: 6px; font-weight: 700;
    letter-spacing: 0.1em; margin-bottom: 10px;
}
.grow-card h3 { font-family: "STKaiti", serif; color: var(--gold-deep); font-size: 22px; margin-bottom: 8px; }
.grow-card p { font-size: 14px; color: var(--ink-soft); margin-bottom: 16px; max-width: 580px; }
.benefit-row { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
.benefit { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink); }
.benefit .ico {
    width: 28px; height: 28px; border-radius: 50%; background: white;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
}

.menu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.menu-cell {
    background: var(--paper-warm); border: 1px solid var(--line); border-radius: 12px;
    padding: 18px; display: flex; align-items: center; gap: 12px; cursor: pointer;
    transition: all .2s;
}
.menu-cell:hover { transform: translateY(-2px); box-shadow: var(--shadow); border-color: var(--jade-light); }
.menu-cell .ico {
    width: 40px; height: 40px; border-radius: 10px; background: var(--jade-soft); color: var(--jade);
    display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
}
.menu-cell .info h5 { font-size: 14px; margin-bottom: 2px; }
.menu-cell .info p { font-size: 11px; color: var(--ink-muted); }

// Stepper
.stepper {
    display: flex; align-items: center; gap: 0; padding: 8px 0; max-width: 720px; margin: 0 auto;
}
.step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; }
.step .num {
    width: 40px; height: 40px; border-radius: 50%; background: var(--paper); border: 2px solid var(--line);
    display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;
    color: var(--ink-muted); z-index: 1; font-family: "STKaiti", serif;
}
.step.done .num { background: var(--bamboo); border-color: var(--bamboo); color: white; }
.step.on .num { background: var(--gold); border-color: var(--gold); color: white; box-shadow: 0 0 0 5px var(--gold-soft); }
.step .lab { font-size: 12px; margin-top: 8px; color: var(--ink-muted); }
.step.done .lab, .step.on .lab { color: var(--ink); font-weight: 600; }
.step:not(:last-child)::after {
    content: ''; position: absolute; top: 19px; left: calc(50% + 22px); right: calc(-50% + 22px);
    height: 2px; background: var(--line);
}
.step.done:not(:last-child)::after { background: var(--bamboo); }

// Role Grid
.role-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.role-card {
    background: var(--paper-warm); border: 2px solid var(--line); border-radius: 14px;
    padding: 18px; cursor: pointer; transition: all .2s; text-align: center;
}
.role-card:hover { border-color: var(--gold); transform: translateY(-2px); }
.role-card.active { border-color: var(--gold); background: var(--gold-soft); }
.role-card .ico { font-size: 36px; margin-bottom: 8px; }
.role-card h5 { font-family: "STKaiti", serif; font-size: 15px; margin-bottom: 6px; }
.role-card .req { font-size: 11px; color: var(--ink-muted); line-height: 1.5; white-space: pre-line; }
.role-card .perm {
    font-size: 11px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--line);
    color: var(--jade); white-space: pre-line;
}
.role-card.active .perm { color: var(--gold-deep); }

// Upload
.upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.upload-slot {
    border: 2px dashed var(--line); border-radius: 12px; padding: 22px;
    text-align: center; background: var(--paper-warm); font-size: 13px; color: var(--ink-muted);
    cursor: pointer; transition: all .2s; position: relative;
}
.upload-slot:hover { border-color: var(--jade); color: var(--jade); }
.upload-slot .ico { font-size: 32px; margin-bottom: 6px; display: block; }
.upload-slot.done { border-style: solid; border-color: var(--bamboo); background: var(--bamboo-soft); color: var(--bamboo); }
.upload-slot.done .ico { color: var(--bamboo); }
.upload-slot .req-tag {
    position: absolute; top: 10px; right: 12px; font-size: 10px; padding: 2px 6px;
    background: var(--cinnabar-soft); color: var(--cinnabar); border-radius: 4px; font-weight: 600;
}
.upload-slot .req-tag.optional { background: var(--gold-soft); color: var(--gold-deep); }
.upload-slot.done .req-tag { background: var(--bamboo); color: white; }
.upload-slot.done .req-tag.optional { background: var(--bamboo); }

.privacy-note {
    background: var(--paper-warm); border-left: 3px solid var(--moon);
    padding: 14px 16px; border-radius: 8px; font-size: 12px; color: var(--ink-muted);
    line-height: 1.7;
}

// Expert Hero
.expert-hero {
    background: linear-gradient(135deg, var(--jade) 0%, var(--bamboo) 100%);
    border-radius: 16px; padding: 32px; color: white;
    position: relative; overflow: hidden;
}
.expert-hero::after {
    content: '醫'; position: absolute; right: 40px; top: 50%; transform: translateY(-50%);
    font-family: "STKaiti", serif; font-size: 160px; color: rgba(255,255,255,0.12); font-weight: 700;
}
.expert-hero .greet { font-family: "STKaiti", serif; font-size: 24px; margin-bottom: 4px; }
.expert-hero .greet-sub { font-size: 13px; opacity: 0.9; margin-bottom: 24px; }
.expert-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.expert-stat {
    background: rgba(255,255,255,0.18); border-radius: 10px; padding: 14px; text-align: center;
    backdrop-filter: blur(10px);
}
.expert-stat .n { font-family: "STKaiti", serif; font-size: 24px; font-weight: 700; }
.expert-stat .l { font-size: 11px; opacity: 0.9; margin-top: 4px; }
.expert-stat.urgent { background: var(--cinnabar); }

.quick-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.quick-cell {
    background: var(--paper-warm); border: 1px solid var(--line); border-radius: 12px;
    padding: 16px 10px; text-align: center; cursor: pointer; transition: all .2s; position: relative;
}
.quick-cell:hover { transform: translateY(-2px); box-shadow: var(--shadow); background: var(--paper); }
.quick-cell .ico { font-size: 26px; margin-bottom: 6px; }
.quick-cell .lab { font-size: 12px; color: var(--ink-soft); font-weight: 500; }
.quick-cell .badge {
    position: absolute; top: 8px; right: 8px; background: var(--cinnabar); color: white;
    font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 700;
}

.work-list { display: flex; flex-direction: column; gap: 10px; }
.work-row {
    background: var(--paper-warm); border: 1px solid var(--line); border-radius: 12px;
    padding: 14px; display: flex; gap: 14px; align-items: center; cursor: pointer; transition: all .2s;
}
.work-row:hover { background: var(--paper); border-color: var(--jade-light); }
.work-row .thumb {
    width: 56px; height: 56px; border-radius: 10px; flex-shrink: 0;
    background: var(--jade-soft); color: var(--jade);
    display: flex; align-items: center; justify-content: center; font-size: 24px;
}
.work-row.review .thumb { background: var(--gold-soft); color: var(--gold-deep); }
.work-row.rejected .thumb { background: var(--cinnabar-soft); color: var(--cinnabar); }
.work-row .info { flex: 1; min-width: 0; }
.work-row h5 { font-size: 14px; margin-bottom: 4px; }
.work-row .meta { font-size: 12px; color: var(--ink-muted); display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.work-row .actions { display: flex; gap: 6px; }

// Legend
.legend-strip {
    display: flex; gap: 18px; flex-wrap: wrap; padding: 14px 18px;
    background: var(--paper-warm); border: 1px dashed var(--line); border-radius: 10px;
    font-size: 12px; color: var(--ink-muted); margin-top: 18px;
}
.legend-strip i {
    display: inline-block; width: 14px; height: 14px; border-radius: 3px;
    vertical-align: middle; margin-right: 6px;
}

// Toast
.toast {
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: var(--ink); color: white; padding: 12px 24px; border-radius: 24px;
    font-size: 13px; box-shadow: var(--shadow-lg); opacity: 0; transition: all .3s;
    z-index: 1000; pointer-events: none;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(-6px); }

@media (max-width: 1024px) {
    .triage-shell { grid-template-columns: 180px 1fr; }
    .triage-side { display: none; }
    .quick-grid { grid-template-columns: repeat(3, 1fr); }
    .role-grid { grid-template-columns: repeat(2, 1fr); }
    .flow-grid { grid-template-columns: 1fr 1fr; }
    .flow-node:nth-child(odd):not(:last-child)::after { content: ''; }
}
</style>
