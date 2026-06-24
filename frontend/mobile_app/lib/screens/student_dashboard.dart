import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/lecture_model.dart';
import '../models/announcement_model.dart';
import '../widgets/announcement_card.dart';
import '../widgets/bottom_nav_bar.dart';
import '../widgets/lecture_card.dart';
import '../widgets/section_header.dart';
import 'send_report_screen.dart' as send_report_screen;


class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Lecture> _lectures = [
    Lecture(
      title: 'Advanced Mathematics',
      subject: 'Mathematics',
      venue: 'Mini Auditorium',
      date: DateTime.now(),
      startTime: const TimeOfDay(hour: 8, minute: 0),
      endTime: const TimeOfDay(hour: 10, minute: 0),
      description: '',
      tags: [],
    ),
    Lecture(
      title: 'IT Auditing',
      subject: 'Information Technology',
      venue: 'New Lecture Hall',
      date: DateTime.now(),
      startTime: const TimeOfDay(hour: 8, minute: 0),
      endTime: const TimeOfDay(hour: 10, minute: 0),
      description: '',
      tags: [],
    ),
    Lecture(
      title: 'Structured Programming',
      subject: 'Computer Science',
      venue: 'Computing Lab',
      date: DateTime.now(),
      startTime: const TimeOfDay(hour: 8, minute: 0),
      endTime: const TimeOfDay(hour: 10, minute: 0),
      description: '',
      tags: [],
    ),
  ];

  final List<AnnouncementModel> _announcements = const [
    AnnouncementModel(
      sender: 'University Admin',
      time: '2h ago',
      message:
          'The central library will be closed this weekend for annual maintenance. Digital...',
      accentColor: AppColors.primaryBlue,
    ),
    AnnouncementModel(
      sender: 'Faculty Office',
      time: '5h ago',
      message:
          'End-of-term project submission deadline extended to Friday, Nov 3rd at 23:59.',
      accentColor: AppColors.orangeAccent,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgColor,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 24),
                    _buildHeader(),
                    const SizedBox(height: 28),
                    SectionHeader(
                      title: "Today's Lectures",
                      onActionTap: () {},
                    ),
                    const SizedBox(height: 12),
                    if (_lectures.isEmpty)
                      _buildEmptyLectures()
                    else
                      ..._lectures.map((l) => LectureCard(lecture: l)),
                    const SizedBox(height: 28),
                    SectionHeader(title: 'Announcements', onActionTap: () {}),
                    const SizedBox(height: 12),
                    ..._announcements.map(
                      (a) => AnnouncementCard(announcement: a),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
            BottomNavBar(
              selectedIndex: _selectedIndex,
              onItemTapped: (index) => setState(() => _selectedIndex = index),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const send_report_screen.SendReportScreen()),
          );
        },
        backgroundColor: AppColors.primaryBlue,
        child: const Icon(Icons.report_problem_outlined, color: Colors.white),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Text(
                  'Good Morning, Saru',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryBlue,
                  ),
                ),
                Text('👋', style: TextStyle(fontSize: 22)),
              ],
            ),
            const SizedBox(height: 4),
            const Text(
              'Monday, 23 October',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textGrey,
                fontWeight: FontWeight.w400,
              ),
            ),
          ],
        ),
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: AppColors.cardWhite,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: const Icon(
            Icons.notifications_outlined,
            color: AppColors.textDark,
            size: 22,
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyLectures() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 32),
        child: Column(
          children: const [
            Icon(Icons.menu_book_outlined, size: 48, color: Color(0xFFBDBDBD)),
            SizedBox(height: 12),
            Text(
              'No lectures today',
              style: TextStyle(color: Color(0xFF9E9E9E), fontSize: 15),
            ),
          ],
        ),
      ),
    );
  }
}
