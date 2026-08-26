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

    return Scaffold(
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
                            'Day-1 access (lab) · Luis Reyes · same Nest API as the React portal',
                            style: TextStyle(color: muted, height: 1.4),
                          ),
                          const SizedBox(height: 24),
                          FilledButton(
                            key: const Key('dev-login'),
                            onPressed: _busy ? null : () => _run(session.continueAsEmployee),
                            child: const Text('Continue as employee'),
                          ),
                          const SizedBox(height: 10),
                          OutlinedButton(
                            onPressed: _busy
                                ? null
                                : () {
                                    if (!AppConfig.oidcConfigured) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text(
                                            'Cognito Hosted UI is not configured yet. '
                                            'Use Continue as employee (AUTH_DEV_BYPASS). See apps/mobile/README.md.',
                                          ),
                                        ),
                                      );
                                      return;
                                    }
                                    _run(session.signInWithOidc);
                                  },
                            child: const Text('Sign in with Cognito'),
                          ),
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
