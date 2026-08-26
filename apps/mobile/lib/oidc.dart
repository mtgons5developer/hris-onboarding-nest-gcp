import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:app_links/app_links.dart';
import 'package:crypto/crypto.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

import 'config.dart';

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

    final verifier = randomUrlSafe(48);
    final challenge = s256Challenge(verifier);
    final state = randomUrlSafe(16);

    final authorize = Uri.parse(AppConfig.oidcAuthorizeUrl).replace(
      queryParameters: {
        'client_id': AppConfig.oidcClientId,
        'response_type': 'code',
        'redirect_uri': AppConfig.oidcRedirectUri,
        'scope': AppConfig.oidcScopes,
        'code_challenge': challenge,
        'code_challenge_method': 'S256',
        'state': state,
        'identity_provider': 'COGNITO',
      },
    );

    final callback = Completer<Uri>();
    final sub = _appLinks.uriLinkStream.listen((uri) {
      if (_isRedirect(uri) && !callback.isCompleted) {
        callback.complete(uri);
      }
    });

    try {
      final opened = await launchUrl(authorize, mode: LaunchMode.externalApplication);
      if (!opened) {
        throw StateError('Could not open the identity provider in a browser.');
      }
      final initial = await _appLinks.getInitialLink();
      if (initial != null && _isRedirect(initial) && !callback.isCompleted) {
        callback.complete(initial);
      }
      final redirected = await callback.future.timeout(const Duration(minutes: 3));
      if (redirected.queryParameters['state'] != state) {
        throw StateError('OIDC state mismatch');
      }
      final error = redirected.queryParameters['error'];
      if (error != null) {
        throw StateError(error);
      }
      final code = redirected.queryParameters['code'];
      if (code == null || code.isEmpty) {
        throw StateError('OIDC callback missing code');
      }
      return _exchange(code: code, verifier: verifier);
    } finally {
      await sub.cancel();
    }
  }

  bool _isRedirect(Uri uri) {
    final expected = Uri.parse(AppConfig.oidcRedirectUri);
    return uri.scheme == expected.scheme &&
        (expected.host.isEmpty || uri.host == expected.host);
  }

  Future<String> _exchange({required String code, required String verifier}) async {
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
      throw StateError('IdP token exchange failed (${res.statusCode})');
    }
    final json = jsonDecode(res.body) as Map<String, dynamic>;
    // Nest JwtAuthGuard verifies either via JWKS. Prefer id_token so email/name
    // map onto the seeded lab user; access_token is the fallback.
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
