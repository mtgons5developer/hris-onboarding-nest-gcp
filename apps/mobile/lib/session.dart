import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'config.dart';
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
    final prefs = await SharedPreferences.getInstance();
    apiBase = prefs.getString(_apiKey) ?? AppConfig.initialApiBase();
    token = prefs.getString(_tokenKey);
    if (token != null) {
      try {
        me = await client.me();
      } catch (_) {
        await signOut(quiet: true);
      }
    }
    ready = true;
    notifyListeners();
  }

  Future<void> setApiBase(String next) async {
    apiBase = next;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_apiKey, next);
    notifyListeners();
  }

  Future<void> continueAsEmployee() async {
    error = null;
    notifyListeners();
    try {
      token = AppConfig.devEmployeeToken;
      await _persistToken();
      me = await client.me();
      notifyListeners();
    } catch (e) {
      token = null;
      me = null;
      error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> signInWithOidc() async {
    error = null;
    notifyListeners();
    try {
      token = await (_oidc ??= OidcLogin()).signIn();
      await _persistToken();
      me = await client.me();
      notifyListeners();
    } catch (e) {
      error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> signOut({bool quiet = false}) async {
    token = null;
    me = null;
    if (!quiet) error = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
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
