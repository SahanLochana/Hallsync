import 'dart:convert';
import 'package:http/http.dart' as http;

class LectureService {
  static const String baseUrl =
      'http://localhost:8000'; // Android Emulator

  // Returns the lecture_id if successful, null otherwise
  static Future<String?> createLecture({
    required String title,
    required String description,
    required String lecturerId,
    required String hallId,
    required DateTime startTime,
    required DateTime endTime,
    required int capacity,
    bool overwrite = false,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/lectures'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'title': title,
        'description': description,
        'lecturer_id': lecturerId,
        'hall_id': hallId,
        'start_time': startTime.toIso8601String(),
        'end_time': endTime.toIso8601String(),
        'capacity': capacity,
        'overwrite': overwrite,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return data['lecture_id'];
    }
    return null;
  }

  static Future<List<dynamic>> getLectures() async {
    final response = await http.get(Uri.parse('$baseUrl/lectures'));

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load lectures');
    }
  }

  static Future<Map<String, dynamic>> checkAvailability({
    required String hallId,
    required DateTime startTime,
    required DateTime endTime,
    String? excludeLectureId,
  }) async {
    try {
      final body = {
        'hall_id': hallId,
        'start_time': startTime.toIso8601String(),
        'end_time': endTime.toIso8601String(),
      };
      
      if (excludeLectureId != null && excludeLectureId.isNotEmpty) {
        body['exclude_lecture_id'] = excludeLectureId;
      }

      final response = await http.post(
        Uri.parse('$baseUrl/lectures/check-availability'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'available': data['available'] == true,
          'can_overwrite': data['can_overwrite'] == true,
        };
      }
      return {'available': false, 'can_overwrite': false};
    } catch (e) {
      return {'available': false, 'can_overwrite': false}; // Fail safe
    }
  }

  static Future<bool> updateLecture({
    required String lectureId,
    required String title,
    required String description,
    required String lecturerId,
    required String hallId,
    required DateTime startTime,
    required DateTime endTime,
    required int capacity,
  }) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/lectures/$lectureId'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'title': title,
          'description': description,
          'lecturer_id': lecturerId,
          'hall_id': hallId,
          'start_time': startTime.toIso8601String(),
          'end_time': endTime.toIso8601String(),
          'capacity': capacity,
        }),
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  static Future<bool> deleteLecture(String lectureId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/lectures/$lectureId'),
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}