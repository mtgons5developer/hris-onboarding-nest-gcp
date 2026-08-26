import 'package:flutter_test/flutter_test.dart';
import 'package:hris_onboarding/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('welcome screen offers Continue as employee', (tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const HrisOnboardingApp());
    await tester.pump();
    await tester.pump();

    expect(find.text('Welcome aboard'), findsOneWidget);
    expect(find.text('Continue as employee'), findsOneWidget);
    expect(find.text('Sign in with Cognito'), findsOneWidget);
  });
}
