import { GAxios } from "@/plugins";

export type SeasonalRecipeDTO = {
    effectText: string;
    foodName: string;
    id: number;
    propertyLevel: number;
    usageNote: string;
};

export type SeasonalHealthContentDTO = {
    contentIcon: string;
    contentText: string;
    contentTitle: string;
    contentType: number;
    id: number;
    sortOrder: number;
};

export type SolarTermDTO = {
    endTime: string;
    id: number;
    longDesc: string;
    shortDesc: string;
    startTime: string;
    termName: string;
    termNo: number;
};

export type SeasonalHealthDTO = {
    dietTherapyRecipes: SeasonalRecipeDTO[];
    healthContents: SeasonalHealthContentDTO[];
    queryTime: string;
    solarTerm: SolarTermDTO;
};

type ApiEnvelope<T> = {
    code?: number;
    data?: T;
    message?: string;
};

function unwrapSeasonalHealth(
    data: SeasonalHealthDTO | ApiEnvelope<SeasonalHealthDTO>,
) {
    if ("solarTerm" in data) return data;
    if (data.code === 200 && data.data) return data.data;
    throw new Error(data.message || "节气养生接口返回异常");
}

class ApiSeasonalHealth {
    static async getCurrent() {
        const response = await GAxios.get<
            SeasonalHealthDTO | ApiEnvelope<SeasonalHealthDTO>
        >("/seasonal-health/current");
        return unwrapSeasonalHealth(response.data);
    }

    static async getByName(termName: string) {
        const response = await GAxios.get<
            SeasonalHealthDTO | ApiEnvelope<SeasonalHealthDTO>
        >("/seasonal-health/by-name", {
            params: { termName },
        });
        return unwrapSeasonalHealth(response.data);
    }
}

export { ApiSeasonalHealth };
