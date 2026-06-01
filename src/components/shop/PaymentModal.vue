<template>
  <div
    class="modal-mask"
    :class="{ show: modelValue }"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="modal" style="max-width: 520px">
      <div class="modal-header">
        <h3>支付订单</h3>
        <button class="modal-close" @click="$emit('update:modelValue', false)">
          ×
        </button>
      </div>
      <div class="modal-body">
        <div class="pay-card">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="pay-row"
          >
            <span>{{ item.productName }} × {{ item.quantity }}</span>
            <span>¥{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          <div class="pay-row">
            <span>运费</span>
            <span>¥0.00（满 88 免运）</span>
          </div>
          <div class="pay-row total">
            <span>实付金额</span>
            <span class="red">¥{{ cartTotal.toFixed(2) }}</span>
          </div>
        </div>
        <div class="pay-method">
          <div class="ali-logo">支</div>
          <div style="flex: 1">
            <div style="font-weight: 600; color: var(--ink)">
              支付宝支付
            </div>
            <div
              style="
                font-size: 12px;
                color: var(--ink-muted);
                margin-top: 2px;
              "
            >
              推荐使用 · 安全、便捷
            </div>
          </div>
          <div style="color: var(--jade); font-size: 20px">✓</div>
        </div>
        <p
          style="
            text-align: center;
            font-size: 13px;
            color: var(--ink-muted);
          "
        >
          请使用支付宝 APP 扫码完成支付
        </p>
        <div class="qr-mock"></div>
        <p
          style="
            text-align: center;
            font-size: 12px;
            color: var(--ink-muted);
          "
        >
          二维码 5 分钟内有效
        </p>
      </div>
      <div class="modal-footer">
        <button
          class="btn btn-outline"
          @click="$emit('update:modelValue', false)"
        >
          取消
        </button>
        <button class="btn btn-jade" @click="$emit('confirmPay')">
          模拟支付成功
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CartItemVO } from "@/network/product";

interface Props {
  modelValue: boolean;
  cartItems: CartItemVO[];
  cartTotal: number;
}

defineProps<Props>();

defineEmits<{
  'update:modelValue': [value: boolean];
  'confirmPay': [];
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
  max-width: 520px;
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

.pay-card {
  background: var(--paper-warm);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 14px;
}

.pay-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 14px;

  &.total {
    border-top: 1px dashed var(--line);
    margin-top: 10px;
    padding-top: 10px;
    font-family: "STKaiti", serif;
    font-size: 16px;

    .red {
      color: var(--cinnabar);
      font-size: 22px;
      font-weight: 700;
    }
  }
}

.pay-method {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border: 2px solid var(--jade);
  background: var(--jade-soft);
  border-radius: 10px;
  margin-bottom: 14px;
}

.ali-logo {
  width: 44px;
  height: 44px;
  background: #1677ff;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 22px;
}

.qr-mock {
  width: 200px;
  height: 200px;
  margin: 14px auto;
  background:
    linear-gradient(45deg, var(--ink) 25%, transparent 25%) 0 0 / 12px 12px,
    linear-gradient(-45deg, var(--ink) 25%, transparent 25%) 0 6px / 12px 12px,
    linear-gradient(45deg, transparent 75%, var(--ink) 75%) 6px -6px / 12px 12px,
    linear-gradient(-45deg, transparent 75%, var(--ink) 75%) -6px 0 / 12px 12px,
    white;
  border: 4px solid var(--ink);
  border-radius: 8px;
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

  &-outline {
    border: 1px solid var(--line);
    background: white;
    color: var(--ink);

    &:hover {
      border-color: var(--jade);
      color: var(--jade);
    }
  }

  &-jade {
    background: var(--jade);
    color: white;

    &:hover {
      background: #4a6f60;
    }
  }
}
</style>
