class Me {
  const Me({
    required this.id,
    required this.email,
    required this.displayName,
    required this.role,
    this.idpSub,
  });

  final String id;
  final String email;
  final String displayName;
  final String role;
  final String? idpSub;

  factory Me.fromJson(Map<String, dynamic> json) {
    return Me(
      id: json['id'] as String,
      email: json['email'] as String,
      displayName: json['displayName'] as String,
      role: json['role'] as String,
      idpSub: json['idpSub'] as String?,
    );
  }

  String get firstName => displayName.split(' ').first;

  bool get isEmployee => role == 'employee';

  bool get isAdmin =>
      role == 'hr_admin' || role == 'manager' || role == 'system_admin';

  String get portalLabel => isAdmin ? 'Admin console' : 'Onboarding portal';
}

class CaseDocument {
  const CaseDocument({
    required this.id,
    required this.originalFilename,
    required this.reviewStatus,
    this.taskId,
  });

  final String id;
  final String originalFilename;
  final String reviewStatus;
  final String? taskId;

  factory CaseDocument.fromJson(Map<String, dynamic> json) {
    return CaseDocument(
      id: json['id'] as String,
      originalFilename: json['originalFilename'] as String,
      reviewStatus: json['reviewStatus'] as String,
      taskId: json['taskId'] as String?,
    );
  }
}

class PersonName {
  const PersonName({required this.firstName, required this.lastName});

  final String firstName;
  final String lastName;

  String get full => '$firstName $lastName';

  factory PersonName.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const PersonName(firstName: '', lastName: '');
    return PersonName(
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
    );
  }
}

class OnboardingTask {
  const OnboardingTask({
    required this.id,
    required this.code,
    required this.title,
    required this.status,
    required this.assigneeRole,
  });

  final String id;
  final String code;
  final String title;
  final String status;
  final String assigneeRole;

  bool get isEmployee => assigneeRole == 'employee';
  bool get canAct => status == 'pending' || status == 'rejected';
  bool get isIdDoc => code == 'ID_DOC';

  factory OnboardingTask.fromJson(Map<String, dynamic> json) {
    return OnboardingTask(
      id: json['id'] as String,
      code: json['code'] as String,
      title: json['title'] as String,
      status: json['status'] as String,
      assigneeRole: json['assigneeRole'] as String,
    );
  }
}

class OnboardingCase {
  const OnboardingCase({
    required this.id,
    required this.status,
    required this.employeeFirstName,
    required this.employeeLastName,
    required this.employeeStatus,
    required this.tasks,
    this.managerName,
    this.idpSub,
    this.linkedRole,
    this.workEmail,
    this.department,
    this.startDate,
    this.offerTitle,
    this.documents = const [],
  });

  final String id;
  final String status;
  final String employeeFirstName;
  final String employeeLastName;
  final String employeeStatus;
  final String? managerName;
  final String? idpSub;
  final String? linkedRole;
  final String? workEmail;
  final String? department;
  final String? startDate;
  final String? offerTitle;
  final List<CaseDocument> documents;
  final List<OnboardingTask> tasks;

  List<OnboardingTask> get mine => tasks.where((t) => t.isEmployee).toList();

  List<OnboardingTask> get waitingOnOthers =>
      tasks.where((t) => !t.isEmployee).toList();

  int get doneCount =>
      mine.where((t) => t.status == 'done' || t.status == 'waived').length;

  int get percent {
    if (mine.isEmpty) return 0;
    return ((doneCount / mine.length) * 100).round();
  }

  String get day1Label {
    if (employeeStatus == 'active' && status == 'completed') {
      return 'Active — day 1 complete';
    }
    if (employeeStatus == 'active') return 'Active';
    return 'Day 1 packet';
  }

  String get idpLabel {
    final sub = idpSub;
    if (sub == null || sub.isEmpty || sub.startsWith('pending-')) return 'Not linked';
    return sub;
  }

  String get employeeFullName => '$employeeFirstName $employeeLastName'.trim();

  int get doneTaskCount =>
      tasks.where((t) => t.status == 'done' || t.status == 'waived').length;

  int get taskPercent {
    if (tasks.isEmpty) return 0;
    return ((doneTaskCount / tasks.length) * 100).round();
  }

  List<OnboardingTask> tasksForRole(String role) =>
      tasks.where((t) => t.assigneeRole == role).toList();

  factory OnboardingCase.fromJson(Map<String, dynamic> json) {
    final employee = json['employee'] as Map<String, dynamic>? ?? {};
    final user = employee['user'] as Map<String, dynamic>?;
    final manager = PersonName.fromJson(employee['manager'] as Map<String, dynamic>?);
    final offer = json['offer'] as Map<String, dynamic>?;
    final rawTasks = json['tasks'] as List<dynamic>? ?? [];
    final rawDocs = json['documents'] as List<dynamic>? ?? [];
    final hiredAt = employee['hiredAt'] as String?;
    final offerStart = offer?['startDate'] as String?;
    return OnboardingCase(
      id: json['id'] as String,
      status: json['status'] as String,
      employeeFirstName: employee['firstName'] as String? ?? '',
      employeeLastName: employee['lastName'] as String? ?? '',
      employeeStatus: employee['status'] as String? ?? '',
      workEmail: employee['workEmail'] as String?,
      department: employee['department'] as String?,
      managerName: manager.firstName.isEmpty ? null : manager.full,
      idpSub: user?['idpSub'] as String?,
      linkedRole: user?['role'] as String?,
      startDate: offerStart ?? hiredAt,
      offerTitle: offer?['title'] as String?,
      documents: rawDocs
          .map((d) => CaseDocument.fromJson(d as Map<String, dynamic>))
          .toList(),
      tasks: rawTasks
          .map((t) => OnboardingTask.fromJson(t as Map<String, dynamic>))
          .toList(),
    );
  }
}
