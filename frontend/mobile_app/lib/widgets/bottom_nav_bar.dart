import 'package:flutter/material.dart';
import 'dart:async';
import '../constants/app_colors.dart';
import '../services/notification_service.dart';
import '../services/auth_service.dart';
import '../services/websocket_service.dart';

class BottomNavBar extends StatefulWidget {
  final int selectedIndex;
  final ValueChanged<int> onItemTapped;

  const BottomNavBar({
    super.key,
    required this.selectedIndex,
    required this.onItemTapped,
  });

  @override
  State<BottomNavBar> createState() => _BottomNavBarState();
}

class _BottomNavBarState extends State<BottomNavBar> {
  int _unreadCount = 0;
  StreamSubscription? _wsSubscription;

  static const List<Map<String, dynamic>> _items = [
    {'icon': Icons.home_rounded, 'label': 'Home'},
    {'icon': Icons.notifications_rounded, 'label': 'Notifications'},
    {'icon': Icons.settings_rounded, 'label': 'Settings'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchUnreadCount();
    
    // Connect WebSocket and listen for real-time notifications
    final wsService = WebSocketService();
    wsService.connect();
    
    _wsSubscription = wsService.notificationStream.listen((notification) {
      if (mounted) {
        setState(() {
          _unreadCount++;
        });
      }
    });
  }

  @override
  void dispose() {
    _wsSubscription?.cancel();
    super.dispose();
  }

  Future<void> _fetchUnreadCount() async {
    final email = await AuthService.getEmail();
    if (email != null) {
      final notifications = await NotificationService.fetchNotifications(email);
      if (mounted) {
        setState(() {
          _unreadCount = notifications.where((n) => !n.isRead).length;
        });
      }
    }
  }
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardWhite,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(_items.length, (index) {
              final isSelected = widget.selectedIndex == index;
              return GestureDetector(
                onTap: () => widget.onItemTapped(index),
                behavior: HitTestBehavior.opaque,
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 6,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Icon(
                            _items[index]['icon'] as IconData,
                            color: isSelected
                                ? AppColors.primaryBlue
                                : AppColors.textGrey,
                            size: 24,
                          ),
                          if (index == 1 && _unreadCount > 0)
                            Positioned(
                              right: -2,
                              top: -2,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(
                                  color: Colors.red,
                                  shape: BoxShape.circle,
                                ),
                                child: Text(
                                  _unreadCount > 9 ? '9+' : '$_unreadCount',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 8,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _items[index]['label'] as String,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: isSelected
                              ? FontWeight.w600
                              : FontWeight.w400,
                          color: isSelected
                              ? AppColors.primaryBlue
                              : AppColors.textGrey,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
