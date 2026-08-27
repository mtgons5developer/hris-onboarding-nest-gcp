import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

import 'config.dart';
import 'hris_client.dart';

bool _isApiDownloadUrl(Uri url, String apiBase) {
  final base = Uri.parse(apiBase);
  return url.path.endsWith('/download') &&
      (url.host == base.host || url.host == 'localhost' || url.host == '127.0.0.1');
}

/// Fetches a document download URL and opens it (browser for presigned URLs, in-app for local API).
Future<void> openDocument({
  required BuildContext context,
  required HrisClient client,
  required String downloadUrl,
}) async {
  var url = rewriteUploadUrl(downloadUrl, client.baseUrl);
  if (_isApiDownloadUrl(url, client.baseUrl)) {
    final res = await http.get(url, headers: bearerHeaders(client.token));
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw HrisApiException(res.statusCode, res.body);
    }
    final contentType = res.headers['content-type'] ?? 'application/octet-stream';
    if (!context.mounted) return;
    if (contentType.startsWith('image/')) {
      await showDialog<void>(
        context: context,
        builder: (ctx) => Dialog(
          child: InteractiveViewer(
            child: Image.memory(res.bodyBytes, fit: BoxFit.contain),
          ),
        ),
      );
      return;
    }
    throw HrisApiException(415, 'Preview not supported for $contentType');
  }

  if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
    throw StateError('Could not open $url');
  }
}
