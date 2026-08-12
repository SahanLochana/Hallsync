import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/hall_model.dart';
import '../services/auth_service.dart';
import '../services/hall_service.dart';
import 'campus_map_screen.dart';
import 'lecturer/create_lecture_screen.dart';
import 'send_report_screen.dart';

class HallDetailScreen extends StatefulWidget {
  final HallModel hall;

  const HallDetailScreen({super.key, required this.hall});

  @override
  State<HallDetailScreen> createState() => _HallDetailScreenState();
}

class _HallDetailScreenState extends State<HallDetailScreen> {
  List<Map<String, dynamic>> _schedule = [];
  bool _isLoadingSchedule = true;
  String _userRole = 'student';

  @override
  void initState() {
    super.initState();
    _loadUserRole();
    _fetchSchedule();
  }

  Future<void> _loadUserRole() async {
    final role = await AuthService.getRole();
    if (mounted && role != null) {
      setState(() => _userRole = role);
    }
  }

  Future<void> _fetchSchedule() async {
    try {
      final schedule = await HallService.getHallSchedule(widget.hall.hallId);
      if (mounted) {
        setState(() {
          _schedule = schedule;
          _isLoadingSchedule = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingSchedule = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final hall = widget.hall;
    final isAvailable = !hall.isOccupied;

    return Scaffold(
      backgroundColor: AppColors.bgColor,
      appBar: AppBar(
        title: Text(hall.name.toUpperCase()),
        backgroundColor: const Color(0xFF1E3A8A),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeaderCard(hall, isAvailable),
              const SizedBox(height: 16),
              _buildSpecsGrid(hall),
              const SizedBox(height: 20),
              _buildAmenitiesCard(hall),
              const SizedBox(height: 20),
              _buildScheduleSection(),
              const SizedBox(height: 24),
              _buildActionButtons(hall),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderCard(HallModel hall, bool isAvailable) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E3A8A), Color(0xFF3B82F6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E3A8A).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'ID: ${hall.hallId}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: isAvailable
                      ? const Color(0xFF22C55E)
                      : const Color(0xFFEF4444),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.circle, size: 8, color: Colors.white),
                    const SizedBox(width: 6),
                    Text(
                      isAvailable ? 'Available Now' : 'Occupied',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            hall.name.toUpperCase(),
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.location_on_outlined, color: Colors.white70, size: 16),
              const SizedBox(width: 4),
              Text(
                '${hall.building} • ${hall.floor}',
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.white70,
                ),
              ),
            ],
          ),
          if (hall.description != null && hall.description!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              hall.description!,
              style: TextStyle(
                fontSize: 12,
                color: Colors.white.withOpacity(0.9),
                height: 1.4,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSpecsGrid(HallModel hall) {
    return Row(
      children: [
        Expanded(
          child: _buildSpecTile(
            Icons.people_outline,
            'Seating Capacity',
            '${hall.capacity} Seats',
            const Color(0xFF3B82F6),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildSpecTile(
            Icons.domain,
            'Venue Type',
            hall.type,
            const Color(0xFF8B5CF6),
          ),
        ),
      ],
    );
  }

  Widget _buildSpecTile(IconData icon, String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textGrey,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E3A8A),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAmenitiesCard(HallModel hall) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Hall Facilities & Amenities',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E3A8A),
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: hall.amenities.map((amenity) {
              IconData icon = Icons.check_circle_outline;
              if (amenity.toLowerCase().contains('ac')) icon = Icons.ac_unit;
              if (amenity.toLowerCase().contains('projector')) icon = Icons.videocam;
              if (amenity.toLowerCase().contains('sound')) icon = Icons.volume_up;
              if (amenity.toLowerCase().contains('wi-fi')) icon = Icons.wifi;

              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(icon, size: 16, color: const Color(0xFF1E3A8A)),
                    const SizedBox(width: 6),
                    Text(
                      amenity,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF334155),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              "Today's Hall Schedule",
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E3A8A),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '${_schedule.length} Sessions',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E3A8A),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (_isLoadingSchedule)
          const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator()))
        else if (_schedule.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: const [
                Icon(Icons.event_available, size: 40, color: Color(0xFF22C55E)),
                SizedBox(height: 8),
                Text(
                  'No lectures scheduled today',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                SizedBox(height: 4),
                Text(
                  'This hall is currently unreserved for the day.',
                  style: TextStyle(color: AppColors.textGrey, fontSize: 12),
                ),
              ],
            ),
          )
        else
          ..._schedule.map((item) => _buildScheduleCard(item)),
      ],
    );
  }

  Widget _buildScheduleCard(Map<String, dynamic> item) {
    String title = item['title'] ?? 'Lecture Session';
    String lecturer = item['lecturer_id'] ?? 'Lecturer';
    String startTime = item['start_time'] ?? '';
    String endTime = item['end_time'] ?? '';

    try {
      if (startTime.contains('T')) {
        final dt = DateTime.parse(startTime).toLocal();
        startTime = '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
      }
      if (endTime.contains('T')) {
        final dt = DateTime.parse(endTime).toLocal();
        endTime = '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
      }
    } catch (_) {}

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border(
          left: BorderSide(
            color: const Color(0xFF1E3A8A),
            width: 4,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                const Icon(Icons.access_time, size: 14, color: Color(0xFF1E3A8A)),
                const SizedBox(height: 4),
                Text(
                  '$startTime\n$endTime',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E3A8A),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E3A8A),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Lecturer: $lecturer',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textGrey,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(HallModel hall) {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => CampusMapScreen(selectedHallName: hall.name),
                ),
              );
            },
            icon: const Icon(Icons.map, color: Colors.white),
            label: const Text(
              'Locate on Campus Map',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1E3A8A),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),
        if (_userRole == 'lecturer')
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => CreateLectureScreen(
                      onCreated: (_) {},
                    ),
                  ),
                );
              },
              icon: const Icon(Icons.add_circle_outline, color: Color(0xFF1E3A8A)),
              label: const Text(
                'Schedule Lecture in this Hall',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF1E3A8A),
                side: const BorderSide(color: Color(0xFF1E3A8A), width: 1.5),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          height: 44,
          child: TextButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const SendReportScreen(),
                ),
              );
            },
            icon: const Icon(Icons.report_problem_outlined, color: Colors.redAccent, size: 18),
            label: const Text(
              'Report Issue with this Hall',
              style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w600),
            ),
          ),
        ),
      ],
    );
  }
}
