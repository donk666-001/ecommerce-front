<template>
    <div class="admin-products">
        <!-- 顶部操作栏 -->
        <div class="panel-header">
            <h3 class="panel-title font-serif">商品管理</h3>
            <div class="panel-actions">
                <input
                    v-model="searchKeyword"
                    type="text"
                    placeholder="搜索商品名称"
                    class="search-input"
                    @keyup.enter="loadProducts"
                />
                <select
                    v-model="filterCategory"
                    class="filter-select"
                    @change="loadProducts"
                >
                    <option value="">全部分类</option>
                    <option
                        v-for="cat in categories"
                        :key="cat.id"
                        :value="cat.id"
                    >
                        {{ cat.name }}
                    </option>
                </select>
                <button class="btn btn-primary" @click="openCreateModal">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    新增商品
                </button>
                <button
                    class="btn btn-outline"
                    @click="loadProducts"
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

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <div class="spinner"></div>
            <p>加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="products.length === 0" class="empty-state">
            <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
            >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
            </svg>
            <p>暂无商品数据</p>
        </div>

        <!-- 商品列表 -->
        <div v-else class="products-grid">
            <div
                v-for="product in products"
                :key="product.id"
                class="product-card"
            >
                <div class="product-image-wrap">
                    <img
                        v-if="product.image"
                        :src="product.image"
                        :alt="product.name"
                        class="product-image"
                    />
                    <div v-else class="product-placeholder">
                        <span>{{ product.name.charAt(0) }}</span>
                    </div>
                    <div
                        class="product-status-badge"
                        :class="getStatusClass(product.status)"
                    >
                        {{ getStatusText(product.status) }}
                    </div>
                </div>

                <div class="product-info">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-category">
                        {{ product.categoryName }}
                    </div>

                    <div class="product-meta">
                        <div class="meta-item">
                            <span class="meta-label">原价</span>
                            <span class="meta-value"
                                >¥{{ product.originalPrice.toFixed(2) }}</span
                            >
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">现价</span>
                            <span class="meta-value price-discount"
                                >¥{{ product.discountPrice.toFixed(2) }}</span
                            >
                        </div>
                    </div>

                    <div class="product-stats">
                        <div class="stat-item">
                            <span class="stat-label">库存</span>
                            <span class="stat-value">{{ product.stock }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">销量</span>
                            <span class="stat-value">{{
                                product.soldCount
                            }}</span>
                        </div>
                    </div>

                    <div class="product-tags" v-if="product.tags">
                        <span
                            v-for="tag in product.tags.split(',')"
                            :key="tag"
                            class="tag"
                        >
                            {{ tag.trim() }}
                        </span>
                    </div>

                    <div class="product-actions">
                        <button
                            class="btn-link"
                            @click="openEditModal(product)"
                        >
                            编辑
                        </button>
                        <button
                            class="btn-link danger"
                            @click="handleDelete(product.id, product.name)"
                        >
                            删除
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination">
            <button
                class="page-btn"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
            >
                上一页
            </button>
            <span class="page-info"
                >第 {{ currentPage }} / {{ totalPages }} 页（共
                {{ total }} 条）</span
            >
            <button
                class="page-btn"
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
            >
                下一页
            </button>
        </div>

        <!-- 新增/编辑商品模态框 -->
        <Teleport to="body">
            <Transition name="modal">
                <div
                    v-if="showProductModal"
                    class="modal-mask"
                    @click.self="closeProductModal"
                >
                    <div class="modal-content modal-large">
                        <div class="modal-header">
                            <h3 class="font-serif">
                                {{ isEditMode ? "编辑商品" : "新增商品" }}
                            </h3>
                            <button
                                class="modal-close"
                                @click="closeProductModal"
                            >
                                ×
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="form-row">
                                <div class="form-group">
                                    <label
                                        >商品名称
                                        <span class="required">*</span></label
                                    >
                                    <input
                                        v-model.trim="productForm.name"
                                        type="text"
                                        placeholder="请输入商品名称"
                                    />
                                </div>

                                <div class="form-group">
                                    <label
                                        >商品分类
                                        <span class="required">*</span></label
                                    >
                                    <select
                                        v-model.number="productForm.categoryId"
                                    >
                                        <option value="">请选择分类</option>
                                        <option
                                            v-for="cat in categories"
                                            :key="cat.id"
                                            :value="cat.id"
                                        >
                                            {{ cat.name }}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label
                                        >原价
                                        <span class="required">*</span></label
                                    >
                                    <input
                                        v-model.number="
                                            productForm.originalPrice
                                        "
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div class="form-group">
                                    <label
                                        >现价
                                        <span class="required">*</span></label
                                    >
                                    <input
                                        v-model.number="
                                            productForm.discountPrice
                                        "
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label
                                        >库存
                                        <span class="required">*</span></label
                                    >
                                    <input
                                        v-model.number="productForm.stock"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>

                                <div class="form-group">
                                    <label>状态</label>
                                    <select v-model.number="productForm.status">
                                        <option :value="1">上架</option>
                                        <option :value="0">下架</option>
                                        <option :value="2">售罄</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>商品图片</label>
                                <div class="image-upload">
                                    <div
                                        v-if="imagePreview"
                                        class="image-preview"
                                    >
                                        <img :src="imagePreview" alt="预览" />
                                        <button
                                            type="button"
                                            class="remove-image"
                                            @click="removeImage"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <label v-else class="upload-btn">
                                        <input
                                            ref="fileInputRef"
                                            type="file"
                                            accept="image/*"
                                            @change="onImageSelected"
                                        />
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                        >
                                            <rect
                                                x="3"
                                                y="3"
                                                width="18"
                                                height="18"
                                                rx="2"
                                            />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <path d="M21 15l-5-5L5 21" />
                                        </svg>
                                        <span>上传图片</span>
                                    </label>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>功效说明</label>
                                <textarea
                                    v-model.trim="productForm.efficacy"
                                    rows="3"
                                    placeholder="请输入商品的功效说明"
                                ></textarea>
                            </div>

                            <div class="form-group">
                                <label>配送说明</label>
                                <textarea
                                    v-model.trim="
                                        productForm.deliveryDescription
                                    "
                                    rows="2"
                                    placeholder="请输入配送说明"
                                ></textarea>
                            </div>

                            <div class="form-group">
                                <label>商品描述</label>
                                <textarea
                                    v-model.trim="productForm.description"
                                    rows="4"
                                    placeholder="请输入商品详细描述"
                                ></textarea>
                            </div>

                            <div class="form-group">
                                <label>标签（用逗号分隔）</label>
                                <input
                                    v-model="tagsInput"
                                    type="text"
                                    placeholder="例如：养生,补气,补血"
                                />
                            </div>

                            <div
                                v-if="productMessage"
                                :class="['message', productMessageType]"
                            >
                                {{ productMessage }}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button
                                class="btn btn-outline"
                                @click="closeProductModal"
                            >
                                取消
                            </button>
                            <button
                                class="btn btn-primary"
                                :disabled="saving"
                                @click="handleSaveProduct"
                            >
                                {{ saving ? "保存中..." : "保存" }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- 确认删除模态框 -->
        <Teleport to="body">
            <Transition name="modal">
                <div
                    v-if="showDeleteConfirm"
                    class="modal-mask"
                    @click.self="showDeleteConfirm = false"
                >
                    <div class="modal-content" style="max-width: 400px">
                        <div class="modal-header">
                            <h3 class="font-serif">确认删除</h3>
                            <button
                                class="modal-close"
                                @click="showDeleteConfirm = false"
                            >
                                ×
                            </button>
                        </div>
                        <div
                            class="modal-body"
                            style="text-align: center; padding: 32px 24px"
                        >
                            <div style="font-size: 48px; margin-bottom: 16px">
                                ⚠️
                            </div>
                            <p
                                style="
                                    font-size: 15px;
                                    color: #1f2937;
                                    margin: 0;
                                "
                            >
                                确定要删除商品
                                <strong>{{ deleteTargetName }}</strong>
                                吗？<br />
                                <span style="color: #ef4444; font-size: 13px"
                                    >此操作不可恢复</span
                                >
                            </p>
                        </div>
                        <div
                            class="modal-footer"
                            style="justify-content: center; gap: 12px"
                        >
                            <button
                                class="btn btn-outline"
                                @click="showDeleteConfirm = false"
                            >
                                取消
                            </button>
                            <button
                                class="btn btn-danger"
                                :disabled="deleting"
                                @click="confirmDelete"
                            >
                                {{ deleting ? "删除中..." : "确认删除" }}
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
import {
    ApiProduct,
    type ProductVO,
    type ProductCreateDTO,
    type CategoryVO,
} from "@/network/product";

// 列表数据
const loading = ref(false);
const products = ref<ProductVO[]>([]);
const categories = ref<CategoryVO[]>([]);
const searchKeyword = ref("");
const filterCategory = ref("");

// 分页
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

// 商品模态框
const showProductModal = ref(false);
const isEditMode = ref(false);
const saving = ref(false);
const productMessage = ref("");
const productMessageType = ref<"success" | "error">("success");

const productForm = reactive<ProductCreateDTO>({
    name: "",
    image: "",
    categoryId: 0,
    originalPrice: 0,
    discountPrice: 0,
    stock: 0,
    efficacy: "",
    deliveryDescription: "",
    description: "",
    tags: "",
    status: 1,
});

let editingProductId = 0;

// 图片上传
const fileInputRef = ref<HTMLInputElement | null>(null);
const imagePreview = ref("");
const selectedImageFile = ref<File | null>(null);

// 删除确认
const showDeleteConfirm = ref(false);
const deleteTargetId = ref(0);
const deleteTargetName = ref("");
const deleting = ref(false);

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

// 标签输入
const tagsInput = ref("");

// 加载商品列表
async function loadProducts() {
    loading.value = true;

    try {
        const params: Parameters<typeof ApiProduct.listProducts>[0] = {
            page: currentPage.value,
            size: pageSize.value,
        };

        if (searchKeyword.value.trim()) {
            params.keyword = searchKeyword.value.trim();
        }

        if (filterCategory.value) {
            params.categoryId = Number(filterCategory.value);
        }

        const response = await ApiProduct.listProducts(params);

        if (response.data.code === 200 && response.data.data) {
            products.value = response.data.data.records || [];
            total.value = response.data.data.total || 0;
        } else {
            products.value = [];
            total.value = 0;
        }
    } catch (error) {
        console.error("加载商品列表失败:", error);
        showToast("加载商品列表失败", "error");
    } finally {
        loading.value = false;
    }
}

// 加载分类列表
async function loadCategories() {
    try {
        const response = await ApiProduct.getActiveCategories();

        if (response.data.code === 200 && response.data.data) {
            categories.value = response.data.data;
        }
    } catch (error) {
        console.error("加载分类列表失败:", error);
    }
}

// 打开新增模态框
function openCreateModal() {
    isEditMode.value = false;
    resetProductForm();
    showProductModal.value = true;
}

// 打开编辑模态框
function openEditModal(product: ProductVO) {
    isEditMode.value = true;
    editingProductId = product.id;

    productForm.name = product.name;
    productForm.categoryId = product.categoryId;
    productForm.originalPrice = product.originalPrice;
    productForm.discountPrice = product.discountPrice;
    productForm.stock = product.stock;
    productForm.efficacy = product.efficacy || "";
    productForm.deliveryDescription = product.deliveryDescription || "";
    productForm.description = product.description || "";
    productForm.tags = product.tags || "";
    productForm.status = product.status;
    productForm.image = product.image || "";

    imagePreview.value = product.image || "";
    tagsInput.value = product.tags ? product.tags.split(",").join(", ") : "";

    showProductModal.value = true;
}

// 关闭模态框
function closeProductModal() {
    showProductModal.value = false;
    resetProductForm();
    productMessage.value = "";
}

// 重置表单
function resetProductForm() {
    Object.assign(productForm, {
        name: "",
        image: "",
        categoryId: 0,
        originalPrice: 0,
        discountPrice: 0,
        stock: 0,
        efficacy: "",
        deliveryDescription: "",
        description: "",
        tags: "",
        status: 1,
    });
    imagePreview.value = "";
    selectedImageFile.value = null;
    tagsInput.value = "";
    editingProductId = 0;
}

// 图片选择
function onImageSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    // 检查文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
        productMessage.value = "图片大小不能超过 5MB";
        productMessageType.value = "error";
        return;
    }

    selectedImageFile.value = file;

    // 读取图片预览
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
}

// 移除图片
function removeImage() {
    imagePreview.value = "";
    selectedImageFile.value = null;
    productForm.image = "";
    if (fileInputRef.value) {
        fileInputRef.value.value = "";
    }
}

// 保存商品
async function handleSaveProduct() {
    // 验证
    if (!productForm.name.trim()) {
        productMessage.value = "请填写商品名称";
        productMessageType.value = "error";
        return;
    }

    if (!productForm.categoryId) {
        productMessage.value = "请选择商品分类";
        productMessageType.value = "error";
        return;
    }

    if (productForm.originalPrice <= 0) {
        productMessage.value = "请填写有效的原价";
        productMessageType.value = "error";
        return;
    }

    if (productForm.discountPrice <= 0) {
        productMessage.value = "请填写有效的现价";
        productMessageType.value = "error";
        return;
    }

    if (productForm.stock < 0) {
        productMessage.value = "请填写有效的库存";
        productMessageType.value = "error";
        return;
    }

    // 处理标签
    if (tagsInput.value.trim()) {
        productForm.tags = tagsInput.value
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
            .join(",");
    } else {
        productForm.tags = "";
    }

    saving.value = true;
    productMessage.value = "";

    try {
        // 如果有选择图片文件，需要转换为 Base64
        if (selectedImageFile.value) {
            const base64 = await fileToBase64(selectedImageFile.value);
            productForm.image = base64;
        }

        if (isEditMode.value && editingProductId) {
            // 更新商品
            const response = await ApiProduct.updateProduct(
                editingProductId,
                productForm,
            );

            if (response.data.code === 200) {
                showToast("商品更新成功", "success");
                setTimeout(() => {
                    closeProductModal();
                    loadProducts();
                }, 1000);
            } else {
                productMessage.value = response.data.message || "更新失败";
                productMessageType.value = "error";
            }
        } else {
            // 新增商品
            const response = await ApiProduct.createProduct(productForm);

            if (response.data.code === 200) {
                showToast("商品创建成功", "success");
                setTimeout(() => {
                    closeProductModal();
                    loadProducts();
                }, 1000);
            } else {
                productMessage.value = response.data.message || "创建失败";
                productMessageType.value = "error";
            }
        }
    } catch (error) {
        console.error("保存商品失败:", error);
        productMessage.value = "保存失败，请重试";
        productMessageType.value = "error";
    } finally {
        saving.value = false;
    }
}

// 文件转 Base64
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 删除商品
function handleDelete(id: number, name: string) {
    deleteTargetId.value = id;
    deleteTargetName.value = name;
    showDeleteConfirm.value = true;
}

// 确认删除
async function confirmDelete() {
    deleting.value = true;

    try {
        const response = await ApiProduct.deleteProduct(deleteTargetId.value);

        if (response.data.code === 200) {
            showToast("商品已删除", "success");
            showDeleteConfirm.value = false;
            loadProducts();
        } else {
            showToast(response.data.message || "删除失败", "error");
        }
    } catch (error) {
        console.error("删除商品失败:", error);
        showToast("删除失败，请重试", "error");
    } finally {
        deleting.value = false;
    }
}

// 分页跳转
function goToPage(page: number) {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
    loadProducts();
}

// 获取状态文本
function getStatusText(status: number): string {
    const map: Record<number, string> = {
        0: "下架",
        1: "上架",
        2: "售罄",
    };
    return map[status] || "未知";
}

// 获取状态样式
function getStatusClass(status: number): string {
    const map: Record<number, string> = {
        0: "status-offline",
        1: "status-online",
        2: "status-soldout",
    };
    return map[status] || "";
}

onMounted(() => {
    loadCategories();
    loadProducts();
});
</script>

<style scoped>
.admin-products {
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

.search-input {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    width: 240px;
}

.filter-select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    cursor: pointer;
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

.btn-danger {
    background: #ef4444;
    color: white;
}

.btn-danger:hover {
    background: #dc2626;
}

.btn-danger:disabled {
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

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

.product-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
}

.product-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.product-image-wrap {
    position: relative;
    width: 100%;
    height: 200px;
    background: #f3f4f6;
    overflow: hidden;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 48px;
    font-weight: 600;
}

.product-status-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    backdrop-filter: blur(8px);
}

.status-online {
    background: rgba(16, 185, 129, 0.9);
    color: white;
}

.status-offline {
    background: rgba(107, 114, 128, 0.9);
    color: white;
}

.status-soldout {
    background: rgba(239, 68, 68, 0.9);
    color: white;
}

.product-info {
    padding: 16px;
}

.product-name {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-category {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 12px;
}

.product-meta {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
}

.meta-item {
    flex: 1;
}

.meta-label {
    display: block;
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 2px;
}

.meta-value {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
}

.meta-value.price-discount {
    color: #ef4444;
}

.product-stats {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    padding: 8px 0;
    border-top: 1px solid #f3f4f6;
    border-bottom: 1px solid #f3f4f6;
}

.stat-item {
    flex: 1;
    text-align: center;
}

.stat-label {
    display: block;
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 2px;
}

.stat-value {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
}

.product-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
}

.tag {
    padding: 2px 8px;
    background: #f3f4f6;
    color: #6b7280;
    border-radius: 4px;
    font-size: 12px;
}

.product-actions {
    display: flex;
    gap: 8px;
}

.btn-link {
    flex: 1;
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 14px;
    padding: 6px 12px;
    border-radius: 6px;
    transition: all 0.2s;
}

.btn-link:hover {
    background: #eff6ff;
}

.btn-link.danger {
    color: #ef4444;
}

.btn-link.danger:hover {
    background: #fef2f2;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
    padding: 16px 0;
}

.page-btn {
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #3b82f6;
    color: #3b82f6;
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-info {
    font-size: 14px;
    color: #6b7280;
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

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
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
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.image-upload {
    display: flex;
    align-items: center;
}

.upload-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 120px;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    color: #9ca3af;
}

.upload-btn:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #eff6ff;
}

.upload-btn input {
    display: none;
}

.upload-btn span {
    margin-top: 8px;
    font-size: 13px;
}

.image-preview {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.remove-image {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    line-height: 1;
}

.remove-image:hover {
    background: rgba(0, 0, 0, 0.8);
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
</style>
