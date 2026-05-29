<template>
    <div class="page-wrapper">
        <HeaderLayout />

        <div class="settings-page">
            <!-- 顶部用户展示区 -->
            <div class="profile-header">
                <div
                    class="avatar-wrap"
                    @click="triggerAvatarUpload"
                    title="更换头像"
                >
                    <img
                        v-if="avatarPreview || userStore.G_UserInfo.avatar"
                        :src="avatarPreview || userStore.G_UserInfo.avatar"
                        alt="头像"
                        class="avatar-img"
                    />
                    <div v-else class="avatar-placeholder font-serif">
                        {{ displayInitial }}
                    </div>
                    <div class="avatar-overlay" aria-hidden="true">
                        <span class="overlay-icon">↑</span>
                        <span>更换</span>
                    </div>
                    <input
                        ref="fileInputRef"
                        type="file"
                        accept="image/*"
                        class="file-input"
                        @change="onAvatarSelected"
                    />
                </div>

                <div class="profile-info">
                    <h2 class="profile-name font-serif">
                        {{
                            userStore.G_LoginInfo.nickName ||
                            userStore.G_LoginInfo.account
                        }}
                    </h2>
                    <p class="profile-account">
                        {{ userStore.G_LoginInfo.account }}
                    </p>
                    <button
                        v-if="avatarPreview"
                        class="confirm-upload-btn"
                        :disabled="uploadingAvatar"
                        @click.stop="confirmAvatarUpload"
                    >
                        {{ uploadingAvatar ? "上传中…" : "确认更换头像" }}
                    </button>
                </div>
            </div>

            <!-- Tab 导航 -->
            <div class="settings-tabs" role="tablist">
                <button
                    v-for="tab in tabs"
                    :key="tab.key"
                    class="tab-btn"
                    :class="{ active: activeTab === tab.key }"
                    role="tab"
                    :aria-selected="activeTab === tab.key"
                    @click="activeTab = tab.key"
                >
                    {{ tab.label }}
                </button>
            </div>

            <!-- 基本资料 -->
            <section
                v-show="activeTab === 'profile'"
                class="settings-section"
                role="tabpanel"
            >
                <el-form
                    ref="profileFormRef"
                    :model="profileForm"
                    label-width="72px"
                    class="settings-form"
                >
                    <el-form-item label="昵称">
                        <el-input
                            v-model="profileForm.nickName"
                            placeholder="请输入昵称"
                        />
                    </el-form-item>
                    <el-form-item label="性别">
                        <el-radio-group v-model="profileForm.gender">
                            <el-radio :value="1">男</el-radio>
                            <el-radio :value="2">女</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item
                        label="邮箱"
                        prop="email"
                        :rules="[
                            {
                                type: 'email',
                                message: '邮箱格式不正确',
                                trigger: 'blur',
                            },
                        ]"
                    >
                        <el-input
                            v-model="profileForm.email"
                            placeholder="example@mail.com"
                        />
                    </el-form-item>
                    <el-form-item label="手机号">
                        <el-input
                            v-model="profileForm.phone"
                            placeholder="请输入手机号"
                        />
                    </el-form-item>
                    <el-form-item>
                        <button
                            type="button"
                            class="action-btn primary"
                            :disabled="savingProfile"
                            @click="saveProfile"
                        >
                            {{ savingProfile ? "保存中…" : "保存资料" }}
                        </button>
                    </el-form-item>
                </el-form>
            </section>

            <!-- 账号安全 -->
            <section
                v-show="activeTab === 'security'"
                class="settings-section"
                role="tabpanel"
            >
                <div class="security-group">
                    <h3 class="security-heading font-serif">修改密码</h3>
                    <el-form
                        ref="pwdFormRef"
                        :model="pwdForm"
                        :rules="pwdRules"
                        label-width="90px"
                        class="settings-form"
                    >
                        <el-form-item label="当前密码" prop="oldPassword">
                            <el-input
                                v-model="pwdForm.oldPassword"
                                type="password"
                                show-password
                                placeholder="请输入当前密码"
                            />
                        </el-form-item>
                        <el-form-item label="新密码" prop="newPassword">
                            <el-input
                                v-model="pwdForm.newPassword"
                                type="password"
                                show-password
                                placeholder="6-20 位"
                            />
                        </el-form-item>
                        <el-form-item label="确认新密码" prop="confirmPassword">
                            <el-input
                                v-model="pwdForm.confirmPassword"
                                type="password"
                                show-password
                                placeholder="再次输入新密码"
                            />
                        </el-form-item>
                        <el-form-item>
                            <button
                                class="action-btn primary"
                                :disabled="changingPwd"
                                @click="changePassword"
                            >
                                {{ changingPwd ? "修改中…" : "修改密码" }}
                            </button>
                        </el-form-item>
                    </el-form>
                </div>

                <div class="security-group danger-zone">
                    <h3 class="security-heading font-serif">退出登录</h3>
                    <p class="security-note">
                        退出后需重新登录才能访问个人数据。
                    </p>
                    <button class="action-btn danger" @click="handleLogout">
                        退出登录
                    </button>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/store/user";
import { ApiUser } from "@/network/user";
import HeaderLayout from "@/layouts/HeaderLayout.vue";

const router = useRouter();
const userStore = useUserStore();

const tabs = [
    { key: "profile", label: "基本资料" },
    { key: "security", label: "账号安全" },
];
const activeTab = ref("profile");

const fileInputRef = ref<HTMLInputElement>();
const avatarPreview = ref("");
const uploadingAvatar = ref(false);

const profileFormRef = ref<FormInstance>();
const pwdFormRef = ref<FormInstance>();

const profileForm = reactive({
    nickName: "",
    gender: undefined as number | undefined,
    email: "",
    phone: "",
});

const pwdForm = reactive({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
});

const savingProfile = ref(false);
const changingPwd = ref(false);

const pwdRules: FormRules = {
    oldPassword: [
        { required: true, message: "请输入当前密码", trigger: "blur" },
    ],
    newPassword: [
        { required: true, message: "请输入新密码", trigger: "blur" },
        { min: 6, max: 20, message: "密码长度 6-20 位", trigger: "blur" },
    ],
    confirmPassword: [
        { required: true, message: "请再次输入新密码", trigger: "blur" },
        {
            validator: (_rule, value, callback) => {
                if (value !== pwdForm.newPassword) {
                    callback(new Error("两次密码不一致"));
                } else {
                    callback();
                }
            },
            trigger: "blur",
        },
    ],
};

const displayInitial = computed(() => {
    const name =
        userStore.G_LoginInfo.nickName || userStore.G_LoginInfo.account;
    return name ? name.charAt(0) : "我";
});

onMounted(async () => {
    await userStore.loadUserInfo();
    const info = userStore.G_UserInfo;
    const login = userStore.G_LoginInfo;

    profileForm.nickName = login.nickName || login.account;
    profileForm.gender =
        info.gender === 1 || info.gender === 2 ? info.gender : undefined;
    profileForm.email = info.email || login.email || "";
    profileForm.phone = info.phone || "";
});

function triggerAvatarUpload() {
    fileInputRef.value?.click();
}

function onAvatarSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        ElMessage.warning("图片不能超过 5MB");
        return;
    }
    avatarPreview.value = URL.createObjectURL(file);
}

async function confirmAvatarUpload() {
    const file = fileInputRef.value?.files?.[0];
    if (!file) return;

    uploadingAvatar.value = true;
    try {
        const url = await ApiUser.uploadAvatar(file);
        if (url) {
            userStore.G_UserInfo.avatar = url;
            avatarPreview.value = "";
            ElMessage.success("头像更新成功");
        } else {
            ElMessage.error("头像上传失败，请稍后重试");
        }
    } finally {
        uploadingAvatar.value = false;
        if (fileInputRef.value) fileInputRef.value.value = "";
    }
}

async function saveProfile() {
    const valid = await profileFormRef.value?.validate().catch(() => false);
    if (!valid) return;

    savingProfile.value = true;
    try {
        const result = await ApiUser.updateProfile({
            nickname: profileForm.nickName,
            gender: profileForm.gender,
            email: profileForm.email,
            phone: profileForm.phone,
        });
        if (result !== null) {
            // 同步更新本地 store，避免需要刷新页面才能看到变化
            userStore.G_LoginInfo.nickName = profileForm.nickName;
            userStore.G_LoginInfo.email = profileForm.email;
            userStore.G_UserInfo.gender = profileForm.gender;
            userStore.G_UserInfo.email = profileForm.email;
            userStore.G_UserInfo.phone = profileForm.phone;
            ElMessage.success("资料保存成功");
        } else {
            ElMessage.error("保存失败，请稍后重试");
        }
    } finally {
        savingProfile.value = false;
    }
}

async function changePassword() {
    const valid = await pwdFormRef.value?.validate().catch(() => false);
    if (!valid) return;

    changingPwd.value = true;
    try {
        const ok = await ApiUser.changePassword({
            oldPassword: pwdForm.oldPassword,
            newPassword: pwdForm.newPassword,
        });
        if (ok) {
            ElMessage.success("密码修改成功，请重新登录");
            pwdFormRef.value?.resetFields();
            await userStore.logout();
            router.push("/login");
        } else {
            ElMessage.error("修改失败，当前密码可能不正确");
        }
    } finally {
        changingPwd.value = false;
    }
}

async function handleLogout() {
    await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
        confirmButtonText: "退出",
        cancelButtonText: "取消",
        type: "warning",
    }).catch(() => null);

    await userStore.logout();
    ElMessage.success("已退出登录");
    router.push("/");
}
</script>

<style scoped lang="scss">
.settings-page {
    max-width: 720px;
    margin: 0 auto;
    padding: 48px 24px 96px;
}

/* ── 顶部用户信息 ─────────────────────────────── */
.profile-header {
    display: flex;
    align-items: flex-start;
    gap: 32px;
    padding-bottom: 40px;
    border-bottom: 1px solid var(--line);
    margin-bottom: 0;
}

.avatar-wrap {
    position: relative;
    width: 88px;
    height: 88px;
    flex-shrink: 0;
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;

    &:hover .avatar-overlay {
        opacity: 1;
    }
}

.avatar-img {
    width: 88px;
    height: 88px;
    object-fit: cover;
    border-radius: 50%;
    display: block;
}

.avatar-placeholder {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--jade));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 30px;
    font-weight: 600;
}

.avatar-overlay {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(44, 54, 57, 0.55);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: white;
    font-size: 11px;
    letter-spacing: 0.05em;
    opacity: 0;
    transition: opacity 0.2s ease-out;

    .overlay-icon {
        font-size: 16px;
        font-weight: 300;
        line-height: 1;
    }
}

.file-input {
    display: none;
}

.profile-info {
    flex: 1;
    padding-top: 8px;
}

.profile-name {
    font-size: 24px;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: 0.04em;
    margin-bottom: 6px;
    line-height: 1.2;
}

.profile-account {
    font-size: 13px;
    color: var(--ink-muted);
    margin-bottom: 8px;
}

.confirm-upload-btn {
    display: inline-block;
    background: var(--jade);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 18px;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 0.04em;
    transition: background 0.18s ease-out;

    &:hover {
        background: var(--bamboo);
    }
    &:disabled {
        opacity: 0.6;
        cursor: default;
    }
}

/* ── Tab 导航 ─────────────────────────────────── */
.settings-tabs {
    display: flex;
    border-bottom: 1px solid var(--line);
    margin-bottom: 40px;
}

.tab-btn {
    background: none;
    border: none;
    padding: 16px 0;
    margin-right: 36px;
    font-size: 14px;
    font-weight: 500;
    color: var(--ink-muted);
    cursor: pointer;
    position: relative;
    letter-spacing: 0.02em;
    transition: color 0.18s ease-out;

    &.active {
        color: var(--ink);
        font-weight: 700;

        &::after {
            content: "";
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--jade);
            border-radius: 2px 2px 0 0;
        }
    }

    &:hover:not(.active) {
        color: var(--ink-soft);
    }
}

/* ── 表单区域 ─────────────────────────────────── */
.settings-section {
    max-width: 480px;
}

.settings-form {
    :deep(.el-form-item) {
        margin-bottom: 24px;
    }

    :deep(.el-form-item__label) {
        justify-content: flex-start;
        text-align: left;
        color: var(--ink-muted);
        font-size: 13px;
        font-weight: 500;
        padding-right: 12px;
    }

    :deep(.el-input__wrapper) {
        background: var(--paper);
        border-radius: 6px;
        box-shadow: 0 0 0 1px var(--line);
        transition: box-shadow 0.18s ease-out;

        &:hover {
            box-shadow: 0 0 0 1px var(--jade-light);
        }
        &.is-focus {
            box-shadow: 0 0 0 1.5px var(--jade) !important;
        }
    }

    :deep(.el-textarea__inner) {
        background: var(--paper);
        border-radius: 6px;
        box-shadow: 0 0 0 1px var(--line);
        transition: box-shadow 0.18s ease-out;
        font-family: inherit;
        resize: vertical;

        &:focus {
            box-shadow: 0 0 0 1.5px var(--jade) !important;
            outline: none;
        }
    }

    :deep(.el-radio__input.is-checked .el-radio__inner) {
        background: var(--jade);
        border-color: var(--jade);
    }

    :deep(.el-radio__input.is-checked + .el-radio__label) {
        color: var(--jade);
    }
}

/* ── 统一操作按钮 ─────────────────────────────── */
.action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 38px;
    padding: 0 24px;
    border-radius: 4px;
    font-size: 13px;
    font-family: inherit;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
    border: 1px solid transparent;
    transition:
        background 0.18s ease-out,
        transform 0.12s ease-out;

    &:disabled {
        opacity: 0.55;
        cursor: default;
        transform: none !important;
    }

    &.primary {
        background: var(--jade);
        color: white;
        border-color: var(--jade);

        &:not(:disabled):hover {
            background: var(--bamboo);
            border-color: var(--bamboo);
            transform: translateY(-1px);
        }
    }

    &.danger {
        background: none;
        color: var(--cinnabar);
        border-color: var(--cinnabar);

        &:not(:disabled):hover {
            background: var(--cinnabar-soft);
            transform: translateY(-1px);
        }
    }
}

/* ── 账号安全分区 ─────────────────────────────── */
.security-group {
    margin-bottom: 48px;
}

.security-heading {
    font-size: 17px;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: 0.04em;
    margin-bottom: 24px;
}

.security-note {
    font-size: 13px;
    color: var(--ink-muted);
    margin-bottom: 20px;
    line-height: 1.6;
}

.danger-zone {
    padding-top: 40px;
    border-top: 1px solid var(--line-soft);
}
</style>
