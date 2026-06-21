import 'package:flutter/material.dart';
import 'features/auth/screens/login_screen.dart';

void main() {
  runApp(const HallSyncApp());
}

class HallSyncApp extends StatelessWidget {
  const HallSyncApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      title: "HallSync",
      home: const LoginScreen(),
    );
  }
}
