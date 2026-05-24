<template>
    <div class="page-wrapper">
        <HeaderLayout />

        <main class="hub">
            <!-- Hero -->
            <section class="hero">
                <div class="hero-label font-serif">VITALITY COMMUNITY · 元气打卡社区</div>
                <h1 class="font-serif">元气社区</h1>
                <p class="hero-sub">打卡养生日常，记录饮食作息，分享养生心得，与同道好友互相督促 —— 让坚持成为习惯，让养生融入生活。</p>
                <div class="hero-meta">
                    <span class="meta-item">✅ 今日打卡 <strong>{{ todayCheckin.done }} / {{ todayCheckin.total }} 项</strong></span>
                    <span class="meta-item">🔥 连续打卡 <strong>{{ streakDays }} 天</strong></span>
                    <span class="meta-item">👥 社区好友 <strong>{{ friendsCount }} 位</strong></span>
                    <span class="meta-item">🏆 进行中挑战 <strong>{{ activeChallenges }} 个</strong></span>
                </div>
            </section>

            <!-- Module Tabs -->
            <nav class="tabs">
                <button
                    v-for="tab in tabs"
                    :key="tab.name"
                    class="tab"
                    :class="{ active: activeTab === tab.name }"
                    @click="switchTab(tab.name)"
                >
                    <span class="tab-icon">{{ tab.icon }}</span>
                    {{ tab.label }}
                </button>
            </nav>

            <!-- ===== Module 1: 每日健康打卡 ===== -->
            <section v-show="activeTab === 'checkin'" class="panel">
                <div class="grid-2">
                    <div class="checkin-hero">
                        <div style="font-size: 12px; color: var(--ink-muted); letter-spacing: 2px;">TODAY · 2026 年 5 月 20 日 · 小满</div>
                        <div class="ring-wrap">
                            <svg viewBox="0 0 184 184">
                                <circle class="ring-bg" cx="92" cy="92" r="80" />
                                <circle class="ring-fg" cx="92" cy="92" r="80" :style="{ strokeDashoffset: ringOffset }" />
                            </svg>
                            <div class="ring-num">
                                <div class="big">{{ checkItems.filter(i => i.done).length }}<span>/{{ checkItems.length }}</span></div>
                                <div class="label">今日打卡进度</div>
                            </div>
                        </div>
                        <span class="streak-badge">🔥 连续打卡 {{ streakDays }} 天 · 距「而立之约」还差 {{ 30 - streakDays }} 天</span>
                        <div style="margin-top: 16px;">
                            <button class="btn" @click="completeAllChecks">一键完成今日打卡</button>
                            <button class="btn btn-ghost" style="margin-left: 8px;">📤 生成打卡海报</button>
                        </div>
                    </div>

                    <div class="card">
                        <div class="row">
                            <div class="card-title" style="margin: 0;"><span class="dot"></span>本周打卡</div>
                            <div style="font-size: 12px; color: var(--ink-muted);">本周已坚持 <strong style="color: var(--jade);">2 天</strong></div>
                        </div>
                        <div class="week-strip">
                            <div v-for="day in weekDays" :key="day.label" class="day-dot" :class="day.status">
                                <span class="d-label">{{ day.label }}</span>
                                <span class="d-circle">{{ day.display }}</span>
                            </div>
                        </div>
                        <div style="margin-top: 16px; font-size: 13px; color: var(--ink-muted); margin-bottom: 8px;">今日打卡心情</div>
                        <div class="chip-row">
                            <span v-for="mood in moods" :key="mood" class="pick-chip" :class="{ active: selectedMood === mood }" @click="selectedMood = mood">{{ mood }}</span>
                        </div>
                        <div class="tip-row" style="margin-top: 16px;">
                            <span class="icon">💡</span>
                            <div class="text">坚持打卡满 <strong>30 天</strong>，可解锁「养生达人」称号与节气礼盒优惠券。</div>
                        </div>
                    </div>
                </div>

                <div class="card" style="margin-top: 20px;">
                    <div class="row">
                        <div class="card-title" style="margin: 0;"><span class="dot"></span>今日打卡清单</div>
                        <button class="btn btn-ghost btn-sm">⚙ 自定义打卡项</button>
                    </div>
                    <div class="check-grid">
                        <div v-for="item in checkItems" :key="item.name" class="check-item" :class="{ done: item.done }">
                            <div class="ci-icon">{{ item.icon }}</div>
                            <div class="ci-info">
                                <div class="ci-name">{{ item.name }}</div>
                                <div class="ci-meta">{{ item.meta }}</div>
                            </div>
                            <div class="check-box" @click="item.done = !item.done">✓</div>
                        </div>
                    </div>
                </div>

                <div class="grid-2" style="margin-top: 20px;">
                    <div class="card">
                        <div class="row">
                            <div class="card-title" style="margin: 0;"><span class="dot"></span>打卡日历 · 5 月</div>
                            <div style="font-size: 12px; color: var(--ink-muted);">本月打卡 <strong style="color: var(--jade);">20 天</strong></div>
                        </div>
                        <div class="heatmap">
                            <div class="hm-head">一</div><div class="hm-head">二</div><div class="hm-head">三</div><div class="hm-head">四</div><div class="hm-head">五</div><div class="hm-head">六</div><div class="hm-head">日</div>
                            <div v-for="i in 4" :key="'blank-'+i" class="hm-cell muted"></div>
                            <div v-for="(lv, idx) in heatmapData" :key="idx" class="hm-cell" :class="lv ? 'lv'+lv : ''"></div>
                        </div>
                        <div class="hm-legend">
                            少 <span class="hm-cell"></span><span class="hm-cell lv1"></span><span class="hm-cell lv2"></span><span class="hm-cell lv3"></span><span class="hm-cell lv4"></span> 多
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-title"><span class="dot"></span>连续打卡里程碑</div>
                        <div v-for="ms in milestones" :key="ms.name" class="milestone-row">
                            <div class="ms-medal" :class="{ locked: !ms.unlocked }">{{ ms.emoji }}</div>
                            <div class="ms-info">
                                <div class="ms-name">{{ ms.name }}</div>
                                <div class="ms-desc">{{ ms.desc }}</div>
                                <div v-if="!ms.unlocked && ms.progress" class="progress-track"><div class="progress-fill" :style="{ width: ms.progress + '%' }"></div></div>
                            </div>
                            <span class="pick-chip" :class="{ active: ms.unlocked }">{{ ms.statusLabel }}</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ===== Module 2: 饮食与作息记录 ===== -->
            <section v-show="activeTab === 'lifestyle'" class="panel">
                <div class="routine-card">
                    <div class="row" style="margin-bottom: 6px;">
                        <div class="font-serif" style="font-size: 22px; font-weight: 600;">作息记录</div>
                        <div class="pick-chip active">📅 今日 · 5 月 20 日</div>
                    </div>
                    <div class="time-form">
                        <div class="time-group">
                            <div class="t-label">☀️ 起床时间</div>
                            <input type="time" value="06:24" class="time-input" />
                        </div>
                        <div class="time-group">
                            <div class="t-label">😴 午休时长</div>
                            <input type="time" value="00:25" class="time-input" />
                        </div>
                        <div class="time-group">
                            <div class="t-label">🌙 计划入睡</div>
                            <input type="time" value="22:50" class="time-input" />
                        </div>
                    </div>
                    <div class="duration-display">
                        <span>昨夜睡眠时长 · 入睡较快 · 深睡比例 24%</span>
                        <strong>7 小时 38 分钟</strong>
                    </div>
                    <div style="margin-top: 16px; font-size: 13px; color: var(--ink-muted);">作息状态（可多选）：</div>
                    <div class="chip-row" style="margin-top: 8px;">
                        <span v-for="tag in routineTags" :key="tag" class="pick-chip" :class="{ active: routineSelected.includes(tag) }" @click="toggleRoutineTag(tag)">{{ tag }}</span>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
                        <button class="btn btn-ghost">取消</button>
                        <button class="btn" @click="toast('✓ 已保存')">保存作息记录</button>
                    </div>
                </div>

                <div class="card" style="margin-top: 20px;">
                    <div class="row">
                        <div class="card-title" style="margin: 0;"><span class="dot"></span>今日饮食记录</div>
                        <div style="font-size: 12px; color: var(--ink-muted);">已记录 <strong style="color: var(--jade);">3 / 4 餐</strong></div>
                    </div>
                    <div class="grid-4">
                        <div v-for="meal in meals" :key="meal.name" class="meal-card">
                            <div class="meal-img" :class="meal.bg">
                                <template v-if="meal.empty">＋</template>
                                <template v-else>{{ meal.emoji }}</template>
                            </div>
                            <div class="meal-body">
                                <div class="meal-name">{{ meal.name }} <span v-if="meal.tag" class="meal-tag">{{ meal.tag }}</span></div>
                                <div class="meal-foods">{{ meal.foods }}</div>
                                <div class="meal-cal">≈ {{ meal.cal }} 千卡</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid-2" style="margin-top: 20px;">
                    <div class="card">
                        <div class="row">
                            <div class="card-title" style="margin: 0;"><span class="dot"></span>今日饮水追踪</div>
                            <div style="font-size: 12px; color: var(--ink-muted);"><strong style="color: var(--moon);">{{ waterFilled * 250 }}</strong> / 2000 ml</div>
                        </div>
                        <div class="water-grid">
                            <div v-for="i in 8" :key="i" class="water-cup" :class="{ filled: i <= waterFilled }" @click="waterFilled = i <= waterFilled ? i - 1 : i">💧</div>
                        </div>
                        <div class="tip-row">
                            <span class="icon">🍵</span>
                            <div class="text">还差 <strong>{{ 2000 - waterFilled * 250 }}ml</strong> 达成目标，小满时节宜温水代茶，可饮 <strong>麦冬陈皮饮</strong>。</div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-title"><span class="dot"></span>今日营养小结</div>
                        <div class="nutri-ring">
                            <div class="cal-circle">
                                <div class="inner">
                                    <div class="num">1510</div>
                                    <div class="unit">千卡 / 1800</div>
                                </div>
                            </div>
                            <div style="flex: 1;">
                                <div v-for="n in nutrition" :key="n.label" class="nutri-bar">
                                    <div class="nb-label"><span>{{ n.label }}</span><span>{{ n.value }}</span></div>
                                    <div class="nutri-track"><div class="nutri-fill" :style="{ width: n.pct + '%', background: n.color }"></div></div>
                                </div>
                            </div>
                        </div>
                        <div class="tip-row" style="margin-top: 14px;">
                            <span class="icon">✅</span>
                            <div class="text">今日饮食 <strong>清淡均衡</strong>，膳食纤维充足，建议晚餐后散步助消化。</div>
                        </div>
                    </div>
                </div>

                <div class="card" style="margin-top: 20px;">
                    <div class="row">
                        <div class="card-title" style="margin: 0;"><span class="dot"></span>近 7 日作息趋势</div>
                        <div style="font-size: 12px; color: var(--ink-muted);">平均睡眠 <strong style="color: var(--jade);">7h 26min</strong> · 平均入睡 <strong style="color: var(--jade);">23:08</strong></div>
                    </div>
                    <div class="mini-chart">
                        <svg class="chart-svg" viewBox="0 0 700 150" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#5C8374" stop-opacity="0.35" />
                                    <stop offset="100%" stop-color="#5C8374" stop-opacity="0" />
                                </linearGradient>
                            </defs>
                            <line class="chart-grid" x1="0" y1="40" x2="700" y2="40" />
                            <line class="chart-grid" x1="0" y1="80" x2="700" y2="80" />
                            <line class="chart-grid" x1="0" y1="120" x2="700" y2="120" />
                            <path d="M 50 95 L 158 70 L 266 85 L 374 55 L 482 65 L 590 45 L 650 50 L 650 150 L 50 150 Z" fill="url(#trendGrad)" />
                            <path d="M 50 95 L 158 70 L 266 85 L 374 55 L 482 65 L 590 45 L 650 50" fill="none" stroke="#5C8374" stroke-width="2.5" />
                            <circle cx="50" cy="95" r="4" fill="#5C8374" />
                            <circle cx="158" cy="70" r="4" fill="#5C8374" />
                            <circle cx="266" cy="85" r="4" fill="#5C8374" />
                            <circle cx="374" cy="55" r="4" fill="#5C8374" />
                            <circle cx="482" cy="65" r="4" fill="#5C8374" />
                            <circle cx="590" cy="45" r="4" fill="#5C8374" />
                            <circle cx="650" cy="50" r="4" fill="#B33C2C" />
                        </svg>
                    </div>
                    <div class="chart-labels">
                        <span>5/14</span><span>5/15</span><span>5/16</span><span>5/17</span><span>5/18</span><span>5/19</span><span>5/20</span>
                    </div>
                </div>
            </section>

            <!-- ===== Module 3: 养生经验分享 ===== -->
            <section v-show="activeTab === 'sharing'" class="panel">
                <div class="compose-card">
                    <div class="row" style="margin-bottom: 12px;">
                        <div class="font-serif" style="font-size: 20px; font-weight: 600;">分享你的养生心得</div>
                        <span class="pick-chip">📋 草稿箱 (2)</span>
                    </div>
                    <div class="compose-box">
                        <textarea placeholder="记录今天的养生体会、食疗方子、作息变化…… 与同道好友一起进步"></textarea>
                    </div>
                    <div class="upload-row">
                        <div class="upload-thumb">🍵<span class="x" @click="toast('已移除')">×</span></div>
                        <div class="upload-box"><span class="plus">＋</span>添加图片</div>
                        <div class="upload-box"><span class="plus">🎬</span>添加视频</div>
                    </div>
                    <div style="margin-top: 12px; font-size: 13px; color: var(--ink-muted);">选择分类：</div>
                    <div class="chip-row" style="margin-top: 8px;">
                        <span v-for="cat in shareCategories" :key="cat" class="pick-chip" :class="{ active: selectedCategory === cat }" @click="selectedCategory = cat">{{ cat }}</span>
                    </div>
                    <div class="compose-foot">
                        <div class="compose-tools">
                            <span># 添加话题</span>
                            <span>🔗 关联打卡</span>
                            <span>📍 添加位置</span>
                        </div>
                        <div>
                            <button class="btn btn-ghost btn-sm">存草稿</button>
                            <button class="btn btn-sm" style="margin-left: 6px;" @click="toast('✓ 已发布')">发布经验</button>
                        </div>
                    </div>
                </div>

                <div class="card" style="margin-top: 20px;">
                    <div class="row">
                        <div class="card-title" style="margin: 0;"><span class="dot"></span>经验广场</div>
                        <div class="chip-row">
                            <span v-for="s in shareSorts" :key="s" class="pick-chip" :class="{ active: selectedShareSort === s }" @click="selectedShareSort = s">{{ s }}</span>
                        </div>
                    </div>
                    <div class="grid-3">
                        <div v-for="exp in experiences" :key="exp.title" class="exp-card">
                            <div class="exp-cover" :class="exp.coverClass"><span class="exp-cat">{{ exp.cat }}</span>{{ exp.emoji }}</div>
                            <div class="exp-body">
                                <div class="exp-title">{{ exp.title }}</div>
                                <div class="exp-author"><span class="mini-avatar">{{ exp.authorInitial }}</span>{{ exp.author }}</div>
                                <div class="exp-stats"><span>👍 {{ exp.likes }}</span><span>💬 {{ exp.comments }}</span><span>⭐ {{ exp.stars }}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid-2" style="margin-top: 20px;">
                    <div class="card">
                        <div class="card-title"><span class="dot"></span>热门养生话题</div>
                        <div v-for="topic in hotTopics" :key="topic.name" class="side-row">
                            <div class="group-icon" :style="{ background: topic.bg }">{{ topic.emoji }}</div>
                            <div class="side-info"><div class="side-name"># {{ topic.name }}</div><div class="side-meta">{{ topic.meta }}</div></div>
                            <button class="btn btn-ghost btn-sm">参与</button>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-title"><span class="dot"></span>我的创作数据</div>
                        <div class="grid-2" style="gap: 12px;">
                            <div class="tip-row" style="border-left-color: var(--gold);"><span class="icon">📝</span><div class="text"><strong style="font-size: 20px;">18</strong> 篇<br><span style="color: var(--ink-muted); font-size: 12px;">累计发布经验</span></div></div>
                            <div class="tip-row" style="border-left-color: var(--cinnabar);"><span class="icon">👍</span><div class="text"><strong style="font-size: 20px;">3,240</strong><br><span style="color: var(--ink-muted); font-size: 12px;">累计获赞</span></div></div>
                            <div class="tip-row" style="border-left-color: var(--jade);"><span class="icon">⭐</span><div class="text"><strong style="font-size: 20px;">1,562</strong><br><span style="color: var(--ink-muted); font-size: 12px;">被收藏次数</span></div></div>
                            <div class="tip-row" style="border-left-color: var(--moon);"><span class="icon">🏅</span><div class="text"><strong style="font-size: 20px;">2</strong> 篇<br><span style="color: var(--ink-muted); font-size: 12px;">入选社区精华</span></div></div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 14px;">
                            <button class="btn btn-ghost btn-sm" style="flex: 1;">我的发布</button>
                            <button class="btn btn-ghost btn-sm" style="flex: 1;">我的收藏</button>
                            <button class="btn btn-ghost btn-sm" style="flex: 1;">草稿箱</button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ===== Module 4: 社区互动交流 ===== -->
            <section v-show="activeTab === 'interaction'" class="panel">
                <div class="grid-2" style="grid-template-columns: 1.5fr 1fr;">
                    <div class="card">
                        <div class="row">
                            <div class="card-title" style="margin: 0;"><span class="dot"></span>社区动态</div>
                            <div class="chip-row">
                                <span v-for="f in feedFilters" :key="f" class="pick-chip" :class="{ active: selectedFeedFilter === f }" @click="selectedFeedFilter = f">{{ f }}</span>
                            </div>
                        </div>

                        <div v-for="post in posts" :key="post.id" class="post">
                            <div class="post-head">
                                <div class="avatar" :style="{ background: post.avatarBg }">{{ post.avatarText }}</div>
                                <div class="ph-info">
                                    <div class="ph-name">{{ post.name }} <span class="level-tag">{{ post.level }}</span></div>
                                    <div class="ph-meta">{{ post.meta }}</div>
                                </div>
                                <button class="btn btn-ghost btn-sm">+ 关注</button>
                            </div>
                            <div class="post-text">{{ post.text }}</div>
                            <div v-if="post.checkin" class="post-checkin">
                                <div class="pc-ring">{{ post.checkin }}</div>
                                <div style="font-size: 13px;">
                                    <div style="font-weight: 600;">{{ post.checkinTitle }}</div>
                                    <div style="color: var(--ink-muted); font-size: 12px;">{{ post.checkinDesc }}</div>
                                </div>
                            </div>
                            <div v-if="post.images" class="post-imgs">
                                <div v-for="(img, i) in post.images" :key="i" class="post-img" :style="{ background: img.bg }">{{ img.emoji }}</div>
                            </div>
                            <div class="post-tags"><span v-for="tag in post.tags" :key="tag" class="topic-tag"># {{ tag }}</span></div>
                            <div class="post-actions">
                                <span class="pa" :class="{ liked: post.liked }" @click="post.liked = !post.liked; post.likeCount += post.liked ? 1 : -1">{{ post.liked ? '❤️' : '🤍' }} <span>{{ post.likeCount }}</span></span>
                                <span class="pa">💬 评论 {{ post.commentCount }}</span>
                                <span class="pa">⭐ 收藏 {{ post.starCount }}</span>
                                <span class="pa">📤 转发</span>
                            </div>

                            <div v-if="post.comments" class="comment-area">
                                <div v-for="c in post.comments" :key="c.id" class="comment">
                                    <div class="mini-avatar">{{ c.avatar }}</div>
                                    <div class="c-body">
                                        <span class="c-name">{{ c.name }}</span>：{{ c.text }}
                                        <div class="c-meta">{{ c.meta }}</div>
                                    </div>
                                </div>
                                <div class="comment-input">
                                    <span>💬</span>
                                    <input type="text" placeholder="友善交流，分享你的看法…" />
                                    <button class="btn btn-sm">发送</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="card">
                            <div class="card-title"><span class="dot"></span>消息通知</div>
                            <div v-for="notif in notifications" :key="notif.text" class="side-row">
                                <div class="group-icon" :style="{ background: notif.bg }">{{ notif.emoji }}</div>
                                <div class="side-info"><div class="side-name">{{ notif.title }}</div><div class="side-meta">{{ notif.text }}</div></div>
                            </div>
                        </div>

                        <div class="card" style="margin-top: 20px;">
                            <div class="row">
                                <div class="card-title" style="margin: 0;"><span class="dot"></span>推荐养生小组</div>
                                <span style="font-size: 12px; color: var(--ink-muted);">更多 ›</span>
                            </div>
                            <div v-for="group in groups" :key="group.name" class="side-row">
                                <div class="group-icon" :style="{ background: group.bg }">{{ group.emoji }}</div>
                                <div class="side-info"><div class="side-name">{{ group.name }}</div><div class="side-meta">{{ group.meta }}</div></div>
                                <button class="btn" :class="group.joined ? 'btn-sm' : 'btn-ghost btn-sm'">{{ group.joined ? '已加入' : '加入' }}</button>
                            </div>
                        </div>

                        <div class="card" style="margin-top: 20px;">
                            <div class="card-title"><span class="dot"></span>本周社区活跃榜</div>
                            <div v-for="(user, idx) in leaderboard" :key="user.name" class="rank-row" :class="{ me: user.isMe }">
                                <span class="rank-num" :class="'top' + (idx + 1)">{{ idx + 1 }}</span>
                                <div class="avatar" :style="{ background: user.avatarBg }">{{ user.avatarText }}</div>
                                <div class="rank-info"><div class="rank-name">{{ user.name }}</div><div class="rank-sub">{{ user.sub }}</div></div>
                                <span class="rank-val">{{ user.score }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ===== Module 5: 健康挑战活动 ===== -->
            <section v-show="activeTab === 'challenge'" class="panel">
                <div class="challenge-hero">
                    <span class="ch-tag">进行中 · 我已参加</span>
                    <h2>21 天早睡养肝挑战</h2>
                    <div style="opacity: 0.9; font-size: 14px; margin-top: 4px;">每晚 23:00 前入睡并打卡，养肝血、调气色，21 天养成早睡习惯</div>
                    <div class="ch-stats">
                        <div class="cs"><strong>3,254</strong>人参与</div>
                        <div class="cs"><strong>第 8 / 21 天</strong>我的进度</div>
                        <div class="cs"><strong>92%</strong>我的完成率</div>
                        <div class="cs"><strong>D-13</strong>距结束</div>
                    </div>
                    <div class="ch-progress-track"><div class="ch-progress-fill" style="width: 38%;"></div></div>
                    <div style="margin-top: 16px;">
                        <button class="btn btn-gold">今日去打卡</button>
                        <button class="btn btn-ghost" style="margin-left: 8px; color: white; border-color: rgba(255,255,255,0.6);">查看挑战详情</button>
                    </div>
                </div>

                <div class="card" style="margin-top: 20px;">
                    <div class="row">
                        <div class="card-title" style="margin: 0;"><span class="dot"></span>挑战广场</div>
                        <div class="chip-row">
                            <span v-for="f in challengeFilters" :key="f" class="pick-chip" :class="{ active: selectedChallengeFilter === f }" @click="selectedChallengeFilter = f">{{ f }}</span>
                        </div>
                    </div>
                    <div class="grid-3">
                        <div v-for="ch in challenges" :key="ch.name" class="challenge-card">
                            <div class="cc-cover" :style="{ background: ch.bg }">{{ ch.emoji }}<span class="cc-status" :class="ch.statusClass">{{ ch.statusLabel }}</span></div>
                            <div class="cc-body">
                                <div class="cc-name">{{ ch.name }}</div>
                                <div class="cc-meta"><span>⏱ {{ ch.days }} 天</span><span>📋 {{ ch.cat }}</span></div>
                                <div class="cc-foot">
                                    <div class="cc-people">
                                        <span v-for="(p, pi) in ch.people" :key="pi" class="pp" :style="{ background: p.bg }">{{ p.text }}</span>
                                    </div>
                                    <button class="btn btn-sm" :class="{ 'btn-ghost': !ch.joined }">{{ ch.joined ? '已参加' : '报名' }}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid-2" style="margin-top: 20px;">
                    <div class="card">
                        <div class="row">
                            <div class="card-title" style="margin: 0;"><span class="dot"></span>「早睡养肝」挑战排行榜</div>
                            <div class="chip-row">
                                <span class="pick-chip active">好友榜</span>
                                <span class="pick-chip">总榜</span>
                            </div>
                        </div>
                        <div v-for="(r, idx) in challengeRanks" :key="r.name" class="rank-row" :class="{ me: r.isMe }">
                            <span class="rank-num" :class="'top' + (idx + 1)">{{ idx + 1 }}</span>
                            <div class="avatar" :style="{ background: r.avatarBg }">{{ r.avatarText }}</div>
                            <div class="rank-info"><div class="rank-name">{{ r.name }}</div><div class="rank-sub">{{ r.sub }}</div></div>
                            <span class="rank-val">{{ r.rate }}</span>
                        </div>
                        <div class="tip-row" style="margin-top: 12px;">
                            <span class="icon">🎁</span>
                            <div class="text">挑战结束后，完成率 <strong>≥ 80%</strong> 可获「养肝徽章」+ 200 元气积分。</div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="row">
                            <div class="card-title" style="margin: 0;"><span class="dot"></span>我的挑战徽章墙</div>
                            <div style="font-size: 12px; color: var(--ink-muted);">已点亮 <strong style="color: var(--gold);">5 / 12</strong></div>
                        </div>
                        <div class="badge-grid">
                            <div v-for="b in badges" :key="b.name" class="badge-item" :class="{ locked: !b.unlocked }">
                                <div class="b-emoji">{{ b.emoji }}</div>
                                <div class="b-name">{{ b.name }}</div>
                                <div class="b-cond">{{ b.cond }}</div>
                            </div>
                        </div>
                        <button class="btn btn-ghost" style="width: 100%; margin-top: 14px;">查看全部徽章与积分商城 →</button>
                    </div>
                </div>
            </section>
        </main>

        <div class="toast" :class="{ show: toastVisible }">{{ toastMsg }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import HeaderLayout from "@/layouts/HeaderLayout.vue";

const activeTab = ref("checkin");

const tabs = [
    { name: "checkin", icon: "✅", label: "每日打卡" },
    { name: "lifestyle", icon: "🍵", label: "饮食作息" },
    { name: "sharing", icon: "✍️", label: "经验分享" },
    { name: "interaction", icon: "💬", label: "社区互动" },
    { name: "challenge", icon: "🏆", label: "健康挑战" },
];

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
    toastTimer = setTimeout(() => { toastVisible.value = false; }, 2200);
}

// ---- Module 1: Check-in ----
const todayCheckin = { done: 5, total: 6 };
const streakDays = ref(28);
const friendsCount = ref(156);
const activeChallenges = ref(2);
const RING_C = 502;
const ringOffset = computed(() => {
    const done = checkItems.value.filter(i => i.done).length;
    return RING_C * (1 - done / checkItems.value.length);
});

const weekDays = [
    { label: "一", status: "done", display: "✓" },
    { label: "二", status: "done", display: "✓" },
    { label: "三", status: "today", display: "今" },
    { label: "四", status: "", display: "·" },
    { label: "五", status: "", display: "·" },
    { label: "六", status: "", display: "·" },
    { label: "日", status: "", display: "·" },
];

const moods = ["😔 疲惫", "😐 平常", "🙂 轻松", "😄 元气满满"];
const selectedMood = ref("🙂 轻松");

const checkItems = ref([
    { name: "早起", icon: "🌅", meta: "目标 06:30 前 · 已完成 06:24", done: true },
    { name: "喝水", icon: "💧", meta: "目标 2000ml · 已饮 1500ml", done: false },
    { name: "运动", icon: "🏃", meta: "目标 30 分钟 · 八段锦 32 分钟", done: true },
    { name: "冥想静心", icon: "🧘", meta: "目标 10 分钟 · 已完成", done: true },
    { name: "健康饮食", icon: "🥗", meta: "三餐清淡 · 已记录", done: true },
    { name: "早睡", icon: "🌙", meta: "目标 23:00 前 · 待今晚打卡", done: true },
]);

function completeAllChecks() {
    checkItems.value.forEach(i => { i.done = true; });
    toast("🎉 今日打卡全部完成，连续 29 天！");
}

const heatmapData = [3,4,2,3,4,3,4, 2,3,4,4,3,3,4, 3,2,4,3,4,4, 0,0,0,0,0,0,0, 0,0,0,0];

const milestones = [
    { name: "初心 · 连续 7 天", emoji: "🌱", desc: "已达成 · 2026/04/22 解锁", unlocked: true, statusLabel: "已获得" },
    { name: "坚持 · 连续 21 天", emoji: "🌿", desc: "已达成 · 2026/05/06 解锁", unlocked: true, statusLabel: "已获得" },
    { name: "而立 · 连续 30 天", emoji: "🌳", desc: "进度 28 / 30 天", unlocked: false, progress: 93, statusLabel: "2 天后" },
    { name: "恒心 · 连续 100 天", emoji: "🏔️", desc: "进度 28 / 100 天", unlocked: false, progress: 28, statusLabel: "未解锁" },
];

// ---- Module 2: Lifestyle ----
const routineTags = ["按时作息", "略有熬夜", "久坐过多", "午间小憩", "用眼疲劳"];
const routineSelected = ref(["按时作息", "午间小憩"]);
function toggleRoutineTag(tag: string) {
    const idx = routineSelected.value.indexOf(tag);
    if (idx >= 0) routineSelected.value.splice(idx, 1);
    else routineSelected.value.push(tag);
}

const meals = [
    { name: "早餐", emoji: "🥣", tag: "清淡", foods: "小米南瓜粥、水煮蛋、凉拌时蔬", cal: 420, bg: "breakfast" },
    { name: "午餐", emoji: "🍲", tag: "均衡", foods: "糙米饭、清蒸鲈鱼、西兰花、紫菜汤", cal: 610, bg: "lunch" },
    { name: "晚餐", emoji: "🥗", tag: "少油", foods: "杂粮馒头、山药排骨汤、炒青菜", cal: 480, bg: "dinner" },
    { name: "加餐 / 茶饮", emoji: "＋", tag: "", foods: "点击记录加餐、养生茶或水果", cal: 0, bg: "empty", empty: true },
];

const waterFilled = ref(6);

const nutrition = [
    { label: "碳水化合物", value: "192g", pct: 70, color: "var(--gold)" },
    { label: "蛋白质", value: "76g", pct: 62, color: "var(--jade)" },
    { label: "脂肪", value: "44g", pct: 48, color: "var(--cinnabar)" },
    { label: "膳食纤维", value: "21g", pct: 84, color: "var(--moon)" },
];

// ---- Module 3: Sharing ----
const shareCategories = ["食疗药膳", "作息调理", "运动养生", "情志疏导", "节气养生", "中医妙招"];
const selectedCategory = ref("食疗药膳");
const shareSorts = ["最新", "热门", "精华", "关注"];
const selectedShareSort = ref("最新");

const experiences = [
    { title: "坚持早睡 100 天，我的身体发生了这些改变", cat: "作息调理", emoji: "🌙", coverClass: "c2", author: "林清欢 · 养生达人", authorInitial: "林", likes: "1.2k", comments: "186", stars: "904" },
    { title: "小满润燥｜雪梨银耳羹的家常做法，三步搞定", cat: "食疗药膳", emoji: "🍐", coverClass: "c1", author: "苏小养 · 食养顾问", authorInitial: "苏", likes: "836", comments: "92", stars: "521" },
    { title: "久坐党自救：每天 8 分钟八段锦，腰背轻松多了", cat: "运动养生", emoji: "🧘", coverClass: "c5", author: "陈一山 · 习练 3 年", authorInitial: "陈", likes: "645", comments: "73", stars: "388" },
    { title: "情绪差时，我用这 3 个方法快速平复焦虑", cat: "情志疏导", emoji: "🌸", coverClass: "c3", author: "阿宁 · 正念爱好者", authorInitial: "阿", likes: "712", comments: "128", stars: "466" },
    { title: "小满养生指南：祛湿健脾，这几样食材别错过", cat: "节气养生", emoji: "💧", coverClass: "c4", author: "墨先生 · 中医科普", authorInitial: "墨", likes: "1.5k", comments: "204", stars: "1.1k" },
    { title: "办公室常备养生茶，我喝了一个月的真实感受", cat: "中医妙招", emoji: "🫖", coverClass: "c6", author: "禾木 · 打卡 60 天", authorInitial: "禾", likes: "489", comments: "56", stars: "302" },
];

const hotTopics = [
    { name: "小满养生打卡", emoji: "🔥", meta: "2.6 万 条经验 · 今日新增 312", bg: "var(--gold-soft)" },
    { name: "早睡早起挑战", emoji: "🌙", meta: "4.1 万 条经验 · 持续热议", bg: "var(--jade-soft)" },
    { name: "我的食疗方子", emoji: "🍲", meta: "1.8 万 条经验 · 精华 240", bg: "var(--pink-soft)" },
    { name: "八段锦习练日记", emoji: "☯️", meta: "9.7 千 条经验 · 新话题", bg: "var(--moon-soft)" },
];

// ---- Module 4: Interaction ----
const feedFilters = ["推荐", "关注", "同城"];
const selectedFeedFilter = ref("推荐");

const posts = ref([
    {
        id: 1, name: "林清欢", level: "Lv.6 养生达人", meta: "10 分钟前 · 完成今日打卡",
        avatarBg: "linear-gradient(135deg, var(--gold), var(--cinnabar))", avatarText: "林",
        text: "今天又是元气满满的一天！早起看了日出，泡脚加冥想，整个人都松弛下来了～",
        checkin: "6/6", checkinTitle: "今日打卡全部完成 · 连续 56 天", checkinDesc: "早起 · 喝水 · 运动 · 冥想 · 健康饮食 · 早睡",
        tags: ["早睡早起挑战", "小满养生打卡"],
        liked: false, likeCount: 132, commentCount: 18, starCount: 24,
    },
    {
        id: 2, name: "苏小养", level: "Lv.5 食养顾问", meta: "2 小时前 · 发布了一篇经验",
        avatarBg: "linear-gradient(135deg, var(--jade), var(--moon))", avatarText: "苏",
        text: "小满时节湿气重，分享一个祛湿健脾的家常方子 —— 赤小豆薏米山药粥，连喝一周，身体明显轻盈不少。具体做法在图里 👇",
        images: [
            { bg: "linear-gradient(135deg, var(--gold-soft), #EFD9A8)", emoji: "🥣" },
            { bg: "linear-gradient(135deg, var(--jade-soft), #D5E4DA)", emoji: "🌾" },
            { bg: "linear-gradient(135deg, var(--pink-soft), #F5D5DD)", emoji: "🍠" },
        ],
        tags: ["我的食疗方子", "小满养生打卡"],
        liked: true, likeCount: 268, commentCount: 45, starCount: 188,
        comments: [
            { id: 1, avatar: "禾", name: "禾木", text: "薏米需要先炒过吗？直接煮会不会偏寒～", meta: "1 小时前 · 赞 12 · 回复" },
            { id: 2, avatar: "苏", name: "苏小养（作者）", text: "对的！薏米炒到微黄再煮，寒性会减弱，更适合脾胃虚的朋友 👍", meta: "58 分钟前 · 赞 26 · 回复" },
        ],
    },
    {
        id: 3, name: "阿宁", level: "Lv.3 元气新星", meta: "5 小时前 · 来自「正念冥想小组」",
        avatarBg: "linear-gradient(135deg, var(--pink), var(--gold))", avatarText: "阿",
        text: "第 21 天冥想打卡完成！从一开始坐不住，到现在能安安静静待 15 分钟，焦虑真的少了很多。谢谢小组里大家的鼓励 🙏",
        tags: ["21天冥想静心挑战"],
        liked: false, likeCount: 96, commentCount: 31, starCount: 12,
    },
]);

const notifications = [
    { emoji: "❤️", bg: "var(--cinnabar-soft)", title: "收到 12 个新的赞", text: "林清欢、墨先生 等赞了你" },
    { emoji: "💬", bg: "var(--jade-soft)", title: "5 条新评论 / 回复", text: "苏小养回复了你的提问" },
    { emoji: "👥", bg: "var(--gold-soft)", title: "3 位新粉丝关注了你", text: "阿宁、禾木 等" },
];

const groups = [
    { name: "早睡自律互助组", emoji: "🌙", meta: "1.2 万 成员 · 每日打卡督促", bg: "var(--jade-soft)", joined: false },
    { name: "正念冥想小组", emoji: "🧘", meta: "8.6 千 成员 · 已加入", bg: "var(--pink-soft)", joined: true },
    { name: "食疗药膳交流圈", emoji: "🍵", meta: "2.3 万 成员 · 活跃", bg: "var(--gold-soft)", joined: false },
];

const leaderboard = [
    { name: "林清欢", sub: "打卡 56 天 · 经验 8 篇", score: "980", avatarBg: "linear-gradient(135deg, var(--gold), var(--cinnabar))", avatarText: "林" },
    { name: "墨先生", sub: "科普 12 篇 · 获赞 1.5k", score: "872", avatarBg: "linear-gradient(135deg, var(--jade), var(--moon))", avatarText: "墨" },
    { name: "苏小养", sub: "食疗方子 · 收藏 1.1k", score: "765", avatarBg: "linear-gradient(135deg, var(--pink), var(--gold))", avatarText: "苏" },
    { name: "我 · 嘉欣", sub: "打卡 28 天 · 经验 18 篇", score: "412", avatarBg: "linear-gradient(135deg, var(--jade), var(--jade-light))", avatarText: "JX", isMe: true },
];

// ---- Module 5: Challenges ----
const challengeFilters = ["全部", "作息", "饮食", "运动", "情志"];
const selectedChallengeFilter = ref("全部");

const challenges = [
    { name: "21 天早睡养肝挑战", emoji: "🌙", bg: "linear-gradient(135deg, var(--jade-soft), #D5E4DA)", statusClass: "status-on", statusLabel: "进行中", days: 21, cat: "作息", joined: true, people: [{ bg: "var(--jade)", text: "林" }, { bg: "var(--gold)", text: "苏" }, { bg: "var(--pink)", text: "阿" }, { bg: "var(--ink-muted)", text: "+3k" }] },
    { name: "14 天每日八杯水", emoji: "💧", bg: "linear-gradient(135deg, var(--moon-soft), #C8D5E5)", statusClass: "status-on", statusLabel: "进行中", days: 14, cat: "饮食", joined: true, people: [{ bg: "var(--moon)", text: "禾" }, { bg: "var(--jade)", text: "陈" }, { bg: "var(--ink-muted)", text: "+1.8k" }] },
    { name: "21 天冥想静心挑战", emoji: "🧘", bg: "linear-gradient(135deg, var(--pink-soft), #F5D5DD)", statusClass: "status-on", statusLabel: "进行中", days: 21, cat: "情志", joined: false, people: [{ bg: "var(--pink)", text: "阿" }, { bg: "var(--gold)", text: "墨" }, { bg: "var(--ink-muted)", text: "+960" }] },
    { name: "7 天清淡饮食挑战", emoji: "🥗", bg: "linear-gradient(135deg, var(--gold-soft), #EFD9A8)", statusClass: "status-soon", statusLabel: "即将开始", days: 7, cat: "饮食", joined: false, people: [{ bg: "var(--jade)", text: "林" }, { bg: "var(--ink-muted)", text: "+540" }] },
    { name: "30 天八段锦晨练", emoji: "☯️", bg: "linear-gradient(135deg, #E6E0EF, #F0E5F4)", statusClass: "status-soon", statusLabel: "即将开始", days: 30, cat: "运动", joined: false, people: [{ bg: "var(--moon)", text: "陈" }, { bg: "var(--ink-muted)", text: "+720" }] },
    { name: "21 天戒糖养颜挑战", emoji: "🍃", bg: "linear-gradient(135deg, var(--cinnabar-soft), #F5D0C8)", statusClass: "status-soon", statusLabel: "即将开始", days: 21, cat: "饮食", joined: false, people: [{ bg: "var(--pink)", text: "苏" }, { bg: "var(--ink-muted)", text: "+1.2k" }] },
];

const challengeRanks = [
    { name: "林清欢", sub: "连续达标 8 天 · 全勤", rate: "100%", avatarBg: "linear-gradient(135deg, var(--gold), var(--cinnabar))", avatarText: "林" },
    { name: "陈一山", sub: "达标 7 天 · 缺卡 1 天", rate: "96%", avatarBg: "linear-gradient(135deg, var(--jade), var(--moon))", avatarText: "陈" },
    { name: "我 · 嘉欣", sub: "达标 7 天 · 平均 22:48 入睡", rate: "92%", avatarBg: "linear-gradient(135deg, var(--jade), var(--jade-light))", avatarText: "JX", isMe: true },
    { name: "禾木", sub: "达标 6 天", rate: "81%", avatarBg: "linear-gradient(135deg, var(--pink), var(--gold))", avatarText: "禾" },
];

const badges = [
    { name: "早起达人", emoji: "🌅", cond: "已点亮", unlocked: true },
    { name: "饮水标兵", emoji: "💧", cond: "已点亮", unlocked: true },
    { name: "冥想新星", emoji: "🧘", cond: "已点亮", unlocked: true },
    { name: "早睡先锋", emoji: "🌙", cond: "已点亮", unlocked: true },
    { name: "经验作者", emoji: "✍️", cond: "已点亮", unlocked: true },
    { name: "恒心百日", emoji: "🏔️", cond: "进度 28/100", unlocked: false },
    { name: "食养专家", emoji: "🥗", cond: "完成戒糖挑战", unlocked: false },
    { name: "社区之星", emoji: "👑", cond: "登榜周榜前三", unlocked: false },
];
</script>

<style scoped lang="scss">
.page-wrapper { min-height: 100vh; }

.hub { max-width: 1200px; margin: 0 auto; padding: 32px 40px 80px; }

// Hero
.hero {
    background: linear-gradient(135deg, #E4EFE8 0%, #EDF4EF 60%, #FDFAF3 100%);
    border: 1px solid var(--jade-soft);
    border-radius: 20px; padding: 36px 40px; margin-bottom: 28px;
    position: relative; overflow: hidden;
}
.hero::before {
    content: '氣'; position: absolute;
    right: 36px; top: 50%; transform: translateY(-50%);
    font-family: "STKaiti", serif; font-size: 200px;
    color: var(--jade); opacity: 0.10; line-height: 1; font-weight: 900;
}
.hero-label { font-size: 13px; color: var(--jade); letter-spacing: 3px; margin-bottom: 8px; }
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
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }

// Buttons
.btn {
    background: var(--jade); color: white; border: none;
    padding: 10px 20px; border-radius: 22px; font-family: inherit;
    font-size: 13px; cursor: pointer; transition: all .2s;
    display: inline-flex; align-items: center; gap: 6px;
}
.btn:hover { background: var(--ink); transform: translateY(-1px); }
.btn-ghost { background: transparent; color: var(--jade); border: 1px solid var(--jade); }
.btn-ghost:hover { background: var(--jade-soft); color: var(--jade); transform: translateY(-1px); }
.btn-gold { background: linear-gradient(135deg, var(--gold), var(--gold-deep)); }
.btn-gold:hover { background: var(--gold-deep); }
.btn-sm { padding: 6px 14px; font-size: 12px; }

.tip-list { display: flex; flex-direction: column; gap: 12px; }
.tip-row {
    display: flex; align-items: flex-start; gap: 12px; padding: 12px;
    background: var(--paper-warm); border-radius: 10px; border-left: 3px solid var(--jade);
}
.tip-row .icon { font-size: 20px; }
.tip-row .text { font-size: 14px; color: var(--ink); line-height: 1.6; }
.tip-row .text strong { color: var(--jade); }

.pick-chip {
    padding: 6px 14px; background: var(--paper); border: 1px solid var(--line);
    border-radius: 14px; font-size: 12px; color: var(--ink-muted);
    cursor: pointer; transition: all .2s;
}
.pick-chip:hover { border-color: var(--jade); color: var(--jade); }
.pick-chip.active { background: var(--jade-soft); border-color: var(--jade); color: var(--jade); font-weight: 500; }
.chip-row { display: flex; flex-wrap: wrap; gap: 8px; }

// Check-in Ring
.checkin-hero {
    background: linear-gradient(135deg, #DDEBE3 0%, #EDF4EF 100%);
    border-radius: 16px; padding: 28px; text-align: center;
    position: relative; overflow: hidden;
}
.checkin-hero::after {
    content: '🌿'; position: absolute; right: -12px; bottom: -16px;
    font-size: 130px; opacity: 0.14;
}
.ring-wrap { width: 184px; height: 184px; margin: 4px auto 14px; position: relative; }
.ring-wrap svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-wrap circle { fill: none; stroke-width: 12; }
.ring-bg { stroke: rgba(92,131,116,0.15); }
.ring-fg {
    stroke: var(--jade); stroke-linecap: round;
    stroke-dasharray: 502; transition: stroke-dashoffset .6s ease;
}
.ring-num { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ring-num .big { font-family: "STKaiti", serif; font-size: 46px; font-weight: 600; color: var(--jade); line-height: 1; }
.ring-num .big span { font-size: 22px; color: var(--ink-muted); }
.ring-num .label { font-size: 12px; color: var(--ink-muted); letter-spacing: 2px; margin-top: 4px; }
.streak-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--gold-soft); color: #9A7B33;
    padding: 6px 16px; border-radius: 16px; font-size: 13px; font-weight: 600;
}

// Week Strip
.week-strip { display: flex; justify-content: space-between; margin: 6px 0 4px; }
.day-dot { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.day-dot .d-label { font-size: 11px; color: var(--ink-muted); }
.day-dot .d-circle {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; background: var(--cream); border: 1px solid var(--line); color: var(--ink-muted);
}
.day-dot.done .d-circle { background: var(--jade); color: white; border-color: var(--jade); }
.day-dot.today .d-circle { box-shadow: 0 0 0 2px var(--gold); font-weight: 600; }
.day-dot.miss .d-circle { background: var(--cinnabar-soft); color: var(--cinnabar); border-color: var(--cinnabar-soft); }

// Check Items
.check-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.check-item {
    background: var(--paper-warm); border: 1px solid var(--line); border-radius: 12px;
    padding: 16px; display: flex; align-items: center; gap: 12px; transition: all .2s;
}
.check-item:hover { box-shadow: var(--shadow); }
.check-item .ci-icon {
    width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
    background: var(--jade-soft); display: flex; align-items: center;
    justify-content: center; font-size: 22px;
}
.check-item .ci-info { flex: 1; min-width: 0; }
.check-item .ci-name { font-size: 14px; font-weight: 600; }
.check-item .ci-meta { font-size: 12px; color: var(--ink-muted); margin-top: 2px; }
.check-box {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    border: 2px solid var(--line); background: var(--paper);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: transparent; font-size: 15px; transition: all .2s;
}
.check-box:hover { border-color: var(--jade); }
.check-item.done { background: var(--jade-soft); border-color: var(--jade-light); }
.check-item.done .check-box { background: var(--jade); border-color: var(--jade); color: white; }
.check-item.done .ci-icon { background: var(--paper); }

// Heatmap
.heatmap { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.hm-head { text-align: center; font-size: 10px; color: var(--ink-muted); padding-bottom: 2px; }
.hm-cell { aspect-ratio: 1; border-radius: 5px; background: var(--cream); }
.hm-cell.lv1 { background: #D6E5DC; }
.hm-cell.lv2 { background: #A9CABA; }
.hm-cell.lv3 { background: #7BAA96; }
.hm-cell.lv4 { background: var(--jade); }
.hm-cell.muted { background: transparent; }
.hm-legend { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--ink-muted); margin-top: 12px; justify-content: flex-end; }
.hm-legend .hm-cell { width: 12px; aspect-ratio: 1; }

// Milestone
.milestone-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px dashed var(--line); }
.milestone-row:last-child { border-bottom: none; }
.ms-medal {
    width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 22px;
    background: var(--gold-soft);
}
.ms-medal.locked { background: var(--cream); filter: grayscale(1); opacity: 0.5; }
.ms-info { flex: 1; }
.ms-name { font-size: 14px; font-weight: 600; }
.ms-desc { font-size: 12px; color: var(--ink-muted); }
.progress-track { height: 6px; background: var(--cream); border-radius: 3px; margin-top: 6px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold-soft)); border-radius: 3px; }

// Routine
.routine-card {
    background: linear-gradient(135deg, #FDFAF3 0%, #F0E8D5 100%);
    border: 1px solid var(--gold-soft); border-radius: 16px; padding: 28px;
    position: relative; overflow: hidden;
}
.routine-card::after { content: '⏰'; position: absolute; right: 24px; top: 22px; font-size: 38px; opacity: 0.3; }
.time-form { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 6px; }
.time-group { background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; transition: all .2s; }
.time-group:focus-within { border-color: var(--jade); box-shadow: 0 0 0 3px rgba(92,131,116,0.1); }
.time-group .t-label { font-size: 12px; color: var(--ink-muted); margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
.time-input {
    border: none; background: transparent; font-family: "STKaiti", serif;
    font-size: 24px; font-weight: 600; color: var(--ink); width: 100%; outline: none; cursor: pointer;
}
.duration-display {
    margin-top: 16px; padding: 12px 16px; background: var(--jade-soft); border-radius: 10px;
    display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: var(--jade);
}
.duration-display strong { font-family: "STKaiti", serif; font-size: 20px; font-weight: 600; }

// Meal Cards
.meal-card { background: var(--paper-warm); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; transition: all .2s; }
.meal-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
.meal-img { height: 96px; display: flex; align-items: center; justify-content: center; font-size: 40px; }
.meal-img.breakfast { background: linear-gradient(135deg, var(--gold-soft), #EFD9A8); }
.meal-img.lunch { background: linear-gradient(135deg, var(--jade-soft), #D5E4DA); }
.meal-img.dinner { background: linear-gradient(135deg, var(--moon-soft), #C8D5E5); }
.meal-img.empty { background: var(--cream); font-size: 30px; color: var(--ink-muted); border-bottom: 1px dashed var(--line); }
.meal-body { padding: 12px 14px; }
.meal-name { font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: space-between; }
.meal-tag { font-size: 11px; padding: 2px 8px; border-radius: 8px; background: var(--jade-soft); color: var(--jade); }
.meal-foods { font-size: 12px; color: var(--ink-muted); margin-top: 6px; line-height: 1.5; }
.meal-cal { font-size: 12px; color: var(--gold); font-weight: 600; margin-top: 8px; }

// Water
.water-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 8px 0 16px; }
.water-cup {
    aspect-ratio: 1; border-radius: 12px; border: 2px solid var(--line);
    background: var(--cream); display: flex; align-items: center; justify-content: center;
    font-size: 24px; cursor: pointer; transition: all .2s; opacity: 0.45;
}
.water-cup.filled { background: var(--moon-soft); border-color: var(--moon); opacity: 1; }
.water-cup:hover { transform: scale(1.05); }

// Nutrition
.nutri-ring { display: flex; align-items: center; gap: 18px; }
.cal-circle {
    width: 110px; height: 110px; border-radius: 50%; flex-shrink: 0;
    background: conic-gradient(var(--gold) 0% 72%, var(--cream) 72% 100%);
    display: flex; align-items: center; justify-content: center;
}
.cal-circle .inner {
    width: 84px; height: 84px; border-radius: 50%; background: var(--paper);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.cal-circle .inner .num { font-family: "STKaiti", serif; font-size: 24px; font-weight: 600; color: var(--ink); }
.cal-circle .inner .unit { font-size: 11px; color: var(--ink-muted); }
.nutri-bar { margin-bottom: 12px; }
.nutri-bar .nb-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--ink-muted); margin-bottom: 4px; }
.nutri-track { height: 8px; background: var(--cream); border-radius: 4px; overflow: hidden; }
.nutri-fill { height: 100%; border-radius: 4px; }

// Chart
.mini-chart { height: 150px; margin-top: 8px; }
.chart-svg { width: 100%; height: 100%; }
.chart-grid { stroke: var(--line); stroke-width: 1; }
.chart-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--ink-muted); margin-top: 8px; }

// Compose
.compose-card {
    background: linear-gradient(135deg, #EDF4EF 0%, #FDFAF3 100%);
    border: 1px solid var(--jade-soft); border-radius: 16px; padding: 24px;
}
.compose-box {
    background: var(--paper); border: 1px solid var(--line); border-radius: 12px;
    padding: 16px; min-height: 90px; font-size: 14px; color: var(--ink-muted);
}
.compose-box:focus-within { border-color: var(--jade); }
.compose-box textarea {
    width: 100%; border: none; outline: none; resize: none; font-family: inherit;
    font-size: 14px; color: var(--ink); background: transparent; min-height: 70px;
}
.upload-row { display: flex; gap: 10px; margin-top: 12px; }
.upload-box {
    width: 76px; height: 76px; border-radius: 10px; border: 1.5px dashed var(--line);
    background: var(--paper); display: flex; flex-direction: column; gap: 2px;
    align-items: center; justify-content: center; color: var(--ink-muted);
    font-size: 11px; cursor: pointer; transition: all .2s;
}
.upload-box:hover { border-color: var(--jade); color: var(--jade); }
.upload-box .plus { font-size: 22px; }
.upload-thumb {
    width: 76px; height: 76px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; font-size: 30px;
    background: linear-gradient(135deg, var(--gold-soft), var(--jade-soft));
    position: relative;
}
.upload-thumb .x {
    position: absolute; top: -6px; right: -6px; width: 18px; height: 18px;
    background: var(--ink); color: white; border-radius: 50%; font-size: 11px;
    display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.compose-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; }
.compose-tools { display: flex; gap: 14px; font-size: 13px; color: var(--ink-muted); }
.compose-tools span { cursor: pointer; }
.compose-tools span:hover { color: var(--jade); }

// Experience Cards
.exp-card {
    background: var(--paper); border: 1px solid var(--line); border-radius: 14px;
    overflow: hidden; cursor: pointer; transition: all .2s;
}
.exp-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.exp-cover { height: 140px; display: flex; align-items: center; justify-content: center; font-size: 48px; position: relative; }
.exp-cover.c1 { background: linear-gradient(135deg, var(--gold-soft), #EFD9A8); }
.exp-cover.c2 { background: linear-gradient(135deg, var(--jade-soft), #D5E4DA); }
.exp-cover.c3 { background: linear-gradient(135deg, var(--pink-soft), #F5D5DD); }
.exp-cover.c4 { background: linear-gradient(135deg, var(--moon-soft), #C8D5E5); }
.exp-cover.c5 { background: linear-gradient(135deg, #E6E0EF, #F0E5F4); }
.exp-cover.c6 { background: linear-gradient(135deg, var(--cinnabar-soft), #F5D0C8); }
.exp-cover .exp-cat {
    position: absolute; top: 10px; left: 10px; font-size: 11px;
    padding: 3px 10px; border-radius: 10px; background: rgba(255,255,255,0.9); color: var(--jade); font-weight: 600;
}
.exp-body { padding: 14px; }
.exp-title { font-size: 14px; font-weight: 600; line-height: 1.45; }
.exp-author { display: flex; align-items: center; gap: 6px; margin-top: 10px; font-size: 12px; color: var(--ink-muted); }
.exp-author .mini-avatar {
    width: 22px; height: 22px; border-radius: 50%; font-size: 10px;
    background: linear-gradient(135deg, var(--gold), var(--cinnabar));
    display: flex; align-items: center; justify-content: center; color: white;
}
.exp-stats { display: flex; gap: 14px; margin-top: 10px; font-size: 12px; color: var(--ink-muted); }

// Community Posts
.post { padding: 18px 0; border-bottom: 1px solid var(--line); }
.post:last-child { border-bottom: none; padding-bottom: 0; }
.post:first-child { padding-top: 0; }
.post-head { display: flex; align-items: center; gap: 10px; }
.post-head .avatar { width: 42px; height: 42px; font-size: 14px; }
.post-head .ph-info { flex: 1; }
.post-head .ph-name { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.level-tag { font-size: 10px; padding: 1px 7px; border-radius: 8px; background: var(--gold-soft); color: #9A7B33; font-weight: 600; }
.post-head .ph-meta { font-size: 12px; color: var(--ink-muted); }
.post-text { font-size: 14px; color: var(--ink); margin: 10px 0; line-height: 1.7; }
.post-imgs { display: flex; gap: 8px; margin: 10px 0; }
.post-img {
    width: 110px; height: 110px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; font-size: 38px;
}
.post-checkin {
    display: flex; align-items: center; gap: 12px; padding: 12px 14px;
    background: var(--jade-soft); border-radius: 10px; margin: 10px 0;
}
.post-checkin .pc-ring {
    width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
    background: var(--jade); color: white; display: flex; align-items: center;
    justify-content: center; font-size: 13px; font-weight: 600;
}
.post-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
.topic-tag { font-size: 12px; color: var(--jade); }
.post-actions { display: flex; gap: 22px; margin-top: 10px; font-size: 13px; color: var(--ink-muted); }
.post-actions .pa { display: flex; align-items: center; gap: 5px; cursor: pointer; transition: color .2s; }
.post-actions .pa:hover { color: var(--jade); }
.post-actions .pa.liked { color: var(--cinnabar); }

// Comments
.comment-area { margin-top: 12px; padding: 12px 14px; background: var(--paper-warm); border-radius: 10px; }
.comment { display: flex; gap: 8px; padding: 8px 0; }
.comment .mini-avatar {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; font-size: 11px;
    background: linear-gradient(135deg, var(--jade), var(--moon));
    display: flex; align-items: center; justify-content: center; color: white;
}
.comment .c-body { flex: 1; font-size: 13px; }
.comment .c-name { color: var(--jade); font-weight: 600; }
.comment .c-meta { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }
.comment-input {
    display: flex; gap: 10px; align-items: center; margin-top: 8px;
    background: var(--paper); border: 1px solid var(--line); border-radius: 20px; padding: 8px 14px;
}
.comment-input input { flex: 1; border: none; outline: none; background: transparent; font-family: inherit; font-size: 13px; }

// Side List
.side-row {
    display: flex; align-items: center; gap: 10px; padding: 10px 0;
    border-bottom: 1px dashed var(--line);
}
.side-row:last-child { border-bottom: none; }
.group-icon {
    width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.side-info { flex: 1; min-width: 0; }
.side-name { font-size: 13px; font-weight: 600; }
.side-meta { font-size: 11px; color: var(--ink-muted); }

// Challenge
.challenge-hero {
    background: linear-gradient(135deg, #B33C2C 0%, #C9685A 100%);
    color: white; border-radius: 16px; padding: 28px 32px;
    position: relative; overflow: hidden;
}
.challenge-hero::after { content: '🏆'; position: absolute; right: 20px; bottom: -10px; font-size: 130px; opacity: 0.18; }
.challenge-hero .ch-tag {
    display: inline-block; background: rgba(255,255,255,0.2);
    padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-bottom: 10px;
}
.challenge-hero h2 { font-family: "STKaiti", serif; font-size: 30px; font-weight: 600; }
.ch-stats { display: flex; gap: 30px; margin: 16px 0; }
.ch-stats .cs { font-size: 13px; opacity: 0.9; }
.ch-stats .cs strong { display: block; font-family: "STKaiti", serif; font-size: 22px; }
.ch-progress-track { height: 8px; background: rgba(255,255,255,0.25); border-radius: 4px; overflow: hidden; max-width: 460px; }
.ch-progress-fill { height: 100%; background: white; border-radius: 4px; }

.challenge-card { background: var(--paper); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; transition: all .2s; }
.challenge-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.cc-cover { height: 120px; display: flex; align-items: center; justify-content: center; font-size: 46px; position: relative; }
.cc-cover .cc-status {
    position: absolute; top: 10px; right: 10px; font-size: 11px;
    padding: 3px 10px; border-radius: 10px; font-weight: 600;
}
.status-on { background: var(--jade); color: white; }
.status-soon { background: var(--gold-soft); color: #9A7B33; }
.cc-body { padding: 14px; }
.cc-name { font-size: 15px; font-weight: 600; }
.cc-meta { font-size: 12px; color: var(--ink-muted); margin-top: 6px; display: flex; gap: 12px; }
.cc-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
.cc-people { display: flex; align-items: center; }
.cc-people .pp {
    width: 24px; height: 24px; border-radius: 50%; margin-left: -8px;
    border: 2px solid var(--paper); display: flex; align-items: center;
    justify-content: center; font-size: 9px; color: white;
}
.cc-people .pp:first-child { margin-left: 0; }

// Leaderboard
.rank-row { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px dashed var(--line); }
.rank-row:last-child { border-bottom: none; }
.rank-num {
    width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; background: var(--cream); color: var(--ink-muted);
}
.rank-num.top1 { background: #F3D98B; color: #8A6A18; }
.rank-num.top2 { background: #DCDCDC; color: #5C5C5C; }
.rank-num.top3 { background: #E8C9A8; color: #8A5A2B; }
.rank-row .avatar { width: 34px; height: 34px; font-size: 12px; }
.rank-info { flex: 1; }
.rank-name { font-size: 13px; font-weight: 600; }
.rank-sub { font-size: 11px; color: var(--ink-muted); }
.rank-val { font-family: "STKaiti", serif; font-size: 17px; font-weight: 600; color: var(--gold); }
.rank-row.me { background: var(--jade-soft); border-radius: 10px; padding: 11px 10px; border-bottom: none; }

// Badges
.badge-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.badge-item { text-align: center; padding: 14px 6px; border-radius: 12px; background: var(--paper-warm); border: 1px solid var(--line); }
.badge-item .b-emoji { font-size: 32px; }
.badge-item.locked .b-emoji { filter: grayscale(1); opacity: 0.4; }
.badge-item .b-name { font-size: 12px; font-weight: 600; margin-top: 6px; }
.badge-item .b-cond { font-size: 10px; color: var(--ink-muted); margin-top: 2px; }

// Toast
.toast {
    position: fixed; left: 50%; bottom: 40px; transform: translateX(-50%) translateY(20px);
    background: var(--ink); color: white; padding: 12px 24px; border-radius: 24px;
    font-size: 13px; opacity: 0; pointer-events: none; transition: all .3s; z-index: 999;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

// Avatar base
.avatar {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 600; font-size: 13px; flex-shrink: 0;
}

@media (max-width: 920px) {
    .hub { padding: 20px 16px 60px; }
    .tabs { grid-template-columns: repeat(3, 1fr); }
    .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
    .check-grid { grid-template-columns: 1fr 1fr; }
    .time-form { grid-template-columns: 1fr; }
    .badge-grid { grid-template-columns: repeat(3, 1fr); }
    .hero::before { display: none; }
}
</style>
