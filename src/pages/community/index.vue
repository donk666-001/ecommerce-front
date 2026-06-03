<template>
    <div class="page-wrapper">
        <HeaderLayout />

        <main class="hub">
            <!-- Hero -->
            <section class="hero">
                <div class="hero-label font-serif">
                    VITALITY COMMUNITY · 元气打卡社区
                </div>
                <h1 class="font-serif">元气社区</h1>
                <p class="hero-sub">
                    打卡养生日常，记录饮食作息，分享养生心得，与同道好友互相督促
                    —— 让坚持成为习惯，让养生融入生活。
                </p>
                <div class="hero-meta">
                    <span class="meta-item"
                        >✅ 今日打卡
                        <strong
                            >{{ todayCheckin.done }} /
                            {{ todayCheckin.total }} 项</strong
                        ></span
                    >
                    <span class="meta-item"
                        >🔥 连续打卡 <strong>{{ streakDays }} 天</strong></span
                    >
                    <span class="meta-item"
                        >👥 社区好友
                        <strong>{{ friendsCount }} 位</strong></span
                    >
                    <span class="meta-item"
                        >🏆 进行中挑战
                        <strong>{{ activeChallenges }} 个</strong></span
                    >
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
                        <div
                            style="
                                font-size: 12px;
                                color: var(--ink-muted);
                                letter-spacing: 2px;
                            "
                        >
                            TODAY · 2026 年 5 月 20 日 · 小满
                        </div>
                        <div class="ring-wrap">
                            <svg viewBox="0 0 184 184">
                                <circle
                                    class="ring-bg"
                                    cx="92"
                                    cy="92"
                                    r="80"
                                />
                                <circle
                                    class="ring-fg"
                                    cx="92"
                                    cy="92"
                                    r="80"
                                    :style="{ strokeDashoffset: ringOffset }"
                                />
                            </svg>
                            <div class="ring-num">
                                <div class="big">
                                    {{ checkItems.filter((i) => i.done).length
                                    }}<span>/{{ checkItems.length }}</span>
                                </div>
                                <div class="label">今日打卡进度</div>
                            </div>
                        </div>
                        <div style="margin-top: 16px">
                            <button class="btn" @click="toggleAllChecks">
                                {{ allChecksDone ? '一键取消今日打卡' : '一键完成今日打卡' }}
                            </button>
                            <button
                                class="btn btn-ghost"
                                style="margin-left: 8px"
                                @click="openPoster"
                            >
                                📤 生成打卡海报
                            </button>
                        </div>
                    </div>

                    <div class="card">
                        <div class="row">
                            <div class="card-title" style="margin: 0">
                                <span class="dot"></span>本周打卡
                            </div>
                            <div style="font-size: 12px; color: var(--ink-muted)">
                                本周已坚持
                                <strong style="color: var(--jade)">{{ thisWeekDoneCount }} 天</strong>
                            </div>
                        </div>
                        <div class="week-strip">
                            <div
                                v-for="day in weekDays"
                                :key="day.key"
                                class="day-dot"
                                :class="day.status"
                            >
                                <span class="d-label">{{ day.label }}</span>
                                <span class="d-circle">{{ day.display }}</span>
                            </div>
                        </div>
                        <div style="margin-top: 16px; font-size: 13px; color: var(--ink-muted); margin-bottom: 8px">
                            今日打卡心情
                        </div>
                        <div class="chip-row">
                            <span
                                v-for="mood in moods"
                                :key="mood"
                                class="pick-chip"
                                :class="{ active: selectedMood === mood }"
                                @click="selectMood(mood)"
                            >{{ mood }}</span>
                        </div>
                        <div class="tip-row" style="margin-top: 16px">
                            <span class="icon">💡</span>
                            <div class="text">坚持打卡满 <strong>30 天</strong>，可解锁「养生达人」称号与节气礼盒优惠券。</div>
                        </div>
                    </div>
                </div>

                <div class="card" style="margin-top: 20px">
                    <div class="row">
                        <div class="card-title" style="margin: 0">
                            <span class="dot"></span>今日打卡清单
                        </div>
                        <button class="btn btn-ghost btn-sm" @click="openCheckinDialog">
                            ＋ 自定义打卡项
                        </button>
                    </div>

                    <!-- 空状态 -->
                    <div v-if="checkItems.length === 0" class="checkin-empty" @click="openCheckinDialog">
                        <div class="checkin-empty-icon">✅</div>
                        <div class="checkin-empty-text">点击「自定义打卡项」添加今日打卡计划</div>
                    </div>

                    <div v-else class="check-grid">
                        <div
                            v-for="(item, idx) in checkItems"
                            :key="idx"
                            class="check-item"
                            :class="{ done: item.done }"
                        >
                            <div class="ci-icon">{{ item.icon }}</div>
                            <div class="ci-info">
                                <div class="ci-name">{{ item.name }}</div>
                                <div class="ci-meta">{{ item.meta }}</div>
                            </div>
                            <button class="ci-del" @click.stop="removeCheckin(idx)">✕</button>
                            <div class="check-box" @click="toggleCheckinItem(idx)">✓</div>
                        </div>
                    </div>

                    <!-- 自定义打卡弹窗 -->
                    <Teleport to="body">
                        <Transition name="wset-modal">
                            <div v-if="showCheckinDialog" class="wset-mask" @click.self="showCheckinDialog = false">
                                <div class="wset-dialog checkin-dialog">
                                    <div class="wset-header">
                                        <span>添加打卡项</span>
                                        <button @click="showCheckinDialog = false">✕</button>
                                    </div>
                                    <div class="wset-body">
                                        <label>
                                            <span>图标（emoji）</span>
                                            <div class="checkin-emoji-grid">
                                                <button
                                                    v-for="e in checkinEmojiOptions"
                                                    :key="e"
                                                    class="checkin-emoji-btn"
                                                    :class="{ active: checkinForm.icon === e }"
                                                    @click="checkinForm.icon = e"
                                                >{{ e }}</button>
                                            </div>
                                            <input
                                                v-model="checkinForm.icon"
                                                class="checkin-icon-input"
                                                placeholder="或直接输入任意 emoji"
                                                maxlength="4"
                                            />
                                        </label>
                                        <label>
                                            <span>打卡名称</span>
                                            <div class="wset-input-row">
                                                <input v-model="checkinForm.name" class="checkin-text-input" placeholder="如：冥想、读书、散步…" />
                                            </div>
                                        </label>
                                        <label>
                                            <span>备注说明（选填）</span>
                                            <div class="wset-input-row">
                                                <input v-model="checkinForm.meta" class="checkin-text-input" placeholder="如：目标 30 分钟" />
                                            </div>
                                        </label>
                                    </div>
                                    <div class="wset-footer">
                                        <button class="wset-btn" @click="showCheckinDialog = false">取消</button>
                                        <button class="wset-btn primary" @click="saveCheckin">添加</button>
                                    </div>
                                </div>
                            </div>
                        </Transition>
                    </Teleport>
                </div>

                <div class="grid-2" style="margin-top: 20px">
                    <div class="card">
                        <div class="row">
                            <div class="card-title" style="margin:0;display:flex;align-items:center;gap:8px">
                                <span class="dot"></span>打卡日历
                                <select class="cal-month-select" v-model.number="calMonth">
                                    <option v-for="(m, i) in 12" :key="i" :value="i">{{ i + 1 }} 月</option>
                                </select>
                                <select class="cal-month-select" v-model.number="calYear">
                                    <option v-for="y in yearOptions" :key="y" :value="y">{{ y }} 年</option>
                                </select>
                            </div>
                            <div style="display:flex;align-items:center;gap:6px">
                                <span style="font-size:12px;color:var(--ink-muted)">
                                    本月打卡 <strong style="color:var(--jade)">{{ calMonthDoneCount }} 天</strong>
                                </span>
                                <button class="cal-nav-btn" @click="calPrevMonth">‹</button>
                                <button class="cal-nav-btn" @click="calNextMonth">›</button>
                            </div>
                        </div>
                        <div class="heatmap">
                            <div class="hm-head">一</div>
                            <div class="hm-head">二</div>
                            <div class="hm-head">三</div>
                            <div class="hm-head">四</div>
                            <div class="hm-head">五</div>
                            <div class="hm-head">六</div>
                            <div class="hm-head">日</div>
                            <template v-for="cell in calendarCells" :key="cell.key || 'b' + cell.day">
                                <div
                                    v-if="cell.type === 'blank'"
                                    class="hm-cell muted"
                                ></div>
                                <div
                                    v-else
                                    class="hm-cell"
                                    :class="[cell.level ? 'lv' + cell.level : '', cell.isToday ? 'hm-today' : '', cell.hasData ? 'hm-clickable' : '']"
                                    :title="cell.hasData ? `${cell.key} 点击查看` : cell.key"
                                    @click="cell.hasData && openHistoryDetail(cell.key)"
                                >
                                    <span class="hm-cell-day">{{ cell.day }}</span>
                                </div>
                            </template>
                        </div>
                        <div class="hm-legend">
                            少 <span class="hm-cell"></span
                            ><span class="hm-cell lv1"></span
                            ><span class="hm-cell lv2"></span
                            ><span class="hm-cell lv3"></span
                            ><span class="hm-cell lv4"></span> 多
                        </div>
                    </div>

                    <!-- 历史打卡详情弹窗 -->
                    <Teleport to="body">
                        <Transition name="wset-modal">
                            <div v-if="showHistoryDetail" class="wset-mask" @click.self="showHistoryDetail = false">
                                <div class="wset-dialog history-dialog">
                                    <div class="wset-header">
                                        <span>{{ historyDetailKey }} 打卡记录</span>
                                        <button @click="showHistoryDetail = false">✕</button>
                                    </div>
                                    <div class="wset-body">
                                        <div v-if="historyDetailRecord" class="history-content">
                                            <div class="history-mood">
                                                当日心情：<strong>{{ historyDetailRecord.mood || '未记录' }}</strong>
                                            </div>
                                            <div class="history-items">
                                                <div
                                                    v-for="(item, i) in historyDetailRecord.items"
                                                    :key="i"
                                                    class="history-item"
                                                    :class="{ done: item.done }"
                                                >
                                                    <span class="history-item-icon">{{ item.icon }}</span>
                                                    <span class="history-item-name">{{ item.name }}</span>
                                                    <span v-if="item.meta" class="history-item-meta">{{ item.meta }}</span>
                                                    <span class="history-item-status">{{ item.done ? '✓' : '—' }}</span>
                                                </div>
                                            </div>
                                            <div class="history-summary">
                                                完成 {{ historyDetailRecord.items.filter(i => i.done).length }} / {{ historyDetailRecord.items.length }} 项
                                            </div>
                                        </div>
                                    </div>
                                    <div class="wset-footer">
                                        <button class="wset-btn primary" @click="showHistoryDetail = false">关闭</button>
                                    </div>
                                </div>
                            </div>
                        </Transition>
                    </Teleport>

                    <div class="card">
                        <div class="card-title">
                            <span class="dot"></span>连续打卡里程碑
                        </div>
                        <div
                            v-for="ms in milestones"
                            :key="ms.name"
                            class="milestone-row"
                        >
                            <div
                                class="ms-medal"
                                :class="{ locked: !ms.unlocked }"
                            >
                                {{ ms.emoji }}
                            </div>
                            <div class="ms-info">
                                <div class="ms-name">{{ ms.name }}</div>
                                <div class="ms-desc">{{ ms.desc }}</div>
                                <div
                                    v-if="!ms.unlocked && ms.progress"
                                    class="progress-track"
                                >
                                    <div
                                        class="progress-fill"
                                        :style="{ width: ms.progress + '%' }"
                                    ></div>
                                </div>
                            </div>
                            <span
                                class="pick-chip"
                                :class="{ active: ms.unlocked }"
                                >{{ ms.statusLabel }}</span
                            >
                        </div>
                    </div>
                </div>

                <!-- 海报预览弹窗 -->
                <Teleport to="body">
                    <Transition name="wset-modal">
                        <div v-if="showPoster" class="wset-mask" @click.self="showPoster = false">
                            <div class="poster-modal">
                                <div class="poster-modal-header">
                                    <span>打卡海报预览</span>
                                    <button @click="showPoster = false">✕</button>
                                </div>
                                <div class="poster-canvas-wrap">
                                    <canvas ref="posterCanvasRef" class="poster-canvas"></canvas>
                                </div>
                                <div class="poster-modal-footer">
                                    <button class="wset-btn" @click="showPoster = false">关闭</button>
                                    <button class="wset-btn" @click="sharePosterToCommunity">📤 分享到社区</button>
                                    <button class="wset-btn primary" @click="downloadPoster">⬇ 下载海报</button>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </Teleport>
            </section>

            <!-- ===== Module 2: 饮食与作息记录 ===== -->
            <section v-show="activeTab === 'lifestyle'" class="panel">
                <SleepTracker variant="monitor" />

                <div class="card" style="margin-top: 20px">
                    <div class="row">
                        <div class="card-title" style="margin: 0">
                            <span class="dot"></span>今日饮食记录
                        </div>
                        <div v-if="meals.length > 0" style="font-size: 12px; color: var(--ink-muted)">
                            已记录 <strong style="color: var(--jade)">{{ meals.length }} 餐</strong>
                            · <strong style="color: var(--gold)">{{ totalCal }} 千卡</strong>
                        </div>
                    </div>

                    <!-- 空状态 -->
                    <div v-if="meals.length === 0" class="meal-empty" @click="openMealDialog">
                        <div class="meal-empty-icon">＋</div>
                        <div class="meal-empty-text">记录今日饮食</div>
                    </div>

                    <!-- 已添加的餐次 -->
                    <div v-else class="grid-4" style="margin-top: 14px">
                        <div
                            v-for="(meal, idx) in meals"
                            :key="idx"
                            class="meal-card"
                        >
                            <div class="meal-img" :class="meal.bg">
                                <img v-if="meal.image" :src="meal.image" class="meal-card-img" />
                                <template v-else>{{ meal.emoji }}</template>
                                <button class="meal-del" @click.stop="removeMeal(idx)">✕</button>
                            </div>
                            <div class="meal-body">
                                <div class="meal-name">{{ meal.name }}</div>
                                <div class="meal-foods">{{ meal.foods }}</div>
                                <div class="meal-cal">≈ {{ meal.cal }} 千卡</div>
                            </div>
                        </div>
                        <!-- 继续添加 -->
                        <div class="meal-card meal-add-card" @click="openMealDialog">
                            <div class="meal-img meal-add-img">＋</div>
                            <div class="meal-body">
                                <div class="meal-name" style="color:var(--ink-muted);justify-content:center">添加一餐</div>
                            </div>
                        </div>
                    </div>

                    <!-- 添加饮食弹窗 -->
                    <Teleport to="body">
                        <Transition name="wset-modal">
                            <div v-if="showMealDialog" class="wset-mask" @click.self="showMealDialog = false">
                                <div class="wset-dialog meal-dialog">
                                    <div class="wset-header meal-dialog-header">
                                        <span>记录饮食</span>
                                        <button @click="showMealDialog = false">✕</button>
                                    </div>
                                    <div class="wset-body meal-dialog-body">
                                        <!-- 餐次类型 -->
                                        <div class="meal-field">
                                            <div class="meal-field-label">餐次类型</div>
                                            <div class="meal-type-grid">
                                                <button
                                                    v-for="t in mealTypes"
                                                    :key="t.name"
                                                    class="meal-type-btn"
                                                    :class="{ active: mealForm.name === t.name }"
                                                    @click="selectMealType(t)"
                                                >
                                                    {{ t.emoji }} {{ t.name }}
                                                </button>
                                            </div>
                                        </div>

                                        <!-- 餐食图片 -->
                                        <div class="meal-field">
                                            <div class="meal-field-label">餐食图片（选填）</div>
                                            <div
                                                class="meal-img-upload"
                                                :class="{ 'has-img': mealForm.image }"
                                                @click="triggerMealImgInput"
                                            >
                                                <img v-if="mealForm.image" :src="mealForm.image" class="meal-img-preview" />
                                                <template v-else>
                                                    <span class="meal-img-icon">📷</span>
                                                    <span class="meal-img-hint">点击上传图片</span>
                                                </template>
                                                <button
                                                    v-if="mealForm.image"
                                                    class="meal-img-remove"
                                                    @click.stop="mealForm.image = ''"
                                                >✕</button>
                                            </div>
                                            <input
                                                ref="mealImgInputRef"
                                                type="file"
                                                accept="image/*"
                                                style="display:none"
                                                @change="onMealImgSelect"
                                            />
                                        </div>

                                        <!-- 吃了什么 -->
                                        <div class="meal-field">
                                            <div class="meal-field-label">吃了什么</div>
                                            <textarea
                                                v-model="mealForm.foods"
                                                class="meal-textarea"
                                                rows="3"
                                                placeholder="描述食物内容，如：糙米饭、清蒸鲈鱼、西兰花…"
                                            ></textarea>
                                        </div>

                                        <!-- 估算热量 -->
                                        <div class="meal-field">
                                            <div class="meal-field-label">估算热量</div>
                                            <div class="wset-input-row">
                                                <input class="meal-cal-input" v-model.number="mealForm.cal" type="number" min="0" max="9999" step="10" />
                                                <span class="wset-unit">千卡</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="wset-footer">
                                        <button class="wset-btn meal-dialog-btn" @click="showMealDialog = false">取消</button>
                                        <button class="wset-btn primary meal-dialog-btn" @click="saveMeal">记录</button>
                                    </div>
                                </div>
                            </div>
                        </Transition>
                    </Teleport>
                </div>

                <div class="grid-2" style="margin-top: 20px">
                    <div class="card">
                        <div class="row">
                            <div class="card-title" style="margin:0;display:flex;align-items:center;gap:10px">
                                <span class="dot"></span>今日饮水追踪
                                <button class="wset-inline-btn" @click="openWaterSettings">设置目标</button>
                            </div>
                            <span style="font-size:12px;color:var(--ink-muted)">
                                <strong style="color:var(--moon)">{{ waterFilled * waterCupSize }}</strong>
                                / {{ waterGoal }} ml
                            </span>
                        </div>

                        <div class="water-grid">
                            <div
                                v-for="i in waterCupCount"
                                :key="i"
                                class="water-cup"
                                :class="{ filled: i <= waterFilled }"
                                @click="waterFilled = i <= waterFilled ? i - 1 : i"
                            >
                                <span class="wc-emoji">💧</span>
                                <span class="wc-label">{{ waterCupSize }}ml</span>
                            </div>
                        </div>

                        <!-- 饮水设置弹窗 -->
                        <Teleport to="body">
                            <Transition name="wset-modal">
                                <div v-if="showWaterSettings" class="wset-mask" @click.self="showWaterSettings = false">
                                    <div class="wset-dialog">
                                        <div class="wset-header">
                                            <span>饮水目标设置</span>
                                            <button @click="showWaterSettings = false">✕</button>
                                        </div>
                                        <div class="wset-body">
                                            <label>
                                                <span>每日总量</span>
                                                <div class="wset-input-row">
                                                    <input v-model.number="wsetForm.goal" type="number" min="500" max="5000" step="100" />
                                                    <span class="wset-unit">ml</span>
                                                </div>
                                            </label>
                                            <label>
                                                <span>每次饮水</span>
                                                <div class="wset-input-row">
                                                    <input v-model.number="wsetForm.cupSize" type="number" min="50" max="1000" step="50" />
                                                    <span class="wset-unit">ml / 次</span>
                                                </div>
                                            </label>
                                            <div class="wset-preview">
                                                预计需要喝 <strong>{{ Math.ceil(wsetForm.goal / wsetForm.cupSize) }}</strong> 次
                                            </div>
                                        </div>
                                        <div class="wset-footer">
                                            <button class="wset-btn" @click="showWaterSettings = false">取消</button>
                                            <button class="wset-btn primary" @click="saveWaterSettings">保存</button>
                                        </div>
                                    </div>
                                </div>
                            </Transition>
                        </Teleport>
                    </div>

                    <div class="card">
                        <div class="card-title" style="display:flex;align-items:center;gap:10px">
                            <span class="dot"></span>今日营养小结
                            <button class="wset-inline-btn" @click="openCalSettings">设置目标</button>
                        </div>
                        <div style="display: flex; justify-content: center; padding: 8px 0">
                            <div class="cal-circle" :style="calCircleStyle">
                                <div class="inner">
                                    <div class="num" :style="calOver ? 'color:var(--cinnabar)' : ''">{{ totalCal }}</div>
                                    <div class="unit">千卡 / {{ calGoal }}</div>
                                </div>
                            </div>
                        </div>
                        <div v-if="calOver" class="cal-over-tip">
                            已超过目标 <strong>{{ totalCal - calGoal }}</strong> 千卡
                        </div>

                        <!-- 热量目标设置弹窗 -->
                        <Teleport to="body">
                            <Transition name="wset-modal">
                                <div v-if="showCalSettings" class="wset-mask" @click.self="showCalSettings = false">
                                    <div class="wset-dialog">
                                        <div class="wset-header">
                                            <span>热量目标设置</span>
                                            <button @click="showCalSettings = false">✕</button>
                                        </div>
                                        <div class="wset-body">
                                            <label>
                                                <span>每日摄入目标</span>
                                                <div class="wset-input-row">
                                                    <input v-model.number="calForm.goal" type="number" min="500" max="5000" step="50" />
                                                    <span class="wset-unit">千卡</span>
                                                </div>
                                            </label>
                                        </div>
                                        <div class="wset-footer">
                                            <button class="wset-btn" @click="showCalSettings = false">取消</button>
                                            <button class="wset-btn primary" @click="saveCalSettings">保存</button>
                                        </div>
                                    </div>
                                </div>
                            </Transition>
                        </Teleport>
                    </div>
                </div>

            </section>

            <!-- ===== Module 3: 养生经验分享 ===== -->
            <section v-show="activeTab === 'sharing'" class="panel">

                <div class="card" style="margin-top:0">
                    <!-- 顶部：发布入口 -->
                    <div class="share-top-bar">
                        <div class="card-title" style="margin:0;display:flex;align-items:center;gap:10px">
                            <span class="dot"></span>经验广场
                        </div>
                        <div style="display:flex;align-items:center;gap:10px">
                            <span v-if="drafts.length > 0" class="pick-chip" style="cursor:pointer" @click="openDrafts">📋 草稿箱 ({{ drafts.length }})</span>
                            <span class="pick-chip" style="cursor:pointer" @click="openShareDialog">＋ 分享经验</span>
                        </div>
                    </div>

                    <!-- 分类入口卡片网格 -->
                    <div class="exp-grid">
                        <div
                            v-for="cat in shareCategories"
                            :key="cat"
                            class="exp-cat-card"
                            @click="openCategoryDialog(cat)"
                        >
                            <div class="exp-cat-emoji" :class="'exp-bg-' + cat">{{ catEmojis[cat] }}</div>
                            <div class="exp-cat-info">
                                <div class="exp-cat-name">{{ cat }}</div>
                                <div class="exp-cat-count">{{ (postsByCategory[cat] || []).length }} 篇经验</div>
                                <div class="exp-cat-preview" v-if="(postsByCategory[cat] || []).length > 0">
                                    {{ postsByCategory[cat][postsByCategory[cat].length - 1].text.slice(0, 30) }}{{ postsByCategory[cat][0].text.length > 30 ? '…' : '' }}
                                </div>
                                <div class="exp-cat-preview muted" v-else>还没有经验，快来分享吧</div>
                            </div>
                        </div>
                    </div>

                    <!-- 草稿箱面板 -->
                    <div v-if="showDraftsPanel" class="drafts-panel" style="margin-top:14px">
                        <div class="drafts-header">
                            <span>草稿箱（{{ drafts.length }}）</span>
                            <button class="wset-inline-btn" @click="showDraftsPanel = false">返回广场</button>
                        </div>
                        <div v-if="drafts.length === 0" class="drafts-empty">暂无草稿</div>
                        <div v-for="(d, idx) in drafts" :key="idx" class="draft-item">
                            <div class="draft-body">
                                <div class="draft-text">{{ d.text || '(无文字内容)' }}</div>
                                <div class="draft-meta">{{ d.category }} · {{ d.images?.length || 0 }} 张图片</div>
                            </div>
                            <div class="draft-actions">
                                <button class="wset-btn primary" style="padding:4px 12px;font-size:12px" @click="publishDraft(idx)">发布</button>
                                <button class="wset-btn" style="padding:4px 12px;font-size:12px" @click="editDraft(idx)">编辑</button>
                                <button class="wset-btn" style="padding:4px 12px;font-size:12px" @click="removeDraft(idx)">删除</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 发布弹窗 -->
                <Teleport to="body">
                    <Transition name="wset-modal">
                        <div v-if="showShareDialog" class="wset-mask" @click.self="closeShareDialog">
                            <div class="wset-dialog share-dialog">
                                <div class="wset-header share-dialog-header">
                                    <span>分享养生心得</span>
                                    <button @click="closeShareDialog">✕</button>
                                </div>
                                <div class="wset-body share-dialog-body">
                                    <textarea
                                        v-model="shareForm.text"
                                        class="share-textarea"
                                        rows="4"
                                        placeholder="记录今天的养生体会、食疗方子、作息变化…… 与同道好友一起进步"
                                    ></textarea>
                                    <div class="share-imgs-upload">
                                        <div v-for="(img, ii) in shareForm.images" :key="ii" class="share-img-thumb">
                                            <img :src="img" />
                                            <button class="share-img-del" @click="shareForm.images.splice(ii, 1)">✕</button>
                                        </div>
                                        <div v-if="shareForm.images.length < 9" class="share-img-add" @click="triggerShareImgInput">＋</div>
                                        <input ref="shareImgInputRef" type="file" accept="image/*" multiple style="display:none" @change="onShareImgSelect" />
                                    </div>
                                    <div v-if="shareForm.video" class="share-video-preview">
                                        <video :src="shareForm.video" controls />
                                        <button class="share-img-del" @click="shareForm.video = ''">✕</button>
                                    </div>
                                    <div v-else class="share-video-add" @click="triggerShareVideoInput">🎬 添加视频</div>
                                    <input ref="shareVideoInputRef" type="file" accept="video/*" style="display:none" @change="onShareVideoSelect" />
                                    <div class="share-cat-row">
                                        <span class="share-cat-label">分类：</span>
                                        <span v-for="cat in shareCategories" :key="cat" class="pick-chip" :class="{ active: shareForm.category === cat }" @click="shareForm.category = cat">{{ cat }}</span>
                                    </div>
                                </div>
                                <div class="wset-footer">
                                    <button class="wset-btn" @click="saveDraft">📥 存草稿</button>
                                    <button class="wset-btn primary" @click="publishPost">发布经验</button>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </Teleport>

                <!-- 分类内容弹窗 -->
                <Teleport to="body">
                    <Transition name="wset-modal">
                        <div v-if="showCatDialog" class="wset-mask" @click.self="showCatDialog = false">
                            <div class="wset-dialog cat-dialog">
                                <div class="cat-dialog-head" :class="'cat-head-' + catDialogName">
                                    <div class="cat-dialog-title">{{ catDialogName }}</div>
                                    <div class="cat-dialog-sub">{{ catDialogPosts.length }} 篇经验 · 一起交流养生心得</div>
                                    <button class="cat-dialog-close" @click="showCatDialog = false">✕</button>
                                </div>
                                <div class="cat-dialog-body">
                                    <!-- 搜索栏 -->
                                    <div class="cat-dialog-search">
                                        <input
                                            v-model="catDialogKeyword"
                                            class="cat-dialog-search-input"
                                            placeholder="搜索经验关键词…"
                                        />
                                    </div>
                                    <div v-if="filteredCatPosts.length === 0 && !catDialogKeyword" class="drafts-empty" style="padding:60px;text-align:center;color:var(--ink-muted)">该分类暂无经验，快来分享吧</div>
                                    <div v-else-if="filteredCatPosts.length === 0 && catDialogKeyword" class="drafts-empty" style="padding:40px;text-align:center;color:var(--ink-muted)">没有找到包含 "{{ catDialogKeyword }}" 的经验</div>
                                    <div v-for="p in filteredCatPosts" :key="p._id" class="cat-post-card">
                                        <!-- 头部 -->
                                        <div class="cat-post-head">
                                            <div class="cat-post-avatar">{{ p.emoji }}</div>
                                            <div class="cat-post-user">
                                                <div class="cat-post-name">{{ p.author }}</div>
                                                <div class="cat-post-date">{{ p.time }}</div>
                                            </div>
                                            <button v-if="p.author === currentUser" class="cat-post-del" @click="removePost(p._id)">删除</button>
                                        </div>
                                        <!-- 正文 -->
                                        <div class="cat-post-body">
                                            <div class="cat-post-text">{{ p.text }}</div>
                                            <div v-if="p.images.length > 0" class="cat-post-imgs">
                                                <img v-for="(img, ii) in p.images" :key="ii" :src="img" class="cat-post-img" />
                                            </div>
                                            <div v-if="p.video" class="cat-post-video">
                                                <video :src="p.video" controls />
                                            </div>
                                        </div>
                                        <!-- 互动栏 -->
                                        <div class="cat-post-bar">
                                            <button class="cpb-btn" :class="{ active: likesState[p._id] }" @click="toggleLike(p._id)">
                                                {{ likesState[p._id] ? '❤️' : '🤍' }} {{ p.likes }}
                                            </button>
                                            <button class="cpb-btn" :class="{ active: showCommentInputId === p._id }" @click="toggleCommentInput(p._id)">
                                                💬 {{ p.comments }}
                                            </button>
                                            <button class="cpb-btn" :class="{ active: starsState[p._id] }" @click="toggleStar(p._id)">
                                                {{ starsState[p._id] ? '⭐' : '☆' }} {{ p.stars }}
                                            </button>
                                        </div>
                                        <!-- 评论区（小红书风格） -->
                                        <div v-if="showCommentInputId === p._id" class="cat-post-comment-area">
                                            <div class="cpc-title">评论</div>
                                            <div v-if="p.commentList && p.commentList.length > 0" class="cpc-list">
                                                <div v-for="c in p.commentList" :key="c._cid" class="cpc-item">
                                                    <div class="cpc-avatar">{{ c.author[0] }}</div>
                                                    <div class="cpc-body">
                                                        <div class="cpc-header">
                                                            <span class="cpc-name">{{ c.author }}</span>
                                                            <span class="cpc-date">{{ c.time }}</span>
                                                        </div>
                                                        <div class="cpc-content">{{ c.text }}</div>
                                                        <div class="cpc-footer">
                                                            <button class="cpc-reply" @click="setReplyTarget(p._id, c._cid, c.author)">回复</button>
                                                        </div>
                                                        <!-- 子回复 -->
                                                        <div v-if="c.replies && c.replies.length > 0" class="cpc-children">
                                                            <div v-for="r in c.replies" :key="r._cid" class="cpc-child-item">
                                                                <div class="cpc-avatar sm">{{ r.author[0] }}</div>
                                                                <div class="cpc-body">
                                                                    <div class="cpc-header">
                                                                        <span class="cpc-name">{{ r.author }}</span>
                                                                        <span class="cpc-date">{{ r.time }}</span>
                                                                    </div>
                                                                    <div class="cpc-content"><span v-if="r.replyTo" class="cpc-at">@{{ r.replyTo }}</span>{{ r.text }}</div>
                                                                    <div class="cpc-footer">
                                                                        <button class="cpc-reply" @click="setReplyTarget(p._id, c._cid, r.author)">回复</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="cpc-input-row">
                                                <div class="cpc-input-avatar">{{ currentUser[0] }}</div>
                                                <div class="cpc-input-wrap">
                                                    <input
                                                        v-model="commentText[p._id]"
                                                        class="cpc-input"
                                                        :placeholder="replyTarget && replyTarget.postId === p._id ? '回复 @' + replyTarget.author : '写下你的评论…'"
                                                        @keydown.enter="submitComment(p._id)"
                                                    />
                                                    <button class="cpc-send" @click="submitComment(p._id)">发送</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </Teleport>

                <!-- 保留：热门养生话题 + 我的创作数据 -->
                <div class="grid-2" style="margin-top: 20px">
                    <div class="card">
                        <div class="card-title">
                            <span class="dot"></span>热门养生话题
                        </div>
                        <div
                            v-for="topic in hotTopics"
                            :key="topic.name"
                            class="side-row"
                        >
                            <div
                                class="group-icon"
                                :style="{ background: topic.bg }"
                            >
                                {{ topic.emoji }}
                            </div>
                            <div class="side-info">
                                <div class="side-name"># {{ topic.name }}</div>
                                <div class="side-meta">{{ topic.meta }}</div>
                            </div>
                            <button class="btn btn-ghost btn-sm">参与</button>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-title">
                            <span class="dot"></span>我的创作数据
                        </div>
                        <div class="grid-2" style="gap: 12px">
                            <div class="tip-row" style="border-left-color: var(--gold)">
                                <span class="icon">📝</span>
                                <div class="text">
                                    <strong style="font-size: 20px">{{ publishedPosts.length }}</strong>
                                    篇<br /><span style="color: var(--ink-muted); font-size: 12px;">累计发布经验</span>
                                </div>
                            </div>
                            <div class="tip-row" style="border-left-color: var(--cinnabar)">
                                <span class="icon">👍</span>
                                <div class="text">
                                    <strong style="font-size: 20px">{{ totalLikes }}</strong>
                                    <br /><span style="color: var(--ink-muted); font-size: 12px;">累计获赞</span>
                                </div>
                            </div>
                            <div class="tip-row" style="border-left-color: var(--jade)">
                                <span class="icon">⭐</span>
                                <div class="text">
                                    <strong style="font-size: 20px">{{ totalStars }}</strong>
                                    <br /><span style="color: var(--ink-muted); font-size: 12px;">被收藏次数</span>
                                </div>
                            </div>
                            <div class="tip-row" style="border-left-color: var(--moon)">
                                <span class="icon">💬</span>
                                <div class="text">
                                    <strong style="font-size: 20px">{{ totalComments }}</strong>
                                    <br /><span style="color: var(--ink-muted); font-size: 12px;">被评论数</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- ===== Module 4: 社区互动交流 ===== -->
            <section v-show="activeTab === 'interaction'" class="panel">
                <div class="grid-2" style="grid-template-columns: 1.5fr 1fr">
                    <div class="card">
                        <div class="row">
                            <div class="card-title" style="margin: 0">
                                <span class="dot"></span>社区动态
                            </div>
                            <div class="chip-row">
                                <span
                                    v-for="f in feedFilters"
                                    :key="f"
                                    class="pick-chip"
                                    :class="{ active: selectedFeedFilter === f }"
                                    @click="selectedFeedFilter = f"
                                >{{ f }}</span>
                                <span class="pick-chip" style="cursor:pointer" @click="openCommunityPublish">＋</span>
                            </div>
                        </div>

                        <div v-if="filteredCommunityPosts.length === 0" style="text-align:center;padding:48px;color:var(--ink-muted);font-size:14px">
                            {{ selectedFeedFilter === '关注' ? '你关注的人还没有发布动态' : '暂无动态' }}
                        </div>

                        <div v-for="post in filteredCommunityPosts" :key="post._id" :id="'post-' + post._id" class="post">
                            <div class="post-head">
                                <div class="avatar" :style="{ background: post.avatarBg }">{{ post.avatarText }}</div>
                                <div class="ph-info">
                                    <div class="ph-name">{{ post.name }} <span class="level-tag">{{ post.level }}</span></div>
                                    <div class="ph-meta">{{ post.meta }}</div>
                                </div>
                                <button v-if="post.authorId !== currentUserId" class="btn btn-ghost btn-sm" @click="toggleFollow(post.authorId)">{{ followedUsers[post.authorId] ? '✓ 已关注' : '+ 关注' }}</button>
                            </div>
                            <div class="post-text">{{ post.text }}</div>
                            <div v-if="post.checkin" class="post-checkin">
                                <div class="pc-ring">{{ post.checkin }}</div>
                                <div style="font-size:13px">
                                    <div style="font-weight:600">{{ post.checkinTitle }}</div>
                                    <div style="color:var(--ink-muted);font-size:12px">{{ post.checkinDesc }}</div>
                                </div>
                            </div>
                            <div v-if="post.images && post.images.length > 0" class="post-imgs-comm">
                                <img v-for="(img, i) in post.images.slice(0, 9)" :key="i" :src="img.src || ''" class="post-img-comm" />
                            </div>
                            <div class="post-tags">
                                <span v-for="tag in post.tags" :key="tag" class="topic-tag"># {{ tag }}</span>
                            </div>
                            <div class="post-actions">
                                <span class="pa" :class="{ liked: post.liked }" @click="likeCommunityPost(post._id)">
                                    {{ post.liked ? '❤️' : '🤍' }} {{ post.likeCount }}
                                </span>
                                <span class="pa" :class="{ active: expandedComments[post._id] }" @click="toggleCommunityComment(post._id)">
                                    💬 {{ post.commentCount }}
                                </span>
                                <span class="pa" :class="{ stared: post.stared }" @click="starCommunityPost(post._id)">
                                    {{ post.stared ? '⭐' : '☆' }} {{ post.starCount }}
                                </span>
                                <span class="pa" @click="shareCommunityPost(post)">📤 转发</span>
                                <button v-if="post.authorId === currentUserId" class="pa" style="background:none;border:none;cursor:pointer;color:var(--cinnabar)" @click="deleteCommunityPost(post._id)">删除</button>
                            </div>
                            <div v-if="expandedComments[post._id]" class="comment-area">
                                <div v-for="c in (post.commentList || [])" :key="c._cid">
                                    <div class="comment">
                                        <div class="mini-avatar">{{ c.author[0] }}</div>
                                        <div class="c-body">
                                            <span class="c-name">{{ c.author }}</span>：<span v-if="c.replyTo" class="cpc-at">@{{ c.replyTo }}</span> {{ c.text }}
                                            <div class="c-meta">{{ c.time }} · <button class="cpc-reply" @click="setCommunityReplyTarget(post._id, c._cid, c.author)" style="background:none;border:none;font-size:11px;color:var(--ink-muted);cursor:pointer;padding:0">回复</button></div>
                                        </div>
                                    </div>
                                    <div v-if="c.replies && c.replies.length > 0" class="cpc-children">
                                        <div v-for="r in c.replies" :key="r._cid" class="comment" style="margin-left:20px;border-bottom:none">
                                            <div class="mini-avatar">{{ r.author[0] }}</div>
                                            <div class="c-body">
                                                <span class="c-name">{{ r.author }}</span>：<span v-if="r.replyTo" class="cpc-at">@{{ r.replyTo }}</span> {{ r.text }}
                                                <div class="c-meta">{{ r.time }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="comment-input">
                                    <input
                                        v-model="communityCommentText[post._id]"
                                        type="text"
                                        :placeholder="communityReplyTarget && communityReplyTarget.postId === post._id ? '回复 @' + communityReplyTarget.author : '友善交流，分享你的看法…'"
                                        @keydown.enter="submitCommunityComment(post._id)"
                                    />
                                    <button class="btn btn-sm" @click="submitCommunityComment(post._id)">发送</button>
                                </div>
                            </div>
                        </div>

                        <!-- 社区发布弹窗 -->
                        <Teleport to="body">
                            <Transition name="wset-modal">
                                <div v-if="showCommunityPublish" class="wset-mask" @click.self="showCommunityPublish = false">
                                    <div class="wset-dialog share-dialog">
                                        <div class="wset-header share-dialog-header">
                                            <span>发表动态</span>
                                            <button @click="showCommunityPublish = false">✕</button>
                                        </div>
                                        <div class="wset-body share-dialog-body">
                                            <textarea
                                                v-model="communityForm.text"
                                                class="share-textarea"
                                                rows="4"
                                                placeholder="分享你的养生心得、生活感悟…"
                                            ></textarea>
                                            <div class="share-imgs-upload">
                                                <div v-for="(img, ii) in communityForm.images" :key="ii" class="share-img-thumb">
                                                    <img :src="img" /><button class="share-img-del" @click="communityForm.images.splice(ii,1)">✕</button>
                                                </div>
                                                <div v-if="communityForm.images.length < 9" class="share-img-add" @click="triggerCommunityImgInput">＋</div>
                                                <input ref="communityImgInputRef" type="file" accept="image/*" multiple style="display:none" @change="onCommunityImgSelect" />
                                            </div>
                                            <div class="share-cat-row">
                                                <span v-for="tag in ['早睡早起','食疗养生','运动打卡','冥想静心','节气养生','健康生活']" :key="tag" class="pick-chip" :class="{ active: communityForm.tags.includes(tag) }" @click="toggleCommunityTag(tag)">#{{ tag }}</span>
                                            </div>
                                        </div>
                                        <div class="wset-footer">
                                            <button class="wset-btn" @click="showCommunityPublish = false">取消</button>
                                            <button class="wset-btn primary" :disabled="!communityForm.text.trim() && communityForm.images.length === 0" @click="publishCommunityPost">发布动态</button>
                                        </div>
                                    </div>
                                </div>
                            </Transition>
                        </Teleport>

                        <!-- 转发弹窗 -->
                        <Teleport to="body">
                            <Transition name="wset-modal">
                                <div v-if="showShareModal" class="wset-mask" @click.self="showShareModal = false">
                                    <div class="wset-dialog share-dialog" style="width:min(420px,92vw)!important">
                                        <div class="wset-header">
                                            <span>转发动态</span>
                                            <button @click="showShareModal = false">✕</button>
                                        </div>
                                        <div class="wset-body" style="padding:20px;display:flex;flex-direction:column;gap:12px">
                                            <textarea v-model="shareFormData.text" class="share-textarea" rows="2" placeholder="写下你的想法（可选）…"></textarea>
                                            <div class="post" v-if="shareFormData.originalPost" style="background:var(--cream);border-radius:10px;padding:12px">
                                                <div style="font-size:12px;color:var(--ink-muted);margin-bottom:4px">@{{ shareFormData.originalPost.name }}</div>
                                                <div style="font-size:13px;color:var(--ink)">{{ shareFormData.originalPost.text }}</div>
                                            </div>
                                        </div>
                                        <div class="wset-footer">
                                            <button class="wset-btn" @click="showShareModal = false">取消</button>
                                            <button class="wset-btn primary" @click="confirmSharePost">转发</button>
                                        </div>
                                    </div>
                                </div>
                            </Transition>
                        </Teleport>
                    </div>

                    <div>
                        <div class="card">
                            <div class="card-title">
                                <span class="dot"></span>消息通知
                                <span v-if="unreadCount > 0" class="notif-total-badge">{{ unreadCount }}</span>
                            </div>
                            <div class="notif-type-grid">
                                <div class="notif-type-item" @click="openNotifPanel('like')">
                                    <div class="ntg-icon-wrap">
                                        <span class="ntg-emoji">❤️</span>
                                        <span v-if="unreadByType.like > 0" class="ntg-badge">{{ unreadByType.like }}</span>
                                    </div>
                                    <div class="ntg-label">赞与收藏</div>
                                    <div class="ntg-count">{{ notifByType.like.length }} 条</div>
                                </div>
                                <div class="notif-type-item" @click="openNotifPanel('comment')">
                                    <div class="ntg-icon-wrap">
                                        <span class="ntg-emoji">💬</span>
                                        <span v-if="unreadByType.comment > 0" class="ntg-badge">{{ unreadByType.comment }}</span>
                                    </div>
                                    <div class="ntg-label">评论</div>
                                    <div class="ntg-count">{{ notifByType.comment.length }} 条</div>
                                </div>
                                <div class="notif-type-item" @click="openNotifPanel('follow')">
                                    <div class="ntg-icon-wrap">
                                        <span class="ntg-emoji">👥</span>
                                        <span v-if="unreadByType.follow > 0" class="ntg-badge">{{ unreadByType.follow }}</span>
                                    </div>
                                    <div class="ntg-label">关注</div>
                                    <div class="ntg-count">{{ notifByType.follow.length }} 条</div>
                                </div>
                            </div>

                            <!-- 分类消息弹窗 -->
                            <Teleport to="body">
                                <Transition name="wset-modal">
                                    <div v-if="showNotifPanel" class="wset-mask" @click.self="showNotifPanel = false">
                                        <div class="wset-dialog notif-dialog" style="width:min(500px,94vw)!important">
                                            <div class="wset-header notif-panel-header">
                                                <div style="display:flex;justify-content:space-between;width:100%;align-items:center">
                                                    <span>消息通知</span>
                                                    <button @click="showNotifPanel = false">✕</button>
                                                </div>
                                                <div class="notif-panel-tabs">
                                                    <button class="npt-btn" :class="{ active: notifPanelType === 'like' }" @click="notifPanelType = 'like'">
                                                        ❤️ 赞与收藏
                                                        <span v-if="unreadByType.like > 0" class="npt-badge">{{ unreadByType.like }}</span>
                                                    </button>
                                                    <button class="npt-btn" :class="{ active: notifPanelType === 'comment' }" @click="notifPanelType = 'comment'">
                                                        💬 评论
                                                        <span v-if="unreadByType.comment > 0" class="npt-badge">{{ unreadByType.comment }}</span>
                                                    </button>
                                                    <button class="npt-btn" :class="{ active: notifPanelType === 'follow' }" @click="notifPanelType = 'follow'">
                                                        👥 关注
                                                        <span v-if="unreadByType.follow > 0" class="npt-badge">{{ unreadByType.follow }}</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="notif-dialog-body">
                                                <div v-if="filteredNotifPanel.length === 0" style="text-align:center;padding:40px;color:var(--ink-muted)">暂无消息</div>
                                                <div
                                                    v-for="notif in filteredNotifPanel"
                                                    :key="notif._nid"
                                                    class="notif-dialog-item"
                                                    :class="{ unread: !notif.read }"
                                                    @click="openNotifDetail(notif)"
                                                >
                                                    <div class="notif-dialog-avatar" :style="{ background: notif.bg }">{{ notif.emoji }}</div>
                                                    <div class="notif-dialog-content">
                                                        <div class="notif-dialog-title">{{ notif.title }}</div>
                                                        <div class="notif-dialog-text">{{ notif.text }}</div>
                                                        <div class="notif-dialog-time">{{ notif.time }}</div>
                                                    </div>
                                                    <div v-if="!notif.read" class="notif-dialog-unread-dot"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Transition>
                            </Teleport>

                            <!-- 单条消息详情弹窗 -->
                            <Teleport to="body">
                                <Transition name="wset-modal">
                                    <div v-if="notifDetailTarget" class="wset-mask" @click.self="notifDetailTarget = null">
                                        <div class="wset-dialog notif-detail-dialog">
                                            <div class="wset-header">
                                                <span>{{ notifDetailTarget.title }}</span>
                                                <button @click="notifDetailTarget = null">✕</button>
                                            </div>
                                            <div class="wset-body" style="padding:20px">
                                                <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
                                                    <div style="width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px" :style="{ background: notifDetailTarget.bg }">{{ notifDetailTarget.emoji }}</div>
                                                    <div>
                                                        <div style="font-size:16px;font-weight:600;color:var(--ink)">{{ notifDetailTarget.title }}</div>
                                                        <div style="font-size:12px;color:var(--ink-muted)">{{ notifDetailTarget.time }}</div>
                                                    </div>
                                                </div>
                                                <p style="font-size:14px;color:var(--ink);line-height:1.7">{{ notifDetailTarget.text }}</p>
                                                <div v-if="notifDetailTarget.type === 'follow'" style="margin-top:16px;display:flex;gap:10px">
                                                    <button class="wset-btn primary" @click="toggleFollow(notifDetailTarget.fromId); notifDetailTarget = null">回关</button>
                                                    <button class="wset-btn" @click="notifDetailTarget = null">关闭</button>
                                                </div>
                                                <div v-else-if="notifDetailTarget.postId" style="margin-top:16px">
                                                    <button class="wset-btn primary" @click="goToCommunityPost(notifDetailTarget.postId); notifDetailTarget = null">查看帖子</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Transition>
                            </Teleport>
                        </div>

                        <div class="card" style="margin-top: 20px">
                            <div class="row">
                                <div class="card-title" style="margin: 0">
                                    <span class="dot"></span>推荐养生小组
                                </div>
                                <span
                                    style="
                                        font-size: 12px;
                                        color: var(--ink-muted);
                                    "
                                    >更多 ›</span
                                >
                            </div>
                            <div
                                v-for="group in groups"
                                :key="group.name"
                                class="side-row"
                            >
                                <div
                                    class="group-icon"
                                    :style="{ background: group.bg }"
                                >
                                    {{ group.emoji }}
                                </div>
                                <div class="side-info">
                                    <div class="side-name">
                                        {{ group.name }}
                                    </div>
                                    <div class="side-meta">
                                        {{ group.meta }}
                                    </div>
                                </div>
                                <button
                                    class="btn"
                                    :class="
                                        group.joined
                                            ? 'btn-sm'
                                            : 'btn-ghost btn-sm'
                                    "
                                >
                                    {{ group.joined ? "已加入" : "加入" }}
                                </button>
                            </div>
                        </div>

                        <div class="card" style="margin-top: 20px">
                            <div class="card-title">
                                <span class="dot"></span>本周社区活跃榜
                            </div>
                            <div
                                v-for="(user, idx) in leaderboard"
                                :key="user.name"
                                class="rank-row"
                                :class="{ me: user.isMe }"
                            >
                                <span
                                    class="rank-num"
                                    :class="'top' + (idx + 1)"
                                    >{{ idx + 1 }}</span
                                >
                                <div
                                    class="avatar"
                                    :style="{ background: user.avatarBg }"
                                >
                                    {{ user.avatarText }}
                                </div>
                                <div class="rank-info">
                                    <div class="rank-name">{{ user.name }}</div>
                                    <div class="rank-sub">{{ user.sub }}</div>
                                </div>
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
                    <div style="opacity: 0.9; font-size: 14px; margin-top: 4px">
                        每晚 23:00 前入睡并打卡，养肝血、调气色，21
                        天养成早睡习惯
                    </div>
                    <div class="ch-stats">
                        <div class="cs"><strong>3,254</strong>人参与</div>
                        <div class="cs">
                            <strong>第 8 / 21 天</strong>我的进度
                        </div>
                        <div class="cs"><strong>92%</strong>我的完成率</div>
                        <div class="cs"><strong>D-13</strong>距结束</div>
                    </div>
                    <div class="ch-progress-track">
                        <div class="ch-progress-fill" style="width: 38%"></div>
                    </div>
                    <div style="margin-top: 16px">
                        <button class="btn btn-gold">今日去打卡</button>
                        <button
                            class="btn btn-ghost"
                            style="
                                margin-left: 8px;
                                color: white;
                                border-color: rgba(255, 255, 255, 0.6);
                            "
                        >
                            查看挑战详情
                        </button>
                    </div>
                </div>

                <div class="card" style="margin-top: 20px">
                    <div class="row">
                        <div class="card-title" style="margin: 0">
                            <span class="dot"></span>挑战广场
                        </div>
                        <div class="chip-row">
                            <span
                                v-for="f in challengeFilters"
                                :key="f"
                                class="pick-chip"
                                :class="{
                                    active: selectedChallengeFilter === f,
                                }"
                                @click="selectedChallengeFilter = f"
                                >{{ f }}</span
                            >
                        </div>
                    </div>
                    <div class="grid-3">
                        <div
                            v-for="ch in challenges"
                            :key="ch.name"
                            class="challenge-card"
                        >
                            <div
                                class="cc-cover"
                                :style="{ background: ch.bg }"
                            >
                                {{ ch.emoji
                                }}<span
                                    class="cc-status"
                                    :class="ch.statusClass"
                                    >{{ ch.statusLabel }}</span
                                >
                            </div>
                            <div class="cc-body">
                                <div class="cc-name">{{ ch.name }}</div>
                                <div class="cc-meta">
                                    <span>⏱ {{ ch.days }} 天</span
                                    ><span>📋 {{ ch.cat }}</span>
                                </div>
                                <div class="cc-foot">
                                    <div class="cc-people">
                                        <span
                                            v-for="(p, pi) in ch.people"
                                            :key="pi"
                                            class="pp"
                                            :style="{ background: p.bg }"
                                            >{{ p.text }}</span
                                        >
                                    </div>
                                    <button
                                        class="btn btn-sm"
                                        :class="{ 'btn-ghost': !ch.joined }"
                                    >
                                        {{ ch.joined ? "已参加" : "报名" }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid-2" style="margin-top: 20px">
                    <div class="card">
                        <div class="row">
                            <div class="card-title" style="margin: 0">
                                <span class="dot"></span>「早睡养肝」挑战排行榜
                            </div>
                            <div class="chip-row">
                                <span class="pick-chip active">好友榜</span>
                                <span class="pick-chip">总榜</span>
                            </div>
                        </div>
                        <div
                            v-for="(r, idx) in challengeRanks"
                            :key="r.name"
                            class="rank-row"
                            :class="{ me: r.isMe }"
                        >
                            <span class="rank-num" :class="'top' + (idx + 1)">{{
                                idx + 1
                            }}</span>
                            <div
                                class="avatar"
                                :style="{ background: r.avatarBg }"
                            >
                                {{ r.avatarText }}
                            </div>
                            <div class="rank-info">
                                <div class="rank-name">{{ r.name }}</div>
                                <div class="rank-sub">{{ r.sub }}</div>
                            </div>
                            <span class="rank-val">{{ r.rate }}</span>
                        </div>
                        <div class="tip-row" style="margin-top: 12px">
                            <span class="icon">🎁</span>
                            <div class="text">
                                挑战结束后，完成率
                                <strong>≥ 80%</strong> 可获「养肝徽章」+ 200
                                元气积分。
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="row">
                            <div class="card-title" style="margin: 0">
                                <span class="dot"></span>我的挑战徽章墙
                            </div>
                            <div
                                style="font-size: 12px; color: var(--ink-muted)"
                            >
                                已点亮
                                <strong style="color: var(--gold)"
                                    >{{ unlockedBadgeCount }} / {{ badges.length }}</strong
                                >
                            </div>
                        </div>
                        <div class="badge-grid">
                            <div
                                v-for="b in badges"
                                :key="b.name"
                                class="badge-item"
                                :class="{ locked: !b.unlocked }"
                            >
                                <div class="b-emoji">{{ b.emoji }}</div>
                                <div class="b-name">{{ b.name }}</div>
                                <div class="b-cond">{{ b.cond }}</div>
                            </div>
                        </div>
                        <button
                            class="btn btn-ghost"
                            style="width: 100%; margin-top: 14px"
                            @click="showBadgeModal = true"
                        >
                            查看全部徽章与积分商城 →
                        </button>

                        <!-- 全部徽章弹窗 -->
                        <Teleport to="body">
                            <Transition name="wset-modal">
                                <div v-if="showBadgeModal" class="wset-mask" @click.self="showBadgeModal = false">
                                    <div class="wset-dialog badge-all-dialog">
                                        <div class="wset-header" style="font-size:17px;padding:16px 22px">
                                            <span>全部徽章 · {{ unlockedBadgeCount }} / {{ badges.length }} 已点亮</span>
                                            <button @click="showBadgeModal = false">✕</button>
                                        </div>
                                        <div class="badge-all-body">
                                            <div
                                                v-for="b in badges"
                                                :key="b.name"
                                                class="badge-all-item"
                                                :class="{ locked: !b.unlocked }"
                                            >
                                                <div class="b-emoji">{{ b.emoji }}</div>
                                                <div class="b-name">{{ b.name }}</div>
                                                <div class="b-cond">{{ b.unlocked ? b.desc : b.cond }}</div>
                                                <div v-if="b.unlocked" class="b-unlocked-tag">已获得</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Transition>
                        </Teleport>
                    </div>
                </div>
            </section>
        </main>

        <div class="toast" :class="{ show: toastVisible }">{{ toastMsg }}</div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import HeaderLayout from "@/layouts/HeaderLayout.vue";
import SleepTracker from "@/components/SleepTracker.vue";

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
    window.scrollTo({
        top:
            document.querySelector(".tabs")!.getBoundingClientRect().top +
            window.scrollY -
            80,
        behavior: "smooth",
    });
}

// ---- Toast ----
const toastVisible = ref(false);
const toastMsg = ref("");
let toastTimer: ReturnType<typeof setTimeout>;
function toast(msg: string) {
    toastMsg.value = msg;
    toastVisible.value = true;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastVisible.value = false;
    }, 2200);
}

// ---- Module 1: Check-in ----
const todayCheckin = computed(() => ({
    done: checkItems.value.filter(i => i.done).length,
    total: checkItems.value.length,
}));
const friendsCount = ref(156);
const activeChallenges = ref(2);
const RING_C = 502;
const ringOffset = computed(() => {
    const done = checkItems.value.filter((i) => i.done).length;
    return RING_C * (1 - done / checkItems.value.length);
});

// ── 日期工具 ──────────────────────────────────────────
function fmtDate(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const todayKey = computed(() => fmtDate(new Date()));

// ── 先声明打卡项和心情（watch 依赖它们）──────────────────
const moods = ["😔 疲惫", "😐 平常", "🙂 轻松", "😄 元气满满"];
const selectedMood = ref('');
const checkItems = ref<{ name: string; icon: string; meta: string; done: boolean }[]>([]);

// ── 历史打卡存档 ──────────────────────────────────────
interface DayRecord {
    items: { name: string; icon: string; meta: string; done: boolean }[];
    mood: string;
}
const checkinHistory = ref<Record<string, DayRecord>>({});

function saveTodayHistory() {
    if (checkItems.value.length === 0) return;
    checkinHistory.value[todayKey.value] = {
        items: checkItems.value.map(i => ({ ...i })),
        mood: selectedMood.value,
    };
}

// ── 本周打卡（以周一为起点）────────────────────────────
const weekDays = computed(() => {
    const h = checkinHistory.value;
    const now = new Date();
    const dow = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dow + 6) % 7));
    const labels = ['一', '二', '三', '四', '五', '六', '日'];
    return labels.map((label, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const key = fmtDate(d);
        const isToday = key === todayKey.value;
        const record = h[key];
        const hasDone = record ? record.items.some(it => it.done) : false;
        return {
            key, label, isToday, hasDone,
            status: isToday ? 'today' : hasDone ? 'done' : '',
            display: isToday ? '今' : hasDone ? '✓' : '·',
        };
    });
});

const thisWeekDoneCount = computed(() => weekDays.value.filter(d => d.hasDone).length);

// ── 月历 ───────────────────────────────────────────────
const calYear = ref(new Date().getFullYear());
const calMonth = ref(new Date().getMonth());
const yearOptions = computed(() => {
    const y = new Date().getFullYear();
    return [y - 1, y, y + 1];
});

const calTitle = computed(() => `打卡日历 · ${calMonth.value + 1} 月`);

const calendarCells = computed(() => {
    const h = checkinHistory.value;
    const y = calYear.value, m = calMonth.value;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const blanks = (new Date(y, m, 1).getDay() + 6) % 7;
    const cells: { type: 'blank' | 'day'; key: string; day: number; level: number; isToday: boolean; hasData: boolean }[] = [];
    for (let i = 0; i < blanks; i++) cells.push({ type: 'blank', key: '', day: 0, level: 0, isToday: false, hasData: false });
    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const record = h[key];
        const hasDone = record ? record.items.some(i => i.done) : false;
        const level = hasDone ? 4 : 0;
        cells.push({ type: 'day', key, day: d, level, isToday: key === todayKey.value, hasData: !!record });
    }
    return cells;
});

const calMonthDoneCount = computed(() => calendarCells.value.filter(c => c.type === 'day' && c.level > 0).length);

function calPrevMonth() {
    calMonth.value === 0 ? (calMonth.value = 11, calYear.value--) : calMonth.value--;
}
function calNextMonth() {
    calMonth.value === 11 ? (calMonth.value = 0, calYear.value++) : calMonth.value++;
}

// ── 历史详情弹窗 ───────────────────────────────────────
const showHistoryDetail = ref(false);
const historyDetailKey = ref('');
const historyDetailRecord = computed(() => checkinHistory.value[historyDetailKey.value] ?? null);
function openHistoryDetail(key: string) {
    historyDetailKey.value = key;
    showHistoryDetail.value = true;
}

const checkinEmojiOptions = [
    "🌅","💧","🏃","🧘","🥗","🌙","📖","🎯","💪","🧹","🛌","☀️","🎵","✍️","🧘‍♀️","🍵"
];
const showCheckinDialog = ref(false);
const checkinForm = ref({ icon: "🎯", name: "", meta: "" });

function openCheckinDialog() {
    checkinForm.value = { icon: "🎯", name: "", meta: "" };
    showCheckinDialog.value = true;
}

function saveCheckin() {
    if (!checkinForm.value.name.trim()) return;
    checkItems.value.push({
        icon: checkinForm.value.icon || "🎯",
        name: checkinForm.value.name.trim(),
        meta: checkinForm.value.meta.trim(),
        done: false,
    });
    showCheckinDialog.value = false;
    saveTodayHistory();
}

function removeCheckin(idx: number) {
    checkItems.value.splice(idx, 1);
    saveTodayHistory();
}

function toggleCheckinItem(idx: number) {
    checkItems.value[idx].done = !checkItems.value[idx].done;
    saveTodayHistory();
}

const allChecksDone = computed(
    () => checkItems.value.length > 0 && checkItems.value.every((i) => i.done),
);

function toggleAllChecks() {
    if (checkItems.value.length === 0) {
        toast('请先添加打卡内容');
        return;
    }
    const target = !allChecksDone.value;
    checkItems.value.forEach((i) => { i.done = target; });
    saveTodayHistory();
    toast(target ? "🎉 今日打卡全部完成！" : "已取消今日全部打卡");
}

function selectMood(mood: string) {
    selectedMood.value = mood;
    saveTodayHistory();
}

// ── 打卡海报 ──────────────────────────────────────────
const showPoster = ref(false);
const posterCanvasRef = ref<HTMLCanvasElement | null>(null);

function openPoster() {
    showPoster.value = true;
    nextTick(drawPoster);
}

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawPoster() {
    const canvas = posterCanvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const W = 750;
    const items = checkItems.value;
    const itemH = 88;
    const listTop = 440;
    const H = listTop + Math.max(items.length, 1) * itemH + 160;
    canvas.width = W;
    canvas.height = H;

    // ── 背景渐变 ──
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#e8f0e4');
    bg.addColorStop(0.55, '#faf6ee');
    bg.addColorStop(1, '#d5e3d0');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 装饰圆
    ctx.fillStyle = 'rgba(92,131,116,0.07)';
    ctx.beginPath(); ctx.arc(680, 80, 180, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(30, H - 60, 130, 0, Math.PI * 2); ctx.fill();

    // ── 顶部品牌区 ──
    ctx.fillStyle = '#b33c2c';
    ctx.beginPath(); ctx.arc(W / 2, 88, 44, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 38px STKaiti, serif';
    ctx.textAlign = 'center';
    ctx.fillText('颐', W / 2, 102);

    ctx.fillStyle = '#2c3639';
    ctx.font = 'bold 42px STKaiti, serif';
    ctx.fillText('颐养阁', W / 2, 182);

    ctx.fillStyle = '#6b7c7a';
    ctx.font = '22px sans-serif';
    ctx.fillText('每日打卡 · 健康生活', W / 2, 216);

    // 日期
    const now = new Date();
    const dateStr = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日`;
    ctx.fillStyle = '#5c8374';
    ctx.font = '20px sans-serif';
    ctx.fillText(dateStr, W / 2, 250);

    // 分割线
    ctx.strokeStyle = 'rgba(92,131,116,0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(60, 272); ctx.lineTo(690, 272); ctx.stroke();

    // ── 进度环 ──
    const done = items.filter(i => i.done).length;
    const total = items.length;
    const cx = W / 2, cy = 358, r = 70;

    ctx.strokeStyle = '#e4ddd2';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI * 2 - Math.PI / 2);
    ctx.stroke();

    if (total > 0) {
        const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
        grad.addColorStop(0, '#5c8374');
        grad.addColorStop(1, '#a8c5a0');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI * 2 * (done / total) - Math.PI / 2);
        ctx.stroke();
    }

    ctx.fillStyle = '#2c3639';
    ctx.font = 'bold 46px STKaiti, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${done}/${total}`, cx, cy + 14);
    ctx.fillStyle = '#6b7c7a';
    ctx.font = '20px sans-serif';
    ctx.fillText('今日完成', cx, cy + 42);

    // 分割线
    ctx.strokeStyle = 'rgba(92,131,116,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(60, 416); ctx.lineTo(690, 416); ctx.stroke();

    // ── 打卡清单 ──
    if (items.length === 0) {
        ctx.fillStyle = '#9aaba8';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('暂无打卡项，快去添加吧～', W / 2, listTop + 50);
    } else {
        items.forEach((item, i) => {
            const iy = listTop + i * itemH;

            // 卡片底色
            if (item.done) {
                ctx.fillStyle = 'rgba(92,131,116,0.13)';
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.55)';
            }
            rrect(ctx, 48, iy, W - 96, 72, 14);
            ctx.fill();

            // emoji 图标
            ctx.font = '32px serif';
            ctx.textAlign = 'left';
            ctx.fillText(item.icon, 76, iy + 46);

            // 名称
            ctx.fillStyle = item.done ? '#3d6b5e' : '#2c3639';
            ctx.font = `${item.done ? 'bold' : '500'} 26px sans-serif`;
            ctx.fillText(item.name, 128, iy + 36);

            // 备注
            if (item.meta) {
                ctx.fillStyle = '#9aaba8';
                ctx.font = '19px sans-serif';
                ctx.fillText(item.meta, 128, iy + 58);
            }

            // 勾选圆
            const bx = W - 76, by = iy + 36;
            if (item.done) {
                ctx.fillStyle = '#5c8374';
                ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 20px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('✓', bx, by + 7);
            } else {
                ctx.strokeStyle = '#c8d5d2';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.textAlign = 'left';
        });
    }

    // ── 页脚 ──
    const fy = H - 90;
    ctx.strokeStyle = 'rgba(92,131,116,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(60, fy - 20); ctx.lineTo(690, fy - 20); ctx.stroke();

    ctx.fillStyle = '#5c8374';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌿 健康生活，从每日打卡开始', W / 2, fy + 14);
    ctx.fillStyle = '#9aaba8';
    ctx.font = '18px sans-serif';
    ctx.fillText('颐养阁养生社区', W / 2, fy + 44);
}

function downloadPoster() {
    const canvas = posterCanvasRef.value;
    if (!canvas) return;
    const now = new Date();
    const name = `颐养阁打卡海报_${now.getMonth() + 1}月${now.getDate()}日.png`;
    const a = document.createElement('a');
    a.download = name;
    a.href = canvas.toDataURL('image/png');
    a.click();
}

function sharePosterToCommunity() {
    const canvas = posterCanvasRef.value;
    const imageData = canvas ? canvas.toDataURL('image/png') : '';
    showPoster.value = false;
    const done = checkItems.value.filter(i => i.done).length;
    const total = checkItems.value.length;
    activeTab.value = 'interaction';
    nextTick(() => {
        communityForm.value = {
            text: `📋 今日打卡 ${done}/${total} 项完成，坚持养生，元气满满！`,
            images: imageData ? [imageData] : [],
            tags: ['运动打卡', '健康生活'],
        };
        showCommunityPublish.value = true;
    });
}
// ─────────────────────────────────────────────────────


// 连续打卡天数：从今天往前数，有打卡记录且至少一项完成的连续天数
const streakDays = computed(() => {
    let days = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
        const key = fmtDate(d);
        const record = checkinHistory.value[key];
        if (record && record.items.some(it => it.done)) {
            days++;
            d.setDate(d.getDate() - 1);
        } else {
            break;
        }
    }
    return days;
});

// 里程碑定义
const milestoneDefs = [
    { name: "初心 · 连续 7 天",   emoji: "🌱", require: 7 },
    { name: "坚持 · 连续 21 天",  emoji: "🌿", require: 21 },
    { name: "而立 · 连续 30 天",  emoji: "🌳", require: 30 },
    { name: "恒心 · 连续 100 天", emoji: "🏔️", require: 100 },
];

const milestones = computed(() => {
    const s = streakDays.value;
    return milestoneDefs.map((m, i) => {
        const unlocked = s >= m.require;
        const pct = Math.min(100, Math.round((s / m.require) * 100));
        const remain = m.require - s;
        return {
            name: m.name,
            emoji: m.emoji,
            require: m.require,
            unlocked,
            progress: pct,
            doneOrRemaining: remain,
            desc: unlocked
                ? '已达成'
                : `进度 ${s} / ${m.require} 天`,
            statusLabel: unlocked
                ? '已获得'
                : remain <= 1 ? '1 天后' : `${remain} 天后`,
        };
    });
});

// ---- Module 2: Lifestyle ----
const meals = ref<{ name: string; emoji: string; bg: string; foods: string; cal: number; image: string }[]>([]);

const mealTypes = [
    { name: "早茶",   emoji: "🍵", bg: "mt-morning-tea" },
    { name: "早餐",   emoji: "🥣", bg: "mt-breakfast" },
    { name: "午餐",   emoji: "🍲", bg: "mt-lunch" },
    { name: "下午茶", emoji: "☕", bg: "mt-tea-break" },
    { name: "晚餐",   emoji: "🥗", bg: "mt-dinner" },
    { name: "夜宵",   emoji: "🌙", bg: "mt-supper" },
    { name: "加餐",   emoji: "🍎", bg: "mt-snack" },
];

const showMealDialog = ref(false);
const mealForm = ref({ name: "早餐", emoji: "🥣", bg: "mt-breakfast", foods: "", cal: 0, image: "" });
const mealImgInputRef = ref<HTMLInputElement | null>(null);

function openMealDialog() {
    mealForm.value = { name: "早餐", emoji: "🥣", bg: "mt-breakfast", foods: "", cal: 0, image: "" };
    showMealDialog.value = true;
}

function selectMealType(t: typeof mealTypes[0]) {
    mealForm.value.name  = t.name;
    mealForm.value.emoji = t.emoji;
    mealForm.value.bg    = t.bg;
}

function triggerMealImgInput() {
    mealImgInputRef.value?.click();
}

function onMealImgSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { mealForm.value.image = ev.target?.result as string; };
    reader.readAsDataURL(file);
    (e.target as HTMLInputElement).value = "";
}

function saveMeal() {
    if (!mealForm.value.foods.trim() && mealForm.value.cal === 0) return;
    meals.value.push({ ...mealForm.value });
    showMealDialog.value = false;
}

function removeMeal(idx: number) {
    meals.value.splice(idx, 1);
}

const totalCal = computed(() =>
    meals.value.reduce((sum, m) => sum + (m.cal || 0), 0),
);
const calOver = computed(() => totalCal.value > calGoal.value);
const calPct = computed(() =>
    Math.min(100, Math.round((totalCal.value / calGoal.value) * 100)),
);
const calCircleStyle = computed(() => {
    const fill = calOver.value ? 'var(--cinnabar)' : 'var(--gold)';
    const p = calPct.value;
    return { background: `conic-gradient(${fill} 0% ${p}%, var(--cream) ${p}% 100%)` };
});

const waterFilled = ref(6);
const waterGoal = ref(2000);
const waterCupSize = ref(250);
const waterCupCount = computed(() => Math.ceil(waterGoal.value / waterCupSize.value));
const showWaterSettings = ref(false);
const wsetForm = ref({ goal: 2000, cupSize: 250 });

function openWaterSettings() {
    wsetForm.value = { goal: waterGoal.value, cupSize: waterCupSize.value };
    showWaterSettings.value = true;
}

function saveWaterSettings() {
    waterGoal.value = wsetForm.value.goal;
    waterCupSize.value = wsetForm.value.cupSize;
    waterFilled.value = 0;
    showWaterSettings.value = false;
}

const calGoal = ref(1800);
const showCalSettings = ref(false);
const calForm = ref({ goal: 1800 });

function openCalSettings() {
    calForm.value.goal = calGoal.value;
    showCalSettings.value = true;
}

function saveCalSettings() {
    calGoal.value = calForm.value.goal;
    showCalSettings.value = false;
}

const nutrition = [
    { label: "碳水化合物", value: "192g", pct: 70, color: "var(--gold)" },
    { label: "蛋白质", value: "76g", pct: 62, color: "var(--jade)" },
    { label: "脂肪", value: "44g", pct: 48, color: "var(--cinnabar)" },
    { label: "膳食纤维", value: "21g", pct: 84, color: "var(--moon)" },
];

// ---- Module 3: Sharing ----
const shareCategories = [
    "食疗药膳",
    "作息调理",
    "运动养生",
    "情志疏导",
    "节气养生",
    "中医妙招",
];

// 发布弹窗
const currentUser = ref("小翠");
const showShareDialog = ref(false);
const shareForm = ref({ text: "", images: [] as string[], video: "", category: "食疗药膳" });
const editingDraftIdx = ref<number | null>(null);
const shareImgInputRef = ref<HTMLInputElement | null>(null);
const shareVideoInputRef = ref<HTMLInputElement | null>(null);

function openShareDialog() {
    shareForm.value = { text: "", images: [], video: "", category: "食疗药膳" };
    editingDraftIdx.value = null;
    showShareDialog.value = true;
}
function closeShareDialog() {
    showShareDialog.value = false;
    editingDraftIdx.value = null;
}

function triggerShareImgInput() { shareImgInputRef.value?.click(); }
function onShareImgSelect(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;
    Array.from(files).forEach(f => {
        const reader = new FileReader();
        reader.onload = ev => {
            if (ev.target?.result && shareForm.value.images.length < 9)
                shareForm.value.images.push(ev.target.result as string);
        };
        reader.readAsDataURL(f);
    });
    (e.target as HTMLInputElement).value = "";
}
function triggerShareVideoInput() { shareVideoInputRef.value?.click(); }
function onShareVideoSelect(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => { shareForm.value.video = ev.target?.result as string || ""; };
    reader.readAsDataURL(f);
    (e.target as HTMLInputElement).value = "";
}

// 草稿箱（localStorage）
const drafts = ref<{ text: string; images: string[]; video: string; category: string }[]>([]);
const showDraftsPanel = ref(false);

function loadDrafts() {
    try {
        const raw = localStorage.getItem('yiyangge_drafts');
        drafts.value = raw ? JSON.parse(raw) : [];
    } catch { drafts.value = []; }
}
function saveDrafts() {
    localStorage.setItem('yiyangge_drafts', JSON.stringify(drafts.value));
}
function editDraft(idx: number) {
    const d = drafts.value[idx];
    shareForm.value = { text: d.text, images: [...(d.images || [])], video: d.video || "", category: d.category };
    editingDraftIdx.value = idx;
    showShareDialog.value = true;
}

function saveDraft() {
    if (editingDraftIdx.value !== null) {
        drafts.value[editingDraftIdx.value] = { ...shareForm.value };
    } else {
        drafts.value.push({ ...shareForm.value });
    }
    saveDrafts();
    closeShareDialog();
    toast('📥 已存入草稿箱');
}
function removeDraft(idx: number) {
    drafts.value.splice(idx, 1);
    saveDrafts();
    if (drafts.value.length === 0) showDraftsPanel.value = false;
}
function openDrafts() { loadDrafts(); showDraftsPanel.value = true; }

// 已发布
interface CommentItem {
    author: string; text: string; time: string;
    replies: CommentItem[];
    _cid: string;
    replyTo?: string;
}
interface Post {
    _id: string;
    text: string; images: string[]; video: string; category: string;
    author: string; time: string;
    likes: number; comments: number; stars: number;
    commentList: CommentItem[];
    emoji: string;
}
const publishedPosts = ref<Post[]>([]);
const catEmojis: Record<string, string> = { "食疗药膳":"🍲","作息调理":"🌙","运动养生":"🧘","情志疏导":"🌸","节气养生":"💧","中医妙招":"🫖" };

function loadPublished() {
    try {
        const raw = localStorage.getItem('yiyangge_published');
        publishedPosts.value = raw ? JSON.parse(raw) : [];
        // 兼容旧数据
        publishedPosts.value.forEach(p => {
            if (!p._id) p._id = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
            if (!p.commentList) p.commentList = [];
            p.commentList.forEach(c => {
                if (!c._cid) c._cid = 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
                if (!c.replies) c.replies = [];
            });
            p.comments = countAllComments(p.commentList);
        });
    } catch { publishedPosts.value = []; }
}
function countAllComments(list: CommentItem[]): number {
    let n = list.length;
    list.forEach(c => { if (c.replies) n += c.replies.length; });
    return n;
}
function savePublished() {
    localStorage.setItem('yiyangge_published', JSON.stringify(publishedPosts.value));
}

const authorNames = ["小翠","阿岚","暮雨","青霜","松风","林清欢","苏小养","禾木"];

function publishPost() {
    const f = shareForm.value;
    if (!f.text.trim()) { toast('请输入内容，内容不能为空'); return; }
    const now = new Date();
    const t = `${now.getMonth()+1}/${now.getDate()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    publishedPosts.value.unshift({
        _id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        text: f.text,
        images: [...f.images],
        video: f.video,
        category: f.category,
        author: authorNames[Math.floor(Math.random() * authorNames.length)],
        time: t,
        likes: 0,
        comments: 0,
        stars: 0,
        commentList: [],
        emoji: catEmojis[f.category] || "📝",
    });
    savePublished();
    closeShareDialog();
    showDraftsPanel.value = false;
    toast('✓ 已发布成功');
}

// 发布草稿
function publishDraft(idx: number) {
    const d = drafts.value[idx];
    const now = new Date();
    const t = `${now.getMonth()+1}/${now.getDate()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    publishedPosts.value.unshift({
        _id: Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        text: d.text,
        images: d.images || [],
        video: d.video || "",
        category: d.category,
        author: authorNames[Math.floor(Math.random() * authorNames.length)],
        time: t,
        likes: 0,
        comments: 0,
        stars: 0,
        commentList: [],
        emoji: catEmojis[d.category] || "📝",
    });
    savePublished();
    drafts.value.splice(idx, 1);
    saveDrafts();
    if (drafts.value.length === 0) showDraftsPanel.value = false;
    toast('✓ 草稿已发布');
}

function removePost(postId: string) {
    const idx = publishedPosts.value.findIndex(p => p._id === postId);
    if (idx !== -1) {
        publishedPosts.value.splice(idx, 1);
        savePublished();
        toast('已删除');
    }
}

// 点赞/评论/收藏
const likesState = ref<Record<string, boolean>>({});
const starsState = ref<Record<string, boolean>>({});
const showCommentInputId = ref('');

function toggleLike(postId: string) {
    const p = publishedPosts.value.find(x => x._id === postId);
    if (!p) return;
    likesState.value[postId] = !likesState.value[postId];
    p.likes += likesState.value[postId] ? 1 : -1;
    savePublished();
}

function toggleStar(postId: string) {
    const p = publishedPosts.value.find(x => x._id === postId);
    if (!p) return;
    starsState.value[postId] = !starsState.value[postId];
    p.stars += starsState.value[postId] ? 1 : -1;
    savePublished();
}

const commentText = ref<Record<string, string>>({});
const replyTarget = ref<{ postId: string; cid: string; author: string } | null>(null);

function toggleCommentInput(postId: string) {
    showCommentInputId.value = showCommentInputId.value === postId ? '' : postId;
    replyTarget.value = null;
}

function setReplyTarget(postId: string, cid: string, author: string) {
    showCommentInputId.value = postId;
    replyTarget.value = { postId, cid, author };
}

function submitComment(postId: string) {
    const text = (commentText.value[postId] || '').trim();
    if (!text) return;
    const p = publishedPosts.value.find(x => x._id === postId);
    if (!p) return;
    if (!p.commentList) p.commentList = [];

    const now = new Date().toLocaleTimeString().slice(0, 5);

    if (replyTarget.value && replyTarget.value.postId === postId) {
        // 回复某条评论
        const parent = p.commentList.find(c => c._cid === replyTarget.value.cid);
        if (parent) {
            if (!parent.replies) parent.replies = [];
            parent.replies.push({
                author: currentUser.value,
                text,
                replyTo: replyTarget.value.author,
                time: now,
                replies: [],
                _cid: 'r_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            });
        }
    } else {
        p.commentList.unshift({
            author: currentUser.value,
            text,
            time: now,
            replies: [],
            _cid: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        });
    }

    p.comments = countAllComments(p.commentList);
    commentText.value[postId] = '';
    showCommentInputId.value = '';
    replyTarget.value = null;
    savePublished();
}

// 分类内容弹窗
const showCatDialog = ref(false);
const catDialogName = ref("");
const catDialogKeyword = ref("");
const catDialogPosts = computed(() => {
    const cat = catDialogName.value;
    return cat ? publishedPosts.value.filter(p => p.category === cat) : [];
});
const filteredCatPosts = computed(() => {
    const kw = catDialogKeyword.value.trim().toLowerCase();
    if (!kw) return catDialogPosts.value;
    return catDialogPosts.value.filter(p =>
        p.text.toLowerCase().includes(kw) ||
        p.author.toLowerCase().includes(kw) ||
        (p.commentList && p.commentList.some(c =>
            c.text.toLowerCase().includes(kw) || c.author.toLowerCase().includes(kw),
        )),
    );
});

const postsByCategory = computed(() => {
    const map: Record<string, typeof publishedPosts.value> = {};
    shareCategories.forEach(c => { map[c] = []; });
    publishedPosts.value.forEach(p => {
        if (map[p.category]) map[p.category].push(p);
    });
    return map;
});

function openCategoryDialog(cat: string) {
    catDialogName.value = cat;
    catDialogKeyword.value = '';
    showCatDialog.value = true;
}

// 创作数据统计
const totalLikes = computed(() =>
    publishedPosts.value.reduce((s, p) => s + (p.likes || 0), 0),
);
const totalStars = computed(() =>
    publishedPosts.value.reduce((s, p) => s + (p.stars || 0), 0),
);
const totalComments = computed(() =>
    publishedPosts.value.reduce((s, p) => s + (p.comments || 0), 0),
);

const hotTopics = [
    {
        name: "小满养生打卡",
        emoji: "🔥",
        meta: "2.6 万 条经验 · 今日新增 312",
        bg: "var(--gold-soft)",
    },
    {
        name: "早睡早起挑战",
        emoji: "🌙",
        meta: "4.1 万 条经验 · 持续热议",
        bg: "var(--jade-soft)",
    },
    {
        name: "我的食疗方子",
        emoji: "🍲",
        meta: "1.8 万 条经验 · 精华 240",
        bg: "var(--pink-soft)",
    },
    {
        name: "八段锦习练日记",
        emoji: "☯️",
        meta: "9.7 千 条经验 · 新话题",
        bg: "var(--moon-soft)",
    },
];

// ---- Module 4: Interaction ----
const feedFilters = ["推荐", "关注"];
const selectedFeedFilter = ref("推荐");
// 通知系统
interface NotifItem {
    _nid: string; type: 'like' | 'comment' | 'follow';
    emoji: string; bg: string; title: string; text: string; time: string;
    read: boolean; fromId: string; postId?: string;
}
const notificationList = ref<NotifItem[]>([]);
const unreadCount = computed(() => notificationList.value.filter(n => !n.read).length);
const showNotifDialog = ref(false);
const showNotifPanel = ref(false);
const notifPanelType = ref<'like' | 'comment' | 'follow'>('like');
const notifDetailTarget = ref<NotifItem | null>(null);

const notifByType = computed(() => ({
    like: notificationList.value.filter(n => n.type === 'like'),
    comment: notificationList.value.filter(n => n.type === 'comment'),
    follow: notificationList.value.filter(n => n.type === 'follow'),
}));

const unreadByType = computed(() => ({
    like: notifByType.value.like.filter(n => !n.read).length,
    comment: notifByType.value.comment.filter(n => !n.read).length,
    follow: notifByType.value.follow.filter(n => !n.read).length,
}));

const filteredNotifPanel = computed(() => notifByType.value[notifPanelType.value] || []);

function openNotifPanel(type: 'like' | 'comment' | 'follow') {
    notifPanelType.value = type;
    showNotifPanel.value = true;
    notifByType.value[type].forEach(n => { n.read = true; });
    saveNotifications();
}

function loadNotifications() {
    try {
        const r = localStorage.getItem('yiyangge_notifs');
        notificationList.value = r ? JSON.parse(r) : [];
        if (notificationList.value.length === 0) {
            notificationList.value = [
                { _nid: 'n_seed_1', type: 'like', emoji: '❤️', bg: 'var(--cinnabar-soft)', title: '林清欢 赞了你的动态', text: '今天坚持早睡第30天，气色真的好多了！', time: '昨天 20:30', read: false, fromId: 'user_1' },
                { _nid: 'n_seed_2', type: 'like', emoji: '❤️', bg: 'var(--cinnabar-soft)', title: '暮雨青霜 赞了你的动态', text: '分享的枸杞菊花茶方子很实用，已收藏', time: '今天 09:12', read: false, fromId: 'user_2' },
                { _nid: 'n_seed_3', type: 'like', emoji: '⭐', bg: 'var(--gold-soft)', title: '松风入怀 收藏了你的帖子', text: '八段锦晨练第18天打卡记录', time: '今天 10:44', read: false, fromId: 'user_3' },
                { _nid: 'n_seed_4', type: 'like', emoji: '❤️', bg: 'var(--cinnabar-soft)', title: '陈一山 赞了你的动态', text: '早睡自律互助打卡，加油！', time: '今天 11:00', read: true, fromId: 'user_4' },
                { _nid: 'n_seed_5', type: 'comment', emoji: '💬', bg: 'var(--jade-soft)', title: '陈一山 评论了你的动态', text: '写得太好了，请问是怎么坚持下来的？', time: '今天 11:20', read: false, fromId: 'user_4' },
                { _nid: 'n_seed_6', type: 'comment', emoji: '💬', bg: 'var(--jade-soft)', title: '苏小养 回复了你的评论', text: '对，我也觉得喝养生茶效果很明显，一起加油！', time: '今天 13:05', read: false, fromId: 'user_5' },
                { _nid: 'n_seed_7', type: 'comment', emoji: '💬', bg: 'var(--jade-soft)', title: '禾木 评论了你的动态', text: '太厉害了！我也想挑战早睡，怎么才能克服刷手机的毛病？', time: '今天 14:30', read: true, fromId: 'user_6' },
                { _nid: 'n_seed_8', type: 'follow', emoji: '👥', bg: 'var(--gold-soft)', title: '林清欢 关注了你', text: '开始关注你了', time: '今天 08:30', read: false, fromId: 'user_1' },
                { _nid: 'n_seed_9', type: 'follow', emoji: '👥', bg: 'var(--gold-soft)', title: '禾木 关注了你', text: '开始关注你了', time: '昨天 18:00', read: true, fromId: 'user_6' },
                { _nid: 'n_seed_10', type: 'follow', emoji: '👥', bg: 'var(--gold-soft)', title: '苏小养 关注了你', text: '开始关注你了', time: '2天前', read: true, fromId: 'user_5' },
            ];
            saveNotifications();
        }
    } catch { notificationList.value = []; }
}
function saveNotifications() { localStorage.setItem('yiyangge_notifs', JSON.stringify(notificationList.value)); }

function addNotification(notif: NotifItem) {
    notificationList.value.unshift(notif);
    saveNotifications();
}

function openNotifDetail(notif: NotifItem) {
    notifDetailTarget.value = notif;
    if (!notif.read) { notif.read = true; saveNotifications(); }
}

function goToCommunityPost(postId: string) {
    showNotifPanel.value = false;
    notifDetailTarget.value = null;
    // 滚动到对应帖子
    expandedComments.value[postId] = true;
    nextTick(() => {
        const el = document.getElementById('post-' + postId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

const currentUserId = 'me';

// Community Posts (localStorage persisted)
const communityPosts = ref<CommunityPost[]>([]);
const followedUsers = ref<Record<string, boolean>>({});

interface CommunityPost {
    _id: string; authorId: string; name: string; level: string; meta: string;
    avatarBg: string; avatarText: string; text: string;
    checkin?: string; checkinTitle?: string; checkinDesc?: string;
    images: { src: string }[]; tags: string[];
    liked: boolean; likeCount: number; starCount: number; stared: boolean;
    commentCount: number; commentList: CommunityComment[];
}
interface CommunityComment {
    _cid: string; author: string; text: string; time: string;
    replyTo?: string;
    replies?: CommunityComment[];
}

function getSeededCommunityPosts(): CommunityPost[] {
    return [
        {
            _id: 'cp_seed_1', authorId: 'user_1', name: '林清欢', level: 'Lv.5',
            meta: '昨天 20:30', avatarBg: 'linear-gradient(135deg,var(--gold),var(--cinnabar))', avatarText: '林',
            text: '坚持早睡第30天！连续一个月22:30前睡觉，脸上痘痘明显减少，精力也旺盛了，早睡养肝真的有效，姐妹们一起来！🌙',
            images: [], tags: ['早睡早起', '健康生活'],
            liked: false, likeCount: 88, stared: false, starCount: 31,
            commentCount: 2, commentList: [
                { _cid: 'cc_s1_1', author: '陈一山', text: '太厉害了，我才第8天差距好大', time: '昨天', replies: [] },
                { _cid: 'cc_s1_2', author: '苏小养', text: '30天！！佩服，一起加油', time: '昨天', replies: [] },
            ],
        },
        {
            _id: 'cp_seed_2', authorId: 'user_2', name: '暮雨青霜', level: 'Lv.3',
            meta: '2 小时前', avatarBg: 'linear-gradient(135deg,var(--jade),var(--moon))', avatarText: '暮',
            text: '分享超好喝的养生茶：枸杞5g + 菊花3朵 + 红枣2颗 + 麦冬5g，每天坚持喝眼睛不再疲劳，气色也好了很多，快来试试！',
            images: [], tags: ['食疗养生', '节气养生'],
            liked: false, likeCount: 52, stared: false, starCount: 19,
            commentCount: 1, commentList: [
                { _cid: 'cc_s2_1', author: '禾木', text: '好的我来试试，最近眼睛很累', time: '1小时前', replies: [] },
            ],
        },
        {
            _id: 'cp_seed_3', authorId: 'user_3', name: '松风入怀', level: 'Lv.4',
            meta: '3 小时前', avatarBg: 'linear-gradient(135deg,var(--pink),var(--gold))', avatarText: '松',
            text: '八段锦晨练第18天打卡，配合食疗养生，感觉整个人气色变亮了，肩颈不再酸痛，推荐给久坐办公室的朋友们！',
            images: [], tags: ['运动打卡', '健康生活'],
            liked: false, likeCount: 36, stared: false, starCount: 12,
            commentCount: 0, commentList: [],
        },
        {
            _id: 'cp_seed_4', authorId: 'user_4', name: '陈一山', level: 'Lv.2',
            meta: '5 小时前', avatarBg: 'linear-gradient(135deg,var(--moon),var(--jade))', avatarText: '陈',
            text: '今天喝了第一杯自制的红豆薏米水，清热祛湿！听说要坚持喝才有效，打算挑战21天，有没有一起坚持的小伙伴？',
            images: [], tags: ['食疗养生', '健康生活'],
            liked: false, likeCount: 24, stared: false, starCount: 7,
            commentCount: 0, commentList: [],
        },
    ];
}

function loadCommunityPosts() {
    try {
        const r = localStorage.getItem('yiyangge_community');
        if (!r) {
            communityPosts.value = getSeededCommunityPosts();
            saveCommunityPosts();
            return;
        }
        const parsed = JSON.parse(r);
        if (!Array.isArray(parsed)) { communityPosts.value = []; return; }
        communityPosts.value = parsed.map((p: any) => ({
            _id: p._id || 'cp_' + Date.now(),
            authorId: p.authorId || '',
            name: p.name || '匿名',
            level: p.level || '',
            meta: p.meta || '',
            avatarBg: p.avatarBg || '',
            avatarText: p.avatarText || '?',
            text: p.text || '',
            checkin: p.checkin, checkinTitle: p.checkinTitle, checkinDesc: p.checkinDesc,
            images: Array.isArray(p.images) ? p.images.map((img: any) => ({ src: img.src || '' })) : [],
            tags: Array.isArray(p.tags) ? p.tags : [],
            liked: !!p.liked, likeCount: p.likeCount || 0,
            stared: !!p.stared, starCount: p.starCount || 0,
            commentCount: p.commentCount || 0,
            commentList: Array.isArray(p.commentList) ? p.commentList.map((c: any) => ({
                _cid: c._cid || 'cc_' + Date.now(), author: c.author || '匿名', text: c.text || '',
                time: c.time || '', replyTo: c.replyTo,
                replies: Array.isArray(c.replies) ? c.replies.map((r: any) => ({
                    _cid: r._cid || 'ccr_' + Date.now(), author: r.author || '匿名', text: r.text || '',
                    time: r.time || '', replyTo: r.replyTo,
                })) : [],
            })) : [],
        }));
    } catch { communityPosts.value = []; }
}
function saveCommunityPosts() {
    localStorage.setItem('yiyangge_community', JSON.stringify(communityPosts.value));
}

function loadFollowed() {
    try { const r = localStorage.getItem('yiyangge_followed'); followedUsers.value = r ? JSON.parse(r) : {}; }
    catch { followedUsers.value = {}; }
}
function saveFollowed() { localStorage.setItem('yiyangge_followed', JSON.stringify(followedUsers.value)); }

function toggleFollow(uid: string) {
    followedUsers.value[uid] = !followedUsers.value[uid];
    saveFollowed();
    if (followedUsers.value[uid] && uid !== currentUserId) {
        const p = communityPosts.value.find(x => x.authorId === uid);
        addNotification({
            _nid: 'n_' + Date.now(), type: 'follow',
            emoji: '👥', bg: 'var(--gold-soft)',
            title: `${currentUser.value} 关注了你`,
            text: p ? `来自「${p.text.slice(0, 30)}${p.text.length > 30 ? '…' : ''}」的帖子` : '开始关注你了',
            time: new Date().toLocaleTimeString().slice(0, 5),
            read: false, fromId: uid, postId: p?._id,
        });
    }
    toast(followedUsers.value[uid] ? '已关注' : '已取消关注');
}

const filteredCommunityPosts = computed(() => {
    let list = communityPosts.value;
    if (selectedFeedFilter.value === '关注')
        list = list.filter(p => followedUsers.value[p.authorId]);
    return list;
});

// 社区发布
const showCommunityPublish = ref(false);
const communityForm = ref({ text: '', images: [] as string[], tags: [] as string[] });
const communityImgInputRef = ref<HTMLInputElement | null>(null);

function openCommunityPublish(prefill?: string) {
    communityForm.value = {
        text: typeof prefill === 'string' ? prefill : '',
        images: [],
        tags: [],
    };
    showCommunityPublish.value = true;
}
function triggerCommunityImgInput() { communityImgInputRef.value?.click(); }
function onCommunityImgSelect(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;
    Array.from(files).forEach(f => {
        const r = new FileReader();
        r.onload = ev => { if (ev.target?.result && communityForm.value.images.length < 9) communityForm.value.images.push(ev.target.result as string); };
        r.readAsDataURL(f);
    });
    (e.target as HTMLInputElement).value = '';
}
function toggleCommunityTag(t: string) {
    const idx = communityForm.value.tags.indexOf(t);
    idx > -1 ? communityForm.value.tags.splice(idx, 1) : communityForm.value.tags.push(t);
}
function publishCommunityPost() {
    if (!communityForm.value.text.trim()) { toast('请输入内容'); return; }
    const avatars = ['林','苏','阿','禾','墨','陈','小翠'];
    const bg = ['linear-gradient(135deg,var(--gold),var(--cinnabar))','linear-gradient(135deg,var(--jade),var(--moon))','linear-gradient(135deg,var(--pink),var(--gold))'];
    const now = new Date();
    communityPosts.value.unshift({
        _id: 'cp_' + Date.now(),
        authorId: currentUserId,
        name: '我',
        level: '楼主',
        meta: '刚刚',
        avatarBg: bg[0], avatarText: '我',
        text: communityForm.value.text,
        images: communityForm.value.images.map(s => ({ src: s })),
        tags: communityForm.value.tags,
        liked: false, likeCount: 0,
        stared: false, starCount: 0,
        commentCount: 0, commentList: [],
    });
    saveCommunityPosts();
    showCommunityPublish.value = false;
    toast('动态已发布');
}
function deleteCommunityPost(pid: string) {
    const idx = communityPosts.value.findIndex(p => p._id === pid);
    if (idx > -1) { communityPosts.value.splice(idx, 1); saveCommunityPosts(); toast('已删除'); }
}

// 社区互动
function likeCommunityPost(pid: string) {
    const p = communityPosts.value.find(x => x._id === pid);
    if (!p) return;
    p.liked = !p.liked;
    p.likeCount += p.liked ? 1 : -1;
    saveCommunityPosts();
    // 通知（非本人帖子才通知）
    if (p.liked && p.authorId !== currentUserId) {
        addNotification({
            _nid: 'n_' + Date.now(), type: 'like',
            emoji: '❤️', bg: 'var(--cinnabar-soft)',
            title: `${currentUser.value} 赞了你的动态`,
            text: p.text.slice(0, 60) + (p.text.length > 60 ? '…' : ''),
            time: new Date().toLocaleTimeString().slice(0, 5),
            read: false, fromId: currentUserId, postId: pid,
        });
    }
}
function starCommunityPost(pid: string) {
    const p = communityPosts.value.find(x => x._id === pid);
    if (!p) return;
    p.stared = !p.stared;
    p.starCount += p.stared ? 1 : -1;
    saveCommunityPosts();
}
function shareCommunityPost(post: CommunityPost) {
    shareFormData.value.originalPost = post;
    showShareModal.value = true;
}
function confirmSharePost() {
    if (!shareFormData.value.originalPost) return;
    const p = shareFormData.value.originalPost;
    communityPosts.value.unshift({
        _id: 'cp_' + Date.now(),
        authorId: currentUserId, name: '我', level: '楼主', meta: '刚刚',
        avatarBg: 'linear-gradient(135deg,var(--gold),var(--cinnabar))', avatarText: '我',
        text: `转发了 @${p.name} 的动态：${p.text}`,
        images: [], tags: [],
        liked: false, likeCount: 0, stared: false, starCount: 0,
        commentCount: 0, commentList: [],
    });
    saveCommunityPosts();
    shareFormData.value.originalPost = null;
    showShareModal.value = false;
    toast('已转发');
}

const showShareModal = ref(false);
const shareFormData = ref<{ text: string; originalPost: CommunityPost | null }>({ text: '', originalPost: null });

// 社区评论
const expandedComments = ref<Record<string, boolean>>({});
const communityCommentText = ref<Record<string, string>>({});
const communityReplyTarget = ref<{ postId: string; cid: string; author: string } | null>(null);

function toggleCommunityComment(pid: string) {
    expandedComments.value[pid] = !expandedComments.value[pid];
    communityReplyTarget.value = null;
}
function setCommunityReplyTarget(postId: string, cid: string, author: string) {
    communityReplyTarget.value = { postId, cid, author };
}
function submitCommunityComment(pid: string) {
    const text = (communityCommentText.value[pid] || '').trim();
    if (!text) return;
    const p = communityPosts.value.find(x => x._id === pid);
    if (!p) return;
    if (!p.commentList) p.commentList = [];
    const now = new Date().toLocaleTimeString().slice(0, 5);
    if (communityReplyTarget.value && communityReplyTarget.value.postId === pid) {
        const parent = p.commentList.find(c => c._cid === communityReplyTarget.value!.cid);
        if (parent) {
            if (!parent.replies) parent.replies = [];
            parent.replies.push({
                _cid: 'ccr_' + Date.now(),
                author: currentUser.value, text,
                replyTo: communityReplyTarget.value.author,
                time: now,
            });
        }
    } else {
        p.commentList.unshift({
            _cid: 'cc_' + Date.now(),
            author: currentUser.value, text, time: now,
        });
    }
    p.commentCount = (p.commentList || []).length + (p.commentList || []).reduce((s, c) => s + (c.replies?.length || 0), 0);
    communityCommentText.value[pid] = '';
    communityReplyTarget.value = null;
    saveCommunityPosts();
    // 通知（非本人帖子才通知）
    if (p.authorId !== currentUserId) {
        addNotification({
            _nid: 'n_' + Date.now(), type: 'comment',
            emoji: '💬', bg: 'var(--jade-soft)',
            title: `${currentUser.value} 评论了你的动态`,
            text: text.slice(0, 60) + (text.length > 60 ? '…' : ''),
            time: new Date().toLocaleTimeString().slice(0, 5),
            read: false, fromId: currentUserId, postId: pid,
        });
    }
}

const groups = [
    {
        name: "早睡自律互助组",
        emoji: "🌙",
        meta: "1.2 万 成员 · 每日打卡督促",
        bg: "var(--jade-soft)",
        joined: false,
    },
    {
        name: "正念冥想小组",
        emoji: "🧘",
        meta: "8.6 千 成员 · 已加入",
        bg: "var(--pink-soft)",
        joined: true,
    },
    {
        name: "食疗药膳交流圈",
        emoji: "🍵",
        meta: "2.3 万 成员 · 活跃",
        bg: "var(--gold-soft)",
        joined: false,
    },
];

// 本周活跃榜 — 按社区数据实时计算
// 算法：发帖＝15分, 评论＝4分, 回复＝2分, 获赞＝3分, 被收藏＝2分
const leaderboard = computed(() => {
    const scores: Record<string, { name: string; score: number; posts: number; comments: number; likes: number; stars: number; avatarBg: string; avatarText: string; isMe: boolean }> = {};

    // 遍历社区帖子，统计每项作者得分
    communityPosts.value.forEach(p => {
        const id = p.authorId;
        if (!scores[id]) scores[id] = {
            name: p.name, score: 0, posts: 0, comments: 0, likes: 0, stars: 0,
            avatarBg: p.avatarBg, avatarText: p.avatarText, isMe: id === currentUserId,
        };
        const u = scores[id];
        u.posts += 1;
        u.score += 15;  // 发帖积 15 分
        u.likes += p.likeCount;
        u.score += p.likeCount * 3;  // 获赞每个 3 分
        u.stars += p.starCount;
        u.score += p.starCount * 2;  // 被收藏每个 2 分
    });

    // 遍历所有帖子评论，统计评论者得分
    communityPosts.value.forEach(p => {
        (p.commentList || []).forEach(c => {
            const commentAuthor = c.author;
            if (!scores[commentAuthor]) scores[commentAuthor] = {
                name: commentAuthor, score: 0, posts: 0, comments: 0, likes: 0, stars: 0,
                avatarBg: 'linear-gradient(135deg, var(--jade), var(--moon))',
                avatarText: commentAuthor[0], isMe: false,
            };
            scores[commentAuthor].comments += 1;
            scores[commentAuthor].score += 4;  // 评论积 4 分
            (c.replies || []).forEach(r => {
                scores[commentAuthor].comments += 1;
                scores[commentAuthor].score += 2;  // 回复积 2 分
            });
        });
    });

    return Object.values(scores)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)  // top 8
        .map((u, i) => ({
            ...u,
            score: String(u.score),
            sub: `${u.posts} 帖 · ${u.comments} 评 · ${u.likes} 赞 · ${u.stars} 藏`,
        }));
});

// ---- Module 5: Challenges ----
const challengeFilters = ["全部", "作息", "饮食", "运动", "情志"];
const selectedChallengeFilter = ref("全部");

const challenges = [
    {
        name: "21 天早睡养肝挑战",
        emoji: "🌙",
        bg: "linear-gradient(135deg, var(--jade-soft), #D5E4DA)",
        statusClass: "status-on",
        statusLabel: "进行中",
        days: 21,
        cat: "作息",
        joined: true,
        people: [
            { bg: "var(--jade)", text: "林" },
            { bg: "var(--gold)", text: "苏" },
            { bg: "var(--pink)", text: "阿" },
            { bg: "var(--ink-muted)", text: "+3k" },
        ],
    },
    {
        name: "14 天每日八杯水",
        emoji: "💧",
        bg: "linear-gradient(135deg, var(--moon-soft), #C8D5E5)",
        statusClass: "status-on",
        statusLabel: "进行中",
        days: 14,
        cat: "饮食",
        joined: true,
        people: [
            { bg: "var(--moon)", text: "禾" },
            { bg: "var(--jade)", text: "陈" },
            { bg: "var(--ink-muted)", text: "+1.8k" },
        ],
    },
    {
        name: "21 天冥想静心挑战",
        emoji: "🧘",
        bg: "linear-gradient(135deg, var(--pink-soft), #F5D5DD)",
        statusClass: "status-on",
        statusLabel: "进行中",
        days: 21,
        cat: "情志",
        joined: false,
        people: [
            { bg: "var(--pink)", text: "阿" },
            { bg: "var(--gold)", text: "墨" },
            { bg: "var(--ink-muted)", text: "+960" },
        ],
    },
    {
        name: "7 天清淡饮食挑战",
        emoji: "🥗",
        bg: "linear-gradient(135deg, var(--gold-soft), #EFD9A8)",
        statusClass: "status-soon",
        statusLabel: "即将开始",
        days: 7,
        cat: "饮食",
        joined: false,
        people: [
            { bg: "var(--jade)", text: "林" },
            { bg: "var(--ink-muted)", text: "+540" },
        ],
    },
    {
        name: "30 天八段锦晨练",
        emoji: "☯️",
        bg: "linear-gradient(135deg, #E6E0EF, #F0E5F4)",
        statusClass: "status-soon",
        statusLabel: "即将开始",
        days: 30,
        cat: "运动",
        joined: false,
        people: [
            { bg: "var(--moon)", text: "陈" },
            { bg: "var(--ink-muted)", text: "+720" },
        ],
    },
    {
        name: "21 天戒糖养颜挑战",
        emoji: "🍃",
        bg: "linear-gradient(135deg, var(--cinnabar-soft), #F5D0C8)",
        statusClass: "status-soon",
        statusLabel: "即将开始",
        days: 21,
        cat: "饮食",
        joined: false,
        people: [
            { bg: "var(--pink)", text: "苏" },
            { bg: "var(--ink-muted)", text: "+1.2k" },
        ],
    },
];

const challengeRanks = [
    {
        name: "林清欢",
        sub: "连续达标 8 天 · 全勤",
        rate: "100%",
        avatarBg: "linear-gradient(135deg, var(--gold), var(--cinnabar))",
        avatarText: "林",
    },
    {
        name: "陈一山",
        sub: "达标 7 天 · 缺卡 1 天",
        rate: "96%",
        avatarBg: "linear-gradient(135deg, var(--jade), var(--moon))",
        avatarText: "陈",
    },
    {
        name: "我 · 嘉欣",
        sub: "达标 7 天 · 平均 22:48 入睡",
        rate: "92%",
        avatarBg: "linear-gradient(135deg, var(--jade), var(--jade-light))",
        avatarText: "JX",
        isMe: true,
    },
    {
        name: "禾木",
        sub: "达标 6 天",
        rate: "81%",
        avatarBg: "linear-gradient(135deg, var(--pink), var(--gold))",
        avatarText: "禾",
    },
];

const badges = [
    { name: "早起达人", emoji: "🌅", cond: "连续 7 天早起打卡", desc: "早起打卡 7 天", unlocked: true },
    { name: "饮水标兵", emoji: "💧", cond: "累计 10 天足量饮水", desc: "饮水达标 10 天", unlocked: true },
    { name: "冥想新星", emoji: "🧘", cond: "累计 5 次冥想打卡", desc: "冥想 5 次", unlocked: true },
    { name: "早睡先锋", emoji: "🌙", cond: "累计 7 天早睡打卡", desc: "早睡 7 天", unlocked: true },
    { name: "经验作者", emoji: "✍️", cond: "发布 5 篇经验", desc: "发布 5 篇", unlocked: true },
    { name: "恒心百日", emoji: "🏔️", cond: "连续打卡 100 天", desc: "百日坚持", unlocked: false },
    { name: "食养专家", emoji: "🥗", cond: "发布 10 篇食疗经验", desc: "食疗 10 篇", unlocked: false },
    { name: "社区之星", emoji: "👑", cond: "登榜周榜前三", desc: "荣登前三", unlocked: false },
    { name: "节气使者", emoji: "🌾", cond: "完成 6 个节气打卡", desc: "6 节气打卡", unlocked: false },
    { name: "八段锦传人", emoji: "☯️", cond: "累计 21 天运动打卡", desc: "运动 21 天", unlocked: false },
    { name: "情志涵养", emoji: "🌸", cond: "累计 5 次冥想静心", desc: "静心 5 次", unlocked: false },
    { name: "养生大师", emoji: "🏅", cond: "全部徽章集齐解锁", desc: "终极徽章", unlocked: false },
];

const showBadgeModal = ref(false);
const unlockedBadgeCount = computed(() => badges.filter(b => b.unlocked).length);

// 初始化加载（必须在所有 ref 声明之后）
loadDrafts();
loadPublished();
loadCommunityPosts();
loadFollowed();
loadNotifications();
</script>

<style scoped lang="scss">
.page-wrapper {
    min-height: 100vh;
}

.hub {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 40px 80px;
}

// Hero
.hero {
    background: linear-gradient(135deg, #e4efe8 0%, #edf4ef 60%, #fdfaf3 100%);
    border: 1px solid var(--jade-soft);
    border-radius: 20px;
    padding: 36px 40px;
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
}
.hero::before {
    content: "氣";
    position: absolute;
    right: 36px;
    top: 50%;
    transform: translateY(-50%);
    font-family: "STKaiti", serif;
    font-size: 200px;
    color: var(--jade);
    opacity: 0.1;
    line-height: 1;
    font-weight: 900;
}
.hero-label {
    font-size: 13px;
    color: var(--jade);
    letter-spacing: 3px;
    margin-bottom: 8px;
}
.hero h1 {
    font-family: "STKaiti", serif;
    font-size: 38px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 8px;
}
.hero-sub {
    color: var(--ink-muted);
    font-size: 15px;
    max-width: 600px;
}
.hero-meta {
    display: flex;
    gap: 24px;
    margin-top: 24px;
    font-size: 13px;
    flex-wrap: wrap;
}
.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ink-muted);
}
.meta-item strong {
    color: var(--jade);
    font-weight: 600;
}

// Tabs
.tabs {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    margin-bottom: 28px;
    background: var(--paper);
    border-radius: 14px;
    padding: 8px;
    box-shadow: var(--shadow);
}
.tab {
    background: transparent;
    border: none;
    padding: 14px 8px;
    cursor: pointer;
    border-radius: 10px;
    font-family: inherit;
    color: var(--ink-muted);
    font-size: 13px;
    transition: all 0.25s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}
.tab-icon {
    font-size: 22px;
}
.tab:hover {
    background: var(--cream);
    color: var(--ink);
}
.tab.active {
    background: linear-gradient(135deg, var(--jade), var(--jade-light));
    color: white;
    box-shadow: 0 4px 12px rgba(92, 131, 116, 0.3);
}

// Panels
.panel {
    animation: fadeIn 0.4s ease;
}
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

// Common
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
.grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}
.grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}
.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}

// Buttons
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
    display: inline-flex;
    align-items: center;
    gap: 6px;
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
    color: var(--jade);
    transform: translateY(-1px);
}
.btn-gold {
    background: linear-gradient(135deg, var(--gold), var(--gold-deep));
}
.btn-gold:hover {
    background: var(--gold-deep);
}
.btn-sm {
    padding: 6px 14px;
    font-size: 12px;
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
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    cursor: default;
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(60, 50, 30, 0.1);
    }
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

.pick-chip {
    padding: 6px 14px;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 14px;
    font-size: 12px;
    color: var(--ink-muted);
    cursor: pointer;
    transition: all 0.2s;
}
.pick-chip:hover {
    border-color: var(--jade);
    color: var(--jade);
}
.pick-chip.active {
    background: var(--jade-soft);
    border-color: var(--jade);
    color: var(--jade);
    font-weight: 500;
}
.chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

// Check-in Ring
.checkin-hero {
    background: linear-gradient(135deg, #ddebe3 0%, #edf4ef 100%);
    border-radius: 16px;
    padding: 28px;
    text-align: center;
    position: relative;
    overflow: hidden;
}
.checkin-hero::after {
    content: "🌿";
    position: absolute;
    right: -12px;
    bottom: -16px;
    font-size: 130px;
    opacity: 0.14;
}
.ring-wrap {
    width: 184px;
    height: 184px;
    margin: 4px auto 14px;
    position: relative;
}
.ring-wrap svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}
.ring-wrap circle {
    fill: none;
    stroke-width: 12;
}
.ring-bg {
    stroke: rgba(92, 131, 116, 0.15);
}
.ring-fg {
    stroke: var(--jade);
    stroke-linecap: round;
    stroke-dasharray: 502;
    transition: stroke-dashoffset 0.6s ease;
}
.ring-num {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.ring-num .big {
    font-family: "STKaiti", serif;
    font-size: 46px;
    font-weight: 600;
    color: var(--jade);
    line-height: 1;
}
.ring-num .big span {
    font-size: 22px;
    color: var(--ink-muted);
}
.ring-num .label {
    font-size: 12px;
    color: var(--ink-muted);
    letter-spacing: 2px;
    margin-top: 4px;
}
.streak-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--gold-soft);
    color: #9a7b33;
    padding: 6px 16px;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 600;
}

// Week Strip
.week-strip {
    display: flex;
    justify-content: space-between;
    margin: 6px 0 4px;
}
.day-dot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}
.day-dot .d-label {
    font-size: 11px;
    color: var(--ink-muted);
}
.day-dot .d-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    background: var(--cream);
    border: 1px solid var(--line);
    color: var(--ink-muted);
}
.day-dot.done .d-circle {
    background: var(--jade);
    color: white;
    border-color: var(--jade);
}
.day-dot.today .d-circle {
    box-shadow: 0 0 0 2px var(--gold);
    font-weight: 600;
}
.day-dot.miss .d-circle {
    background: var(--cinnabar-soft);
    color: var(--cinnabar);
    border-color: var(--cinnabar-soft);
}

// Check Items
.check-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
}
.check-item {
    background: var(--paper-warm);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s;
}
.check-item:hover {
    box-shadow: var(--shadow);
}
.check-item .ci-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    flex-shrink: 0;
    background: var(--jade-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
}
.check-item .ci-info {
    flex: 1;
    min-width: 0;
}
.check-item .ci-name {
    font-size: 14px;
    font-weight: 600;
}
.check-item .ci-meta {
    font-size: 12px;
    color: var(--ink-muted);
    margin-top: 2px;
}
.check-box {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 2px solid var(--line);
    background: var(--paper);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: transparent;
    font-size: 15px;
    transition: all 0.2s;
}
.check-box:hover {
    border-color: var(--jade);
}
.check-item.done {
    background: var(--jade-soft);
    border-color: var(--jade-light);
}
.check-item.done .check-box {
    background: var(--jade);
    border-color: var(--jade);
    color: white;
}
.check-item.done .ci-icon {
    background: var(--paper);
}
.ci-del {
    background: none;
    border: none;
    font-size: 11px;
    color: var(--ink-muted);
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.15s;
    flex-shrink: 0;
    &:hover { color: var(--cinnabar); background: var(--cinnabar-soft); }
}
.check-item:hover .ci-del { opacity: 1; }
.checkin-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 32px 0;
    margin-top: 14px;
    border: 2px dashed var(--line);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { border-color: var(--jade); background: var(--jade-soft); }
}
.checkin-empty-icon { font-size: 32px; opacity: 0.5; }
.checkin-empty-text { font-size: 13px; color: var(--ink-muted); }
.checkin-dialog { width: min(560px, 92vw) !important; }
.checkin-emoji-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 8px 0 6px;
}
.checkin-emoji-btn {
    width: 36px;
    height: 36px;
    border: 1.5px solid var(--line);
    border-radius: 8px;
    background: var(--cream);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    &:hover { border-color: var(--jade); background: var(--jade-soft); }
    &.active { border-color: var(--jade); background: var(--jade-soft); }
}
.checkin-icon-input, .checkin-text-input {
    width: 100%;
    height: 38px;
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 0 12px;
    font-size: 14px;
    font-family: inherit;
    color: var(--ink);
    outline: none;
    box-sizing: border-box;
    margin-top: 6px;
    &:focus { border-color: var(--jade); }
}

// Heatmap
.heatmap {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
}
.hm-head {
    text-align: center;
    font-size: 10px;
    color: var(--ink-muted);
    padding-bottom: 2px;
}
.hm-cell {
    aspect-ratio: 1;
    border-radius: 5px;
    background: var(--cream);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}
.hm-cell-day {
    font-size: 11px;
    color: var(--ink-muted);
    font-weight: 500;
    line-height: 1;
}
.hm-cell.lv1 .hm-cell-day,
.hm-cell.lv2 .hm-cell-day,
.hm-cell.lv3 .hm-cell-day,
.hm-cell.lv4 .hm-cell-day {
    color: var(--paper);
    font-weight: 600;
}
.hm-cell.lv1 {
    background: #d6e5dc;
}
.hm-cell.lv2 {
    background: #a9caba;
}
.hm-cell.lv3 {
    background: #7baa96;
}
.hm-cell.lv4 {
    background: var(--jade);
}
.hm-cell.muted { background: transparent; }
.hm-cell.hm-today {
    outline: 2px solid var(--jade);
    outline-offset: 1px;
}
.hm-cell.hm-today .hm-cell-day {
    color: var(--jade);
    font-weight: 700;
    font-size: 13px;
}
.hm-cell.hm-clickable { cursor: pointer; &:hover { filter: brightness(0.88); } }
.cal-nav-btn {
    width: 24px;
    height: 24px;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--cream);
    cursor: pointer;
    font-size: 14px;
    color: var(--ink-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover { background: var(--jade-soft); color: var(--jade); }
}
.cal-month-select {
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--paper);
    padding: 3px 6px;
    font-size: 13px;
    font-family: inherit;
    color: var(--ink);
    cursor: pointer;
    outline: none;
    &:focus { border-color: var(--jade); }
}
.history-dialog { width: min(440px, 92vw) !important; }
.history-content { display: flex; flex-direction: column; gap: 14px; }
.history-mood {
    font-size: 14px;
    color: var(--ink-muted);
    strong { color: var(--ink); font-size: 15px; }
}
.history-items { display: flex; flex-direction: column; gap: 8px; }
.history-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 10px;
    background: var(--cream);
    border: 1px solid var(--line);
    &.done { background: var(--jade-soft); border-color: rgba(92,131,116,0.25); }
}
.history-item-icon { font-size: 20px; flex-shrink: 0; }
.history-item-name { font-size: 14px; font-weight: 600; color: var(--ink); flex: 1; }
.history-item-meta { font-size: 12px; color: var(--ink-muted); }
.history-item-status {
    font-size: 15px;
    font-weight: 700;
    color: var(--jade);
    flex-shrink: 0;
    .history-item:not(.done) & { color: var(--ink-muted); }
}
.history-summary {
    text-align: center;
    font-size: 13px;
    color: var(--jade);
    font-weight: 600;
    padding: 8px;
    background: var(--jade-soft);
    border-radius: 8px;
}
.hm-legend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 12px;
    justify-content: flex-end;
}
.hm-legend .hm-cell {
    width: 12px;
    aspect-ratio: 1;
}

// Milestone
.milestone-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px dashed var(--line);
}
.milestone-row:last-child {
    border-bottom: none;
}
.ms-medal {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    background: var(--gold-soft);
}
.ms-medal.locked {
    background: var(--cream);
    filter: grayscale(1);
    opacity: 0.5;
}
.ms-info {
    flex: 1;
}
.ms-name {
    font-size: 14px;
    font-weight: 600;
}
.ms-desc {
    font-size: 12px;
    color: var(--ink-muted);
}
.progress-track {
    height: 6px;
    background: var(--cream);
    border-radius: 3px;
    margin-top: 6px;
    overflow: hidden;
}
.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--gold), var(--gold-soft));
    border-radius: 3px;
}

// Meal Cards
.meal-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 36px 0;
    cursor: pointer;
    border-radius: 12px;
    border: 2px dashed var(--line);
    margin-top: 14px;
    transition: all 0.2s;
    &:hover { border-color: var(--jade); background: var(--jade-soft); }
}
.meal-empty-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--cream);
    border: 2px dashed var(--line);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: var(--ink-muted);
}
.meal-empty-text { font-size: 13px; color: var(--ink-muted); }
.meal-card {
    background: var(--paper-warm);
    border: 1px solid var(--line);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s;
}
.meal-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}
.meal-add-card { cursor: pointer; opacity: 0.7; &:hover { opacity: 1; } }
.meal-img {
    height: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    position: relative;
}
.meal-add-img {
    background: var(--cream);
    font-size: 30px;
    color: var(--ink-muted);
    border-bottom: 1px dashed var(--line);
}
.mt-morning-tea   { background: linear-gradient(135deg, #fef3c7, #fde68a); }
.mt-breakfast     { background: linear-gradient(135deg, var(--gold-soft), #efd9a8); }
.mt-lunch         { background: linear-gradient(135deg, var(--jade-soft), #d5e4da); }
.mt-tea-break     { background: linear-gradient(135deg, #ede9fe, #c4b5fd44); }
.mt-dinner        { background: linear-gradient(135deg, var(--moon-soft), #c8d5e5); }
.mt-light-dinner  { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
.mt-supper        { background: linear-gradient(135deg, #1e293b22, #334155aa); }
.mt-snack         { background: linear-gradient(135deg, #fee2e2, #fecaca); }
.meal-del {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(0,0,0,0.18);
    border: none;
    color: white;
    font-size: 11px;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    &:hover { background: var(--cinnabar); }
}
.meal-card:hover .meal-del { display: flex; }
.meal-body { padding: 12px 14px; }
.meal-name {
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.meal-foods {
    font-size: 12px;
    color: var(--ink-muted);
    margin-top: 6px;
    line-height: 1.5;
}
.meal-cal {
    font-size: 12px;
    color: var(--gold);
    font-weight: 600;
    margin-top: 8px;
}
.meal-type-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-top: 6px;
}
.meal-type-btn {
    padding: 8px 4px;
    border: 1.5px solid var(--line);
    border-radius: 8px;
    background: var(--cream);
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
    &:hover { border-color: var(--jade); background: var(--jade-soft); }
    &.active { border-color: var(--jade); background: var(--jade-soft); color: var(--jade); font-weight: 600; }
}
.meal-dialog {
    width: min(700px, 92vw) !important;
    max-height: 88vh;
    overflow-y: auto;
}
.meal-dialog-header {
    font-size: 18px !important;
    padding: 18px 22px !important;
}
.meal-dialog-body {
    padding: 20px 22px !important;
    gap: 20px !important;
}
.meal-dialog-btn {
    height: 44px !important;
    font-size: 15px !important;
    padding: 0 28px !important;
}
.meal-field { display: flex; flex-direction: column; gap: 8px; }
.meal-field-label {
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
}
.meal-type-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
}
.meal-type-btn {
    padding: 12px 8px;
    border: 1.5px solid var(--line);
    border-radius: 10px;
    background: var(--cream);
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;
    &:hover { border-color: var(--jade); background: var(--jade-soft); }
    &.active { border-color: var(--jade); background: var(--jade-soft); color: var(--jade); font-weight: 600; }
}
.meal-img-upload {
    width: 100%;
    height: 140px;
    border: 2px dashed var(--line);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
    background: var(--cream);
    &:hover { border-color: var(--jade); background: var(--jade-soft); }
    &.has-img { border-style: solid; border-color: var(--line); }
}
.meal-img-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
.meal-img-icon { font-size: 28px; }
.meal-img-hint { font-size: 13px; color: var(--ink-muted); }
.meal-img-remove {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0,0,0,0.45);
    border: none;
    color: white;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover { background: var(--cinnabar); }
}
.meal-textarea {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 9px;
    padding: 12px 14px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
    color: var(--ink);
    &:focus { border-color: var(--jade); }
}
.meal-cal-input {
    flex: 1;
    height: 42px;
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 0 12px;
    font-size: 15px;
    font-family: inherit;
    color: var(--ink);
    outline: none;
    &:focus { border-color: var(--jade); }
}
.meal-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

// Water
.water-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin: 8px 0 12px;
}
.water-setting-btn {
    background: none;
    border: 1px solid var(--line);
    border-radius: 6px;
    width: 24px;
    height: 24px;
    font-size: 13px;
    cursor: pointer;
    color: var(--ink-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    &:hover { background: var(--cream); color: var(--ink); }
}
.wset-mask {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(44, 54, 57, 0.4);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
}
.wset-dialog {
    width: 320px;
    background: var(--paper, #fffef9);
    border-radius: 16px;
    box-shadow: 0 20px 50px rgba(44, 54, 57, 0.18);
    border: 1px solid rgba(232, 223, 208, 0.9);
    overflow: hidden;
}
.wset-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    font-family: "STKaiti", serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--ink);
    border-bottom: 1px solid var(--line);
    button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        color: var(--ink-muted);
        &:hover { color: var(--ink); }
    }
}
.wset-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13px;
        color: var(--ink-muted);
    }
}
.wset-input-row {
    display: flex;
    align-items: center;
    gap: 8px;
    input {
        flex: 1;
        height: 38px;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 0 12px;
        font-size: 14px;
        font-family: inherit;
        color: var(--ink);
        outline: none;
        &:focus { border-color: var(--jade); }
    }
}
.wset-unit {
    font-size: 13px;
    color: var(--ink-muted);
    white-space: nowrap;
}
.wset-preview {
    padding: 10px 12px;
    background: var(--jade-soft, #eef5ec);
    border-radius: 8px;
    font-size: 13px;
    color: var(--jade);
    strong { font-size: 16px; }
}
.wset-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 14px 20px;
    border-top: 1px solid var(--line);
}
.wset-btn {
    padding: 8px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    border: 1px solid var(--line);
    background: white;
    color: var(--ink);
    transition: all 0.15s;
    &:hover { border-color: var(--jade); }
    &.primary {
        background: var(--jade);
        color: white;
        border-color: var(--jade);
        &:hover { background: #4a6f60; }
    }
}
.poster-modal {
    background: var(--paper, #fffef9);
    border-radius: 18px;
    box-shadow: 0 24px 64px rgba(44,54,57,0.22);
    border: 1px solid rgba(232,223,208,0.9);
    width: min(520px, 92vw);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.poster-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--line);
    font-family: "STKaiti", serif;
    font-size: 17px;
    font-weight: 600;
    color: var(--ink);
    button {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        color: var(--ink-muted);
        &:hover { color: var(--ink); }
    }
}
.poster-canvas-wrap {
    padding: 16px;
    background: #f0ebe2;
    display: flex;
    justify-content: center;
    overflow-y: auto;
    max-height: 70vh;
}
.poster-canvas {
    width: 100%;
    max-width: 480px;
    border-radius: 12px;
    box-shadow: 0 8px 28px rgba(44,54,57,0.15);
    display: block;
}
.poster-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 14px 20px;
    border-top: 1px solid var(--line);
}
.wset-modal-enter-active, .wset-modal-leave-active {
    transition: opacity 0.18s ease;
    .wset-dialog { transition: transform 0.18s ease, opacity 0.18s ease; }
}
.wset-modal-enter-from, .wset-modal-leave-to {
    opacity: 0;
    .wset-dialog { transform: translateY(10px) scale(0.97); opacity: 0; }
}
.water-cup {
    aspect-ratio: 1;
    border-radius: 14px;
    border: 2.5px solid var(--line);
    background: var(--cream);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    cursor: pointer;
    transition: all 0.2s;
    opacity: 0.45;
}
.water-cup.filled {
    background: var(--moon-soft);
    border-color: var(--moon);
    border-width: 2.5px;
    opacity: 1;
}
.water-cup:hover { transform: scale(1.05); }
.wc-emoji { font-size: clamp(30px, 4.5vw, 46px); line-height: 1; }
.wc-label { font-size: 10px; color: var(--ink-muted); line-height: 1; letter-spacing: 0.2px; }
.water-cup.filled .wc-label { color: var(--moon); font-weight: 600; }
.wset-inline-btn {
    font-size: 12px;
    color: var(--jade);
    background: var(--jade-soft, #eef5ec);
    border: 1px solid rgba(92,131,116,0.3);
    border-radius: 5px;
    padding: 2px 8px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    &:hover { background: var(--jade); color: white; }
}

// Nutrition
.nutri-ring {
    display: flex;
    align-items: center;
    gap: 18px;
}
.cal-circle {
    width: min(260px, 100%);
    aspect-ratio: 1;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.4s ease;
}
.cal-over-tip {
    margin-top: 10px;
    text-align: center;
    padding: 8px 14px;
    background: var(--cinnabar-soft, #fae5e0);
    border: 1px solid rgba(179, 60, 44, 0.2);
    border-radius: 8px;
    font-size: 13px;
    color: var(--cinnabar);
    strong { font-size: 15px; }
}
.cal-circle .inner {
    width: 76%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--paper);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.cal-circle .inner .num {
    font-family: "STKaiti", serif;
    font-size: clamp(24px, 4vw, 38px);
    font-weight: 600;
    color: var(--ink);
}
.cal-circle .inner .unit {
    font-size: clamp(11px, 1.2vw, 15px);
    color: var(--ink-muted);
    margin-top: 2px;
}
.nutri-bar {
    margin-bottom: 12px;
}
.nutri-bar .nb-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--ink-muted);
    margin-bottom: 4px;
}
.nutri-track {
    height: 8px;
    background: var(--cream);
    border-radius: 4px;
    overflow: hidden;
}
.nutri-fill {
    height: 100%;
    border-radius: 4px;
}

// Chart
.mini-chart {
    height: 150px;
    margin-top: 8px;
}
.chart-svg {
    width: 100%;
    height: 100%;
}
.chart-grid {
    stroke: var(--line);
    stroke-width: 1;
}
.chart-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 8px;
}

// Compose
// Sharing — 顶部栏 / 分类网格 / 弹窗
.share-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.exp-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-top: 16px;
}
.exp-cat-card {
    background: var(--paper-warm);
    border: 1px solid var(--line);
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
}
.exp-cat-emoji {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
}
.exp-cat-info { padding: 12px 14px; }
.exp-cat-name { font-size: 14px; font-weight: 600; color: var(--ink); }
.exp-cat-count { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }
.exp-cat-preview {
    font-size: 12px;
    color: var(--ink-light);
    margin-top: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &.muted { color: var(--ink-muted); font-style: italic; }
}
/* 系统色彩统一的分类卡背景 */
.exp-bg-食疗药膳 { background: linear-gradient(135deg, var(--gold-soft, #fef3c7), #fde68a); }
.exp-bg-作息调理 { background: linear-gradient(135deg, var(--moon-soft, #dbeafe), #bfdbfe); }
.exp-bg-运动养生 { background: linear-gradient(135deg, var(--jade-soft, #d1fae5), #a7f3d0); }
.exp-bg-情志疏导 { background: linear-gradient(135deg, var(--pink-soft, #fce7f3), #fbcfe8); }
.exp-bg-节气养生 { background: linear-gradient(135deg, #c7d2fe, #a5b4fc); }
.exp-bg-中医妙招 { background: linear-gradient(135deg, var(--cinnabar-soft, #fae5e0), #f5c8c0); }

// 分类弹窗 — 贴吧/小红书风格
.cat-dialog { width: min(680px, 94vw) !important; }
.cat-dialog-head {
    position: relative;
    padding: 22px 24px;
    color: white;
    .cat-dialog-title { font-family: "STKaiti", serif; font-size: 22px; font-weight: 700; }
    .cat-dialog-sub { font-size: 13px; opacity: 0.75; margin-top: 4px; }
}
.cat-dialog-close {
    position: absolute; top: 16px; right: 18px;
    width: 30px; height: 30px; border-radius: 50%;
    background: rgba(255,255,255,0.2); border: none; color: white; font-size: 15px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
    &:hover { background: rgba(255,255,255,0.35); }
}
.cat-head-食疗药膳 { background: linear-gradient(135deg, #f59e0b, #d97706); }
.cat-head-作息调理 { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.cat-head-运动养生 { background: linear-gradient(135deg, var(--jade), #3d6b5e); }
.cat-head-情志疏导 { background: linear-gradient(135deg, #ec4899, #db2777); }
.cat-head-节气养生 { background: linear-gradient(135deg, #6366f1, #4f46e5); }
.cat-head-中医妙招 { background: linear-gradient(135deg, var(--cinnabar), #9c3325); }

.cat-dialog-body { padding: 0 !important; max-height: 76vh; overflow-y: auto; background: #f5f3ef; }
.cat-dialog-search {
    position: sticky; top: 0; z-index: 5;
    padding: 12px 16px;
    background: #f5f3ef;
    border-bottom: 1px solid #e8e3dc;
}
.cat-dialog-search-input {
    width: 100%; height: 40px;
    border: 1.5px solid #e0d9cf;
    border-radius: 20px;
    padding: 0 18px;
    font-size: 14px;
    font-family: inherit;
    color: var(--ink);
    background: white;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s;
    &:focus { border-color: var(--jade); }
    &::placeholder { color: var(--ink-muted); }
}
.cat-post-card {
    background: white;
    margin: 0 0 10px;
    padding: 20px 24px;
    &:last-child { margin-bottom: 0; }
}
.cat-post-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.cat-post-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--cream); display: flex;
    align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
}
.cat-post-user { flex: 1; min-width: 0; }
.cat-post-name { font-size: 15px; font-weight: 600; color: var(--ink); }
.cat-post-date { font-size: 12px; color: var(--ink-muted); margin-top: 2px; }
.cat-post-del {
    background: none; border: 1px solid var(--line); border-radius: 6px;
    padding: 3px 12px; font-size: 12px; color: var(--cinnabar);
    cursor: pointer; font-family: inherit;
    &:hover { background: var(--cinnabar-soft); }
}
.cat-post-body { margin-bottom: 14px; }
.cat-post-text {
    font-size: 15px; color: var(--ink); line-height: 1.7;
    word-break: break-word; margin-bottom: 12px;
}
.cat-post-imgs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.cat-post-img {
    width: 90px; height: 90px; border-radius: 8px;
    object-fit: cover; border: 1px solid var(--line);
}
.cat-post-video { margin-bottom: 12px; video { width:100%; max-height:300px; border-radius:10px; display:block; } }

// 互动按钮栏
.cat-post-bar {
    display: flex; gap: 6px; padding-top: 14px; border-top: 1px solid #eeeae3;
}
.cpb-btn {
    flex: 1; height: 38px;
    display: flex; align-items: center; justify-content: center; gap: 4px;
    border: none; border-radius: 10px;
    background: #f5f3ef; font-size: 14px; font-family: inherit;
    color: var(--ink-muted); cursor: pointer; transition: all 0.18s;
    &:hover { background: var(--jade-soft); color: var(--jade); }
    &.active { background: var(--jade-soft); color: var(--jade); font-weight: 600; }
}

// 评论区 — 小红书风格
.cat-post-comment-area {
    margin-top: 14px; padding-top: 14px; border-top: 1px solid #eeeae3;
}
.cpc-title { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 12px; }
.cpc-list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 14px; }
.cpc-item { display: flex; gap: 10px; }
.cpc-avatar {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--jade-soft), var(--jade));
    color: white; font-size: 12px; font-weight: 600;
    display: flex; align-items: center; justify-content: center;
    &.sm { width: 24px; height: 24px; font-size: 10px; }
}
.cpc-body { flex: 1; min-width: 0; }
.cpc-header { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.cpc-name { font-size: 12px; font-weight: 600; color: var(--jade); }
.cpc-date { font-size: 11px; color: var(--ink-muted); }
.cpc-content { font-size: 13px; color: var(--ink); line-height: 1.5; word-break: break-word; }
.cpc-at { color: var(--jade); font-weight: 600; margin-right: 2px; }
.cpc-footer { margin-top: 4px; }
.cpc-reply {
    background: none; border: none; font-size: 11px;
    color: var(--ink-muted); cursor: pointer; padding: 0;
    &:hover { color: var(--jade); }
}
.cpc-children {
    margin-top: 10px; padding-left: 0;
    display: flex; flex-direction: column; gap: 10px;
}
.cpc-child-item {
    display: flex; gap: 8px;
}
.cpc-input-row {
    display: flex; gap: 10px; align-items: flex-start;
    padding-top: 12px; border-top: 1px solid #eeeae3;
}
.cpc-input-avatar {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--gold), var(--cinnabar));
    color: white; font-size: 12px; font-weight: 600;
    display: flex; align-items: center; justify-content: center;
}
.cpc-input-wrap {
    flex: 1; display: flex; gap: 8px;
}
.cpc-input {
    flex: 1; height: 36px; border: 1px solid var(--line);
    border-radius: 18px; padding: 0 14px; font-size: 13px;
    font-family: inherit; outline: none; color: var(--ink);
    background: #f5f3ef;
    &:focus { border-color: var(--jade); background: white; }
}
.cpc-send {
    height: 36px; padding: 0 16px; border: none; border-radius: 18px;
    background: var(--jade); color: white; font-size: 13px;
    font-family: inherit; cursor: pointer; font-weight: 600;
    &:hover { background: #3d6b5e; }
}
.cat-post-comment-input-row {
    display: flex; gap: 8px;
}
.cat-post-comment-input {
    flex: 1; height: 36px; border: 1px solid var(--line);
    border-radius: 8px; padding: 0 12px; font-size: 13px;
    font-family: inherit; outline: none; color: var(--ink);
    &:focus { border-color: var(--jade); }
}
.cat-post-comment-send {
    height: 36px; padding: 0 16px; border: none; border-radius: 8px;
    background: var(--jade); color: white; font-size: 13px;
    font-family: inherit; cursor: pointer; font-weight: 600;
    &:hover { background: #3d6b5e; }
}

// 发布弹窗
.share-dialog { width: min(600px, 92vw) !important; }
.share-dialog-header { font-size: 17px !important; }
.share-dialog-body {
    padding: 20px 22px !important;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.share-textarea {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 14px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
    color: var(--ink);
    &:focus { border-color: var(--jade); }
}
.share-imgs-upload { display: flex; flex-wrap: wrap; gap: 8px; }
.share-img-thumb {
    width: 80px; height: 80px; border-radius: 8px; overflow: hidden; position: relative; border: 1px solid var(--line);
    img { width:100%; height:100%; object-fit: cover; display:block; }
}
.share-img-del {
    position: absolute; top: 4px; right: 4px;
    width: 20px; height: 20px; border-radius: 50%;
    background: rgba(0,0,0,0.5); border: none; color: white; font-size: 10px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    &:hover { background: var(--cinnabar); }
}
.share-img-add {
    width: 80px; height: 80px; border-radius: 8px;
    border: 1.5px dashed var(--line); background: var(--cream);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; color: var(--ink-muted); cursor: pointer; transition: all 0.15s;
    &:hover { border-color: var(--jade); color: var(--jade); }
}
.share-video-preview { position: relative; video { width:100%; max-height:200px; border-radius:8px; display:block; } }
.share-video-add {
    padding: 12px 16px; border: 1.5px dashed var(--line); border-radius: 8px;
    background: var(--cream); text-align: center; font-size: 14px;
    color: var(--ink-muted); cursor: pointer; transition: all 0.15s;
    &:hover { border-color: var(--jade); color: var(--jade); }
}
.share-cat-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.share-cat-label { font-size: 13px; color: var(--ink-muted); font-weight: 600; }
.share-card-top { display: flex; gap: 12px; }
.share-card-text {
    font-size: 14px; color: var(--ink); line-height: 1.6; word-break: break-word;
}
.share-card-imgs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.share-card-img {
    width: 72px; height: 72px; border-radius: 8px; object-fit: cover; border: 1px solid var(--line);
}
.share-card-meta { display:flex; align-items:center; justify-content:space-between; margin-top:10px; font-size:12px; color:var(--ink-muted); }
.share-card-author { font-weight:600; color:var(--jade); }
.share-card-time { font-size:11px; }
.share-card-stats { display:flex; gap:14px; margin-top:8px; padding-top:8px; border-top:1px solid var(--line); font-size:12px; color:var(--ink-muted); }

// 草稿箱
.drafts-panel { margin-top: 14px; }
.drafts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--line);
}
.drafts-empty { text-align: center; padding: 32px; color: var(--ink-muted); font-size: 13px; }
.draft-item {
    background: var(--paper-warm);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
}
.draft-body { flex: 1; min-width: 0; }
.draft-text {
    font-size: 13px;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.draft-meta { font-size: 11px; color: var(--ink-muted); margin-top: 4px; }
.draft-actions { display: flex; gap: 6px; flex-shrink: 0; }

// Community Posts — 朋友圈 / QQ空间风格
.post {
    padding: 20px 0;
    border-bottom: 1px solid #f0ede8;
    &:last-child { border-bottom: none; padding-bottom: 0; }
    &:first-child { padding-top: 0; }
}
.post-head {
    display: flex;
    align-items: center;
    gap: 12px;
    .avatar {
        width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        color: white; font-size: 16px; font-weight: 600;
        box-shadow: 0 3px 10px rgba(0,0,0,0.12);
    }
    .ph-info { flex: 1; min-width: 0; }
    .ph-name {
        font-size: 15px; font-weight: 600; color: var(--ink);
        display: flex; align-items: center; gap: 8px;
    }
    .ph-meta { font-size: 12px; color: var(--ink-muted); margin-top: 2px; }
}
.level-tag {
    font-size: 11px; padding: 2px 8px; border-radius: 10px;
    background: var(--gold-soft); color: #9a7b33; font-weight: 600;
}
.post-text {
    font-size: 15px; color: var(--ink); margin: 14px 0; line-height: 1.8;
    word-break: break-word;
}
.post-imgs { display: flex; gap: 8px; margin: 10px 0; }
.post-img { width: 110px; height: 110px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 38px; }
.post-imgs-comm {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 6px;
    margin: 12px 0;
}
.post-img-comm {
    width: 100%; aspect-ratio: 1; border-radius: 10px;
    object-fit: cover; display: block; border: 1px solid var(--line);
}
.post-checkin {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px; background: var(--jade-soft); border-radius: 12px;
    margin: 12px 0;
    .pc-ring {
        width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
        background: var(--jade); color: white;
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; font-weight: 600;
    }
}
.post-tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
.topic-tag { font-size: 12px; color: var(--jade); }

// 互动按钮栏 — 放大
.post-actions {
    display: flex; gap: 4px; margin-top: 14px; padding-top: 14px;
    border-top: 1px solid #f2efe9;
}
.post-actions .pa {
    flex: 1; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    cursor: pointer; transition: all 0.18s;
    font-size: 14px; color: var(--ink-muted);
    background: #faf7f2; border: none; font-family: inherit;
    &:hover { background: var(--jade-soft); color: var(--jade); }
    &.liked { background: var(--cinnabar-soft); color: var(--cinnabar); font-weight: 600; }
    &.stared { background: #fef3c7; color: #b45309; font-weight: 600; }
    &.active { background: var(--jade-soft); color: var(--jade); font-weight: 600; }
}

// 评论区
.comment-area {
    margin-top: 14px; padding: 16px 18px;
    background: #faf8f5; border-radius: 14px; border: 1px solid #f0ede8;
}
.comment {
    display: flex; gap: 10px; padding: 10px 0;
    border-bottom: 1px solid #f0ede8;
    &:last-child { border-bottom: none; }
    .mini-avatar {
        width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
        font-size: 12px; background: linear-gradient(135deg, var(--jade), var(--moon));
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: 600;
    }
    .c-body { flex: 1; font-size: 14px; }
    .c-name { color: var(--jade); font-weight: 600; }
    .c-meta { font-size: 11px; color: var(--ink-muted); margin-top: 3px; }
}
.comment-input {
    display: flex; gap: 10px; align-items: center; margin-top: 12px;
    background: white; border: 1px solid var(--line); border-radius: 24px;
    padding: 9px 16px;
    input {
        flex: 1; border: none; outline: none; background: transparent;
        font-family: inherit; font-size: 14px;
    }
}

// Side List
.side-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px dashed var(--line);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    cursor: default;
    &:hover {
        transform: translateX(4px);
        .group-icon { transform: scale(1.12); }
    }
}
.side-row:last-child {
    border-bottom: none;
}
.group-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    flex-shrink: 0;
    transition: transform 0.25s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}
.side-info {
    flex: 1;
    min-width: 0;
}
.side-name {
    font-size: 13px;
    font-weight: 600;
}
.side-meta {
    font-size: 11px;
    color: var(--ink-muted);
}

// Challenge
.challenge-hero {
    background: linear-gradient(135deg, #b33c2c 0%, #c9685a 100%);
    color: white;
    border-radius: 16px;
    padding: 28px 32px;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 40px rgba(179, 60, 44, 0.25);
    }
}
.challenge-hero::after {
    content: "🏆";
    position: absolute;
    right: 20px;
    bottom: -10px;
    font-size: 130px;
    opacity: 0.18;
}
.challenge-hero .ch-tag {
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    margin-bottom: 10px;
}
.challenge-hero h2 {
    font-family: "STKaiti", serif;
    font-size: 30px;
    font-weight: 600;
}
.ch-stats {
    display: flex;
    gap: 30px;
    margin: 16px 0;
}
.ch-stats .cs {
    font-size: 13px;
    opacity: 0.9;
}
.ch-stats .cs strong {
    display: block;
    font-family: "STKaiti", serif;
    font-size: 22px;
}
.ch-progress-track {
    height: 8px;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 4px;
    overflow: hidden;
    max-width: 460px;
}
.ch-progress-fill {
    height: 100%;
    background: white;
    border-radius: 4px;
}

.challenge-card {
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 14px;
    overflow: hidden;
    transition: all 0.2s;
}
.challenge-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
}
.cc-cover {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 46px;
    position: relative;
}
.cc-cover .cc-status {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 10px;
    font-weight: 600;
}
.status-on {
    background: var(--jade);
    color: white;
}
.status-soon {
    background: var(--gold-soft);
    color: #9a7b33;
}
.cc-body {
    padding: 14px;
}
.cc-name {
    font-size: 15px;
    font-weight: 600;
}
.cc-meta {
    font-size: 12px;
    color: var(--ink-muted);
    margin-top: 6px;
    display: flex;
    gap: 12px;
}
.cc-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
}
.cc-people {
    display: flex;
    align-items: center;
}
.cc-people .pp {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-left: -8px;
    border: 2px solid var(--paper);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    color: white;
}
.cc-people .pp:first-child {
    margin-left: 0;
}

// Leaderboard
.rank-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 10px;
    border-bottom: 1px dashed var(--line);
    border-radius: 8px;
    transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
    cursor: default;
    &:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 16px rgba(60, 50, 30, 0.08);
        background: var(--paper-warm);
    }
}
.rank-row:last-child {
    border-bottom: none;
}
.rank-num {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    background: var(--cream);
    color: var(--ink-muted);
}
.rank-num.top1 {
    background: #f3d98b;
    color: #8a6a18;
}
.rank-num.top2 {
    background: #dcdcdc;
    color: #5c5c5c;
}
.rank-num.top3 {
    background: #e8c9a8;
    color: #8a5a2b;
}
.rank-row .avatar {
    width: 34px;
    height: 34px;
    font-size: 12px;
}
.rank-info {
    flex: 1;
}
.rank-name {
    font-size: 13px;
    font-weight: 600;
}
.rank-sub {
    font-size: 11px;
    color: var(--ink-muted);
}
.rank-val {
    font-family: "STKaiti", serif;
    font-size: 17px;
    font-weight: 600;
    color: var(--gold);
}
.rank-row.me {
    background: var(--jade-soft);
    border-radius: 10px;
    padding: 11px 10px;
    border-bottom: none;
}

// Badges
.badge-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}
.badge-item {
    text-align: center;
    padding: 14px 6px;
    border-radius: 12px;
    background: var(--paper-warm);
    border: 1px solid var(--line);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    cursor: default;
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(60, 50, 30, 0.12);
    }
}
.badge-item .b-emoji {
    font-size: 32px;
}
.badge-item.locked .b-emoji {
    filter: grayscale(1);
    opacity: 0.4;
}
.badge-item .b-name {
    font-size: 12px;
    font-weight: 600;
    margin-top: 6px;
}
.badge-item .b-cond {
    font-size: 10px;
    color: var(--ink-muted);
    margin-top: 2px;
}
.badge-all-dialog { width: min(560px, 92vw) !important; }
.badge-all-body {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 20px;
}
.badge-all-item {
    text-align: center;
    padding: 16px 10px;
    border-radius: 12px;
    background: var(--paper-warm);
    border: 1px solid var(--line);
    position: relative;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    cursor: default;
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 18px rgba(60,50,30,0.1);
    }
    &.locked { opacity: 0.5; }
    .b-emoji { font-size: 36px; }
    .b-name { font-size: 13px; font-weight: 600; margin-top: 8px; }
    .b-cond { font-size: 11px; color: var(--ink-muted); margin-top: 3px; }
}
.b-unlocked-tag {
    position: absolute; top: 6px; right: 6px;
    background: var(--jade); color: white; font-size: 9px;
    padding: 2px 6px; border-radius: 4px; font-weight: 600;
}

// Toast
.toast {
    position: fixed;
    left: 50%;
    bottom: 40px;
    transform: translateX(-50%) translateY(20px);
    background: var(--ink);
    color: white;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 13px;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s;
    z-index: 9999;
}
.toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

// Avatar base
.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 13px;
    flex-shrink: 0;
}

@media (max-width: 920px) {
    .hub {
        padding: 20px 16px 60px;
    }
    .tabs {
        grid-template-columns: repeat(3, 1fr);
    }
    .grid-2,
    .grid-3,
    .grid-4 {
        grid-template-columns: 1fr;
    }
    .check-grid {
        grid-template-columns: 1fr 1fr;
    }
    .badge-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    .hero::before {
        display: none;
    }
}

// 通知系统
.notif-row { cursor: pointer; position: relative; }
.notif-row.unread { background: rgba(92,131,116,0.04); border-radius: 8px; padding-left: 8px; }
.notif-dot {
    position: absolute; top: 2px; right: 2px;
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--cinnabar); border: 2px solid white;
}

// 新版三分栏通知
.notif-total-badge {
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--cinnabar); color: white;
    font-size: 11px; font-weight: 700;
    min-width: 18px; height: 18px; border-radius: 9px;
    padding: 0 5px; margin-left: 4px;
}
.notif-type-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    margin-top: 4px;
}
.notif-type-item {
    display: flex; flex-direction: column; align-items: center;
    gap: 6px; padding: 16px 8px;
    background: var(--paper-warm); border: 1px solid var(--line);
    border-radius: 12px; cursor: pointer; transition: all 0.2s;
    &:hover { background: var(--jade-soft); border-color: var(--jade); transform: translateY(-2px); box-shadow: 0 4px 14px rgba(92,131,116,0.15); }
}
.ntg-icon-wrap {
    position: relative; width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
}
.ntg-emoji { font-size: 28px; line-height: 1; }
.ntg-badge {
    position: absolute; top: -4px; right: -6px;
    min-width: 16px; height: 16px; padding: 0 4px;
    background: var(--cinnabar); color: white;
    font-size: 10px; font-weight: 700; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    border: 1.5px solid white;
}
.ntg-label { font-size: 13px; font-weight: 600; color: var(--ink); }
.ntg-count { font-size: 11px; color: var(--ink-muted); }

// 通知面板 tab 栏
.notif-panel-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 12px !important;
    padding-bottom: 0 !important;
}
.notif-panel-tabs {
    display: flex; gap: 4px; width: 100%;
    border-bottom: 1px solid var(--line);
    padding-bottom: 0;
}
.npt-btn {
    flex: 1; padding: 10px 6px; border: none; background: transparent;
    font-family: inherit; font-size: 13px; color: var(--ink-muted);
    cursor: pointer; border-bottom: 2px solid transparent;
    margin-bottom: -1px; transition: all 0.18s;
    display: flex; align-items: center; justify-content: center; gap: 4px;
    &:hover { color: var(--jade); }
    &.active { color: var(--jade); font-weight: 600; border-bottom-color: var(--jade); }
}
.npt-badge {
    min-width: 14px; height: 14px; padding: 0 3px;
    background: var(--cinnabar); color: white;
    font-size: 9px; font-weight: 700; border-radius: 7px;
    display: inline-flex; align-items: center; justify-content: center;
}
.notif-dialog { width: min(480px, 92vw) !important; }
.notif-dialog-body {
    padding: 0 !important;
    max-height: 70vh;
    overflow-y: auto;
    background: #faf8f5;
}
.notif-dialog-item {
    display: flex; align-items: center; gap: 12px;
    padding: 16px 20px; border-bottom: 1px solid #f0ede8;
    cursor: pointer; transition: background 0.15s;
    &:hover { background: white; }
    &.unread { background: rgba(92,131,116,0.06); }
    &:last-child { border-bottom: none; }
}
.notif-dialog-avatar {
    width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
}
.notif-dialog-content { flex: 1; min-width: 0; }
.notif-dialog-title { font-size: 14px; font-weight: 600; color: var(--ink); }
.notif-dialog-text {
    font-size: 13px; color: var(--ink-muted); margin-top: 3px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.notif-dialog-time { font-size: 11px; color: var(--ink-muted); margin-top: 3px; }
.notif-dialog-unread-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--cinnabar); flex-shrink: 0;
}
.notif-detail-dialog { width: min(420px, 92vw) !important; }
</style>
