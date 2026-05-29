import Foundation

enum NetworkManager {
    static let defaultBaseURL = "http://localhost:9090"

    static func makePayload(data: [SleepRecord], userId: String) -> SleepUploadPayload {
        let formatter = ISO8601DateFormatter()
        formatter.timeZone = TimeZone.current
        formatter.formatOptions = [.withInternetDateTime]

        return SleepUploadPayload(
            userId: userId,
            generatedAt: Date(),
            sleepData: data
                .sorted { $0.startTime < $1.startTime }
                .map {
                    SleepPayloadRecord(
                        startTime: formatter.string(from: $0.startTime),
                        endTime: formatter.string(from: $0.endTime),
                        type: $0.stage.uploadValue
                    )
                }
        )
    }

    static func makePreviewJSON(data: [SleepRecord], userId: String) -> String {
        let payload = makePayload(data: data, userId: userId)
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]

        guard let jsonData = try? encoder.encode(payload) else {
            return "{}"
        }

        return String(data: jsonData, encoding: .utf8) ?? "{}"
    }

    static func uploadSleepData(
        data: [SleepRecord],
        userId: String,
        baseURL: String
    ) async throws -> UploadResponse {
        let trimmedUserId = userId.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedUserId.isEmpty else {
            throw UploadError.missingUserId
        }

        guard !data.isEmpty else {
            throw UploadError.emptySleepData
        }

        let normalizedBaseURL = baseURL.trimmingCharacters(in: .whitespacesAndNewlines)
            .trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        guard let url = URL(string: "\(normalizedBaseURL)/sleep-records/apple-watch/import") else {
            throw UploadError.invalidURL
        }

        let payload = makePayload(data: data, userId: trimmedUserId)
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(payload)

        let (responseData, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw UploadError.invalidResponse
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            let message = String(data: responseData, encoding: .utf8)
            throw UploadError.server(statusCode: httpResponse.statusCode, message: message)
        }

        return UploadResponse(
            uploadedAt: Date(),
            recordCount: payload.sleepData.count,
            responseText: String(data: responseData, encoding: .utf8) ?? ""
        )
    }
}

struct UploadResponse: Hashable {
    let uploadedAt: Date
    let recordCount: Int
    let responseText: String
}

enum UploadError: LocalizedError {
    case missingUserId
    case emptySleepData
    case invalidURL
    case invalidResponse
    case server(statusCode: Int, message: String?)

    var errorDescription: String? {
        switch self {
        case .missingUserId:
            return "请先绑定网站账号 ID"
        case .emptySleepData:
            return "当前没有可上传的睡眠数据"
        case .invalidURL:
            return "后端地址无效"
        case .invalidResponse:
            return "后端响应格式异常"
        case let .server(statusCode, message):
            if let message, !message.isEmpty {
                return "上传失败（\(statusCode)）：\(message)"
            }
            return "上传失败（\(statusCode)）"
        }
    }
}
