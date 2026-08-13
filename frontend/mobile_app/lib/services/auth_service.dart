import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:jwt_decoder/jwt_decoder.dart';

class AuthService {
  //use 10.0.2.2 rather than localhost for Android emulator. For iOS simulator, you can use localhost.
  static const String baseUrl = 'http://10.0.2.2:8000';
  static const _storage = FlutterSecureStorage();

  /// Logs in the user, decodes the returned JWT token, and saves credentials to secure storage.
  /// Returns a map with success, isFirstLogin, role, and optional message.
  static Future<Map<String, dynamic>> login(
      String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': username, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['status'] == 'success' && data['token'] != null) {
          final String token = data['token'];
          final bool isFirstLogin =
              data['isFirstLogin'] ?? data['is_first_login'] ?? false;

          // Decode JWT token using JwtDecoder
          final Map<String, dynamic> decodedToken = JwtDecoder.decode(token);

          final String role = decodedToken['role'] ?? '';
          final String email = decodedToken['email'] ?? '';
          final String name = decodedToken['sub'] ?? 'User';
          final String department = decodedToken['department'] ?? '';
          final String batch = decodedToken['batch'] ?? '';

          // Save token, role, and user info to FlutterSecureStorage
          await _storage.write(key: 'jwt_token', value: token);
          await _storage.write(key: 'user_role', value: role);
          await _storage.write(key: 'user_email', value: email);
          await _storage.write(key: 'user_name', value: name);
          await _storage.write(key: 'user_department', value: department);
          await _storage.write(key: 'user_batch', value: batch);

          return {
            'success': true,
            'isFirstLogin': isFirstLogin,
            'role': role,
            'token': token,
          };
        }
      }

      try {
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'message': errorData['detail'] ?? 'Invalid credentials',
        };
      } catch (_) {
        return {
          'success': false,
          'message': 'Login failed (${response.statusCode})',
        };
      }
    } catch (e) {
      print('Login error: $e');
      return {
        'success': false,
        'message': 'Cannot connect to HallSync Server',
      };
    }
  }

  /// Changes the user's password using the first-login or in-app change flow.
  static Future<Map<String, dynamic>> changePassword({
    required String identifier,
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/change-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'identifier': identifier,
          'current_password': currentPassword,
          'new_password': newPassword,
        }),
      );

      final decoded = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': decoded['message'] ?? 'Password updated successfully',
        };
      }

      return {
        'success': false,
        'message': decoded['detail'] ?? 'Failed to update password',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error occurred',
      };
    }
  }

  /// Clears stored authentication data.
  static Future<void> logout() async {
    await _storage.deleteAll();
  }

  /// Gets the stored JWT token.
  static Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }

  /// Gets the stored user role.
  static Future<String?> getRole() async {
    return await _storage.read(key: 'user_role');
  }

  /// Gets the stored user email.
  static Future<String?> getEmail() async {
    return await _storage.read(key: 'user_email');
  }

  /// Gets the stored user name.
  static Future<String?> getUsername() async {
    return await _storage.read(key: 'user_name');
  }

  /// Gets the stored user department.
  static Future<String?> getDepartment() async {
    return await _storage.read(key: 'user_department');
  }

  /// Gets the stored user batch.
  static Future<String?> getBatch() async {
    return await _storage.read(key: 'user_batch');
  }

  /// Requests a password reset OTP for the given email
  Future<Map<String, dynamic>> requestPasswordReset(String email) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/forgot-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );

      if (response.statusCode == 200) {
        return {'success': true, 'message': 'OTP sent to email'};
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['detail'] ?? 'Failed to send OTP',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error occurred'};
    }
  }

  /// Verifies the OTP sent to the user's email
  Future<Map<String, dynamic>> verifyOTP(String email, String otp) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'otp': otp}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'message': data['message'],
          'token': data['token'],
        };
      } else {
        final error = jsonDecode(response.body);
        return {'success': false, 'message': error['detail'] ?? 'Invalid OTP'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error occurred'};
    }
  }

  /// Resets the user's password using the verification token
  Future<Map<String, dynamic>> resetPassword(
    String email,
    String token,
    String newPassword,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/reset-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'token': token,
          'new_password': newPassword,
        }),
      );

      if (response.statusCode == 200) {
        return {'success': true, 'message': 'Password reset successfully'};
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['detail'] ?? 'Failed to reset password',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Network error occurred'};
    }
  }
}
