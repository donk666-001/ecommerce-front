<template>
  <div
    class="modal-mask"
    :class="{ show: modelValue }"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="modal" v-if="product">
      <div class="modal-header">
        <h3>商品详情</h3>
        <button class="modal-close" @click="$emit('update:modelValue', false)">
          ×
        </button>
      </div>
      <div class="modal-body">
        <div class="pd-grid">
          <div class="pd-image">{{ product.icon }}</div>
          <div class="pd-info">
            <h2>{{ product.name }}</h2>
            <div class="pd-tags">
              <span
                v-for="t in product.tags"
                :key="t"
                class="pd-tag"
              >{{ t }}</span>
            </div>
            <div class="pd-price-box">
              <span class="pd-price"><span class="pd-price-cny">¥</span>{{ product.price }}</span>
              <span class="pd-price-orig">¥{{ product.price > 0 ? Math.round(product.price * 1.3) : 0 }}</span>
              <span class="pd-badge-limit">限时</span>
            </div>
            <div class="pd-meta-row">
              <span>库存<strong>{{ product.stock }}</strong></span>
              <span>已售<strong>{{ product.sold }}</strong></span>
              <span>配送<strong>江浙沪次日达</strong></span>
            </div>
            <div class="pd-section">
              <h4>功效</h4>
              <p>{{ product.effect }}</p>
            </div>
            <div class="pd-section">
              <h4>商品描述</h4>
              <p>{{ product.desc }}</p>
            </div>
            <div class="pd-section">
              <h4>购买数量</h4>
              <div class="qty-ctrl" style="margin-top: 6px">
                <button
                  class="qty-btn"
                  @click="$emit('update:quantity', Math.max(1, quantity - 1))"
                >
                  −
                </button>
                <span class="qty-num">{{ quantity }}</span>
                <button class="qty-btn" @click="$emit('update:quantity', quantity + 1)">
                  +
                </button>
              </div>
            </div>
            <div class="pd-actions">
              <button class="btn btn-outline" @click="$emit('addToCart')">
                🛒 加入购物车
              </button>
              <button
                class="btn btn-outline"
                @click="$emit('goToCart')"
              >
                去购物车
              </button>
              <button class="btn btn-cinnabar" @click="$emit('buyNow')">
                立即购买
              </button>
              <button
                class="btn btn-outline"
                @click="$emit('contactService')"
              >
                💬 联系客服
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Product {
  id: string;
  name: string;
  cat: string;
  price: number;
  sold: number;
  stock: number;
  icon: string;
  tags: string[];
  effect: string;
  desc: string;
}

interface Props {
  modelValue: boolean;
  product: Product | null;
  quantity: number;
}

defineProps<Props>();

defineEmits<{
  'update:modelValue': [value: boolean];
  'update:quantity': [value: number];
  'addToCart': [];
  'goToCart': [];
  'buyNow': [];
  'contactService': [];
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
  max-width: 720px;
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

.pd-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

.pd-image {
  background: linear-gradient(135deg, var(--cream), var(--gold-soft));
  border-radius: 12px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 110px;
}

.pd-info h2 {
  font-family: "STKaiti", serif;
  font-size: 22px;
  color: var(--ink);
  margin-bottom: 6px;
}

.pd-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.pd-tag {
  padding: 3px 10px;
  background: var(--jade-soft);
  color: var(--jade);
  font-size: 11px;
  border-radius: 6px;
  font-family: "STKaiti", serif;
}

.pd-price-box {
  background: linear-gradient(
    135deg,
    var(--cinnabar-soft),
    var(--paper-warm)
  );
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 16px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.pd-price {
  font-family: "STKaiti", serif;
  color: var(--cinnabar);
  font-weight: 700;
  font-size: 32px;
}

.pd-price-cny {
  font-size: 16px;
  margin-right: 2px;
}

.pd-price-orig {
  font-size: 13px;
  color: var(--ink-muted);
  text-decoration: line-through;
}

.pd-badge-limit {
  font-size: 11px;
  background: var(--cinnabar);
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
}

.pd-meta-row {
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
  font-size: 13px;
  color: var(--ink-muted);

  strong {
    color: var(--ink);
  }
}

.pd-section {
  padding: 12px 0;
  border-top: 1px dashed var(--line);
  font-size: 13px;
  color: var(--ink-soft);

  h4 {
    font-family: "STKaiti", serif;
    color: var(--ink);
    margin-bottom: 6px;
    font-size: 14px;
  }
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

.pd-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
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
}
</style>
