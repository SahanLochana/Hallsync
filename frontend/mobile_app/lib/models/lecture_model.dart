import 'package:flutter/material.dart';

class Lecture {
  final String id;
  final String title;
  final String subject;
  final String venue;
  final DateTime date;
  final TimeOfDay startTime;
  final TimeOfDay endTime;
  final String description;
  final List<String> tags;

  Lecture({
    required this.id,
    required this.title,
    required this.subject,
    required this.venue,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.description,
    required this.tags,
  });

  String get formattedTime {
    String fmt(TimeOfDay t) {
      final h = t.hourOfPeriod == 0 ? 12 : t.hourOfPeriod;
      final m = t.minute.toString().padLeft(2, '0');
      final p = t.period == DayPeriod.am ? 'AM' : 'PM';
      return '$h:$m $p';
    }

    return '${fmt(startTime)} - ${fmt(endTime)}';
  }
}
