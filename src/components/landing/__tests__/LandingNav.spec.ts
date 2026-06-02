import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingNav from '../LandingNav.vue'

describe('LandingNav', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollY', 0)
  })

  it('renders logo and nav links', () => {
    const wrapper = mount(LandingNav)
    expect(wrapper.find('.nav-logo-name').text()).toBe('颐养阁')
    expect(wrapper.find('.btn-primary-nav').text()).toBe('前往登录 / 注册')
  })

  it('adds .scrolled class when scrollY > 80', async () => {
    const wrapper = mount(LandingNav)
    vi.stubGlobal('scrollY', 100)
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.navbar-inner').classes()).toContain('scrolled')
  })

  it('removes .scrolled class when scrollY <= 80', async () => {
    const wrapper = mount(LandingNav)
    vi.stubGlobal('scrollY', 100)
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()

    vi.stubGlobal('scrollY', 0)
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.navbar-inner').classes()).not.toContain('scrolled')
  })
})
