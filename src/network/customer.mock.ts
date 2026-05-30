import type {
    CustomerSession,
    QueuedCustomer,
    HistorySession,
    CustomerStats,
    AgentColleague,
} from "@/network/customer";

// Mock: 会话列表
const mockSessions: CustomerSession[] = [
    {
        id: "s1",
        custId: "c1",
        custName: "清风明月",
        avatar: "风",
        source: "商品 · 枸杞红枣茶",
        sourceTag: "product",
        startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        unread: 0,
        lastMsg: "请问这个孕妇可以喝吗？",
        custTags: ["气虚体质", "VIP"],
        custCity: "浙江 · 杭州",
        custReg: "2024-08-12",
        custSpent: "¥ 1,286",
        custOrderCount: 9,
        custCart: [
            { name: "枸杞红枣茶", icon: "🍵", qty: 1, price: 38 },
            { name: "四物汤药膳包", icon: "🌿", qty: 1, price: 48 },
        ],
        cartTotal: 86,
        messages: [
            { from: "sys", text: "会话开始 · 10:24", time: "" },
            {
                from: "customer",
                text: "你好客服，我想问一下这款枸杞红枣茶",
                time: "10:24",
            },
            {
                from: "me",
                text: "您好，这边是颐养阁售前客服小翠，很高兴为您服务～请问您想了解哪方面呢？",
                time: "10:24",
            },
            {
                from: "customer",
                type: "product",
                text: "枸杞红枣茶",
                meta: { icon: "🍵", desc: "滋阴补血", price: 38 },
                time: "10:25",
            },
            { from: "customer", text: "这个孕妇可以喝吗？", time: "10:26" },
        ],
    },
    {
        id: "s2",
        custId: "c2",
        custName: "云栖之客",
        avatar: "云",
        source: "订单 · YYG…008",
        sourceTag: "order",
        startedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        unread: 2,
        lastMsg: "物流好像停了，能帮我查一下吗",
        custTags: ["阳虚体质"],
        custCity: "江苏 · 苏州",
        custReg: "2024-03-05",
        custSpent: "¥ 642",
        custOrderCount: 4,
        custCart: [],
        cartTotal: 0,
        messages: [
            { from: "sys", text: "会话开始 · 10:17", time: "" },
            {
                from: "customer",
                text: "我那个订单 YYG20260525008，3 天没动了",
                time: "10:17",
            },
            { from: "me", text: "稍等，我帮您查一下物流信息", time: "10:18" },
            {
                from: "customer",
                text: "物流好像停了，能帮我查一下吗",
                time: "10:29",
            },
        ],
    },
    {
        id: "s3",
        custId: "c3",
        custName: "听雨人",
        avatar: "听",
        source: "通用咨询",
        sourceTag: "general",
        startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        unread: 0,
        lastMsg: "好的，谢谢～",
        custTags: ["平和体质"],
        custCity: "广东 · 广州",
        custReg: "2025-01-20",
        custSpent: "¥ 268",
        custOrderCount: 2,
        custCart: [{ name: "艾草足浴包", icon: "🧂", qty: 2, price: 35 }],
        cartTotal: 70,
        messages: [
            { from: "sys", text: "会话开始 · 10:09", time: "" },
            {
                from: "customer",
                text: "你好，想问下艾灸盒和足浴包能不能一起用",
                time: "10:09",
            },
            {
                from: "me",
                text: "您好～是可以的，建议先泡脚 15 分钟，再进行艾灸效果会更好哦",
                time: "10:10",
            },
            { from: "customer", text: "好的，谢谢～", time: "10:11" },
        ],
    },
];

// Mock: 排队队列
const mockQueue: QueuedCustomer[] = [
    {
        queueNum: 1,
        custName: "松涛",
        source: "商品 · 艾灸盒",
        sourceTag: "product",
        firstMsg: "艾灸盒使用前需要预热吗",
        waitTime: "02:18",
        roleType: "presale",
    },
    {
        queueNum: 2,
        custName: "南山客",
        source: "订单 · YYG…011",
        sourceTag: "order",
        firstMsg: "想退款怎么操作",
        waitTime: "01:04",
        roleType: "aftersale",
    },
];

// Mock: 历史会话
const mockHistory: HistorySession[] = [
    {
        sessionId: "S20260527-014",
        custName: "江南雪",
        agentName: "小翠",
        startTime: "10:24",
        duration: "12 min",
        msgCount: 23,
        rating: "★★★★★",
        endReason: "manual",
    },
    {
        sessionId: "S20260527-013",
        custName: "梧桐雨",
        agentName: "阿岚 → 小翠",
        startTime: "09:50",
        duration: "28 min",
        msgCount: 41,
        rating: "★★★★☆",
        endReason: "transfer",
    },
    {
        sessionId: "S20260527-012",
        custName: "白露",
        agentName: "小翠",
        startTime: "09:12",
        duration: "4 min",
        msgCount: 6,
        rating: "—",
        endReason: "timeout",
    },
];

// Mock: 统计数据
const mockStats: CustomerStats = {
    currentSessions: 3,
    maxSessions: 5,
    queueCount: 2,
    todayServed: 28,
    todayMessages: 412,
    avgFirstResponse: 38,
};

// Mock: 客服同事
const mockColleagues: AgentColleague[] = [
    {
        name: "小翠（我）",
        role: "presale",
        status: "online",
        currentLoad: 3,
        maxLoad: 5,
        todayServed: 28,
    },
    {
        name: "阿岚",
        role: "aftersale",
        status: "online",
        currentLoad: 2,
        maxLoad: 5,
        todayServed: 19,
    },
    {
        name: "暮雨",
        role: "presale",
        status: "break",
        currentLoad: 0,
        maxLoad: 5,
        todayServed: 15,
    },
];

// Mock: 商品列表
const mockProducts = [
    {
        name: "枸杞红枣茶",
        icon: "🍵",
        desc: "滋阴补血 · 适合气血不足",
        price: 38,
    },
    {
        name: "四物汤药膳包",
        icon: "🌿",
        desc: "补血调经 · 经期前后",
        price: 48,
    },
    { name: "艾草足浴包", icon: "🧂", desc: "驱寒祛湿 · 睡前泡脚", price: 35 },
    {
        name: "当归生姜羊肉汤",
        icon: "🥣",
        desc: "温中补虚 · 适合冬季",
        price: 58,
    },
    { name: "玫瑰花茶", icon: "🌹", desc: "疏肝理气 · 调节情绪", price: 42 },
];

// Mock: 订单列表
const mockOrders = [
    {
        no: "YYG20260525008",
        custName: "云栖之客",
        status: "已发货",
        logistics: "顺丰",
        amount: 128,
    },
    {
        no: "YYG20260520003",
        custName: "清风明月",
        status: "已完成",
        amount: 86,
    },
    { no: "YYG20260518005", custName: "江南雪", status: "已完成", amount: 156 },
];

// 延迟函数模拟网络请求
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
    // 获取会话列表
    async getSessions() {
        await delay(300);
        return mockSessions;
    },

    // 获取会话详情
    async getSessionDetail(sessionId: string) {
        await delay(200);
        return mockSessions.find((s) => s.id === sessionId) || null;
    },

    // 发送消息
    async sendMessage(sessionId: string, message: string) {
        await delay(100);
        const session = mockSessions.find((s) => s.id === sessionId);
        if (session) {
            const now = new Date();
            const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
            session.messages.push({ from: "me", text: message, time });
            session.lastMsg = message;

            // 模拟客户回复
            setTimeout(() => {
                const replies = [
                    "好的，明白了，谢谢～",
                    "嗯嗯，我看一下",
                    "请问还有别的吗",
                    "👍",
                ];
                const reply =
                    replies[Math.floor(Math.random() * replies.length)] ||
                    "好的";
                const now = new Date();
                const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
                session.messages.push({ from: "customer", text: reply, time });
                session.lastMsg = reply;
            }, 1500);
        }
        return true;
    },

    // 结束会话
    async endSession(sessionId: string) {
        await delay(300);
        const idx = mockSessions.findIndex((s) => s.id === sessionId);
        if (idx > -1) {
            mockSessions.splice(idx, 1);
        }
        return true;
    },

    // 转接会话
    async transferSession(
        sessionId: string,
        _targetAgentId: string,
        _note: string,
    ) {
        await delay(500);
        const idx = mockSessions.findIndex((s) => s.id === sessionId);
        if (idx > -1) {
            mockSessions.splice(idx, 1);
        }
        return true;
    },

    // 获取排队队列
    async getQueueList() {
        await delay(300);
        return mockQueue;
    },

    // 从队列接入
    async acceptFromQueue(queueNum: number) {
        await delay(500);
        const customer = mockQueue.find((q) => q.queueNum === queueNum);
        if (customer) {
            const idx = mockQueue.findIndex((q) => q.queueNum === queueNum);
            mockQueue.splice(idx, 1);

            // 创建新会话
            const newSession: CustomerSession = {
                id: `s${Date.now()}`,
                custId: `q${queueNum}`,
                custName: customer.custName,
                avatar: customer.custName[0] || "客",
                source: "排队接入",
                sourceTag: customer.sourceTag,
                startedAt: new Date().toISOString(),
                unread: 1,
                lastMsg: customer.firstMsg,
                custTags: ["新客户"],
                custCity: "未知",
                custReg:
                    new Date().toISOString().split("T")[0] ||
                    new Date().toLocaleDateString(),
                custSpent: "¥ 0",
                custOrderCount: 0,
                custCart: [],
                cartTotal: 0,
                messages: [
                    {
                        from: "sys",
                        text: `会话开始 · ${new Date().toLocaleTimeString()} · 您从排队队列主动接入`,
                        time: "",
                    },
                    {
                        from: "customer",
                        text: customer.firstMsg,
                        time: new Date().toLocaleTimeString(),
                    },
                ],
            };
            mockSessions.push(newSession);
        }
        return true;
    },

    // 获取历史会话
    async getHistorySessions(page: number, pageSize: number) {
        await delay(300);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
            records: mockHistory.slice(start, end),
            total: mockHistory.length,
        };
    },

    // 获取统计数据
    async getStats() {
        await delay(200);
        return mockStats;
    },

    // 获取客服同事
    async getColleagues() {
        await delay(200);
        return mockColleagues;
    },

    // 更新状态
    async updateStatus(status: "online" | "break" | "off") {
        await delay(200);
        const me = mockColleagues.find((c) => c.name.includes("我"));
        if (me) {
            me.status = status;
            if (status === "break" || status === "off") {
                me.currentLoad = 0;
            }
        }
        return true;
    },

    // 搜索商品
    async searchProducts(keyword: string) {
        await delay(200);
        if (!keyword) return mockProducts;
        return mockProducts.filter(
            (p) => p.name.includes(keyword) || p.desc.includes(keyword),
        );
    },

    // 搜索订单
    async searchOrders(keyword: string) {
        await delay(200);
        if (!keyword) return mockOrders;
        return mockOrders.filter(
            (o) => o.no.includes(keyword) || o.custName.includes(keyword),
        );
    },
};
