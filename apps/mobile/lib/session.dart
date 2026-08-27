import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'config.dart';
import 'debug_log.dart';
import 'hris_client.dart';
import 'models.dart';
import 'oidc.dart';

class SessionController extends ChangeNotifier {
  SessionController({HrisClient? client, this._oidc}) : _injectedClient = client;

  static const _tokenKey = 'hris_onboarding_token';
  static const _apiKey = 'hris_onboarding_api_base';

  final HrisClient? _injectedClient;
  OidcLogin? _oidc;

  bool ready = false;
  String apiBase = AppConfig.initialApiBase();
  String? token;
  Me? me;
  String? error;

  HrisClient get client =>
      _injectedClient ?? HrisClient(baseUrl: apiBase, token: token);

  Future<void> bootstrap() async {
    final log = LabDebugLog.instance;
    final prefs = await SharedPreferences.getInstance();
    apiBase = AppConfig.resolveApiBase(prefs.getString(_apiKey));
    log.info('bootstrap apiBase=$apiBase');
    token = prefs.getString(_tokenKey);
    if (token != null) {
      log.info('restored token (${token!.startsWith('dev:') ? token : 'jwt'})');
      try {
        me = await client.me();
        log.info('session ok email=${me?.email} role=${me?.role}');
      } catch (e) {
        log.warn('stored token invalid · $e');
        await signOut(quiet: true);
      }
    }
    ready = true;
    notifyListeners();
  }

  Future<void> setApiBase(String next) async {
    apiBase = next;
    LabDebugLog.instance.info('apiBase=$next');
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_apiKey, next);
    notifyListeners();
  }

  bool get showDevBypass => AppConfig.showDevBypass(apiBase);

  Future<void> continueAsEmployee() => continueAsDev(AppConfig.devEmployeeToken);

  Future<void> continueAsHrAdmin() => continueAsDev(AppConfig.devHrAdminToken);

  Future<void> continueAsManager() => continueAsDev(AppConfig.devManagerToken);

  Future<void> continueAsDev(String devToken) async {
    error = null;
    notifyListeners();
    if (apiBase == AppConfig.productionApiBase) {
      error =
          'Production API does not accept dev tokens. Use Sign in with Cognito.';
      LabDebugLog.instance.warn(error!);
      notifyListeners();
      return;
    }
    try {
      LabDebugLog.instance.info('dev login $devToken');
      token = devToken;
      await _persistToken();
      me = await client.me();
      LabDebugLog.instance.info('dev login ok email=${me?.email} role=${me?.role}');
      notifyListeners();
    } catch (e) {
      token = null;
      me = null;
      error = e.toString();
      LabDebugLog.instance.error('dev login · $e');
      notifyListeners();
      rethrow;
    }
  }

  /// Returns true when the session was cleared (403/401).
  Future<bool> handleApiError(Object e) async {
    if (e is HrisApiException && (e.isForbidden || e.isUnauthorized)) {
      error = e.isForbidden
          ? 'Access denied — your role cannot perform this action.'
          : 'Session expired. Please sign in again.';
      LabDebugLog.instance.warn('api auth failure · $e');
      await signOut(quiet: true);
      notifyListeners();
      return true;
    }
    return false;
  }

  Future<void> signInWithOidc() async {
    error = null;
    notifyListeners();
    try {
      LabDebugLog.instance.oidc('signIn start', 'client=${AppConfig.oidcClientId}');
      token = await (_oidc ??= OidcLogin()).signIn();
      await _persistToken();
      me = await client.me();
      LabDebugLog.instance.info('oidc login ok email=${me?.email} role=${me?.role}');
      notifyListeners();
    } catch (e) {
      error = e.toString();
      LabDebugLog.instance.error('oidc login · $e');
      notifyListeners();
      rethrow;
    }
  }

  Future<void> signOut({bool quiet = false}) async {
    LabDebugLog.instance.info('signOut');
    token = null;
    me = null;
    if (!quiet) error = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    notifyListeners();
  }

  /// Clears session + OIDC PKCE prefs and returns to [WelcomeScreen].
  /// Keeps saved [apiBase] (Local vs Production) so the user does not lose that choice.
  Future<void> signInAsDifferentAccount() async {
    LabDebugLog.instance.info('switched account — session cache cleared');
    token = null;
    me = null;
    error = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await clearOidcPrefs(prefs);
    notifyListeners();
  }

  Future<void> _persistToken() async {
    final prefs = await SharedPreferences.getInstance();
    if (token == null) {
      await prefs.remove(_tokenKey);
    } else {
      await prefs.setString(_tokenKey, token!);
    }
  }
}
