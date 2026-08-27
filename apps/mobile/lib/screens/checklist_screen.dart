import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../document_view.dart';
import '../hris_client.dart';
import '../models.dart';
import '../session.dart';
import '../sign_out_actions.dart';
import '../theme.dart';

class ChecklistScreen extends StatefulWidget {
  const ChecklistScreen({super.key, required this.session});

  final SessionController session;

  @override
  State<ChecklistScreen> createState() => _ChecklistScreenState();
}

class _ChecklistScreenState extends State<ChecklistScreen> {
  OnboardingCase? _case;
  String? _error;
  bool _loading = true;

  HrisClient get _api => widget.session.client;

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
      final next = await _api.firstCase();
      if (!mounted) return;
      setState(() {
        _case = next;
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

  Future<void> _run(Future<void> Function() action) async {
    setState(() => _error = null);
    try {
      await action();
      await _reload();
    } catch (e) {
      if (!mounted) return;
      if (await widget.session.handleApiError(e)) return;
      setState(() => _error = e.toString());
    }
  }

  Future<void> _uploadId(OnboardingTask task) async {
    final c = _case;
    if (c == null) return;
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked == null) return;
    final bytes = await picked.readAsBytes();
    final name = picked.name.isNotEmpty ? picked.name : 'id-document.jpg';
    final type = picked.mimeType ?? 'image/jpeg';
    await _run(
      () => _api.uploadId(
        caseId: c.id,
        taskId: task.id,
        filename: name,
        contentType: type,
        bytes: bytes,
      ),
    );
  }

  Future<void> _deleteDoc(String docId) async {
    await _run(() => _api.deleteDocument(docId));
  }

  Future<void> _viewDoc(String docId) async {
    await _run(() async {
      final downloadUrl = await _api.getDocumentDownloadUrl(docId);
      if (!mounted) return;
      await openDocument(context: context, client: _api, downloadUrl: downloadUrl);
    });
  }

  @override
  Widget build(BuildContext context) {
    final me = widget.session.me!;
    if (_loading && _case == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final c = _case;
    if (c == null) {
      return Scaffold(
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('No onboarding case assigned yet.'),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: const TextStyle(color: danger)),
                ],
                const Spacer(),
                OutlinedButton(
                  onPressed: widget.session.signOut,
                  child: const Text('Sign out'),
                ),
                TextButton(
                  onPressed: widget.session.signInAsDifferentAccount,
                  child: const Text('Sign in as different account'),
                ),
              ],
            ),
          ),
        ),
      );
    }

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
                        const Text('Onboarding portal · Day-1 access', style: TextStyle(color: muted, fontSize: 13)),
                        const SizedBox(height: 4),
                        Text(
                          'Hi ${c.employeeFirstName}, ${c.percent}% complete',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      _Badge(c.status),
                      const SizedBox(height: 4),
                      _Badge(c.day1Label),
                      SessionSignOutActions(
                        session: widget.session,
                        signOutLabel: 'Sign out ${me.firstName}',
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(99),
                child: LinearProgressIndicator(
                  value: c.percent / 100,
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
                      _AccessRow(label: 'Role', value: c.linkedRole ?? me.role),
                      _AccessRow(label: 'IdP subject', value: c.idpLabel),
                      const _AccessRow(label: 'Portal', value: 'Onboarding portal'),
                      if (c.managerName != null) _AccessRow(label: 'Manager', value: c.managerName!),
                    ],
                  ),
                ),
              ),
              if (c.status == 'invited') ...[
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text('Your invite is ready. Accept to start the checklist.'),
                        const SizedBox(height: 12),
                        FilledButton(
                          onPressed: () => _run(() => _api.accept(c.id)),
                          child: const Text('Accept invite'),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(
                        padding: EdgeInsets.only(top: 12, bottom: 4),
                        child: Text(
                          'YOUR CHECKLIST · EMPLOYEE',
                          style: TextStyle(color: muted, fontSize: 11, letterSpacing: 0.4),
                        ),
                      ),
                      for (var i = 0; i < c.mine.length; i++) ...[
                        if (i > 0) const Divider(height: 1, color: line),
                        Builder(
                          builder: (context) {
                            final task = c.mine[i];
                            final docs = c.documents.where((d) => d.taskId == task.id).toList();
                            return _TaskRow(
                              task: task,
                              document: docs.isEmpty ? null : docs.last,
                              onComplete: () => _run(() => _api.completeTask(task.id)),
                              onUpload: () => _uploadId(task),
                              onDelete: (docId) => _deleteDoc(docId),
                              onView: (docId) => _viewDoc(docId),
                            );
                          },
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              if (c.waitingOnOthers.isNotEmpty) ...[
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Padding(
                          padding: EdgeInsets.only(top: 12, bottom: 4),
                          child: Text(
                            'WAITING ON OTHERS',
                            style: TextStyle(color: muted, fontSize: 11, letterSpacing: 0.4),
                          ),
                        ),
                        for (var i = 0; i < c.waitingOnOthers.length; i++) ...[
                          if (i > 0) const Divider(height: 1, color: line),
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        c.waitingOnOthers[i].title,
                                        style: const TextStyle(fontWeight: FontWeight.w600),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        c.waitingOnOthers[i].assigneeRole == 'manager' && c.managerName != null
                                            ? 'manager · ${c.managerName}'
                                            : c.waitingOnOthers[i].assigneeRole,
                                        style: const TextStyle(color: muted, fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                                _Badge(c.waitingOnOthers[i].status),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!, style: const TextStyle(color: danger)),
              ],
              const SizedBox(height: 20),
              FilledButton(
                key: const Key('submit-hr'),
                onPressed: c.status == 'in_progress' ? () => _run(() => _api.submit(c.id)) : null,
                child: const Text('Submit for HR review'),
              ),
            ],
          ),
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
    required this.onComplete,
    required this.onUpload,
    required this.onDelete,
    required this.onView,
    this.document,
  });

  final OnboardingTask task;
  final CaseDocument? document;
  final VoidCallback onComplete;
  final VoidCallback onUpload;
  final void Function(String docId) onDelete;
  final void Function(String docId) onView;

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
                if (task.isIdDoc && document != null) ...[
                  const SizedBox(height: 2),
                  Text(document!.originalFilename, style: const TextStyle(color: muted, fontSize: 12)),
                ],
              ],
            ),
          ),
          if (task.isIdDoc && document != null)
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                OutlinedButton(
                  key: const Key('view-id'),
                  onPressed: () => onView(document!.id),
                  style: OutlinedButton.styleFrom(minimumSize: const Size(0, 40)),
                  child: const Text('View'),
                ),
                const SizedBox(width: 8),
                OutlinedButton(
                  key: const Key('delete-id'),
                  onPressed: () => onDelete(document!.id),
                  style: OutlinedButton.styleFrom(minimumSize: const Size(0, 40)),
                  child: const Text('Delete'),
                ),
              ],
            )
          else if (task.canAct)
            task.isIdDoc
                ? OutlinedButton(
                    key: const Key('upload-id'),
                    onPressed: onUpload,
                    style: OutlinedButton.styleFrom(minimumSize: const Size(0, 40)),
                    child: const Text('Upload ID'),
                  )
                : FilledButton(
                    key: Key('complete-${task.code}'),
                    onPressed: onComplete,
                    style: FilledButton.styleFrom(minimumSize: const Size(0, 40)),
                    child: const Text('Mark done'),
                  )
          else
            _Badge(task.status),
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge(this.label);
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
