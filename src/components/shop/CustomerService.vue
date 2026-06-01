<template>
    <div class="panel">
        <div class="service-layout">
            <div class="agent-list">
                <div class="agent-list-title">颐养阁官方店铺 · 客服</div>
                <div
                    v-for="a in agents"
                    :key="a.id"
                    class="agent-item"
                    :class="{ active: currentAgent === a.id }"
                    @click="$emit('update:currentAgent', a.id)"
                >
                    <div class="agent-avatar">
                        {{ a.avatar }}
                        <div class="agent-status-dot" :class="a.status"></div>
                    </div>
                    <div class="agent-info">
                        <div class="agent-name">{{ a.name }}</div>
                        <div class="agent-tag">
                            {{ a.tag }} ·
                            {{
                                a.status === "online"
                                    ? "在线"
                                    : a.status === "busy"
                                      ? "忙碌"
                                      : "离线"
                            }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="chat-panel">
                <div class="chat-header">
                    <div class="agent-avatar sm">
                        {{ currentAgentObj.avatar }}
                    </div>
                    <div>
                        <h4>客服 · {{ currentAgentObj.name }}</h4>
                        <div class="desc">
                            {{ currentAgentObj.desc }}
                        </div>
                    </div>
                    <div class="chat-header-tip">
                        为保护用户体验，同一客服不会同时回复多用户
                    </div>
                </div>
                <div class="chat-body" ref="chatBodyRef">
                    <div
                        v-for="(m, mi) in currentChatHistory"
                        :key="mi"
                        class="chat-msg"
                        :class="m.from"
                    >
                        <div v-if="m.from === 'agent'" class="agent-avatar xs">
                            {{ currentAgentObj.avatar }}
                        </div>
                        <div v-else class="user-avatar xs">我</div>
                        <div>
                            <div class="chat-meta">
                                {{
                                    m.from === "agent"
                                        ? currentAgentObj.name
                                        : "我"
                                }}
                                · {{ m.time }}
                            </div>
                            <div
                                v-if="m.productCard"
                                class="product-card-msg"
                                @click="$emit('viewProduct', m.productCard.id)"
                            >
                                <div class="pcm-body">
                                    <span class="pcm-icon">{{ m.productCard.icon }}</span>
                                    <div class="pcm-info">
                                        <div class="pcm-name">{{ m.productCard.name }}</div>
                                        <div class="pcm-price">¥{{ m.productCard.price }}</div>
                                    </div>
                                </div>
                                <div class="pcm-footer">查看商品详情 ›</div>
                            </div>
                            <div v-else class="chat-bubble">{{ m.text }}</div>
                        </div>
                    </div>
                </div>

                <!-- 商品上下文卡片：从商品页跳入时显示 -->
                <Transition name="context-card">
                    <div
                        v-if="props.contextProduct"
                        class="context-card"
                    >
                        <button
                            class="context-card-close"
                            @click.stop="$emit('dismissContextProduct')"
                        >✕</button>
                        <div
                            class="context-card-body"
                            @click="$emit('viewProduct', props.contextProduct.id)"
                        >
                            <span class="context-card-icon">{{ props.contextProduct.icon }}</span>
                            <div class="context-card-info">
                                <div class="context-card-name">{{ props.contextProduct.name }}</div>
                                <div class="context-card-price">¥{{ props.contextProduct.price }}</div>
                            </div>
                        </div>
                        <button
                            class="context-card-send"
                            @click="$emit('sendProductCard', props.contextProduct)"
                        >
                            发送给客服
                        </button>
                    </div>
                </Transition>

                <div class="chat-input-row">
                    <input
                        :value="chatInput"
                        @input="
                            $emit(
                                'update:chatInput',
                                ($event.target as HTMLInputElement).value,
                            )
                        "
                        placeholder="输入您想咨询的问题，按 Enter 发送..."
                        @keydown.enter="$emit('sendChat')"
                    />
                    <button class="btn btn-jade" @click="$emit('sendChat')">
                        发送
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";

interface Agent {
    id: string;
    name: string;
    desc: string;
    tag: string;
    status: string;
    avatar: string;
}

interface ChatMsg {
    from: "agent" | "me";
    text: string;
    time: string;
    productCard?: {
        id: string;
        name: string;
        price: number;
        icon: string;
        desc: string;
    };
}

interface ContextProduct {
    id: string;
    name: string;
    price: number;
    icon: string;
    desc: string;
}

interface Props {
    agents: Agent[];
    currentAgent: string;
    chatHistory: Record<string, ChatMsg[]>;
    chatInput: string;
    contextProduct?: ContextProduct | null;
}

const props = defineProps<Props>();

defineEmits<{
    "update:currentAgent": [value: string];
    "update:chatInput": [value: string];
    sendChat: [];
    sendProductCard: [product: ContextProduct];
    viewProduct: [productId: string];
    dismissContextProduct: [];
}>();

const chatBodyRef = ref<HTMLElement | null>(null);

const currentAgentObj = computed(
    () => props.agents.find((a) => a.id === props.currentAgent)!,
);

const currentChatHistory = computed(
    () => props.chatHistory[props.currentAgent] || [],
);

// 监听聊天历史变化，自动滚动到底部
watch(
    () => props.chatHistory[props.currentAgent],
    async () => {
        await nextTick();
        scrollChatToBottom();
    },
    { deep: true },
);

function scrollChatToBottom() {
    if (chatBodyRef.value)
        chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
}
</script>

<style scoped lang="scss">
.panel {
    // panel 样式由父组件提供
}

.service-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 16px;
    min-height: 540px;
}

.agent-list {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4);
    padding: 12px;
    overflow: auto;
}

.agent-list-title {
    font-family: "STKaiti", serif;
    font-size: 14px;
    color: var(--ink-muted);
    padding: 4px 10px 10px;
    border-bottom: 1px solid var(--line);
}

.agent-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    margin-top: 4px;
    transition: background 0.2s;

    &:hover {
        background: var(--cream);
    }

    &.active {
        background: var(--jade-soft);
    }
}

.agent-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--cinnabar));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: "STKaiti", serif;
    font-weight: 600;
    font-size: 14px;
    position: relative;
    flex-shrink: 0;

    &.sm {
        width: 40px;
        height: 40px;
        font-size: 14px;
    }

    &.xs {
        width: 32px;
        height: 32px;
        font-size: 11px;
    }
}

.agent-status-dot {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--jade-light);
    border: 2px solid var(--paper);

    &.busy {
        background: var(--gold);
    }

    &.off {
        background: var(--ink-muted);
    }
}

.agent-info {
    flex: 1;
    min-width: 0;
}

.agent-name {
    font-weight: 600;
    font-size: 13px;
    color: var(--ink);
}

.agent-tag {
    font-size: 11px;
    color: var(--ink-muted);
    margin-top: 1px;
}

.chat-panel {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.4);
    display: flex;
    flex-direction: column;
    position: relative;
}

.chat-header {
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    gap: 10px;

    h4 {
        font-family: "STKaiti", serif;
        font-size: 16px;
        color: var(--ink);
    }

    .desc {
        font-size: 12px;
        color: var(--ink-muted);
    }
}

.chat-header-tip {
    margin-left: auto;
    font-size: 11px;
    color: var(--ink-muted);
}

.chat-body {
    flex: 1;
    padding: 16px 18px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: var(--paper-warm);
    min-height: 380px;
}

.chat-msg {
    display: flex;
    gap: 10px;
    max-width: 75%;

    &.me {
        align-self: flex-end;
        flex-direction: row-reverse;
    }
}

.chat-bubble {
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.5;

    .agent & {
        background: white;
        border: 1px solid var(--line);
        border-top-left-radius: 4px;
        color: var(--ink);
    }

    .me & {
        background: var(--jade);
        color: white;
        border-top-right-radius: 4px;
    }
}

.chat-meta {
    font-size: 11px;
    color: var(--ink-muted);
    padding: 0 6px;
}

.user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--jade));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 11px;
    flex-shrink: 0;

    &.xs {
        width: 32px;
        height: 32px;
    }
}

.chat-input-row {
    padding: 12px 14px;
    border-top: 1px solid var(--line);
    display: flex;
    gap: 10px;

    input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid var(--line);
        border-radius: 10px;
        font-family: inherit;
        font-size: 13px;
        outline: none;
        color: var(--ink);

        &:focus {
            border-color: var(--jade);
        }
    }
}

.btn {
    border: none;
    padding: 10px 22px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &-jade {
        background: var(--jade);
        color: white;

        &:hover {
            background: #4a6f60;
        }
    }
}

/* ── 浮动商品上下文卡片 ── */
.context-card {
    position: absolute;
    right: 16px;
    bottom: 62px;
    width: 210px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(60, 50, 30, 0.14);
    border: 1px solid var(--line);
    overflow: hidden;
    z-index: 20;
}

.context-card-close {
    position: absolute;
    top: 6px;
    right: 8px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: var(--ink-muted);
    line-height: 1;
    padding: 2px 4px;
    border-radius: 4px;

    &:hover {
        background: var(--cream);
        color: var(--ink);
    }
}

.context-card-body {
    padding: 12px 12px 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    border-bottom: 1px solid var(--line);
    padding-right: 28px;

    &:hover {
        background: var(--cream);
    }
}

.context-card-icon {
    font-size: 28px;
    flex-shrink: 0;
}

.context-card-info {
    flex: 1;
    min-width: 0;
}

.context-card-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.context-card-price {
    font-size: 15px;
    color: var(--cinnabar);
    font-weight: 700;
    margin-top: 3px;
}

.context-card-send {
    display: block;
    width: 100%;
    padding: 9px;
    background: var(--jade);
    color: white;
    border: none;
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    text-align: center;
    transition: background 0.15s;

    &:hover {
        background: #4a6f60;
    }
}

/* 浮动卡片进出动画 */
.context-card-enter-active,
.context-card-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.context-card-enter-from,
.context-card-leave-to {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
}

/* ── 聊天记录中的商品卡片气泡 ── */
.product-card-msg {
    background: white;
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    width: 190px;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:hover {
        border-color: var(--jade);
        box-shadow: 0 2px 10px rgba(92, 131, 116, 0.15);
    }
}

.pcm-body {
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.pcm-icon {
    font-size: 26px;
    flex-shrink: 0;
}

.pcm-info {
    flex: 1;
    min-width: 0;
}

.pcm-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pcm-price {
    font-size: 14px;
    color: var(--cinnabar);
    font-weight: 700;
    margin-top: 2px;
}

.pcm-footer {
    padding: 5px 10px;
    background: var(--cream);
    font-size: 11px;
    color: var(--jade);
    border-top: 1px solid var(--line);
}
</style>
