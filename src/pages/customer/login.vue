<template>
    <div class="login-page">
        <div class="login-card">
            <div class="seal">颐</div>
            <h2 class="font-serif">客服工作台</h2>
            <div class="sub">颐养阁官方店铺 · 服务中心</div>

            <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                @keyup.enter="submitLogin"
            >
                <el-form-item prop="account">
                    <el-input
                        v-model="loginForm.account"
                        placeholder="请输入工号"
                        size="large"
                        prefix-icon="User"
                    />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        v-model="loginForm.password"
                        type="password"
                        placeholder="请输入密码"
                        size="large"
                        prefix-icon="Lock"
                        show-password
                    />
                </el-form-item>
                <el-button
                    class="login-btn"
                    type="primary"
                    size="large"
                    :loading="loading"
                    @click="submitLogin"
                >
                    登录工作台
                </el-button>
            </el-form>

            <div class="login-tip">请使用分配的客服工号和密码登录</div>

            <div class="back-to-user-login">
                <span>普通用户？</span>
                <button class="link-btn" @click="goToUserLogin">
                    返回用户登录
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/user";
import { ApiUser } from "@/network/user";
import { resolvePostLoginPath } from "@/utils";

const router = useRouter();
const userStore = useUserStore();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
    account: "",
    password: "",
});

const loginRules: FormRules = {
    account: [
        { required: true, message: "请输入工号", trigger: "blur" },
        {
            min: 3,
            max: 20,
            message: "工号长度在 3 到 20 个字符",
            trigger: "blur",
        },
    ],
    password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        {
            min: 6,
            max: 20,
            message: "密码长度在 6 到 20 个字符",
            trigger: "blur",
        },
    ],
};

async function submitLogin() {
    const valid = await loginFormRef.value?.validate().catch(() => false);
    if (!valid) return;

    loading.value = true;
    try {
        const result = await ApiUser.login({
            username: loginForm.account,
            password: loginForm.password,
        });

        if (result) {
            const codes: number[] = result.privileges ?? [];

            // 验证是否为客服用户（角色码 400）
            if (!codes.includes(400)) {
                ElMessage.error("该账号不是客服账号，请使用客服工号登录");
                loading.value = false;
                return;
            }

            userStore.G_LoginInfo = {
                ...userStore.G_LoginInfo,
                id: result.id,
                isLogin: true,
                nickName:
                    result.nickname || result.username || loginForm.account,
                account: loginForm.account,
                status: 1,
            };

            // 客服角色码为 400，转换后 roleId = 4
            const role_id = 4;
            userStore.G_UserInfo = { ...userStore.G_UserInfo, role_id };
            userStore.isInitialized = true;
            sessionStorage.setItem("tab-user-id", String(result.id));
            await userStore.loadUserInfo();

            ElMessage.success("登录成功");

            // 跳转至客服工作台
            const redirectPath = resolvePostLoginPath(role_id);
            await router.push(redirectPath);
        } else {
            ElMessage.error("工号或密码错误");
        }
    } catch {
        ElMessage.error("登录失败，请稍后重试");
    } finally {
        loading.value = false;
    }
}

function goToUserLogin() {
    router.push("/login");
}
</script>

<style scoped lang="scss">
.login-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #eaf1e4 0%, #faf6ee 50%, #f5ebd3 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
            radial-gradient(
                circle at 10% 0%,
                rgba(201, 165, 92, 0.04) 0%,
                transparent 40%
            ),
            radial-gradient(
                circle at 90% 100%,
                rgba(92, 131, 116, 0.05) 0%,
                transparent 40%
            );
        pointer-events: none;
    }
}

.login-card {
    background: var(--paper);
    border-radius: 18px;
    box-shadow: var(--shadow-lg);
    padding: 40px 44px;
    width: 380px;
    border: 1px solid rgba(232, 223, 208, 0.5);
    position: relative;
    z-index: 1;
}

.seal {
    width: 64px;
    height: 64px;
    background: var(--cinnabar);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-family: "STKaiti", serif;
    font-size: 28px;
    font-weight: 700;
    box-shadow: 0 6px 18px rgba(179, 60, 44, 0.3);
    margin: 0 auto 18px;
}

h2 {
    font-family: "STKaiti", serif;
    font-size: 22px;
    text-align: center;
    margin-bottom: 4px;
}

.sub {
    text-align: center;
    color: var(--ink-muted);
    font-size: 13px;
    margin-bottom: 28px;
}

:deep(.el-form-item) {
    margin-bottom: 16px;
}

:deep(.el-input__wrapper) {
    background: var(--paper-warm);
    box-shadow: none;
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 11px 14px;

    &:hover {
        box-shadow: none;
    }

    &.is-focus {
        box-shadow: none;
        border-color: var(--jade);
        background: white;
    }
}

.login-btn {
    width: 100%;
    margin-top: 8px;
    background: var(--cinnabar);
    border-color: var(--cinnabar);
    font-weight: 600;

    &:hover {
        background: #9c3325;
        border-color: #9c3325;
    }
}

.login-tip {
    text-align: center;
    font-size: 12px;
    color: var(--ink-muted);
    margin-top: 14px;
}

.back-to-user-login {
    text-align: center;
    margin-top: 16px;
    font-size: 13px;
    color: var(--ink-muted);

    .link-btn {
        background: none;
        border: none;
        color: var(--cinnabar);
        cursor: pointer;
        font-size: 13px;
        padding: 0;
        margin-left: 4px;
        text-decoration: underline;

        &:hover {
            color: #9c3325;
        }
    }
}
</style>
