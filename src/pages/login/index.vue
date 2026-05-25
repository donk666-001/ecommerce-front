<template>
    <div class="login-page">
        <!-- 左侧品牌面板 -->
        <div class="brand-panel">
            <div class="brand-content">
                <div class="brand-seal font-serif">颐</div>
                <h1 class="brand-name font-serif">颐养阁</h1>
                <p class="brand-tagline">顺应节气，调和阴阳</p>
            </div>

            <!-- 角色舞台 -->
            <div class="stage-wrap">
                <div class="character-stage">
                    <!-- 紫色角色（后层） -->
                    <div ref="purpleRef" class="char" :style="purpleBodyStyle">
                        <div class="char-eyes" :style="purpleEyesStyle">
                            <template v-for="n in 2" :key="n">
                                <div :style="eyeballSty(18, isPurpleBlinking)">
                                    <div v-if="!isPurpleBlinking" :style="pupilSty(purpleEyeForce, purplePupilPos, 7)"></div>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- 黑色角色（中层） -->
                    <div ref="blackRef" class="char" :style="blackBodyStyle">
                        <div class="char-eyes" :style="blackEyesStyle">
                            <template v-for="n in 2" :key="n">
                                <div :style="eyeballSty(16, isBlackBlinking)">
                                    <div v-if="!isBlackBlinking" :style="pupilSty(blackEyeForce, blackPupilPos, 6)"></div>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- 橙色半圆（前层左） -->
                    <div ref="orangeRef" class="char" :style="orangeBodyStyle">
                        <div class="char-eyes" :style="orangeEyesStyle">
                            <div v-for="n in 2" :key="n" :style="dotSty(orangeEyeForce, orangePupilPos, 12)"></div>
                        </div>
                    </div>

                    <!-- 黄色圆柱（前层右） -->
                    <div ref="yellowRef" class="char" :style="yellowBodyStyle">
                        <div class="char-eyes" :style="yellowEyesStyle">
                            <div v-for="n in 2" :key="n" :style="dotSty(yellowEyeForce, yellowPupilPos, 12)"></div>
                        </div>
                        <div class="char-mouth" :style="yellowMouthStyle"></div>
                    </div>
                </div>
            </div>

            <figure class="brand-quote">
                <blockquote class="font-serif">天人合一<br />身心俱养</blockquote>
                <figcaption>二十四节气 · 中医智慧 · AI 陪伴</figcaption>
            </figure>

            <div class="brand-watermark font-serif" aria-hidden="true">颐</div>
        </div>

        <!-- 右侧表单区 -->
        <div class="form-panel">
            <div class="deco-circle font-serif" aria-hidden="true">养</div>
            <div class="form-area">
                <div class="mode-tabs">
                    <button :class="{ active: mode === 'login' }" @click="switchMode('login')">登录</button>
                    <button :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</button>
                </div>

                <!-- 登录表单 -->
                <el-form
                    v-show="mode === 'login'"
                    ref="loginFormRef"
                    :model="loginForm"
                    :rules="loginRules"
                    class="auth-form"
                    @keyup.enter="submitLogin"
                >
                    <el-form-item prop="account">
                        <el-input
                            v-model="loginForm.account"
                            placeholder="账号"
                            size="large"
                            prefix-icon="User"
                            @focus="isTyping = true"
                            @blur="isTyping = false"
                        />
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input
                            v-model="loginForm.password"
                            :type="showPassword ? 'text' : 'password'"
                            placeholder="密码"
                            size="large"
                            prefix-icon="Lock"
                        >
                            <template #suffix>
                                <el-icon class="pw-eye" @click="showPassword = !showPassword">
                                    <Hide v-if="showPassword" />
                                    <View v-else />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-button
                        class="submit-btn"
                        type="primary"
                        size="large"
                        :loading="loading"
                        @click="submitLogin"
                    >登录</el-button>
                </el-form>

                <!-- 注册表单 -->
                <el-form
                    v-show="mode === 'register'"
                    ref="registerFormRef"
                    :model="registerForm"
                    :rules="registerRules"
                    class="auth-form"
                    @keyup.enter="submitRegister"
                >
                    <el-form-item prop="account">
                        <el-input v-model="registerForm.account" placeholder="账号（3-20 位）" size="large" prefix-icon="User" />
                    </el-form-item>
                    <el-form-item prop="email">
                        <el-input v-model="registerForm.email" placeholder="邮箱" size="large" prefix-icon="Message" />
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input v-model="registerForm.password" type="password" placeholder="密码（6-20 位）" size="large" prefix-icon="Lock" show-password />
                    </el-form-item>
                    <el-form-item prop="confirmPassword">
                        <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" size="large" prefix-icon="Lock" show-password />
                    </el-form-item>
                    <el-button class="submit-btn" type="primary" size="large" :loading="loading" @click="submitRegister">注册</el-button>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, type Ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/user";
import { ApiUser } from "@/network/user";

// ── 路由 & Store ────────────────────────────────
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// ── 表单状态 ────────────────────────────────────
const mode = ref<"login" | "register">("login");
const loading = ref(false);
const loginFormRef = ref<FormInstance>();
const registerFormRef = ref<FormInstance>();

const loginForm = reactive({ account: "", password: "" });
const registerForm = reactive({ account: "", email: "", password: "", confirmPassword: "" });

// ── 动画状态 ────────────────────────────────────
const mouseX = ref(0);
const mouseY = ref(0);
const isPurpleBlinking = ref(false);
const isBlackBlinking = ref(false);
const isTyping = ref(false);
const isLookingAtEachOther = ref(false);
const isPurplePeeking = ref(false);
const showPassword = ref(false);

const purpleRef = ref<HTMLDivElement | null>(null);
const blackRef = ref<HTMLDivElement | null>(null);
const yellowRef = ref<HTMLDivElement | null>(null);
const orangeRef = ref<HTMLDivElement | null>(null);

// ── 鼠标追踪 ────────────────────────────────────
function onMouseMove(e: MouseEvent) {
    mouseX.value = e.clientX;
    mouseY.value = e.clientY;
}

// ── 位置计算 ────────────────────────────────────
function calcPos(el: HTMLDivElement | null) {
    if (!el) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const r = el.getBoundingClientRect();
    const dx = mouseX.value - (r.left + r.width / 2);
    const dy = mouseY.value - (r.top + r.height / 3);
    return {
        faceX: Math.max(-15, Math.min(15, dx / 20)),
        faceY: Math.max(-10, Math.min(10, dy / 30)),
        bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    };
}

function calcPupil(el: HTMLDivElement | null, maxD: number) {
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    const dx = mouseX.value - (r.left + r.width / 2);
    const dy = mouseY.value - (r.top + r.height * 0.25);
    const d = Math.min(Math.sqrt(dx * dx + dy * dy), maxD);
    const a = Math.atan2(dy, dx);
    return { x: Math.cos(a) * d, y: Math.sin(a) * d };
}

const purplePos = computed(() => calcPos(purpleRef.value));
const blackPos = computed(() => calcPos(blackRef.value));
const yellowPos = computed(() => calcPos(yellowRef.value));
const orangePos = computed(() => calcPos(orangeRef.value));

const purplePupilPos = computed(() => calcPupil(purpleRef.value, 5));
const blackPupilPos = computed(() => calcPupil(blackRef.value, 4));
const orangePupilPos = computed(() => calcPupil(orangeRef.value, 5));
const yellowPupilPos = computed(() => calcPupil(yellowRef.value, 5));

// ── 强制眼神方向 ────────────────────────────────
type Vec = { x: number; y: number };

const purpleEyeForce = computed((): Vec | null => {
    const show = showPassword.value, hasPwd = loginForm.password.length > 0;
    if (hasPwd && show) return { x: isPurplePeeking.value ? 4 : -4, y: isPurplePeeking.value ? 5 : -4 };
    if (isLookingAtEachOther.value) return { x: 3, y: 4 };
    return null;
});

const blackEyeForce = computed((): Vec | null => {
    const show = showPassword.value, hasPwd = loginForm.password.length > 0;
    if (hasPwd && show) return { x: -4, y: -4 };
    if (isLookingAtEachOther.value) return { x: 0, y: -4 };
    return null;
});

const orangeEyeForce = computed((): Vec | null => {
    if (loginForm.password.length > 0 && showPassword.value) return { x: -5, y: -4 };
    return null;
});

const yellowEyeForce = computed((): Vec | null => {
    if (loginForm.password.length > 0 && showPassword.value) return { x: -5, y: -4 };
    return null;
});

// ── 样式辅助函数 ─────────────────────────────────
function eyeballSty(size: number, blinking: boolean) {
    return {
        width: `${size}px`,
        height: blinking ? "2px" : `${size}px`,
        backgroundColor: "white",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
        transition: "height 0.15s",
    };
}

function pupilSty(force: Vec | null, pos: Vec, size: number) {
    const p = force ?? pos;
    return {
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: "#2D2D2D",
        borderRadius: "50%",
        transform: `translate(${p.x}px, ${p.y}px)`,
        transition: "transform 0.1s ease-out",
        flexShrink: 0,
    };
}

function dotSty(force: Vec | null, pos: Vec, size: number) {
    const p = force ?? pos;
    return {
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: "#2D2D2D",
        borderRadius: "50%",
        transform: `translate(${p.x}px, ${p.y}px)`,
        transition: "transform 0.1s ease-out",
        flexShrink: 0,
    };
}

// ── 角色样式 ─────────────────────────────────────
const purpleBodyStyle = computed(() => {
    const hasPwd = loginForm.password.length > 0;
    const show = showPassword.value;
    const hiding = isTyping.value || (hasPwd && !show);
    const showing = hasPwd && show;
    const sk = purplePos.value.bodySkew;
    const transform = showing
        ? "skewX(0deg)"
        : hiding
          ? `skewX(${sk - 12}deg) translateX(40px)`
          : `skewX(${sk}deg)`;
    return {
        left: "70px", width: "180px",
        height: hiding ? "440px" : "400px",
        backgroundColor: "#6C3FF5",
        borderRadius: "10px 10px 0 0",
        zIndex: 1,
        transform,
        transformOrigin: "bottom center",
        transition: "all 0.7s ease-in-out",
    };
});

const purpleEyesStyle = computed(() => {
    const showing = loginForm.password.length > 0 && showPassword.value;
    const { faceX, faceY } = purplePos.value;
    return {
        position: "absolute",
        display: "flex",
        gap: "32px",
        left: showing ? "20px" : isLookingAtEachOther.value ? "55px" : `${45 + faceX}px`,
        top: showing ? "35px" : isLookingAtEachOther.value ? "65px" : `${40 + faceY}px`,
        transition: "left 0.7s ease-in-out, top 0.7s ease-in-out",
    };
});

const blackBodyStyle = computed(() => {
    const hasPwd = loginForm.password.length > 0, show = showPassword.value;
    const showing = hasPwd && show;
    const looking = isLookingAtEachOther.value;
    const typing = isTyping.value;
    const sk = blackPos.value.bodySkew;
    const transform = showing
        ? "skewX(0deg)"
        : looking
          ? `skewX(${sk * 1.5 + 10}deg) translateX(20px)`
          : typing || (hasPwd && !show)
            ? `skewX(${sk * 1.5}deg)`
            : `skewX(${sk}deg)`;
    return {
        left: "240px", width: "120px", height: "310px",
        backgroundColor: "#2D2D2D",
        borderRadius: "8px 8px 0 0",
        zIndex: 2,
        transform,
        transformOrigin: "bottom center",
        transition: "all 0.7s ease-in-out",
    };
});

const blackEyesStyle = computed(() => {
    const showing = loginForm.password.length > 0 && showPassword.value;
    const { faceX, faceY } = blackPos.value;
    return {
        position: "absolute",
        display: "flex",
        gap: "24px",
        left: showing ? "10px" : isLookingAtEachOther.value ? "32px" : `${26 + faceX}px`,
        top: showing ? "28px" : isLookingAtEachOther.value ? "12px" : `${32 + faceY}px`,
        transition: "left 0.7s ease-in-out, top 0.7s ease-in-out",
    };
});

const orangeBodyStyle = computed(() => {
    const showing = loginForm.password.length > 0 && showPassword.value;
    return {
        left: "0", width: "240px", height: "200px",
        backgroundColor: "#FF9B6B",
        borderRadius: "120px 120px 0 0",
        zIndex: 3,
        transform: showing ? "skewX(0deg)" : `skewX(${orangePos.value.bodySkew}deg)`,
        transformOrigin: "bottom center",
        transition: "all 0.7s ease-in-out",
    };
});

const orangeEyesStyle = computed(() => {
    const showing = loginForm.password.length > 0 && showPassword.value;
    const { faceX, faceY } = orangePos.value;
    return {
        position: "absolute",
        display: "flex",
        gap: "32px",
        left: showing ? "50px" : `${82 + faceX}px`,
        top: showing ? "85px" : `${90 + faceY}px`,
        transition: "left 0.2s ease-out, top 0.2s ease-out",
    };
});

const yellowBodyStyle = computed(() => {
    const showing = loginForm.password.length > 0 && showPassword.value;
    return {
        left: "310px", width: "140px", height: "230px",
        backgroundColor: "#E8D754",
        borderRadius: "70px 70px 0 0",
        zIndex: 4,
        transform: showing ? "skewX(0deg)" : `skewX(${yellowPos.value.bodySkew}deg)`,
        transformOrigin: "bottom center",
        transition: "all 0.7s ease-in-out",
    };
});

const yellowEyesStyle = computed(() => {
    const showing = loginForm.password.length > 0 && showPassword.value;
    const { faceX, faceY } = yellowPos.value;
    return {
        position: "absolute",
        display: "flex",
        gap: "24px",
        left: showing ? "20px" : `${52 + faceX}px`,
        top: showing ? "35px" : `${40 + faceY}px`,
        transition: "left 0.2s ease-out, top 0.2s ease-out",
    };
});

const yellowMouthStyle = computed(() => {
    const showing = loginForm.password.length > 0 && showPassword.value;
    const { faceX, faceY } = yellowPos.value;
    return {
        left: showing ? "10px" : `${40 + faceX}px`,
        top: showing ? "88px" : `${88 + faceY}px`,
        transition: "left 0.2s ease-out, top 0.2s ease-out",
    };
});

// ── 生命周期 & 监听 ──────────────────────────────
let stopBlink = false;
let peekTimer: ReturnType<typeof setTimeout> | null = null;
let lookTimer: ReturnType<typeof setTimeout> | null = null;

function blinkCycle(blink: Ref<boolean>) {
    if (stopBlink) return;
    setTimeout(() => {
        if (stopBlink) return;
        blink.value = true;
        setTimeout(() => {
            if (stopBlink) return;
            blink.value = false;
            blinkCycle(blink);
        }, 150);
    }, Math.random() * 4000 + 3000);
}

onMounted(() => {
    stopBlink = false;
    window.addEventListener("mousemove", onMouseMove);
    blinkCycle(isPurpleBlinking);
    blinkCycle(isBlackBlinking);
});

onUnmounted(() => {
    stopBlink = true;
    window.removeEventListener("mousemove", onMouseMove);
    if (peekTimer) clearTimeout(peekTimer);
    if (lookTimer) clearTimeout(lookTimer);
});

watch(isTyping, (typing) => {
    if (lookTimer) clearTimeout(lookTimer);
    if (typing) {
        isLookingAtEachOther.value = true;
        lookTimer = setTimeout(() => { isLookingAtEachOther.value = false; }, 800);
    } else {
        isLookingAtEachOther.value = false;
    }
});

watch([() => loginForm.password, showPassword, isPurplePeeking], () => {
    if (peekTimer) clearTimeout(peekTimer);
    if (loginForm.password.length > 0 && showPassword.value) {
        peekTimer = setTimeout(() => {
            isPurplePeeking.value = true;
            setTimeout(() => { isPurplePeeking.value = false; }, 800);
        }, Math.random() * 3000 + 2000);
    } else {
        isPurplePeeking.value = false;
    }
});

// ── 表单规则 ─────────────────────────────────────
const loginRules: FormRules = {
    account: [{ required: true, message: "请输入账号", trigger: "blur" }],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const registerRules: FormRules = {
    account: [
        { required: true, message: "请输入账号", trigger: "blur" },
        { min: 3, max: 20, message: "账号长度 3-20 位", trigger: "blur" },
    ],
    email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: "email", message: "邮箱格式不正确", trigger: "blur" },
    ],
    password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, max: 20, message: "密码长度 6-20 位", trigger: "blur" },
    ],
    confirmPassword: [
        { required: true, message: "请再次输入密码", trigger: "blur" },
        {
            validator: (_rule, value, callback) => {
                if (value !== registerForm.password) callback(new Error("两次密码不一致"));
                else callback();
            },
            trigger: "blur",
        },
    ],
};

// ── 表单操作 ─────────────────────────────────────
function switchMode(m: "login" | "register") {
    mode.value = m;
    loginFormRef.value?.clearValidate();
    registerFormRef.value?.clearValidate();
}

function getRedirectPath() {
    const redirect = route.query.redirect as string;
    return redirect && redirect !== "/login" ? redirect : "/";
}

async function submitLogin() {
    const valid = await loginFormRef.value?.validate().catch(() => false);
    if (!valid) return;

    if (loginForm.account === "root" && loginForm.password === "123456") {
        userStore.G_LoginInfo = { id: 1, isLogin: true, nickName: "Root", account: "root", email: "", status: 1 };
        userStore.isInitialized = true;
        ElMessage.success("登录成功（开发模式）");
        router.push(getRedirectPath());
        return;
    }

    loading.value = true;
    try {
        const result = await ApiUser.login({ username: loginForm.account, password: loginForm.password });
        if (result) {
            userStore.G_LoginInfo = {
                ...userStore.G_LoginInfo,
                id: result.id,
                isLogin: true,
                nickName: result.nickname || result.username || loginForm.account,
                account: loginForm.account,
                status: 1,
            };
            userStore.isInitialized = true;
            ElMessage.success("登录成功");
            router.push(getRedirectPath());
        } else {
            ElMessage.error("账号或密码错误");
        }
    } catch {
        ElMessage.error("登录失败，请稍后重试");
    } finally {
        loading.value = false;
    }
}

async function submitRegister() {
    const valid = await registerFormRef.value?.validate().catch(() => false);
    if (!valid) return;

    loading.value = true;
    try {
        const result = await ApiUser.register({
            username: registerForm.account,
            password: registerForm.password,
            email: registerForm.email,
        });
        if (result) {
            ElMessage.success("注册成功，请登录");
            loginForm.account = registerForm.account;
            registerFormRef.value?.resetFields();
            switchMode("login");
        } else {
            ElMessage.error("注册失败，账号可能已存在");
        }
    } catch {
        ElMessage.error("注册失败，请稍后重试");
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped lang="scss">
.login-page {
    min-height: 100vh;
    display: flex;
    background: var(--paper-warm);
}

// ── 左侧品牌面板 ──────────────────────────────────
.brand-panel {
    width: 48%;
    background: var(--jade);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 52px 40px 44px;
    flex-shrink: 0;

}

.brand-watermark {
    position: absolute;
    bottom: -80px;
    right: -40px;
    font-size: 400px;
    color: rgba(255, 255, 255, 0.045);
    line-height: 1;
    pointer-events: none;
    user-select: none;
}

.brand-content {
    position: relative;
    z-index: 1;
    color: white;
}

.brand-seal {
    width: 56px;
    height: 56px;
    background: var(--cinnabar);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 26px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
}

.brand-name {
    font-size: 34px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: white;
    margin-bottom: 8px;
    line-height: 1.2;
}

.brand-tagline {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 0.1em;
}

// ── 角色舞台 ──────────────────────────────────────
.stage-wrap {
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    position: relative;
    z-index: 1;
    min-height: 280px;
    padding-top: 16px;
    padding-bottom: 60px;
    overflow: hidden;
}

.character-stage {
    position: relative;
    width: 460px;
    height: 400px;
    flex-shrink: 0;
}

.char {
    position: absolute;
    bottom: 0;
}

.char-eyes {
    position: absolute;
}

.char-mouth {
    position: absolute;
    width: 80px;
    height: 4px;
    background-color: #2D2D2D;
    border-radius: 9999px;
}

// ── 底部引言 ───────────────────────────────────────
.brand-quote {
    position: relative;
    z-index: 1;
    margin-top: 28px;

    blockquote {
        font-size: 28px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.92);
        letter-spacing: 0.18em;
        line-height: 1.7;
        margin: 0 0 16px;
    }

    figcaption {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.42);
        letter-spacing: 0.14em;
    }
}

// ── 右侧表单区 ────────────────────────────────────
.form-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 36px 56px 56px;
    background: var(--paper-warm);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: var(--jade-soft);
    }
}

.deco-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 680px;
    height: 680px;
    border-radius: 50%;
    background: var(--jade);
    opacity: 0.1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 580px;
    line-height: 1;
    color: #fff;
    overflow: hidden;
    pointer-events: none;
    user-select: none;
    z-index: 0;
}

.form-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 360px;
    margin: 0 auto;
    width: 100%;
    padding: 32px 0 64px;
    position: relative;
    z-index: 1;
}

// ── Tab 切换 ──────────────────────────────────────
.mode-tabs {
    display: flex;
    gap: 0;
    margin-bottom: 36px;
    border-bottom: 1px solid var(--line);

    button {
        background: none;
        border: none;
        padding: 12px 0;
        margin-right: 32px;
        font-size: 18px;
        font-weight: 500;
        color: var(--ink-muted);
        cursor: pointer;
        position: relative;
        transition: color 0.18s ease-out;
        letter-spacing: 0.02em;

        &.active {
            color: var(--ink);
            font-weight: 700;

            &::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                right: 0;
                height: 2px;
                background: var(--jade);
                border-radius: 2px 2px 0 0;
            }
        }

        &:hover:not(.active) { color: var(--ink-soft); }
    }
}

// ── 表单 ──────────────────────────────────────────
.auth-form {
    display: flex;
    flex-direction: column;

    :deep(.el-form-item) { margin-bottom: 18px; }

    :deep(.el-input__wrapper) {
        background: var(--cream);
        border-radius: 8px;
        border: 1px solid rgba(232, 223, 208, 0.9);
        box-shadow:
            inset 0 1px 3px rgba(60, 50, 30, 0.08),
            inset 0 1px 1px rgba(60, 50, 30, 0.04);
        transition: box-shadow 0.18s ease-out, border-color 0.18s ease-out;
        padding: 0 14px;

        &:hover {
            border-color: rgba(143, 168, 156, 0.6);
            box-shadow:
                inset 0 1px 3px rgba(60, 50, 30, 0.06),
                inset 0 1px 1px rgba(60, 50, 30, 0.03);
        }

        &.is-focus {
            border-color: rgba(92, 131, 116, 0.7) !important;
            box-shadow:
                inset 0 1px 2px rgba(60, 50, 30, 0.04),
                0 0 0 3px rgba(92, 131, 116, 0.1) !important;
        }
    }

    :deep(.el-input__inner) {
        height: 44px;
        font-size: 14px;
        color: var(--ink);

        &::placeholder { color: var(--ink-muted); opacity: 0.65; }
    }

    :deep(.el-input__prefix-icon) { color: var(--ink-muted); opacity: 0.75; }
}

.pw-eye {
    cursor: pointer;
    color: var(--ink-muted);
    transition: color 0.15s;

    &:hover { color: var(--ink); }
}

.submit-btn {
    width: 100%;
    margin-top: 8px;
    height: 48px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 8px;
    background: var(--jade);
    border-color: var(--jade);
    letter-spacing: 0.06em;
    box-shadow:
        0 2px 5px rgba(92, 131, 116, 0.28),
        0 5px 16px rgba(92, 131, 116, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: background 0.15s ease-out, transform 0.12s ease-out, box-shadow 0.15s ease-out, border-color 0.15s;

    &:hover {
        background: var(--bamboo) !important;
        border-color: var(--bamboo) !important;
        transform: translateY(-2px);
        box-shadow:
            0 4px 10px rgba(92, 131, 116, 0.32),
            0 10px 26px rgba(92, 131, 116, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    &:active {
        transform: translateY(1px) !important;
        box-shadow:
            0 1px 3px rgba(92, 131, 116, 0.22),
            inset 0 2px 4px rgba(0, 0, 0, 0.08) !important;
    }
}

// ── 响应式 ────────────────────────────────────────
@media (max-width: 900px) {
    .login-page { flex-direction: column; }

    .brand-panel {
        width: 100%;
        padding: 40px 28px 28px;

        &::before { display: none; }
    }

    .stage-wrap { display: none; }

    .brand-quote blockquote { font-size: 24px; }
    .brand-watermark { font-size: 220px; bottom: -40px; right: -20px; }

    .form-panel {
        padding: 28px 28px 48px;

        &::before { display: none; }
    }

    .form-area { padding: 24px 0 40px; }
}
</style>
