import 'package:flutter/material.dart';
import '../../models/lecture_model.dart';
import "../../services/lecture_service.dart";
import '../../constants/modules_data.dart';

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
  final _formKey = GlobalKey<FormState>();

  String? _selectedDepartment;
  String? _selectedSemester;
  String? _selectedModule;
  String? _selectedBatch;
  String? _selectedVenue;
  DateTime? _selectedDate;
  TimeOfDay? _startTime;
  TimeOfDay? _endTime;

  bool _isSubmitting = false;
  bool _isCheckingAvailability = false;
  bool _isAvailable = true; 
  bool _canOverwrite = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialDate != null) {
      _selectedDate = widget.initialDate;
    }
    if (widget.initialStartTime != null) {
      _startTime = widget.initialStartTime;
    }
  }


  final List<String> _batches = [
    '2020/2021',
    '2021/2022',
    '2022/2023',
    '2023/2024',
    '2024/2025',
  ];

  final List<String> _venues = [
    'Mini Auditorium',
    'Old Auditorium',
    'Z91',
    'CIS Lab',
  ];

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
        if (isStart) _startTime = picked;
        else _endTime = picked;
        _checkConflict();
      });
    }
  }

  Future<void> _checkConflict() async {
    if (_selectedDate == null || _startTime == null || _endTime == null || _selectedVenue == null) {
      setState(() => _isAvailable = true);
      return;
    }

    setState(() => _isCheckingAvailability = true);

    final startDateTime = DateTime(
      _selectedDate!.year, _selectedDate!.month, _selectedDate!.day,
      _startTime!.hour, _startTime!.minute,
    );
    final endDateTime = DateTime(
      _selectedDate!.year, _selectedDate!.month, _selectedDate!.day,
      _endTime!.hour, _endTime!.minute,
    );

    // Don't check if end time is before start time
    if (!endDateTime.isAfter(startDateTime)) {
      setState(() {
        _isCheckingAvailability = false;
        _isAvailable = true;
      });
      return;
    }

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
    if (_selectedModule == null || _selectedBatch == null || _selectedDate == null || _startTime == null || _endTime == null || _selectedVenue == null) {
      _showSnack('Please fill all fields');
      return;
    }

    if (!_isAvailable && !_canOverwrite) {
      _showSnack('Cannot save: Lecture hall is unavailable for this time.');
      return;
    }

    final startDateTime = DateTime(
      _selectedDate!.year, _selectedDate!.month, _selectedDate!.day,
      _startTime!.hour, _startTime!.minute,
    );
    final endDateTime = DateTime(
      _selectedDate!.year, _selectedDate!.month, _selectedDate!.day,
      _endTime!.hour, _endTime!.minute,
    );

    if (!endDateTime.isAfter(startDateTime)) {
      _showSnack('End time must be after start time');
      return;
    }
    
    bool doOverwrite = false;
    if (!_isAvailable && _canOverwrite) {
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Overwrite Default Timetable?'),
          content: const Text('This time slot is booked by an admin default timetable. Do you want to overwrite it?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('Overwrite', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      );
      if (confirmed != true) return;
      doOverwrite = true;
    }

    setState(() => _isSubmitting = true);

    try {
      final lectureId = await LectureService.createLecture(
        title: '$_selectedModule for $_selectedBatch',
        description: '',
        lecturerId: 'lecturer123',
        hallId: _selectedVenue!,
        startTime: startDateTime,
        endTime: endDateTime,
        capacity: 30, // Default capacity since it's removed from UI
        overwrite: doOverwrite,
      );

      if (lectureId != null) {
        widget.onCreated(
          Lecture(
            id: lectureId,
            title: '$_selectedModule for $_selectedBatch',
            subject: _selectedModule!,
            venue: _selectedVenue!,
            date: _selectedDate!,
            startTime: _startTime!,
            endTime: _endTime!,
            description: '',
            lecturerId: 'lecturer123',
            tags: [],
          ),
        );
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
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Color(0xFF1E293B), size: 20),
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
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLabel('Department'),
                    _buildDropdown(
                      hint: 'Select Department',
                      value: _selectedDepartment,
                      items: ModulesData.data.keys.toList(),
                      onChanged: (v) {
                        setState(() {
                          _selectedDepartment = v;
                          _selectedSemester = null;
                          _selectedModule = null;
                          _checkConflict();
                        });
                      },
                    ),
                    const SizedBox(height: 20),
                    if (_selectedDepartment != null) ...[
                      _buildLabel('Semester'),
                      _buildDropdown(
                        hint: 'Select Semester',
                        value: _selectedSemester,
                        items: ModulesData.data[_selectedDepartment!]!.keys.toList(),
                        onChanged: (v) {
                          setState(() {
                            _selectedSemester = v;
                            _selectedModule = null;
                            _checkConflict();
                          });
                        },
                      ),
                      const SizedBox(height: 20),
                    ],
                    if (_selectedSemester != null) ...[
                      _buildLabel('Module'),
                      _buildDropdown(
                        hint: 'Select Module',
                        value: _selectedModule,
                        items: ModulesData.data[_selectedDepartment!]![_selectedSemester!]!,
                        onChanged: (v) {
                          setState(() {
                            _selectedModule = v;
                            _checkConflict();
                          });
                        },
                      ),
                      const SizedBox(height: 20),
                    ],
                    _buildLabel('Batch'),
                    _buildDropdown(
                      hint: 'Select Batch',
                      value: _selectedBatch,
                      items: _batches,
                      onChanged: (v) {
                        setState(() {
                          _selectedBatch = v;
                          _checkConflict();
                        });
                      },
                    ),
                    const SizedBox(height: 20),
                    _buildLabel('Date'),
                    GestureDetector(
                      onTap: _pickDate,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              _selectedDate == null ? 'YYYY-MM-DD' : _formatDate(_selectedDate!),
                              style: TextStyle(
                                fontSize: 15,
                                color: _selectedDate == null ? const Color(0xFF94A3B8) : const Color(0xFF1E293B),
                              ),
                            ),
                            const Icon(Icons.calendar_today_outlined, color: Color(0xFF94A3B8), size: 20),
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
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: const Color(0xFFE2E8F0)),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Text(
                                    _startTime == null ? '08:00 AM' : _formatTime(_startTime!),
                                    style: TextStyle(
                                      fontSize: 15,
                                      color: _startTime == null ? const Color(0xFF94A3B8) : const Color(0xFF1E293B),
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
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: const Color(0xFFE2E8F0)),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Text(
                                    _endTime == null ? '10:00 AM' : _formatTime(_endTime!),
                                    style: TextStyle(
                                      fontSize: 15,
                                      color: _endTime == null ? const Color(0xFF94A3B8) : const Color(0xFF1E293B),
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
                            width: 12, height: 12,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        else if (_selectedVenue != null && _selectedDate != null && _startTime != null && _endTime != null)
                          Row(
                            children: [
                              Container(
                                width: 6,
                                height: 6,
                                decoration: BoxDecoration(
                                  color: _isAvailable ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                _isAvailable ? 'Available' : 'Unavailable',
                                style: TextStyle(
                                  color: _isAvailable ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          )
                      ],
                    ),
                    _buildDropdown(
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
                    if (!_isAvailable && !_canOverwrite)
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
                            const Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444), size: 20),
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
                    else if (!_isAvailable && _canOverwrite)
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFFBEB),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFFDE68A)),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.info_outline, color: Color(0xFFD97706), size: 20),
                            const SizedBox(width: 12),
                            const Expanded(
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
                  onPressed: _isSubmitting ? null : _submit,
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
                      ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
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
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: DropdownButtonFormField<String>(
        value: value,
        onChanged: onChanged,
        items: items
            .map((s) => DropdownMenuItem(
                  value: s,
                  child: Text(s, style: const TextStyle(fontSize: 15, color: Color(0xFF1E293B))),
                ))
            .toList(),
        icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Color(0xFF94A3B8)),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 15),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        dropdownColor: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }
}
