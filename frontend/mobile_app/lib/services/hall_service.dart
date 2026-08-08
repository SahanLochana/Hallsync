import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class HallService {
  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8000/api';
    } else {
      return 'http://localhost:8000/api';
    }
  }

  static Future<List<Map<String, dynamic>>> getHalls() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/halls'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['response'] != null) {
          return List<Map<String, dynamic>>.from(data['response']);
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
