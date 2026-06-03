import { GAxios } from "@/plugins";

export interface ApiResult<T> {
    code?: number;
    message?: string;
    data?: T;
}

export interface PageResult<T> {
    page?: number;
    size?: number;
    total?: number;
    pages?: number;
    records?: T[];
}

export interface WellnessResourceDTO {
    id?: number;
    resourceType?: number;
    resourceTypeText?: string;
    url: string;
}

export interface WellnessDynamicPublishDTO {
    userId: number;
    content: string;
    coverUrl?: string;
    dynamicType: number;
    resources?: WellnessResourceDTO[];
}

export interface WellnessDynamicVO {
    id: number;
    userId: number;
    content: string;
    coverUrl?: string;
    dynamicType: number;
    dynamicTypeText?: string;
    resources?: WellnessResourceDTO[];
    resourceCount?: number;
    firstResourceUrl?: string;
    createdAt?: string;
}

export interface WellnessDynamicCommentSaveDTO {
    dynamicId: number;
    userId: number;
    parentId?: number;
    content: string;
}

export interface WellnessDynamicCommentVO {
    id: number;
    dynamicId: number;
    userId: number;
    parentId?: number;
    content: string;
    status?: number;
    createdAt?: string;
}

export interface DietRecordSaveDTO {
    userId: number;
    recordDate?: string;
    mealType: number;
    content: string;
    dietType?: number;
    calories: number;
}

export interface DietRecordVO {
    id?: number;
    userId: number;
    recordDate?: string;
    mealType: number;
    mealTypeText?: string;
    content: string;
    dietType?: number;
    dietTypeText?: string;
    calories: number;
}

export interface DietDailyCalorieSummaryVO {
    userId: number;
    date?: string;
    totalCalories: number;
    calorieLimit: number;
    remainingCalories?: number;
    overLimit?: boolean;
    tipText?: string;
}

export interface DietDailyCalorieLimitSaveDTO {
    userId: number;
    limitDate?: string;
    calorieLimit: number;
}

export interface DietSleepTrendVO {
    userId?: number;
    startDate?: string;
    endDate?: string;
    queryDate?: string;
    lastNightSleep?: unknown;
    weeklySleepTrend?: unknown;
    days?: unknown;
    dietAdvice?: string;
    routineAdvice?: string;
    todayDietCardText?: string;
    dietRecords?: DietRecordVO[];
    avgMinutes?: number;
    adviceTitle?: string;
    adviceDesc?: string;
}

export interface LastNightSleepVO {
    sleepDate?: string;
    totalSleepMinutes?: number;
    avgSleepMinutes?: number;
    sleepQuality?: number;
    sleepQualityText?: string;
    sleepStageText?: string;
    sleepSummary?: string;
}

export interface WeeklySleepTrendVO {
    weekStart?: string;
    weekEnd?: string;
    currentWeekRecords?: unknown;
    lastWeekRecords?: unknown;
    currentWeekAverageSleepMinutes?: number;
    lastWeekAverageSleepMinutes?: number;
    avgDiffFromLastWeek?: number;
    currentWeekTotalSleepMinutes?: number;
    lastWeekTotalSleepMinutes?: number;
}

export interface WellnessNotePublishDTO {
    userId: number;
    title: string;
    content: string;
    coverUrl?: string;
    noteType: number;
    resources?: WellnessResourceDTO[];
}

export interface WellnessNoteVO {
    id: number;
    userId: number;
    title?: string;
    content: string;
    coverUrl?: string;
    noteType: number;
    noteTypeText?: string;
    resources?: WellnessResourceDTO[];
    createdAt?: string;
}

export interface WellnessNoteCommentSaveDTO {
    noteId: number;
    userId: number;
    parentId?: number;
    content: string;
}

export interface WellnessNoteCommentVO {
    id: number;
    noteId: number;
    userId: number;
    parentId?: number;
    content: string;
    status?: number;
    createdAt?: string;
}

export interface DailyContentVO {
    targetTitle?: string;
    content?: string;
    status?: number;
}

export interface SolarTermVO {
    id?: number;
    termNo?: number;
    termName?: string;
    startTime?: string;
    endTime?: string;
    shortDesc?: string;
    longDesc?: string;
}

export interface CheckInTodayOverviewVO {
    userId?: number;
    date?: string;
    solarTerm?: SolarTermVO;
    completed?: boolean;
    mood?: number;
    moodText?: string;
    streakDays?: number;
    totalScore?: number;
    completedCount?: number;
    totalCount?: number;
    dailyContents?: DailyContentVO[];
}

export interface CheckInMoodSaveDTO {
    userId: number;
    checkinDate?: string;
    mood: number;
}

export interface CheckInMoodVO {
    userId?: number;
    checkinDate?: string;
    mood?: number;
    moodText?: string;
}

export interface CheckInDayVO {
    date?: string;
    hasRecord?: boolean;
    completed?: boolean;
    completedText?: string;
    totalScore?: number;
    mood?: number;
    moodText?: string;
}

export interface CheckInWeekVO {
    userId?: number;
    weekStart?: string;
    weekEnd?: string;
    completedDays?: number;
    totalScore?: number;
    days?: CheckInDayVO[];
}

export interface CheckInMonthVO {
    userId?: number;
    month?: string;
    completedDays?: number;
    totalScore?: number;
    days?: CheckInDayVO[];
}

export interface MilestoneVO {
    milestoneDays?: number;
    milestoneName?: string;
    rewardType?: string;
    rewardContent?: string;
    unlocked?: boolean;
    unlockedDate?: string;
    remainingDays?: number;
    progressPercent?: number;
}

export interface CheckInMilestoneVO {
    userId?: number;
    streakDays?: number;
    unlockedCount?: number;
    totalCount?: number;
    milestones?: MilestoneVO[];
}

export interface WaterTodayOverviewVO {
    userId?: number;
    statDate?: string;
    targetMl?: number;
    cupMl?: number;
    currentMl?: number;
    targetCups?: number;
    currentCups?: number;
    remainingMl?: number;
    progressPercent?: number;
    tipText?: string;
}

export interface WaterTodayTargetUpdateDTO {
    userId: number;
    statDate?: string;
    targetMl: number;
    cupMl: number;
}

export interface WaterTodayCupsUpdateDTO {
    userId: number;
    statDate?: string;
    currentCups: number;
}

/** 元气社区相关接口 */
export class ApiCircle {
    /** 获取当前节气信息（根据服务器日期自动计算） */
    static async getSolarTerm() {
        return GAxios.get("/circle/solar-term/current");
    }

    static publishDynamic(data: WellnessDynamicPublishDTO) {
        return GAxios.post<ApiResult<WellnessDynamicVO>>(
            "/wellness-dynamics",
            data,
        );
    }

    static getDynamicPage(params?: {
        page?: number;
        size?: number;
        dynamicType?: number;
    }) {
        return GAxios.get<ApiResult<PageResult<WellnessDynamicVO>>>(
            "/wellness-dynamics/page",
            { params },
        );
    }

    static getDynamicDetail(id: number) {
        return GAxios.get<ApiResult<WellnessDynamicVO>>(
            `/wellness-dynamics/${id}`,
        );
    }

    static deleteDynamic(id: number, userId: number) {
        return GAxios.delete<ApiResult<WellnessDynamicVO>>(
            `/wellness-dynamics/${id}`,
            { params: { userId } },
        );
    }

    static publishDynamicComment(data: WellnessDynamicCommentSaveDTO) {
        return GAxios.post<ApiResult<WellnessDynamicCommentVO>>(
            "/wellness-dynamics/comment",
            data,
        );
    }

    static getDynamicCommentPage(params?: {
        dynamicId?: number;
        page?: number;
        size?: number;
    }) {
        return GAxios.get<ApiResult<PageResult<WellnessDynamicCommentVO>>>(
            "/wellness-dynamics/comment/page",
            { params },
        );
    }

    static getDietRoutineToday(userId: number) {
        return GAxios.get<ApiResult<DietSleepTrendVO>>("/diet-routine/today", {
            params: { userId },
        });
    }

    static getLastNightSleep(userId: number) {
        return GAxios.get<ApiResult<LastNightSleepVO>>(
            "/diet-routine/sleep/last-night",
            { params: { userId } },
        );
    }

    static getWeeklySleepTrend(userId: number) {
        return GAxios.get<ApiResult<WeeklySleepTrendVO>>(
            "/diet-routine/sleep/weekly-trend",
            { params: { userId } },
        );
    }

    static saveDietRoutineRecord(data: DietRecordSaveDTO) {
        return GAxios.post<ApiResult<DietRecordVO>>(
            "/diet-routine/record",
            data,
        );
    }

    static getTodayDietRecords(userId: number) {
        return GAxios.get<ApiResult<DietRecordVO[]>>(
            "/diet-routine/records/today",
            { params: { userId } },
        );
    }

    static getTodayCalorie(userId: number) {
        return GAxios.get<ApiResult<DietDailyCalorieSummaryVO>>(
            "/diet-routine/calorie/today",
            { params: { userId } },
        );
    }

    static setCalorieLimit(data: DietDailyCalorieLimitSaveDTO) {
        return GAxios.put<ApiResult<DietDailyCalorieSummaryVO>>(
            "/diet-routine/calorie/limit",
            data,
        );
    }

    static saveDietRecord(data: DietRecordSaveDTO) {
        return GAxios.post<ApiResult<DietRecordVO>>("/diet/record", data);
    }

    static getDietRecordList(params: { userId: number; date?: string }) {
        return GAxios.get<ApiResult<DietRecordVO[]>>("/diet/record/list", {
            params,
        });
    }

    static getDietSleepTrend(userId: number) {
        return GAxios.get<ApiResult<DietSleepTrendVO>>("/diet/sleep-trend", {
            params: { userId },
        });
    }

    static publishNote(data: WellnessNotePublishDTO) {
        return GAxios.post<ApiResult<WellnessNoteVO>>(
            "/wellness-notes",
            data,
        );
    }

    static getNotePage(params?: {
        page?: number;
        size?: number;
        noteType?: number;
    }) {
        return GAxios.get<ApiResult<PageResult<WellnessNoteVO>>>(
            "/wellness-notes/page",
            { params },
        );
    }

    static getOtherNotePage(params?: {
        userId?: number;
        page?: number;
        size?: number;
        noteType?: number;
    }) {
        return GAxios.get<ApiResult<PageResult<WellnessNoteVO>>>(
            "/wellness-notes/page/others",
            { params },
        );
    }

    static getNoteDetail(id: number) {
        return GAxios.get<ApiResult<WellnessNoteVO>>(
            `/wellness-notes/${id}`,
        );
    }

    static getNoteCommentPage(params?: {
        noteId?: number;
        page?: number;
        size?: number;
    }) {
        return GAxios.get<ApiResult<PageResult<WellnessNoteCommentVO>>>(
            "/wellness-notes/comment/page",
            { params },
        );
    }

    static publishNoteComment(data: WellnessNoteCommentSaveDTO) {
        return GAxios.post<ApiResult<WellnessNoteCommentVO>>(
            "/wellness-notes/comment",
            data,
        );
    }

    static deleteNoteComment(id: number, userId: number) {
        return GAxios.delete<ApiResult<WellnessNoteCommentVO>>(
            `/wellness-notes/comment/${id}`,
            { params: { userId } },
        );
    }

    static getCheckinToday(userId: number) {
        return GAxios.get<ApiResult<CheckInTodayOverviewVO>>(
            "/checkin/today",
            { params: { userId } },
        );
    }

    static saveCheckinMood(data: CheckInMoodSaveDTO) {
        return GAxios.post<ApiResult<CheckInMoodVO>>("/checkin/mood", data);
    }

    static getCheckinWeek(params: { userId: number; date?: string }) {
        return GAxios.get<ApiResult<CheckInWeekVO>>("/checkin/week", {
            params,
        });
    }

    static getCheckinMonth(params: { userId: number; month?: string }) {
        return GAxios.get<ApiResult<CheckInMonthVO>>("/checkin/month", {
            params,
        });
    }

    static getCheckinMilestones(userId: number) {
        return GAxios.get<ApiResult<CheckInMilestoneVO>>(
            "/checkin/milestones",
            { params: { userId } },
        );
    }

    static refreshCheckinMilestones(userId: number) {
        return GAxios.post<ApiResult<CheckInMilestoneVO>>(
            "/checkin/milestones/refresh",
            null,
            { params: { userId } },
        );
    }

    static getWaterToday(userId: number) {
        return GAxios.get<ApiResult<WaterTodayOverviewVO>>(
            "/water-tracking/today",
            { params: { userId } },
        );
    }

    static updateWaterTarget(data: WaterTodayTargetUpdateDTO) {
        return GAxios.put<ApiResult<WaterTodayOverviewVO>>(
            "/water-tracking/today/target",
            data,
        );
    }

    static updateWaterCups(data: WaterTodayCupsUpdateDTO) {
        return GAxios.put<ApiResult<WaterTodayOverviewVO>>(
            "/water-tracking/today/cups",
            data,
        );
    }
}
