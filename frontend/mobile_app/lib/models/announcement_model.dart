import 'package:flutter/material.dart';

class AnnouncementModel {
  final String sender;
  final String time;
  final String message;
  final Color accentColor;

  const AnnouncementModel({
    required this.sender,
    required this.time,
    required this.message,
    required this.accentColor,
  });
}
