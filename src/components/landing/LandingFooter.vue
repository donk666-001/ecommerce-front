<template>
  <footer class="footer glass-section">
    <div class="footer-glow drifting-3" />
    <div class="footer-inner">
      <div>
        <div class="footer-logo">
          <div class="footer-logo-blob">颐</div>
          <span class="footer-logo-name">颐养阁</span>
        </div>
        <p class="footer-desc">传承东方养生智慧<br />让自然节律守护健康生活</p>
      </div>
      <div v-for="col in cols" :key="col.title">
        <div class="footer-col-title">{{ col.title }}</div>
        <ul class="footer-links">
          <li v-for="link in col.links" :key="link"><a href="#">{{ link }}</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="footer-copy">© 2026 颐养阁 · 传承东方养生智慧</span>
      <div class="footer-social">
        <div class="social-icon" title="微信">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M8.5 2C4.91 2 2 4.47 2 7.5c0 1.61.78 3.06 2.03 4.08L3.5 14l2.61-1.3c.73.24 1.54.3 2.39.3.14 0 .28 0 .42-.01C8.49 12.67 8.5 12.34 8.5 12c0-2.76 2.46-5 5.5-5 .2 0 .4.01.59.03C13.83 4.22 11.38 2 8.5 2zM6 7a1 1 0 110-2 1 1 0 010 2zm5 0a1 1 0 110-2 1 1 0 010 2zM14 8c-2.76 0-5 1.79-5 4s2.24 4 5 4c.65 0 1.26-.1 1.82-.28L18 17l-.85-2.33C18.29 13.8 19 12.96 19 12c0-2.21-2.24-4-5-4zm-1.5 3.5a.75.75 0 110-1.5.75.75 0 010 1.5zm3 0a.75.75 0 110-1.5.75.75 0 010 1.5z"/></svg>
        </div>
        <div class="social-icon" title="微博">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M10.1 20c-4.61 0-8.1-2.4-8.1-5.98 0-2.09 1.19-4.3 3.26-6.1C7.32 6.08 9.49 5.12 11.39 5.12c.78 0 1.33.155 1.68.424.15.12.24.29.24.462 0 .424-.5.824-1.21 1.127-.65.272-1.42.423-2.1.423-1.5 0-3.27.672-4.7 1.87-1.35 1.127-2.14 2.57-2.14 3.86 0 2.598 2.84 4.304 6.94 4.304 4.1 0 7.33-2.08 7.33-4.676 0-.484-.11-.935-.34-1.35a.44.44 0 01.06-.572.554.554 0 01.594-.059 3.05 3.05 0 011.454 2.556C19.2 16.754 15.36 20 10.1 20zm6.7-11.6a.8.8 0 110-1.6.8.8 0 010 1.6zm2.4-2.4a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2zM10.2 11.4a3.6 3.6 0 013.6 3.6 3.6 3.6 0 01-3.6 3.6 3.6 3.6 0 01-3.6-3.6 3.6 3.6 0 013.6-3.6zm.6 3.6a.6.6 0 10-1.2 0 .6.6 0 001.2 0z"/></svg>
        </div>
        <div class="social-icon" title="抖音">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z"/></svg>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
const cols = [
  { title: '功能模块', links: ['节气养生', '睡眠作息', '经期管理', '中医养生'] },
  { title: '服务',     links: ['名医健康圈', 'AI 管家', '元气社区', '健康商城'] },
  { title: '关于',     links: ['关于我们', '隐私政策', '联系我们'] },
]
</script>

<style lang="scss" scoped>
.footer { padding: 52px 0 36px; background: rgba(4,8,3,0.88); backdrop-filter: blur(6px); position: relative; overflow: hidden; z-index: 1; }
.footer-glow { position: absolute; left: -40px; top: -30px; width: 200px; height: 180px; background: rgba(93,112,82,0.06); border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; filter: blur(48px); }
.footer-inner { max-width: 1200px; margin: 0 auto; padding: 0 48px; display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 44px; position: relative; z-index: 1; }
.footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.footer-logo-blob { width: 32px; height: 32px; background: #B33C2C; border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 800; box-shadow: 0 2px 8px rgba(179,60,44,0.35); }
.footer-logo-name { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.78); }
.footer-desc { font-size: 12px; color: rgba(255,255,255,0.28); line-height: 1.8; }
.footer-col-title { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.42); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 18px; }
.footer-links { list-style: none; li { margin-bottom: 11px; } a { font-size: 13px; color: rgba(255,255,255,0.28); text-decoration: none; transition: color 0.2s; &:hover { color: rgba(255,255,255,0.68); } } }
.footer-bottom { max-width: 1200px; margin: 0 auto; padding: 20px 48px 0; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; }
.footer-copy { font-size: 12px; color: rgba(255,255,255,0.2); }
.footer-social { display: flex; gap: 10px; }
.social-icon { width: 32px; height: 32px; border-radius: 999px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; color: rgba(255,255,255,0.4); &:hover { background: rgba(93,112,82,0.2); border-color: rgba(93,112,82,0.3); color: rgba(255,255,255,0.8); } }
</style>
