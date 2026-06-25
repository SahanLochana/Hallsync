import 'package:flutter/material.dart';
import 'dart:async';
import '../constants/app_colors.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';
import '../services/auth_service.dart';
import '../services/websocket_service.dart';
import 'package:timeago/timeago.dart' as timeago;

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<NotificationModel> _notifications = [];
  bool _isLoading = true;
  StreamSubscription? _wsSubscription;

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
    
    _wsSubscription = WebSocketService().notificationStream.listen((notification) {
      if (mounted) {
        setState(() {
          _notifications.insert(0, notification);
        });
      }
    });
  }

  @override
  void dispose() {
    _wsSubscription?.cancel();
    super.dispose();
  }

  Future<void> _fetchNotifications() async {
    setState(() => _isLoading = true);
    final email = await AuthService.getEmail();
    if (email != null) {
      final data = await NotificationService.fetchNotifications(email);
      if (mounted) {
        setState(() {
          _notifications = data;
          _isLoading = false;
        });
      }
    } else {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _markAsRead(NotificationModel notification) async {
    if (notification.isRead) return;
    
    final success = await NotificationService.markAsRead(notification.id);
    if (success && mounted) {
      setState(() {
        final index = _notifications.indexWhere((n) => n.id == notification.id);
        if (index != -1) {
          _notifications[index] = NotificationModel(
            id: notification.id,
            recipientUserId: notification.recipientUserId,
            title: notification.title,
            message: notification.message,
            relatedLectureId: notification.relatedLectureId,
            isRead: true,
            createdAt: notification.createdAt,
          );
        }
      });
    }
  }

  Widget _buildNotificationCard(NotificationModel notification) {
    return GestureDetector(
      onTap: () => _markAsRead(notification),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: notification.isRead ? AppColors.cardWhite : AppColors.primaryBlue.withOpacity(0.05),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: notification.isRead ? Colors.transparent : AppColors.primaryBlue.withOpacity(0.3),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: IntrinsicHeight(
          child: Row(
            children: [
              Container(
                width: 4,
                decoration: BoxDecoration(
                  color: notification.isRead ? AppColors.textGrey.withOpacity(0.3) : AppColors.primaryBlue,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(14),
                    bottomLeft: Radius.circular(14),
                  ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            notification.title,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: notification.isRead ? FontWeight.w600 : FontWeight.bold,
                              color: notification.isRead ? AppColors.textGrey : AppColors.primaryBlue,
                            ),
                          ),
                          Text(
                            timeago.format(notification.createdAt),
                            style: TextStyle(
                              fontSize: 12,
                              color: notification.isRead ? AppColors.textGrey.withOpacity(0.7) : AppColors.primaryBlue.withOpacity(0.8),
                              fontWeight: notification.isRead ? FontWeight.w400 : FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        notification.message,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: notification.isRead ? FontWeight.w500 : FontWeight.w600,
                          color: notification.isRead ? AppColors.textGrey : AppColors.textDark,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.bgColor,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Notifications',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primaryBlue,
                    ),
                  ),
                  if (_isLoading)
                    const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                ],
              ),
            ),
            Expanded(
              child: RefreshIndicator(
                onRefresh: _fetchNotifications,
                child: _isLoading && _notifications.isEmpty
                    ? const Center(child: CircularProgressIndicator())
                    : _notifications.isEmpty
                        ? ListView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            children: [
                              SizedBox(height: MediaQuery.of(context).size.height * 0.3),
                              Center(
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
                              ),
                            ],
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                            physics: const AlwaysScrollableScrollPhysics(),
                            itemCount: _notifications.length,
                            itemBuilder: (context, index) {
                              return _buildNotificationCard(_notifications[index]);
                            },
                          ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
