<template>
  <div class="panel">
    <div class="yy-card">
      <div class="yy-card-title">
        <div class="dot"></div>
        我的购物车
      </div>
      <div class="ai-sync-note">
        🤖 本购物车已与「AI 管家」板块联通，由 AI
        推荐加入的商品会在名称后标注「AI 推荐」徽章
      </div>
      <div v-if="cartItems.length === 0" class="empty-tip">
        <span class="ic">🛒</span>购物车空空如也<br />
        <button
          class="yy-btn"
          style="margin-top: 16px"
          @click="$emit('goToShop')"
        >
          去逛逛
        </button>
      </div>
      <div v-else class="cart-list">
        <div
          v-for="item in cartItems"
          :key="item.id"
          class="cart-item"
        >
          <div class="cart-thumb">
            {{ getProductIcon(item.productId) }}
          </div>
          <div class="cart-item-info">
            <div class="cart-item-name">
              {{ item.productName }}
            </div>
            <div class="cart-item-meta">
              单价 ¥{{ item.price.toFixed(2) }}
            </div>
          </div>
          <div class="qty-ctrl">
            <button
              class="qty-btn"
              @click="$emit('changeQty', item.id, -1)"
            >
              −
            </button>
            <span class="qty-num">{{ item.quantity }}</span>
            <button
              class="qty-btn"
              @click="$emit('changeQty', item.id, 1)"
            >
              +
            </button>
          </div>
          <div class="cart-item-price">
            ¥{{ (item.price * item.quantity).toFixed(2) }}
          </div>
          <button
            class="cart-rm"
            @click="$emit('removeFromCart', item.id)"
          >
            ✕
          </button>
        </div>
      </div>
      <div v-if="cartItems.length > 0" class="cart-summary">
        <div>
          <span class="cart-total-label">合计：</span>
          <span class="cart-total-num">¥{{ cartTotal.toFixed(2) }}</span>
          <span class="cart-total-hint">不含运费</span>
        </div>
        <div style="display: flex; gap: 10px">
          <button
            class="btn btn-outline"
            @click="$emit('goToShop')"
          >
            继续购物
          </button>
          <button
            class="btn btn-cinnabar btn-lg"
            @click="$emit('openPay')"
          >
            去结算
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CartItemVO } from "@/network/product";

interface Props {
  cartItems: CartItemVO[];
  cartTotal: number;
  getProductIcon: (productId: number) => string;
}

defineProps<Props>();

defineEmits<{
  'goToShop': [];
  'changeQty': [cartItemId: number, delta: number];
  'removeFromCart': [cartItemId: number];
  'openPay': [];
}>();
</script>

<style scoped lang="scss">
.panel {
  // panel 样式由父组件提供
}

.yy-card {
  background: var(--paper);
  border-radius: 14px;
  box-shadow: var(--shadow);
  border: 1px solid rgba(232, 223, 208, 0.4);
  padding: 20px;
}

.yy-card-title {
  font-family: "STKaiti", serif;
  font-size: 18px;
  color: var(--ink);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--jade);
  }
}

.ai-sync-note {
  background: var(--moon-soft);
  color: var(--moon);
  border: 1px dashed #bfcfe3;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  margin-bottom: 12px;
}

.empty-tip {
  text-align: center;
  padding: 60px 20px;
  color: var(--ink-muted);
  font-size: 14px;

  .ic {
    font-size: 56px;
    opacity: 0.5;
    margin-bottom: 12px;
    display: block;
  }
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--paper-warm);
}

.cart-thumb {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--cream), var(--gold-soft));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-family: "STKaiti", serif;
  font-weight: 600;
  color: var(--ink);
  font-size: 15px;
}

.cart-item-meta {
  font-size: 12px;
  color: var(--ink-muted);
  margin-top: 2px;
}

.qty-ctrl {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: 6px;
  overflow: hidden;
}

.qty-btn {
  background: var(--cream);
  border: none;
  width: 26px;
  height: 26px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink);

  &:hover {
    background: var(--jade-soft);
  }
}

.qty-num {
  width: 36px;
  text-align: center;
  font-size: 13px;
  height: 26px;
  line-height: 26px;
  border-left: 1px solid var(--line);
  border-right: 1px solid var(--line);
  background: white;
  color: var(--ink);
  display: inline-block;
}

.cart-item-price {
  font-family: "STKaiti", serif;
  color: var(--cinnabar);
  font-weight: 700;
  font-size: 16px;
  width: 80px;
  text-align: right;
}

.cart-rm {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--ink-muted);
  font-size: 16px;

  &:hover {
    color: var(--cinnabar);
  }
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  background: linear-gradient(135deg, var(--jade-soft), var(--paper-warm));
  border-radius: 12px;
  border: 1px solid var(--jade-soft);
}

.cart-total-label {
  font-size: 14px;
  color: var(--ink-muted);
}

.cart-total-num {
  font-family: "STKaiti", serif;
  color: var(--cinnabar);
  font-weight: 700;
  font-size: 28px;
  margin-left: 10px;
}

.cart-total-hint {
  font-size: 12px;
  color: var(--ink-muted);
  margin-left: 10px;
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

  &-cinnabar {
    background: var(--cinnabar);
    color: white;

    &:hover {
      background: #962f22;
    }
  }

  &-lg {
    padding: 12px 28px;
    font-size: 15px;
  }
}
</style>
