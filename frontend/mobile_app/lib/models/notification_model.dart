class NotificationModel {
  final String id;
  final String recipientUserId;
  final String title;
  final String message;
  final String? relatedLectureId;
  final bool isRead;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.recipientUserId,
    required this.title,
    required this.message,
    this.relatedLectureId,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['_id'] ?? json['id'] ?? '',
      recipientUserId: json['recipient_user_id'] ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      relatedLectureId: json['related_lecture_id'],
      isRead: json['is_read'] ?? false,
      createdAt: json['created_at'] != null 
          ? DateTime.parse('${json['created_at']}Z').toLocal()
          : DateTime.now(),
    );
  }
}
