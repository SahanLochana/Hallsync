import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/announcement_model.dart';
import '../models/lecture_model.dart';
import '../widgets/announcement_card.dart';
import '../widgets/bottom_nav_bar.dart';
import '../widgets/lecture_card.dart';
import '../widgets/section_header.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<LectureModel> _lectures = const [
    LectureModel(
      title: 'Advanced Mathematics',
      time: '08:00 AM - 10:00 AM',
      location: 'Mini Auditorium',
    ),
    LectureModel(
      title: 'IT Auditing',
      time: '08:00 AM - 10:00 AM',
      location: 'New Lecture Hall',
    ),
    LectureModel(
      title: 'Structured Programming',
      time: '08:00 AM - 10:00 AM',
      location: 'Computing Lab',
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
}
