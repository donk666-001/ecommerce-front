<template>
    <div class="agents-panel">
        <div class="section-header">
            <div class="section-title">
                <span class="section-dot"></span>客服管理
            </div>
        </div>

        <div class="toolbar-card">
            <div class="status-tabs">
                <button
                    v-for="f in filters"
                    :key="f.value"
                    class="status-tab"
                    :class="{ active: activeFilter === f.value }"
                    @click="activeFilter = f.value"
                >
                    {{ f.label }}
                    <span class="count">({{ filterCount(f.value) }})</span>
                </button>
            </div>
            <div class="search-input" style="margin-left: auto">
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    v-model="keyword"
                    type="text"
                    placeholder="搜索工号 / 姓名"
                />
            </div>
            <button
                class="btn btn-jade"
                style="margin-left: 8px"
                @click="openEdit(null)"
            >
                + 新增客服
            </button>
        </div>

        <div class="table-card">
            <table>
                <thead>
                    <tr>
                        <th>客服</th>
                        <th>工号</th>
                        <th>接待上限</th>
                        <th>在线状态</th>
                        <th>今日接待</th>
                        <th>今日消息</th>
                        <th>加入时间</th>
                        <th style="text-align: right">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="filtered.length === 0">
                        <td
                            colspan="8"
                            style="
                                text-align: center;
                                padding: 48px;
                                color: var(--ink-muted);
                            "
                        >
                            暂无客服数据
                        </td>
                    </tr>
                    <tr v-for="a in filtered" :key="a.account">
                        <td>
                            <div class="applicant">
                                <div class="applicant-avatar">
                                    {{ a.name[0] }}
                                </div>
                                <span class="applicant-name">{{ a.name }}</span>
                            </div>
                        </td>
                        <td style="color: var(--ink-muted)">{{ a.account }}</td>
                        <td>{{ a.currentLoad }} / {{ a.maxLoad }}</td>
                        <td>
                            <span
                                class="status-pill"
                                :class="
                                    a.status === 'online'
                                        ? 'pill-ok'
                                        : 'pill-no'
                                "
                            >
                                <span
                                    class="led"
                                    :class="ledClass(a.status)"
                                ></span>
                                {{ statusLabel(a.status) }}
                            </span>
                        </td>
                        <td>{{ a.todayServed }}</td>
                        <td>{{ a.todayMsgs }}</td>
                        <td style="color: var(--ink-muted); font-size: 13px">
                            {{ a.joinedAt }}
                        </td>
                        <td>
                            <div class="btn-group">
                                <button
                                    class="btn btn-ghost"
                                    @click="openEdit(a.account)"
                                >
                                    编辑
                                </button>
                                <button
                                    class="btn btn-gold"
                                    @click="toggleStatus(a.account)"
                                >
                                    {{ a.status === "off" ? "启用" : "下线" }}
                                </button>
                                <button
                                    class="btn btn-cinnabar"
                                    @click="openDeleteModal(a.account)"
                                >
                                    删除
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Edit / Add modal -->
        <div
            v-if="editModal"
            class="modal-mask show"
            @click.self="editModal = false"
        >
            <div class="modal wide">
                <div class="modal-header">
                    <h3 class="font-serif">
                        {{ editingAccount ? "编辑客服" : "新增客服" }}
                    </h3>
                    <button class="modal-close" @click="editModal = false">
                        ×
                    </button>
                </div>
                <div class="modal-body">
                    <div
                        style="
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 14px;
                        "
                    >
                        <div>
                            <label>工号</label>
                            <input
                                v-model="form.account"
                                type="text"
                                placeholder="如 CS006"
                                :disabled="!!editingAccount"
                            />
                        </div>
                        <div>
                            <label>姓名</label
                            ><input
                                v-model="form.name"
                                type="text"
                                placeholder="客服姓名"
                            />
                        </div>
                        <div>
                            <label>登录密码</label
                            ><input
                                v-model="form.pwd"
                                type="password"
                                :placeholder="
                                    editingAccount
                                        ? '留空则不修改密码'
                                        : '设置登录密码'
                                "
                            />
                        </div>
                        <div>
                            <label>同时接待上限</label
                            ><input
                                v-model.number="form.maxLoad"
                                type="number"
                                min="1"
                                max="10"
                            />
                        </div>
                        <div>
                            <label>工作时段</label
                            ><input
                                v-model="form.workHours"
                                type="text"
                                placeholder="09:00-18:00"
                            />
                        </div>
                    </div>
                    <div style="margin-top: 14px">
                        <label>自动欢迎语</label>
                        <textarea
                            v-model="form.welcome"
                            rows="3"
                            placeholder="客户进入会话时的自动欢迎语"
                        ></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn" @click="editModal = false">
                        取消
                    </button>
                    <button class="modal-btn primary-jade" @click="saveAgent">
                        保存
                    </button>
                </div>
            </div>
        </div>

        <!-- Delete confirm modal -->
        <div
            v-if="deleteModal"
            class="modal-mask show"
            @click.self="deleteModal = false"
        >
            <div class="modal">
                <div class="modal-header">
                    <h3 class="font-serif">删除客服账号</h3>
                    <button class="modal-close" @click="deleteModal = false">
                        ×
                    </button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 14px">
                        确认删除客服账号：<strong>{{ deleteTargetName }}</strong
                        >？
                    </p>
                    <p style="font-size: 12px; color: var(--cinnabar)">
                        删除后该客服将无法登录，历史会话记录保留。
                    </p>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn" @click="deleteModal = false">
                        取消
                    </button>
                    <button
                        class="modal-btn primary-cinnabar"
                        @click="confirmDelete"
                    >
                        确认删除
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Agent {
    account: string;
    name: string;
    maxLoad: number;
    currentLoad: number;
    status: string;
    todayServed: number;
    todayMsgs: number;
    joinedAt: string;
    welcome: string;
    workHours: string;
}

const agents = ref<Agent[]>([
    {
        account: "CS001",
        name: "小翠",
        maxLoad: 5,
        currentLoad: 3,
        status: "online",
        todayServed: 28,
        todayMsgs: 412,
        joinedAt: "2026-01-12",
        welcome: "您好，这边是颐养阁售前客服小翠，很高兴为您服务～",
        workHours: "09:00-18:00",
    },
    {
        account: "CS002",
        name: "阿岚",
        maxLoad: 5,
        currentLoad: 2,
        status: "online",
        todayServed: 19,
        todayMsgs: 286,
        joinedAt: "2026-02-08",
        welcome: "您好，售后客服阿岚为您服务～",
        workHours: "10:00-19:00",
    },
    {
        account: "CS003",
        name: "暮雨",
        maxLoad: 5,
        currentLoad: 0,
        status: "break",
        todayServed: 15,
        todayMsgs: 198,
        joinedAt: "2026-03-15",
        welcome: "您好，这边是颐养阁售前客服暮雨，很高兴为您服务～",
        workHours: "09:00-18:00",
    },
    {
        account: "CS004",
        name: "青霜",
        maxLoad: 5,
        currentLoad: 0,
        status: "off",
        todayServed: 0,
        todayMsgs: 0,
        joinedAt: "2026-05-01",
        welcome: "您好，售后客服青霜为您服务～",
        workHours: "13:00-22:00",
    },
    {
        account: "CS005",
        name: "松风",
        maxLoad: 8,
        currentLoad: 0,
        status: "online",
        todayServed: 8,
        todayMsgs: 65,
        joinedAt: "2026-05-20",
        welcome: "您好，这边是颐养阁官方客服，很高兴为您服务～",
        workHours: "09:00-18:00",
    },
]);

const activeFilter = ref("all");
const keyword = ref("");

const filters = [
    { label: "全部", value: "all" },
    { label: "在线", value: "online" },
    { label: "离线", value: "offline" },
];

function filterCount(f: string) {
    if (f === "all") return agents.value.length;
    if (f === "online")
        return agents.value.filter((a) => a.status === "online").length;
    return agents.value.filter((a) => a.status === "off").length;
}

const filtered = computed(() =>
    agents.value.filter((a) => {
        const matchFilter =
            activeFilter.value === "all" ||
            (activeFilter.value === "online" && a.status === "online") ||
            (activeFilter.value === "offline" && a.status === "off");
        const matchKw =
            !keyword.value ||
            a.name.includes(keyword.value) ||
            a.account.includes(keyword.value);
        return matchFilter && matchKw;
    }),
);

function statusLabel(s: string) {
    return ({ online: "在线", break: "小休", off: "离线" } as any)[s] ?? s;
}
function ledClass(s: string) {
    return (
        ({ online: "led-online", break: "led-busy", off: "led-off" } as any)[
            s
        ] ?? ""
    );
}

function toggleStatus(account: string) {
    const a = agents.value.find((x) => x.account === account);
    if (!a) return;
    if (a.status === "off") {
        a.status = "online";
        a.currentLoad = 0;
    } else {
        if (
            a.currentLoad > 0 &&
            !confirm(
                `该客服当前有 ${a.currentLoad} 个进行中的会话，强制下线将释放会话锁。确认？`,
            )
        )
            return;
        a.status = "off";
        a.currentLoad = 0;
    }
}

// Edit / add
const editModal = ref(false);
const editingAccount = ref<string | null>(null);
const form = ref({
    account: "",
    name: "",
    pwd: "",
    maxLoad: 5,
    workHours: "09:00-18:00",
    welcome: "您好，这边是颐养阁官方客服，很高兴为您服务～",
});

function openEdit(account: string | null) {
    editingAccount.value = account;
    if (account) {
        const a = agents.value.find((x) => x.account === account)!;
        form.value = {
            account: a.account,
            name: a.name,
            pwd: "",
            maxLoad: a.maxLoad,
            workHours: a.workHours,
            welcome: a.welcome,
        };
    } else {
        form.value = {
            account: "",
            name: "",
            pwd: "",
            maxLoad: 5,
            workHours: "09:00-18:00",
            welcome: "您好，这边是颐养阁官方客服，很高兴为您服务～",
        };
    }
    editModal.value = true;
}

function saveAgent() {
    if (!form.value.account || !form.value.name) {
        alert("工号和姓名不能为空");
        return;
    }
    if (editingAccount.value) {
        const a = agents.value.find((x) => x.account === editingAccount.value);
        if (a)
            Object.assign(a, {
                name: form.value.name,
                role: form.value.role,
                maxLoad: form.value.maxLoad,
                workHours: form.value.workHours,
                welcome: form.value.welcome,
            });
    } else {
        if (agents.value.find((x) => x.account === form.value.account)) {
            alert("工号已存在");
            return;
        }
        agents.value.push({
            account: form.value.account,
            name: form.value.name,
            role: form.value.role,
            maxLoad: form.value.maxLoad,
            currentLoad: 0,
            status: "off",
            todayServed: 0,
            todayMsgs: 0,
            joinedAt: new Date().toISOString().slice(0, 10),
            welcome: form.value.welcome,
            workHours: form.value.workHours,
        });
    }
    editModal.value = false;
}

// Delete
const deleteModal = ref(false);
const deleteTargetAcct = ref("");
const deleteTargetName = ref("");

function openDeleteModal(account: string) {
    const a = agents.value.find((x) => x.account === account)!;
    deleteTargetAcct.value = account;
    deleteTargetName.value = `${a.name}（${a.account}）`;
    deleteModal.value = true;
}
function confirmDelete() {
    agents.value = agents.value.filter(
        (a) => a.account !== deleteTargetAcct.value,
    );
    deleteModal.value = false;
}
</script>

<style scoped>
.agents-panel {
    padding: 24px 28px;
}
.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}
.section-title {
    font-family: "STKaiti", serif;
    font-size: 19px;
    font-weight: 600;
    color: var(--ink);
    display: flex;
    align-items: center;
    gap: 10px;
}
.section-dot {
    width: 8px;
    height: 8px;
    background: var(--cinnabar);
    border-radius: 50%;
    flex-shrink: 0;
}
.toolbar-card {
    background: var(--paper);
    border-radius: 14px;
    padding: 14px;
    box-shadow: 0 2px 12px rgba(60, 50, 30, 0.06);
    border: 1px solid rgba(232, 223, 208, 0.5);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}
.status-tabs {
    display: inline-flex;
    background: var(--cream);
    border-radius: 10px;
    padding: 4px;
}
.status-tab {
    background: transparent;
    border: none;
    padding: 7px 16px;
    font-size: 14px;
    color: var(--ink-muted);
    border-radius: 7px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
}
.status-tab.active {
    background: var(--paper);
    color: var(--cinnabar);
    font-weight: 600;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
}
.count {
    font-size: 12px;
    color: var(--ink-muted);
}
.search-input {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--cream);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 8px 12px;
    width: 240px;
}
.search-input input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 14px;
    color: var(--ink);
    font-family: inherit;
}
.table-card {
    background: var(--paper);
    border-radius: 14px;
    box-shadow: 0 2px 12px rgba(60, 50, 30, 0.06);
    border: 1px solid rgba(232, 223, 208, 0.5);
    overflow: hidden;
}
table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}
thead {
    background: var(--cream);
}
th {
    text-align: left;
    font-weight: 500;
    font-size: 13px;
    color: var(--ink-muted);
    padding: 12px 18px;
}
td {
    padding: 13px 18px;
    border-top: 1px solid var(--line);
    vertical-align: middle;
}
tr:hover td {
    background: rgba(250, 246, 238, 0.6);
}
.applicant {
    display: flex;
    align-items: center;
    gap: 10px;
}
.applicant-avatar {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    background: var(--cream);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
    color: var(--ink-muted);
}
.applicant-name {
    font-weight: 600;
    color: var(--ink);
    font-size: 14px;
}
.tag {
    display: inline-block;
    padding: 3px 10px;
    font-size: 12px;
    border-radius: 5px;
}
.tag-jade {
    background: var(--jade-soft);
    color: var(--jade);
}
.tag-cinnabar {
    background: var(--cinnabar-soft);
    color: var(--cinnabar);
}
.status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    font-size: 12px;
    border-radius: 5px;
}
.status-pill .led {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}
.pill-ok {
    background: var(--jade-soft);
    color: var(--jade);
}
.pill-ok .led {
    background: var(--jade);
}
.pill-no {
    background: #f0f0f0;
    color: var(--ink-muted);
}
.pill-no .led {
    background: #ccc;
}
.led-online {
    background: var(--jade) !important;
    box-shadow: 0 0 5px rgba(92, 131, 116, 0.5);
}
.led-busy {
    background: var(--gold) !important;
}
.led-off {
    background: #ccc !important;
}
.btn-group {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
}
.btn {
    border: 1px solid var(--line);
    background: white;
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 7px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
}
.btn-jade {
    background: var(--jade);
    color: white;
    border-color: var(--jade);
}
.btn-cinnabar {
    border-color: var(--cinnabar);
    color: var(--cinnabar);
    background: white;
}
.btn-cinnabar:hover {
    background: var(--cinnabar);
    color: white;
}
.btn-gold {
    border-color: var(--gold);
    color: var(--gold-deep, #a07840);
    background: white;
}
.btn-gold:hover {
    background: var(--gold);
    color: white;
}
.btn-ghost {
    color: var(--ink-muted);
}
.sel {
    padding: 5px 8px;
    border: 1px solid var(--line);
    border-radius: 5px;
    background: white;
    font-family: inherit;
    font-size: 13px;
    color: var(--ink);
}
.modal-mask {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(44, 54, 57, 0.42);
    backdrop-filter: blur(3px);
    z-index: 1000;
    justify-content: center;
    align-items: center;
    padding: 20px;
}
.modal-mask.show {
    display: flex;
}
.modal {
    background: white;
    border-radius: 14px;
    max-width: 480px;
    width: 100%;
    box-shadow: 0 8px 28px rgba(60, 50, 30, 0.12);
    max-height: 90vh;
    overflow: auto;
}
.modal.wide {
    max-width: 640px;
}
.modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.modal-header h3 {
    font-family: "STKaiti", serif;
    font-size: 18px;
    color: var(--ink);
}
.modal-close {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--ink-muted);
    font-size: 22px;
}
.modal-body {
    padding: 20px;
}
.modal-body label {
    font-size: 13px;
    color: var(--ink-muted);
    display: block;
    margin-bottom: 6px;
}
.modal-body input,
.modal-body textarea,
.modal-body select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 7px;
    font-family: inherit;
    font-size: 14px;
    color: var(--ink);
    outline: none;
    box-sizing: border-box;
}
.modal-body input:focus,
.modal-body textarea:focus {
    border-color: var(--jade);
}
.modal-body textarea {
    resize: vertical;
}
.modal-footer {
    padding: 14px 20px;
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}
.modal-btn {
    padding: 8px 20px;
    border-radius: 7px;
    font-size: 14px;
    border: 1px solid var(--line);
    background: white;
    color: var(--ink);
    cursor: pointer;
    font-family: inherit;
}
.modal-btn.primary-jade {
    background: var(--jade);
    color: white;
    border-color: var(--jade);
}
.modal-btn.primary-cinnabar {
    background: var(--cinnabar);
    color: white;
    border-color: var(--cinnabar);
}
</style>
