<template>
    <div class="modal-mask" :class="{ show: modelValue }" @click.self="close">
        <div class="modal">
            <!-- Header -->
            <div class="modal-header">
                <div class="header-left">
                    <button v-if="view === 'form'" class="back-btn" @click="cancelForm">
                        ‹ 返回
                    </button>
                    <h3>{{ view === 'list' ? '选择收货地址' : (editingId ? '编辑地址' : '添加新地址') }}</h3>
                </div>
                <button class="modal-close" @click="close">×</button>
            </div>

            <!-- ===== 地址列表 ===== -->
            <div v-if="view === 'list'" class="modal-body">
                <!-- 定位按钮 -->
                <button
                    class="geo-btn"
                    :class="{ loading: geoLoading }"
                    :disabled="geoLoading"
                    @click="geolocate"
                >
                    <span class="geo-icon">{{ geoLoading ? '⏳' : '📍' }}</span>
                    {{ geoLoading ? '定位中，请稍候…' : '使用当前位置自动填写' }}
                </button>

                <!-- 定位提示 -->
                <div v-if="geoMsg" class="geo-msg" :class="geoMsgType">
                    {{ geoMsg }}
                </div>

                <!-- 空状态 -->
                <div v-if="addresses.length === 0" class="addr-empty">
                    <div class="empty-icon">📦</div>
                    <div>暂无收货地址，请添加</div>
                </div>

                <!-- 地址列表 -->
                <div
                    v-for="addr in addresses"
                    :key="addr.id"
                    class="addr-item"
                    :class="{ selected: selectedId === addr.id }"
                    @click="selectedId = addr.id"
                >
                    <div class="addr-radio">
                        <div class="radio-dot" :class="{ active: selectedId === addr.id }"></div>
                    </div>
                    <div class="addr-content">
                        <div class="addr-top">
                            <span class="addr-name">{{ addr.name }}</span>
                            <span class="addr-phone">{{ maskPhone(addr.phone) }}</span>
                            <span v-if="addr.isDefault" class="default-badge">默认</span>
                        </div>
                        <div class="addr-text">{{ addr.address }}</div>
                        <div v-if="addr.remark" class="addr-remark">备注：{{ addr.remark }}</div>
                    </div>
                    <div class="addr-ops" @click.stop>
                        <button class="op-btn" @click="openEditForm(addr)">编辑</button>
                        <button class="op-btn del" @click="deleteAddress(addr.id)">删除</button>
                    </div>
                </div>

                <!-- 添加新地址 -->
                <button class="add-addr-btn" @click="openAddForm">＋ 添加新地址</button>
            </div>

            <!-- ===== 地址表单 ===== -->
            <div v-if="view === 'form'" class="modal-body form-body">
                <!-- 定位快填提示 -->
                <div v-if="geoFilled" class="geo-filled-tip">
                    <span>📍</span> 已通过定位填入，请确认并补全地址
                </div>

                <div class="form-group">
                    <label class="form-label">收货人姓名 <span class="req">*</span></label>
                    <input
                        v-model="form.name"
                        class="form-input"
                        :class="{ err: errors.name }"
                        placeholder="请输入真实姓名"
                        maxlength="20"
                        @input="errors.name = ''"
                    />
                    <span v-if="errors.name" class="err-tip">{{ errors.name }}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">手机号码 <span class="req">*</span></label>
                    <input
                        v-model="form.phone"
                        class="form-input"
                        :class="{ err: errors.phone }"
                        placeholder="请输入11位手机号"
                        maxlength="11"
                        type="tel"
                        @input="errors.phone = ''"
                    />
                    <span v-if="errors.phone" class="err-tip">{{ errors.phone }}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">详细地址 <span class="req">*</span></label>
                    <textarea
                        v-model="form.address"
                        class="form-textarea"
                        :class="{ err: errors.address }"
                        placeholder="省/市/区 + 街道 + 门牌号，例如：广东省深圳市南山区科技园南路18号"
                        rows="3"
                        maxlength="200"
                        @input="errors.address = ''"
                    ></textarea>
                    <div class="addr-counter">{{ form.address.length }}/200</div>
                    <span v-if="errors.address" class="err-tip">{{ errors.address }}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">备注（选填）</label>
                    <input
                        v-model="form.remark"
                        class="form-input"
                        placeholder="如：请放门口，不要敲门"
                        maxlength="100"
                    />
                </div>

                <div class="form-default-row">
                    <label class="switch-label" @click="form.isDefault = !form.isDefault">
                        <div class="switch" :class="{ on: form.isDefault }">
                            <div class="switch-thumb"></div>
                        </div>
                        <span>设为默认收货地址</span>
                    </label>
                </div>
            </div>

            <!-- Footer -->
            <div class="modal-footer">
                <template v-if="view === 'list'">
                    <button class="btn btn-outline" @click="close">取消</button>
                    <button
                        class="btn btn-jade"
                        :disabled="!selectedId"
                        @click="confirmSelection"
                    >
                        使用此地址
                    </button>
                </template>
                <template v-else>
                    <button class="btn btn-outline" @click="cancelForm">取消</button>
                    <button class="btn btn-jade" @click="saveForm">保存地址</button>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

export interface AddressFormData {
    name: string;
    phone: string;
    address: string;
    remark: string;
}

interface SavedAddress extends AddressFormData {
    id: string;
    isDefault: boolean;
}

interface Props {
    modelValue: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    confirm: [form: AddressFormData];
}>();

// ── 状态 ──────────────────────────────────────────────────────────
const view = ref<"list" | "form">("list");
const addresses = ref<SavedAddress[]>([]);
const selectedId = ref<string>("");
const editingId = ref<string>("");
const geoLoading = ref(false);
const geoMsg = ref("");
const geoMsgType = ref<"info" | "error">("info");
const geoFilled = ref(false);

const EMPTY_FORM = (): SavedAddress => ({
    id: "", name: "", phone: "", address: "", remark: "", isDefault: false,
});
const form = ref<SavedAddress>(EMPTY_FORM());
const errors = ref({ name: "", phone: "", address: "" });

const LS_KEY = "shop_addresses";

// ── 初始化 ─────────────────────────────────────────────────────────
function loadAddresses() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        addresses.value = raw ? JSON.parse(raw) : [];
    } catch {
        addresses.value = [];
    }
}

function saveAddresses() {
    localStorage.setItem(LS_KEY, JSON.stringify(addresses.value));
}

watch(
    () => props.modelValue,
    (v) => {
        if (v) {
            loadAddresses();
            geoMsg.value = "";
            geoFilled.value = false;
            view.value = addresses.value.length === 0 ? "form" : "list";
            // 自动选中默认地址
            const def = addresses.value.find((a) => a.isDefault);
            selectedId.value = def?.id || addresses.value[0]?.id || "";
            if (view.value === "form") {
                form.value = EMPTY_FORM();
                errors.value = { name: "", phone: "", address: "" };
            }
        }
    },
);

// ── 地址列表操作 ────────────────────────────────────────────────────
function openAddForm() {
    editingId.value = "";
    geoFilled.value = false;
    form.value = EMPTY_FORM();
    errors.value = { name: "", phone: "", address: "" };
    view.value = "form";
}

function openEditForm(addr: SavedAddress) {
    editingId.value = addr.id;
    geoFilled.value = false;
    form.value = { ...addr };
    errors.value = { name: "", phone: "", address: "" };
    view.value = "form";
}

function deleteAddress(id: string) {
    addresses.value = addresses.value.filter((a) => a.id !== id);
    // 若删的是默认，把第一个设为默认
    if (addresses.value.length > 0 && !addresses.value.some((a) => a.isDefault)) {
        addresses.value[0].isDefault = true;
    }
    if (selectedId.value === id) {
        selectedId.value = addresses.value.find((a) => a.isDefault)?.id || addresses.value[0]?.id || "";
    }
    saveAddresses();
}

function cancelForm() {
    if (addresses.value.length === 0) {
        close();
    } else {
        view.value = "list";
    }
}

// ── 表单保存 ────────────────────────────────────────────────────────
function validate(): boolean {
    errors.value = { name: "", phone: "", address: "" };
    let ok = true;

    if (!form.value.name.trim()) {
        errors.value.name = "请输入收货人姓名";
        ok = false;
    }

    const phoneReg = /^1[3-9]\d{9}$/;
    if (!form.value.phone.trim()) {
        errors.value.phone = "请输入手机号码";
        ok = false;
    } else if (!phoneReg.test(form.value.phone.trim())) {
        errors.value.phone = "请输入正确的11位手机号";
        ok = false;
    }

    if (!form.value.address.trim()) {
        errors.value.address = "请输入收货地址";
        ok = false;
    } else if (form.value.address.trim().length < 8) {
        errors.value.address = "地址请填写详细一些";
        ok = false;
    }

    return ok;
}

function saveForm() {
    if (!validate()) return;

    if (form.value.isDefault) {
        addresses.value.forEach((a) => { a.isDefault = false; });
    }

    if (editingId.value) {
        const idx = addresses.value.findIndex((a) => a.id === editingId.value);
        if (idx !== -1) addresses.value[idx] = { ...form.value, id: editingId.value };
    } else {
        const newAddr: SavedAddress = {
            ...form.value,
            id: `addr_${Date.now()}`,
        };
        // 第一条地址自动设为默认
        if (addresses.value.length === 0) newAddr.isDefault = true;
        addresses.value.push(newAddr);
        selectedId.value = newAddr.id;
    }

    saveAddresses();
    view.value = "list";
    editingId.value = "";
}

// ── 确认使用地址 ────────────────────────────────────────────────────
function confirmSelection() {
    const addr = addresses.value.find((a) => a.id === selectedId.value);
    if (!addr) return;
    emit("confirm", {
        name: addr.name,
        phone: addr.phone,
        address: addr.address,
        remark: addr.remark,
    });
    close();
}

function close() {
    emit("update:modelValue", false);
}

// ── 手机号脱敏 ──────────────────────────────────────────────────────
function maskPhone(phone: string): string {
    if (phone.length !== 11) return phone;
    return phone.slice(0, 3) + "****" + phone.slice(7);
}

// ── GPS 定位 + 逆地理编码 ─────────────────────────────────────────────
async function geolocate() {
    if (!navigator.geolocation) {
        geoMsg.value = "您的浏览器不支持定位功能，请手动输入";
        geoMsgType.value = "error";
        return;
    }

    geoLoading.value = true;
    geoMsg.value = "";

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            try {
                // 调用 OpenStreetMap Nominatim 逆地理编码（免费、无需 key）
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh`,
                    { headers: { "User-Agent": "shop-app/1.0" } },
                );
                const data = await res.json();
                const a = data.address || {};

                // 按中国地址习惯拼接
                const parts = [
                    a.state || a.province || "",
                    a.city || a.county || "",
                    a.district || a.suburb || a.town || "",
                    a.road || a.pedestrian || a.street || "",
                    a.house_number || "",
                ].filter(Boolean);

                const addrStr = parts.length > 0
                    ? parts.join("")
                    : (data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);

                openAddForm();
                form.value.address = addrStr;
                geoFilled.value = true;
                geoMsg.value = "📍 定位成功！请确认地址并补充姓名手机号";
                geoMsgType.value = "info";
            } catch {
                openAddForm();
                form.value.address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                geoFilled.value = true;
                geoMsg.value = "定位成功，但解析地址失败，请手动完善地址内容";
                geoMsgType.value = "error";
            }
            geoLoading.value = false;
        },
        (err) => {
            geoLoading.value = false;
            const msgs: Record<number, string> = {
                1: "定位权限被拒绝，请在浏览器地址栏允许访问位置后重试",
                2: "无法获取位置信息，请检查网络或手动输入地址",
                3: "定位超时，请手动输入地址",
            };
            geoMsg.value = msgs[err.code] || "定位失败，请手动输入地址";
            geoMsgType.value = "error";
        },
        { timeout: 10000, enableHighAccuracy: true },
    );
}
</script>

<style scoped lang="scss">
.modal-mask {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(44, 54, 57, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1000;
    justify-content: center;
    align-items: center;
    padding: 20px;

    &.show { display: flex; }
}

.modal {
    background: white;
    border-radius: 16px;
    width: min(500px, 100%);
    box-shadow: 0 24px 64px rgba(44, 54, 57, 0.22);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* ── Header ── */
.modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    h3 {
        font-family: "STKaiti", serif;
        font-size: 17px;
        color: var(--ink);
        font-weight: 600;
    }
}

.header-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.back-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: var(--jade);
    padding: 0;
    font-family: inherit;
    &:hover { text-decoration: underline; }
}

.modal-close {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 22px;
    color: var(--ink-muted);
    line-height: 1;
    &:hover { color: var(--ink); }
}

/* ── Body ── */
.modal-body {
    padding: 16px 20px;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.form-body { gap: 14px; }

/* ── 定位 ── */
.geo-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 12px 16px;
    border: 1.5px dashed var(--jade);
    border-radius: 10px;
    background: var(--jade-soft);
    color: var(--jade);
    font-size: 14px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.18s;

    &:hover:not(:disabled) { background: rgba(92, 131, 116, 0.15); }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
    .geo-icon { font-size: 16px; }
}

.geo-msg {
    font-size: 13px;
    padding: 8px 12px;
    border-radius: 8px;

    &.info { background: var(--jade-soft); color: var(--jade); }
    &.error { background: var(--cinnabar-soft); color: var(--cinnabar); }
}

.geo-filled-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 14px;
    background: var(--jade-soft);
    border-radius: 8px;
    font-size: 13px;
    color: var(--jade);
    font-weight: 600;
}

/* ── 地址列表 ── */
.addr-empty {
    text-align: center;
    padding: 24px;
    color: var(--ink-muted);
    font-size: 14px;

    .empty-icon { font-size: 36px; margin-bottom: 8px; }
}

.addr-item {
    display: flex;
    gap: 12px;
    padding: 14px 16px;
    border: 2px solid var(--line);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.18s;

    &:hover { border-color: var(--jade); background: var(--jade-soft); }
    &.selected { border-color: var(--jade); background: var(--jade-soft); }
}

.addr-radio {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding-top: 2px;
}

.radio-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid var(--line);
    background: white;
    position: relative;
    transition: all 0.15s;

    &.active {
        border-color: var(--jade);
        &::after {
            content: "";
            position: absolute;
            inset: 3px;
            border-radius: 50%;
            background: var(--jade);
        }
    }
}

.addr-content { flex: 1; min-width: 0; }

.addr-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    flex-wrap: wrap;
}

.addr-name { font-size: 15px; font-weight: 700; color: var(--ink); }
.addr-phone { font-size: 13px; color: var(--ink-muted); }
.default-badge {
    font-size: 11px;
    padding: 2px 7px;
    border-radius: 8px;
    background: var(--gold-soft);
    color: #9a7b33;
    font-weight: 600;
}

.addr-text {
    font-size: 13px;
    color: var(--ink);
    line-height: 1.5;
}

.addr-remark {
    font-size: 12px;
    color: var(--ink-muted);
    margin-top: 3px;
}

.addr-ops {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex-shrink: 0;
    align-self: flex-start;
}

.op-btn {
    background: none;
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 3px 10px;
    font-size: 12px;
    color: var(--ink-muted);
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
    transition: all 0.15s;

    &:hover { border-color: var(--jade); color: var(--jade); }
    &.del:hover { border-color: var(--cinnabar); color: var(--cinnabar); }
}

.add-addr-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    border: 1.5px dashed var(--line);
    border-radius: 10px;
    background: transparent;
    color: var(--ink-muted);
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.18s;

    &:hover { border-color: var(--jade); color: var(--jade); background: var(--jade-soft); }
}

/* ── 表单 ── */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    .req { color: var(--cinnabar); }
}

.form-input {
    height: 42px;
    border: 1.5px solid var(--line);
    border-radius: 8px;
    padding: 0 14px;
    font-size: 14px;
    font-family: inherit;
    color: var(--ink);
    outline: none;
    transition: border-color 0.15s;

    &:focus { border-color: var(--jade); }
    &.err { border-color: var(--cinnabar); }
    &::placeholder { color: var(--ink-muted); }
}

.form-textarea {
    border: 1.5px solid var(--line);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 14px;
    font-family: inherit;
    color: var(--ink);
    outline: none;
    resize: vertical;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.15s;

    &:focus { border-color: var(--jade); }
    &.err { border-color: var(--cinnabar); }
    &::placeholder { color: var(--ink-muted); }
}

.addr-counter {
    font-size: 11px;
    color: var(--ink-muted);
    text-align: right;
}

.err-tip { font-size: 12px; color: var(--cinnabar); }

/* ── 默认地址开关 ── */
.form-default-row {
    padding: 12px 0 4px;
    border-top: 1px dashed var(--line);
}

.switch-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 14px;
    color: var(--ink);
    user-select: none;
}

.switch {
    width: 40px;
    height: 22px;
    border-radius: 11px;
    background: var(--line);
    position: relative;
    transition: background 0.2s;
    flex-shrink: 0;

    &.on { background: var(--jade); }
}

.switch-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    transition: left 0.2s;

    .switch.on & { left: 21px; }
}

/* ── Footer ── */
.modal-footer {
    padding: 14px 20px;
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-shrink: 0;
}

.btn {
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;

    &-outline {
        border: 1px solid var(--line);
        background: white;
        color: var(--ink);
        &:hover { border-color: var(--jade); color: var(--jade); }
    }

    &-jade {
        background: var(--jade);
        color: white;
        &:hover { background: #4a6f60; }
        &:disabled { opacity: 0.4; cursor: not-allowed; }
    }
}
</style>
