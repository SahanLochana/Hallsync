import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/report_model.dart';

class ReportService {
  static const String baseUrl = 'http://localhost:8000/api'; // Android Emulator usually uses 10.0.2.2 but keeping consistency with lecture_service.dart

  static Future<bool> createReport({
    required String title,
    required String description,
    String type = 'bug',
    String? userId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/reports'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'title': title,
          'description': description,
          'type': type,
          if (userId != null) 'user_id': userId,
        }),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }
}
