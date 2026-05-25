import 'package:flutter/material.dart';
import 'features/auth/screens/login_screen.dart';

void main() {
  runApp(const HallSyncApp());
}

class HallSyncApp extends StatelessWidget {
  const HallSyncApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HallSync',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1E3A8A)),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}
