import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';
import '../../models/lecture_model.dart';
import 'lecture_detail_screen.dart';
import 'create_lecture_screen.dart';

class TimetableScreen extends StatefulWidget {
  final List<Lecture> lectures;

  const TimetableScreen({super.key, required this.lectures});

  @override
  State<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends State<TimetableScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1E3A8A)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Weekly Timetable',
          style: TextStyle(
            color: Color(0xFF111827),
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: SfCalendar(
        view: CalendarView.workWeek,
        timeSlotViewSettings: const TimeSlotViewSettings(
          startHour: 7,
          endHour: 20,
          nonWorkingDays: <int>[DateTime.sunday],
          timeFormat: 'h a',
          dayFormat: 'EEE',
        ),
        dataSource: LectureDataSource(widget.lectures),
        appointmentBuilder: (context, calendarAppointmentDetails) {
          final Lecture lecture = calendarAppointmentDetails.appointments.first;
          final bool isOwner = lecture.lecturerId == 'lecturer123';
          
          return Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: isOwner ? const Color(0xFF1E3A8A) : const Color(0xFF475569),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  lecture.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  lecture.venue,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 10,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          );
        },
        onTap: (CalendarTapDetails details) {
          if (details.appointments != null && details.appointments!.isNotEmpty) {
            final Lecture lecture = details.appointments!.first;
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => LectureDetailScreen(lecture: lecture),
              ),
            );
          } else if (details.date != null) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => CreateLectureScreen(
                  initialDate: details.date,
                  initialStartTime: TimeOfDay.fromDateTime(details.date!),
                  onCreated: (Lecture newLecture) {
                    setState(() {
                      widget.lectures.add(newLecture);
                    });
                  },
                ),
              ),
            );
          }
        },
      ),
    );
  }
}

class LectureDataSource extends CalendarDataSource {
  LectureDataSource(List<Lecture> source) {
    appointments = source;
  }

  @override
  DateTime getStartTime(int index) {
    final Lecture lecture = appointments![index];
    return DateTime(
      lecture.date.year,
      lecture.date.month,
      lecture.date.day,
      lecture.startTime.hour,
      lecture.startTime.minute,
    );
  }

  @override
  DateTime getEndTime(int index) {
    final Lecture lecture = appointments![index];
    return DateTime(
      lecture.date.year,
      lecture.date.month,
      lecture.date.day,
      lecture.endTime.hour,
      lecture.endTime.minute,
    );
  }

  @override
  String getSubject(int index) {
    return (appointments![index] as Lecture).title;
  }

  @override
  Color getColor(int index) {
    final Lecture lecture = appointments![index];
    return lecture.lecturerId == 'lecturer123' ? const Color(0xFF1E3A8A) : const Color(0xFF475569);
  }

  @override
  bool isAllDay(int index) {
    return false;
  }
}
