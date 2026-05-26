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
        <nav class="tabs" :style="{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }">
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
                <div class="card" style="border: none;" :style="{ background: solarTerm ? `linear-gradient(135deg, ${solarTerm.gradientFrom} 0%, ${solarTerm.gradientTo} 100%)` : 'linear-gradient(135deg, #F5EBD3 0%, #E8F0EC 100%)' }">
                    <div style="display:flex; align-items:center; gap:24px;">
                        <div style="font-family: 'STKaiti', serif; font-size:64px; color: var(--gold-deep); font-weight:700;">{{ solarTerm?.name ?? '立夏' }}</div>
                        <div style="flex:1;">
                            <div style="font-size:13px; color: var(--gold-deep); letter-spacing:3px; margin-bottom:4px;">{{ solarTermDateLabel || '2026 · 5 · 5 · 节气专题' }}</div>
                            <h3 style="font-family:'STKaiti',serif; font-size:22px; margin-bottom:6px;">名家说节气 · 顺应天时而养</h3>
                            <p style="color: var(--ink-muted); font-size:14px;">{{ solarTerm?.name ?? '立夏' }}时节，中医专家带你从作息、饮食、运动三方面调养心阳，{{ solarTerm?.name ?? '立夏' }}专题已收录 12 篇医师原创内容。</p>
                        </div>
                        <button class="btn btn-gold">进入专题</button>
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
            <!-- 未登录提示 -->
            <div v-if="!isLoggedIn" class="login-prompt-card">
                <div class="login-prompt-icon">🔒</div>
                <h3 class="font-serif">请先登录</h3>
                <p>登录后即可查看推荐专家、发起在线咨询</p>
                <button class="btn btn-gold" @click="router.push('/login')">立即登录</button>
            </div>
            <div v-else class="space-y">
                <!-- 推荐专家（认证专家不显示） -->
                <div v-if="!isExpertView" class="card">
                    <div class="card-title">
                        <span class="dot"></span>推荐专家
                        <span class="extra">{{ expertList.length > 0 ? `共 ${expertList.length} 位 · 选择专家开始咨询` : '加载中…' }}</span>
                    </div>
                    <div class="doctor-grid">
                        <div v-for="doc in displayedExperts" :key="doc.id" class="doctor-card">
                            <!-- 山水背景装饰 -->
                            <svg class="doctor-mountain" viewBox="0 0 400 120" fill="none">
                                <path d="M0 80 C60 50 90 90 150 70 C210 50 260 95 320 65 C360 45 385 70 400 55 L400 120 L0 120 Z" fill="#6f8f7b"/>
                            </svg>
                            <!-- 头像（金色渐变边框环） -->
                            <div class="doctor-avatar-wrap">
                                <img v-if="avatarUrl(doc)" :src="avatarUrl(doc)!" class="doctor-avatar" />
                                <div v-else class="doctor-avatar doctor-avatar-text">{{ avatarText(doc) }}</div>
                            </div>
                            <!-- 姓名 -->
                            <div class="doctor-name font-serif">{{ doc.realName }}</div>
                            <!-- 专家标签 -->
                            <div class="doctor-tag">名医专家</div>
                            <!-- 职称（带装饰横线） -->
                            <div class="doctor-title">{{ roleLabel(doc.roleType) }}</div>
                            <!-- 渐变分割线 -->
                            <div class="doctor-divider"></div>
                            <!-- 简介 -->
                            <div class="doctor-bio">{{ doc.bio || '暂无简介' }}</div>
                            <!-- 咨询按钮 -->
                            <button class="doctor-consult-btn" @click.stop="startConsult(doc)">向TA咨询 ›</button>
                        </div>
                    </div>
                    <!-- 查看更多 -->
                    <div v-if="expertList.length > 3" class="expert-expand">
                        <button class="expert-expand-btn" @click="openExpertModal">
                            查看更多 {{ expertList.length - 3 }} 位专家
                        </button>
                    </div>
                </div>

                <!-- 普通用户咨询区（认证专家不显示） -->
                <div v-if="!isExpertView">
                    <!-- 未选专家：引导提示 -->
                    <div v-if="!selectedExpert" class="consult-placeholder">
                        <div class="placeholder-icon">💬</div>
                        <p>请从上方专家列表中选择一位，点击「向TA咨询」开始问诊</p>
                    </div>

                    <!-- 已选专家：聊天界面 -->
                    <div v-else ref="chatShellRef" class="chat-shell">
                        <div class="chat-main">
                            <div class="chat-head">
                                <button class="btn btn-ghost btn-sm" @click="resetConsult">← 重新选择</button>
                                <div class="ava font-serif">{{ avatarText(selectedExpert) }}</div>
                                <div class="who">
                                    <h4>{{ selectedExpert.realName }} {{ roleLabel(selectedExpert.roleType) }} <span class="pill pill-jade">在线</span></h4>
                                    <div class="sub">{{ selectedExpert.bio || '暂无简介' }}</div>
                                </div>
                            </div>

                            <div class="chat-body" ref="chatBodyEl">
                                <div v-for="(msg, idx) in consultMessages" :key="idx">
                                    <div v-if="msg.kind === 'me'" class="msg-row me">
                                        <div class="msg-avatar user">{{ userStore.G_LoginInfo.nickName?.charAt(0) || '我' }}</div>
                                        <div class="bubble-wrap">
                                            <div class="bubble" :class="msg.handoff ? 'bub-me handoff' : 'bub-me'">{{ msg.text }}</div>
                                        </div>
                                    </div>
                                    <div v-else-if="msg.kind === 'ai'" class="msg-row">
                                        <div class="msg-avatar ai">AI</div>
                                        <div class="bubble-wrap">
                                            <span v-if="msg.tag" class="bub-tag">{{ msg.tag }}</span>
                                            <div class="bubble bub-ai">{{ msg.text }}</div>
                                        </div>
                                    </div>
                                    <div v-else-if="msg.kind === 'sys'" class="msg-row sys">
                                        <div class="sys-tip" :class="{ success: msg.success }">{{ msg.text }}</div>
                                    </div>
                                    <div v-else-if="msg.kind === 'expert'" class="msg-row">
                                        <div class="msg-avatar expert">{{ avatarText(selectedExpert) }}</div>
                                        <div class="bubble-wrap">
                                            <div class="bubble bub-user">{{ msg.text }}</div>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="showAiSummary" class="ai-summary">
                                    <h6>📋 AI 预问诊小结（已自动移交医生）<span class="seal">已留痕</span></h6>
                                    <dl v-if="aiSummary">
                                        <dt>主诉</dt><dd>{{ aiSummary.mainComplaint || '未提及' }}</dd>
                                        <dt>病程</dt><dd>{{ aiSummary.courseOfDisease || '未提及' }}</dd>
                                        <dt>症状</dt><dd>{{ aiSummary.symptoms?.join('、') || '暂无' }}</dd>
                                        <dt>诱因</dt><dd>{{ aiSummary.trigger || '未提及' }}</dd>
                                        <dt>风险初筛</dt>
                                        <dd class="risk">{{ aiSummary.riskLevel === 'high' ? '高' : aiSummary.riskLevel === 'medium' ? '中' : '低' }}
                                            · {{ aiSummary.suggestionDirection }}</dd>
                                    </dl>
                                    <p v-else style="font-size:12px; color:var(--ink-muted);">AI 小结生成中…</p>
                                </div>
                            </div>

                            <div class="chat-input">
                                <button class="handoff-chip" @click="triggerHandoff">🔄 转人工</button>
                                <input type="text" v-model="chatInputText" placeholder="输入您想咨询的问题…" @keydown.enter="sendMessage" />
                                <button class="btn btn-sm" @click="sendMessage">发送</button>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- 认证专家视角：接诊队列 -->
                <div v-if="isExpertView" class="view-pane">
                    <div class="triage-shell">
                        <!-- 左侧队列 -->
                        <div class="triage-queue">
                            <div class="queue-tabs">
                                <button class="queue-tab" :class="{ on: queueTab === 'pending' }" @click="queueTab = 'pending'">
                                    待接诊 {{ pendingList.length }}
                                </button>
                                <button class="queue-tab" :class="{ on: queueTab === 'active' }" @click="queueTab = 'active'">
                                    咨询中 {{ activeList.length }}
                                </button>
                            </div>
                            <div class="queue-list">
                                <template v-if="queueTab === 'pending'">
                                    <div v-if="pendingList.length === 0" class="q-empty">暂无待接诊用户</div>
                                    <div
                                        v-for="item in pendingList"
                                        :key="item.sessionId"
                                        class="q-item"
                                        :class="{ active: expertSessionId === item.sessionId }"
                                        @click="openExpertSession(item)"
                                    >
                                        <div class="q-head">
                                            <div class="q-ava">{{ (item.userNickname || '?').charAt(0) }}</div>
                                            <span class="q-name">{{ item.userNickname || '用户' }}</span>
                                            <span class="pill pill-cinnabar">转人工</span>
                                        </div>
                                        <div class="q-preview">{{ item.lastMessage || '暂无消息' }}</div>
                                        <div class="q-time urgent">{{ item.lastMessageAt ? formatTime(item.lastMessageAt) : '' }} · 请尽快接入</div>
                                        <span class="red-dot"></span>
                                    </div>
                                </template>
                                <template v-else>
                                    <div v-if="activeList.length === 0" class="q-empty">暂无咨询中用户</div>
                                    <div
                                        v-for="item in activeList"
                                        :key="item.sessionId"
                                        class="q-item"
                                        :class="{ active: expertSessionId === item.sessionId }"
                                        @click="openExpertSession(item)"
                                    >
                                        <div class="q-head">
                                            <div class="q-ava">{{ (item.userNickname || '?').charAt(0) }}</div>
                                            <span class="q-name">{{ item.userNickname || '用户' }}</span>
                                            <span class="pill pill-jade">咨询中</span>
                                        </div>
                                        <div class="q-preview">{{ item.lastMessage || '暂无消息' }}</div>
                                        <div class="q-time">{{ item.lastMessageAt ? formatTime(item.lastMessageAt) : '' }}</div>
                                    </div>
                                </template>
                            </div>
                        </div>

                        <!-- 右侧会话面板 -->
                        <div class="triage-conv">
                            <div v-if="!expertSessionId" style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--ink-muted);font-size:14px;">
                                从左侧选择一位患者开始接诊
                            </div>
                            <template v-else>
                                <div class="chat-head">
                                    <div class="ava" style="background:linear-gradient(135deg,var(--gold),var(--cinnabar));">
                                        {{ (currentExpertSession?.userNickname || '?').charAt(0) }}
                                    </div>
                                    <div class="who">
                                        <h4>{{ currentExpertSession?.userNickname || '用户' }} <span class="pill pill-jade">咨询中</span></h4>
                                        <div class="sub">会话 #{{ expertSessionId }}</div>
                                    </div>
                                    <button class="btn btn-ghost btn-sm">结束咨询</button>
                                </div>

                                <div class="chat-body" style="max-height:540px;" ref="expertChatBodyEl">
                                    <div v-if="expertLoadingMessages" style="text-align:center;padding:20px;color:var(--ink-muted);">加载中…</div>
                                    <template v-else>
                                        <div v-for="msg in expertMessages" :key="msg.id">
                                            <div v-if="msg.senderType === 'user'" class="msg-row me">
                                                <div class="msg-avatar user">{{ (currentExpertSession?.userNickname || '?').charAt(0) }}</div>
                                                <div class="bubble-wrap"><div class="bubble bub-user">{{ msg.content }}</div></div>
                                            </div>
                                            <div v-else-if="msg.senderType === 'ai' && msg.contentType === 'text'" class="msg-row">
                                                <div class="msg-avatar ai">AI</div>
                                                <div class="bubble-wrap">
                                                    <span class="bub-tag">智能预问诊</span>
                                                    <div class="bubble bub-ai">{{ msg.content }}</div>
                                                </div>
                                            </div>
                                            <div v-else-if="msg.contentType === 'ai_summary'" class="ai-summary">
                                                <h6>📋 AI 预问诊小结<span class="seal">已留痕</span></h6>
                                                <p style="font-size:12px;color:var(--ink-muted);">（小结已记录）</p>
                                            </div>
                                            <div v-else-if="msg.senderType === 'expert'" class="msg-row me">
                                                <div class="msg-avatar expert">我</div>
                                                <div class="bubble-wrap"><div class="bubble bub-me">{{ msg.content }}</div></div>
                                            </div>
                                            <div v-else-if="msg.contentType === 'system_event'" class="msg-row sys">
                                                <div class="sys-tip">{{ msg.content }}</div>
                                            </div>
                                        </div>
                                    </template>
                                </div>

                                <div class="chat-input">
                                    <button class="handoff-chip" style="background:var(--gold-soft);color:var(--gold-deep);border-color:rgba(201,165,92,.4);">💬 快捷回复</button>
                                    <input type="text" v-model="expertChatInput" placeholder="输入回复内容…" @keydown.enter="sendExpertMessage" />
                                    <button class="btn btn-sm" @click="sendExpertMessage">发送</button>
                                </div>
                            </template>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <!-- ===== Module 3: 个人主页 ===== -->
        <div v-show="activeTab === 'm3'" class="panel">
            <div class="space-y">
                <div class="profile-cover">
                    <img v-if="userStore.G_UserInfo.avatar" :src="userStore.G_UserInfo.avatar" class="ava-big" style="object-fit:cover;" />
                    <div v-else class="ava-big">{{ profileAvatarText }}</div>
                    <h2>{{ userStore.G_LoginInfo.nickName || '未登录' }}</h2>
                    <p>{{ profileRole }} · 已注册 {{ profileDays }} 天 · ID {{ profileId }}</p>
                </div>

                <div class="stat-grid">
                    <div class="stat-cell"><div class="n">12</div><div class="l">收藏内容</div></div>
                    <div class="stat-cell"><div class="n">3</div><div class="l">已购课程</div></div>
                    <div class="stat-cell"><div class="n">5</div><div class="l">咨询次数</div></div>
                    <div class="stat-cell"><div class="n">2</div><div class="l">关注专家</div></div>
                </div>

                <!-- 仅普通用户显示认证引导 -->
                <div v-if="!isExpertView" class="grow-card">
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

</main>

        <div class="toast" :class="{ show: toastVisible }">{{ toastMsg }}</div>

        <!-- 排队提示弹窗 -->
        <Teleport to="body">
            <div v-if="showQueueDialog" class="queue-dialog-overlay" @click.self="showQueueDialog = false">
                <div class="queue-dialog">
                    <div class="queue-dialog-icon">⏳</div>
                    <h3 class="font-serif">正在排队中，请稍后…</h3>
                    <p>您的咨询请求已提交，医生接入后会第一时间通知您。</p>
                    <button class="btn btn-gold" @click="showQueueDialog = false">我知道了</button>
                </div>
            </div>
        </Teleport>

        <!-- ===== 全部专家弹窗 ===== -->
        <Teleport to="body">
            <div v-if="showExpertModal" class="expert-modal-overlay">
                <div class="expert-modal">
                    <!-- 头部：返回 + 标题 -->
                    <div class="expert-modal-header">
                        <button class="expert-modal-back" @click="showExpertModal = false">← 返回</button>
                        <span class="expert-modal-title font-serif">全部专家 · {{ expertList.length }} 位</span>
                    </div>
                    <!-- 职称筛选 Tab -->
                    <div class="expert-filter-bar">
                        <button
                            v-for="tab in roleFilterTabs"
                            :key="tab.key"
                            :class="['expert-filter-tab', { active: activeRoleFilter === tab.key }]"
                            @click="activeRoleFilter = tab.key"
                        >
                            {{ tab.label }}（{{ tab.count }}）
                        </button>
                    </div>
                    <!-- 卡片列表 -->
                    <div class="expert-modal-body">
                        <div v-if="filteredModalExperts.length > 0" class="doctor-grid">
                            <div v-for="doc in filteredModalExperts" :key="doc.id" class="doctor-card">
                                <svg class="doctor-mountain" viewBox="0 0 400 120" fill="none">
                                    <path d="M0 80 C60 50 90 90 150 70 C210 50 260 95 320 65 C360 45 385 70 400 55 L400 120 L0 120 Z" fill="#6f8f7b"/>
                                </svg>
                                <div class="doctor-avatar-wrap">
                                    <img v-if="avatarUrl(doc)" :src="avatarUrl(doc)!" class="doctor-avatar" />
                                    <div v-else class="doctor-avatar doctor-avatar-text">{{ avatarText(doc) }}</div>
                                </div>
                                <div class="doctor-name font-serif">{{ doc.realName }}</div>
                                <div class="doctor-tag">名医专家</div>
                                <div class="doctor-title">{{ roleLabel(doc.roleType) }}</div>
                                <div class="doctor-divider"></div>
                                <div class="doctor-bio">{{ doc.bio || '暂无简介' }}</div>
                                <button class="doctor-consult-btn" @click.stop="startConsultFromModal(doc)">向TA咨询 ›</button>
                            </div>
                        </div>
                        <div v-else class="expert-empty">该职称下暂无专家</div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import HeaderLayout from "@/layouts/HeaderLayout.vue";
import { useUserStore } from "@/store/user";
import { ApiCircle, ApiExpert, ApiConsult } from "@/network";
import { useConsultSocket } from "@/composables/useConsultSocket";

// ---- Role view ----
const router = useRouter();
const userStore = useUserStore();
const isLoggedIn = computed(() => !!userStore.G_LoginInfo.id);
const isExpertView = computed(() => userStore.G_UserInfo.role_id === 2);
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
const visibleTabs = computed(() => {
    const r = userStore.G_UserInfo.role_id;
    return allTabs.filter(t => {
        if (t.name === 'm4') return r === 1;  // 专家认证仅普通用户可见
        if (t.name === 'm5') return r === 2;  // 专家工作台仅认证专家可见
        return true;
    });
});

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

// ---- 个人主页动态信息 ----
/** 用户 ID 补零至 5 位，如 1 → 00001 */
const profileId = computed(() =>
    String(userStore.G_LoginInfo.id || 0).padStart(5, '0')
);
/** 角色文字 */
const profileRole = computed(() => {
    const r = userStore.G_UserInfo.role_id;
    if (r === 3) return '管理员';
    if (r === 2) return '认证专家';
    return '普通用户';
});
/** 从注册时间到今天的天数 */
const profileDays = computed(() => {
    const ct = userStore.G_UserInfo.create_time;
    if (!ct) return 0;
    return Math.floor((Date.now() - new Date(ct).getTime()) / 86400000);
});
/** 头像不存在时取昵称首字 */
const profileAvatarText = computed(() =>
    (userStore.G_LoginInfo.nickName || '?').charAt(0)
);

// ---- 节气数据 ----
interface SolarTermVO {
    name: string; solarDate: string; today: string;
    gradientFrom: string; gradientTo: string;
    tagline: string; description: string;
}
const solarTerm = ref<SolarTermVO | null>(null);

/** "2026-05-25" → "2026 · 5 · 25 · 节气专题" */
const solarTermDateLabel = computed(() => {
    const dateStr = solarTerm.value?.today;
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${y} · ${parseInt(m)} · ${parseInt(d)} · 节气专题`;
});

onMounted(async () => {
    try {
        const [stRes, expRes] = await Promise.all([
            ApiCircle.getSolarTerm(),
            ApiExpert.getRecommendExperts(),
        ]);
        if (stRes.data?.data) solarTerm.value = stRes.data.data;
        if (expRes.data?.data) expertList.value = expRes.data.data;
    } catch {
        // 接口异常时保持默认显示
    }
});

// ---- Module 2: 推荐专家（API 数据） ----
interface ExpertCardDTO {
    id: number; realName: string; avatar: string | null;
    roleType: string; bio: string | null;
}
const expertList = ref<ExpertCardDTO[]>([]);

/** 主页面始终展示前 3 位 */
const displayedExperts = computed(() => expertList.value.slice(0, 3));

/** 当前选中咨询的专家（null 表示未选择） */
const selectedExpert = ref<ExpertCardDTO | null>(null);
const chatShellRef = ref<HTMLElement | null>(null);
const chatBodyEl = ref<HTMLElement | null>(null);

/** 当前会话 ID（后端创建后获得） */
const sessionId = ref<number | null>(null);

/** AI 预问诊小结（转人工后从接口获得） */
interface AiSummaryVO {
    mainComplaint: string;
    courseOfDisease: string;
    symptoms: string[];
    trigger: string;
    riskLevel: string;
    suggestionDirection: string;
}
const aiSummary = ref<AiSummaryVO | null>(null);

function scrollChatToBottom() {
    if (chatBodyEl.value) {
        chatBodyEl.value.scrollTop = chatBodyEl.value.scrollHeight;
    }
}

/** STOMP 收到帧时的回调 */
function onStompMessage(frame: any) {
    const { event, data } = frame;
    if (event === "consult.ai_message") {
        consultMessages.value.push({ kind: "ai", text: data.message.content, tag: "AI · 回复" });
    } else if (event === "consult.system_event") {
        consultMessages.value.push({ kind: "sys", text: data.message.content });
    } else if (event === "consult.transferred") {
        aiSummary.value = data.summary;
        showAiSummary.value = true;
        consultMessages.value.push({ kind: "sys", text: "✓ AI 预问诊小结已生成，等待医生接入…", success: true });
    } else if (event === "consult.closed") {
        consultMessages.value.push({ kind: "sys", text: "— 会话已关闭 —", success: true });
    }
    nextTick(scrollChatToBottom);
}

async function startConsult(doc: ExpertCardDTO) {
    selectedExpert.value = doc;
    consultMessages.value = [];
    showAiSummary.value = false;
    aiSummary.value = null;
    sessionId.value = null;

    try {
        const res = await ApiConsult.createSession(doc.id);
        const session = res.data?.data;
        if (session) {
            sessionId.value = session.sessionId;
            for (const msg of session.messages ?? []) {
                if (msg.senderType === "ai" && msg.contentType === "text") {
                    consultMessages.value.push({ kind: "ai", text: msg.content, tag: "AI · 预问诊" });
                } else if (msg.senderType === "user") {
                    consultMessages.value.push({ kind: "me", text: msg.content });
                } else if (msg.senderType === "system") {
                    consultMessages.value.push({ kind: "sys", text: msg.content });
                }
            }
            if (session.aiSummary) {
                aiSummary.value = session.aiSummary;
                showAiSummary.value = true;
            }
            const { connect } = useConsultSocket();
            connect(session.sessionId, onStompMessage);
        }
    } catch (err) {
        console.error("创建会话失败", err);
        toast("连接失败，请稍后重试");
    }

    nextTick(() => {
        chatShellRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

function resetConsult() {
    const { disconnect } = useConsultSocket();
    disconnect();
    selectedExpert.value = null;
    sessionId.value = null;
    consultMessages.value = [];
    showAiSummary.value = false;
    aiSummary.value = null;
}

/** Modal 内点击「向TA咨询」：关闭弹窗并切换到该专家 */
function startConsultFromModal(doc: ExpertCardDTO) {
    showExpertModal.value = false;
    startConsult(doc);
}

/** 全部专家弹窗 */
const showExpertModal = ref(false);
const activeRoleFilter = ref('ALL');

function openExpertModal() {
    activeRoleFilter.value = 'ALL';
    showExpertModal.value = true;
}

/** 根据 expertList 中实际存在的职称动态生成筛选 Tab */
const roleFilterTabs = computed(() => {
    const roleMap: Record<string, string> = {
        DOCTOR: '执业医师', NUTRITIONIST: '注册营养师',
        REHAB: '康复治疗师', GURU: '养生达人',
    };
    const present = [...new Set(expertList.value.map(e => e.roleType))];
    const tabs = [{ key: 'ALL', label: '全部', count: expertList.value.length }];
    present.forEach(r => {
        tabs.push({
            key: r,
            label: roleMap[r] ?? r,
            count: expertList.value.filter(e => e.roleType === r).length,
        });
    });
    return tabs;
});

const filteredModalExperts = computed(() =>
    activeRoleFilter.value === 'ALL'
        ? expertList.value
        : expertList.value.filter(e => e.roleType === activeRoleFilter.value)
);

/** roleType 枚举 → 中文职称 */
function roleLabel(roleType: string) {
    const map: Record<string, string> = {
        DOCTOR: '执业医师', NUTRITIONIST: '注册营养师',
        REHAB: '康复治疗师', GURU: '养生达人',
    };
    return map[roleType] ?? roleType;
}
/** 头像是完整 URL 时直接用，否则取姓名首字 */
function avatarText(expert: ExpertCardDTO) {
    return (expert.realName || '?').charAt(0);
}
function avatarUrl(expert: ExpertCardDTO) {
    return expert.avatar?.startsWith('http') ? expert.avatar : null;
}

// ---- Module 1 data ----

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
watch(
    () => userStore.G_UserInfo.role_id,
    (roleId) => { consultView.value = roleId === 2 ? "expert" : "user"; },
    { immediate: true }
);
const chatInputText = ref("");
const showAiSummary = ref(false);
const showQueueDialog = ref(false);

const consultMessages = ref<{ kind: string; text: string; tag?: string; handoff?: boolean; success?: boolean }[]>([]);

function sendMessage() {
    const text = chatInputText.value.trim();
    if (!text || !sessionId.value) return;
    chatInputText.value = "";

    // 乐观渲染：立即显示用户消息
    consultMessages.value.push({ kind: "me", text });
    nextTick(scrollChatToBottom);

    // 通过 STOMP 发送（服务端收到后会推送 AI 回复）
    const { send } = useConsultSocket();
    if (!send(sessionId.value, text)) {
        // STOMP 未连接时降级 HTTP
        ApiConsult.sendMessage(sessionId.value, text).catch(console.error);
    }
}

async function triggerHandoff() {
    if (!sessionId.value) return;
    // 已转过人工，弹窗提示排队中
    if (showAiSummary.value) {
        showQueueDialog.value = true;
        return;
    }
    try {
        const res = await ApiConsult.transfer(sessionId.value);
        const data = res.data?.data;
        if (data) {
            aiSummary.value = data.summary;
            showAiSummary.value = true;
            consultMessages.value.push({ kind: "sys", text: "⏳ 转人工请求已发送，等待医生接入…" });
            nextTick(scrollChatToBottom);
        }
    } catch {
        toast("转人工请求失败，请重试");
    }
}

// ---- Module 2: Expert view ----
interface ExpertQueueItemVO {
    sessionId: number;
    status: 'HUMAN_PENDING' | 'HUMAN_CHATTING';
    userId: number;
    userNickname: string | null;
    lastMessage: string | null;
    lastMessageAt: string | null;
    aiSummary: AiSummaryVO | null;
}

interface MessageVO {
    id: number;
    senderType: string;
    contentType: string;
    content: string;
    createdAt: string;
}

const queueTab = ref<'pending' | 'active'>('pending');
const pendingList = ref<ExpertQueueItemVO[]>([]);
const activeList = ref<ExpertQueueItemVO[]>([]);
const expertSessionId = ref<number | null>(null);
const expertMessages = ref<MessageVO[]>([]);
const expertChatInput = ref('');
const expertLoadingMessages = ref(false);
const expertChatBodyEl = ref<HTMLElement | null>(null);

/** 当前展开的队列项（用于右侧面板展示昵称） */
const currentExpertSession = computed(() =>
    expertSessionId.value
        ? pendingList.value.find(i => i.sessionId === expertSessionId.value)
            ?? activeList.value.find(i => i.sessionId === expertSessionId.value)
            ?? null
        : null
);

/** 并发拉取待接诊 + 咨询中两个队列 */
async function loadExpertQueues() {
    try {
        const [pendingRes, activeRes] = await Promise.all([
            ApiConsult.listExpertSessions('HUMAN_PENDING'),
            ApiConsult.listExpertSessions('HUMAN_CHATTING'),
        ]);
        if (pendingRes.data?.data) pendingList.value = pendingRes.data.data;
        if (activeRes.data?.data) activeList.value = activeRes.data.data;
    } catch {
        toast('加载接诊队列失败');
    }
}

/** 点击队列项：加载消息历史并订阅 STOMP */
async function openExpertSession(item: ExpertQueueItemVO) {
    expertSessionId.value = item.sessionId;
    expertMessages.value = [];
    expertLoadingMessages.value = true;
    try {
        const res = await ApiConsult.getMessages(item.sessionId);
        if (res.data?.data) expertMessages.value = res.data.data;
    } catch {
        toast('加载消息失败');
    } finally {
        expertLoadingMessages.value = false;
        nextTick(() => {
            if (expertChatBodyEl.value) {
                expertChatBodyEl.value.scrollTop = expertChatBodyEl.value.scrollHeight;
            }
        });
    }
    const { connect } = useConsultSocket();
    connect(item.sessionId, (frame: any) => {
        if (frame.event === 'consult.user_message') {
            expertMessages.value.push(frame.data.message);
            nextTick(() => {
                if (expertChatBodyEl.value) {
                    expertChatBodyEl.value.scrollTop = expertChatBodyEl.value.scrollHeight;
                }
            });
        }
    });
}

/** 专家发消息 */
async function sendExpertMessage() {
    const text = expertChatInput.value.trim();
    if (!text || !expertSessionId.value) return;
    expertChatInput.value = '';
    try {
        const res = await ApiConsult.expertReply(expertSessionId.value, text);
        const data = res.data?.data;
        if (data) {
            expertMessages.value.push({
                id: data.messageId,
                senderType: 'expert',
                contentType: 'text',
                content: text,
                createdAt: data.createdAt,
            });
            // 首次回复：将该项从 pendingList 移入 activeList
            if (data.status === 'HUMAN_CHATTING') {
                const idx = pendingList.value.findIndex(i => i.sessionId === expertSessionId.value);
                if (idx !== -1) {
                    const item = { ...pendingList.value[idx], status: 'HUMAN_CHATTING' as const };
                    pendingList.value.splice(idx, 1);
                    activeList.value.unshift(item);
                    queueTab.value = 'active';
                }
            }
            nextTick(() => {
                if (expertChatBodyEl.value) {
                    expertChatBodyEl.value.scrollTop = expertChatBodyEl.value.scrollHeight;
                }
            });
        }
    } catch {
        toast('发送失败，请重试');
    }
}

/** 相对时间格式化（列表预览用） */
function formatTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return `${Math.floor(diff / 1000)} 秒前`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    return `${Math.floor(diff / 3600000)} 小时前`;
}

// 切换到 m2 Tab 且为专家视角时自动拉队列
watch(
    () => activeTab.value === 'm2' && isExpertView.value,
    (active) => { if (active) loadExpertQueues(); },
    { immediate: true }
);

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
.doctor-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

.doctor-card {
    position: relative; overflow: hidden; border-radius: 24px;
    padding: 28px 22px 24px;
    background: linear-gradient(180deg, #fbf8f3 0%, #f5efe7 100%);
    border: 1px solid rgba(214, 200, 180, .5);
    box-shadow: 0 8px 30px rgba(0,0,0,.05), inset 0 1px 0 rgba(255,255,255,.9);
    text-align: center; display: flex; flex-direction: column; align-items: center;
    transition: all .35s; cursor: pointer;
}
.doctor-card:hover { transform: translateY(-5px); box-shadow: 0 18px 48px rgba(0,0,0,.1); }
.doctor-card::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(circle at top left, rgba(117,144,122,.07), transparent 35%),
                radial-gradient(circle at bottom right, rgba(117,144,122,.05), transparent 35%);
}

.doctor-mountain {
    position: absolute; left: 0; bottom: 0; width: 100%; opacity: .07; pointer-events: none;
}

.doctor-avatar-wrap {
    width: 96px; height: 96px; margin: 0 auto; padding: 3px; border-radius: 50%;
    background: linear-gradient(135deg, #d8c29a, #f5ead7, #cdb488);
    box-shadow: 0 6px 20px rgba(0,0,0,.08); position: relative; z-index: 1; flex-shrink: 0;
}

.doctor-avatar {
    width: 100%; height: 100%; border-radius: 50%; object-fit: cover; background: white;
}

.doctor-avatar-text {
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; font-family: "STKaiti", serif; font-weight: 700; color: var(--jade);
    background: linear-gradient(135deg, var(--jade-soft), var(--gold-soft));
}

.doctor-name {
    margin-top: 14px; font-size: 22px; font-weight: 600; letter-spacing: 4px;
    color: #24322b; position: relative; z-index: 1;
}

.doctor-tag {
    display: inline-flex; align-items: center; justify-content: center;
    margin-top: 8px; padding: 3px 12px; border-radius: 999px;
    background: linear-gradient(135deg, #922727, #bc4040);
    color: white; font-size: 11px; letter-spacing: 2px;
    box-shadow: 0 4px 10px rgba(188,64,64,.2); position: relative; z-index: 1;
}

.doctor-title {
    position: relative; margin-top: 10px; color: #6e7b72; font-size: 13px;
    letter-spacing: 2px; z-index: 1;
    &::before, &::after {
        content: ''; display: inline-block; width: 28px; height: 1px;
        margin: 0 7px; vertical-align: middle; background: #d9cfbf;
    }
}

.doctor-divider {
    width: 68%; height: 1px; margin: 16px auto;
    background: linear-gradient(90deg, transparent, #d7cab2, transparent);
    position: relative; z-index: 1;
}

.doctor-bio {
    font-size: 12.5px; color: #4f5651; line-height: 1.8; letter-spacing: .5px;
    padding: 0 4px; text-align: left;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    position: relative; z-index: 1; flex: 1;
}

.doctor-consult-btn {
    width: 88%; height: 42px; margin-top: 18px; border: none; outline: none;
    border-radius: 999px; cursor: pointer;
    background: linear-gradient(135deg, #5d7c69, #73907d);
    color: #f9f5ef; font-size: 14px; letter-spacing: 3px; font-family: inherit;
    transition: all .3s; box-shadow: 0 8px 18px rgba(93,124,105,.22);
    position: relative; z-index: 1;
}
.doctor-consult-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 24px rgba(93,124,105,.32); }

// 未登录提示
.login-prompt-card {
    text-align: center; padding: 64px 24px;
    background: var(--paper); border-radius: 16px; box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4);
}
.login-prompt-icon { font-size: 48px; margin-bottom: 16px; }
.login-prompt-card h3 { font-size: 22px; color: var(--ink); margin-bottom: 8px; }
.login-prompt-card p { font-size: 14px; color: var(--ink-muted); margin-bottom: 24px; }

// 未选专家占位
.consult-placeholder {
    text-align: center; padding: 52px 24px;
    background: var(--paper-warm); border-radius: 14px;
    border: 1.5px dashed var(--line);
}
.placeholder-icon { font-size: 40px; margin-bottom: 14px; }
.consult-placeholder p { font-size: 14px; color: var(--ink-muted); line-height: 1.8; }

// 查看更多按钮
.expert-expand { text-align: center; margin-top: 20px; }
.expert-expand-btn {
    background: transparent; border: 1px solid var(--jade); color: var(--jade);
    padding: 10px 32px; border-radius: 22px; font-family: inherit;
    font-size: 13px; cursor: pointer; transition: all .25s; letter-spacing: 1px;
}
.expert-expand-btn:hover { background: var(--jade); color: white; }

// 全部专家弹窗
.expert-modal-overlay {
    position: fixed; inset: 0; background: rgba(20,20,20,.55);
    z-index: 2000; display: flex; align-items: center; justify-content: center;
    padding: 24px; animation: modalBgIn .25s ease;
}
@keyframes modalBgIn { from { opacity: 0; } to { opacity: 1; } }

.expert-modal {
    background: var(--paper); border-radius: 20px;
    width: 100%; max-width: 1100px; max-height: 88vh;
    display: flex; flex-direction: column;
    box-shadow: 0 28px 80px rgba(0,0,0,.22); overflow: hidden;
    animation: modalSlideIn .3s cubic-bezier(.22,.61,.36,1);
}
@keyframes modalSlideIn {
    from { opacity: 0; transform: scale(.96) translateY(18px); }
    to   { opacity: 1; transform: scale(1)   translateY(0); }
}

.expert-modal-header {
    padding: 16px 24px; border-bottom: 1px solid var(--line-soft);
    display: flex; align-items: center; gap: 16px;
    background: var(--paper-warm); flex-shrink: 0;
}
.expert-modal-back {
    background: transparent; border: 1px solid var(--jade); color: var(--jade);
    padding: 7px 16px; border-radius: 20px; font-family: inherit;
    font-size: 13px; cursor: pointer; transition: all .2s;
}
.expert-modal-back:hover { background: var(--jade); color: white; }
.expert-modal-title {
    font-size: 18px; font-weight: 600; color: var(--ink);
}

.expert-filter-bar {
    padding: 14px 24px; border-bottom: 1px solid var(--line-soft);
    display: flex; gap: 8px; flex-wrap: wrap;
    background: var(--paper); flex-shrink: 0;
}
.expert-filter-tab {
    background: var(--paper-warm); border: 1px solid var(--line); color: var(--ink-muted);
    padding: 6px 16px; border-radius: 20px; font-family: inherit;
    font-size: 13px; cursor: pointer; transition: all .2s;
}
.expert-filter-tab.active { background: var(--jade); border-color: var(--jade); color: white; }
.expert-filter-tab:hover:not(.active) { border-color: var(--jade); color: var(--jade); }

.expert-modal-body { flex: 1; overflow-y: auto; padding: 24px; }
.expert-empty { text-align: center; padding: 48px; color: var(--ink-muted); font-size: 14px; }

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
    display: flex; flex-direction: column; width: 100%; height: 640px;
}
.chat-main { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.chat-head {
    padding: 16px 20px; border-bottom: 1px solid var(--line-soft);
    display: flex; align-items: center; gap: 12px; background: var(--paper-warm);
    flex-shrink: 0;
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
    scrollbar-width: thin;
    scrollbar-color: var(--line) transparent;
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: var(--line); border-radius: 2px; }
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
    display: flex; gap: 10px; align-items: center; flex-shrink: 0;
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
    display: grid; grid-template-columns: 220px 1fr; min-height: 640px;
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
.q-empty {
    padding: 20px 16px;
    color: var(--ink-muted);
    font-size: 13px;
    text-align: center;
}
.q-item .red-dot {
    position: absolute; top: 14px; right: 14px; width: 8px; height: 8px;
    background: var(--cinnabar); border-radius: 50%;
}

.triage-conv { display: flex; flex-direction: column; background: var(--paper); }
.triage-conv .chat-body {
    max-height: 540px;
    scrollbar-width: thin;
    scrollbar-color: var(--line) transparent;
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: var(--line); border-radius: 2px; }
}
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


// Toast
.toast {
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: var(--ink); color: white; padding: 12px 24px; border-radius: 24px;
    font-size: 13px; box-shadow: var(--shadow-lg); opacity: 0; transition: all .3s;
    z-index: 1000; pointer-events: none;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(-6px); }

/* 排队提示弹窗 */
.queue-dialog-overlay {
    position: fixed; inset: 0; background: rgba(20,20,20,.5);
    z-index: 3000; display: flex; align-items: center; justify-content: center;
    animation: modalBgIn .25s ease;
}
.queue-dialog {
    background: var(--paper); border-radius: 20px; padding: 36px 40px;
    text-align: center; max-width: 380px; width: 90%;
    box-shadow: 0 24px 64px rgba(0,0,0,.18);
    animation: modalSlideIn .3s cubic-bezier(.22,.61,.36,1);
}
.queue-dialog-icon { font-size: 48px; margin-bottom: 16px; }
.queue-dialog h3 { font-family: "STKaiti", serif; font-size: 20px; color: var(--ink); margin-bottom: 10px; }
.queue-dialog p { font-size: 14px; color: var(--ink-muted); line-height: 1.7; margin-bottom: 24px; }

@media (max-width: 1024px) {
    .triage-shell { grid-template-columns: 180px 1fr; }
    .quick-grid { grid-template-columns: repeat(3, 1fr); }
    .role-grid { grid-template-columns: repeat(2, 1fr); }
    .flow-grid { grid-template-columns: 1fr 1fr; }
    .flow-node:nth-child(odd):not(:last-child)::after { content: ''; }
}
</style>
