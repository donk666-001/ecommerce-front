// 表格列定义
export interface ITableColumn {
    key: string;
    title?: string;
    dataIndex?: string;
    render?: (text: any, record: any, index: number) => string;
}

// 标签页对象
export interface ITab {
    id: number; // 标签页ID
    title: string; // 标签页标题
    open: boolean; // 标签页是否打开
    closeable: boolean; // 标签页是否可关闭
}

// 标签页类
export class TabController {
    tabs: ITab[];

    constructor() {
        this.tabs = [];
    }

    // 添加标签页
    addTab(title: string, closeable: boolean = true) {
        // 检查ID是否已存在，如果存在则使用下一个可用ID
        const lastTab = this.tabs[this.tabs.length - 1]?.id as number;

        if (lastTab) {
            this.tabs.push({
                id: lastTab + 1,
                title,
                open: true,
                closeable,
            });
            return lastTab + 1;
        } else {
            this.tabs.push({
                id: 1,
                title,
                open: true,
                closeable,
            });
            return 1;
        }
    }

    // 修改标签页
    updateTab(id: number, title: string) {
        this.tabs = this.tabs.map((tab) => {
            if (tab.id === id) {
                tab.title = title;
            }
            return tab;
        });
    }

    // 删除标签页
    removeTab(id: number, currentId: number): number {
        console.log(`要删除的页面id:${id},当前激活页面的id:${currentId}`);
        if (currentId !== id) {
            const tab = this.tabs.find((tab) => tab.id === id) as ITab;

            // 直接删除
            this.tabs = this.tabs.filter((tab) => tab.id !== id);
            // 重新排序id
            this.tabs.forEach((tab, index) => {
                tab.id = index + 1;
            });
            // 返回重排后的id
            return this.tabs.find((item) => item.id === tab.id)?.id as number;
        } else {
            const tab = this.tabs.find((tab) => tab.id === id);
            // 该tab所在的索引
            let nextIndex: number = 0;
            if (tab) {
                const index = this.tabs.indexOf(tab);
                console.log(`当前索引:${index}`);
                if (index - 1 > 0) {
                    nextIndex = index - 1;
                    console.log(`非首索引:${nextIndex}`);
                } else {
                    console.log(`保持0索引:${nextIndex}`);
                }
            }
            this.tabs = this.tabs.filter((tab) => tab.id !== id);
            console.log(`下一条索引:${nextIndex}`);

            return nextIndex + 1;
        }
    }
}
