<template>
  <div class="panel">
    <div class="cat-bar">
      <span class="cat-label">分类：</span>
      <button
        v-for="c in catDefs"
        :key="c.key"
        class="cat-chip"
        :class="{ active: currentCat === c.key }"
        @click="$emit('update:currentCat', c.key)"
      >
        {{ c.label }}
      </button>
      <div class="cat-search">
        <span>🔍</span>
        <input
          :value="searchKw"
          @input="$emit('update:searchKw', ($event.target as HTMLInputElement).value)"
          placeholder="搜索商品名 / 功效"
        />
      </div>
    </div>
    <div v-if="filteredProducts.length === 0" class="empty-tip">
      <span class="ic">🔍</span>{{ loading ? "加载中..." : "未找到符合条件的商品" }}
    </div>
    <div v-else class="product-grid">
      <div
        v-for="p in filteredProducts"
        :key="p.id"
        class="product-card"
        @click="$emit('openProduct', p)"
      >
        <div class="product-image">
          <span class="product-icon">{{ p.icon }}</span>
          <span v-if="p.sold > 2000" class="product-tag-hot">熱賣</span>
        </div>
        <div class="product-body">
          <div class="product-name">{{ p.name }}</div>
          <div class="product-effect">{{ p.effect }}</div>
          <div class="product-meta">
            <span class="product-price"><span class="price-cny">¥</span>{{ p.price }}</span>
            <span class="product-sales">已售 {{ p.sold }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryVO } from "@/network/product";
import {computed} from "vue";

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
  products: Product[];
  categories: CategoryVO[];
  currentCat: string;
  searchKw: string;
  loading: boolean;
}

const props = defineProps<Props>();

defineEmits<{
  'update:currentCat': [value: string];
  'update:searchKw': [value: string];
  'openProduct': [product: Product];
}>();

// 分类定义
const catDefs = computed(() => {
  const dynamicCats = props.categories.map((cat) => ({
    key: cat.name,
    label: cat.name,
  }));

  return [{ key: "all", label: "全部" }, ...dynamicCats];
});

// 过滤商品
const filteredProducts = computed(() =>
  props.products
    .filter((p) => props.currentCat === "all" || p.cat === props.currentCat)
    .filter(
      (p) =>
        !props.searchKw ||
        p.name.includes(props.searchKw) ||
        p.effect.includes(props.searchKw),
    ),
);
</script>

<style scoped lang="scss">
.panel {
  // panel 样式由父组件提供
}

.cat-bar {
  background: var(--paper);
  border-radius: 14px;
  padding: 16px 20px;
  box-shadow: var(--shadow);
  border: 1px solid rgba(232, 223, 208, 0.4);
  margin-bottom: 20px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.cat-label {
  font-size: 13px;
  color: var(--ink-muted);
  margin-right: 4px;
}

.cat-chip {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: var(--paper-warm);
  color: var(--ink-soft);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;

  &:hover {
    border-color: var(--jade-light);
    color: var(--jade);
  }

  &.active {
    background: var(--jade);
    color: white;
    border-color: var(--jade);
    box-shadow: 0 2px 6px rgba(92, 131, 116, 0.25);
  }
}

.cat-search {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 6px 14px;
  width: 240px;

  input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-family: inherit;
    font-size: 13px;
    color: var(--ink);

    &::placeholder {
      color: var(--ink-muted);
    }
  }
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

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.product-card {
  background: var(--paper);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 1px solid rgba(232, 223, 208, 0.4);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
  }
}

.product-image {
  height: 160px;
  background: linear-gradient(135deg, var(--cream), var(--gold-soft));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56px;
  position: relative;
}

.product-icon {
  font-size: 56px;
  line-height: 1;
}

.product-tag-hot {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--cinnabar);
  color: white;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-family: "STKaiti", serif;
}

.product-body {
  padding: 14px;
}

.product-name {
  font-family: "STKaiti", serif;
  font-weight: 600;
  color: var(--ink);
  font-size: 15px;
  margin-bottom: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 42px;
}

.product-effect {
  font-size: 12px;
  color: var(--ink-muted);
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.product-price {
  color: var(--cinnabar);
  font-weight: 700;
  font-size: 18px;
  font-family: "STKaiti", serif;
}

.price-cny {
  font-size: 12px;
  margin-right: 1px;
}

.product-sales {
  font-size: 11px;
  color: var(--ink-muted);
}
</style>
