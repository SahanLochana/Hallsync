import 'package:flutter/material.dart';
import 'package:mobile_app/features/auth/screens/change_password_screen.dart';
import 'package:mobile_app/features/auth/screens/login_screen.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobile_app/screens/campus_map_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await dotenv.load(fileName: ".env"); 

  runApp(const HallSyncApp());
}



class StudentApp extends StatelessWidget {
  const StudentApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: "HallSync",
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1E3A8A)),
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginScreen(),
        '/student-dashboard': (context) => const HomeScreen(),
        '/lecturer-dashboard': (context) => const LecturerDashboard(),
      },
    );
  }
}
