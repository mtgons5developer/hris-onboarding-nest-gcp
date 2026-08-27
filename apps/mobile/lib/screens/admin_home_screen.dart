import 'package:flutter/material.dart';

import '../hris_client.dart';
import '../models.dart';
import '../session.dart';
import '../sign_out_actions.dart';
import '../theme.dart';
import 'admin_case_detail_screen.dart';

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key, required this.session});

  final SessionController session;

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  List<OnboardingCase>? _cases;
  String? _error;
  bool _loading = true;

  Me get _me => widget.session.me!;
  HrisClient get _api => widget.session.client;
  bool get _isManager => _me.role == 'manager';

  @override
  void initState() {
    super.initState();
    _reload();
  }

  Future<void> _reload() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final rows = await _api.listCases();
      if (!mounted) return;
      setState(() {
        _cases = rows;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      if (await widget.session.handleApiError(e)) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _reload,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Admin console · Day-1 access', style: TextStyle(color: muted, fontSize: 13)),
                        const SizedBox(height: 4),
                        Text(
                          _isManager ? 'My reports' : 'Onboarding cases',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${_me.displayName} · ${_me.role}',
                        style: const TextStyle(color: muted, fontSize: 12),
                      ),
                      SessionSignOutActions(session: widget.session),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                _isManager
                    ? 'Complete MANAGER_INTRO on each report\'s packet.'
                    : 'Hire → day-1 packet → approve & activate.',
                style: const TextStyle(color: muted, height: 1.4),
              ),
              if (_me.role == 'hr_admin') ...[
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Full Hire form lives in apps/web-admin. Use Harper there or POST /api/v1/employees.',
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.person_add_outlined, size: 18),
                  label: const Text('Hire (web admin)'),
                ),
              ],
              const SizedBox(height: 16),
              if (_loading && _cases == null)
                const Padding(
                  padding: EdgeInsets.all(32),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (_cases == null || _cases!.isEmpty)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(
                      _error ?? 'No onboarding cases yet.',
                      style: TextStyle(color: _error != null ? danger : muted),
                    ),
                  ),
                )
              else
                ..._cases!.map((c) => _CaseTile(
                      caseData: c,
                      onTap: () async {
                        await Navigator.of(context).push<void>(
                          MaterialPageRoute<void>(
                            builder: (_) => AdminCaseDetailScreen(
                              session: widget.session,
                              caseId: c.id,
                            ),
                          ),
                        );
                        await _reload();
                      },
                    )),
              if (_error != null && (_cases?.isNotEmpty ?? false)) ...[
                const SizedBox(height: 12),
                Text(_error!, style: const TextStyle(color: danger)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _CaseTile extends StatelessWidget {
  const _CaseTile({required this.caseData, required this.onTap});

  final OnboardingCase caseData;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      caseData.employeeFullName,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: muted),
                ],
              ),
              if (caseData.workEmail != null) ...[
                const SizedBox(height: 4),
                Text(caseData.workEmail!, style: const TextStyle(color: muted, fontSize: 13)),
              ],
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: [
                  _StatusBadge(caseData.status),
                  _StatusBadge(caseData.employeeStatus),
                  if (caseData.managerName != null)
                    Text('Mgr ${caseData.managerName}', style: const TextStyle(color: muted, fontSize: 12)),
                  if (caseData.department != null)
                    Text(caseData.department!, style: const TextStyle(color: muted, fontSize: 12)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge(this.label);
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFFE4EBF4),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label.replaceAll('_', ' '),
        style: const TextStyle(fontSize: 12),
      ),
    );
  }
}
