/**
 * 在 duration 毫秒内将数值从 0 动画至 target，
 * 每帧调用 onUpdate(currentValue)。
 */
export function useCountUp(
  target: number,
  duration: number,
  onUpdate: (value: number) => void,
): void {
  const startTime = performance.now()

  function tick(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    // 三次缓出
    const eased = 1 - Math.pow(1 - progress, 3)
    onUpdate(Math.round(target * eased))
    if (progress < 1) requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}
