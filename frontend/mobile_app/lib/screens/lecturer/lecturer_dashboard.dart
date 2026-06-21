import 'package:flutter/material.dart';
import '../../models/lecture_model.dart';
import 'create_lecture_screen.dart';
import 'lecture_detail_screen.dart';
import 'my_lectures_screen.dart';
import '../../services/lecture_service.dart';
import '../send_report_screen.dart' as send_report_screen;

class LecturerDashboard extends StatefulWidget {
  const LecturerDashboard({super.key});

  @override
  State<LecturerDashboard> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<LecturerDashboard> {
  List<Lecture> _lectures = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchLectures();
  }

  Future<void> _fetchLectures() async {
    try {
      final data = await LectureService.getLectures();
      setState(() {
        _lectures = data.map<Lecture>((json) {
          return Lecture(
            id: json['_id'] ?? '',
            title: json['title'] ?? '',
            subject: 'Unknown', // Backend doesn't store subject yet, hardcoding for now
            venue: json['hall_id'] ?? '',
            date: DateTime.parse(json['start_time']),
            startTime: TimeOfDay.fromDateTime(DateTime.parse(json['start_time'])),
            endTime: TimeOfDay.fromDateTime(DateTime.parse(json['end_time'])),
            description: json['description'] ?? '',
            lecturerId: json['lecturer_id'] ?? 'admin',
            tags: [], // Tags aren't saved to backend currently
          );
        }).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load lectures: $e')),
        );
      }
    }
  }

  void _onLectureCreated(Lecture lecture) {
    setState(() => _lectures.insert(0, lecture));
  }

  void _openCreateLecture() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CreateLectureScreen(onCreated: _onLectureCreated),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F0),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 28),
              _buildQuickActions(),
              const SizedBox(height: 28),
              _buildTodaysLectures(),
            ],
          ),
        ),
      ),
    );
  }

  // ── Header ────────────────────────────────────

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
                  'Hi, Mr. Herath ',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A237E),
                  ),
                ),
                Text('👋', style: TextStyle(fontSize: 22)),
              ],
            ),
            const SizedBox(height: 4),
            const Text(
              'Monday, 23 October',
              style: TextStyle(fontSize: 14, color: Color(0xFF5C6BC0)),
            ),
          ],
        ),
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
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
            color: Color(0xFF1A237E),
            size: 20,
          ),
        ),
      ],
    );
  }

  // ── Quick Actions ─────────────────────────────

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Actions',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1A1A1A),
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            _buildActionButton(
              Icons.add_circle_outline,
              'Create\nLecture',
              onTap: _openCreateLecture,
            ),
            const SizedBox(width: 16),
            _buildActionButton(
              Icons.calendar_today_outlined,
              'Manage\nSchedule',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const MyLecturesScreen(),
                  ),
                );
              },
            ),
            const SizedBox(width: 16),
            _buildActionButton(
              Icons.campaign_outlined, 
              'Send\nAlert',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const send_report_screen.SendReportScreen(),
                  ),
                );
              },
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionButton(
    IconData icon,
    String label, {
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.07),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Icon(icon, color: const Color(0xFF3949AB), size: 26),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF555555),
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }

  // ── Today's Lectures ──────────────────────────

  Widget _buildTodaysLectures() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              "Today's Lectures",
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A1A1A),
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const MyLecturesScreen(),
                  ),
                );
              },
              style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: const Text(
                'View All',
                style: TextStyle(
                  fontSize: 13,
                  color: Color(0xFF3949AB),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (_isLoading)
          const Center(
            child: Padding(
              padding: EdgeInsets.symmetric(vertical: 32),
              child: CircularProgressIndicator(color: Color(0xFF283593)),
            ),
          )
        else if (_lectures.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 32),
              child: Column(
                children: const [
                  Icon(
                    Icons.menu_book_outlined,
                    size: 48,
                    color: Color(0xFFBDBDBD),
                  ),
                  SizedBox(height: 12),
                  Text(
                    'No lectures today',
                    style: TextStyle(color: Color(0xFF9E9E9E), fontSize: 15),
                  ),
                ],
              ),
            ),
          )
        else
          ..._lectures.map(
            (l) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _buildLectureCard(l),
            ),
          ),
      ],
    );
  }

  Widget _buildLectureCard(Lecture lecture) {
    return GestureDetector(
      onTap: () async {
        final result = await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => LectureDetailScreen(lecture: lecture),
          ),
        );
        if (result == true) {
          _fetchLectures();
        }
      },
      child: Container(
        padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF283593),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1A237E).withOpacity(0.25),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.menu_book_outlined,
              color: Colors.white,
              size: 26,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  lecture.title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 5),
                Row(
                  children: [
                    const Icon(
                      Icons.access_time,
                      color: Colors.white70,
                      size: 13,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      lecture.formattedTime,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        lecture.venue,
                        style: const TextStyle(
                          fontSize: 11,
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Icon(
                        Icons.open_in_new,
                        color: Colors.white70,
                        size: 11,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: Colors.white54, size: 22),
        ],
        ),
      ),
    );
  }
}
