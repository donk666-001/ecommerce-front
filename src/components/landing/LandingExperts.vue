<template>
  <section ref="sectionEl" class="experts glass-section">
    <div class="exp-blob exp-blob-1 drifting-2" />
    <div class="exp-blob exp-blob-2 drifting-1" />
    <div class="container">
      <div class="experts-header">
        <div class="section-tag" data-animate>✦ 专家团队</div>
        <h2 class="section-title" data-animate style="--delay:80ms">名医健康圈<br />50+ 认证专家在线</h2>
        <p class="section-sub" data-animate style="--delay:160ms">来自三甲医院的中西医专家，提供在线问诊与专业健康咨询。</p>
      </div>
      <div class="experts-grid">
        <div v-for="(e, i) in experts" :key="e.name"
             class="expert-card shimmer-card"
             data-animate="scale-up"
             :style="{ '--delay': `${i * 120}ms` }">
          <div class="expert-avatar">{{ e.initial }}</div>
          <div class="expert-name">{{ e.name }}</div>
          <div class="expert-title">{{ e.title }}</div>
          <div class="expert-org">{{ e.org }}</div>
          <div class="expert-tags">
            <span v-for="tag in e.tags" :key="tag" class="expert-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useScrollAnimate } from '@/composables/landing/useScrollAnimate'

const sectionEl = ref<HTMLElement | null>(null)
onMounted(() => { if (sectionEl.value) useScrollAnimate(sectionEl.value) })

const experts = [
  { initial: '张', name: '张明慧', title: '主任中医师', org: '北京协和医院 · 中医科', tags: ['体质调理', '节气养生'] },
  { initial: '李', name: '李春晓', title: '营养科主任', org: '上海中医药大学附属医院', tags: ['食疗方案', '减重管理'] },
  { initial: '王', name: '王子轩', title: '睡眠科专家', org: '广州中医药大学第一附属医院', tags: ['睡眠障碍', '针灸理疗'] },
]
</script>

<style lang="scss" scoped>
.experts { padding: 108px 0; background: rgba(20,12,6,0.52); backdrop-filter: blur(3px); position: relative; overflow: hidden; z-index: 1; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 48px; }
.exp-blob { position: absolute; filter: blur(56px); pointer-events: none; }
.exp-blob-1 { left: -60px; bottom: -40px; width: 300px; height: 260px; background: rgba(193,140,93,0.1); border-radius: 30% 70% 60% 40% / 50% 40% 60% 50%; }
.exp-blob-2 { right: -40px; top: -30px; width: 220px; height: 200px; background: rgba(93,112,82,0.08); border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
.experts-header { text-align: center; margin-bottom: 64px; position: relative; z-index: 1; }
.section-tag { display: inline-flex; align-items: center; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.22); border-radius: 999px; padding: 5px 14px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.9); letter-spacing: 0.5px; margin-bottom: 16px; backdrop-filter: blur(6px); }
.section-title { font-size: 42px; font-weight: 800; color: white; line-height: 1.15; letter-spacing: -0.5px; font-family: Georgia, 'STSong', serif; text-shadow: 0 2px 20px rgba(0,0,0,0.3); }
.section-sub { font-size: 16px; color: rgba(255,255,255,0.68); line-height: 1.75; max-width: 520px; margin: 12px auto 0; }
.experts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; position: relative; z-index: 1; }
.expert-card { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.11); border-radius: 2rem; padding: 36px 28px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.1); transition: transform 0.35s cubic-bezier(0.34,1.2,0.64,1), background 0.3s; backdrop-filter: blur(14px); &:hover { transform: rotate(1.5deg) translateY(-6px) scale(1.02); background: rgba(255,255,255,0.11); .expert-avatar { transform: scale(1.08) rotate(-3deg); } } }
.expert-avatar { width: 80px; height: 80px; border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; background: linear-gradient(135deg, rgba(93,112,82,0.8) 0%, rgba(193,140,93,0.8) 100%); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; font-size: 28px; font-weight: 800; color: white; font-family: Georgia, serif; border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 8px 24px rgba(0,0,0,0.25); transition: transform 0.3s; }
.expert-name { font-size: 18px; font-weight: 700; color: rgba(255,255,255,0.92); margin-bottom: 4px; }
.expert-title { font-size: 13px; color: var(--ld-moss-light); font-weight: 600; margin-bottom: 8px; }
.expert-org { font-size: 12px; color: rgba(255,255,255,0.42); margin-bottom: 14px; }
.expert-tags { display: flex; gap: 5px; justify-content: center; flex-wrap: wrap; }
.expert-tag { font-size: 11px; padding: 3px 9px; border-radius: 999px; background: rgba(93,112,82,0.2); color: var(--ld-moss-light); border: 1px solid rgba(93,112,82,0.25); }
</style>
