<template>
    <el-dialog
        v-model="dialogVisible"
        :title="isLoginMode ? '用户登录' : '用户注册'"
        width="400px"
        :close-on-click-modal="false"
        @close="handleClose"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="80px"
        >
            <el-form-item label="账号" prop="account">
                <el-input
                    v-model="formData.account"
                    placeholder="请输入账号"
                    prefix-icon="User"
                />
            </el-form-item>

            <el-form-item label="密码" prop="password">
                <el-input
                    v-model="formData.password"
                    type="password"
                    placeholder="请输入密码"
                    prefix-icon="Lock"
                    show-password
                />
            </el-form-item>

            <el-form-item
                v-if="!isLoginMode"
                label="确认密码"
                prop="confirmPassword"
            >
                <el-input
                    v-model="formData.confirmPassword"
                    type="password"
                    placeholder="请再次输入密码"
                    prefix-icon="Lock"
                    show-password
                />
            </el-form-item>

            <el-form-item v-if="!isLoginMode" label="邮箱" prop="email">
                <el-input
                    v-model="formData.email"
                    placeholder="请输入邮箱"
                    prefix-icon="Message"
                />
            </el-form-item>
        </el-form>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleClose">取消</el-button>
                <el-button
                    type="primary"
                    @click="handleSubmit"
                    :loading="loading"
                >
                    {{ isLoginMode ? "登录" : "注册" }}
                </el-button>
            </div>
            <div class="switch-mode">
                <span v-if="isLoginMode">
                    还没有账号？
                    <el-link type="primary" @click="switchMode"
                        >立即注册</el-link
                    >
                </span>
                <span v-else>
                    已有账号？
                    <el-link type="primary" @click="switchMode"
                        >立即登录</el-link
                    >
                </span>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/store/user";
import { ApiUser } from "@/network/user";

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void;
}>();

const userStore = useUserStore();
const formRef = ref<FormInstance>();
const loading = ref(false);
const isLoginMode = ref(true);

const dialogVisible = ref(props.modelValue);

// 表单数据
const formData = reactive({
    account: "",
    password: "",
    confirmPassword: "",
    email: "",
});

// 表单验证规则
const rules = reactive<FormRules>({
    account: [
        { required: true, message: "请输入账号", trigger: "blur" },
        {
            min: 3,
            max: 20,
            message: "账号长度在 3 到 20 个字符",
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
    confirmPassword: [
        { required: true, message: "请再次输入密码", trigger: "blur" },
        {
            validator: (_rule, value, callback) => {
                if (value !== formData.password) {
                    callback(new Error("两次输入密码不一致"));
                } else {
                    callback();
                }
            },
            trigger: "blur",
        },
    ],
    email: [
        { required: true, message: "请输入邮箱", trigger: "blur" },
        { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
    ],
});

// 监听props变化
watch(
    () => props.modelValue,
    (val) => {
        dialogVisible.value = val;
    },
);

// 监听dialogVisible变化
watch(dialogVisible, (val) => {
    emit("update:modelValue", val);
});

// 切换登录/注册模式
const switchMode = () => {
    isLoginMode.value = !isLoginMode.value;
    // 重置表单
    formRef.value?.resetFields();
};

// 关闭对话框
const handleClose = () => {
    dialogVisible.value = false;
    formRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return;

    await formRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true;
            try {
                if (isLoginMode.value) {
                    // 登录逻辑
                    const result = await ApiUser.login({
                        username: formData.account,
                        password: formData.password,
                    });

                    if (result) {
                        ElMessage.success("登录成功");
                        // 更新用户状态
                        userStore.G_LoginInfo.isLogin = true;
                        userStore.G_LoginInfo.account = formData.account;
                        userStore.G_LoginInfo.nickName =
                            result.nickName || formData.account;
                        handleClose();
                    } else {
                        ElMessage.error("登录失败，请检查账号密码");
                    }
                } else {
                    // 注册逻辑
                    const result = await ApiUser.register({
                        account: formData.account,
                        password: formData.password,
                        email: formData.email,
                    });

                    if (result) {
                        ElMessage.success("注册成功，请登录");
                        // 切换到登录模式
                        isLoginMode.value = true;
                        formRef.value?.resetFields();
                    } else {
                        ElMessage.error("注册失败，请稍后重试");
                    }
                }
            } catch (error) {
                console.error("操作失败:", error);
                ElMessage.error(isLoginMode.value ? "登录失败" : "注册失败");
            } finally {
                loading.value = false;
            }
        }
    });
};
</script>

<style scoped lang="scss">
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-bottom: 15px;
}

.switch-mode {
    text-align: center;
    font-size: 14px;
    color: #606266;

    .el-link {
        margin-left: 5px;
    }
}
</style>
