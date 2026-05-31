<template>
    <div class="admin-logistics">
        <!-- 顶部操作栏 -->
        <div class="panel-header">
            <h3 class="panel-title font-serif">物流管理</h3>
            <div class="panel-actions">
                <button
                    class="btn btn-outline"
                    @click="showSearchForm = !showSearchForm"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                    </svg>
                    {{ showSearchForm ? "隐藏筛选" : "高级筛选" }}
                </button>
                <button
                    class="btn btn-outline"
                    @click="handleRefresh"
                    :disabled="loading"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        :class="{ rotating: loading }"
                    >
                        <path d="M23 4v6h-6M1 20v-6h6" />
                        <path
                            d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
                        />
                    </svg>
                    刷新
                </button>
            </div>
        </div>

        <!-- 搜索表单 -->
        <Transition name="slide-down">
            <div v-if="showSearchForm" class="search-form-container">
                <div class="search-form">
                    <div class="form-row">
                        <div class="form-item">
                            <label>物流单号</label>
                            <input
                                v-model.trim="searchForm.trackingNo"
                                type="text"
                                placeholder="请输入物流单号"
                            />
                        </div>
                        <div class="form-item">
                            <label>物流公司</label>
                            <select v-model="searchForm.logisticsCompany">
                                <option value="">全部</option>
                                <option value="顺丰速运">顺丰速运</option>
                                <option value="中通快递">中通快递</option>
                                <option value="圆通速递">圆通速递</option>
                                <option value="申通快递">申通快递</option>
                                <option value="韵达快递">韵达快递</option>
                                <option value="京东物流">京东物流</option>
                                <option value="德邦快递">德邦快递</option>
                                <option value="其他">其他</option>
                            </select>
                        </div>
                        <div class="form-item">
                            <label>物流状态</label>
                            <select v-model.number="searchForm.status">
                                <option :value="undefined">全部</option>
                                <option :value="0">待发货</option>
                                <option :value="1">已发货</option>
                                <option :value="2">运输中</option>
                                <option :value="3">已签收</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-primary" @click="handleSearch">
                            搜索
                        </button>
                        <button class="btn btn-outline" @click="handleReset">
                            重置
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- 物流列表 -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>加载中...</p>
        </div>

        <div v-else-if="logisticsList.length === 0" class="empty-state">
            <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
            >
                <rect x="2" y="3" width="20" height="18" rx="2" />
                <path d="M8 7h8M8 11h8M8 15h5" />
            </svg>
            <p>暂无物流信息</p>
        </div>

        <div v-else class="logistics-table-wrap">
            <table class="logistics-table">
                <thead>
                    <tr>
                        <th>订单ID</th>
                        <th>物流单号</th>
                        <th>物流公司</th>
                        <th>状态</th>
                        <th>当前位置</th>
                        <th>创建时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in logisticsList" :key="item.id">
                        <td>{{ item.orderId }}</td>
                        <td>{{ item.trackingNo || "-" }}</td>
                        <td>{{ item.logisticsCompany || "-" }}</td>
                        <td>
                            <span
                                :class="[
                                    'status-badge',
                                    getStatusClass(item.status),
                                ]"
                            >
                                {{ getStatusText(item.status) }}
                            </span>
                        </td>
                        <td>{{ item.currentLocation || "-" }}</td>
                        <td>{{ formatDate(item.createdAt) }}</td>
                        <td>
                            <div class="action-buttons">
                                <!-- 待发货订单显示"发货"按钮 -->
                                <button
                                    v-if="
                                        !item.trackingNo ||
                                        item.trackingNo.trim() === '' ||
                                        item.trackingNo.toUpperCase() ===
                                            'PENDING' ||
                                        item.trackingNo.toUpperCase() ===
                                            'NULL' ||
                                        item.trackingNo.toUpperCase() ===
                                            'UNDEFINED'
                                    "
                                    class="btn-link primary"
                                    @click="openShipModal(item)"
                                >
                                    发货
                                </button>
                                <!-- 已发货订单显示"查看详情"和"更新轨迹"按钮 -->
                                <template v-else>
                                    <button
                                        class="btn-link"
                                        @click="viewDetails(item)"
                                    >
                                        查看详情
                                    </button>
                                    <button
                                        class="btn-link primary"
                                        @click="openUpdateModal(item)"
                                    >
                                        更新轨迹
                                    </button>
                                </template>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- 分页控件 -->
            <div class="pagination">
                <div class="pagination-info">
                    共 {{ pagination.total }} 条，第 {{ pagination.current }} /
                    {{ totalPages }} 页
                </div>
                <div class="pagination-controls">
                    <button
                        class="btn-page"
                        :disabled="pagination.current === 1"
                        @click="handlePageChange(pagination.current - 1)"
                    >
                        上一页
                    </button>
                    <button
                        v-for="page in visiblePages"
                        :key="page"
                        class="btn-page"
                        :class="{ active: page === pagination.current }"
                        @click="handlePageChange(page)"
                    >
                        {{ page }}
                    </button>
                    <button
                        class="btn-page"
                        :disabled="pagination.current === totalPages"
                        @click="handlePageChange(pagination.current + 1)"
                    >
                        下一页
                    </button>
                    <select
                        v-model.number="pagination.size"
                        class="page-size-select"
                        @change="handlePageSizeChange"
                    >
                        <option :value="10">10条/页</option>
                        <option :value="20">20条/页</option>
                        <option :value="50">50条/页</option>
                        <option :value="100">100条/页</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- 发货模态框 -->
        <Teleport to="body">
            <Transition name="modal">
                <div
                    v-if="showShipModal"
                    class="modal-mask"
                    @click.self="closeShipModal"
                >
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 class="font-serif">订单发货</h3>
                            <button class="modal-close" @click="closeShipModal">
                                ×
                            </button>
                        </div>
                        <div class="modal-body">
                            <!-- 订单信息展示区 -->
                            <div class="order-info-banner">
                                <div class="info-item">
                                    <span class="label">订单ID：</span>
                                    <span class="value">{{
                                        currentLogistics?.orderId
                                    }}</span>
                                </div>
                                <div
                                    class="info-item"
                                    v-if="
                                        currentLogistics?.trackingNo &&
                                        currentLogistics.trackingNo.toUpperCase() !==
                                            'PENDING'
                                    "
                                >
                                    <span class="label">物流单号：</span>
                                    <span class="value">{{
                                        currentLogistics.trackingNo
                                    }}</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label
                                    >物流单号
                                    <span class="required">*</span></label
                                >
                                <input
                                    v-model.trim="shipForm.trackingNo"
                                    type="text"
                                    placeholder="请输入物流单号，如：SF123456789"
                                />
                            </div>

                            <div class="form-group">
                                <label
                                    >物流公司
                                    <span class="required">*</span></label
                                >
                                <select v-model="shipForm.logisticsCompany">
                                    <option value="">请选择物流公司</option>
                                    <option value="顺丰速运">顺丰速运</option>
                                    <option value="中通快递">中通快递</option>
                                    <option value="圆通速递">圆通速递</option>
                                    <option value="申通快递">申通快递</option>
                                    <option value="韵达快递">韵达快递</option>
                                    <option value="京东物流">京东物流</option>
                                    <option value="德邦快递">德邦快递</option>
                                    <option value="其他">其他</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>备注（选填）</label>
                                <textarea
                                    v-model.trim="shipForm.remark"
                                    rows="3"
                                    placeholder="可填写发货备注信息"
                                ></textarea>
                            </div>

                            <div
                                v-if="shipMessage"
                                :class="['message', shipMessageType]"
                            >
                                {{ shipMessage }}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button
                                class="btn btn-outline"
                                @click="closeShipModal"
                            >
                                取消
                            </button>
                            <button
                                class="btn btn-primary"
                                :disabled="shipping"
                                @click="handleShip"
                            >
                                {{ shipping ? "发货中..." : "确认发货" }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- 更新物流轨迹模态框 -->
        <Teleport to="body">
            <Transition name="modal">
                <div
                    v-if="showUpdateModal"
                    class="modal-mask"
                    @click.self="closeUpdateModal"
                >
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 class="font-serif">更新物流轨迹</h3>
                            <button
                                class="modal-close"
                                @click="closeUpdateModal"
                            >
                                ×
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>物流单号</label>
                                <input
                                    :value="currentLogistics?.trackingNo"
                                    type="text"
                                    disabled
                                    class="input-disabled"
                                />
                            </div>

                            <div class="form-group">
                                <label
                                    >物流状态
                                    <span class="required">*</span></label
                                >
                                <select v-model.number="updateForm.status">
                                    <option :value="0">待发货</option>
                                    <option :value="1">已发货</option>
                                    <option :value="2">运输中</option>
                                    <option :value="3">已签收</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>当前位置</label>
                                <input
                                    v-model.trim="updateForm.currentLocation"
                                    type="text"
                                    placeholder="例如：北京市朝阳区"
                                />
                            </div>

                            <div class="form-group">
                                <label
                                    >轨迹描述
                                    <span class="required">*</span></label
                                >
                                <textarea
                                    v-model.trim="updateForm.description"
                                    rows="3"
                                    placeholder="请输入物流轨迹描述，例如：【北京市】顺丰速运 已发出"
                                ></textarea>
                            </div>

                            <div class="form-group">
                                <label>时间点（选填）</label>
                                <input
                                    v-model="updateForm.time"
                                    type="datetime-local"
                                />
                                <small>不填写则使用当前时间</small>
                            </div>

                            <div
                                v-if="updateMessage"
                                :class="['message', updateMessageType]"
                            >
                                {{ updateMessage }}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button
                                class="btn btn-outline"
                                @click="closeUpdateModal"
                            >
                                取消
                            </button>
                            <button
                                class="btn btn-primary"
                                :disabled="updating"
                                @click="handleUpdate"
                            >
                                {{ updating ? "更新中..." : "确认更新" }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- 查看物流详情模态框 -->
        <Teleport to="body">
            <Transition name="modal">
                <div
                    v-if="showDetailModal"
                    class="modal-mask"
                    @click.self="closeDetailModal"
                >
                    <div class="modal-content modal-large">
                        <div class="modal-header">
                            <h3 class="font-serif">物流轨迹详情</h3>
                            <button
                                class="modal-close"
                                @click="closeDetailModal"
                            >
                                ×
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="logistics-info">
                                <div class="info-row">
                                    <strong>物流单号：</strong>
                                    <span>{{
                                        currentLogistics?.trackingNo
                                    }}</span>
                                </div>
                                <div class="info-row">
                                    <strong>物流公司：</strong>
                                    <span>{{
                                        currentLogistics?.logisticsCompany
                                    }}</span>
                                </div>
                                <div class="info-row">
                                    <strong>当前状态：</strong>
                                    <span
                                        :class="[
                                            'status-badge',
                                            getStatusClass(
                                                currentLogistics?.status || 0,
                                            ),
                                        ]"
                                    >
                                        {{
                                            getStatusText(
                                                currentLogistics?.status || 0,
                                            )
                                        }}
                                    </span>
                                </div>
                            </div>

                            <div class="timeline">
                                <div
                                    v-for="(
                                        detail, index
                                    ) in currentLogistics?.details || []"
                                    :key="index"
                                    class="timeline-item"
                                    :class="{ active: index === 0 }"
                                >
                                    <div class="timeline-dot"></div>
                                    <div class="timeline-content">
                                        <div class="timeline-time">
                                            {{ formatDateTime(detail.time) }}
                                        </div>
                                        <div class="timeline-location">
                                            {{ detail.location }}
                                        </div>
                                        <div class="timeline-desc">
                                            {{ detail.description }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                v-if="
                                    !currentLogistics?.details ||
                                    currentLogistics.details.length === 0
                                "
                                class="empty-timeline"
                            >
                                <p>暂无物流轨迹信息</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button
                                class="btn btn-primary"
                                @click="closeDetailModal"
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- Toast 提示 -->
        <Transition name="toast">
            <div v-if="toast.visible" class="toast" :class="toast.type">
                {{ toast.message }}
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ApiLogistics, type LogisticsVO } from "@/network/logistics";

const loading = ref(false);
const showSearchForm = ref(false);
const logisticsList = ref<LogisticsVO[]>([]);

// 搜索表单
const searchForm = reactive({
    status: undefined as number | undefined,
    trackingNo: "",
    logisticsCompany: "",
});

// 分页配置
const pagination = reactive({
    current: 1,
    size: 10,
    total: 0,
});

// 计算总页数
const totalPages = computed(() =>
    Math.ceil(pagination.total / pagination.size),
);

// 计算可见的页码
const visiblePages = computed(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, pagination.current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages.value, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
});

const showShipModal = ref(false);
const showUpdateModal = ref(false);
const showDetailModal = ref(false);
const currentLogistics = ref<LogisticsVO | null>(null);
const updating = ref(false);
const shipping = ref(false);
const updateMessage = ref("");
const updateMessageType = ref<"success" | "error">("success");
const shipMessage = ref("");
const shipMessageType = ref<"success" | "error">("success");

// Toast
const toast = reactive({
    visible: false,
    type: "success" as "success" | "error",
    message: "",
});
let toastTimer: number | null = null;

function showToast(message: string, type: "success" | "error" = "success") {
    toast.type = type;
    toast.message = message;
    toast.visible = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
        toast.visible = false;
    }, 3000);
}

const shipForm = reactive({
    trackingNo: "",
    logisticsCompany: "",
    remark: "",
});

const updateForm = reactive({
    status: 0,
    description: "",
    currentLocation: "",
    time: "",
});

// 加载物流列表
async function loadLogisticsList() {
    loading.value = true;

    try {
        console.log("========== 开始加载物流信息 ==========");
        console.log("搜索条件:", searchForm);
        console.log("分页参数:", pagination);

        // 构建请求参数，只在值存在时添加
        const params: Parameters<typeof ApiLogistics.listLogistics>[0] = {
            page: pagination.current,
            size: pagination.size,
        };

        if (searchForm.status !== undefined) {
            params.status = searchForm.status;
        }
        if (searchForm.trackingNo) {
            params.trackingNo = searchForm.trackingNo;
        }
        if (searchForm.logisticsCompany) {
            params.logisticsCompany = searchForm.logisticsCompany;
        }

        const response = await ApiLogistics.listLogistics(params);

        console.log("✅ 物流列表查询成功！");
        console.log("Code:", response.data.code);
        console.log("Message:", response.data.message);

        if (response.data.code === 200 && response.data.data) {
            const pageResult = response.data.data;
            logisticsList.value = pageResult.records || [];
            pagination.total = pageResult.total || 0;

            console.log(
                "✅ 找到物流信息，共",
                pagination.total,
                "条，当前页",
                logisticsList.value.length,
                "条",
            );

            if (logisticsList.value.length > 0) {
                showToast(`找到 ${pagination.total} 条物流信息`, "success");
            } else {
                showToast("未找到相关物流信息", "error");
            }
        } else {
            console.log("❌ 物流列表查询返回错误:", response.data.message);
            logisticsList.value = [];
            pagination.total = 0;
            showToast(response.data.message || "加载失败", "error");
        }
    } catch (error) {
        console.error("❌ 加载物流信息失败:", error);
        logisticsList.value = [];
        pagination.total = 0;
        showToast("加载物流信息失败", "error");
    } finally {
        loading.value = false;
        console.log("========== 加载结束 ==========\n");
    }
}

// 搜索处理
function handleSearch() {
    pagination.current = 1; // 重置到第一页
    loadLogisticsList();
}

// 重置搜索
function handleReset() {
    searchForm.status = undefined;
    searchForm.trackingNo = "";
    searchForm.logisticsCompany = "";
    pagination.current = 1;
    loadLogisticsList();
}

// 刷新按钮处理
function handleRefresh() {
    loadLogisticsList();
}

// 页码变化
function handlePageChange(page: number) {
    if (page < 1 || page > totalPages.value) return;
    pagination.current = page;
    loadLogisticsList();
}

// 每页条数变化
function handlePageSizeChange() {
    pagination.current = 1; // 重置到第一页
    loadLogisticsList();
}

// 打开发货模态框
function openShipModal(item: LogisticsVO) {
    currentLogistics.value = item;
    shipForm.trackingNo = "";
    shipForm.logisticsCompany = "";
    shipForm.remark = "";
    shipMessage.value = "";
    showShipModal.value = true;
}

// 关闭发货模态框
function closeShipModal() {
    showShipModal.value = false;
    currentLogistics.value = null;
    shipMessage.value = "";
}

// 处理发货
async function handleShip() {
    if (!currentLogistics.value) return;

    if (!shipForm.trackingNo.trim()) {
        shipMessage.value = "请填写物流单号";
        shipMessageType.value = "error";
        return;
    }

    if (!shipForm.logisticsCompany) {
        shipMessage.value = "请选择物流公司";
        shipMessageType.value = "error";
        return;
    }

    shipping.value = true;
    shipMessage.value = "";

    try {
        // 构建发货请求参数
        const shipData: Parameters<typeof ApiLogistics.shipOrder>[1] = {
            trackingNo: shipForm.trackingNo.trim(),
            logisticsCompany: shipForm.logisticsCompany,
        };

        // 只在备注有值时添加
        if (shipForm.remark.trim()) {
            shipData.remark = shipForm.remark.trim();
        }

        console.log("========== 开始发货 ==========");
        console.log("订单ID:", currentLogistics.value.orderId);
        console.log("发货数据:", shipData);

        const response = await ApiLogistics.shipOrder(
            currentLogistics.value.orderId,
            shipData,
        );

        console.log("✅ 发货响应:", response.data);

        if (response.data.code === 200) {
            shipMessage.value = "发货成功";
            shipMessageType.value = "success";
            showToast("订单发货成功", "success");

            setTimeout(() => {
                closeShipModal();
                loadLogisticsList(); // 重新加载
            }, 1000);
        } else {
            console.log("❌ 发货失败:", response.data.message);
            shipMessage.value = response.data.message || "发货失败";
            shipMessageType.value = "error";
        }
    } catch (error) {
        console.error("❌ 发货异常:", error);
        shipMessage.value = "发货失败，请重试";
        shipMessageType.value = "error";
    } finally {
        shipping.value = false;
        console.log("========== 发货结束 ==========\n");
    }
}

// 打开更新模态框
function openUpdateModal(item: LogisticsVO) {
    currentLogistics.value = item;
    updateForm.status = item.status;
    updateForm.currentLocation = item.currentLocation || "";
    updateForm.description = "";
    updateForm.time = "";
    updateMessage.value = "";
    showUpdateModal.value = true;
}

// 关闭更新模态框
function closeUpdateModal() {
    showUpdateModal.value = false;
    currentLogistics.value = null;
    updateMessage.value = "";
}

// 更新物流轨迹
async function handleUpdate() {
    if (!currentLogistics.value) return;

    if (!updateForm.description.trim()) {
        updateMessage.value = "请填写轨迹描述";
        updateMessageType.value = "error";
        return;
    }

    updating.value = true;
    updateMessage.value = "";

    try {
        // 构建请求参数，使用条件展开处理可选属性
        const updateData: Parameters<typeof ApiLogistics.updateLogistics>[1] = {
            status: updateForm.status,
            description: updateForm.description.trim(),
        };

        // 只在值存在时添加可选属性
        if (updateForm.currentLocation.trim()) {
            updateData.currentLocation = updateForm.currentLocation.trim();
        }
        if (updateForm.time) {
            updateData.time = updateForm.time;
        }

        const response = await ApiLogistics.updateLogistics(
            currentLogistics.value.id,
            updateData,
        );

        if (response.data.code === 200) {
            updateMessage.value = "更新成功";
            updateMessageType.value = "success";
            showToast("物流轨迹更新成功");

            setTimeout(() => {
                closeUpdateModal();
                loadLogisticsList();
            }, 1000);
        } else {
            updateMessage.value = response.data.message || "更新失败";
            updateMessageType.value = "error";
        }
    } catch (error) {
        console.error("更新物流失败:", error);
        updateMessage.value = "更新失败，请重试";
        updateMessageType.value = "error";
    } finally {
        updating.value = false;
    }
}

// 查看详情
function viewDetails(item: LogisticsVO) {
    currentLogistics.value = item;
    showDetailModal.value = true;
}

// 关闭详情模态框
function closeDetailModal() {
    showDetailModal.value = false;
    currentLogistics.value = null;
}

// 获取状态文本
function getStatusText(status: number): string {
    const statusMap: Record<number, string> = {
        0: "待发货",
        1: "已发货",
        2: "运输中",
        3: "已签收",
    };
    return statusMap[status] || "未知";
}

// 获取状态样式类
function getStatusClass(status: number): string {
    const classMap: Record<number, string> = {
        0: "status-pending",
        1: "status-shipped",
        2: "status-transit",
        3: "status-signed",
    };
    return classMap[status] || "";
}

// 格式化日期
function formatDate(dateStr: string): string {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// 格式化日期时间（用于时间线）
function formatDateTime(timeStr: string): string {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

onMounted(() => {
    // 页面加载时自动加载所有物流列表
    loadLogisticsList();
});
</script>

<style scoped>
.admin-logistics {
    padding: 24px;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.panel-title {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
}

.panel-actions {
    display: flex;
    gap: 12px;
}

/* 搜索表单 */
.search-form-container {
    margin-bottom: 24px;
}

.search-form {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
}

.form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-item label {
    font-size: 14px;
    color: #374151;
    font-weight: 500;
}

.form-item input,
.form-item select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
}

.form-item input:focus,
.form-item select:focus {
    outline: none;
    border-color: #3b82f6;
    ring: 2px solid #bfdbfe;
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover {
    background: #2563eb;
}

.btn-outline {
    background: white;
    border: 1px solid #d1d5db;
    color: #374151;
}

.btn-outline:hover {
    background: #f9fafb;
}

.btn-outline:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.rotating {
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.loading-container {
    text-align: center;
    padding: 60px 20px;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 16px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.empty-state {
    text-align: center;
    padding: 80px 20px;
    color: #9ca3af;
}

.empty-state svg {
    opacity: 0.3;
    margin-bottom: 16px;
}

.logistics-table-wrap {
    overflow-x: auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.logistics-table {
    width: 100%;
    border-collapse: collapse;
}

.logistics-table th,
.logistics-table td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
}

.logistics-table th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    font-size: 14px;
}

.logistics-table td {
    font-size: 14px;
    color: #4b5563;
}

.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.status-pending {
    background: #fef3c7;
    color: #92400e;
}

.status-shipped {
    background: #dbeafe;
    color: #1e40af;
}

.status-transit {
    background: #e0e7ff;
    color: #3730a3;
}

.status-signed {
    background: #d1fae5;
    color: #065f46;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.btn-link {
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 14px;
    padding: 4px 8px;
}

.btn-link:hover {
    color: #2563eb;
    text-decoration: underline;
}

.btn-link.primary {
    color: #059669;
}

.btn-link.primary:hover {
    color: #047857;
}

/* Modal */
.modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-large {
    max-width: 800px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    line-height: 1;
}

.modal-close:hover {
    color: #374151;
}

.modal-body {
    padding: 24px;
}

/* 订单信息展示区 */
.order-info-banner {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-left: 4px solid #0ea5e9;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 24px;
}

.order-info-banner .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.order-info-banner .info-item:last-child {
    margin-bottom: 0;
}

.order-info-banner .label {
    font-size: 14px;
    color: #0369a1;
    font-weight: 600;
    min-width: 80px;
}

.order-info-banner .value {
    font-size: 14px;
    color: #0c4a6e;
    font-family: "Courier New", monospace;
    font-weight: 500;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #374151;
    font-weight: 500;
}

.required {
    color: #ef4444;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
    ring: 2px solid #bfdbfe;
}

.input-disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
}

.form-group small {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #9ca3af;
}

.message {
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
    font-size: 14px;
}

.message.success {
    background: #d1fae5;
    color: #065f46;
}

.message.error {
    background: #fee2e2;
    color: #991b1b;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #e5e7eb;
}

/* Logistics Info */
.logistics-info {
    background: #f9fafb;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
}

.info-row {
    display: flex;
    margin-bottom: 8px;
    font-size: 14px;
}

.info-row:last-child {
    margin-bottom: 0;
}

.info-row strong {
    min-width: 100px;
    color: #6b7280;
}

.info-row span {
    color: #1f2937;
}

/* Timeline */
.timeline {
    position: relative;
    padding-left: 20px;
}

.timeline::before {
    content: "";
    position: absolute;
    left: 6px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: #e5e7eb;
}

.timeline-item {
    position: relative;
    padding-bottom: 24px;
}

.timeline-item:last-child {
    padding-bottom: 0;
}

.timeline-item.active .timeline-dot {
    background: #3b82f6;
    border-color: #3b82f6;
}

.timeline-dot {
    position: absolute;
    left: -14px;
    top: 4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    border: 2px solid #d1d5db;
}

.timeline-content {
    padding-left: 24px;
}

.timeline-time {
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 4px;
}

.timeline-location {
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 4px;
}

.timeline-desc {
    font-size: 14px;
    color: #4b5563;
}

.empty-timeline {
    text-align: center;
    padding: 40px 20px;
    color: #9ca3af;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
    transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
    transform: scale(0.95);
}

/* Toast */
.toast {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    padding: 12px 24px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    z-index: 2000;
    opacity: 0;
    transition: all 0.3s;
    pointer-events: none;
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(0);
}

.toast.success {
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
}

.toast.error {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
}

/* 分页 */
.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-top: 1px solid #e5e7eb;
    background: white;
}

.pagination-info {
    font-size: 14px;
    color: #6b7280;
}

.pagination-controls {
    display: flex;
    gap: 8px;
    align-items: center;
}

.btn-page {
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #3b82f6;
    color: #3b82f6;
}

.btn-page.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-size-select {
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
}

.page-size-select:focus {
    outline: none;
    border-color: #3b82f6;
}

/* Slide Down Transition */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
