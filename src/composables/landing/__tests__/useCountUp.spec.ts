import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCountUp } from '../useCountUp'

describe('useCountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 用独立计数器模拟 performance.now()，与 RAF 时间戳保持一致。
    // raf 从 -1 开始，使第一帧 ts = 0（与 startTime 一致），保证 values[0] === 0。
    let raf = -1
    let perfNow = 0
    vi.stubGlobal('performance', { now: () => perfNow })
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      raf++
      const ts = raf * 16
      setTimeout(() => {
        perfNow = ts
        cb(ts)
      }, 0)
      return raf
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('starts at 0 and reaches target after duration', async () => {
    const values: number[] = []
    useCountUp(50, 400, (v) => values.push(v))

    await vi.runAllTimersAsync()

    expect(values[0]).toBe(0)
    expect(values[values.length - 1]).toBe(50)
  })

  it('calls onUpdate with integer values only', async () => {
    const values: number[] = []
    useCountUp(10, 200, (v) => values.push(v))

    await vi.runAllTimersAsync()

    values.forEach((v) => expect(Number.isInteger(v)).toBe(true))
  })
})
