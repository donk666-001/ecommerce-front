// src/composables/landing/useScrollAnimate.ts

/**
 * 监听 root 元素内所有 [data-animate] 子元素，
 * 进入视口时添加 .visible 类触发入场动画。
 *
 * @param root      需要监听的根 DOM 元素
 * @param threshold 触发阈值，默认 0.12（元素露出 12% 时触发）
 */
export function useScrollAnimate(root: HTMLElement, threshold = 0.12): void {
    const targets = root.querySelectorAll<HTMLElement>("[data-animate]");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // 进入视口：添加可见类，并停止继续观察（动画只触发一次）
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold },
    );

    // 对每个 [data-animate] 子元素启动观察
    targets.forEach((el) => observer.observe(el));
}
