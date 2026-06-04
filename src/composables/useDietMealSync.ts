export const DIET_MEAL_ADDED_EVENT = "yy:diet-meal-added";
export const LOCAL_DIET_MEALS_STORAGE_KEY = "yiyangge_local_diet_meals_v1";

export type LocalDietMealSource = "seasonal-recipe";

export type LocalDietMeal = {
    sourceId: string;
    source: LocalDietMealSource;
    recipeId?: number;
    termName: string;
    foodName: string;
    content: string;
    calories: number;
    emoji: string;
    recordDate: string;
    addedAt: string;
    usageNote?: string;
    effectText?: string;
};

export type DietMealAddedDetail = {
    meal: LocalDietMeal;
    isNew: boolean;
};

export type AddRecipeToDietInput = {
    recipeId?: number;
    termName: string;
    foodName: string;
    calories?: number;
    emoji?: string;
    usageNote?: string;
    effectText?: string;
    recordDate?: string;
};

const recipeCalories: Record<string, number> = {
    莲子百合粥: 220,
    凉拌苦瓜: 70,
    桑葚冰糖饮: 120,
    麦冬太子参汤: 90,
    椰子炖乌鸡: 420,
    薄荷柠檬茶: 45,
    绿豆薏米粥: 260,
    荷叶冬瓜汤: 110,
    酸梅乌梅饮: 95,
    茯苓山药羹: 180,
    百合银耳羹: 160,
    西洋参麦冬茶: 60,
    山药小米粥: 260,
    银耳红枣羹: 180,
    薏米赤小豆粥: 285,
    南瓜燕麦粥: 240,
    姜枣桂圆茶: 95,
};

const keywordCalories: Array<[RegExp, number]> = [
    [/粥|羹|燕麦|小米|薏米|山药|赤小豆/, 240],
    [/乌鸡|鸡|肉/, 420],
    [/银耳|红枣|百合/, 180],
    [/汤/, 120],
    [/茶|饮/, 80],
    [/凉拌|苦瓜/, 70],
];

export function addLocalDietMealFromRecipe(input: AddRecipeToDietInput) {
    const recordDate = input.recordDate || getLocalDateKey();
    const sourceId = buildRecipeMealSourceId(input, recordDate);
    const meals = readAllLocalDietMeals();
    const calories = normalizeCalories(
        input.calories ?? inferSeasonalRecipeCalories(input.foodName),
    );
    const meal: LocalDietMeal = {
        sourceId,
        source: "seasonal-recipe",
        ...(input.recipeId != null ? { recipeId: input.recipeId } : {}),
        termName: input.termName,
        foodName: input.foodName,
        content: input.foodName,
        calories,
        emoji: input.emoji || inferRecipeEmoji(input.foodName),
        recordDate,
        addedAt: new Date().toISOString(),
        ...(input.usageNote ? { usageNote: input.usageNote } : {}),
        ...(input.effectText ? { effectText: input.effectText } : {}),
    };

    const existingIndex = meals.findIndex((item) => item.sourceId === sourceId);
    const isNew = existingIndex < 0;
    if (isNew) {
        meals.push(meal);
    } else {
        meals.splice(existingIndex, 1, {
            ...meals[existingIndex],
            ...meal,
        });
    }

    writeLocalDietMeals(meals);
    emitDietMealAdded({ meal, isNew });
    return { meal, isNew };
}

export function readLocalDietMeals(recordDate = getLocalDateKey()) {
    return readAllLocalDietMeals().filter(
        (meal) => meal.recordDate === recordDate,
    );
}

export function updateLocalDietMeal(
    sourceId: string,
    patch: Partial<LocalDietMeal>,
) {
    const meals = readAllLocalDietMeals();
    const index = meals.findIndex((meal) => meal.sourceId === sourceId);
    if (index < 0) return null;

    const current = meals[index]!;
    const recipeId = patch.recipeId ?? current.recipeId;
    const usageNote = patch.usageNote ?? current.usageNote;
    const effectText = patch.effectText ?? current.effectText;
    const nextMeal: LocalDietMeal = {
        sourceId: current.sourceId,
        source: patch.source ?? current.source,
        ...(recipeId != null ? { recipeId } : {}),
        termName: patch.termName ?? current.termName,
        foodName: patch.foodName ?? current.foodName,
        content: patch.content ?? current.content,
        calories: normalizeCalories(patch.calories ?? current.calories),
        emoji: patch.emoji ?? current.emoji,
        recordDate: patch.recordDate ?? current.recordDate,
        addedAt: new Date().toISOString(),
        ...(usageNote ? { usageNote } : {}),
        ...(effectText ? { effectText } : {}),
    };
    meals.splice(index, 1, nextMeal);
    writeLocalDietMeals(meals);
    emitDietMealAdded({ meal: nextMeal, isNew: false });
    return nextMeal;
}

export function removeLocalDietMeal(sourceId: string) {
    const meals = readAllLocalDietMeals();
    const nextMeals = meals.filter((meal) => meal.sourceId !== sourceId);
    if (nextMeals.length === meals.length) return false;
    writeLocalDietMeals(nextMeals);
    return true;
}

export function inferSeasonalRecipeCalories(foodName: string) {
    const matchedName = Object.keys(recipeCalories).find(
        (name) => foodName.includes(name) || name.includes(foodName),
    );
    if (matchedName) return recipeCalories[matchedName]!;

    const matchedKeyword = keywordCalories.find(([pattern]) =>
        pattern.test(foodName),
    );
    return matchedKeyword?.[1] ?? 180;
}

export function addDietMealAddedListener(
    handler: (detail: DietMealAddedDetail) => void,
) {
    if (typeof window === "undefined") return () => {};

    const listener = (event: Event) => {
        const detail = (event as CustomEvent<DietMealAddedDetail>).detail;
        if (detail) handler(detail);
    };
    window.addEventListener(DIET_MEAL_ADDED_EVENT, listener);
    return () => window.removeEventListener(DIET_MEAL_ADDED_EVENT, listener);
}

function readAllLocalDietMeals() {
    if (typeof localStorage === "undefined") return [] as LocalDietMeal[];
    try {
        const raw = localStorage.getItem(LOCAL_DIET_MEALS_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed)
            ? parsed.filter(isLocalDietMeal)
            : ([] as LocalDietMeal[]);
    } catch {
        return [] as LocalDietMeal[];
    }
}

function writeLocalDietMeals(meals: LocalDietMeal[]) {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(LOCAL_DIET_MEALS_STORAGE_KEY, JSON.stringify(meals));
}

function emitDietMealAdded(detail: DietMealAddedDetail) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
        new CustomEvent<DietMealAddedDetail>(DIET_MEAL_ADDED_EVENT, {
            detail,
        }),
    );
}

function buildRecipeMealSourceId(
    input: AddRecipeToDietInput,
    recordDate: string,
) {
    const rawId = input.recipeId ?? input.foodName;
    return [
        recordDate,
        "seasonal-recipe",
        input.termName,
        String(rawId).trim(),
    ].join(":");
}

function normalizeCalories(value: number) {
    const calories = Math.round(Number(value) || 0);
    return Math.min(9999, Math.max(0, calories));
}

function getLocalDateKey() {
    const date = new Date();
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
}

function inferRecipeEmoji(foodName: string) {
    if (foodName.includes("莲子") || foodName.includes("茶")) return "🍵";
    if (foodName.includes("山药")) return "🍠";
    if (foodName.includes("银耳")) return "🍐";
    if (foodName.includes("薏米") || foodName.includes("小米")) return "🍚";
    if (foodName.includes("南瓜")) return "🎃";
    if (foodName.includes("姜") || foodName.includes("枣")) return "🫖";
    if (foodName.includes("苦瓜")) return "🥒";
    if (foodName.includes("汤") || foodName.includes("羹")) return "🥣";
    return "🍲";
}

function isLocalDietMeal(value: unknown): value is LocalDietMeal {
    if (!value || typeof value !== "object") return false;
    const meal = value as Partial<LocalDietMeal>;
    return Boolean(
        meal.sourceId &&
        meal.source === "seasonal-recipe" &&
        meal.foodName &&
        meal.recordDate,
    );
}
