import Foundation

enum SleepStage: String, Codable, CaseIterable, Identifiable {
    case deep
    case light
    case rem
    case awake
    case inBed
    case asleep
    case unknown

    var id: String { rawValue }

    var title: String {
        switch self {
        case .deep:
            return "深睡"
        case .light:
            return "核心"
        case .rem:
            return "REM"
        case .awake:
            return "清醒"
        case .inBed:
            return "在床"
        case .asleep:
            return "睡眠"
        case .unknown:
            return "未知"
        }
    }

    var uploadValue: String {
        rawValue
    }
}

struct SleepRecord: Identifiable, Codable, Hashable {
    let id: UUID
    let startTime: Date
    let endTime: Date
    let stage: SleepStage

    init(id: UUID = UUID(), startTime: Date, endTime: Date, stage: SleepStage) {
        self.id = id
        self.startTime = startTime
        self.endTime = endTime
        self.stage = stage
    }

    var duration: TimeInterval {
        max(0, endTime.timeIntervalSince(startTime))
    }
}

struct SleepDaySummary: Identifiable, Hashable {
    let id: Date
    let day: Date
    let records: [SleepRecord]

    var totalAsleep: TimeInterval {
        records
            .filter { [.deep, .light, .rem, .asleep].contains($0.stage) }
            .reduce(0) { $0 + $1.duration }
    }

    var deep: TimeInterval {
        totalDuration(for: .deep)
    }

    var light: TimeInterval {
        totalDuration(for: .light)
    }

    var rem: TimeInterval {
        totalDuration(for: .rem)
    }

    var awake: TimeInterval {
        totalDuration(for: .awake)
    }

    var inBed: TimeInterval {
        totalDuration(for: .inBed)
    }

    init(day: Date, records: [SleepRecord]) {
        self.id = day
        self.day = day
        self.records = records
    }

    func totalDuration(for stage: SleepStage) -> TimeInterval {
        records
            .filter { $0.stage == stage }
            .reduce(0) { $0 + $1.duration }
    }
}

struct SleepUploadPayload: Codable {
    let userId: String
    let generatedAt: Date
    let sleepData: [SleepPayloadRecord]
}

struct SleepPayloadRecord: Codable {
    let startTime: String
    let endTime: String
    let type: String
}
