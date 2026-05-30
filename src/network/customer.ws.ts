/**
 * 客服WebSocket模拟工具
 * 用于模拟实时消息推送、状态更新等功能
 */

type MessageHandler = (data: any) => void;
type ConnectionHandler = () => void;

export class CustomerWebSocket {
    private connected = false;
    private messageHandlers: MessageHandler[] = [];
    private connectHandlers: ConnectionHandler[] = [];
    private disconnectHandlers: ConnectionHandler[] = [];
    private reconnectTimer: number | null = null;
    private heartbeatTimer: number | null = null;

    /**
     * 连接WebSocket
     */
    connect(): Promise<void> {
        return new Promise((resolve) => {
            console.log("[CustomerWS] 模拟连接...");

            // 模拟连接延迟
            setTimeout(() => {
                this.connected = true;
                console.log("[CustomerWS] 已连接");

                // 触发连接回调
                this.connectHandlers.forEach((handler) => handler());

                // 开始心跳
                this.startHeartbeat();

                resolve();
            }, 500);
        });
    }

    /**
     * 断开连接
     */
    disconnect(): void {
        console.log("[CustomerWS] 断开连接");
        this.connected = false;

        // 清除定时器
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // 触发断开回调
        this.disconnectHandlers.forEach((handler) => handler());
    }

    /**
     * 发送消息
     */
    send(data: any): void {
        if (!this.connected) {
            console.warn("[CustomerWS] 未连接，无法发送消息");
            return;
        }

        console.log("[CustomerWS] 发送消息:", data);

        // 模拟服务器响应
        setTimeout(() => {
            this.simulateServerResponse(data);
        }, 100);
    }

    /**
     * 注册消息处理器
     */
    onMessage(handler: MessageHandler): () => void {
        this.messageHandlers.push(handler);

        // 返回取消订阅函数
        return () => {
            const index = this.messageHandlers.indexOf(handler);
            if (index > -1) {
                this.messageHandlers.splice(index, 1);
            }
        };
    }

    /**
     * 注册连接回调
     */
    onConnect(handler: ConnectionHandler): void {
        this.connectHandlers.push(handler);
    }

    /**
     * 注册断开回调
     */
    onDisconnect(handler: ConnectionHandler): void {
        this.disconnectHandlers.push(handler);
    }

    /**
     * 模拟接收新消息
     */
    simulateIncomingMessage(data: any): void {
        console.log("[CustomerWS] 收到消息:", data);
        this.messageHandlers.forEach((handler) => handler(data));
    }

    /**
     * 模拟服务器响应
     */
    private simulateServerResponse(requestData: any): void {
        // 根据不同的请求类型模拟响应
        switch (requestData.type) {
            case "send_message":
                // 模拟客户回复
                setTimeout(() => {
                    this.simulateIncomingMessage({
                        type: "new_message",
                        sessionId: requestData.sessionId,
                        message: {
                            from: "customer",
                            text: "好的，谢谢～",
                            time: this.getCurrentTime(),
                        },
                    });
                }, 2000);
                break;

            case "accept_queue":
                this.simulateIncomingMessage({
                    type: "session_assigned",
                    session: {
                        id: `s${Date.now()}`,
                        custName: "新客户",
                        avatar: "新",
                    },
                });
                break;
        }
    }

    /**
     * 开始心跳
     */
    private startHeartbeat(): void {
        this.heartbeatTimer = window.setInterval(() => {
            if (this.connected) {
                this.send({ type: "heartbeat", timestamp: Date.now() });
            }
        }, 30000); // 每30秒心跳一次
    }

    /**
     * 获取当前时间字符串
     */
    private getCurrentTime(): string {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }

    /**
     * 获取连接状态
     */
    isConnected(): boolean {
        return this.connected;
    }
}

// 导出单例
export const customerWS = new CustomerWebSocket();
