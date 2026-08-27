import 'dart:io';

import 'package:flutter/foundation.dart';

/// Compile-time config (`--dart-define`) plus runtime local/production switch.
///
/// Native apps do not use CORS. Bearer JWT is the same as the React portals.
class AppConfig {
  static const _envApi = String.fromEnvironment('API_BASE_URL');

  /// Public Cognito app client `hris-mobile` (no secret). Override with dart-defines.
  static const oidcClientId = String.fromEnvironment(
    'OIDC_CLIENT_ID',
    defaultValue: '4ij7jqehds0m6s1ubss1aj7710',
  );
  static const oidcAuthorizeUrl = String.fromEnvironment(
    'OIDC_AUTHORIZE_URL',
    defaultValue:
        'https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/authorize',
  );
  static const oidcTokenUrl = String.fromEnvironment(
    'OIDC_TOKEN_URL',
    defaultValue: 'https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/token',
  );
  static const oidcRedirectUri = String.fromEnvironment(
    'OIDC_REDIRECT_URI',
    defaultValue: 'hris://auth',
  );
  static const oidcScopes = String.fromEnvironment(
    'OIDC_SCOPES',
    defaultValue: 'openid email profile',
  );

  static const productionApiBase = 'https://api.getlakbay.com';
  static const devEmployeeToken = 'dev:employee';
  static const devHrAdminToken = 'dev:hr_admin';
  static const devManagerToken = 'dev:manager';

  /// Dev bypass tokens only when API is local/LAN — never on production tunnel.
  static bool showDevBypass(String apiBase) =>
      apiBase != productionApiBase;

  /// Set via `--dart-define=API_BASE_URL=...` (physical device LAN IP, tunnel, etc.).
  static bool get hasCompiledApiBase => _envApi.isNotEmpty;

  static bool get oidcConfigured =>
      oidcAuthorizeUrl.isNotEmpty && oidcTokenUrl.isNotEmpty && oidcClientId.isNotEmpty;

  /// Local Nest on the dev machine. Android **emulator** uses `10.0.2.2` (not `localhost`).
  /// Physical Android must pass `--dart-define=API_BASE_URL=http://<lan-ip>:3000`.
  static String localApiBase() {
    if (_envApi.isNotEmpty) return _envApi;
    if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
  }

  static String initialApiBase() => localApiBase();

  /// `--dart-define=API_BASE_URL` wins over a stale SharedPreferences value.
  static String resolveApiBase(String? saved) {
    if (_envApi.isNotEmpty) return _envApi;
    return saved ?? localApiBase();
  }
}

/// Nest local-disk storage returns `http://localhost:3000/...` even when the
/// device must use `10.0.2.2` or a LAN IP. Rewrite that host to match [apiBase].
Uri rewriteUploadUrl(String uploadUrl, String apiBase) {
  final upload = Uri.parse(uploadUrl);
  final base = Uri.parse(apiBase);
  if (upload.host != 'localhost' && upload.host != '127.0.0.1') {
    return upload;
  }
  return Uri(
    scheme: base.scheme,
    host: base.host,
    port: base.hasPort ? base.port : null,
    path: upload.path,
    query: upload.hasQuery ? upload.query : null,
  );
}

Map<String, String> bearerHeaders(String? token, {bool json = false}) {
  return {
    if (json) 'Content-Type': 'application/json',
    if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
  };
}
