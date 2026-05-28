import { GAxiosWithCredentials } from "@/plugins";

export interface NotificationVO {
    id: number;
    type: string;
    title: string;
    body: string | null;
    payload: Record<string, unknown> | null;
    isRead: boolean;
    createdAt: string;
}

export interface PageVO<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

export const ApiNotification = {
    listMyNotifications: (page = 1, size = 10, unreadOnly = false) =>
        GAxiosWithCredentials.get<PageVO<NotificationVO>>('/notifications/my', {
            params: { page, size, unreadOnly },
        }),

    markRead: (notificationId: number) =>
        GAxiosWithCredentials.put<void>(`/notifications/${notificationId}/read`),

    markAllRead: () =>
        GAxiosWithCredentials.put<void>('/notifications/read-all'),
};
