import { ApiSleep, type SleepRecordDTO } from "@/network/sleep";
import {
    computed,
    onBeforeUnmount,
    readonly,
    ref,
    toValue,
    watch,
    type MaybeRefOrGetter,
} from "vue";

export const SLEEP_RECORD_SYNCED_EVENT = "yy:sleep-record-synced";

export type SleepRecordSyncSource = "watcher" | "manual" | "phone";
export type SleepRecordSyncStatus =
    | "idle"
    | "watching"
    | "syncing"
    | "synced"
    | "error";

export type SleepRecordSyncedDetail = {
    userId: number;
    dateISO: string;
    record: SleepRecordDTO;
    source: SleepRecordSyncSource;
    syncedAt: string;
    origin?: string;
};

export type SleepRecordSyncOptions = {
    userId: MaybeRefOrGetter<number | null | undefined>;
    dateISO: MaybeRefOrGetter<string>;
    enabled?: MaybeRefOrGetter<boolean>;
    intervalMs?: number;
    immediate?: boolean;
    broadcast?: boolean;
    source?: SleepRecordSyncSource;
    origin?: string;
    onRecord?: (record: SleepRecordDTO) => void | Promise<void>;
    onError?: (error: unknown) => void;
};

const DEFAULT_SLEEP_SYNC_INTERVAL_MS = 6000;
const MIN_SLEEP_SYNC_INTERVAL_MS = 2500;

export function useSleepRecordSync(options: SleepRecordSyncOptions) {
    const syncStatus = ref<SleepRecordSyncStatus>("idle");
    const isSyncing = ref(false);
    const lastSyncedAt = ref<Date | null>(null);
    const lastError = ref<unknown>(null);
    const lastSignature = ref("");
    const syncUserId = computed(() => Number(toValue(options.userId)));
    const syncDateISO = computed(() => String(toValue(options.dateISO) || ""));
    const syncEnabled = computed(() =>
        options.enabled === undefined
            ? true
            : Boolean(toValue(options.enabled)),
    );

    let timer: ReturnType<typeof setInterval> | null = null;
    let listenersAttached = false;
    let requestSeq = 0;

    function canSync() {
        return (
            syncEnabled.value &&
            Number.isFinite(syncUserId.value) &&
            syncUserId.value > 0 &&
            Boolean(syncDateISO.value)
        );
    }

    function attachBrowserListeners() {
        if (listenersAttached || typeof window === "undefined") return;
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("online", handleBrowserOnline);
        listenersAttached = true;
    }

    function detachBrowserListeners() {
        if (!listenersAttached || typeof window === "undefined") return;
        document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
        );
        window.removeEventListener("online", handleBrowserOnline);
        listenersAttached = false;
    }

    function handleVisibilityChange() {
        if (document.visibilityState === "visible") {
            void checkNow();
        }
    }

    function handleBrowserOnline() {
        void checkNow();
    }

    function start() {
        if (!canSync() || timer) return;
        syncStatus.value = "watching";
        attachBrowserListeners();

        if (options.immediate !== false) {
            void checkNow();
        }

        timer = setInterval(() => {
            void checkNow("interval");
        }, normalizeIntervalMs(options.intervalMs));
    }

    function stop() {
        if (timer) clearInterval(timer);
        timer = null;
        detachBrowserListeners();
        isSyncing.value = false;
        syncStatus.value = "idle";
    }

    function restart() {
        if (timer) clearInterval(timer);
        timer = null;
        start();
    }

    async function checkNow(reason: "manual" | "interval" = "manual") {
        if (!canSync()) {
            syncStatus.value = "idle";
            return null;
        }

        if (
            reason === "interval" &&
            typeof document !== "undefined" &&
            document.visibilityState === "hidden"
        ) {
            return null;
        }

        if (isSyncing.value) return null;

        const userId = syncUserId.value;
        const dateISO = syncDateISO.value;
        const currentRequest = ++requestSeq;
        isSyncing.value = true;
        syncStatus.value = "syncing";

        try {
            const record = await ApiSleep.getRecordByDate(userId, dateISO);
            if (
                currentRequest !== requestSeq ||
                userId !== syncUserId.value ||
                dateISO !== syncDateISO.value
            ) {
                return null;
            }

            if (!hasSleepRecordPayload(record)) {
                syncStatus.value = "watching";
                return null;
            }

            const signature = stableStringify(record);
            if (!signature || signature === lastSignature.value) {
                syncStatus.value = "watching";
                return null;
            }

            lastSignature.value = signature;
            lastError.value = null;
            await options.onRecord?.(record);
            lastSyncedAt.value = new Date();
            syncStatus.value = "synced";

            if (options.broadcast !== false) {
                const detail: SleepRecordSyncedDetail = {
                    userId,
                    dateISO,
                    record,
                    source: options.source ?? "watcher",
                    syncedAt: lastSyncedAt.value.toISOString(),
                };
                if (options.origin) detail.origin = options.origin;
                emitSleepRecordSynced(detail);
            }

            return record;
        } catch (error) {
            lastError.value = error;
            syncStatus.value = "error";
            options.onError?.(error);
            return null;
        } finally {
            isSyncing.value = false;
        }
    }

    watch(
        [syncUserId, syncDateISO, syncEnabled],
        () => {
            requestSeq++;
            lastSignature.value = "";
            if (canSync()) restart();
            else stop();
        },
        { immediate: true },
    );

    onBeforeUnmount(() => {
        requestSeq++;
        stop();
    });

    return {
        syncStatus: readonly(syncStatus),
        isSyncing: readonly(isSyncing),
        lastSyncedAt: readonly(lastSyncedAt),
        lastError: readonly(lastError),
        checkNow,
        start,
        stop,
    };
}

export function emitSleepRecordSynced(detail: SleepRecordSyncedDetail) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
        new CustomEvent<SleepRecordSyncedDetail>(SLEEP_RECORD_SYNCED_EVENT, {
            detail,
        }),
    );
}

export function addSleepRecordSyncedListener(
    handler: (detail: SleepRecordSyncedDetail) => void,
) {
    if (typeof window === "undefined") return () => {};

    const listener = (event: Event) => {
        const detail = (event as CustomEvent<SleepRecordSyncedDetail>).detail;
        if (detail) handler(detail);
    };
    window.addEventListener(SLEEP_RECORD_SYNCED_EVENT, listener);
    return () => {
        window.removeEventListener(SLEEP_RECORD_SYNCED_EVENT, listener);
    };
}

function normalizeIntervalMs(value: number | undefined) {
    if (!Number.isFinite(value)) return DEFAULT_SLEEP_SYNC_INTERVAL_MS;
    return Math.max(MIN_SLEEP_SYNC_INTERVAL_MS, Math.round(value ?? 0));
}

function hasSleepRecordPayload(
    data: SleepRecordDTO | null,
): data is SleepRecordDTO {
    if (!data || typeof data !== "object") return false;
    const source = data as Record<string, unknown>;
    return [
        "id",
        "date",
        "recordDate",
        "sleepDate",
        "sleepTime",
        "bedTime",
        "bedtime",
        "startTime",
        "wakeTime",
        "endTime",
        "quality",
        "sleepQuality",
        "sleepStage",
        "sleepTagsJson",
        "durationMinutes",
        "sleepMinutes",
        "totalSleepMinutes",
        "sleepDuration",
    ].some((key) => source[key] != null);
}

function stableStringify(value: unknown): string {
    if (value == null || typeof value !== "object") {
        return JSON.stringify(value) ?? "undefined";
    }
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(",")}]`;
    }

    const source = value as Record<string, unknown>;
    return `{${Object.keys(source)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stableStringify(source[key])}`)
        .join(",")}}`;
}
