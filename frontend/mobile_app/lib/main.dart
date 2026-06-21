import 'package:flutter/material.dart';
import 'features/auth/screens/login_screen.dart';
import 'screens/student_dashboard.dart';
import 'screens/lecturer/lecturer_dashboard.dart';
import 'screens/campus_map_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await dotenv.load(fileName: ".env");

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
