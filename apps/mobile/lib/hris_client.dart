import 'dart:convert';
import 'dart:typed_data';

import 'package:http/http.dart' as http;

import 'config.dart';
import 'debug_log.dart';
import 'models.dart';

/// Same REST surface as `apps/web-onboarding/src/api.ts`.
///
/// ```
/// curl -H "Authorization: Bearer dev:employee" http://localhost:3000/api/v1/me
/// ```
class HrisClient {
  HrisClient({
    required this.baseUrl,
    this.token,
    http.Client? httpClient,
  }) : _http = httpClient ?? http.Client();

  String baseUrl;
  String? token;
  final http.Client _http;

  Uri _uri(String path) {
    final root = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    return Uri.parse('$root$path');
  }

  Future<T> _json<T>(
    String path, {
    String method = 'GET',
    Object? body,
  }) async {
    final uri = _uri(path);
    final headers = bearerHeaders(token, json: body != null);
    final log = LabDebugLog.instance;
    log.info('→ ${method.toUpperCase()} ${uri.path}');
    try {
      final res = switch (method) {
        'POST' => await _http.post(uri, headers: headers, body: body),
        'PATCH' => await _http.patch(uri, headers: headers, body: body),
        _ => await _http.get(uri, headers: headers),
      };
      log.api(method.toUpperCase(), uri.toString(), status: res.statusCode, detail: res.body);
      if (res.statusCode < 200 || res.statusCode >= 300) {
        throw HrisApiException(res.statusCode, res.body);
      }
      if (res.body.isEmpty) {
        return null as T;
      }
      return jsonDecode(res.body) as T;
    } catch (e) {
      if (e is! HrisApiException) {
        log.error('$method ${uri.path} · $e');
      }
      rethrow;
    }
  }

  Future<Me> me() async {
    final json = await _json<Map<String, dynamic>>('/api/v1/me');
    return Me.fromJson(json);
  }

  Future<List<OnboardingCase>> listCases() async {
    final list = await _json<List<dynamic>>('/api/v1/onboarding/cases');
    return list
        .map((c) => OnboardingCase.fromJson(c as Map<String, dynamic>))
        .toList();
  }

  Future<OnboardingCase?> firstCase() async {
    final list = await listCases();
    if (list.isEmpty) return null;
    return list.first;
  }

  Future<OnboardingCase> getCase(String id) async {
    final json = await _json<Map<String, dynamic>>('/api/v1/onboarding/cases/$id');
    return OnboardingCase.fromJson(json);
  }

  Future<void> caseAction(String caseId, String action) async {
    await _json<dynamic>(
      '/api/v1/onboarding/cases/$caseId/$action',
      method: 'POST',
    );
  }

  Future<void> reviewDocument(String docId, String reviewStatus) async {
    await _json<dynamic>(
      '/api/v1/documents/$docId/review',
      method: 'POST',
      body: jsonEncode({'reviewStatus': reviewStatus}),
    );
  }

  Future<void> accept(String caseId) async {
    await _json<dynamic>('/api/v1/onboarding/cases/$caseId/accept', method: 'POST');
  }

  Future<void> submit(String caseId) async {
    await _json<dynamic>('/api/v1/onboarding/cases/$caseId/submit', method: 'POST');
  }

  Future<void> completeTask(String taskId) async {
    await _json<dynamic>(
      '/api/v1/onboarding/tasks/$taskId',
      method: 'PATCH',
      body: jsonEncode({'status': 'done'}),
    );
  }

  Future<void> uploadId({
    required String caseId,
    required String taskId,
    required String filename,
    required String contentType,
    required Uint8List bytes,
  }) async {
    final slot = await _json<Map<String, dynamic>>(
      '/api/v1/documents',
      method: 'POST',
      body: jsonEncode({
        'caseId': caseId,
        'taskId': taskId,
        'filename': filename,
        'contentType': contentType,
        'sizeBytes': bytes.length,
      }),
    );
    final uploadUrl = rewriteUploadUrl(slot['uploadUrl'] as String, baseUrl);
    LabDebugLog.instance.info('→ PUT upload ${uploadUrl.path}');
    final put = await _http.put(
      uploadUrl,
      headers: {'Content-Type': contentType},
      body: bytes,
    );
    LabDebugLog.instance.api('PUT', uploadUrl.toString(), status: put.statusCode);
    if (put.statusCode < 200 || put.statusCode >= 300) {
      throw HrisApiException(put.statusCode, 'Upload failed ${put.body}');
    }
    await completeTask(taskId);
  }
}

class HrisApiException implements Exception {
  HrisApiException(this.status, this.body);
  final int status;
  final String body;

  bool get isForbidden => status == 403;
  bool get isUnauthorized => status == 401;

  @override
  String toString() => '$status $body';
}
