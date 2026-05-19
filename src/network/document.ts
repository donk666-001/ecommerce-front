import { GAxios } from "@/plugins";
import type {
    IAddDocumentInfo,
    IReqDocumentInfoSimplify,
    IViewDocumentInfo,
} from "@/types/view/document.ts"; // 获取文档系列的文档信息

// 获取文档系列的文档信息
async function ApiSeriesDocumentInfos(id: number) {
    try {
        const response = await GAxios.get(`/document/infos/${id}`);
        const res = response.data;
        // console.log(`响应res:${JSON.stringify(res)}`);
        if (res.code === 200) {
            return res.data as IViewDocumentInfo[];
        } else {
            console.log(res.message);
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

// 获取文档信息
async function ApiSeriesDocumentInfo(id: number) {
    try {
        const response = await GAxios.get(`/document/info/${id}`);
        const res = response.data;
        // console.log(`响应res:${JSON.stringify(res)}`);
        if (res.code === 200) {
            return res.data as IViewDocumentInfo;
        } else {
            console.log(res.message);
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

// 保存文档信息
async function ApiSaveDocumentInfo(
    documentInfo: IViewDocumentInfo | IAddDocumentInfo,
) {
    try {
        console.log(`发送的信息:`, documentInfo);
        const response = await GAxios.put("/document/info", documentInfo);
        const res = response.data;
        // console.log(`响应res:${JSON.stringify(res)}`);
        if (res.code === 200) {
            return true;
        } else {
            console.log(res.message);
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

// 保存文章系列信息的更改
async function ApiSaveDocumentSeriesInfos(
    documentInfos: IReqDocumentInfoSimplify[],
) {
    try {
        const response = await GAxios.put("/document/infos", documentInfos);
        const res = response.data;
        // console.log(`响应res:${JSON.stringify(res)}`);
        if (res.code === 200) {
            return true;
        } else {
            console.log(res.message);
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

// 新增文档信息
async function ApiAddDocumentInfo(documentInfo: IAddDocumentInfo) {
    try {
        const response = await GAxios.put("/document/info", documentInfo);
        const res = response.data;
        // console.log(`响应res:${JSON.stringify(res)}`);
        if (res.code === 200) {
            return true;
        } else {
            console.log(res.message);
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

export {
    ApiSeriesDocumentInfos,
    ApiSeriesDocumentInfo,
    ApiSaveDocumentInfo,
    ApiSaveDocumentSeriesInfos,
    ApiAddDocumentInfo,
};
