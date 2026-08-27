import 'package:flutter_test/flutter_test.dart';
import 'package:hris_onboarding/config.dart';
import 'package:hris_onboarding/debug_log.dart';
import 'package:hris_onboarding/models.dart';
import 'package:hris_onboarding/oidc.dart';

void main() {
  group('bearerHeaders', () {
    test('matches the Nest JwtAuthGuard / web portal pattern', () {
      expect(
        bearerHeaders('dev:employee'),
        {'Authorization': 'Bearer dev:employee'},
      );
      expect(
        bearerHeaders('dev:employee', json: true),
        {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev:employee',
        },
      );
    });
  });

  group('rewriteUploadUrl', () {
    test('rewrites Nest local-disk localhost to the Android emulator host', () {
      final out = rewriteUploadUrl(
        'http://localhost:3000/api/v1/documents/abc/upload',
        'http://10.0.2.2:3000',
      );
      expect(out.toString(), 'http://10.0.2.2:3000/api/v1/documents/abc/upload');
    });

    test('leaves production upload URLs unchanged', () {
      const url = 'https://api.getlakbay.com/api/v1/documents/abc/upload';
      expect(rewriteUploadUrl(url, 'https://api.getlakbay.com').toString(), url);
    });
  });

  group('sanitizeForLog', () {
    test('keeps dev tokens readable', () {
      expect(sanitizeForLog('Bearer dev:employee'), 'Bearer dev:employee');
    });

    test('redacts JWT-shaped strings', () {
      const jwt =
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      expect(sanitizeForLog(jwt), 'Bearer eyJ…(jwt)');
    });

    test('truncates very long lines', () {
      final long = 'x' * 700;
      expect(sanitizeForLog(long).length, lessThan(610));
      expect(sanitizeForLog(long).endsWith('…'), isTrue);
    });
  });

  test('PKCE S256 matches RFC 7636 appendix B', () {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    expect(s256Challenge(verifier), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });

  test('lab Cognito Hosted UI defaults are compiled in', () {
    expect(AppConfig.oidcConfigured, isTrue);
    expect(AppConfig.oidcClientId, '4ij7jqehds0m6s1ubss1aj7710');
    expect(AppConfig.oidcRedirectUri, 'hris://auth');
    expect(AppConfig.oidcAuthorizeUrl, contains('hris-lab-mtgons5'));
    expect(AppConfig.oidcAuthorizeUrl, isNot(contains('identity_provider')));
  });

  test('formatOidcRedirectError surfaces Cognito login_pages_unavailable', () {
    expect(
      formatOidcRedirectError('login_pages_unavailable', null),
      contains('managed login style'),
    );
    expect(
      formatOidcRedirectError('access_denied', 'User cancelled'),
      'User cancelled',
    );
  });

  test('Me role helpers route employee vs admin portals', () {
    const employee = Me(
      id: '1',
      email: 'luis@lab.local',
      displayName: 'Luis Reyes',
      role: 'employee',
    );
    const hr = Me(
      id: '2',
      email: 'hr@lab.local',
      displayName: 'Harper Reyes',
      role: 'hr_admin',
    );
    const manager = Me(
      id: '3',
      email: 'maya@lab.local',
      displayName: 'Maya Santos',
      role: 'manager',
    );
    expect(employee.isEmployee, isTrue);
    expect(employee.isAdmin, isFalse);
    expect(employee.portalLabel, 'Onboarding portal');
    expect(hr.isAdmin, isTrue);
    expect(manager.isAdmin, isTrue);
    expect(hr.portalLabel, 'Admin console');
  });

  test('showDevBypass is false on production apiBase', () {
    expect(AppConfig.showDevBypass('http://localhost:3000'), isTrue);
    expect(AppConfig.showDevBypass('http://192.168.0.4:3000'), isTrue);
    expect(AppConfig.showDevBypass(AppConfig.productionApiBase), isFalse);
  });

  test('case JSON groups employee vs manager tasks and access fields', () {
    final c = OnboardingCase.fromJson({
      'id': 'c1',
      'status': 'in_progress',
      'employee': {
        'firstName': 'Luis',
        'lastName': 'Reyes',
        'status': 'candidate',
        'user': {'role': 'employee', 'idpSub': 'dev-employee'},
        'manager': {'firstName': 'Maya', 'lastName': 'Santos'},
      },
      'tasks': [
        {
          'id': 't1',
          'code': 'PROFILE',
          'title': 'Complete personal profile',
          'status': 'done',
          'assigneeRole': 'employee',
        },
        {
          'id': 't2',
          'code': 'MANAGER_INTRO',
          'title': 'Manager welcome / first-week plan',
          'status': 'pending',
          'assigneeRole': 'manager',
        },
      ],
    });
    expect(c.mine, hasLength(1));
    expect(c.waitingOnOthers.single.code, 'MANAGER_INTRO');
    expect(c.managerName, 'Maya Santos');
    expect(c.idpLabel, 'dev-employee');
    expect(c.day1Label, 'Day 1 packet');
  });
}
