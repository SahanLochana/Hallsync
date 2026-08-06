class Report {
  final String id;
  final String title;
  final String description;
  final String type;
  final String? userId;
  final DateTime createdAt;

  Report({
    required this.id,
    required this.title,
    required this.description,
    this.type = 'bug',
    this.userId,
    required this.createdAt,
  });

  factory Report.fromJson(Map<String, dynamic> json) {
    return Report(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      type: json['type'] ?? 'bug',
      userId: json['user_id'],
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'type': type,
      'user_id': userId,
    };
  }
}
