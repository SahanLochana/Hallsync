import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
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
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: "HallSync",
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginScreen(),
        '/student-dashboard': (context) => const HomeScreen(),
        '/lecturer-dashboard': (context) => const LecturerDashboard(),
      },
    );
  }
}
