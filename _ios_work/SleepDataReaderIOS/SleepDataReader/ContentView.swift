import SwiftUI
import UIKit

struct ContentView: View {
    @StateObject private var healthManager = HealthManager()

    @AppStorage("websiteUserId") private var websiteUserId = ""
    @AppStorage("serverBaseURL") private var serverBaseURL = NetworkManager.defaultBaseURL

    @State private var showJSON = false
    @State private var copiedMessage = ""
    @State private var uploadMessage = "等待同步"
    @State private var isUploading = false
    @State private var pendingUploadAfterRead = false
    @State private var didRunLaunchSync = false

    private var trimmedUserId: String {
        websiteUserId.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private var latestSummary: SleepDaySummary? {
        healthManager.summaries.first
    }

    private var jsonPreview: String {
        NetworkManager.makePreviewJSON(data: healthManager.sleepData, userId: trimmedUserId)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    overviewHeader
                    accountSection
                    if let latestSummary {
                        sleepOverview(summary: latestSummary)
                    } else {
                        emptyOverview
                    }
                    weekSection
                    recordSection
                    jsonSection
                }
                .padding(18)
            }
            .background(Color.appBackground.ignoresSafeArea())
            .navigationTitle("睡眠")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                runLaunchSyncIfNeeded()
            }
            .onChange(of: healthManager.lastUpdated) { _, _ in
                guard pendingUploadAfterRead else { return }
                pendingUploadAfterRead = false
                Task { await uploadCurrentData(reason: "自动同步") }
            }
        }
    }

    private var overviewHeader: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("睡眠总览")
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                    Text(headerSubtitle)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Image(systemName: "bed.double.fill")
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundStyle(Color.sleepAccent)
                    .frame(width: 46, height: 46)
                    .background(Color.sleepAccent.opacity(0.12))
                    .clipShape(Circle())
            }

            HStack(spacing: 10) {
                statusDot
                Text(healthManager.authorizationMessage)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
                Spacer()
                if healthManager.isLoading {
                    ProgressView()
                        .controlSize(.small)
                }
            }
        }
        .cardStyle()
    }

    private var headerSubtitle: String {
        if let lastUpdated = healthManager.lastUpdated {
            return "本机更新 \(lastUpdated.formatted(date: .omitted, time: .shortened))"
        }
        return "打开后自动读取健康 App 睡眠阶段"
    }

    private var statusDot: some View {
        Circle()
            .fill(healthManager.sleepData.isEmpty ? Color.orange : Color.green)
            .frame(width: 8, height: 8)
    }

    private var accountSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Label("网站账号", systemImage: "person.crop.circle.badge.checkmark")
                    .font(.headline)
                Spacer()
                Text(trimmedUserId.isEmpty ? "未绑定" : "ID \(trimmedUserId)")
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(trimmedUserId.isEmpty ? Color.orange : Color.green)
            }

            VStack(spacing: 10) {
                TextField("网站用户 ID", text: $websiteUserId)
                    .keyboardType(.numberPad)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .fieldStyle()

                TextField("后端地址，例如 http://192.168.1.8:9090", text: $serverBaseURL)
                    .keyboardType(.URL)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .fieldStyle()
            }

            HStack(spacing: 10) {
                Button {
                    pendingUploadAfterRead = true
                    healthManager.requestAuthorizationAndFetch()
                } label: {
                    Label("读取并同步", systemImage: "arrow.triangle.2.circlepath")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)

                Button {
                    Task { await uploadCurrentData(reason: "手动同步") }
                } label: {
                    if isUploading {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                    } else {
                        Label("上传", systemImage: "icloud.and.arrow.up")
                            .frame(maxWidth: .infinity)
                    }
                }
                .buttonStyle(.bordered)
                .disabled(isUploading)
            }

            HStack(spacing: 8) {
                Image(systemName: uploadMessage.contains("失败") ? "exclamationmark.circle.fill" : "checkmark.circle.fill")
                    .foregroundStyle(uploadMessage.contains("失败") ? Color.orange : Color.green)
                Text(uploadMessage)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
        }
        .cardStyle()
    }

    private func sleepOverview(summary: SleepDaySummary) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(summary.day, style: .date)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.secondary)
                    Text(formatDuration(summary.totalAsleep))
                        .font(.system(size: 42, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.primary)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 4) {
                    Text("睡眠区间")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text(sleepRangeText(summary))
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.primary)
                }
            }

            SleepTimelineBar(records: summary.records)
                .frame(height: 28)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 2), spacing: 10) {
                metricCard("深睡", summary.deep, .blue)
                metricCard("核心", summary.light, .teal)
                metricCard("REM", summary.rem, .purple)
                metricCard("清醒", summary.awake, .orange)
            }
        }
        .cardStyle()
    }

    private var emptyOverview: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("睡眠总览")
                .font(.headline)
            ContentUnavailableView(
                "暂无睡眠数据",
                systemImage: "moon.zzz",
                description: Text("允许健康权限后会自动读取最近 7 天记录")
            )
            .frame(minHeight: 170)
        }
        .cardStyle()
    }

    private var weekSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("最近 7 天")
                    .font(.headline)
                Spacer()
                if !healthManager.summaries.isEmpty {
                    Text("\(healthManager.summaries.count) 天有记录")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }

            if healthManager.summaries.isEmpty {
                Text("暂无记录")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 24)
            } else {
                VStack(spacing: 10) {
                    ForEach(healthManager.summaries) { summary in
                        SleepDayRow(summary: summary)
                    }
                }
            }
        }
        .cardStyle()
    }

    private var recordSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("阶段明细")
                    .font(.headline)
                Spacer()
                Text("\(healthManager.sleepData.count) 条")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            if healthManager.sleepData.isEmpty {
                Button {
                    pendingUploadAfterRead = false
                    healthManager.loadDemoData()
                } label: {
                    Label("载入测试数据", systemImage: "wand.and.stars")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .padding(.vertical, 8)
            } else {
                VStack(spacing: 10) {
                    ForEach(healthManager.sleepData.prefix(14)) { item in
                        SleepRecordRow(record: item)
                    }
                }
            }
        }
        .cardStyle()
    }

    private var jsonSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("上传 JSON")
                    .font(.headline)
                Spacer()
                Button(showJSON ? "收起" : "查看") {
                    withAnimation(.easeOut(duration: 0.2)) {
                        showJSON.toggle()
                    }
                }
            }

            if showJSON {
                Text(jsonPreview)
                    .font(.system(.caption, design: .monospaced))
                    .textSelection(.enabled)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.black.opacity(0.06))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                Button {
                    UIPasteboard.general.string = jsonPreview
                    copiedMessage = "已复制 JSON"
                } label: {
                    Label("复制 JSON", systemImage: "doc.on.doc")
                }
                .buttonStyle(.bordered)

                if !copiedMessage.isEmpty {
                    Text(copiedMessage)
                        .font(.footnote)
                        .foregroundStyle(.green)
                }
            }
        }
        .cardStyle()
    }

    private func metricCard(_ title: String, _ duration: TimeInterval, _ color: Color) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(formatDuration(duration))
                .font(.headline.weight(.semibold))
                .foregroundStyle(color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(color.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func runLaunchSyncIfNeeded() {
        guard !didRunLaunchSync else { return }
        didRunLaunchSync = true
        pendingUploadAfterRead = true
        healthManager.requestAuthorizationAndFetch()
    }

    @MainActor
    private func uploadCurrentData(reason: String) async {
        guard !isUploading else { return }
        isUploading = true
        defer { isUploading = false }

        do {
            let response = try await NetworkManager.uploadSleepData(
                data: healthManager.sleepData,
                userId: trimmedUserId,
                baseURL: serverBaseURL
            )
            uploadMessage = "\(reason)完成，已上传 \(response.recordCount) 条"
        } catch {
            uploadMessage = "\(reason)失败：\(error.localizedDescription)"
        }
    }

    private func sleepRangeText(_ summary: SleepDaySummary) -> String {
        guard let start = summary.records.first?.startTime,
              let end = summary.records.last?.endTime
        else {
            return "暂无"
        }

        return "\(start.formatted(date: .omitted, time: .shortened)) - \(end.formatted(date: .omitted, time: .shortened))"
    }

    private func formatDuration(_ seconds: TimeInterval) -> String {
        let totalMinutes = max(0, Int(seconds / 60))
        let hours = totalMinutes / 60
        let minutes = totalMinutes % 60
        if hours <= 0 {
            return "\(minutes)分"
        }
        if minutes == 0 {
            return "\(hours)小时"
        }
        return "\(hours)小时\(minutes)分"
    }
}

private struct SleepTimelineBar: View {
    let records: [SleepRecord]

    private var totalDuration: TimeInterval {
        records.reduce(0) { $0 + $1.duration }
    }

    var body: some View {
        GeometryReader { proxy in
            HStack(spacing: 3) {
                ForEach(records) { record in
                    RoundedRectangle(cornerRadius: 6)
                        .fill(record.stage.color)
                        .frame(width: segmentWidth(for: record, totalWidth: proxy.size.width))
                }
            }
        }
        .frame(height: 28)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .background(Color.black.opacity(0.05), in: RoundedRectangle(cornerRadius: 8))
    }

    private func segmentWidth(for record: SleepRecord, totalWidth: CGFloat) -> CGFloat {
        guard totalDuration > 0 else { return 0 }
        return max(8, totalWidth * CGFloat(record.duration / totalDuration))
    }
}

private struct SleepDayRow: View {
    let summary: SleepDaySummary

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(summary.day, style: .date)
                    .font(.subheadline.weight(.semibold))
                Spacer()
                Text(formatDuration(summary.totalAsleep))
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(Color.sleepAccent)
            }

            SleepTimelineBar(records: summary.records)
                .frame(height: 18)
        }
        .padding(12)
        .background(Color.black.opacity(0.035))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func formatDuration(_ seconds: TimeInterval) -> String {
        let minutes = max(0, Int(seconds / 60))
        if minutes < 60 {
            return "\(minutes)分"
        }
        if minutes % 60 == 0 {
            return "\(minutes / 60)小时"
        }
        return "\(minutes / 60)小时\(minutes % 60)分"
    }
}

private struct SleepRecordRow: View {
    let record: SleepRecord

    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(record.stage.color)
                .frame(width: 10, height: 10)

            VStack(alignment: .leading, spacing: 4) {
                Text(record.stage.title)
                    .font(.subheadline.weight(.semibold))
                Text("\(record.startTime.formatted(date: .abbreviated, time: .shortened)) - \(record.endTime.formatted(date: .omitted, time: .shortened))")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(formatDuration(record.duration))
                .font(.footnote.weight(.semibold))
        }
        .padding(12)
        .background(record.stage.color.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func formatDuration(_ seconds: TimeInterval) -> String {
        let minutes = max(0, Int(seconds / 60))
        if minutes < 60 {
            return "\(minutes)分"
        }
        if minutes % 60 == 0 {
            return "\(minutes / 60)小时"
        }
        return "\(minutes / 60)小时\(minutes % 60)分"
    }
}

private extension SleepStage {
    var color: Color {
        switch self {
        case .deep:
            return .blue
        case .light:
            return .teal
        case .rem:
            return .purple
        case .awake:
            return .orange
        case .inBed:
            return .gray
        case .asleep:
            return .indigo
        case .unknown:
            return .secondary
        }
    }
}

private extension View {
    func cardStyle() -> some View {
        self
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .shadow(color: Color.black.opacity(0.06), radius: 16, x: 0, y: 8)
    }

    func fieldStyle() -> some View {
        self
            .padding(12)
            .background(Color.white.opacity(0.72))
            .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

private extension Color {
    static let appBackground = Color(red: 0.95, green: 0.96, blue: 0.99)
    static let cardBackground = Color(red: 1.0, green: 0.99, blue: 0.97)
    static let sleepAccent = Color.indigo
}
