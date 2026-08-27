import 'package:flutter/material.dart';

import '../config.dart';
import '../session.dart';
import '../theme.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key, required this.session});

  final SessionController session;

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  bool _busy = false;

  Future<void> _run(Future<void> Function() action) async {
    setState(() => _busy = true);
    try {
      await action();
    } catch (_) {
      // [SessionController] already captured [error].
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = widget.session;
    final local = AppConfig.localApiBase();
    final usingLocal = session.apiBase == local;
    final devBypass = session.showDevBypass;

    return Scaffold(
      appBar: AppBar(title: const Text('HRIS (lab)')),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: ListenableBuilder(
              listenable: session,
              builder: (context, _) {
                return SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: cardFill,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: line),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text('Welcome aboard', style: Theme.of(context).textTheme.headlineMedium),
                          const SizedBox(height: 8),
                          const Text(
                            'One app · employee checklist or admin console · role from /api/v1/me',
                            style: TextStyle(color: muted, height: 1.4),
                          ),
                          const SizedBox(height: 24),
                          OutlinedButton(
                            onPressed: _busy
                                ? null
                                : () {
                                    if (!AppConfig.oidcConfigured) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text(
                                            'Cognito Hosted UI is not configured yet. '
                                            'Use dev login when AUTH_DEV_BYPASS is on. See apps/mobile/README.md.',
                                          ),
                                        ),
                                      );
                                      return;
                                    }
                                    _run(session.signInWithOidc);
                                  },
                            child: const Text('Sign in with Cognito'),
                          ),
                          if (devBypass) ...[
                            const SizedBox(height: 16),
                            const Text(
                              'Local dev only (Nest AUTH_DEV_BYPASS)',
                              style: TextStyle(color: muted, fontSize: 12),
                            ),
                            const SizedBox(height: 8),
                            FilledButton(
                              key: const Key('dev-login-employee'),
                              onPressed: _busy ? null : () => _run(session.continueAsEmployee),
                              child: const Text('Continue as employee (Luis)'),
                            ),
                            const SizedBox(height: 8),
                            OutlinedButton(
                              key: const Key('dev-login-hr'),
                              onPressed: _busy ? null : () => _run(session.continueAsHrAdmin),
                              child: const Text('Continue as HR (Harper)'),
                            ),
                            const SizedBox(height: 8),
                            OutlinedButton(
                              key: const Key('dev-login-manager'),
                              onPressed: _busy ? null : () => _run(session.continueAsManager),
                              child: const Text('Continue as Manager (Maya)'),
                            ),
                          ] else ...[
                            const SizedBox(height: 12),
                            const Text(
                              'Production API — Cognito only. Dev tokens are disabled.',
                              style: TextStyle(color: muted, fontSize: 12),
                            ),
                          ],
                          if (_busy) ...[
                            const SizedBox(height: 16),
                            const Center(child: CircularProgressIndicator()),
                          ],
                          if (session.error != null) ...[
                            const SizedBox(height: 12),
                            Text(session.error!, style: const TextStyle(color: danger)),
                          ],
                          const SizedBox(height: 28),
                          const Text('API', style: TextStyle(color: muted, fontSize: 12)),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            children: [
                              ChoiceChip(
                                label: const Text('Local lab'),
                                selected: usingLocal,
                                onSelected: (_) => session.setApiBase(local),
                              ),
                              ChoiceChip(
                                label: const Text('Production'),
                                selected: session.apiBase == AppConfig.productionApiBase,
                                onSelected: (_) => session.setApiBase(AppConfig.productionApiBase),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            session.apiBase,
                            style: const TextStyle(color: muted, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}
