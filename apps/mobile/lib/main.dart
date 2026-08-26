import 'package:flutter/material.dart';

import 'screens/checklist_screen.dart';
import 'screens/welcome_screen.dart';
import 'session.dart';
import 'theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const HrisOnboardingApp());
}

class HrisOnboardingApp extends StatefulWidget {
  const HrisOnboardingApp({super.key, this.session});

  final SessionController? session;

  @override
  State<HrisOnboardingApp> createState() => _HrisOnboardingAppState();
}

class _HrisOnboardingAppState extends State<HrisOnboardingApp> {
  late final SessionController _session = widget.session ?? SessionController();

  @override
  void initState() {
    super.initState();
    _session.bootstrap();
  }

  @override
  void dispose() {
    if (widget.session == null) {
      _session.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HRIS Onboarding',
      debugShowCheckedModeBanner: false,
      theme: hrisTheme(),
      home: ListenableBuilder(
        listenable: _session,
        builder: (context, _) {
          if (!_session.ready) {
            return const Scaffold(body: Center(child: CircularProgressIndicator()));
          }
          if (_session.me == null) {
            return WelcomeScreen(session: _session);
          }
          return ChecklistScreen(session: _session);
        },
      ),
    );
  }
}
