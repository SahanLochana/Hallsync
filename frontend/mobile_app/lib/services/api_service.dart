import 'dart:convert';
import 'package:http/http.dart' as http;

/// Central place for talking to the FastAPI backend.
///
/// IMPORTANT — pick the right base URL for where you're running the app:
///   - Android emulator:  http://10.0.2.2:8000
///   - iOS simulator:     http://localhost:8000
///   - Real phone:        http://<your-laptop's-local-IP>:8000
///     (phone and laptop must be on the same Wi-Fi network; find your IP
///     with `ipconfig` on Windows and look for "IPv4 Address")
class ApiService {
  static const String baseUrl = 'http://10.0.2.2:8000';

  // Kept in memory for the app session. Fine for a capstone demo.
  static String? _authToken;

  static Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_authToken != null) 'Authorization': 'Bearer $_authToken',
      };

  // ---------- Auth ----------

  static Future<void> register({
    required String name,
    required String email,
    required String password,
    required String role, // "student" | "lecturer" | "admin"
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: _headers,
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'role': role,
      }),
    );
    if (response.statusCode != 200) {
      throw ApiException(_extractError(response));
    }
  }

  static Future<void> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (response.statusCode != 200) {
      throw ApiException(_extractError(response));
    }
    final data = jsonDecode(response.body);
    _authToken = data['access_token'];
  }

  static bool get isLoggedIn => _authToken != null;

  static void logout() {
    _authToken = null;
  }

  static Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final response = await http.put(
      Uri.parse('$baseUrl/auth/change-password'),
      headers: _headers,
      body: jsonEncode({
        'current_password': currentPassword,
        'new_password': newPassword,
      }),
    );
    if (response.statusCode != 200) {
      throw ApiException(_extractError(response));
    }
  }

  // ---------- Halls ----------

  static Future<List<Map<String, dynamic>>> fetchHalls() async {
    final response = await http.get(Uri.parse('$baseUrl/halls/'), headers: _headers);
    if (response.statusCode != 200) {
      throw ApiException(_extractError(response));
    }
    final List<dynamic> data = jsonDecode(response.body);
    return data.cast<Map<String, dynamic>>();
  }

  // ---------- Bookings ----------

  static Future<void> createBooking({
    required int hallId,
    required String date, // "YYYY-MM-DD"
    required String startTime, // "HH:MM:SS"
    required String endTime, // "HH:MM:SS"
    String? purpose,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/bookings/'),
      headers: _headers,
      body: jsonEncode({
        'hall_id': hallId,
        'date': date,
        'start_time': startTime,
        'end_time': endTime,
        'purpose': purpose,
      }),
    );
    if (response.statusCode == 409) {
      throw ApiException('This hall is already booked for that time slot.');
    }
    if (response.statusCode != 200) {
      throw ApiException(_extractError(response));
    }
  }

  static Future<List<Map<String, dynamic>>> fetchMyBookings() async {
    final response = await http.get(Uri.parse('$baseUrl/bookings/'), headers: _headers);
    if (response.statusCode != 200) {
      throw ApiException(_extractError(response));
    }
    final List<dynamic> data = jsonDecode(response.body);
    return data.cast<Map<String, dynamic>>();
  }

  // ---------- Timetable ----------

  static Future<List<Map<String, dynamic>>> fetchTimetable({int? hallId, String? batch}) async {
    final params = <String, String>{};
    if (hallId != null) params['hall_id'] = hallId.toString();
    if (batch != null) params['batch'] = batch;
    final uri = Uri.parse('$baseUrl/timetable/').replace(queryParameters: params.isEmpty ? null : params);
    final response = await http.get(uri, headers: _headers);
    if (response.statusCode != 200) {
      throw ApiException(_extractError(response));
    }
    final List<dynamic> data = jsonDecode(response.body);
    return data.cast<Map<String, dynamic>>();
  }

  static String _extractError(http.Response response) {
    try {
      final data = jsonDecode(response.body);
      return data['detail']?.toString() ?? 'Something went wrong (${response.statusCode})';
    } catch (_) {
      return 'Something went wrong (${response.statusCode})';
    }
  }
}

class ApiException implements Exception {
  final String message;
  ApiException(this.message);
  @override
  String toString() => message;
}
