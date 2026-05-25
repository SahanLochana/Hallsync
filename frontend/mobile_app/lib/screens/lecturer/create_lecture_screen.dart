import 'package:flutter/material.dart';
import '../../models/lecture_model.dart';

class CreateLectureScreen extends StatefulWidget {
  final void Function(Lecture) onCreated;

  const CreateLectureScreen({super.key, required this.onCreated});

  @override
  State<CreateLectureScreen> createState() => _CreateLectureScreenState();
}

class _CreateLectureScreenState extends State<CreateLectureScreen> {
  final _formKey = GlobalKey<FormState>();

  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _tagController = TextEditingController();

  String? _selectedSubject;
  String? _selectedVenue;
  DateTime _selectedDate = DateTime.now();
  TimeOfDay _startTime = const TimeOfDay(hour: 8, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 10, minute: 0);
  final List<String> _tags = [];
  bool _isSubmitting = false;

  final List<String> _subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Engineering',
    'Economics',
    'Literature',
  ];

  final List<String> _venues = [
    'Mini Auditorium',
    'Main Hall',
    'Lecture Room 101',
    'Lecture Room 102',
    'Lab A',
    'Lab B',
    'Online / Virtual',
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _tagController.dispose();
    super.dispose();
  }

  // ── Pickers ───────────────────────────────────

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(
            primary: Color(0xFF283593),
            onPrimary: Colors.white,
            surface: Colors.white,
            onSurface: Color(0xFF1A1A1A),
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  Future<void> _pickTime({required bool isStart}) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: isStart ? _startTime : _endTime,
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(
            primary: Color(0xFF283593),
            onPrimary: Colors.white,
            surface: Colors.white,
            onSurface: Color(0xFF1A1A1A),
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() => isStart ? _startTime = picked : _endTime = picked);
    }
  }

  // ── Tags ──────────────────────────────────────

  void _addTag(String tag) {
    final t = tag.trim();
    if (t.isNotEmpty && !_tags.contains(t)) setState(() => _tags.add(t));
    _tagController.clear();
  }

  void _removeTag(String tag) => setState(() => _tags.remove(tag));

  // ── Submit ────────────────────────────────────

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedSubject == null) {
      _showSnack('Please select a subject');
      return;
    }
    if (_selectedVenue == null) {
      _showSnack('Please select a venue');
      return;
    }

    setState(() => _isSubmitting = true);
    await Future.delayed(const Duration(milliseconds: 600));

    final lecture = Lecture(
      title: _titleController.text.trim(),
      subject: _selectedSubject!,
      venue: _selectedVenue!,
      date: _selectedDate,
      startTime: _startTime,
      endTime: _endTime,
      description: _descriptionController.text.trim(),
      tags: List.from(_tags),
    );

    widget.onCreated(lecture);

    if (mounted) {
      setState(() => _isSubmitting = false);
      _showSuccessAndPop();
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: const Color(0xFF283593),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _showSuccessAndPop() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  color: Color(0xFFE8EAF6),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_rounded,
                  color: Color(0xFF283593),
                  size: 36,
                ),
              ),
              const SizedBox(height: 18),
              const Text(
                'Lecture Created!',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A237E),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Your lecture has been successfully\nadded to the schedule.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: Color(0xFF757575)),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context); // close dialog
                    Navigator.pop(context); // go back to home
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF283593),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Back to Dashboard',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Helpers ───────────────────────────────────

  String _formatDate(DateTime d) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${d.day} ${months[d.month - 1]} ${d.year}';
  }

  String _formatTime(TimeOfDay t) {
    final h = t.hourOfPeriod == 0 ? 12 : t.hourOfPeriod;
    final m = t.minute.toString().padLeft(2, '0');
    final p = t.period == DayPeriod.am ? 'AM' : 'PM';
    return '$h:$m $p';
  }

  // ── Build ─────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F0),
      appBar: _buildAppBar(),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _sectionLabel('LECTURE DETAILS'),
              const SizedBox(height: 12),
              _buildTextField(
                controller: _titleController,
                label: 'Lecture Title',
                hint: 'e.g. Introduction to Calculus',
                icon: Icons.title_rounded,
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Title is required'
                    : null,
              ),
              const SizedBox(height: 12),
              _buildDropdown(
                label: 'Subject',
                hint: 'Select subject',
                icon: Icons.subject_rounded,
                value: _selectedSubject,
                items: _subjects,
                onChanged: (v) => setState(() => _selectedSubject = v),
              ),
              const SizedBox(height: 12),
              _buildTextField(
                controller: _descriptionController,
                label: 'Description (optional)',
                hint: 'Brief overview of what will be covered…',
                icon: Icons.notes_rounded,
                maxLines: 3,
              ),
              const SizedBox(height: 24),
              _sectionLabel('SCHEDULE'),
              const SizedBox(height: 12),
              _buildDateTile(),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _buildTimeTile(isStart: true)),
                  const SizedBox(width: 12),
                  Expanded(child: _buildTimeTile(isStart: false)),
                ],
              ),
              const SizedBox(height: 24),
              _sectionLabel('VENUE'),
              const SizedBox(height: 12),
              _buildDropdown(
                label: 'Venue',
                hint: 'Select venue',
                icon: Icons.location_on_outlined,
                value: _selectedVenue,
                items: _venues,
                onChanged: (v) => setState(() => _selectedVenue = v),
              ),
              const SizedBox(height: 24),
              _sectionLabel('TAGS (OPTIONAL)'),
              const SizedBox(height: 12),
              _buildTagInput(),
              if (_tags.isNotEmpty) ...[
                const SizedBox(height: 10),
                _buildTagChips(),
              ],
              const SizedBox(height: 32),
              _buildSubmitButton(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  AppBar _buildAppBar() {
    return AppBar(
      backgroundColor: const Color(0xFFF5F5F0),
      elevation: 0,
      leading: GestureDetector(
        onTap: () => Navigator.pop(context),
        child: Container(
          margin: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: const Icon(
            Icons.arrow_back_ios_new_rounded,
            color: Color(0xFF1A237E),
            size: 18,
          ),
        ),
      ),
      title: const Text(
        'Create Lecture',
        style: TextStyle(
          color: Color(0xFF1A237E),
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
      centerTitle: true,
    );
  }

  Widget _sectionLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        color: Color(0xFF5C6BC0),
        letterSpacing: 1.2,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        validator: validator,
        style: const TextStyle(fontSize: 14, color: Color(0xFF1A1A1A)),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          labelStyle: const TextStyle(color: Color(0xFF9E9E9E), fontSize: 13),
          hintStyle: const TextStyle(color: Color(0xFFBDBDBD), fontSize: 13),
          prefixIcon: Icon(icon, color: const Color(0xFF3949AB), size: 20),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFF3949AB), width: 1.5),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Colors.redAccent, width: 1.5),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Colors.redAccent, width: 1.5),
          ),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String hint,
    required IconData icon,
    required String? value,
    required List<String> items,
    required void Function(String?) onChanged,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: DropdownButtonFormField<String>(
        value: value,
        onChanged: onChanged,
        items: items
            .map(
              (s) => DropdownMenuItem(
                value: s,
                child: Text(s, style: const TextStyle(fontSize: 14)),
              ),
            )
            .toList(),
        style: const TextStyle(fontSize: 14, color: Color(0xFF1A1A1A)),
        icon: const Icon(
          Icons.keyboard_arrow_down_rounded,
          color: Color(0xFF9E9E9E),
        ),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          labelStyle: const TextStyle(color: Color(0xFF9E9E9E), fontSize: 13),
          prefixIcon: Icon(icon, color: const Color(0xFF3949AB), size: 20),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFF3949AB), width: 1.5),
          ),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
        ),
        dropdownColor: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
    );
  }

  Widget _buildDateTile() {
    return GestureDetector(
      onTap: _pickDate,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            const Icon(
              Icons.calendar_month_outlined,
              color: Color(0xFF3949AB),
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Date',
                    style: TextStyle(fontSize: 11, color: Color(0xFF9E9E9E)),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _formatDate(_selectedDate),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF1A1A1A),
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.keyboard_arrow_down_rounded,
              color: Color(0xFF9E9E9E),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeTile({required bool isStart}) {
    return GestureDetector(
      onTap: () => _pickTime(isStart: isStart),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(
              isStart ? Icons.play_circle_outline : Icons.stop_circle_outlined,
              color: const Color(0xFF3949AB),
              size: 20,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isStart ? 'Start Time' : 'End Time',
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF9E9E9E),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _formatTime(isStart ? _startTime : _endTime),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF1A1A1A),
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.keyboard_arrow_down_rounded,
              color: Color(0xFF9E9E9E),
              size: 18,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTagInput() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextField(
        controller: _tagController,
        style: const TextStyle(fontSize: 14, color: Color(0xFF1A1A1A)),
        onSubmitted: _addTag,
        decoration: InputDecoration(
          labelText: 'Add Tag',
          hintText: 'e.g. Calculus, Exam Prep — press Enter',
          labelStyle: const TextStyle(color: Color(0xFF9E9E9E), fontSize: 13),
          hintStyle: const TextStyle(color: Color(0xFFBDBDBD), fontSize: 13),
          prefixIcon: const Icon(
            Icons.tag_rounded,
            color: Color(0xFF3949AB),
            size: 20,
          ),
          suffixIcon: IconButton(
            onPressed: () => _addTag(_tagController.text),
            icon: const Icon(
              Icons.add_circle_outline_rounded,
              color: Color(0xFF3949AB),
              size: 22,
            ),
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFF3949AB), width: 1.5),
          ),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildTagChips() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _tags.map((tag) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFFE8EAF6),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                tag,
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF283593),
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(width: 6),
              GestureDetector(
                onTap: () => _removeTag(tag),
                child: const Icon(
                  Icons.close_rounded,
                  size: 14,
                  color: Color(0xFF5C6BC0),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _isSubmitting ? null : _submit,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF283593),
          foregroundColor: Colors.white,
          disabledBackgroundColor: const Color(0xFF7986CB),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          elevation: 4,
          shadowColor: const Color(0xFF1A237E).withOpacity(0.4),
        ),
        child: _isSubmitting
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.white,
                ),
              )
            : const Text(
                'Create Lecture',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ),
      ),
    );
  }
}
