import 'package:flutter/material.dart';
import 'package:http/http.dart' as http; // Added for network requests
import 'dart:convert'; // Added for JSON encoding/decoding
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'forgot_password_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController(); // Swapped from email
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _isLoading = false; // Tracks if the network request is running

  static const Color primaryBlue = Color(0xFF1E5AA8);
  static const Color backgroundColor = Color(0xFFF4F7FB);
  static const Color cardColor = Colors.white;
  static const Color textDark = Color(0xFF1F2937);
  static const Color textLight = Color(0xFF6B7280);

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      hintText: "Enter your ${label.toLowerCase()}",
      prefixIcon: Icon(icon, color: textLight),
      suffixIcon: label == "Password"
          ? IconButton(
              icon: Icon(
                _obscurePassword ? Icons.visibility_off : Icons.visibility,
                color: textLight,
              ),
              onPressed: () {
                setState(() {
                  _obscurePassword = !_obscurePassword;
                });
              },
            )
          : null,
      filled: true,
      fillColor: const Color(0xFFF9FAFB),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: primaryBlue, width: 1.5),
      ),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 16,
      ),
    );
  }

  // THE LOGIC TO CONNECT TO FASTAPI
Future<void> _handleLogin() async {
  if (!_formKey.currentState!.validate()) return;
  
  setState(() => _isLoading = true);
  
  // Choose the right URL depending on the platform
  String baseUrl = 'http://127.0.0.1:8000';
  if (!kIsWeb && Platform.isAndroid) {
    baseUrl = 'http://10.0.2.2:8000';
  }
  
  final url = Uri.parse('$baseUrl/api/v1/login');
  
  try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': _usernameController.text.trim(),
        'password': _passwordController.text,
      }),
    );

    setState(() => _isLoading = false);  // MOVE THIS HERE
    
    if (response.statusCode == 200) {
      final responseData = jsonDecode(response.body);
      String? token = responseData['token'];
      String? role = responseData['role'];
      
      if (!mounted) return;
      
      if (role?.toLowerCase() == 'admin') {
        Navigator.pushReplacementNamed(context, '/admin-dashboard');
      } else if (role?.toLowerCase() == 'lecturer') {
        Navigator.pushReplacementNamed(context, '/lecturer-dashboard');
      } else {
        Navigator.pushReplacementNamed(context, '/student-dashboard');
      }
    } else {
      // WRAP ERROR HANDLING IN TRY-CATCH
      try {
        final errorData = jsonDecode(response.body);
        _showSnackBar(errorData['detail'] ?? 'Invalid credentials', isError: true);
      } catch (parseError) {
        // If error parsing fails, show the actual response
        print(" Backend returned ${response.statusCode}: ${response.body}");
        _showSnackBar('Login failed (${response.statusCode})', isError: true);
      }
    }
  } catch (e) {
    setState(() => _isLoading = false);
    print(" Network Error: $e");
    _showSnackBar('Can not connect to HallSync Server: $e', isError: true);
  }
}

  void _showSnackBar(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Container(
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: cardColor,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        height: 88,
                        width: 88,
                        decoration: BoxDecoration(
                          color: primaryBlue,
                          borderRadius: BorderRadius.circular(22),
                        ),
                        child: const Icon(
                          Icons.school_rounded,
                          color: Colors.white,
                          size: 42,
                        ),
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        "HallSync",
                        style: TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.bold,
                          color: textDark,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        "Faculty Lecture & Schedule Management",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 15,
                          color: textLight,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Username Input Field
                      TextFormField(
                        controller: _usernameController,
                        keyboardType: TextInputType.text,
                        autovalidateMode: AutovalidateMode.onUserInteraction,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Username required';
                          }
                          return null;
                        },
                        decoration: _inputDecoration("Username", Icons.person_outline_rounded),
                      ),

                      const SizedBox(height: 18),

                      // Password Input Field
                      TextFormField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        autovalidateMode: AutovalidateMode.onUserInteraction,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Password required';
                          }
                          if (value.length < 6) {
                            return 'Password must be 6+ characters';
                          }
                          return null;
                        },
                        decoration: _inputDecoration("Password", Icons.lock_outline),
                      ),

                      const SizedBox(height: 14),

                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const ForgotPasswordScreen(),
                              ),
                            ).then((_) {
                              _usernameController.clear();
                              _passwordController.clear();
                              _showSnackBar("Please login with your new password");
                            });
                          },
                          child: const Text(
                            "Forgot Password?",
                            style: TextStyle(
                              color: primaryBlue,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Login Button
                      SizedBox(
                        width: double.infinity,
                        height: 54,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryBlue,
                            foregroundColor: Colors.white,
                            disabledBackgroundColor: primaryBlue.withOpacity(0.6),
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  height: 24,
                                  width: 24,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2.5,
                                  ),
                                )
                              : const Text(
                                  "Login",
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.3,
                                  ),
                                ),
                        ),
                      ),

                      const SizedBox(height: 20),

                      const Text(
                        "Welcome back! Please sign in to your account.",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: textLight,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}