import 'package:flutter/material.dart';
import 'features/hall_booking/screens/hall_booking_screen.dart';

void main() {
  runApp(const HallSyncApp());
}

class HallSyncApp extends StatelessWidget {
  const HallSyncApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: "HallSync",
      home: const HallBookingScreen(),
      // Uncomment the line below to use login screen
      // home: const LoginScreen(),
    );
  }
}
