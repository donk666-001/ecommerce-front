<!-- src/components/landing/LandingScene.vue -->
<template>
  <div class="scene" aria-hidden="true">
    <div class="scene-bg" />
    <div class="scene-vignette" />

    <!-- God Rays -->
    <div class="god-rays">
      <div v-for="n in 8" :key="n" :class="`ray ray-${n}`" />
    </div>
    <div class="sun-bloom" />

    <!-- 漂浮粒子 -->
    <div class="particles">
      <div v-for="n in 12" :key="n" :class="`particle p${n}`" />
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.scene {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.scene-bg {
  position: absolute;
  inset: -8%;
  background-image: url('/assets/images/forest-bg.jpg');
  background-size: cover;
  background-position: center 30%;
  animation: kenBurns 28s ease-in-out infinite alternate;
  filter: brightness(0.65) saturate(1.12);
}

@keyframes kenBurns {
  0%   { transform: scale(1) translateX(0%) translateY(0%); }
  100% { transform: scale(1.08) translateX(-2%) translateY(-1.5%); }
}

.scene-vignette {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 0%, transparent 40%, rgba(0, 0, 0, 0.28) 100%),
    linear-gradient(to bottom, transparent 0%, rgba(10, 16, 8, 0.18) 100%);
}

.god-rays {
  position: absolute;
  top: -10%;
  left: 18%;
  width: 0;
  height: 0;
}

.ray {
  position: absolute;
  top: 0;
  left: 0;
  height: 220vh;
  transform-origin: top center;
  background: linear-gradient(
    to bottom,
    rgba(255, 235, 160, 0.55) 0%,
    rgba(255, 235, 160, 0.18) 20%,
    rgba(255, 235, 160, 0.04) 50%,
    transparent 70%
  );
  animation: rayPulse var(--dur, 5s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
  filter: blur(var(--blur, 3px));
}

.ray-1 { width: 80px;  transform: rotate(-28deg); --dur: 6s;   --delay: 0s;   --blur: 6px; opacity: 0.7; }
.ray-2 { width: 40px;  transform: rotate(-22deg); --dur: 8s;   --delay: 0.8s; --blur: 4px; opacity: 0.5; }
.ray-3 { width: 120px; transform: rotate(-18deg); --dur: 7s;   --delay: 1.5s; --blur: 8px; opacity: 0.6; }
.ray-4 { width: 30px;  transform: rotate(-14deg); --dur: 5.5s; --delay: 2.2s; --blur: 3px; opacity: 0.45; }
.ray-5 { width: 60px;  transform: rotate(-10deg); --dur: 9s;   --delay: 0.4s; --blur: 5px; opacity: 0.4; }
.ray-6 { width: 20px;  transform: rotate(-6deg);  --dur: 6.5s; --delay: 3s;   --blur: 2px; opacity: 0.35; }
.ray-7 { width: 50px;  transform: rotate(-2deg);  --dur: 7.5s; --delay: 1s;   --blur: 4px; opacity: 0.3; }
.ray-8 { width: 15px;  transform: rotate(3deg);   --dur: 10s;  --delay: 2s;   --blur: 2px; opacity: 0.25; }

@keyframes rayPulse {
  0%, 100% { opacity: 0.12; }
  40%, 60%  { opacity: 1; }
}

.sun-bloom {
  position: absolute;
  top: -10%;
  left: 18%;
  transform: translate(-50%, -50%);
  width: 320px;
  height: 320px;
  background: radial-gradient(
    circle,
    rgba(255, 248, 180, 0.55) 0%,
    rgba(255, 220, 100, 0.22) 18%,
    rgba(255, 190, 80, 0.08) 36%,
    transparent 60%
  );
  border-radius: 50%;
  animation: bloomPulse 6s ease-in-out infinite;
  mix-blend-mode: screen;
  filter: blur(8px);
}

@keyframes bloomPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1);    opacity: 0.7; }
  50%       { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
}

.particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 240, 180, 0.7);
  animation: floatUp var(--dur, 12s) ease-in-out infinite;
  animation-delay: var(--delay, 0s);
  width: var(--size, 3px);
  height: var(--size, 3px);
  left: var(--x, 20%);
  bottom: -10px;
  filter: blur(0.5px);
}

@keyframes floatUp {
  0%   { opacity: 0; }
  10%  { opacity: 0.8; }
  90%  { opacity: 0.3; }
  100% { transform: translateY(-100vh) translateX(var(--drift, 30px)); opacity: 0; }
}

.p1  { --x: 8%;  --size: 2px; --dur: 14s; --delay: 0s;   --drift: 20px; }
.p2  { --x: 15%; --size: 3px; --dur: 11s; --delay: 2s;   --drift: -15px; }
.p3  { --x: 22%; --size: 2px; --dur: 16s; --delay: 0.5s; --drift: 25px; }
.p4  { --x: 30%; --size: 4px; --dur: 13s; --delay: 4s;   --drift: -10px; }
.p5  { --x: 38%; --size: 2px; --dur: 18s; --delay: 1s;   --drift: 18px; }
.p6  { --x: 45%; --size: 3px; --dur: 12s; --delay: 6s;   --drift: -22px; }
.p7  { --x: 55%; --size: 2px; --dur: 15s; --delay: 3s;   --drift: 12px; }
.p8  { --x: 62%; --size: 4px; --dur: 10s; --delay: 7s;   --drift: -18px; }
.p9  { --x: 72%; --size: 2px; --dur: 17s; --delay: 1.5s; --drift: 8px; }
.p10 { --x: 80%; --size: 3px; --dur: 13s; --delay: 5s;   --drift: 28px; }
.p11 { --x: 88%; --size: 2px; --dur: 19s; --delay: 3.5s; --drift: -12px; }
.p12 { --x: 94%; --size: 3px; --dur: 14s; --delay: 8s;   --drift: 16px; }
</style>
