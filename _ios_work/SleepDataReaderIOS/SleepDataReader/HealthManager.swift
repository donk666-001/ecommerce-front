import Foundation
import HealthKit

@MainActor
final class HealthManager: ObservableObject {
    @Published var sleepData: [SleepRecord] = []
    @Published var authorizationMessage = "未申请健康权限"
    @Published var isLoading = false
    @Published var lastUpdated: Date?

    private let healthStore = HKHealthStore()
    private let calendar = Calendar.current

    var isHealthDataAvailable: Bool {
        HKHealthStore.isHealthDataAvailable()
    }

    var summaries: [SleepDaySummary] {
        let grouped = Dictionary(grouping: sleepData) { record in
            sleepDay(for: record.startTime)
        }

        return grouped
            .map { SleepDaySummary(day: $0.key, records: $0.value.sorted { $0.startTime < $1.startTime }) }
            .sorted { $0.day > $1.day }
    }

    func requestAuthorizationAndFetch() {
        guard isHealthDataAvailable else {
            authorizationMessage = "当前设备不支持 HealthKit"
            return
        }

        guard let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
            authorizationMessage = "系统没有开放睡眠分析类型"
            return
        }

        authorizationMessage = "正在申请健康权限..."

        healthStore.requestAuthorization(toShare: [], read: [sleepType]) { [weak self] success, error in
            Task { @MainActor in
                guard let self else { return }

                if let error {
                    self.authorizationMessage = "授权失败：\(error.localizedDescription)"
                    return
                }

                self.authorizationMessage = success ? "已获得睡眠读取权限" : "未获得睡眠读取权限"

                if success {
                    self.fetchSleepData()
                }
            }
        }
    }

    func fetchSleepData(days: Int = 7) {
        guard let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else {
            authorizationMessage = "系统没有开放睡眠分析类型"
            return
        }

        isLoading = true
        authorizationMessage = "正在读取最近 \(days) 天睡眠数据..."

        let endDate = Date()
        let startDate = calendar.date(byAdding: .day, value: -days, to: endDate) ?? endDate
        let predicate = HKQuery.predicateForSamples(
            withStart: startDate,
            end: endDate,
            options: .strictStartDate
        )
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

        let query = HKSampleQuery(
            sampleType: sleepType,
            predicate: predicate,
            limit: HKObjectQueryNoLimit,
            sortDescriptors: [sort]
        ) { [weak self] _, samples, error in
            Task { @MainActor in
                guard let self else { return }
                self.isLoading = false

                if let error {
                    self.authorizationMessage = "读取失败：\(error.localizedDescription)"
                    return
                }

                let records = (samples as? [HKCategorySample] ?? [])
                    .map(Self.makeRecord)
                    .sorted { $0.startTime > $1.startTime }

                self.sleepData = records
                self.lastUpdated = Date()
                self.authorizationMessage = records.isEmpty
                    ? "没有读取到睡眠数据，请确认 Apple Watch 已同步到健康 App"
                    : "已读取 \(records.count) 条睡眠记录"
            }
        }

        healthStore.execute(query)
    }

    func loadDemoData() {
        let now = Date()
        let start = calendar.date(byAdding: .hour, value: -8, to: now) ?? now

        sleepData = [
            SleepRecord(startTime: start, endTime: start.addingTimeInterval(38 * 60), stage: .light),
            SleepRecord(startTime: start.addingTimeInterval(38 * 60), endTime: start.addingTimeInterval(92 * 60), stage: .deep),
            SleepRecord(startTime: start.addingTimeInterval(92 * 60), endTime: start.addingTimeInterval(156 * 60), stage: .light),
            SleepRecord(startTime: start.addingTimeInterval(156 * 60), endTime: start.addingTimeInterval(186 * 60), stage: .rem),
            SleepRecord(startTime: start.addingTimeInterval(186 * 60), endTime: start.addingTimeInterval(194 * 60), stage: .awake),
            SleepRecord(startTime: start.addingTimeInterval(194 * 60), endTime: start.addingTimeInterval(310 * 60), stage: .light),
            SleepRecord(startTime: start.addingTimeInterval(310 * 60), endTime: start.addingTimeInterval(366 * 60), stage: .deep),
            SleepRecord(startTime: start.addingTimeInterval(366 * 60), endTime: start.addingTimeInterval(438 * 60), stage: .rem)
        ].sorted { $0.startTime > $1.startTime }

        lastUpdated = Date()
        authorizationMessage = "已载入测试睡眠数据"
    }

    private static func makeRecord(from sample: HKCategorySample) -> SleepRecord {
        SleepRecord(
            startTime: sample.startDate,
            endTime: sample.endDate,
            stage: stage(from: sample.value)
        )
    }

    private static func stage(from value: Int) -> SleepStage {
        if value == HKCategoryValueSleepAnalysis.asleepDeep.rawValue {
            return .deep
        }
        if value == HKCategoryValueSleepAnalysis.asleepCore.rawValue {
            return .light
        }
        if value == HKCategoryValueSleepAnalysis.asleepREM.rawValue {
            return .rem
        }
        if value == HKCategoryValueSleepAnalysis.awake.rawValue {
            return .awake
        }
        if value == HKCategoryValueSleepAnalysis.inBed.rawValue {
            return .inBed
        }
        if value == HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue {
            return .asleep
        }

        return .unknown
    }

    private func sleepDay(for date: Date) -> Date {
        let shifted = calendar.date(byAdding: .hour, value: -12, to: date) ?? date
        return calendar.startOfDay(for: shifted)
    }
}
