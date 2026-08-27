import 'package:flutter/material.dart';

import 'session.dart';
import 'theme.dart';

/// Sign out plus full session reset for switching Cognito/dev personas.
class SessionSignOutActions extends StatelessWidget {
  const SessionSignOutActions({
    super.key,
    required this.session,
    this.signOutLabel = 'Sign out',
  });

  final SessionController session;
  final String signOutLabel;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisSize: MainAxisSize.min,
      children: [
        TextButton(
          onPressed: session.signOut,
          child: Text(signOutLabel, style: const TextStyle(color: ink)),
        ),
        TextButton(
          onPressed: session.signInAsDifferentAccount,
          child: const Text(
            'Sign in as different account',
            style: TextStyle(color: muted, fontSize: 12),
          ),
        ),
      ],
    );
  }
}
