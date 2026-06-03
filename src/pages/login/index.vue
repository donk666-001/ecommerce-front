<template>
    <div class="login-page">
        <!-- 动态森林背景 -->
        <LandingScene />

        <!-- 顶部漫射环境光，模拟树冠间隙 -->
        <div class="ambient-light" aria-hidden="true"></div>

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
                    <el-form-item label="性别">
                        <el-radio-group v-model="registerForm.gender">
                            <el-radio :value="1">男</el-radio>
                            <el-radio :value="2">女</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-button class="submit-btn" type="primary" size="large" :loading="loading" @click="submitRegister">注册</el-button>
                </el-form>

                <p class="form-trust">安全登录 · 数据加密传输</p>
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
import { resolvePostLoginPath } from "@/utils";
import LandingScene from "@/components/landing/LandingScene.vue";

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
const registerForm = reactive({ account: "", email: "", password: "", confirmPassword: "", gender: 0 });

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
        backgroundColor: "rgba(240, 248, 238, 0.92)", // 柔白，不刺眼
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
        backgroundColor: "#3d5c7a", // 青玄：深邃如夜林
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
        backgroundColor: "#1e2c22", // 墨林：森林深处的暗色
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
        backgroundColor: "#a06040", // 陶土：树皮与泥土的暖褐
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
        backgroundColor: "#7a9e6a", // 苔绿：苔藓与嫩叶
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
    return resolvePostLoginPath(userStore.G_UserInfo.role_id, route.query.redirect);
}

async function submitLogin() {
    const valid = await loginFormRef.value?.validate().catch(() => false);
    if (!valid) return;

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
            const codes: number[] = result.privileges ?? [];
            const role_id = codes.includes(100) ? 1 : codes.includes(200) ? 2 : 3;
            userStore.G_UserInfo = { ...userStore.G_UserInfo, role_id };
            userStore.isInitialized = true;
            sessionStorage.setItem("tab-user-id", String(result.id));
            await userStore.loadUserInfo();
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
            // gender=0 表示用户未选择，传 undefined 让后端沿用默认值
            gender: registerForm.gender === 0 ? undefined : registerForm.gender,
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
    background: #0c180a; // 森林场景图加载前的兜底暗色
    position: relative; // 让 .form-light 的 absolute 相对此容器定位
}

// ── 左侧品牌面板 ──────────────────────────────────
.brand-panel {
    width: 48%;
    background: rgba(28, 55, 41, 0.55); // jade 半透明遮罩，透出森林背景
    backdrop-filter: blur(3px);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 52px 40px 44px;
    flex-shrink: 0;
    z-index: 1;
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
    opacity: 0.88; // 略微半透，融入森林氛围
    filter: saturate(0.9); // 轻微降饱和，更自然
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
    align-items: center;
    justify-content: center;
    background: rgba(4, 10, 6, 0.38); // 半透明，让森林背景透出
    border-left: 1px solid rgba(92, 131, 116, 0.15);
    position: relative;
    z-index: 1;
    overflow: hidden;

    // 右上角暗角，增加内聚感
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 85% 10%, transparent 45%, rgba(0, 0, 0, 0.3) 100%);
        pointer-events: none;
    }
}

.form-area {
    width: 100%;
    max-width: 340px;
    padding: 0 8px;
    position: relative;
    z-index: 1;
}

// ── Tab 切换 ──────────────────────────────────────
.mode-tabs {
    display: flex;
    gap: 0;
    margin-bottom: 36px;
    // 细玉石线，呼应品牌色
    border-bottom: 1px solid rgba(92, 131, 116, 0.25);

    button {
        background: none;
        border: none;
        padding: 12px 0;
        margin-right: 36px;
        font-size: 17px;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.32);
        cursor: pointer;
        position: relative;
        transition: color 0.22s ease-out;
        letter-spacing: 0.06em;
        font-family: var(--font-serif, Georgia, serif);

        &.active {
            color: rgba(255, 255, 255, 0.92);
            font-weight: 600;

            &::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                width: 100%;
                height: 1px;
                background: #6dba90; // jade green 强调线
            }
        }

        &:hover:not(.active) { color: rgba(255, 255, 255, 0.55); }
    }
}

// ── 表单 ──────────────────────────────────────────
.auth-form {
    display: flex;
    flex-direction: column;

    :deep(.el-form-item) { margin-bottom: 18px; }

    :deep(.el-form-item__error) { color: #f0a090; font-size: 12px; }

    :deep(.el-input__wrapper) {
        // 极简深色输入框：无填充，只有细边框
        background: rgba(0, 0, 0, 0.28);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow: none;
        transition: border-color 0.2s ease-out, background 0.2s ease-out;
        padding: 0 14px;

        &:hover {
            background: rgba(0, 0, 0, 0.35);
            border-color: rgba(255, 255, 255, 0.3);
        }

        &.is-focus {
            background: rgba(255, 255, 255, 0.06) !important;
            border-color: rgba(109, 186, 144, 0.6) !important; // jade 聚焦色
            box-shadow: none !important;
        }
    }

    :deep(.el-input__inner) {
        height: 46px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.88);
        background: transparent;
        caret-color: #6dba90;
        letter-spacing: 0.02em;

        &::placeholder { color: rgba(255, 255, 255, 0.28); }
    }

    :deep(.el-input__prefix-icon) {
        color: rgba(255, 255, 255, 0.28);
        font-size: 15px;
    }

    :deep(.el-radio__label) { color: rgba(255, 255, 255, 0.65); font-size: 13px; }
    :deep(.el-radio__inner) {
        border-color: rgba(255, 255, 255, 0.2);
        background: transparent;
    }
    :deep(.el-radio__input.is-checked .el-radio__inner) {
        border-color: #6dba90;
        background: #6dba90;
    }
    :deep(.el-form-item__label) { color: rgba(255, 255, 255, 0.55); font-size: 13px; }
}

.pw-eye {
    cursor: pointer;
    color: rgba(255, 255, 255, 0.3);
    transition: color 0.18s;

    &:hover { color: rgba(255, 255, 255, 0.7); }
}

.submit-btn {
    width: 100%;
    margin-top: 10px;
    height: 48px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 6px;
    background: #4a7260; // 沉稳的深玉色，不用渐变
    border: 1px solid rgba(109, 186, 144, 0.3);
    color: rgba(255, 255, 255, 0.92);
    letter-spacing: 0.12em;
    font-family: var(--font-serif, Georgia, serif);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    transition: background 0.2s ease-out, transform 0.12s ease-out;

    &:hover {
        background: #5a8a70 !important;
        border-color: rgba(109, 186, 144, 0.5) !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    }

    &:active {
        transform: translateY(0) !important;
        background: #3f6455 !important;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3) !important;
    }
}

// ── 底部信任提示 ───────────────────────────────────
.form-trust {
    margin-top: 24px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.18);
    letter-spacing: 0.1em;
    text-align: center;
}

// ── 顶部漫射环境光 ─────────────────────────────────────
// 宽幅径向渐变，模拟树冠间隙漫射光，不是光柱
.ambient-light {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(
        ellipse 90% 50% at 62% -5%,
        rgba(210, 235, 185, 0.18) 0%,
        rgba(180, 220, 160, 0.06) 45%,
        transparent 70%
    );
    animation: ambientPulse 12s ease-in-out infinite alternate;
}

@keyframes ambientPulse {
    0%   { opacity: 0.6; }
    100% { opacity: 1;   }
}

// ── 隐藏 LandingScene 的 god rays，保留 sun-bloom 柔光晕 ──
:deep(.god-rays) {
    display: none;
}

// ── 响应式 ────────────────────────────────────────
@media (max-width: 900px) {
    .login-page { flex-direction: column; }

    .brand-panel {
        width: 100%;
        padding: 40px 28px 28px;
    }

    .stage-wrap { display: none; }

    .brand-quote blockquote { font-size: 24px; }
    .brand-watermark { font-size: 220px; bottom: -40px; right: -20px; }

    .form-panel {
        min-height: 50vh;
        border-left: none;
        border-top: 1px solid rgba(92, 131, 116, 0.15);
    }

    .form-area { padding: 0 8px; }
}
</style>
