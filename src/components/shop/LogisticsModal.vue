<template>
    <div
        class="modal-mask"
        :class="{ show: modelValue }"
        @click.self="$emit('update:modelValue', false)"
    >
        <div class="modal" style="max-width: 620px" v-if="logisticsDetail">
            <div class="modal-header">
                <h3>物流详情</h3>
                <button
                    class="modal-close"
                    @click="$emit('update:modelValue', false)"
                >
                    ×
                </button>
            </div>
            <div class="logistics-detail">
                <div class="logistics-detail-header">
                    <div class="carrier">
                        <span style="font-size: 24px">🚛</span>
                        <span>{{
                            logisticsDetail.logisticsCompany || "物流公司"
                        }}</span>
                    </div>
                    <div class="track-no">
                        运单号：<span>{{
                            logisticsDetail.trackingNo || "暂无"
                        }}</span>
                    </div>
                    <div class="track-status">
                        当前状态：<span
                            :class="
                                getLogisticsStatusClass(logisticsDetail.status)
                            "
                            >{{
                                getLogisticsStatusText(logisticsDetail.status)
                            }}</span
                        >
                    </div>
                </div>

                <!-- 物流轨迹时间线 -->
                <div
                    class="logistics-detail-steps"
                    v-if="
                        logisticsDetail.details &&
                        logisticsDetail.details.length > 0
                    "
                >
                    <div
                        v-for="(detail, index) in logisticsDetail.details"
                        :key="detail.time"
                        class="logistics-detail-step"
                        :class="{ done: index === 0 }"
                    >
                        <div class="step-content">
                            {{ detail.description }}
                        </div>
                        <div class="step-location" v-if="detail.location">
                            {{ detail.location }}
                        </div>
                        <span class="step-time">{{
                            formatLogisticsTime(detail.time)
                        }}</span>
                    </div>
                </div>

                <!-- 空状态 -->
                <div v-else class="empty-logistics">
                    <div style="font-size: 48px; margin-bottom: 12px">📦</div>
                    <p>暂无物流轨迹信息</p>
                    <p class="hint">订单尚未发货或物流信息未更新</p>
                </div>

                <div
                    class="logistics-detail-foot"
                    v-if="logisticsDetail.currentLocation"
                >
                    <span>当前位置：</span>
                    <span style="color: var(--cinnabar); font-weight: 600">{{
                        logisticsDetail.currentLocation
                    }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    modelValue: boolean;
    logisticsDetail: any;
}

defineProps<Props>();

defineEmits<{
    "update:modelValue": [value: boolean];
}>();

function getLogisticsStatusText(status: number): string {
    const statusMap: Record<number, string> = {
        0: "待发货",
        1: "已发货",
        2: "运输中",
        3: "已签收",
    };
    return statusMap[status] || "未知";
}

function getLogisticsStatusClass(status: number): string {
    const classMap: Record<number, string> = {
        0: "status-pending",
        1: "status-shipped",
        2: "status-transit",
        3: "status-signed",
    };
    return classMap[status] || "";
}

function formatLogisticsTime(timeStr: string): string {
    if (!timeStr) return "";
    try {
        const date = new Date(timeStr);
        return date.toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    } catch (e) {
        return timeStr;
    }
}
</script>

<style scoped lang="scss">
.modal-mask {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(44, 54, 57, 0.5);
    backdrop-filter: blur(3px);
    z-index: 1000;
    justify-content: center;
    align-items: center;
    padding: 20px;

    &.show {
        display: flex;
    }
}

.modal {
    background: white;
    border-radius: 14px;
    max-width: 620px;
    width: 100%;
    box-shadow: var(--shadow-lg);
    max-height: 90vh;
    overflow: auto;
}

.modal-header {
    padding: 16px 22px;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        font-family: "STKaiti", serif;
        font-size: 18px;
        color: var(--ink);
    }
}

.modal-close {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 22px;
    color: var(--ink-muted);

    &:hover {
        color: var(--ink);
    }
}

.logistics-detail-header {
    padding: 20px 24px;
    background: var(--moon-soft);
    border-bottom: 1px solid #dce3ef;

    .carrier {
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 4px;
    }

    .track-no {
        font-size: 12px;
        color: var(--ink-muted);
        font-family: monospace;
    }
}

.track-status {
    margin-top: 8px;
    font-size: 14px;

    span {
        font-weight: 600;
        padding: 4px 12px;
        border-radius: 12px;
        display: inline-block;

        &.status-pending {
            background: #fef3c7;
            color: #92400e;
        }

        &.status-shipped {
            background: #dbeafe;
            color: #1e40af;
        }

        &.status-transit {
            background: #e0e7ff;
            color: #3730a3;
        }

        &.status-signed {
            background: #d1fae5;
            color: #065f46;
        }
    }
}

.logistics-detail-steps {
    padding: 0 24px 20px;
}

.logistics-detail-step {
    position: relative;
    padding: 14px 0 14px 28px;
    border-left: 2px solid var(--line);
    font-size: 14px;
    color: var(--ink);

    &:last-child {
        border-left-color: transparent;
    }

    &::before {
        content: "";
        position: absolute;
        left: -8px;
        top: 16px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--paper);
        border: 2px solid var(--line);
    }

    &.done::before {
        background: var(--jade);
        border-color: var(--jade);
    }

    &.active {
        color: var(--cinnabar);
        font-weight: 600;

        &::before {
            background: var(--cinnabar);
            border-color: var(--cinnabar);
            box-shadow: 0 0 0 5px rgba(179, 60, 44, 0.12);
        }
    }

    .step-content {
        margin-bottom: 4px;
        line-height: 1.6;
    }

    .step-location {
        font-size: 13px;
        color: var(--ink-muted);
        margin-bottom: 4px;
    }

    .step-time {
        color: var(--ink-muted);
        font-size: 12px;
        display: block;
        margin-top: 3px;
    }
}

.logistics-detail-foot {
    padding: 14px 24px;
    background: var(--paper-warm);
    border-top: 1px solid var(--line);
    font-size: 13px;
    color: var(--ink-muted);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.empty-logistics {
    text-align: center;
    padding: 48px 24px;
    color: var(--ink-muted);

    p {
        margin: 8px 0;
        font-size: 14px;
    }

    .hint {
        font-size: 12px;
        opacity: 0.7;
    }
}
</style>
