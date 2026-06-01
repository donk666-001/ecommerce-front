<template>
  <div
    class="modal-mask"
    :class="{ show: modelValue }"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="modal" style="max-width: 560px">
      <div class="modal-header">
        <h3>申请退款</h3>
        <button
          class="modal-close"
          @click="$emit('update:modelValue', false)"
        >
          ×
        </button>
      </div>
      <div class="modal-body">
        <div class="refund-order-info">
          <div class="info-row">
            <span class="label">订单编号：</span>
            <span class="value">{{ formData.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">订单金额：</span>
            <span class="value highlight">¥{{ formData.orderAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="refund-form">
          <div class="form-group">
            <label class="form-label required">退款类型</label>
            <div class="radio-group">
              <label class="radio-item">
                <input
                  v-model.number="formData.refundType"
                  type="radio"
                  :value="1"
                />
                <span>仅退款</span>
              </label>
              <label class="radio-item">
                <input
                  v-model.number="formData.refundType"
                  type="radio"
                  :value="2"
                />
                <span>退货退款</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label required">退款金额</label>
            <div class="input-with-prefix">
              <span class="prefix">¥</span>
              <input
                v-model.number="formData.refundAmount"
                type="number"
                step="0.01"
                min="0.01"
                :max="formData.orderAmount"
                placeholder="请输入退款金额"
              />
            </div>
            <div class="form-hint">
              最多可退 ¥{{ formData.orderAmount.toFixed(2) }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label required">退款原因</label>
            <select
              v-model="formData.reason"
              class="form-select"
            >
              <option value="" disabled>
                请选择退款原因
              </option>
              <option value="商品质量问题">
                商品质量问题
              </option>
              <option value="商品与描述不符">
                商品与描述不符
              </option>
              <option value="发错货/漏发">发错货/漏发</option>
              <option value="不喜欢/不想要">
                不喜欢/不想要
              </option>
              <option value="其他">其他</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">补充说明（可选）</label>
            <textarea
              v-model="formData.description"
              rows="3"
              placeholder="请详细描述问题，有助于加快审核进度..."
              class="form-textarea"
            ></textarea>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button
          class="btn btn-outline"
          @click="$emit('update:modelValue', false)"
          :disabled="submitting"
        >
          取消
        </button>
        <button
          class="btn btn-cinnabar"
          @click="$emit('submit')"
          :disabled="submitting"
        >
          {{ submitting ? "提交中..." : "提交申请" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RefundForm {
  orderId: number;
  orderNo: string;
  orderAmount: number;
  refundType: number;
  refundAmount: number;
  reason: string;
  description: string;
}

interface Props {
  modelValue: boolean;
  formData: RefundForm;
  submitting: boolean;
}

defineProps<Props>();

defineEmits<{
  'update:modelValue': [value: boolean];
  'submit': [];
}>();
</script>

<style scoped lang="scss">
.modal-mask {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(44, 54, 57, 0.5);
  backdrop-filter: blur(3px);
  z-index: 1000;
  justify-content: center;
  align-items: center;
  padding: 20px;

  &.show {
    display: flex;
  }
}

.modal {
  background: white;
  border-radius: 14px;
  max-width: 560px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  padding: 16px 22px;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    font-family: "STKaiti", serif;
    font-size: 18px;
    color: var(--ink);
  }
}

.modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 22px;
  color: var(--ink-muted);

  &:hover {
    color: var(--ink);
  }
}

.modal-body {
  padding: 22px;
}

.modal-footer {
  padding: 14px 22px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.refund-order-info {
  background: var(--paper-warm);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;

  .label {
    color: var(--ink-muted);
  }

  .value {
    color: var(--ink);
    font-weight: 500;

    &.highlight {
      color: var(--cinnabar);
      font-weight: 700;
      font-size: 18px;
    }
  }
}

.refund-form {
  .form-group {
    margin-bottom: 18px;
  }

  .form-label {
    display: block;
    font-size: 14px;
    color: var(--ink);
    font-weight: 600;
    margin-bottom: 8px;

    &.required::after {
      content: " *";
      color: var(--cinnabar);
    }
  }

  .radio-group {
    display: flex;
    gap: 20px;
  }

  .radio-item {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-size: 14px;
    color: var(--ink);

    input[type="radio"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: var(--jade);
    }
  }

  .input-with-prefix {
    display: flex;
    align-items: center;
    border: 1px solid var(--line);
    border-radius: 8px;
    overflow: hidden;
    transition: border-color 0.2s;

    &:focus-within {
      border-color: var(--jade);
    }

    .prefix {
      padding: 0 12px;
      background: var(--paper-warm);
      color: var(--ink-muted);
      font-weight: 600;
      font-size: 14px;
      border-right: 1px solid var(--line);
    }

    input {
      flex: 1;
      border: none;
      padding: 10px 12px;
      font-size: 14px;
      outline: none;
      font-family: inherit;
    }
  }

  .form-hint {
    margin-top: 6px;
    font-size: 12px;
    color: var(--ink-muted);
  }

  .form-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
    background: white;
    cursor: pointer;

    &:focus {
      border-color: var(--jade);
    }
  }

  .form-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    resize: vertical;
    transition: border-color 0.2s;

    &:focus {
      border-color: var(--jade);
    }
  }
}

.btn {
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &-outline {
    border: 1px solid var(--line);
    background: white;
    color: var(--ink);

    &:hover:not(:disabled) {
      border-color: var(--jade);
      color: var(--jade);
    }
  }

  &-cinnabar {
    background: var(--cinnabar);
    color: white;

    &:hover:not(:disabled) {
      background: #962f22;
    }
  }
}
</style>
