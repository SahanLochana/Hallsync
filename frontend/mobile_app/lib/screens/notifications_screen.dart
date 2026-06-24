import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/announcement_model.dart';
import '../widgets/announcement_card.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  final List<AnnouncementModel> _announcements = const [
    AnnouncementModel(
      sender: 'University Admin',
      time: '2h ago',
      message:
          'The central library will be closed this weekend for annual maintenance. Digital...',
      accentColor: AppColors.primaryBlue,
    ),
    AnnouncementModel(
      sender: 'Faculty Office',
      time: '5h ago',
      message:
          'End-of-term project submission deadline extended to Friday, Nov 3rd at 23:59.',
      accentColor: AppColors.orangeAccent,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.bgColor,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Text(
                'Notifications',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryBlue,
                ),
              ),
            ),
            Expanded(
              child: _announcements.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.notifications_none, size: 64, color: AppColors.textGrey),
                          SizedBox(height: 16),
                          Text(
                            'No notifications yet',
                            style: TextStyle(
                              fontSize: 16,
                              color: AppColors.textGrey,
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: _announcements.length,
                      itemBuilder: (context, index) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: AnnouncementCard(announcement: _announcements[index]),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
