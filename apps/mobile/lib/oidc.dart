import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:app_links/app_links.dart';
import 'package:crypto/crypto.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import 'config.dart';
import 'debug_log.dart';

const oidcPkceVerifierKey = 'hris_oidc_pkce_verifier';
const oidcPkceStateKey = 'hris_oidc_pkce_state';

Future<void> clearOidcPrefs([SharedPreferences? prefs]) async {
  final p = prefs ?? await SharedPreferences.getInstance();
  await p.remove(oidcPkceVerifierKey);
  await p.remove(oidcPkceStateKey);
}

/// Authorization code + PKCE against Cognito Hosted UI (lab defaults) or Keycloak.
class OidcLogin {
  OidcLogin({http.Client? httpClient, AppLinks? appLinks})
      : _http = httpClient ?? http.Client(),
        _appLinks = appLinks ?? AppLinks();

  final http.Client _http;
  final AppLinks _appLinks;

  Future<String> signIn() async {
    if (!AppConfig.oidcConfigured) {
      throw StateError(
        'OIDC is not configured. Use Continue as employee, or pass '
        'OIDC_AUTHORIZE_URL / OIDC_TOKEN_URL dart-defines (see README).',
      );
    }

    final prefs = await SharedPreferences.getInstance();
    final verifier = randomUrlSafe(48);
    final state = randomUrlSafe(16);
    await prefs.setString(oidcPkceVerifierKey, verifier);
    await prefs.setString(oidcPkceStateKey, state);

    final authorize = Uri.parse(AppConfig.oidcAuthorizeUrl).replace(
      queryParameters: {
        'client_id': AppConfig.oidcClientId,
        'response_type': 'code',
        'redirect_uri': AppConfig.oidcRedirectUri,
        'scope': AppConfig.oidcScopes,
        'code_challenge': s256Challenge(verifier),
        'code_challenge_method': 'S256',
        'state': state,
      },
    );

    LabDebugLog.instance.oidc('authorize', AppConfig.oidcRedirectUri);

    final callback = Completer<Uri>();

    void onUri(Uri? uri) {
      if (uri == null || callback.isCompleted) return;
      if (!_isOAuthRedirect(uri)) return;

      final returnedState = uri.queryParameters['state'];
      if (returnedState != state) {
        LabDebugLog.instance.warn(
          'ignored stale callback state=$returnedState expected=$state',
        );
        return;
      }

      callback.complete(uri);
    }

    final sub = _appLinks.uriLinkStream.listen(onUri);

    try {
      // Drain cached deep link from a prior attempt before opening Hosted UI.
      onUri(await _appLinks.getInitialLink());

      final opened = await launchUrl(authorize, mode: LaunchMode.externalApplication);
      if (!opened) {
        throw StateError('Could not open the identity provider in a browser.');
      }
      LabDebugLog.instance.oidc('browser opened');
      LabDebugLog.instance.oidc('waiting for callback');

      final redirected = await callback.future.timeout(const Duration(minutes: 3));
      LabDebugLog.instance.oidc('callback', redirected.toString());

      final error = redirected.queryParameters['error'];
      if (error != null) {
        throw StateError(formatOidcRedirectError(error, redirected.queryParameters['error_description']));
      }
      final code = redirected.queryParameters['code'];
      if (code == null || code.isEmpty) {
        throw StateError('OIDC callback missing code');
      }
      final savedVerifier = prefs.getString(oidcPkceVerifierKey);
      if (savedVerifier == null || savedVerifier.isEmpty) {
        throw StateError('OIDC session expired. Try Sign in again.');
      }
      return _exchange(code: code, verifier: savedVerifier);
    } finally {
      await sub.cancel();
      await clearOidcPrefs(prefs);
    }
  }

  bool _isOAuthRedirect(Uri uri) {
    final expected = Uri.parse(AppConfig.oidcRedirectUri);
    if (uri.scheme != expected.scheme) return false;
    if (expected.host.isNotEmpty && uri.host != expected.host) return false;
    return uri.queryParameters.containsKey('code') ||
        uri.queryParameters.containsKey('error');
  }

  Future<String> _exchange({required String code, required String verifier}) async {
    LabDebugLog.instance.oidc('token exchange');
    final res = await _http.post(
      Uri.parse(AppConfig.oidcTokenUrl),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {
        'grant_type': 'authorization_code',
        'client_id': AppConfig.oidcClientId,
        'code': code,
        'redirect_uri': AppConfig.oidcRedirectUri,
        'code_verifier': verifier,
      },
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      LabDebugLog.instance.error('token exchange ${res.statusCode} ${res.body}');
      throw StateError('IdP token exchange failed (${res.statusCode}): ${res.body}');
    }
    LabDebugLog.instance.oidc('token exchange ok');
    final json = jsonDecode(res.body) as Map<String, dynamic>;
    // Nest JwtAuthGuard verifies via JWKS. Prefer id_token so email + groups map
    // onto the seeded lab user (same as the React portals).
    final token = (json['id_token'] as String?) ?? (json['access_token'] as String?);
    if (token == null || token.isEmpty) {
      throw StateError('IdP response missing id_token/access_token');
    }
    return token;
  }
}

String randomUrlSafe(int byteCount) {
  final rng = Random.secure();
  final bytes = List<int>.generate(byteCount, (_) => rng.nextInt(256));
  return base64UrlEncode(bytes).replaceAll('=', '');
}

String s256Challenge(String verifier) {
  final digest = sha256.convert(utf8.encode(verifier));
  return base64UrlEncode(digest.bytes).replaceAll('=', '');
}

/// User-facing message for OAuth error redirects (matching [state] only).
String formatOidcRedirectError(String error, String? description) {
  if (error == 'login_pages_unavailable') {
    return 'Cognito login pages are unavailable. In AWS Cognito, assign a managed '
        'login style to the hris-mobile app client (${AppConfig.oidcClientId}), '
        'then try Sign in again.';
  }
  return description ?? error;
}
