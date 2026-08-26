import 'package:flutter_test/flutter_test.dart';
import 'package:hris_onboarding/config.dart';
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

  test('PKCE S256 matches RFC 7636 appendix B', () {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    expect(s256Challenge(verifier), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });

  test('lab Cognito Hosted UI defaults are compiled in', () {
    expect(AppConfig.oidcConfigured, isTrue);
    expect(AppConfig.oidcClientId, '4ij7jqehds0m6s1ubss1aj7710');
    expect(AppConfig.oidcRedirectUri, 'hris://auth');
    expect(AppConfig.oidcAuthorizeUrl, contains('hris-lab-mtgons5'));
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
