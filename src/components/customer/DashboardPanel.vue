<template>
    <div class="dashboard-panel">
        <div class="section-title font-serif">今日数据</div>

        <!-- 统计卡片 -->
        <div class="stats-grid">
            <div class="stat-card jade">
                <div class="stat-label">接待中</div>
                <div class="stat-value">
                    3<span style="font-size: 16px; color: var(--ink-muted)"
                        >/5</span
                    >
                </div>
                <div class="stat-foot">当前同时接待 / 上限</div>
            </div>
            <div class="stat-card gold">
                <div class="stat-label">排队中</div>
                <div class="stat-value">2</div>
                <div class="stat-foot">全店排队人数</div>
            </div>
            <div class="stat-card cinnabar">
                <div class="stat-label">今日已接待</div>
                <div class="stat-value">28</div>
                <div class="stat-foot">较昨日 +12%</div>
            </div>
            <div class="stat-card ink">
                <div class="stat-label">今日消息</div>
                <div class="stat-value">412</div>
                <div class="stat-foot">收发总数</div>
            </div>
            <div class="stat-card jade">
                <div class="stat-label">平均首响</div>
                <div class="stat-value">
                    38<span style="font-size: 14px">s</span>
                </div>
                <div class="stat-foot">行业 P50 = 60s</div>
            </div>
        </div>

        <!-- 待办提醒 -->
        <div class="panel-card">
            <div class="panel-card-head">
                <h3>⚠ 待办提醒</h3>
                <span style="font-size: 12px; color: var(--ink-muted)"
                    >超 2 分钟未回复的会话</span
                >
            </div>
            <div class="panel-card-body">
                <div class="todo-item urgent">
                    <span style="font-size: 22px">🔥</span>
                    <div class="todo-text">
                        <strong>清风明月</strong> · 商品咨询【枸杞红枣茶】
                        <div
                            style="
                                font-size: 12px;
                                color: var(--ink-muted);
                                margin-top: 2px;
                            "
                        >
                            "这个孕妇可以喝吗？"
                        </div>
                    </div>
                    <div class="todo-time">已等待 3:12</div>
                    <button class="btn btn-cinnabar">立即回复</button>
                </div>
                <div class="todo-item">
                    <span style="font-size: 22px">📦</span>
                    <div class="todo-text">
                        <strong>云栖之客</strong> · 订单 YYG20260525008
                        <div
                            style="
                                font-size: 12px;
                                color: var(--ink-muted);
                                margin-top: 2px;
                            "
                        >
                            "物流好像停了，能帮我查一下吗"
                        </div>
                    </div>
                    <div class="todo-time" style="color: var(--gold)">1:42</div>
                    <button class="btn">查看</button>
                </div>
            </div>
        </div>

        <!-- 全店客服在线情况 -->
        <div class="panel-card">
            <div class="panel-card-head">
                <h3>📋 全店客服在线情况</h3>
            </div>
            <div class="panel-card-body">
                <table class="queue-table">
                    <thead>
                        <tr>
                            <th>客服</th>
                            <th>职能</th>
                            <th>状态</th>
                            <th>当前接待</th>
                            <th>今日已接待</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>小翠（我）</td>
                            <td><span class="tag tag-jade">售前</span></td>
                            <td>
                                <span class="status-led led-online"></span>
                                接待中
                            </td>
                            <td>3 / 5</td>
                            <td>28</td>
                        </tr>
                        <tr>
                            <td>阿岚</td>
                            <td><span class="tag tag-cinnabar">售后</span></td>
                            <td>
                                <span class="status-led led-online"></span>
                                接待中
                            </td>
                            <td>2 / 5</td>
                            <td>19</td>
                        </tr>
                        <tr>
                            <td>暮雨</td>
                            <td><span class="tag tag-jade">售前</span></td>
                            <td>
                                <span class="status-led led-break"></span> 小休
                            </td>
                            <td>0 / 5</td>
                            <td>15</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Dashboard 面板暂时使用静态数据，后续可接入 API
</script>

<style scoped lang="scss">
.section-title {
    font-family: "STKaiti", serif;
    font-size: 19px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;

    &::before {
        content: "";
        width: 4px;
        height: 18px;
        background: var(--cinnabar);
        border-radius: 2px;
    }
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    margin-bottom: 22px;
}

.stat-card {
    background: var(--paper);
    border-radius: 12px;
    padding: 18px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.5);
    position: relative;
    overflow: hidden;

    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
    }

    &.jade::before {
        background: var(--jade);
    }
    &.gold::before {
        background: var(--gold);
    }
    &.cinnabar::before {
        background: var(--cinnabar);
    }
    &.ink::before {
        background: var(--ink-light);
    }
}

.stat-label {
    font-size: 13px;
    color: var(--ink-muted);
}

.stat-value {
    font-family: "STKaiti", serif;
    font-size: 26px;
    font-weight: 700;
    margin-top: 6px;
}

.stat-foot {
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 6px;
}

.panel-card {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.5);
    margin-bottom: 16px;
}

.panel-card-head {
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        font-family: "STKaiti", serif;
        font-size: 16px;
        font-weight: 600;
    }
}

.panel-card-body {
    padding: 14px 18px;
}

.todo-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--line);
    border-radius: 10px;
    margin-bottom: 10px;
    background: var(--paper-warm);

    &:last-child {
        margin-bottom: 0;
    }

    &.urgent {
        border-color: var(--cinnabar);
        background: var(--cinnabar-soft);
    }
}

.todo-text {
    flex: 1;
    font-size: 14px;
}

.todo-time {
    font-size: 12px;
    color: var(--cinnabar);
    font-weight: 600;
}

.queue-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    thead {
        background: var(--cream);
    }

    th {
        text-align: left;
        font-weight: 500;
        font-size: 13px;
        color: var(--ink-muted);
        padding: 12px 16px;
    }

    td {
        padding: 14px 16px;
        border-top: 1px solid var(--line);
        vertical-align: middle;
    }

    tr:hover td {
        background: rgba(250, 246, 238, 0.5);
    }
}

.tag {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 3px;
    font-family: "STKaiti", serif;

    &.tag-jade {
        background: var(--jade-soft);
        color: var(--jade);
    }

    &.tag-cinnabar {
        background: var(--cinnabar-soft);
        color: var(--cinnabar);
    }
}

.status-led {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;

    &.led-online {
        background: #2eae6f;
        box-shadow: 0 0 6px rgba(46, 174, 111, 0.6);
    }

    &.led-break {
        background: #999;
    }
}

.btn {
    border: 1px solid var(--line);
    background: white;
    padding: 6px 14px;
    font-size: 13px;
    border-radius: 7px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;

    &:hover {
        border-color: var(--ink-muted);
    }

    &.btn-cinnabar {
        border-color: var(--cinnabar);
        color: var(--cinnabar);

        &:hover {
            background: var(--cinnabar);
            color: white;
        }
    }
}
</style>
