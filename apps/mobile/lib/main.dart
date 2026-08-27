import 'package:flutter/material.dart';

import 'screens/admin_home_screen.dart';
import 'screens/checklist_screen.dart';
import 'screens/welcome_screen.dart';
import 'session.dart';
import 'sign_out_actions.dart';
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
          final me = _session.me!;
          if (me.isEmployee) {
            return ChecklistScreen(session: _session);
          }
          if (me.isAdmin) {
            return AdminHomeScreen(session: _session);
          }
          return _WrongPortalScreen(session: _session, role: me.role);
        },
      ),
    );
  }
}

class _WrongPortalScreen extends StatelessWidget {
  const _WrongPortalScreen({required this.session, required this.role});

  final SessionController session;
  final String role;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Unknown role', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 12),
              Text(
                'Role "$role" is not supported in this app. Sign out and use the correct portal.',
                style: const TextStyle(color: muted, height: 1.4),
              ),
              const Spacer(),
              SessionSignOutActions(session: session),
            ],
          ),
        ),
      ),
    );
  }
}
