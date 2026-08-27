import 'package:flutter/foundation.dart';

/// In-memory trace for lab demos — copy from the app and paste into Cursor/chat.
class LabDebugLog extends ChangeNotifier {
  LabDebugLog._();
  static final LabDebugLog instance = LabDebugLog._();

  static const _maxLines = 250;
  final List<String> _lines = [];

  List<String> get lines => List.unmodifiable(_lines);

  String get text => _lines.join('\n');

  void info(String message) => _add('INFO', message);

  void warn(String message) => _add('WARN', message);

  void error(String message) => _add('ERROR', message);

  void api(String method, String url, {int? status, String? detail}) {
    final parts = <String>['$method $url'];
    if (status != null) parts.add('→ $status');
    if (detail != null && detail.isNotEmpty) {
      parts.add(sanitizeForLog(detail));
    }
    _add('API', parts.join(' '));
  }

  void oidc(String step, [String? detail]) {
    _add('OIDC', detail == null ? step : '$step · ${sanitizeForLog(detail)}');
  }

  void clear() {
    _lines.clear();
    notifyListeners();
  }

  void _add(String level, String message) {
    final ts = DateTime.now().toIso8601String().substring(11, 23);
    final line = '$ts [$level] ${sanitizeForLog(message)}';
    _lines.add(line);
    if (_lines.length > _maxLines) {
      _lines.removeRange(0, _lines.length - _maxLines);
    }
    if (kDebugMode) {
      // ignore: avoid_print
      print('[hris-mobile] $line');
    }
    notifyListeners();
  }
}

/// Redact JWTs and long secrets; keep dev tokens readable.
String sanitizeForLog(String raw) {
  var s = raw;
  s = s.replaceAllMapped(
    RegExp(r'Bearer\s+ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'),
    (m) => 'Bearer eyJ…(jwt)',
  );
  s = s.replaceAllMapped(
    RegExp(r'ey[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'),
    (_) => 'eyJ…(jwt)',
  );
  if (s.length > 600) {
    s = '${s.substring(0, 600)}…';
  }
  return s;
}
