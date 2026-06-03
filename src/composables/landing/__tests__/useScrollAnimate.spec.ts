// src/composables/landing/__tests__/useScrollAnimate.spec.ts
import { useScrollAnimate } from "../useScrollAnimate";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("useScrollAnimate", () => {
    let observeMock: ReturnType<typeof vi.fn>;
    let unobserveMock: ReturnType<typeof vi.fn>;
    let disconnectMock: ReturnType<typeof vi.fn>;
    let observerCallback: IntersectionObserverCallback;

    beforeEach(() => {
        observeMock = vi.fn();
        unobserveMock = vi.fn();
        disconnectMock = vi.fn();
        // 使用 function 关键字让 vi.fn() 可以被 new 调用（箭头函数不能作为构造函数）
        vi.stubGlobal(
            "IntersectionObserver",
            vi.fn().mockImplementation(function (
                cb: IntersectionObserverCallback,
            ) {
                observerCallback = cb;
                return {
                    observe: observeMock,
                    unobserve: unobserveMock,
                    disconnect: disconnectMock,
                };
            }),
        );
    });

    it("observes a given root element for [data-animate] children", () => {
        const root = document.createElement("div");
        const child = document.createElement("div");
        child.setAttribute("data-animate", "");
        root.appendChild(child);

        useScrollAnimate(root);

        expect(observeMock).toHaveBeenCalledWith(child);
    });

    it("adds .visible class when element intersects", () => {
        const root = document.createElement("div");
        const child = document.createElement("div");
        child.setAttribute("data-animate", "");
        root.appendChild(child);

        useScrollAnimate(root);

        // simulate intersection
        observerCallback(
            [
                {
                    isIntersecting: true,
                    target: child,
                } as IntersectionObserverEntry,
            ],
            {} as IntersectionObserver,
        );

        expect(child.classList.contains("visible")).toBe(true);
    });

    it("does not add .visible when not intersecting", () => {
        const root = document.createElement("div");
        const child = document.createElement("div");
        child.setAttribute("data-animate", "");
        root.appendChild(child);

        useScrollAnimate(root);

        observerCallback(
            [
                {
                    isIntersecting: false,
                    target: child,
                } as IntersectionObserverEntry,
            ],
            {} as IntersectionObserver,
        );

        expect(child.classList.contains("visible")).toBe(false);
    });
});
