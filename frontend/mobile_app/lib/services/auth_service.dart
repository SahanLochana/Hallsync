import 'package:http/http.dart' as http;
import 'dart:convert';

class AuthService {
  static const String baseURL = 'http://localhost:8000'; // Update with your backend URL

  /// Request password reset - sends OTP to email
  Future<Map<String, dynamic>> requestPasswordReset(String email) async {
    try {
      final response = await http.post(
        Uri.parse('$baseURL/api/auth/forgot-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': 'OTP sent to your email',
          'data': jsonDecode(response.body),
        };
      } else {
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'message': errorData['message'] ?? 'Failed to send OTP',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }

  /// Verify OTP
  Future<Map<String, dynamic>> verifyOTP(String email, String otp) async {
    try {
      final response = await http.post(
        Uri.parse('$baseURL/api/auth/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'otp': otp}),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'message': 'OTP verified successfully',
          'token': data['token'], // Token to use for password reset
        };
      } else {
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'message': errorData['message'] ?? 'Invalid OTP',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }

  /// Reset password with verified token
  Future<Map<String, dynamic>> resetPassword(
    String email,
    String token,
    String newPassword,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseURL/api/auth/reset-password'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'email': email,
          'new_password': newPassword,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': 'Password reset successfully',
        };
      } else {
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'message': errorData['message'] ?? 'Failed to reset password',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }
}
