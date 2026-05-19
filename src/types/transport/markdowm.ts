//  markdown 对象
export interface markdown {
    meta: markdownMeta; // 元数据
    content: markdownTree[]; //  内容
}

// markdown 元数据
export interface markdownMeta {
    title: string; // 标题
    author: string; // 作者
    releaseDate: string; // 发布时间
    updateDate: string; // 最后更新时间
    category: string; // 所属分类
    summary?: string; // 简介
    description?: string; // 描述
    keywords?: string[]; // 关键字
    tags?: string[]; // 标签
}

// 元数据索引
export interface metaSignIndex {
    start: number; // 开始索引
    end: number; // 结束索引
}

// markdown 内容树
export interface markdownTree {
    type: markdownGrammarType; // 类型
    isRichText: boolean; // 是否富文本
    text: string; // 内容
    listIndentationLevel?: number; // 列表缩进级别
    index?: number; // 索引(主要给富文本使用)
    href?: string; // 链接(给超链接用的)
    style?: string; // 样式
    children?: markdownTree[]; // 子树
}

// 构建 节点树 时使用：标记数组
export interface markdownTreeTag {
    text: string; // 原内容
    type: "unknown" | "title" | "list" | "text" | "p"; //  解析时类型，用于辅助解析
    content?: markdownTree; // 解析后的内容
}

// 富文本位置检测
export interface richTextPosition {
    text: string; // 原内容
    index: number; // 开始索引
}

// 元数据枚举
export enum metaCode {
    TITLE = "title",
    AUTHOR = "author",
    RELEASE_DATE = "releaseDate",
    UPDATE_DATE = "updateDate",
    CATEGORY = "category",
    SUMMARY = "summary",
    DESCRIPTION = "description",
    KEYWORDS = "keywords",
    TAGS = "tags",
}

// markdown 类型枚举
export enum markdownGrammarType {
    // 文本类型
    PARAGRAPH = "p", // 段落
    TEXT = "text", // 文本
    H1 = "h1", // 标题
    H2 = "h2",
    H3 = "h3",
    H4 = "h4",
    H5 = "h5",
    H6 = "h6",
    HR = "hr", // 分割线
    STRONG = "strong", // 强调
    INCLINE = "i", // 斜体
    UNDERLINE = "underline", // 下划线
    STRIKETHROUGH = "strikethrough", // 删除线
    COMMENT = "comment", // 注释

    // 换行类型和特殊解析类型
    LINEBREAK = "linebreak", // 换行
    SOFTBREAK = "softbreak", // 软换行
    ESCAPE = "escape", // 转义字符

    // 链接和引用
    QUOTE = "quote", // 引用
    LINK = "a", // 链接
    IMAGE = "image", //  图片

    // 代码类型
    CODE = "code",
    INLINE_CODE = "inlineCode", // 行内代码
    FENCED_CODE = "fencedCode", // 围栏代码块

    // 列表类型
    LIST = "list", // 列表
    LIST_ITEM = "listItem", // 列表项
    ORDERED_LIST = "orderedList", // 有序列表
    UNORDERED_LIST = "unorderedList", // 无序列表

    // 表格类型
    TABLE = "table", // 表格
    TABLE_HEADER = "tableHeader", // 表格头部
    TABLE_ROW = "tableRow", // 表格行
    TABLE_CELL = "tableCell", // 表格单元格

    // 其他
    HTML = "html",
}
