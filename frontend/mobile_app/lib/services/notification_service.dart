import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/notification_model.dart';
import 'auth_service.dart';

class NotificationService {
  static const String baseUrl = 'http://localhost:8000/api';

  static Future<List<NotificationModel>> fetchNotifications(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications/$userId'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => NotificationModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load notifications: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching notifications: $e');
      return [];
    }
  }

  static Future<bool> markAsRead(String notificationId) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/notifications/$notificationId/read'),
      );
      
      return response.statusCode == 200;
    } catch (e) {
      print('Error marking notification as read: $e');
      return false;
    }
  }
}
