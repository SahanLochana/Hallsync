import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/lecture_model.dart';
import '../models/announcement_model.dart';
import '../widgets/announcement_card.dart';
import '../widgets/bottom_nav_bar.dart';
import '../widgets/lecture_card.dart';
import '../widgets/section_header.dart';
import 'send_report_screen.dart' as send_report_screen;
import '../services/auth_service.dart';
import '../services/lecture_service.dart';
import 'settings_screen.dart';
import 'notifications_screen.dart';
import 'halls_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  List<Lecture> _lectures = [];
  bool _isLoading = true;
  String _userName = '';

  @override
  void initState() {
    super.initState();
    _loadUserDetails();
  }

  Future<void> _loadUserDetails() async {
    final name = await AuthService.getUsername();
    if (mounted) {
      setState(() {
        _userName = name ?? 'Student';
      });
    }
    _fetchLectures();
  }

  Future<void> _fetchLectures() async {
   
    try {
      // අපි තාවකාලිකව department සහ batch filter කරන එක අයින් කරමු
      // එතකොට ඔක්කොම lectures ටික ළමයාට එන්න ඕනේ
      final data = await LectureService.getLectures(); 
      
      if (mounted) {
        setState(() {
          _lectures = data.map<Lecture>((json) {
            return Lecture(
              id: json['_id'] ?? '',
              title: json['title'] ?? '',
              subject: json['department'] ?? 'Unknown',
              venue: json['hall_id'] ?? '',
              date: DateTime.parse(json['start_time']),
              startTime: TimeOfDay.fromDateTime(DateTime.parse(json['start_time'])),
              endTime: TimeOfDay.fromDateTime(DateTime.parse(json['end_time'])),
              description: json['description'] ?? '',
              lecturerId: json['lecturer_id'] ?? '',
              tags: [],
            );
          }).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load lectures: $e')),
        );
      }
    }
  }

      /*
      final department = await AuthService.getDepartment();
      final batch = await AuthService.getBatch();
      
      // If the user's profile is incomplete, fallback to showing all lectures for now
      final queryDept = (department == null || department == 'Unknown') ? null : department;
      final queryBatch = (batch == null || batch == 'Unknown') ? null : batch;
      
      final data = await LectureService.getLectures(department: queryDept, batch: queryBatch);
      if (mounted) {
        setState(() {
          _lectures = data.map<Lecture>((json) {
            return Lecture(
              id: json['_id'] ?? '',
              title: json['title'] ?? '',
              subject: json['department'] ?? 'Unknown',
              venue: json['hall_id'] ?? '',
              date: DateTime.parse(json['start_time']),
              startTime: TimeOfDay.fromDateTime(DateTime.parse(json['start_time'])),
              endTime: TimeOfDay.fromDateTime(DateTime.parse(json['end_time'])),
              description: json['description'] ?? '',
              lecturerId: json['lecturer_id'] ?? '',
              tags: [],
            );
          }).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load lectures: $e')),
        );
      }
    }
  }
*/
  List<Lecture> get _todaysLectures {
    final now = DateTime.now();
    return _lectures
        .where((l) =>
            l.date.year == now.year &&
            l.date.month == now.month &&
            l.date.day == now.day)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgColor,
      body: IndexedStack(
        index: _selectedIndex,
        children: [
          _buildDashboardContent(),
          const NotificationsScreen(),
          const SettingsScreen(),
        ],
      ),
      bottomNavigationBar: BottomNavBar(
        selectedIndex: _selectedIndex,
        onItemTapped: (index) => setState(() => _selectedIndex = index),
      ),
      floatingActionButton: _selectedIndex == 0
          ? FloatingActionButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const send_report_screen.SendReportScreen()),
                );
              },
              backgroundColor: AppColors.primaryBlue,
              child: const Icon(Icons.report_problem_outlined, color: Colors.white),
            )
          : null,
    );
  }

  Widget _buildDashboardContent() {
    final todays = _todaysLectures;
    return SafeArea(
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
                  const SizedBox(height: 20),
                  _buildHallAvailabilityCard(),
                  const SizedBox(height: 24),
                  SectionHeader(
                    title: "Today's Lectures",
                    onActionTap: () {},
                  ),
                  const SizedBox(height: 12),
                  if (_isLoading)
                    const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator()))
                  else if (todays.isEmpty)
                    _buildEmptyLectures()
                  else
                    ...todays.map((l) => LectureCard(lecture: l)),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Flexible(
                    child: Text(
                      'Good Morning, $_userName',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryBlue,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Text('👋', style: TextStyle(fontSize: 22)),
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

  Widget _buildHallAvailabilityCard() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E3A8A), Color(0xFF2563EB)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E3A8A).withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const HallsScreen()),
            );
          },
          borderRadius: BorderRadius.circular(18),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.meeting_room_outlined,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Check Hall Availability',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Browse all lecture halls, real-time status & facilities',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_ios,
                  color: Colors.white,
                  size: 16,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
