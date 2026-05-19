import type { ICategoryKey } from "@/types/response/system.ts";
import {
    type deviceSize,
    type pageSize,
    sizeCode,
} from "@/types/transport/system.ts";
import { TabController } from "@/types/view/ui.ts";
import { defineStore } from "pinia";

export const useSystemStore = defineStore("system", {
    state: () => ({
        pageWidthCode: sizeCode.md as sizeCode,
        pageSize: {
            pageWidth: 0,
            pageHeight: 0,
        } as pageSize,
        deviceSize: {
            deviceWidth: 0,
            deviceHeight: 0,
        } as deviceSize,
        // 弹窗层显示状态
        showPopupLayer: false,
        // 当前所属功能区
        currentServiceArea: "home" as string,
        // 标签页变化
        // 管理员菜单:分类标签页控制器
        adminMenuCategoryTabController: new TabController() as TabController,
        // 管理员菜单:分类标签页
        adminMenuCategoryCurrentTabs: 1 as number,
        // 分类键列表
        adminMenuCategoryKeyList: [] as ICategoryKey[],
    }),
    getters: {},
    actions: {
        setPageWidthCode(pageWidthCode: sizeCode) {
            this.pageWidthCode = pageWidthCode;
        },
        setPageSize(pageSize: pageSize) {
            this.pageSize = pageSize;
        },
        setDeviceSize(deviceSize: deviceSize) {
            this.deviceSize = deviceSize;
        },
        // 显示弹窗层
        openPopupLayer() {
            this.showPopupLayer = true;
        },
        // 隐藏弹窗层
        closePopupLayer() {
            this.showPopupLayer = false;
        },
        setCurrentServiceArea(currentServiceArea: string) {
            this.currentServiceArea = currentServiceArea;
        },
    },
});
