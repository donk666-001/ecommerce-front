// 客服会话类型
export interface CustomerSession {
    id: string;
    custId: string;
    custName: string;
    avatar: string;
    source: string;
    sourceTag: "product" | "order" | "general";
    startedAt: string;
    unread: number;
    lastMsg: string;
    custTags: string[];
    custCity: string;
    custReg: string;
    custSpent: string;
    custOrderCount: number;
    custCart: Array<{ name: string; icon: string; qty: number; price: number }>;
    cartTotal: number;
    messages: CustomerMessage[];
}

// 客服消息类型
export interface CustomerMessage {
    from: "sys" | "customer" | "me";
    text: string;
    time: string;
    type?: "product" | "order";
    meta?: {
        icon?: string;
        desc?: string;
        price?: number;
        status?: string;
        amount?: number;
    };
}

// 排队客户类型
export interface QueuedCustomer {
    queueNum: number;
    custName: string;
    source: string;
    sourceTag: "product" | "order";
    firstMsg: string;
    waitTime: string;
    roleType: "presale" | "aftersale";
}

// 历史会话类型
export interface HistorySession {
    sessionId: string;
    custName: string;
    agentName: string;
    startTime: string;
    duration: string;
    msgCount: number;
    rating: string;
    endReason: "manual" | "transfer" | "timeout";
}

// 客服统计数据
export interface CustomerStats {
    currentSessions: number;
    maxSessions: number;
    queueCount: number;
    todayServed: number;
    todayMessages: number;
    avgFirstResponse: number;
}

// 客服同事信息
export interface AgentColleague {
    name: string;
    role: "presale" | "aftersale";
    status: "online" | "break" | "off";
    currentLoad: number;
    maxLoad: number;
    todayServed: number;
}

export class ApiCustomer {
    // 获取当前客服的会话列表
    static async getSessions() {
        // TODO: 替换为真实API调用
        // const response = await GAxios.get('/customer/sessions')
        // const res = response.data
        // if (res.code === 200) {
        //     return res.data as CustomerSession[]
        // } else {
        //     console.log(res.message)
        //     return []
        // }

        // 模拟数据
        return [
            {
                id: "s1",
                custId: "c1",
                custName: "清风明月",
                avatar: "风",
                source: "商品 · 枸杞红枣茶",
                sourceTag: "product" as const,
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
                    {
                        from: "customer",
                        text: "这个孕妇可以喝吗？",
                        time: "10:26",
                    },
                ],
            },
            {
                id: "s2",
                custId: "c2",
                custName: "云栖之客",
                avatar: "云",
                source: "订单 · YYG…008",
                sourceTag: "order" as const,
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
                    {
                        from: "me",
                        text: "稍等，我帮您查一下物流信息",
                        time: "10:18",
                    },
                    {
                        from: "customer",
                        text: "物流好像停了，能帮我查一下吗",
                        time: "10:29",
                    },
                ],
            },
        ] as CustomerSession[];
    }

    // 获取单个会话详情
    static async getSessionDetail(sessionId: string) {
        // TODO: 替换为真实API调用
        // const response = await GAxios.get(`/customer/sessions/${sessionId}`)
        // const res = response.data
        // if (res.code === 200) {
        //     return res.data as CustomerSession
        // } else {
        //     return null
        // }

        // 模拟数据
        const sessions = await this.getSessions();
        return sessions.find((s) => s.id === sessionId) || null;
    }

    // 发送消息
    static async sendMessage(sessionId: string, message: string) {
        // TODO: 替换为真实API调用
        // const response = await GAxios.post(`/customer/sessions/${sessionId}/messages`, {
        //     text: message,
        // })
        // const res = response.data
        // return res.code === 200

        // 模拟成功
        console.log(`发送消息到会话 ${sessionId}: ${message}`);
        return true;
    }

    // 结束会话
    static async endSession(sessionId: string) {
        // TODO: 替换为真实API调用
        // const response = await GAxios.post(`/customer/sessions/${sessionId}/end`)
        // const res = response.data
        // return res.code === 200

        // 模拟成功
        console.log(`结束会话 ${sessionId}`);
        return true;
    }

    // 转接会话
    static async transferSession(
        sessionId: string,
        targetAgentId: string,
        note: string,
    ) {
        // TODO: 替换为真实API调用
        // const response = await GAxios.post(`/customer/sessions/${sessionId}/transfer`, {
        //     targetAgentId,
        //     note,
        // })
        // const res = response.data
        // return res.code === 200

        // 模拟成功
        console.log(
            `转接会话 ${sessionId} 给客服 ${targetAgentId}, 备注: ${note}`,
        );
        return true;
    }

    // 获取排队队列
    static async getQueueList() {
        // TODO: 替换为真实API调用
        // const response = await GAxios.get('/customer/queue')
        // const res = response.data
        // if (res.code === 200) {
        //     return res.data as QueuedCustomer[]
        // } else {
        //     return []
        // }

        // 模拟数据
        return [
            {
                queueNum: 1,
                custName: "山水之间",
                source: "商品 · 当归生姜羊肉汤",
                sourceTag: "product" as const,
                firstMsg: "请问这个适合什么体质的人喝？",
                waitTime: "2:15",
                roleType: "presale" as const,
            },
            {
                queueNum: 2,
                custName: "月下独酌",
                source: "订单 · YYG…012",
                sourceTag: "order" as const,
                firstMsg: "我的订单什么时候能发货？",
                waitTime: "1:30",
                roleType: "aftersale" as const,
            },
        ] as QueuedCustomer[];
    }

    // 从队列接入客户
    static async acceptFromQueue(queueNum: number) {
        // TODO: 替换为真实API调用
        // const response = await GAxios.post('/customer/queue/accept', {
        //     queueNum,
        // })
        // const res = response.data
        // return res.code === 200

        // 模拟成功
        console.log(`从队列接入客户 #${queueNum}`);
        return true;
    }

    // 获取历史会话
    static async getHistorySessions(
        page: number,
        pageSize: number,
        _filters?: {
            custName?: string;
            startDate?: string;
            endDate?: string;
            agentId?: string;
        },
    ) {
        // TODO: 替换为真实API调用
        // const response = await GAxios.get('/customer/history', {
        //     params: {
        //         page,
        //         pageSize,
        //         ...filters,
        //     },
        // })
        // const res = response.data
        // if (res.code === 200) {
        //     return res.data
        // } else {
        //     return { records: [], total: 0 }
        // }

        // 模拟数据
        const mockData: HistorySession[] = [
            {
                sessionId: "h1",
                custName: "清风明月",
                agentName: "小翠",
                startTime: "2026-05-29 10:24",
                duration: "15:32",
                msgCount: 28,
                rating: "满意",
                endReason: "manual" as const,
            },
            {
                sessionId: "h2",
                custName: "云栖之客",
                agentName: "阿岚",
                startTime: "2026-05-29 14:15",
                duration: "8:45",
                msgCount: 12,
                rating: "满意",
                endReason: "manual" as const,
            },
            {
                sessionId: "h3",
                custName: "山水之间",
                agentName: "小翠",
                startTime: "2026-05-28 09:30",
                duration: "22:10",
                msgCount: 45,
                rating: "非常满意",
                endReason: "manual" as const,
            },
        ];

        return {
            records: mockData.slice((page - 1) * pageSize, page * pageSize),
            total: mockData.length,
        };
    }

    // 获取客服统计数据
    static async getStats() {
        // TODO: 替换为真实API调用
        // const response = await GAxios.get('/customer/stats')
        // const res = response.data
        // if (res.code === 200) {
        //     return res.data as CustomerStats
        // } else {
        //     return null
        // }

        // 模拟数据
        return {
            currentSessions: 3,
            maxSessions: 5,
            queueCount: 2,
            todayServed: 28,
            todayMessages: 412,
            avgFirstResponse: 38,
        } as CustomerStats;
    }

    // 获取客服同事列表
    static async getColleagues() {
        // TODO: 替换为真实API调用
        // const response = await GAxios.get('/customer/colleagues')
        // const res = response.data
        // if (res.code === 200) {
        //     return res.data as AgentColleague[]
        // } else {
        //     return []
        // }

        // 模拟数据
        return [
            {
                name: "小翠（我）",
                role: "presale" as const,
                status: "online" as const,
                currentLoad: 3,
                maxLoad: 5,
                todayServed: 28,
            },
            {
                name: "阿岚",
                role: "aftersale" as const,
                status: "online" as const,
                currentLoad: 2,
                maxLoad: 5,
                todayServed: 19,
            },
            {
                name: "暮雨",
                role: "presale" as const,
                status: "break" as const,
                currentLoad: 0,
                maxLoad: 5,
                todayServed: 15,
            },
        ] as AgentColleague[];
    }

    // 更新客服状态
    static async updateStatus(status: "online" | "break" | "off") {
        // TODO: 替换为真实API调用
        // const response = await GAxios.post('/customer/status', {
        //     status,
        // })
        // const res = response.data
        // return res.code === 200

        // 模拟成功
        console.log(`更新客服状态为: ${status}`);
        return true;
    }

    // 搜索商品
    static async searchProducts(keyword: string) {
        // TODO: 替换为真实API调用
        // const response = await GAxios.get('/customer/products/search', {
        //     params: { keyword },
        // })
        // const res = response.data
        // if (res.code === 200) {
        //     return res.data
        // } else {
        //     return []
        // }

        // 模拟数据
        const allProducts = [
            {
                id: "p1",
                name: "枸杞红枣茶",
                icon: "🍵",
                price: 38,
                desc: "滋阴补血",
            },
            {
                id: "p2",
                name: "四物汤药膳包",
                icon: "🌿",
                price: 48,
                desc: "调理气血",
            },
            {
                id: "p3",
                name: "当归生姜羊肉汤",
                icon: "🥘",
                price: 68,
                desc: "温补阳气",
            },
            {
                id: "p4",
                name: "酸枣仁百合茶",
                icon: "🍵",
                price: 42,
                desc: "安神助眠",
            },
        ];

        if (!keyword) return allProducts;
        return allProducts.filter((p) => p.name.includes(keyword));
    }

    // 查询订单
    static async searchOrders(keyword: string) {
        // TODO: 替换为真实API调用
        // const response = await GAxios.get('/customer/orders/search', {
        //     params: { keyword },
        // })
        // const res = response.data
        // if (res.code === 200) {
        //     return res.data
        // } else {
        //     return []
        // }

        // 模拟数据
        const allOrders = [
            {
                id: "YYG20260525008",
                custName: "云栖之客",
                amount: 128,
                status: "运输中",
                date: "2026-05-25",
            },
            {
                id: "YYG20260524012",
                custName: "清风明月",
                amount: 86,
                status: "已签收",
                date: "2026-05-24",
            },
            {
                id: "YYG20260523005",
                custName: "山水之间",
                amount: 256,
                status: "已发货",
                date: "2026-05-23",
            },
        ];

        if (!keyword) return allOrders;
        return allOrders.filter(
            (o) => o.id.includes(keyword) || o.custName.includes(keyword),
        );
    }
}
