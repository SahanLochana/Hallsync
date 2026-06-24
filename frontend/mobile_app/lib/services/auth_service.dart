import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  // Use the same base URL approach as in report_service.dart and lecture_service.dart
  static const String baseUrl = 'http://localhost:8000'; 

  /// Returns true if login is successful, false otherwise.
  static Future<bool> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'username': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['status'] == 'success') {
          // Save token, role, and email
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('jwt_token', data['token']);
          await prefs.setString('user_role', data['role']);
          await prefs.setString('user_email', data['email']);
          await prefs.setString('user_name', data['username'] ?? 'User');
          await prefs.setString('user_department', data['department'] ?? 'Unknown');
          await prefs.setString('user_batch', data['batch'] ?? 'Unknown');
          return true;
        }
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  /// Clears stored authentication data.
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    await prefs.remove('user_role');
    await prefs.remove('user_email');
    await prefs.remove('user_name');
    await prefs.remove('user_department');
    await prefs.remove('user_batch');
  }

  /// Gets the stored JWT token.
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  /// Gets the stored user role.
  static Future<String?> getRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_role');
  }

  /// Gets the stored user email.
  static Future<String?> getEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_email');
  }

  /// Gets the stored user name.
  static Future<String?> getUsername() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_name');
  }

  /// Gets the stored user department.
  static Future<String?> getDepartment() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_department');
  }

  /// Gets the stored user batch.
  static Future<String?> getBatch() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_batch');
  }

  /// Requests a password reset OTP for the given email
  Future<Map<String, dynamic>> requestPasswordReset(String email) async {
    // Dummy implementation for now
    await Future.delayed(const Duration(seconds: 1));
    return {'success': true, 'message': 'OTP sent to email'};
  }

  /// Verifies the OTP sent to the user's email
  Future<Map<String, dynamic>> verifyOTP(String email, String otp) async {
    // Dummy implementation for now
    await Future.delayed(const Duration(seconds: 1));
    if (otp == '123456') {
      return {'success': true, 'token': 'dummy_reset_token', 'message': 'OTP verified'};
    }
    return {'success': true, 'token': 'dummy_reset_token', 'message': 'OTP verified'}; // Always succeed for testing
  }

  /// Resets the user's password using the verification token
  Future<Map<String, dynamic>> resetPassword(String email, String token, String newPassword) async {
    // Dummy implementation for now
    await Future.delayed(const Duration(seconds: 1));
    return {'success': true, 'message': 'Password reset successful'};
  }
}
