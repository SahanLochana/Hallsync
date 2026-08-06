import 'package:flutter/material.dart';
import '../../../services/auth_service.dart';
import 'login_screen.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailFormKey = GlobalKey<FormState>();
  final _otpFormKey = GlobalKey<FormState>();
  final _passwordFormKey = GlobalKey<FormState>();

  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;
  bool _isLoading = false;

  int _currentStep = 0; // 0: Email, 1: OTP, 2: New Password
  String _verificationToken = '';

  static const Color primaryBlue = Color(0xFF1E5AA8);
  static const Color backgroundColor = Color(0xFFF4F7FB);
  static const Color cardColor = Colors.white;
  static const Color textDark = Color(0xFF1F2937);
  static const Color textLight = Color(0xFF6B7280);
  static const Color errorRed = Color(0xFFDC2626);
  static const Color successGreen = Color(0xFF10B981);

  InputDecoration _inputDecoration(String label, IconData icon, {Widget? suffixIcon}) {
    return InputDecoration(
      labelText: label,
      hintText: "Enter your $label",
      prefixIcon: Icon(icon, color: textLight),
      suffixIcon: suffixIcon,
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
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: errorRed),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    );
  }

  // Step 1: Verify Email and Send OTP
  Future<void> _handleVerifyEmail() async {
    if (_emailFormKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      final result = await AuthService().requestPasswordReset(_emailController.text);

      setState(() => _isLoading = false);

      if (result['success']) {
        setState(() => _currentStep = 1);
        _showSuccessMessage('OTP sent to your email');
      } else {
        _showErrorMessage(result['message']);
      }
    }
  }

  // Step 2: Verify OTP
  Future<void> _handleVerifyOTP() async {
    if (_otpFormKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      final result = await AuthService()
          .verifyOTP(_emailController.text, _otpController.text);

      setState(() => _isLoading = false);

      if (result['success']) {
        _verificationToken = result['token'] ?? '';
        setState(() => _currentStep = 2);
        _showSuccessMessage('OTP verified successfully');
      } else {
        _showErrorMessage(result['message']);
      }
    }
  }

  // Step 3: Reset Password
  Future<void> _handleResetPassword() async {
    if (_passwordFormKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      final result = await AuthService().resetPassword(
        _emailController.text,
        _verificationToken,
        _newPasswordController.text,
      );

      setState(() => _isLoading = false);

      if (result['success']) {
        if (mounted) {
          // Navigate to login screen and show notification
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const LoginScreen()),
          ).then((_) {
            // Show notification after navigation completes
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Password reset successful! Please login with your new password.'),
                backgroundColor: successGreen,
                duration: Duration(seconds: 4),
              ),
            );
          });
        }
      } else {
        _showErrorMessage(result['message']);
      }
    }
  }

  void _showErrorMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: errorRed,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _showSuccessMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: successGreen,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _goToPreviousStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    } else {
      // Clear any snackbars before navigating back
      ScaffoldMessenger.of(context).clearSnackBars();
      Navigator.pop(context);
    }
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
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Step Indicator
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildStepIndicator(0, 'Email'),
                        Container(
                          width: 30,
                          height: 2,
                          color: _currentStep > 0 ? primaryBlue : Color(0xFFE5E7EB),
                        ),
                        _buildStepIndicator(1, 'OTP'),
                        Container(
                          width: 30,
                          height: 2,
                          color: _currentStep > 1 ? primaryBlue : Color(0xFFE5E7EB),
                        ),
                        _buildStepIndicator(2, 'Password'),
                      ],
                    ),

                    const SizedBox(height: 28),

                    // Step Content
                    if (_currentStep == 0) _buildEmailStep(),
                    if (_currentStep == 1) _buildOTPStep(),
                    if (_currentStep == 2) _buildPasswordStep(),

                    const SizedBox(height: 24),

                    // Navigation Buttons
                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: ElevatedButton(
                        onPressed: _isLoading
                            ? null
                            : (_currentStep == 0
                                ? _handleVerifyEmail
                                : _currentStep == 1
                                    ? _handleVerifyOTP
                                    : _handleResetPassword),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryBlue,
                          disabledBackgroundColor: Colors.grey,
                          foregroundColor: Colors.white,
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
                                  valueColor:
                                      AlwaysStoppedAnimation<Color>(Colors.white),
                                  strokeWidth: 2,
                                ),
                              )
                            : Text(
                                _currentStep == 0
                                    ? 'Send OTP'
                                    : _currentStep == 1
                                        ? 'Verify OTP'
                                        : 'Reset Password',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),

                    const SizedBox(height: 14),

                    TextButton(
                      onPressed: _goToPreviousStep,
                      child: Text(
                        _currentStep == 0 ? 'Back to Login' : 'Back',
                        style: const TextStyle(
                          color: primaryBlue,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStepIndicator(int step, String label) {
    bool isActive = _currentStep == step;
    bool isCompleted = _currentStep > step;

    return Column(
      children: [
        Container(
          height: 40,
          width: 40,
          decoration: BoxDecoration(
            color: isActive || isCompleted ? primaryBlue : Color(0xFFE5E7EB),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Center(
            child: isCompleted
                ? const Icon(Icons.check, color: Colors.white, size: 20)
                : Text(
                    '${step + 1}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: isActive || isCompleted ? primaryBlue : textLight,
          ),
        ),
      ],
    );
  }

  Widget _buildEmailStep() {
    return Form(
      key: _emailFormKey,
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
              Icons.email_outlined,
              color: Colors.white,
              size: 42,
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            "Forgot Password",
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: textDark,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "Enter your email to reset your password.",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 15,
              color: textLight,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 28),
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            autovalidateMode: AutovalidateMode.onUserInteraction,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Email is required';
              }
              if (!RegExp(r'^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}$')
                  .hasMatch(value)) {
                return 'Enter a valid email';
              }
              return null;
            },
            decoration: _inputDecoration("email", Icons.email_outlined),
          ),
        ],
      ),
    );
  }

  Widget _buildOTPStep() {
    return Form(
      key: _otpFormKey,
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
              Icons.verified_user,
              color: Colors.white,
              size: 42,
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            "Verify OTP",
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: textDark,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "We sent an OTP to ${_emailController.text}",
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 15,
              color: textLight,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 28),
          TextFormField(
            controller: _otpController,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            maxLength: 6,
            autovalidateMode: AutovalidateMode.onUserInteraction,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'OTP is required';
              }
              if (value.length != 6) {
                return 'OTP must be 6 digits';
              }
              return null;
            },
            decoration: InputDecoration(
              labelText: 'OTP',
              hintText: '000000',
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
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: errorRed),
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 16,
              ),
            ),
          ),
          const SizedBox(height: 16),
          TextButton(
            onPressed: () {
              _emailController.clear();
              setState(() => _currentStep = 0);
            },
            child: const Text(
              "Didn't receive OTP? Change email",
              style: TextStyle(
                color: primaryBlue,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPasswordStep() {
    return Form(
      key: _passwordFormKey,
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
              Icons.lock_reset,
              color: Colors.white,
              size: 42,
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            "New Password",
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: textDark,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            "Enter a new password for your account.",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 15,
              color: textLight,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 28),
          TextFormField(
            controller: _newPasswordController,
            obscureText: _obscureNewPassword,
            autovalidateMode: AutovalidateMode.onUserInteraction,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Password is required';
              }
              if (value.length < 8) {
                return 'Password must be at least 8 characters';
              }
              return null;
            },
            decoration: _inputDecoration(
              'Password',
              Icons.lock_outline,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureNewPassword
                      ? Icons.visibility_off
                      : Icons.visibility,
                  color: textLight,
                ),
                onPressed: () {
                  setState(() {
                    _obscureNewPassword = !_obscureNewPassword;
                  });
                },
              ),
            ),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _confirmPasswordController,
            obscureText: _obscureConfirmPassword,
            autovalidateMode: AutovalidateMode.onUserInteraction,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please confirm your password';
              }
              if (value != _newPasswordController.text) {
                return 'Passwords do not match';
              }
              return null;
            },
            decoration: _inputDecoration(
              'Confirm Password',
              Icons.lock_outline,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureConfirmPassword
                      ? Icons.visibility_off
                      : Icons.visibility,
                  color: textLight,
                ),
                onPressed: () {
                  setState(() {
                    _obscureConfirmPassword = !_obscureConfirmPassword;
                  });
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }
}