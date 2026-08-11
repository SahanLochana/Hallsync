import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../models/lecture_model.dart';
import "../../services/lecture_service.dart";
import "../../services/hall_service.dart";
import '../../constants/modules_data.dart';
import '../../services/auth_service.dart';

class AssignedLectureItem {
  final String courseCode;
  final String courseTitle;
  final String departmentKey;
  final String departmentCode;
  final String semesterKey;
  final String fullDisplayName;

  AssignedLectureItem({
    required this.courseCode,
    required this.courseTitle,
    required this.departmentKey,
    required this.departmentCode,
    required this.semesterKey,
    required this.fullDisplayName,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AssignedLectureItem &&
          runtimeType == other.runtimeType &&
          courseCode == other.courseCode &&
          departmentKey == other.departmentKey &&
          semesterKey == other.semesterKey;

  @override
  int get hashCode =>
      courseCode.hashCode ^ departmentKey.hashCode ^ semesterKey.hashCode;
}

class CreateLectureScreen extends StatefulWidget {
  final void Function(Lecture) onCreated;
  final DateTime? initialDate;
  final TimeOfDay? initialStartTime;

  const CreateLectureScreen({
    super.key,
    required this.onCreated,
    this.initialDate,
    this.initialStartTime,
  });

  @override
  State<CreateLectureScreen> createState() => _CreateLectureScreenState();
}

class _CreateLectureScreenState extends State<CreateLectureScreen> {
  String? _selectedDepartment;
  String? _selectedSemester;
  String? _selectedModule;
  String? _selectedBatch; // අලුතින් එකතු කරපු variable එක
  String? _selectedVenue;
  DateTime? _selectedDate;
  TimeOfDay? _startTime;
  TimeOfDay? _endTime;
  
  // විශ්වවිද්‍යාලයේ සාමාන්‍ය Batches ටික
  final List<String> _batches = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  bool _isSubmitting = false;
  bool _isCheckingAvailability = false;
  bool _isAvailable = true;
  bool _canOverwrite = false;
  bool _isLoadingHalls = true;
  String? _timeValidationError;

  // Assigned lectures state
  bool _isLoadingAssignedLectures = true;
  List<AssignedLectureItem> _assignedLectures = [];
  AssignedLectureItem? _selectedAssignedLecture;

  @override
  void initState() {
    super.initState();
    if (widget.initialDate != null) {
      _selectedDate = widget.initialDate;
    }
    if (widget.initialStartTime != null) {
      _startTime = widget.initialStartTime;
    }
    _loadHalls();
    _loadAssignedLectures();
  }

  Future<void> _loadHalls() async {
    final halls = await HallService.getHalls();
    if (mounted) {
      setState(() {
        _venues = halls.map((h) => h['name'] as String).toList();
        _isLoadingHalls = false;
      });
    }
  }

  Future<void> _loadAssignedLectures() async {
    final email = await AuthService.getEmail();
    final baseUrl = LectureService.baseUrl;

    if (email == null || email.isEmpty) {
      if (mounted) setState(() => _isLoadingAssignedLectures = false);
      return;
    }

    try {
      // 1. Fetch user profile / user list to get assigned modules
      final usersRes = await http.get(Uri.parse('$baseUrl/users/'));
      List<String> assignedCodes = [];

      if (usersRes.statusCode == 200) {
        final data = jsonDecode(usersRes.body);
        final list = data['response'] as List? ?? [];
        final me = list.firstWhere(
          (u) =>
              (u['email']?.toString().toLowerCase() == email.toLowerCase()) ||
              (u['universityId']?.toString().toLowerCase() ==
                  email.toLowerCase()),
          orElse: () => null,
        );
        if (me != null && me['modules'] != null) {
          assignedCodes = List<String>.from(me['modules']);
        }
      }

      // 2. Fetch departments catalog from MongoDB
      final deptRes = await http.get(Uri.parse('$baseUrl/departments/'));
      List<dynamic> deptsList = [];
      if (deptRes.statusCode == 200) {
        final deptData = jsonDecode(deptRes.body);
        deptsList = deptData['response'] as List? ?? [];
      }

      // Helpers
      String getSemKey(dynamic sem) {
        int numVal = 1;
        if (sem is int) {
          numVal = sem;
        } else if (sem is String) {
          numVal = int.tryParse(sem.replaceAll(RegExp(r'\D'), '')) ?? 1;
        }
        final roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
        if (numVal >= 1 && numVal <= 8) return 'Semester ${roman[numVal]}';
        return 'Semester I';
      }

      String getDeptKey(String code, String name) {
        final c = code.toUpperCase();
        if (c == 'CIS' || name.toLowerCase().contains('computing')) {
          return 'Computing & Information Systems (CIS)';
        }
        if (c == 'SE' || name.toLowerCase().contains('software')) {
          return 'Software Engineering (SE)';
        }
        if (c == 'DS' || name.toLowerCase().contains('data science')) {
          return 'Department of Data Science';
        }
        return name.isNotEmpty
            ? name
            : 'Computing & Information Systems (CIS)';
      }

      // 3. Match assigned codes with department catalog
      final List<AssignedLectureItem> loadedItems = [];

      for (final code in assignedCodes) {
        bool found = false;
        for (final d in deptsList) {
          final dCode = d['departmentCode'] ?? '';
          final dName = d['departmentName'] ?? '';
          final dKey = getDeptKey(dCode, dName);
          final lectures = d['lectures'] as List? ?? [];

          for (final lec in lectures) {
            final cCode = lec['courseCode'] ?? '';
            final cTitle = lec['courseTitle'] ?? '';
            final semNum = lec['semester'] ?? 1;

            if (cCode.toLowerCase() == code.toLowerCase() ||
                cTitle.toLowerCase().contains(code.toLowerCase()) ||
                code.toLowerCase().contains(cCode.toLowerCase())) {
              final semKey = getSemKey(semNum);
              loadedItems.add(AssignedLectureItem(
                courseCode: cCode,
                courseTitle: cTitle,
                departmentKey: dKey,
                departmentCode: dCode,
                semesterKey: semKey,
                fullDisplayName: '$cCode - $cTitle ($semKey)',
              ));
              found = true;
              break;
            }
          }
          if (found) break;
        }

        // Fallback search in static ModulesData if not in API catalog
        if (!found) {
          for (final deptEntry in ModulesData.data.entries) {
            final deptK = deptEntry.key;
            for (final semEntry in deptEntry.value.entries) {
              final semK = semEntry.key;
              for (final modTitle in semEntry.value) {
                if (modTitle.toLowerCase().contains(code.toLowerCase()) ||
                    code.toLowerCase().contains(modTitle.toLowerCase())) {
                  final dCode = deptK.contains('(')
                      ? deptK.split('(')[1].replaceAll(')', '')
                      : 'CIS';
                  loadedItems.add(AssignedLectureItem(
                    courseCode: code,
                    courseTitle: modTitle,
                    departmentKey: deptK,
                    departmentCode: dCode,
                    semesterKey: semK,
                    fullDisplayName: '$code - $modTitle ($semK)',
                  ));
                  found = true;
                  break;
                }
              }
              if (found) break;
            }
            if (found) break;
          }
        }

        // Ultimate fallback
        if (!found) {
          loadedItems.add(AssignedLectureItem(
            courseCode: code,
            courseTitle: code,
            departmentKey: 'Computing & Information Systems (CIS)',
            departmentCode: 'CIS',
            semesterKey: 'Semester I',
            fullDisplayName: '$code (Semester I)',
          ));
        }
      }

      if (mounted) {
        setState(() {
          _assignedLectures = loadedItems;
          _isLoadingAssignedLectures = false;
        });
      }
    } catch (e) {
      print('Error loading assigned lectures: $e');
      if (mounted) {
        setState(() => _isLoadingAssignedLectures = false);
      }
    }
  }

  List<String> _venues = [];

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
        _checkConflict();
      });
    }
  }

  Future<void> _pickTime({required bool isStart}) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: isStart
          ? (_startTime ?? const TimeOfDay(hour: 8, minute: 0))
          : (_endTime ?? const TimeOfDay(hour: 10, minute: 0)),
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startTime = picked;
        } else {
          _endTime = picked;
        }
        _checkConflict();
      });
    }
  }

  String? _validateTimePeriod() {
    if (_startTime == null || _endTime == null) {
      return null;
    }

    final startMinutes = _startTime!.hour * 60 + _startTime!.minute;
    final endMinutes = _endTime!.hour * 60 + _endTime!.minute;

    if (endMinutes <= startMinutes) {
      return 'End time must be after start time';
    }

    if (endMinutes - startMinutes < 15) {
      return 'Lecture must be at least 15 minutes long';
    }

    if (_selectedDate != null) {
      final now = DateTime.now();
      final startDateTime = DateTime(
        _selectedDate!.year,
        _selectedDate!.month,
        _selectedDate!.day,
        _startTime!.hour,
        _startTime!.minute,
      );
      if (startDateTime.isBefore(now.subtract(const Duration(minutes: 2)))) {
        return 'Cannot schedule a lecture in the past';
      }
    }

    return null;
  }

  Future<void> _checkConflict() async {
    final timeError = _validateTimePeriod();
    if (timeError != null) {
      if (mounted) {
        setState(() {
          _timeValidationError = timeError;
          _isCheckingAvailability = false;
          _isAvailable = true;
          _canOverwrite = false;
        });
      }
      return;
    }

    if (mounted) {
      setState(() {
        _timeValidationError = null;
      });
    }

    if (_selectedDate == null ||
        _startTime == null ||
        _endTime == null ||
        _selectedVenue == null) {
      if (mounted) {
        setState(() {
          _isAvailable = true;
          _canOverwrite = false;
        });
      }
      return;
    }

    setState(() => _isCheckingAvailability = true);

    final startDateTime = DateTime(
      _selectedDate!.year,
      _selectedDate!.month,
      _selectedDate!.day,
      _startTime!.hour,
      _startTime!.minute,
    );
    final endDateTime = DateTime(
      _selectedDate!.year,
      _selectedDate!.month,
      _selectedDate!.day,
      _endTime!.hour,
      _endTime!.minute,
    );

    final result = await LectureService.checkAvailability(
      hallId: _selectedVenue!,
      startTime: startDateTime,
      endTime: endDateTime,
    );

    if (mounted) {
      setState(() {
        _isAvailable = result['available'];
        _canOverwrite = result['can_overwrite'];
        _isCheckingAvailability = false;
      });
    }
  }

  Future<void> _submit() async {
    if (_selectedDepartment == null ||
        _selectedSemester == null ||
        _selectedModule == null ||
        _selectedBatch == null || // Batch Validation එක එකතු කරා
        _selectedDate == null ||
        _startTime == null ||
        _endTime == null ||
        _selectedVenue == null) {
      _showSnack('Please fill all required fields');
      return;
    }

    final timeError = _validateTimePeriod();
    if (timeError != null) {
      _showSnack(timeError);
      return;
    }

    if (!_isAvailable && !_canOverwrite) {
      _showSnack('Cannot save: Lecture hall is unavailable for this time.');
      return;
    }

    final startDateTime = DateTime(
      _selectedDate!.year,
      _selectedDate!.month,
      _selectedDate!.day,
      _startTime!.hour,
      _startTime!.minute,
    );
    final endDateTime = DateTime(
      _selectedDate!.year,
      _selectedDate!.month,
      _selectedDate!.day,
      _endTime!.hour,
      _endTime!.minute,
    );

    bool doOverwrite = false;
    if (!_isAvailable && _canOverwrite) {
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Overwrite Default Timetable?'),
          content: const Text(
              'This time slot is booked by an admin default timetable. Do you want to overwrite it?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('Overwrite',
                  style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      );
      if (confirmed != true) return;
      doOverwrite = true;
    }

    setState(() => _isSubmitting = true);

    try {
      final lecturerEmail =
          await AuthService.getEmail() ?? 'unknown_lecturer';
      final lectureId = await LectureService.createLecture(
        title: _selectedModule!,
        description: '',
        lecturerId: lecturerEmail,
        hallId: _selectedVenue!,
        department: _selectedDepartment,
        batch: _selectedBatch, // Batch parameter එක යවනවා
        startTime: startDateTime,
        endTime: endDateTime,
        capacity: 30,
        overwrite: doOverwrite,
      );

      if (lectureId != null) {
        widget.onCreated(
          Lecture(
            id: lectureId,
            title: _selectedModule!,
            subject: _selectedModule!,
            venue: _selectedVenue!,
            date: _selectedDate!,
            startTime: _startTime!,
            endTime: _endTime!,
            description: '',
            lecturerId: lecturerEmail,
            tags: [],
          ),
        );
        if (!mounted) return;
        Navigator.pop(context);
        _showSnack('Lecture Created successfully!');
      } else {
        _showSnack('Failed to create lecture. Please try again.');
      }
    } catch (e) {
      _showSnack('Error: ${e.toString()}');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  String _formatDate(DateTime d) {
    return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  }

  String _formatTime(TimeOfDay t) {
    final h = t.hourOfPeriod == 0 ? 12 : t.hourOfPeriod;
    final m = t.minute.toString().padLeft(2, '0');
    final p = t.period == DayPeriod.am ? 'AM' : 'PM';
    return '${h.toString().padLeft(2, '0')}:$m $p';
  }

  @override
  Widget build(BuildContext context) {
    // Derived available options from assignedLectures
    final assignedDepts = _assignedLectures
        .map((a) => a.departmentKey)
        .toSet()
        .toList();

    final assignedSemesters = _selectedDepartment == null
        ? <String>[]
        : _assignedLectures
            .where((a) => a.departmentKey == _selectedDepartment)
            .map((a) => a.semesterKey)
            .toSet()
            .toList();

    final assignedModules = (_selectedDepartment == null ||
            _selectedSemester == null)
        ? <String>[]
        : _assignedLectures
            .where((a) =>
                a.departmentKey == _selectedDepartment &&
                a.semesterKey == _selectedSemester)
            .map((a) => a.courseTitle)
            .toSet()
            .toList();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new,
              color: Color(0xFF1E293B), size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Create New Lecture',
          style: TextStyle(
            color: Color(0xFF1E293B),
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_isLoadingAssignedLectures) ...[
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(24.0),
                          child: CircularProgressIndicator(),
                        ),
                      ),
                    ] else if (_assignedLectures.isEmpty) ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFFECACA)),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.info_outline,
                                color: Color(0xFFEF4444), size: 22),
                            SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'No lectures assigned to your account yet. Please contact your administrator to assign lectures to you.',
                                style: TextStyle(
                                  color: Color(0xFFDC2626),
                                  fontSize: 13,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                    ] else ...[
                      // Quick picker for assigned lectures
                      _buildLabel('Assigned Lecture'),
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFF1E3B8A)),
                          borderRadius: BorderRadius.circular(16),
                          color: const Color(0xFFEFF6FF),
                        ),
                        child: DropdownButtonFormField<AssignedLectureItem>(
                          isExpanded: true,
                          initialValue: _selectedAssignedLecture,
                          onChanged: (item) {
                            if (item != null) {
                              setState(() {
                                _selectedAssignedLecture = item;
                                _selectedDepartment = item.departmentKey;
                                _selectedSemester = item.semesterKey;
                                _selectedModule = item.courseTitle;
                                _selectedBatch = null; // Reset the batch on new module selection
                                _checkConflict();
                              });
                            }
                          },
                          items: _assignedLectures
                              .map((item) => DropdownMenuItem(
                                    value: item,
                                    child: Text(
                                      item.fullDisplayName,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: Color(0xFF1E3B8A),
                                      ),
                                    ),
                                  ))
                              .toList(),
                          icon: const Icon(Icons.keyboard_arrow_down_rounded,
                              color: Color(0xFF1E3B8A)),
                          decoration: const InputDecoration(
                            hintText: 'Select one of your assigned lectures...',
                            hintStyle: TextStyle(
                                color: Color(0xFF64748B), fontSize: 14),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(
                                horizontal: 16, vertical: 14),
                          ),
                          dropdownColor: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Department
                      _buildLabel('Department'),
                      _buildDropdown(
                        hint: 'Select Department',
                        value: _selectedDepartment,
                        items: assignedDepts,
                        onChanged: (v) {
                          setState(() {
                            _selectedDepartment = v;
                            _selectedSemester = null;
                            _selectedModule = null;
                            _selectedBatch = null;
                            _selectedAssignedLecture = null;
                            _checkConflict();
                          });
                        },
                      ),
                      const SizedBox(height: 20),

                      // Semester
                      if (_selectedDepartment != null) ...[
                        _buildLabel('Semester'),
                        _buildDropdown(
                          hint: 'Select Semester',
                          value: _selectedSemester,
                          items: assignedSemesters,
                          onChanged: (v) {
                            setState(() {
                              _selectedSemester = v;
                              _selectedModule = null;
                              _selectedBatch = null;
                              _selectedAssignedLecture = null;
                              _checkConflict();
                            });
                          },
                        ),
                        const SizedBox(height: 20),
                      ],

                      // Module
                      if (_selectedSemester != null) ...[
                        _buildLabel('Module'),
                        _buildDropdown(
                          hint: 'Select Module',
                          value: _selectedModule,
                          items: assignedModules,
                          onChanged: (v) {
                            setState(() {
                              _selectedModule = v;
                              _checkConflict();
                            });
                          },
                        ),
                        const SizedBox(height: 20),
                      ],
                      
                      // Batch Dropdown අලුතින් දැම්මා
                      if (_selectedModule != null) ...[
                        _buildLabel('Batch'),
                        _buildDropdown(
                          hint: 'Select Batch',
                          value: _selectedBatch,
                          items: _batches,
                          onChanged: (v) {
                            setState(() {
                              _selectedBatch = v;
                            });
                          },
                        ),
                        const SizedBox(height: 20),
                      ],
                    ],

                    _buildLabel('Date'),
                    GestureDetector(
                      onTap: _pickDate,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              _selectedDate == null
                                  ? 'YYYY-MM-DD'
                                  : _formatDate(_selectedDate!),
                              style: TextStyle(
                                fontSize: 15,
                                color: _selectedDate == null
                                    ? const Color(0xFF94A3B8)
                                    : const Color(0xFF1E293B),
                              ),
                            ),
                            const Icon(Icons.calendar_today_outlined,
                                color: Color(0xFF94A3B8), size: 20),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Start Time'),
                              GestureDetector(
                                onTap: () => _pickTime(isStart: true),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 14),
                                  decoration: BoxDecoration(
                                    border: Border.all(
                                        color: const Color(0xFFE2E8F0)),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Text(
                                    _startTime == null
                                        ? '08:00 AM'
                                        : _formatTime(_startTime!),
                                    style: TextStyle(
                                      fontSize: 15,
                                      color: _startTime == null
                                          ? const Color(0xFF94A3B8)
                                          : const Color(0xFF1E293B),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('End Time'),
                              GestureDetector(
                                onTap: () => _pickTime(isStart: false),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 14),
                                  decoration: BoxDecoration(
                                    border: Border.all(
                                        color: const Color(0xFFE2E8F0)),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Text(
                                    _endTime == null
                                        ? '10:00 AM'
                                        : _formatTime(_endTime!),
                                    style: TextStyle(
                                      fontSize: 15,
                                      color: _endTime == null
                                          ? const Color(0xFF94A3B8)
                                          : const Color(0xFF1E293B),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildLabel('Lecture Hall'),
                        if (_isCheckingAvailability)
                          const SizedBox(
                            width: 12,
                            height: 12,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        else if (_timeValidationError != null)
                          Row(
                            children: [
                              Container(
                                width: 6,
                                height: 6,
                                decoration: const BoxDecoration(
                                  color: Color(0xFFEF4444),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Text(
                                'Invalid Time',
                                style: TextStyle(
                                  color: Color(0xFFEF4444),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          )
                        else if (_selectedVenue != null &&
                            _selectedDate != null &&
                            _startTime != null &&
                            _endTime != null)
                          Row(
                            children: [
                              Container(
                                width: 6,
                                height: 6,
                                decoration: BoxDecoration(
                                  color: _isAvailable
                                      ? const Color(0xFF10B981)
                                      : const Color(0xFFEF4444),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                _isAvailable ? 'Available' : 'Unavailable',
                                style: TextStyle(
                                  color: _isAvailable
                                      ? const Color(0xFF10B981)
                                      : const Color(0xFFEF4444),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          )
                      ],
                    ),
                    _isLoadingHalls
                        ? const Center(
                            child: Padding(
                                padding: EdgeInsets.all(8.0),
                                child: CircularProgressIndicator()))
                        : _buildDropdown(
                            hint: 'Select Hall',
                            value: _selectedVenue,
                            items: _venues,
                            onChanged: (v) {
                              setState(() {
                                _selectedVenue = v;
                                _checkConflict();
                              });
                            },
                          ),
                    const SizedBox(height: 20),

                    if (_timeValidationError == null &&
                        !_isAvailable &&
                        !_canOverwrite)
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFFECACA)),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.warning_amber_rounded,
                                color: Color(0xFFEF4444), size: 20),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                "Conflict detected: The selected lecture hall ('$_selectedVenue') is already booked for this time slot.",
                                style: const TextStyle(
                                  color: Color(0xFFDC2626),
                                  fontSize: 13,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                    else if (_timeValidationError == null &&
                        !_isAvailable &&
                        _canOverwrite)
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFFBEB),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFFDE68A)),
                        ),
                        child: const Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(Icons.info_outline,
                                color: Color(0xFFD97706), size: 20),
                            SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                "Conflict with Default Timetable. You can overwrite this slot.",
                                style: TextStyle(
                                  color: Color(0xFFB45309),
                                  fontSize: 13,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
              ),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: (_isSubmitting || _assignedLectures.isEmpty)
                      ? null
                      : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1D4ED8),
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: const Color(0xFF93C5FD),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : const Text(
                          'Save Lecture',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: Color(0xFF475569),
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required String hint,
    required String? value,
    required List<String> items,
    required void Function(String?) onChanged,
  }) {
    final effectiveItems = List<String>.from(items);
    if (value != null && value.isNotEmpty && !effectiveItems.contains(value)) {
      effectiveItems.insert(0, value);
    }
    final effectiveValue =
        (value != null && effectiveItems.contains(value)) ? value : null;

    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: DropdownButtonFormField<String>(
        isExpanded: true,
        initialValue: effectiveValue,
        onChanged: onChanged,
        items: effectiveItems
            .map((s) => DropdownMenuItem(
                  value: s,
                  child: Text(
                    s,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 15, color: Color(0xFF1E293B)),
                  ),
                ))
            .toList(),
        icon: const Icon(Icons.keyboard_arrow_down_rounded,
            color: Color(0xFF94A3B8)),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 15),
          border: InputBorder.none,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        dropdownColor: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }
}