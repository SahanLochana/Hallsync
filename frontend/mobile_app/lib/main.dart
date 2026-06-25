import 'package:flutter/material.dart';
import 'package:mobile_app/features/auth/screens/change_password_screen.dart';
import 'package:mobile_app/features/auth/screens/login_screen.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobile_app/screens/campus_map_screen.dart';
import 'package:mobile_app/screens/student_dashboard.dart';
import 'package:mobile_app/screens/lecturer/lecturer_dashboard.dart';
import 'package:mobile_app/services/auth_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await dotenv.load(fileName: ".env"); 

  final token = await AuthService.getToken();
  final role = await AuthService.getRole();
  
  String initialRoute = '/';
  if (token != null && role != null) {
    if (role == 'lecturer') {
      initialRoute = '/lecturer-dashboard';
    } else if (role == 'student') {
      initialRoute = '/student-dashboard';
    }
  }

  runApp(HallSyncApp(initialRoute: initialRoute));
}

class HallSyncApp extends StatelessWidget {
  final String initialRoute;
  const HallSyncApp({super.key, required this.initialRoute});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: "HallSync",
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1E3A8A)),
        useMaterial3: true,
      ),
      initialRoute: initialRoute,
      routes: {
        '/': (context) => const LoginScreen(),
        '/student-dashboard': (context) => const HomeScreen(),
        '/lecturer-dashboard': (context) => const LecturerDashboard(),
      },
    );
  }
}
