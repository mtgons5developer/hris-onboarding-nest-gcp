import 'package:flutter/material.dart';

import '../document_view.dart';
import '../hris_client.dart';
import '../models.dart';
import '../session.dart';
import '../sign_out_actions.dart';
import '../theme.dart';

const _taskRoleOrder = ['employee', 'manager', 'hr'];
const _taskRoleLabels = {
  'employee': 'Employee (new hire)',
  'manager': 'Manager',
  'hr': 'HR',
};

class AdminCaseDetailScreen extends StatefulWidget {
  const AdminCaseDetailScreen({
    super.key,
    required this.session,
    required this.caseId,
  });

  final SessionController session;
  final String caseId;

  @override
  State<AdminCaseDetailScreen> createState() => _AdminCaseDetailScreenState();
}

class _AdminCaseDetailScreenState extends State<AdminCaseDetailScreen> {
  OnboardingCase? _case;
  String? _error;
  bool _loading = true;
  bool _busy = false;

  Me get _me => widget.session.me!;
  HrisClient get _api => widget.session.client;
  bool get _isHr => _me.role == 'hr_admin';
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
      final c = await _api.getCase(widget.caseId);
      if (!mounted) return;
      setState(() {
        _case = c;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      if (await widget.session.handleApiError(e)) {
        if (mounted) Navigator.of(context).pop();
        return;
      }
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _run(Future<void> Function() action) async {
    setState(() {
      _error = null;
      _busy = true;
    });
    try {
      await action();
      await _reload();
    } catch (e) {
      if (!mounted) return;
      if (await widget.session.handleApiError(e)) {
        if (mounted) Navigator.of(context).popUntil((r) => r.isFirst);
        return;
      }
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _viewDoc(String docId) async {
    setState(() {
      _error = null;
      _busy = true;
    });
    try {
      final downloadUrl = await _api.getDocumentDownloadUrl(docId);
      if (!mounted) return;
      await openDocument(context: context, client: _api, downloadUrl: downloadUrl);
    } catch (e) {
      if (!mounted) return;
      if (await widget.session.handleApiError(e)) {
        if (mounted) Navigator.of(context).popUntil((r) => r.isFirst);
        return;
      }
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String _formatDay(String? iso) {
    if (iso == null || iso.isEmpty) return '—';
    final day = iso.length >= 10 ? iso.substring(0, 10) : iso;
    if (RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(day)) return day;
    return day;
  }

  String _portalForRole(String? role) {
    if (role == 'hr_admin' || role == 'manager' || role == 'system_admin') {
      return 'Admin console';
    }
    return 'Onboarding portal';
  }

  @override
  Widget build(BuildContext context) {
    if (_loading && _case == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Case')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final c = _case;
    if (c == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Case')),
        body: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(_error ?? 'Case not found.', style: const TextStyle(color: danger)),
        ),
      );
    }

    final linkedRole = c.linkedRole ?? 'employee';

    return Scaffold(
      appBar: AppBar(title: Text(c.employeeFullName)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
          children: [
            Text(
              '${c.workEmail ?? ''} · ${c.offerTitle ?? c.department ?? 'Hire'}',
              style: const TextStyle(color: muted),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                _StatusBadge(c.status),
                _StatusBadge(c.day1Label),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(99),
              child: LinearProgressIndicator(
                value: c.taskPercent / 100,
                minHeight: 8,
                backgroundColor: line,
                color: accent,
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Access ready', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 12),
                    _AccessRow(label: 'Role', value: linkedRole),
                    _AccessRow(label: 'IdP subject', value: c.idpLabel),
                    _AccessRow(label: 'Portal', value: _portalForRole(linkedRole)),
                    if (c.managerName != null) _AccessRow(label: 'Manager', value: c.managerName!),
                    _AccessRow(label: 'Start date', value: _formatDay(c.startDate)),
                    const SizedBox(height: 8),
                    const Text(
                      'Cognito group maps to this role. Harper activates the hire from this case.',
                      style: TextStyle(color: muted, fontSize: 12, height: 1.4),
                    ),
                  ],
                ),
              ),
            ),
            if (_isHr) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  OutlinedButton(
                    onPressed: _busy ? null : () => _run(() => _api.caseAction(c.id, 'invite')),
                    child: const Text('Send invite'),
                  ),
                  FilledButton(
                    key: const Key('approve-case'),
                    onPressed: _busy ? null : () => _run(() => _api.caseAction(c.id, 'approve')),
                    child: const Text('Approve & activate'),
                  ),
                  OutlinedButton(
                    onPressed: _busy ? null : () => _run(() => _api.caseAction(c.id, 'return')),
                    child: const Text('Return to employee'),
                  ),
                ],
              ),
            ],
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: const TextStyle(color: danger)),
            ],
            for (final role in _taskRoleOrder)
              if (c.tasksForRole(role).isNotEmpty) ...[
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(top: 12, bottom: 4),
                          child: Text(
                            _taskRoleLabels[role] ?? role,
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ),
                        const Text(
                          'Day-1 checklist',
                          style: TextStyle(color: muted, fontSize: 11, letterSpacing: 0.4),
                        ),
                        for (var i = 0; i < c.tasksForRole(role).length; i++) ...[
                          if (i > 0) const Divider(height: 1, color: line),
                          _TaskRow(
                            task: c.tasksForRole(role)[i],
                            canComplete: _isManager &&
                                c.tasksForRole(role)[i].assigneeRole == 'manager' &&
                                c.tasksForRole(role)[i].canAct,
                            onComplete: () => _run(
                              () => _api.completeTask(c.tasksForRole(role)[i].id),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            if (c.documents.isNotEmpty || _isHr) ...[
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Documents', style: Theme.of(context).textTheme.titleMedium),
                      if (c.documents.isEmpty)
                        const Padding(
                          padding: EdgeInsets.only(top: 8),
                          child: Text('No uploads yet.', style: TextStyle(color: muted)),
                        ),
                      for (final d in c.documents) ...[
                        const SizedBox(height: 12),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(child: Text(d.originalFilename)),
                            _StatusBadge(d.reviewStatus),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: [
                            OutlinedButton(
                              onPressed: _busy ? null : () => _viewDoc(d.id),
                              child: const Text('View'),
                            ),
                            if (_isHr) ...[
                              OutlinedButton(
                                onPressed: _busy
                                    ? null
                                    : () => _run(() => _api.reviewDocument(d.id, 'approved')),
                                child: const Text('Approve file'),
                              ),
                              OutlinedButton(
                                onPressed: _busy
                                    ? null
                                    : () => _run(() => _api.reviewDocument(d.id, 'rejected')),
                                child: const Text('Reject file'),
                              ),
                              OutlinedButton(
                                onPressed: _busy
                                    ? null
                                    : () => _run(() => _api.deleteDocument(d.id)),
                                child: const Text('Delete'),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 24),
            Align(
              alignment: Alignment.centerRight,
              child: SessionSignOutActions(session: widget.session),
            ),
          ],
        ),
      ),
    );
  }
}

class _AccessRow extends StatelessWidget {
  const _AccessRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: muted, fontSize: 12)),
          const SizedBox(height: 2),
          Text(value),
        ],
      ),
    );
  }
}

class _TaskRow extends StatelessWidget {
  const _TaskRow({
    required this.task,
    required this.canComplete,
    required this.onComplete,
  });

  final OnboardingTask task;
  final bool canComplete;
  final VoidCallback onComplete;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(task.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(task.code, style: const TextStyle(color: muted, fontSize: 12)),
              ],
            ),
          ),
          if (canComplete)
            OutlinedButton(
              key: Key('complete-${task.code}'),
              onPressed: onComplete,
              style: OutlinedButton.styleFrom(minimumSize: const Size(0, 40)),
              child: const Text('Mark done'),
            )
          else
            _StatusBadge(task.status),
        ],
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
