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
                <div class="compose-card">
                    <div class="row" style="margin-bottom: 12px">
                        <div
                            class="font-serif"
                            style="font-size: 20px; font-weight: 600"
                        >
                            分享你的养生心得
                        </div>
                        <span class="pick-chip">📋 草稿箱 (2)</span>
                    </div>
                    <div class="compose-box">
                        <textarea
                            placeholder="记录今天的养生体会、食疗方子、作息变化…… 与同道好友一起进步"
                        ></textarea>
                    </div>
                    <div class="upload-row">
                        <div class="upload-thumb">
                            🍵<span class="x" @click="toast('已移除')">×</span>
                        </div>
                        <div class="upload-box">
                            <span class="plus">＋</span>添加图片
                        </div>
                        <div class="upload-box">
                            <span class="plus">🎬</span>添加视频
                        </div>
                    </div>
                    <div
                        style="
                            margin-top: 12px;
                            font-size: 13px;
                            color: var(--ink-muted);
                        "
                    >
                        选择分类：
                    </div>
                    <div class="chip-row" style="margin-top: 8px">
                        <span
                            v-for="cat in shareCategories"
                            :key="cat"
                            class="pick-chip"
                            :class="{ active: selectedCategory === cat }"
                            @click="selectedCategory = cat"
                            >{{ cat }}</span
                        >
                    </div>
                    <div class="compose-foot">
                        <div class="compose-tools">
                            <span># 添加话题</span>
                            <span>🔗 关联打卡</span>
                            <span>📍 添加位置</span>
                        </div>
                        <div>
                            <button class="btn btn-ghost btn-sm">存草稿</button>
                            <button
                                class="btn btn-sm"
                                style="margin-left: 6px"
                                @click="toast('✓ 已发布')"
                            >
                                发布经验
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card" style="margin-top: 20px">
                    <div class="row">
                        <div class="card-title" style="margin: 0">
                            <span class="dot"></span>经验广场
                        </div>
                        <div class="chip-row">
                            <span
                                v-for="s in shareSorts"
                                :key="s"
                                class="pick-chip"
                                :class="{ active: selectedShareSort === s }"
                                @click="selectedShareSort = s"
                                >{{ s }}</span
                            >
                        </div>
                    </div>
                    <div class="grid-3">
                        <div
                            v-for="exp in experiences"
                            :key="exp.title"
                            class="exp-card"
                        >
                            <div class="exp-cover" :class="exp.coverClass">
                                <span class="exp-cat">{{ exp.cat }}</span
                                >{{ exp.emoji }}
                            </div>
                            <div class="exp-body">
                                <div class="exp-title">{{ exp.title }}</div>
                                <div class="exp-author">
                                    <span class="mini-avatar">{{
                                        exp.authorInitial
                                    }}</span
                                    >{{ exp.author }}
                                </div>
                                <div class="exp-stats">
                                    <span>👍 {{ exp.likes }}</span
                                    ><span>💬 {{ exp.comments }}</span
                                    ><span>⭐ {{ exp.stars }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
                            <div
                                class="tip-row"
                                style="border-left-color: var(--gold)"
                            >
                                <span class="icon">📝</span>
                                <div class="text">
                                    <strong style="font-size: 20px">18</strong>
                                    篇<br /><span
                                        style="
                                            color: var(--ink-muted);
                                            font-size: 12px;
                                        "
                                        >累计发布经验</span
                                    >
                                </div>
                            </div>
                            <div
                                class="tip-row"
                                style="border-left-color: var(--cinnabar)"
                            >
                                <span class="icon">👍</span>
                                <div class="text">
                                    <strong style="font-size: 20px"
                                        >3,240</strong
                                    ><br /><span
                                        style="
                                            color: var(--ink-muted);
                                            font-size: 12px;
                                        "
                                        >累计获赞</span
                                    >
                                </div>
                            </div>
                            <div
                                class="tip-row"
                                style="border-left-color: var(--jade)"
                            >
                                <span class="icon">⭐</span>
                                <div class="text">
                                    <strong style="font-size: 20px"
                                        >1,562</strong
                                    ><br /><span
                                        style="
                                            color: var(--ink-muted);
                                            font-size: 12px;
                                        "
                                        >被收藏次数</span
                                    >
                                </div>
                            </div>
                            <div
                                class="tip-row"
                                style="border-left-color: var(--moon)"
                            >
                                <span class="icon">🏅</span>
                                <div class="text">
                                    <strong style="font-size: 20px">2</strong>
                                    篇<br /><span
                                        style="
                                            color: var(--ink-muted);
                                            font-size: 12px;
                                        "
                                        >入选社区精华</span
                                    >
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 14px">
                            <button
                                class="btn btn-ghost btn-sm"
                                style="flex: 1"
                            >
                                我的发布
                            </button>
                            <button
                                class="btn btn-ghost btn-sm"
                                style="flex: 1"
                            >
                                我的收藏
                            </button>
                            <button
                                class="btn btn-ghost btn-sm"
                                style="flex: 1"
                            >
                                草稿箱
                            </button>
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
                                    :class="{
                                        active: selectedFeedFilter === f,
                                    }"
                                    @click="selectedFeedFilter = f"
                                    >{{ f }}</span
                                >
                            </div>
                        </div>

                        <div v-for="post in posts" :key="post.id" class="post">
                            <div class="post-head">
                                <div
                                    class="avatar"
                                    :style="{ background: post.avatarBg }"
                                >
                                    {{ post.avatarText }}
                                </div>
                                <div class="ph-info">
                                    <div class="ph-name">
                                        {{ post.name }}
                                        <span class="level-tag">{{
                                            post.level
                                        }}</span>
                                    </div>
                                    <div class="ph-meta">{{ post.meta }}</div>
                                </div>
                                <button class="btn btn-ghost btn-sm">
                                    + 关注
                                </button>
                            </div>
                            <div class="post-text">{{ post.text }}</div>
                            <div v-if="post.checkin" class="post-checkin">
                                <div class="pc-ring">{{ post.checkin }}</div>
                                <div style="font-size: 13px">
                                    <div style="font-weight: 600">
                                        {{ post.checkinTitle }}
                                    </div>
                                    <div
                                        style="
                                            color: var(--ink-muted);
                                            font-size: 12px;
                                        "
                                    >
                                        {{ post.checkinDesc }}
                                    </div>
                                </div>
                            </div>
                            <div v-if="post.images" class="post-imgs">
                                <div
                                    v-for="(img, i) in post.images"
                                    :key="i"
                                    class="post-img"
                                    :style="{ background: img.bg }"
                                >
                                    {{ img.emoji }}
                                </div>
                            </div>
                            <div class="post-tags">
                                <span
                                    v-for="tag in post.tags"
                                    :key="tag"
                                    class="topic-tag"
                                    ># {{ tag }}</span
                                >
                            </div>
                            <div class="post-actions">
                                <span
                                    class="pa"
                                    :class="{ liked: post.liked }"
                                    @click="
                                        post.liked = !post.liked;
                                        post.likeCount += post.liked ? 1 : -1;
                                    "
                                    >{{ post.liked ? "❤️" : "🤍" }}
                                    <span>{{ post.likeCount }}</span></span
                                >
                                <span class="pa"
                                    >💬 评论 {{ post.commentCount }}</span
                                >
                                <span class="pa"
                                    >⭐ 收藏 {{ post.starCount }}</span
                                >
                                <span class="pa">📤 转发</span>
                            </div>

                            <div v-if="post.comments" class="comment-area">
                                <div
                                    v-for="c in post.comments"
                                    :key="c.id"
                                    class="comment"
                                >
                                    <div class="mini-avatar">
                                        {{ c.avatar }}
                                    </div>
                                    <div class="c-body">
                                        <span class="c-name">{{ c.name }}</span
                                        >：{{ c.text }}
                                        <div class="c-meta">{{ c.meta }}</div>
                                    </div>
                                </div>
                                <div class="comment-input">
                                    <span>💬</span>
                                    <input
                                        type="text"
                                        placeholder="友善交流，分享你的看法…"
                                    />
                                    <button class="btn btn-sm">发送</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="card">
                            <div class="card-title">
                                <span class="dot"></span>消息通知
                            </div>
                            <div
                                v-for="notif in notifications"
                                :key="notif.text"
                                class="side-row"
                            >
                                <div
                                    class="group-icon"
                                    :style="{ background: notif.bg }"
                                >
                                    {{ notif.emoji }}
                                </div>
                                <div class="side-info">
                                    <div class="side-name">
                                        {{ notif.title }}
                                    </div>
                                    <div class="side-meta">
                                        {{ notif.text }}
                                    </div>
                                </div>
                            </div>
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
                                    >5 / 12</strong
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
                        >
                            查看全部徽章与积分商城 →
                        </button>
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
const todayCheckin = { done: 5, total: 6 };
const streakDays = ref(28);
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
// ─────────────────────────────────────────────────────


const milestones = [
    {
        name: "初心 · 连续 7 天",
        emoji: "🌱",
        desc: "已达成 · 2026/04/22 解锁",
        unlocked: true,
        statusLabel: "已获得",
    },
    {
        name: "坚持 · 连续 21 天",
        emoji: "🌿",
        desc: "已达成 · 2026/05/06 解锁",
        unlocked: true,
        statusLabel: "已获得",
    },
    {
        name: "而立 · 连续 30 天",
        emoji: "🌳",
        desc: "进度 28 / 30 天",
        unlocked: false,
        progress: 93,
        statusLabel: "2 天后",
    },
    {
        name: "恒心 · 连续 100 天",
        emoji: "🏔️",
        desc: "进度 28 / 100 天",
        unlocked: false,
        progress: 28,
        statusLabel: "未解锁",
    },
];

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
const selectedCategory = ref("食疗药膳");
const shareSorts = ["最新", "热门", "精华", "关注"];
const selectedShareSort = ref("最新");

const experiences = [
    {
        title: "坚持早睡 100 天，我的身体发生了这些改变",
        cat: "作息调理",
        emoji: "🌙",
        coverClass: "c2",
        author: "林清欢 · 养生达人",
        authorInitial: "林",
        likes: "1.2k",
        comments: "186",
        stars: "904",
    },
    {
        title: "小满润燥｜雪梨银耳羹的家常做法，三步搞定",
        cat: "食疗药膳",
        emoji: "🍐",
        coverClass: "c1",
        author: "苏小养 · 食养顾问",
        authorInitial: "苏",
        likes: "836",
        comments: "92",
        stars: "521",
    },
    {
        title: "久坐党自救：每天 8 分钟八段锦，腰背轻松多了",
        cat: "运动养生",
        emoji: "🧘",
        coverClass: "c5",
        author: "陈一山 · 习练 3 年",
        authorInitial: "陈",
        likes: "645",
        comments: "73",
        stars: "388",
    },
    {
        title: "情绪差时，我用这 3 个方法快速平复焦虑",
        cat: "情志疏导",
        emoji: "🌸",
        coverClass: "c3",
        author: "阿宁 · 正念爱好者",
        authorInitial: "阿",
        likes: "712",
        comments: "128",
        stars: "466",
    },
    {
        title: "小满养生指南：祛湿健脾，这几样食材别错过",
        cat: "节气养生",
        emoji: "💧",
        coverClass: "c4",
        author: "墨先生 · 中医科普",
        authorInitial: "墨",
        likes: "1.5k",
        comments: "204",
        stars: "1.1k",
    },
    {
        title: "办公室常备养生茶，我喝了一个月的真实感受",
        cat: "中医妙招",
        emoji: "🫖",
        coverClass: "c6",
        author: "禾木 · 打卡 60 天",
        authorInitial: "禾",
        likes: "489",
        comments: "56",
        stars: "302",
    },
];

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
const feedFilters = ["推荐", "关注", "同城"];
const selectedFeedFilter = ref("推荐");

const posts = ref([
    {
        id: 1,
        name: "林清欢",
        level: "Lv.6 养生达人",
        meta: "10 分钟前 · 完成今日打卡",
        avatarBg: "linear-gradient(135deg, var(--gold), var(--cinnabar))",
        avatarText: "林",
        text: "今天又是元气满满的一天！早起看了日出，泡脚加冥想，整个人都松弛下来了～",
        checkin: "6/6",
        checkinTitle: "今日打卡全部完成 · 连续 56 天",
        checkinDesc: "早起 · 喝水 · 运动 · 冥想 · 健康饮食 · 早睡",
        tags: ["早睡早起挑战", "小满养生打卡"],
        liked: false,
        likeCount: 132,
        commentCount: 18,
        starCount: 24,
    },
    {
        id: 2,
        name: "苏小养",
        level: "Lv.5 食养顾问",
        meta: "2 小时前 · 发布了一篇经验",
        avatarBg: "linear-gradient(135deg, var(--jade), var(--moon))",
        avatarText: "苏",
        text: "小满时节湿气重，分享一个祛湿健脾的家常方子 —— 赤小豆薏米山药粥，连喝一周，身体明显轻盈不少。具体做法在图里 👇",
        images: [
            {
                bg: "linear-gradient(135deg, var(--gold-soft), #EFD9A8)",
                emoji: "🥣",
            },
            {
                bg: "linear-gradient(135deg, var(--jade-soft), #D5E4DA)",
                emoji: "🌾",
            },
            {
                bg: "linear-gradient(135deg, var(--pink-soft), #F5D5DD)",
                emoji: "🍠",
            },
        ],
        tags: ["我的食疗方子", "小满养生打卡"],
        liked: true,
        likeCount: 268,
        commentCount: 45,
        starCount: 188,
        comments: [
            {
                id: 1,
                avatar: "禾",
                name: "禾木",
                text: "薏米需要先炒过吗？直接煮会不会偏寒～",
                meta: "1 小时前 · 赞 12 · 回复",
            },
            {
                id: 2,
                avatar: "苏",
                name: "苏小养（作者）",
                text: "对的！薏米炒到微黄再煮，寒性会减弱，更适合脾胃虚的朋友 👍",
                meta: "58 分钟前 · 赞 26 · 回复",
            },
        ],
    },
    {
        id: 3,
        name: "阿宁",
        level: "Lv.3 元气新星",
        meta: "5 小时前 · 来自「正念冥想小组」",
        avatarBg: "linear-gradient(135deg, var(--pink), var(--gold))",
        avatarText: "阿",
        text: "第 21 天冥想打卡完成！从一开始坐不住，到现在能安安静静待 15 分钟，焦虑真的少了很多。谢谢小组里大家的鼓励 🙏",
        tags: ["21天冥想静心挑战"],
        liked: false,
        likeCount: 96,
        commentCount: 31,
        starCount: 12,
    },
]);

const notifications = [
    {
        emoji: "❤️",
        bg: "var(--cinnabar-soft)",
        title: "收到 12 个新的赞",
        text: "林清欢、墨先生 等赞了你",
    },
    {
        emoji: "💬",
        bg: "var(--jade-soft)",
        title: "5 条新评论 / 回复",
        text: "苏小养回复了你的提问",
    },
    {
        emoji: "👥",
        bg: "var(--gold-soft)",
        title: "3 位新粉丝关注了你",
        text: "阿宁、禾木 等",
    },
];

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

const leaderboard = [
    {
        name: "林清欢",
        sub: "打卡 56 天 · 经验 8 篇",
        score: "980",
        avatarBg: "linear-gradient(135deg, var(--gold), var(--cinnabar))",
        avatarText: "林",
    },
    {
        name: "墨先生",
        sub: "科普 12 篇 · 获赞 1.5k",
        score: "872",
        avatarBg: "linear-gradient(135deg, var(--jade), var(--moon))",
        avatarText: "墨",
    },
    {
        name: "苏小养",
        sub: "食疗方子 · 收藏 1.1k",
        score: "765",
        avatarBg: "linear-gradient(135deg, var(--pink), var(--gold))",
        avatarText: "苏",
    },
    {
        name: "我 · 嘉欣",
        sub: "打卡 28 天 · 经验 18 篇",
        score: "412",
        avatarBg: "linear-gradient(135deg, var(--jade), var(--jade-light))",
        avatarText: "JX",
        isMe: true,
    },
];

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
.compose-card {
    background: linear-gradient(135deg, #edf4ef 0%, #fdfaf3 100%);
    border: 1px solid var(--jade-soft);
    border-radius: 16px;
    padding: 24px;
}
.compose-box {
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 16px;
    min-height: 90px;
    font-size: 14px;
    color: var(--ink-muted);
}
.compose-box:focus-within {
    border-color: var(--jade);
}
.compose-box textarea {
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    font-family: inherit;
    font-size: 14px;
    color: var(--ink);
    background: transparent;
    min-height: 70px;
}
.upload-row {
    display: flex;
    gap: 10px;
    margin-top: 12px;
}
.upload-box {
    width: 76px;
    height: 76px;
    border-radius: 10px;
    border: 1.5px dashed var(--line);
    background: var(--paper);
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
    justify-content: center;
    color: var(--ink-muted);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
}
.upload-box:hover {
    border-color: var(--jade);
    color: var(--jade);
}
.upload-box .plus {
    font-size: 22px;
}
.upload-thumb {
    width: 76px;
    height: 76px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    background: linear-gradient(135deg, var(--gold-soft), var(--jade-soft));
    position: relative;
}
.upload-thumb .x {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    background: var(--ink);
    color: white;
    border-radius: 50%;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
.compose-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 14px;
}
.compose-tools {
    display: flex;
    gap: 14px;
    font-size: 13px;
    color: var(--ink-muted);
}
.compose-tools span {
    cursor: pointer;
}
.compose-tools span:hover {
    color: var(--jade);
}

// Experience Cards
.exp-card {
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
}
.exp-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
}
.exp-cover {
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    position: relative;
}
.exp-cover.c1 {
    background: linear-gradient(135deg, var(--gold-soft), #efd9a8);
}
.exp-cover.c2 {
    background: linear-gradient(135deg, var(--jade-soft), #d5e4da);
}
.exp-cover.c3 {
    background: linear-gradient(135deg, var(--pink-soft), #f5d5dd);
}
.exp-cover.c4 {
    background: linear-gradient(135deg, var(--moon-soft), #c8d5e5);
}
.exp-cover.c5 {
    background: linear-gradient(135deg, #e6e0ef, #f0e5f4);
}
.exp-cover.c6 {
    background: linear-gradient(135deg, var(--cinnabar-soft), #f5d0c8);
}
.exp-cover .exp-cat {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.9);
    color: var(--jade);
    font-weight: 600;
}
.exp-body {
    padding: 14px;
}
.exp-title {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.45;
}
.exp-author {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--ink-muted);
}
.exp-author .mini-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 10px;
    background: linear-gradient(135deg, var(--gold), var(--cinnabar));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}
.exp-stats {
    display: flex;
    gap: 14px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--ink-muted);
}

// Community Posts
.post {
    padding: 18px 0;
    border-bottom: 1px solid var(--line);
}
.post:last-child {
    border-bottom: none;
    padding-bottom: 0;
}
.post:first-child {
    padding-top: 0;
}
.post-head {
    display: flex;
    align-items: center;
    gap: 10px;
}
.post-head .avatar {
    width: 42px;
    height: 42px;
    font-size: 14px;
}
.post-head .ph-info {
    flex: 1;
}
.post-head .ph-name {
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
}
.level-tag {
    font-size: 10px;
    padding: 1px 7px;
    border-radius: 8px;
    background: var(--gold-soft);
    color: #9a7b33;
    font-weight: 600;
}
.post-head .ph-meta {
    font-size: 12px;
    color: var(--ink-muted);
}
.post-text {
    font-size: 14px;
    color: var(--ink);
    margin: 10px 0;
    line-height: 1.7;
}
.post-imgs {
    display: flex;
    gap: 8px;
    margin: 10px 0;
}
.post-img {
    width: 110px;
    height: 110px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 38px;
}
.post-checkin {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: var(--jade-soft);
    border-radius: 10px;
    margin: 10px 0;
}
.post-checkin .pc-ring {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--jade);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
}
.post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 8px 0;
}
.topic-tag {
    font-size: 12px;
    color: var(--jade);
}
.post-actions {
    display: flex;
    gap: 22px;
    margin-top: 10px;
    font-size: 13px;
    color: var(--ink-muted);
}
.post-actions .pa {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    transition: color 0.2s;
}
.post-actions .pa:hover {
    color: var(--jade);
}
.post-actions .pa.liked {
    color: var(--cinnabar);
}

// Comments
.comment-area {
    margin-top: 12px;
    padding: 12px 14px;
    background: var(--paper-warm);
    border-radius: 10px;
}
.comment {
    display: flex;
    gap: 8px;
    padding: 8px 0;
}
.comment .mini-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    flex-shrink: 0;
    font-size: 11px;
    background: linear-gradient(135deg, var(--jade), var(--moon));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}
.comment .c-body {
    flex: 1;
    font-size: 13px;
}
.comment .c-name {
    color: var(--jade);
    font-weight: 600;
}
.comment .c-meta {
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 2px;
}
.comment-input {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 8px;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 8px 14px;
}
.comment-input input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 13px;
}

// Side List
.side-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px dashed var(--line);
}
.side-row:last-child {
    border-bottom: none;
}
.group-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    flex-shrink: 0;
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
    padding: 11px 0;
    border-bottom: 1px dashed var(--line);
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
    z-index: 999;
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
</style>
