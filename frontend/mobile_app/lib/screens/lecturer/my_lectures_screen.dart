import 'package:flutter/material.dart';
import '../../models/lecture_model.dart';
import '../../services/lecture_service.dart';
import 'lecture_detail_screen.dart';

import 'timetable_screen.dart';

class MyLecturesScreen extends StatefulWidget {
  const MyLecturesScreen({super.key});

  @override
  State<MyLecturesScreen> createState() => _MyLecturesScreenState();
}

class _MyLecturesScreenState extends State<MyLecturesScreen> {
  bool _isLoading = true;
  List<Lecture> _lectures = [];

  bool _filterToday = false;
  String? _filterBatch;
  String? _filterModule;

  Set<String> _availableBatches = {};
  Set<String> _availableModules = {};

  @override
  void initState() {
    super.initState();
    _fetchLectures();
  }

  List<Lecture> get _filteredLectures {
    return _lectures.where((lec) {
      if (_filterToday) {
        final now = DateTime.now();
        if (lec.date.year != now.year || lec.date.month != now.month || lec.date.day != now.day) {
          return false;
        }
      }
      
      String module = lec.title;
      String batch = '';
      if (lec.title.contains(' for ')) {
        final parts = lec.title.split(' for ');
        if (parts.length == 2) {
          module = parts[0].trim();
          batch = parts[1].trim();
        }
      }

      if (_filterBatch != null && _filterBatch != 'All Batches' && batch != _filterBatch) {
        return false;
      }

      if (_filterModule != null && _filterModule != 'All Modules' && module != _filterModule) {
        return false;
      }

      return true;
    }).toList();
  }

  Future<void> _fetchLectures() async {
    setState(() => _isLoading = true);
    try {
      final data = await LectureService.getLectures();
      if (mounted) {
        setState(() {
          _lectures = data.map((json) {
            return Lecture(
              id: json['_id'] ?? '',
              title: json['title'] ?? '',
              subject: 'Unknown',
              venue: json['hall_id'] ?? '',
              date: DateTime.tryParse(json['start_time'] ?? '') ?? DateTime.now(),
              startTime: TimeOfDay.fromDateTime(
                  DateTime.tryParse(json['start_time'] ?? '') ?? DateTime.now()),
              endTime: TimeOfDay.fromDateTime(
                  DateTime.tryParse(json['end_time'] ?? '') ?? DateTime.now()),
              description: json['description'] ?? '',
              lecturerId: json['lecturer_id'] ?? 'admin',
              tags: [],
            );
          }).toList();

          _availableBatches.clear();
          _availableModules.clear();
          for (var lec in _lectures) {
            if (lec.title.contains(' for ')) {
              final parts = lec.title.split(' for ');
              if (parts.length == 2) {
                _availableModules.add(parts[0].trim());
                _availableBatches.add(parts[1].trim());
              }
            } else {
              _availableModules.add(lec.title.trim());
            }
          }
        });
      }
    } catch (e) {
      debugPrint('Error fetching lectures: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF4F7FB),
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1E3A8A)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Manage Schedule',
          style: TextStyle(
            color: Color(0xFF111827),
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today_outlined, color: Color(0xFF1E3A8A)),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => TimetableScreen(lectures: _lectures),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _filterToday = !_filterToday;
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: _filterToday ? const Color(0xFF1E3A8A) : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: _filterToday ? const Color(0xFF1E3A8A) : const Color(0xFFE5E7EB)),
                    ),
                    child: Text(
                      'Today',
                      style: TextStyle(
                        color: _filterToday ? Colors.white : const Color(0xFF374151),
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                _buildDropdownFilter(
                  label: _filterBatch ?? 'All Batches',
                  options: ['All Batches', ..._availableBatches],
                  onSelected: (val) {
                    setState(() {
                      _filterBatch = val == 'All Batches' ? null : val;
                    });
                  },
                ),
                const SizedBox(width: 12),
                _buildDropdownFilter(
                  label: _filterModule ?? 'All Modules',
                  options: ['All Modules', ..._availableModules],
                  onSelected: (val) {
                    setState(() {
                      _filterModule = val == 'All Modules' ? null : val;
                    });
                  },
                ),
              ],
            ),
          ),
          
          // Lectures List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredLectures.isEmpty
                    ? const Center(
                        child: Text(
                          'No lectures found.',
                          style: TextStyle(color: Colors.grey, fontSize: 16),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _fetchLectures,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _filteredLectures.length,
                          itemBuilder: (context, index) {
                            return _buildLectureCard(_filteredLectures[index]);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildDropdownFilter({
    required String label,
    required List<String> options,
    required void Function(String) onSelected,
  }) {
    return PopupMenuButton<String>(
      onSelected: onSelected,
      itemBuilder: (context) {
        return options.map((opt) {
          return PopupMenuItem(
            value: opt,
            child: Text(opt),
          );
        }).toList();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        child: Row(
          children: [
            Text(
              label,
              style: const TextStyle(
                color: Color(0xFF374151),
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: 6),
            const Icon(Icons.keyboard_arrow_down, color: Color(0xFF6B7280), size: 18),
          ],
        ),
      ),
    );
  }

  Widget _buildLectureCard(Lecture lecture) {
    String mainTitle = lecture.title;
    String batchName = lecture.subject;

    if (lecture.title.contains(' for ')) {
      final parts = lecture.title.split(' for ');
      if (parts.length == 2) {
        mainTitle = parts[0];
        batchName = parts[1];
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Status Pill & Time
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFD1FAE5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'SCHEDULED',
                  style: TextStyle(
                    color: Color(0xFF059669),
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              Text(
                lecture.formattedTime,
                style: const TextStyle(
                  color: Color(0xFF9CA3AF),
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Title
          Text(
            mainTitle,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: Color(0xFF1E3A8A),
            ),
          ),
          const SizedBox(height: 12),
          
          // Details
          _buildInfoRow(Icons.people_alt_outlined, 'Batch: $batchName'),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.location_on_outlined, 'Hall: ${lecture.venue}'),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.calendar_today_outlined, _formatShortDate(lecture.date)),
          
          const SizedBox(height: 20),
          
          // Bottom Buttons
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E3A8A),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Manage Attendance',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton(
                  onPressed: () async {
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
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF1E3A8A),
                    side: const BorderSide(color: Color(0xFF1E3A8A)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Details',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 16, color: const Color(0xFF6B7280)),
        const SizedBox(width: 8),
        Text(
          text,
          style: const TextStyle(
            fontSize: 14,
            color: Color(0xFF4B5563),
          ),
        ),
      ],
    );
  }

  String _formatShortDate(DateTime d) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[d.month - 1]} ${d.day}, ${d.year}';
  }
}
