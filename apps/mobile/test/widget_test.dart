import 'package:flutter_test/flutter_test.dart';
import 'package:hris_onboarding/main.dart';
import 'package:hris_onboarding/models.dart';
import 'package:hris_onboarding/oidc.dart';
import 'package:hris_onboarding/session.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('welcome screen offers dev and Cognito login', (tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const HrisOnboardingApp());
    await tester.pump();
    await tester.pump();

    expect(find.text('Welcome aboard'), findsOneWidget);
    expect(find.text('Continue as employee (Luis)'), findsOneWidget);
    expect(find.text('Continue as HR (Harper)'), findsOneWidget);
    expect(find.text('Continue as Manager (Maya)'), findsOneWidget);
    expect(find.text('Sign in with Cognito'), findsOneWidget);
  });

  testWidgets('routes admin role to AdminHomeScreen', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final session = SessionController();
    session.ready = true;
    session.me = const Me(
      id: '2',
      email: 'hr@lab.local',
      displayName: 'Harper Reyes',
      role: 'hr_admin',
    );
    await tester.pumpWidget(HrisOnboardingApp(session: session));
    await tester.pump();

    expect(find.text('Onboarding cases'), findsOneWidget);
    expect(find.text('Hi Luis'), findsNothing);
  });

  test('signInAsDifferentAccount clears session and OIDC prefs but keeps apiBase', () async {
    const api = 'http://localhost:3000';
    SharedPreferences.setMockInitialValues({
      'hris_onboarding_token': 'dev:employee',
      'hris_onboarding_api_base': api,
      oidcPkceVerifierKey: 'verifier',
      oidcPkceStateKey: 'state',
    });
    final session = SessionController();
    session.ready = true;
    session.apiBase = api;
    session.token = 'dev:employee';
    session.me = const Me(
      id: '1',
      email: 'luis.reyes@lab.local',
      displayName: 'Luis Reyes',
      role: 'employee',
    );
    session.error = 'stale';

    await session.signInAsDifferentAccount();

    expect(session.me, isNull);
    expect(session.token, isNull);
    expect(session.error, isNull);
    expect(session.apiBase, api);
    final prefs = await SharedPreferences.getInstance();
    expect(prefs.getString('hris_onboarding_token'), isNull);
    expect(prefs.getString(oidcPkceVerifierKey), isNull);
    expect(prefs.getString(oidcPkceStateKey), isNull);
    expect(prefs.getString('hris_onboarding_api_base'), api);
  });
}
