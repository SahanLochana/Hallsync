import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../models/notification_model.dart';
import 'auth_service.dart';

class WebSocketService {
  static final WebSocketService _instance = WebSocketService._internal();
  factory WebSocketService() => _instance;

  WebSocketChannel? _channel;
  final _notificationController = StreamController<NotificationModel>.broadcast();

  WebSocketService._internal();

  Stream<NotificationModel> get notificationStream => _notificationController.stream;

  Future<void> connect() async {
    final email = await AuthService.getEmail();
    if (email == null) return;

    if (_channel != null) {
      disconnect();
    }

    try {
      final wsUrl = Uri.parse('ws://localhost:8000/api/ws/notifications/$email');
      _channel = WebSocketChannel.connect(wsUrl);

      _channel!.stream.listen(
        (message) {
          try {
            final data = jsonDecode(message);
            final notification = NotificationModel.fromJson(data);
            _notificationController.add(notification);
          } catch (e) {
            print('Error parsing websocket message: $e');
          }
        },
        onError: (error) {
          print('WebSocket error: $error');
        },
        onDone: () {
          print('WebSocket connection closed');
        },
      );
    } catch (e) {
      print('WebSocket connection failed: $e');
    }
  }

  void disconnect() {
    _channel?.sink.close();
    _channel = null;
  }
}
