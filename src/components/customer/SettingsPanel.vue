<template>
    <div class="settings-panel">
        <div class="section-title font-serif">个人设置</div>

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
                    <div style="font-family: &quot;STKaiti&quot;, serif">
                        {{ agentId }} · {{ agentName }}
                    </div>
                </div>
                <div class="setting-row">
                    <div>
                        <div class="setting-label">职能角色</div>
                        <div class="setting-desc">影响客户分配的职能匹配</div>
                    </div>
                    <span class="tag tag-jade">{{ agentRole }}</span>
                </div>
                <div class="setting-row">
                    <div>
                        <div class="setting-label">同时接待上限</div>
                        <div class="setting-desc">达到上限后不再分配新客户</div>
                    </div>
                    <div>5 个会话</div>
                </div>
            </div>
        </div>

        <!-- 自动欢迎语 -->
        <div class="panel-card">
            <div class="panel-card-head">
                <h3>自动欢迎语</h3>
            </div>
            <div class="panel-card-body">
                <el-input
                    v-model="welcomeMessage"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入自动欢迎语"
                />
            </div>
        </div>

        <!-- 常用语库 -->
        <div class="panel-card">
            <div class="panel-card-head">
                <h3>常用语库</h3>
                <el-button type="primary" size="small">+ 新增</el-button>
            </div>
            <div class="panel-card-body">
                <div class="quick-replies">
                    <el-tag
                        v-for="(reply, index) in quickReplies"
                        :key="index"
                        closable
                        @close="removeReply(index)"
                        style="margin: 4px"
                    >
                        {{ reply }}
                    </el-tag>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();

const agentId = computed(() => userStore.G_LoginInfo.account || "CS001");
const agentName = computed(() => userStore.G_LoginInfo.nickName || "小翠");
const agentRole = computed(() => {
    const roleMap: Record<number, string> = {
        4: "售前客服",
    };
    return roleMap[userStore.G_UserInfo.role_id] || "客服";
});

const welcomeMessage = ref("您好，这边是颐养阁售前客服小翠，很高兴为您服务～");

const quickReplies = ref([
    "满 88 元包邮，江浙沪次日达",
    "质量问题 7 天无理由退换",
    "具体可看商品详情页的功效说明",
    "建议您先做一次体质测试再选购",
    "这款适合气血不足、手脚冰凉的朋友",
]);

function removeReply(index: number) {
    quickReplies.value.splice(index, 1);
}
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

.setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid var(--line);

    &:last-child {
        border-bottom: none;
    }
}

.setting-label {
    font-size: 14px;
}

.setting-desc {
    font-size: 12px;
    color: var(--ink-muted);
    margin-top: 2px;
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
}

.quick-replies {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
</style>
