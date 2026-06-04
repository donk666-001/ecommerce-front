import { mount } from "@vue/test-utils";
import { reactive } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replaceMock = vi.fn().mockResolvedValue(undefined);

const routeState = reactive({
    path: "/shop",
    query: {
        open: "p12",
    } as Record<string, unknown>,
});

vi.mock("vue-router", () => ({
    useRoute: () => routeState,
    useRouter: () => ({
        replace: replaceMock,
        push: vi.fn(),
    }),
}));

vi.mock("@/network/product", () => ({
    ApiProduct: {
        listProducts: vi.fn().mockResolvedValue({
            data: {
                data: {
                    records: [
                        {
                            id: 12,
                            name: "酸枣仁晚安茶",
                            image: "",
                            tags: "助眠,安神",
                            originalPrice: 79,
                            discountPrice: 59,
                            stock: 18,
                            soldCount: 120,
                            deliveryDescription: "现货",
                            efficacy: "安神助眠",
                            description: "晚间饮用更适合放松入睡。",
                            categoryId: 1,
                            categoryName: "养生茶饮",
                            status: 1,
                            createdAt: "",
                            updatedAt: "",
                        },
                    ],
                },
            },
        }),
        listCategories: vi.fn().mockResolvedValue({
            data: {
                data: {
                    records: [],
                },
            },
        }),
        getCartDetail: vi.fn().mockResolvedValue({
            data: {
                data: {
                    items: [],
                    totalQuantity: 0,
                    totalPrice: 0,
                    itemCount: 0,
                },
            },
        }),
        addToCart: vi.fn(),
        updateCartItemQuantity: vi.fn(),
        removeCartItem: vi.fn(),
    },
}));

vi.mock("@/network/order", () => ({
    ApiOrder: {
        listOrders: vi.fn().mockResolvedValue({
            data: {
                data: {
                    records: [],
                },
            },
        }),
        createOrder: vi.fn(),
        cancelOrder: vi.fn(),
        confirmReceipt: vi.fn(),
        simulatePay: vi.fn(),
    },
}));

vi.mock("@/network/refund", () => ({
    ApiRefund: {
        listMyRefunds: vi.fn().mockResolvedValue({
            data: {
                data: {
                    records: [],
                },
            },
        }),
    },
}));

vi.mock("@/network", () => ({
    ApiLogistics: {
        getLogisticsByOrderNo: vi.fn(),
    },
}));

vi.mock("@/network/customer", () => ({
    ApiCustomer: {
        getProductCsAgents: vi.fn().mockResolvedValue([]),
    },
}));

vi.mock("@/network/chatBridge", () => ({
    bridgeEnterQueue: vi.fn(),
    bridgeCustomerSend: vi.fn(),
    bridgeSessions: {},
}));

vi.mock("@/store/user", () => ({
    useUserStore: () => ({
        G_LoginInfo: {
            nickName: "测试用户",
            account: "tester",
        },
    }),
}));

function buildStub(label: string) {
    return {
        template: `<div class="${label}-stub"></div>`,
    };
}

async function flushAll() {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
}

describe("商城页深链", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        routeState.query = { open: "p12" };
    });

    it("命中 open 查询参数时自动打开商品详情并清理 query", async () => {
        const ShopPage = (await import("@/pages/shop/index.vue")).default;
        const wrapper = mount(ShopPage, {
            global: {
                stubs: {
                    HeaderLayout: buildStub("header"),
                    ProductList: buildStub("product-list"),
                    CartPanel: buildStub("cart"),
                    OrderList: buildStub("order"),
                    CustomerService: buildStub("customer-service"),
                    PaymentModal: buildStub("payment"),
                    LogisticsModal: buildStub("logistics"),
                    RefundModal: buildStub("refund"),
                    AddressModal: buildStub("address"),
                    ProductDetailModal: {
                        template:
                            '<div class="pd-stub" :data-open="modelValue ? \'yes\' : \'no\'">{{ product?.name || "" }}</div>',
                        props: ["modelValue", "product", "quantity"],
                    },
                },
            },
        });

        await flushAll();

        const detail = wrapper.find(".pd-stub");
        expect(detail.exists()).toBe(true);
        expect(detail.attributes("data-open")).toBe("yes");
        expect(detail.text()).toContain("酸枣仁晚安茶");
        expect(replaceMock).toHaveBeenCalledWith({
            path: "/shop",
            query: {},
        });
    });
});
