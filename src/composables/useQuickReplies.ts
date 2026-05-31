import { ref, watch } from 'vue'

const STORAGE_KEY = 'yyg_customer_quick_replies'

const defaultReplies = [
    '满 88 元包邮，江浙沪次日达',
    '质量问题 7 天无理由退换',
    '具体可看商品详情页的功效说明',
    '建议您先做一次体质测试再选购',
    '这款适合气血不足、手脚冰凉的朋友',
]

function loadFromStorage(): string[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw)
    } catch {}
    return [...defaultReplies]
}

// 模块级单例，所有组件共享同一份数据
const quickReplies = ref<string[]>(loadFromStorage())

watch(quickReplies, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

export function useQuickReplies() {
    return { quickReplies }
}
