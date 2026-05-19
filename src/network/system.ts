import { GAxios } from "@/plugins";
import type {
    ICategoryKey,
    ICategoryKeyValue,
} from "@/types/response/system.ts";
import type { IFormAddKey } from "@/types/transport/form.ts";

// 获取所有分类键
async function ApiCategoryKeys() {
    try {
        const response = await GAxios.get("/sys/categoryKey");
        const res = response.data;
        if (res.code === 200) {
            return res.data as ICategoryKey[];
        } else {
            console.log(res.message);
            return null;
        }
    } catch (error) {
        console.log(`Api接口捕获的错误:`, error);
        return null;
    }
}

// 获取键信息
async function ApiCategoryKey(id: number) {
    try {
        const response = await GAxios.get(`/sys/categoryKey/${id}`);
        const res = response.data;
        if (res.code === 200) {
            return res.data as ICategoryKey;
        } else {
            console.log(res.message);
            return null;
        }
    } catch (error) {
        console.log(`Api接口捕获的错误:`, error);
        return null;
    }
}

// 搜索分类键
async function ApiSearchCategoryKey(keyword: string) {
    try {
        const response = await GAxios.get(`/sys/categoryKey/search/${keyword}`);
        const res = response.data;
        if (res.code === 200) {
            return res.data as ICategoryKey[];
        } else {
            console.log(res.message);
            return null;
        }
    } catch (error) {
        console.log(`Api接口捕获的错误:`, error);
        return null;
    }
}

// 新增分类键
async function ApiAddCategoryKey(data: IFormAddKey) {
    try {
        const response = await GAxios.put("/sys/categoryKey", data);
        const res = response.data;
        if (res.code === 200) {
            return true;
        } else {
            console.log(res.message);
            return false;
        }
    } catch (error) {
        console.log(`Api接口捕获的错误:`, error);
        return false;
    }
}

// 更新分类键
async function ApiUpdateCategoryKey(
    id: number,
    data: {
        belong_id?: number;
        type?: number;
        value?: string;
        description?: string;
    },
) {
    try {
        console.log(`更新分类键:`, data);
        const response = await GAxios.put(`/sys/categoryKey`, {
            id: id,
            ...data,
        });
        const res = response.data;
        if (res.code === 200) {
            return true;
        } else {
            console.log(res.message);
            return false;
        }
    } catch (error) {
        console.log(`Api接口捕获的错误:`, error);
        return false;
    }
}

// 获取分类键的值列表
async function ApiCategoryKeyValues(categoryKeyId: number) {
    try {
        const response = await GAxios.get(
            `/sys/categoryKey/values/${categoryKeyId}`,
        );
        const res = response.data;
        if (res.code === 200) {
            return res.data as ICategoryKeyValue[];
        } else {
            console.log(res.message);
            return null;
        }
    } catch (error) {
        console.log(`Api接口捕获的错误:`, error);
        return null;
    }
}

// 获取分类键值信息
async function ApiCategoryKeyValue(id: number) {
    try {
        const response = await GAxios.get(`/sys/categoryKey/value/${id}`);
        const res = response.data;
        if (res.code === 200) {
            return res.data as ICategoryKeyValue;
        } else {
            console.log(res.message);
            return null;
        }
    } catch (error) {
        console.log(`Api接口捕获的错误:`, error);
        return null;
    }
}

// 添加分类值
async function ApiAddCategoryValue(data: {
    category_id: number;
    value: string;
    sort_id?: number;
    description?: string;
    category_self_id?: number | null;
}) {
    try {
        const response = await GAxios.put("/sys/categoryValue", data);
        const res = response.data;
        if (res.code === 200) {
            return res.data;
        } else {
            console.log(res.message);
            return null;
        }
    } catch (error) {
        console.log(`Api接口捕获的错误:`, error);
        return null;
    }
}

// 更新分类值
async function ApiUpdateCategoryValue(
    id: number,
    data: {
        category_id?: number;
        value?: string;
        sort_id?: number;
        description?: string;
        category_self_id?: number | null;
    },
) {
    try {
        const response = await GAxios.put(`/sys/categoryValue`, {
            id: id,
            ...data,
        });
        const res = response.data;
        if (res.code === 200) {
            return true;
        } else {
            console.log(res.message);
            return false;
        }
    } catch (error) {
        console.log(`Api接口捕获的错误:`, error);
        return false;
    }
}

// 删除分类值
async function ApiDeleteCategoryValue(id: string) {
    try {
        const response = await GAxios.delete(`/sys/categoryValue/${id}`);
        const res = response.data;
        if (res.code === 200) {
            return res.data;
        } else {
            console.log(res.message);
            return null;
        }
    } catch (error) {
        console.log(`Api接口捕获的错误:`, error);
        return null;
    }
}

export {
    ApiCategoryKeys,
    ApiSearchCategoryKey,
    ApiCategoryKey,
    ApiAddCategoryKey,
    ApiUpdateCategoryKey,
    ApiCategoryKeyValues,
    ApiCategoryKeyValue,
    ApiAddCategoryValue,
    ApiUpdateCategoryValue,
    ApiDeleteCategoryValue,
};
