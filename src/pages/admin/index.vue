<template>
    <div class="admin-app">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo-seal font-serif">颐</div>
                <div>
                    <div class="sidebar-title font-serif">颐养阁</div>
                    <div class="sidebar-sub">管理后台</div>
                </div>
            </div>

            <nav class="nav">
                <div class="nav-section">运营</div>
                <button
                    class="nav-item"
                    :class="{ active: activeTab === 'dashboard' }"
                    @click="activeTab = 'dashboard'"
                >
                    <svg
                        class="nav-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.75"
                    >
                        <rect x="3" y="3" width="7" height="9" rx="1.5" />
                        <rect x="14" y="3" width="7" height="5" rx="1.5" />
                        <rect x="14" y="12" width="7" height="9" rx="1.5" />
                        <rect x="3" y="16" width="7" height="5" rx="1.5" />
                    </svg>
                    <span>数据看板</span>
                </button>
                <button
                    class="nav-item"
                    :class="{ active: activeTab === 'review' }"
                    @click="activeTab = 'review'"
                >
                    <svg
                        class="nav-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.75"
                    >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <polyline points="17 11 19 13 23 9" />
                    </svg>
                    <span>专家审核</span>
                    <span v-if="pendingCount > 0" class="nav-badge">{{
                        pendingCount
                    }}</span>
                </button>
                <button
                    class="nav-item"
                    :class="{ active: activeTab === 'refunds' }"
                    @click="activeTab = 'refunds'"
                >
                    <svg
                        class="nav-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.75"
                    >
                        <path d="M3 3v18h18" />
                        <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                    <span>退款审核</span>
                </button>
                <button
                    class="nav-item"
                    :class="{ active: activeTab === 'logistics' }"
                    @click="activeTab = 'logistics'"
                >
                    <svg
                        class="nav-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.75"
                    >
                        <rect x="1" y="3" width="15" height="13" rx="2" />
                        <path d="M16 8h4l3 3v5h-7V8z" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    <span>物流管理</span>
                </button>

                <div class="nav-section">系统</div>
                <button
                    class="nav-item"
                    :class="{ active: activeTab === 'permissions' }"
                    @click="activeTab = 'permissions'"
                >
                    <svg
                        class="nav-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.75"
                    >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <polyline points="9 12 11 14 15 10" />
                    </svg>
                    <span>权限设置</span>
                </button>
                <button
                    class="nav-item"
                    :class="{ active: activeTab === 'agents' }"
                    @click="activeTab = 'agents'"
                >
                    <svg
                        class="nav-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.75"
                    >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>客服管理</span>
                </button>
            </nav>

            <div class="sidebar-account-wrap" ref="accountMenuRef">
                <Transition name="account-menu">
                    <div v-if="accountMenuOpen" class="account-menu">
                        <div class="account-profile">
                            <div class="admin-avatar account-avatar font-serif">
                                <img
                                    v-if="avatarSrc"
                                    :src="avatarSrc"
                                    alt="头像"
                                    class="admin-avatar-img"
                                />
                                <span v-else>{{ displayInitial }}</span>
                            </div>
                            <div class="admin-meta">
                                <div class="admin-name">{{ nickName }}</div>
                                <div class="admin-role">管理员账号</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="account-menu-item"
                            @click="goSettings"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.75"
                            >
                                <circle cx="12" cy="12" r="3" />
                                <path
                                    d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.2.38.6.6 1 .6h.6a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.4z"
                                />
                            </svg>
                            <span>设置</span>
                        </button>
                        <button
                            type="button"
                            class="account-menu-item danger"
                            @click="handleLogout"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.75"
                            >
                                <path
                                    d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                                />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span>退出登录</span>
                        </button>
                    </div>
                </Transition>

                <button
                    type="button"
                    class="sidebar-account"
                    :class="{ open: accountMenuOpen }"
                    @click="toggleAccountMenu"
                >
                    <div class="admin-info">
                        <div class="admin-avatar font-serif">
                            <img
                                v-if="avatarSrc"
                                :src="avatarSrc"
                                alt="头像"
                                class="admin-avatar-img"
                            />
                            <span v-else>{{ displayInitial }}</span>
                        </div>
                        <div class="admin-meta">
                            <div class="admin-name">{{ nickName }}</div>
                            <div class="admin-role">管理员账号</div>
                        </div>
                    </div>
                    <svg
                        class="account-gear"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.9"
                    >
                        <circle cx="12" cy="12" r="3" />
                        <path
                            d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.2.38.6.6 1 .6h.6a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.4z"
                        />
                    </svg>
                </button>
            </div>
        </aside>

        <!-- Main -->
        <div class="main">
            <main class="content">
                <AdminDashboard v-show="activeTab === 'dashboard'" />
                <AdminReview
                    v-show="activeTab === 'review'"
                    @pending-count="pendingCount = $event"
                />
                <AdminRefund v-show="activeTab === 'refunds'" />
                <AdminLogistics v-show="activeTab === 'logistics'" />
                <AdminPermissions v-show="activeTab === 'permissions'" />
                <AdminAgents v-show="activeTab === 'agents'" />
            </main>
        </div>

        <Teleport to="body">
            <Transition name="settings-modal">
                <div
                    v-if="settingsVisible"
                    class="settings-mask"
                    @click.self="closeSettingsModal"
                >
                    <div class="settings-modal">
                        <div class="settings-header">
                            <div>
                                <h3 class="font-serif">账号设置</h3>
                                <p>修改当前管理员账号资料</p>
                            </div>
                            <button
                                type="button"
                                class="settings-close"
                                @click="closeSettingsModal"
                            >
                                ×
                            </button>
                        </div>

                        <div class="settings-body">
                            <div class="settings-avatar-row">
                                <button
                                    type="button"
                                    class="settings-avatar"
                                    @click="triggerAvatarUpload"
                                >
                                    <img
                                        v-if="settingsAvatarSrc"
                                        :src="settingsAvatarSrc"
                                        alt="头像"
                                    />
                                    <span v-else class="font-serif">{{
                                        displayInitial
                                    }}</span>
                                    <em>更换</em>
                                </button>
                                <div class="settings-avatar-copy">
                                    <strong>{{ nickName }}</strong>
                                    <span>支持 JPG、PNG，图片不超过 5MB</span>
                                </div>
                                <input
                                    ref="fileInputRef"
                                    type="file"
                                    accept="image/*"
                                    class="file-input"
                                    @change="onAvatarSelected"
                                />
                            </div>

                            <label class="settings-field">
                                <span>昵称</span>
                                <input
                                    v-model.trim="settingsForm.nickname"
                                    type="text"
                                    placeholder="请输入昵称"
                                />
                            </label>

                            <label class="settings-field">
                                <span>邮箱</span>
                                <input
                                    v-model.trim="settingsForm.email"
                                    type="email"
                                    placeholder="example@mail.com"
                                />
                            </label>

                            <label class="settings-field">
                                <span>手机号</span>
                                <input
                                    v-model.trim="settingsForm.phone"
                                    type="tel"
                                    placeholder="请输入手机号"
                                />
                            </label>

                            <label class="settings-field">
                                <span>性别</span>
                                <select v-model.number="settingsForm.gender">
                                    <option :value="0">未设置</option>
                                    <option :value="1">男</option>
                                    <option :value="2">女</option>
                                </select>
                            </label>

                            <div
                                v-if="settingsMessage"
                                class="settings-message"
                                :class="settingsMessageType"
                            >
                                {{ settingsMessage }}
                            </div>
                        </div>

                        <div class="settings-footer">
                            <button
                                type="button"
                                class="settings-btn"
                                :disabled="savingSettings"
                                @click="closeSettingsModal"
                            >
                                取消
                            </button>
                            <button
                                type="button"
                                class="settings-btn primary"
                                :disabled="savingSettings"
                                @click="saveSettings"
                            >
                                {{ savingSettings ? "保存中…" : "保存设置" }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import { ApiUser } from "@/network/user";
import AdminDashboard from "@/components/admin/AdminDashboard.vue";
import AdminReview from "@/components/admin/AdminReview.vue";
import AdminPermissions from "@/components/admin/AdminPermissions.vue";
import AdminAgents from "@/components/admin/AdminAgents.vue";
import AdminRefund from "@/components/admin/AdminRefund.vue";
import AdminLogistics from "@/components/admin/AdminLogistics.vue";

const router = useRouter();
const userStore = useUserStore();

const activeTab = ref("dashboard");
const pendingCount = ref(0);
const accountMenuOpen = ref(false);
const accountMenuRef = ref<HTMLElement | null>(null);
const settingsVisible = ref(false);
const savingSettings = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const avatarPreview = ref("");
const avatarFile = ref<File | null>(null);
const settingsMessage = ref("");
const settingsMessageType = ref<"success" | "error">("success");
const settingsForm = reactive({
    nickname: "",
    email: "",
    phone: "",
    gender: 0,
});

const nickName = computed(() => userStore.G_LoginInfo.nickName || "管理员");
const displayInitial = computed(() => nickName.value.charAt(0) || "管");
const avatarSrc = computed(() => userStore.G_UserInfo.avatar || "");
const settingsAvatarSrc = computed(
    () => avatarPreview.value || avatarSrc.value,
);

onMounted(() => {
    document.addEventListener("click", onDocClick);
    window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
    document.removeEventListener("click", onDocClick);
    window.removeEventListener("keydown", onKeydown);
    revokeAvatarPreview();
});

function toggleAccountMenu() {
    accountMenuOpen.value = !accountMenuOpen.value;
}

function onDocClick(e: MouseEvent) {
    if (
        accountMenuRef.value &&
        !accountMenuRef.value.contains(e.target as Node)
    ) {
        accountMenuOpen.value = false;
    }
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
        if (settingsVisible.value) {
            closeSettingsModal();
            return;
        }
        accountMenuOpen.value = false;
    }
}

function goSettings() {
    accountMenuOpen.value = false;
    openSettingsModal();
}

function openSettingsModal() {
    settingsForm.nickname =
        userStore.G_LoginInfo.nickName || userStore.G_LoginInfo.account || "";
    settingsForm.email =
        userStore.G_UserInfo.email || userStore.G_LoginInfo.email || "";
    settingsForm.phone = userStore.G_UserInfo.phone || "";
    settingsForm.gender = userStore.G_UserInfo.gender ?? 0;
    settingsMessage.value = "";
    settingsMessageType.value = "success";
    revokeAvatarPreview();
    avatarFile.value = null;
    if (fileInputRef.value) fileInputRef.value.value = "";
    settingsVisible.value = true;
}

function closeSettingsModal() {
    if (savingSettings.value) return;
    settingsVisible.value = false;
    settingsMessage.value = "";
    revokeAvatarPreview();
    avatarFile.value = null;
    if (fileInputRef.value) fileInputRef.value.value = "";
}

function triggerAvatarUpload() {
    fileInputRef.value?.click();
}

function onAvatarSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        showSettingsMessage("图片不能超过 5MB", "error");
        if (fileInputRef.value) fileInputRef.value.value = "";
        return;
    }
    revokeAvatarPreview();
    avatarFile.value = file;
    avatarPreview.value = URL.createObjectURL(file);
}

function revokeAvatarPreview() {
    if (avatarPreview.value) {
        URL.revokeObjectURL(avatarPreview.value);
        avatarPreview.value = "";
    }
}

function showSettingsMessage(message: string, type: "success" | "error") {
    settingsMessage.value = message;
    settingsMessageType.value = type;
}

async function saveSettings() {
    if (!settingsForm.nickname) {
        showSettingsMessage("昵称不能为空", "error");
        return;
    }
    if (!settingsForm.email) {
        showSettingsMessage("邮箱不能为空", "error");
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settingsForm.email)) {
        showSettingsMessage("邮箱格式不正确", "error");
        return;
    }

    savingSettings.value = true;
    try {
        let uploadedAvatar = "";
        if (avatarFile.value) {
            const url = await ApiUser.uploadAvatar(avatarFile.value);
            if (!url) {
                showSettingsMessage("头像上传失败，请稍后重试", "error");
                return;
            }
            uploadedAvatar = url;
        }

        const payload: {
            nickname: string;
            gender: number;
            email?: string;
            phone?: string;
        } = {
            nickname: settingsForm.nickname,
            gender: settingsForm.gender,
            email: settingsForm.email,
            phone: settingsForm.phone,
        };

        const result = await ApiUser.updateProfileDetailed(payload);

        if (!result.success) {
            showSettingsMessage(
                result.message || "保存失败，请稍后重试",
                "error",
            );
            return;
        }

        userStore.G_LoginInfo.nickName = settingsForm.nickname;
        userStore.G_LoginInfo.email = settingsForm.email;
        userStore.G_UserInfo.email = settingsForm.email;
        userStore.G_UserInfo.phone = settingsForm.phone;
        userStore.G_UserInfo.gender = settingsForm.gender;
        if (uploadedAvatar) {
            userStore.G_UserInfo.avatar = uploadedAvatar;
        }

        showSettingsMessage("设置已保存", "success");
        window.setTimeout(() => {
            settingsVisible.value = false;
        }, 500);
        revokeAvatarPreview();
        avatarFile.value = null;
    } finally {
        savingSettings.value = false;
    }
}

async function handleLogout() {
    accountMenuOpen.value = false;
    await userStore.logout();
    router.push("/login");
}
</script>

<style scoped>
/* Layout */
.admin-app {
    display: flex;
    min-height: 100vh;
    background: var(--cream, #faf6ee);
}

/* Sidebar */
.sidebar {
    width: 240px;
    flex-shrink: 0;
    background: linear-gradient(180deg, #eaf1e4 0%, #d5e3d0 100%);
    border-right: 1px solid rgba(92, 131, 116, 0.18);
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
}
.sidebar-header {
    height: 64px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px;
    border-bottom: 1px solid rgba(92, 131, 116, 0.15);
    flex-shrink: 0;
}
.logo-seal {
    width: 42px;
    height: 42px;
    background: var(--cinnabar, #b33c2c);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    font-size: 20px;
    font-weight: 700;
    box-shadow: 0 3px 10px rgba(179, 60, 44, 0.28);
    flex-shrink: 0;
}
.sidebar-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--ink, #2c3639);
}
.sidebar-sub {
    font-size: 11px;
    color: var(--ink-muted, #6b7c7a);
    margin-top: 1px;
    letter-spacing: 0.5px;
}

.nav {
    flex: 1;
    padding: 12px 10px;
}
.nav-section {
    font-size: 11px;
    color: var(--ink-muted, #6b7c7a);
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 12px 10px 6px;
    font-weight: 500;
}
.nav-item {
    width: 100%;
    background: transparent;
    border: none;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: inherit;
    font-size: 14px;
    color: #4a565a;
    cursor: pointer;
    border-radius: 9px;
    transition:
        background 0.18s,
        color 0.18s;
    text-align: left;
    margin-bottom: 2px;
}
.nav-item:hover {
    background: rgba(255, 255, 255, 0.5);
    color: #456660;
}
.nav-item.active {
    background: rgba(255, 255, 255, 0.82);
    color: var(--cinnabar, #b33c2c);
    font-weight: 600;
    box-shadow: 0 2px 12px rgba(60, 50, 30, 0.06);
}
.nav-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}
.nav-badge {
    margin-left: auto;
    background: var(--cinnabar, #b33c2c);
    color: white;
    font-size: 11px;
    padding: 1px 7px;
    border-radius: 9px;
    font-weight: 700;
    line-height: 18px;
}
.sidebar-account-wrap {
    position: relative;
    padding: 10px 12px;
    border-top: 1px solid rgba(92, 131, 116, 0.15);
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.24);
}
.sidebar-account {
    width: 100%;
    border: none;
    border-radius: 12px;
    padding: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.46);
    color: inherit;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    transition:
        background 0.16s,
        box-shadow 0.16s,
        transform 0.16s;
}
.sidebar-account:hover,
.sidebar-account.open {
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 3px 14px rgba(60, 50, 30, 0.08);
}
.admin-info {
    min-width: 0;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
}
.admin-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--jade, #5c8374), #456660);
    color: white;
    font-size: 15px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(69, 102, 96, 0.2);
    overflow: hidden;
}
.admin-avatar-img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
}
.admin-meta {
    min-width: 0;
}
.admin-name {
    color: var(--ink, #2c3639);
    font-weight: 600;
    font-size: 13px;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.admin-role {
    color: var(--ink-muted, #6b7c7a);
    font-size: 11px;
    margin-top: 2px;
}
.account-gear {
    flex-shrink: 0;
    color: var(--ink-muted, #6b7c7a);
    transition: transform 0.16s;
}
.sidebar-account.open .account-gear {
    transform: rotate(32deg);
}
.account-menu {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: calc(100% + 8px);
    z-index: 700;
    background: var(--paper, #fffef9);
    border: 1px solid rgba(232, 223, 208, 0.86);
    border-radius: 14px;
    box-shadow:
        0 18px 38px rgba(60, 50, 30, 0.16),
        0 2px 8px rgba(60, 50, 30, 0.08);
    padding: 8px;
}
.account-profile {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 9px 11px;
    border-bottom: 1px solid rgba(232, 223, 208, 0.7);
    margin-bottom: 5px;
}
.account-avatar {
    width: 38px;
    height: 38px;
}
.account-menu-item {
    width: 100%;
    height: 38px;
    border: none;
    border-radius: 9px;
    background: transparent;
    color: var(--ink, #2c3639);
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 10px;
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
    transition:
        background 0.14s,
        color 0.14s;
}
.account-menu-item:hover {
    background: var(--cream, #faf6ee);
}
.account-menu-item.danger {
    color: var(--cinnabar, #b33c2c);
}
.account-menu-item.danger:hover {
    background: var(--cinnabar-soft, #fae5e0);
}
.account-menu-enter-active,
.account-menu-leave-active {
    transition:
        opacity 0.16s ease,
        transform 0.16s ease;
}
.account-menu-enter-from,
.account-menu-leave-to {
    opacity: 0;
    transform: translateY(6px);
}

/* Account settings modal */
.settings-mask {
    position: fixed;
    inset: 0;
    z-index: 1200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(44, 54, 57, 0.38);
    backdrop-filter: blur(7px);
}
.settings-modal {
    width: min(540px, 100%);
    max-height: calc(100vh - 48px);
    overflow: hidden;
    border-radius: 18px;
    background: var(--paper, #fffef9);
    border: 1px solid rgba(232, 223, 208, 0.96);
    box-shadow:
        0 28px 70px rgba(44, 54, 57, 0.26),
        0 8px 22px rgba(60, 50, 30, 0.12);
    display: flex;
    flex-direction: column;
}
.settings-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 22px 24px 18px;
    background: linear-gradient(180deg, #fdfbf5 0%, #f8f2e7 100%);
    border-bottom: 1px solid rgba(232, 223, 208, 0.78);
}
.settings-header h3 {
    margin: 0;
    color: var(--ink, #2c3639);
    font-size: 22px;
    line-height: 1.2;
    font-weight: 700;
}
.settings-header p {
    margin: 6px 0 0;
    color: var(--ink-muted, #6b7c7a);
    font-size: 13px;
}
.settings-close {
    width: 34px;
    height: 34px;
    border: 1px solid rgba(232, 223, 208, 0.9);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.72);
    color: var(--ink-muted, #6b7c7a);
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    transition:
        background 0.16s,
        color 0.16s,
        border-color 0.16s,
        transform 0.16s;
}
.settings-close:hover {
    background: white;
    color: var(--cinnabar, #b33c2c);
    border-color: rgba(179, 60, 44, 0.22);
}
.settings-body {
    padding: 22px 24px 20px;
    overflow: auto;
}
.settings-body::-webkit-scrollbar {
    width: 8px;
}
.settings-body::-webkit-scrollbar-track {
    background: #f6efe2;
}
.settings-body::-webkit-scrollbar-thumb {
    background: #b7c9bd;
    border-radius: 999px;
    border: 2px solid #f6efe2;
}
.settings-avatar-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    margin-bottom: 18px;
    border: 1px solid rgba(232, 223, 208, 0.86);
    border-radius: 14px;
    background: #fbf8ef;
}
.settings-avatar {
    position: relative;
    width: 64px;
    height: 64px;
    border: none;
    border-radius: 16px;
    padding: 0;
    overflow: hidden;
    background: linear-gradient(135deg, var(--jade, #5c8374), #456660);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    box-shadow: 0 8px 18px rgba(69, 102, 96, 0.24);
}
.settings-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}
.settings-avatar span {
    font-size: 22px;
    font-weight: 700;
}
.settings-avatar em {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 24px;
    background: rgba(44, 54, 57, 0.72);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-style: normal;
    font-size: 12px;
}
.settings-avatar-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
}
.settings-avatar-copy strong {
    color: var(--ink, #2c3639);
    font-size: 15px;
}
.settings-avatar-copy span {
    color: var(--ink-muted, #6b7c7a);
    font-size: 12px;
    line-height: 1.45;
}
.file-input {
    display: none;
}
.settings-field {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    margin-top: 13px;
}
.settings-field > span {
    color: var(--ink-muted, #6b7c7a);
    font-size: 13px;
    font-weight: 600;
}
.settings-field input,
.settings-field select {
    width: 100%;
    height: 42px;
    border: 1px solid rgba(216, 202, 183, 0.9);
    border-radius: 11px;
    background: #fffef9;
    color: var(--ink, #2c3639);
    padding: 0 13px;
    font: inherit;
    font-size: 14px;
    outline: none;
    transition:
        border-color 0.16s,
        box-shadow 0.16s,
        background 0.16s;
}
.settings-field select {
    appearance: none;
    background-image:
        linear-gradient(45deg, transparent 50%, #6b7c7a 50%),
        linear-gradient(135deg, #6b7c7a 50%, transparent 50%);
    background-position:
        calc(100% - 18px) 18px,
        calc(100% - 13px) 18px;
    background-size:
        5px 5px,
        5px 5px;
    background-repeat: no-repeat;
    padding-right: 34px;
}
.settings-field input:focus,
.settings-field select:focus {
    border-color: rgba(92, 131, 116, 0.72);
    background: white;
    box-shadow: 0 0 0 3px rgba(92, 131, 116, 0.14);
}
.settings-message {
    margin-top: 16px;
    padding: 10px 12px;
    border-radius: 11px;
    font-size: 13px;
    line-height: 1.5;
}
.settings-message.success {
    color: #456660;
    background: #eaf1e4;
    border: 1px solid rgba(92, 131, 116, 0.22);
}
.settings-message.error {
    color: var(--cinnabar, #b33c2c);
    background: var(--cinnabar-soft, #fae5e0);
    border: 1px solid rgba(179, 60, 44, 0.18);
}
.settings-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px 22px;
    border-top: 1px solid rgba(232, 223, 208, 0.78);
    background: #fffefa;
}
.settings-btn {
    min-width: 92px;
    height: 40px;
    border: 1px solid rgba(216, 202, 183, 0.9);
    border-radius: 11px;
    background: #fffef9;
    color: #4a565a;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition:
        background 0.16s,
        color 0.16s,
        border-color 0.16s,
        box-shadow 0.16s,
        transform 0.16s;
}
.settings-btn:hover:not(:disabled) {
    background: white;
    border-color: rgba(92, 131, 116, 0.42);
    box-shadow: 0 5px 14px rgba(60, 50, 30, 0.08);
}
.settings-btn.primary {
    border-color: var(--cinnabar, #b33c2c);
    background: var(--cinnabar, #b33c2c);
    color: white;
    box-shadow: 0 8px 18px rgba(179, 60, 44, 0.18);
}
.settings-btn.primary:hover:not(:disabled) {
    background: #a23427;
    border-color: #a23427;
}
.settings-btn:disabled {
    cursor: not-allowed;
    opacity: 0.65;
}
.settings-modal-enter-active,
.settings-modal-leave-active {
    transition: opacity 0.18s ease;
}
.settings-modal-enter-active .settings-modal,
.settings-modal-leave-active .settings-modal {
    transition:
        transform 0.18s ease,
        opacity 0.18s ease;
}
.settings-modal-enter-from,
.settings-modal-leave-to {
    opacity: 0;
}
.settings-modal-enter-from .settings-modal,
.settings-modal-leave-to .settings-modal {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
}

/* Main */
.main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.content {
    flex: 1;
    overflow: auto;
}

/* Responsive */
@media (max-width: 1024px) {
    .sidebar {
        width: 200px;
    }
}
@media (max-width: 768px) {
    .sidebar {
        display: none;
    }
    .settings-mask {
        padding: 16px;
    }
    .settings-header,
    .settings-body,
    .settings-footer {
        padding-left: 18px;
        padding-right: 18px;
    }
    .settings-field {
        grid-template-columns: 1fr;
        gap: 7px;
    }
    .settings-avatar-row {
        align-items: flex-start;
    }
}
</style>
