<template>
    <div class="settings-panel">
        <div class="section-title">个人设置</div>

        <!-- 账号信息 -->
        <div class="panel-card">
            <div class="panel-card-head">
                <h3>账号信息</h3>
            </div>
            <div class="panel-card-body">
                <div class="setting-row">
                    <div>
                        <div class="setting-label">工号 / 姓名</div>
                        <div class="setting-desc">由管理员分配，不可修改</div>
                    </div>
                    <div class="setting-value serif">
                        {{ agentId }} · {{ agentName }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 自动欢迎语 -->
        <div class="panel-card">
            <div class="panel-card-head">
                <h3>自动欢迎语</h3>
                <button class="head-btn" @click="saveWelcomeMessage">
                    保存
                </button>
            </div>
            <div class="panel-card-body">
                <textarea
                    v-model="welcomeMessage"
                    class="setting-textarea"
                    rows="3"
                    placeholder="请输入自动欢迎语"
                />
            </div>
        </div>

        <!-- 常用语库 -->
        <div class="panel-card">
            <div class="panel-card-head">
                <h3>常用语库</h3>
                <button class="head-btn accent" @click="openAddDialog">
                    + 新增
                </button>
            </div>
            <div class="panel-card-body">
                <div v-if="quickReplies.length === 0" class="empty-tip">
                    暂无常用语，点击「+ 新增」添加
                </div>
                <div v-else class="quick-reply-grid">
                    <div
                        v-for="(reply, index) in quickReplies"
                        :key="index"
                        class="reply-item"
                    >
                        <span class="reply-text">{{ reply }}</span>
                        <button
                            class="reply-del"
                            @click="removeReply(index)"
                            title="删除"
                        >
                            ×
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 新增常用语弹窗 -->
    <Teleport to="body">
        <Transition name="dialog-fade">
            <div
                v-if="showAddDialog"
                class="dialog-mask"
                @click.self="cancelAdd"
            >
                <div class="dialog-box">
                    <div class="dialog-header">
                        <div class="dialog-header-left">
                            <span class="dialog-accent"></span>
                            <span class="dialog-title">新增常用语</span>
                        </div>
                        <button class="dialog-close" @click="cancelAdd">
                            ✕
                        </button>
                    </div>
                    <div class="dialog-body">
                        <label class="dialog-label">常用语内容</label>
                        <textarea
                            ref="dialogTextareaRef"
                            v-model="newReplyText"
                            class="dialog-textarea"
                            placeholder="例如：感谢您的耐心等待，我帮您查询一下～"
                            rows="4"
                            maxlength="120"
                            @keydown.ctrl.enter="confirmAdd"
                        ></textarea>
                        <div class="dialog-footer-meta">
                            <span class="char-count"
                                >{{ newReplyText.length }} / 120</span
                            >
                            <span class="hint-tip">Ctrl + Enter 快速确定</span>
                        </div>
                    </div>
                    <div class="dialog-footer">
                        <button class="dialog-cancel" @click="cancelAdd">
                            取消
                        </button>
                        <button
                            class="dialog-confirm"
                            :disabled="!newReplyText.trim()"
                            @click="confirmAdd"
                        >
                            确定添加
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useUserStore } from "@/store/user";
import { useQuickReplies } from "@/composables/useQuickReplies";
import { ElMessage } from "element-plus";

const userStore = useUserStore();

const agentId = computed(() =>
    (userStore.G_LoginInfo.account || "CS001").trim(),
);
const agentName = computed(
    () => (userStore.G_LoginInfo.nickName || "小翠").trim() || "小翠",
);

const welcomeMessage = ref("您好，这边是颐养阁售前客服小翠，很高兴为您服务～");
const { quickReplies } = useQuickReplies();

const showAddDialog = ref(false);
const newReplyText = ref("");
const dialogTextareaRef = ref<HTMLTextAreaElement>();

function saveWelcomeMessage() {
    ElMessage.success("欢迎语已保存");
}

async function openAddDialog() {
    newReplyText.value = "";
    showAddDialog.value = true;
    await nextTick();
    dialogTextareaRef.value?.focus();
}

function cancelAdd() {
    showAddDialog.value = false;
    newReplyText.value = "";
}

function confirmAdd() {
    const text = newReplyText.value.trim();
    if (!text) return;
    quickReplies.value.push(text);
    showAddDialog.value = false;
    newReplyText.value = "";
    ElMessage.success("常用语已添加");
}

function removeReply(index: number) {
    quickReplies.value.splice(index, 1);
    ElMessage.success("常用语已删除");
}
</script>

<style scoped lang="scss">
.settings-panel {
    width: 100%;
}

.section-title {
    font-family: "STKaiti", serif;
    font-size: 21px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    color: var(--ink);

    &::before {
        content: "";
        width: 4px;
        height: 18px;
        background: var(--cinnabar);
        border-radius: 2px;
        flex-shrink: 0;
    }
}

.panel-card {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(232, 223, 208, 0.5);
    margin-bottom: 16px;
    overflow: hidden;
}

.panel-card-head {
    padding: 14px 20px;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        font-family: "STKaiti", serif;
        font-size: 17px;
        font-weight: 600;
        color: var(--ink);
    }
}

.head-btn {
    background: transparent;
    border: 1px solid var(--line);
    padding: 5px 14px;
    border-radius: 7px;
    font-size: 15px;
    font-family: inherit;
    cursor: pointer;
    color: var(--ink-muted);
    transition: all 0.15s;

    &:hover {
        border-color: var(--jade);
        color: var(--jade);
    }

    &.accent {
        border-color: var(--jade);
        color: var(--jade);

        &:hover {
            background: var(--jade);
            color: white;
        }
    }
}

.panel-card-body {
    padding: 16px 20px;
}

.setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 13px 0;
    border-bottom: 1px solid var(--line);

    &:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    &:first-child {
        padding-top: 0;
    }
}

.setting-label {
    font-size: 16px;
    font-weight: 500;
    color: var(--ink);
}

.setting-desc {
    font-size: 14px;
    color: var(--ink-muted);
    margin-top: 3px;
}

.setting-value {
    font-size: 16px;
    color: var(--ink);

    &.serif {
        font-family: "STKaiti", serif;
    }
}

.setting-textarea {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 16px;
    font-family: inherit;
    resize: vertical;
    outline: none;
    background: var(--paper-warm);
    color: var(--ink);
    box-sizing: border-box;
    transition: border-color 0.15s;

    &:focus {
        border-color: var(--jade);
        background: white;
    }
}

.empty-tip {
    text-align: center;
    padding: 20px 0;
    font-size: 16px;
    color: var(--ink-muted);
}

.quick-reply-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.reply-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--cream);
    border-radius: 8px;
    border: 1px solid var(--line);
    transition: border-color 0.15s;

    &:hover {
        border-color: var(--jade);

        .reply-del {
            opacity: 1;
        }
    }
}

.reply-text {
    flex: 1;
    font-size: 16px;
    color: var(--ink);
    line-height: 1.5;
}

.reply-del {
    width: 22px;
    height: 22px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--ink-muted);
    opacity: 0;
    transition: all 0.15s;
    flex-shrink: 0;
    line-height: 1;

    &:hover {
        background: var(--cinnabar-soft);
        color: var(--cinnabar);
    }
}

/* ───── 自定义弹窗 ───── */
.dialog-mask {
    position: fixed;
    inset: 0;
    background: rgba(30, 25, 15, 0.38);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9000;
    backdrop-filter: blur(2px);
}

.dialog-box {
    background: var(--paper);
    border-radius: 18px;
    width: 460px;
    box-shadow:
        0 24px 64px rgba(30, 25, 15, 0.18),
        0 4px 12px rgba(30, 25, 15, 0.08);
    overflow: hidden;
}

.dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px 16px;
    border-bottom: 1px solid var(--line);
    background: linear-gradient(135deg, var(--jade-pale) 0%, #eef5ec 100%);
}

.dialog-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.dialog-accent {
    width: 4px;
    height: 18px;
    background: var(--jade);
    border-radius: 2px;
}

.dialog-title {
    font-family: "STKaiti", serif;
    font-size: 19px;
    font-weight: 700;
    color: var(--ink);
}

.dialog-close {
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    color: var(--ink-muted);
    transition: all 0.15s;

    &:hover {
        background: var(--cinnabar-soft);
        color: var(--cinnabar);
    }
}

.dialog-body {
    padding: 20px 22px 0;
}

.dialog-label {
    display: block;
    font-size: 15px;
    font-weight: 500;
    color: var(--ink-muted);
    margin-bottom: 8px;
    letter-spacing: 0.02em;
}

.dialog-textarea {
    width: 100%;
    border: 1.5px solid var(--line);
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 16px;
    font-family: inherit;
    resize: none;
    outline: none;
    background: white;
    color: var(--ink);
    box-sizing: border-box;
    line-height: 1.6;
    transition:
        border-color 0.15s,
        box-shadow 0.15s;

    &:focus {
        border-color: var(--jade);
        box-shadow: 0 0 0 3px rgba(92, 131, 116, 0.12);
    }

    &::placeholder {
        color: var(--ink-muted);
        font-size: 15px;
    }
}

.dialog-footer-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 6px;
    padding: 0 2px;
}

.char-count {
    font-size: 14px;
    color: var(--ink-muted);
}

.hint-tip {
    font-size: 14px;
    color: var(--ink-muted);
    opacity: 0.7;
}

.dialog-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 16px 22px 20px;
}

.dialog-cancel {
    padding: 9px 22px;
    border-radius: 9px;
    border: 1px solid var(--line);
    background: white;
    font-size: 16px;
    font-family: inherit;
    color: var(--ink-muted);
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
        border-color: var(--ink-muted);
        color: var(--ink);
    }
}

.dialog-confirm {
    padding: 9px 24px;
    border-radius: 9px;
    border: none;
    background: var(--jade);
    color: white;
    font-size: 16px;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;

    &:hover:not(:disabled) {
        background: #4a7c6f;
        box-shadow: 0 4px 12px rgba(92, 131, 116, 0.35);
    }

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
    transition: opacity 0.22s ease;

    .dialog-box {
        transition:
            transform 0.22s ease,
            opacity 0.22s ease;
    }
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
    opacity: 0;

    .dialog-box {
        transform: translateY(-10px) scale(0.97);
        opacity: 0;
    }
}
</style>
