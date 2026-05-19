// 元素的边界
export interface bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

// 浏览器页面尺寸
export interface pageSize {
    pageWidth: number;
    pageHeight: number;
}

// 浏览器页面最大尺寸
export interface deviceSize {
    deviceWidth: number;
    deviceHeight: number;
}

// 枚举：窗口尺寸
export enum sizeCode {
    xs = "xs",
    sm = "sm",
    md = "md",
    lg = "lg",
    xl = "xl",
    xxl = "xxl",
}
