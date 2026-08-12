import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/hall_model.dart';

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
      final response = await http.get(Uri.parse('$baseUrl/halls/'));
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

  static Future<List<HallModel>> getHallsWithStatus({
    String? search,
    bool? availableOnly,
    int? minCapacity,
    String? amenity,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (search != null && search.isNotEmpty) queryParams['search'] = search;
      if (availableOnly != null && availableOnly) queryParams['available_only'] = 'true';
      if (minCapacity != null) queryParams['min_capacity'] = minCapacity.toString();
      if (amenity != null && amenity.isNotEmpty) queryParams['amenity'] = amenity;

      final uri = Uri.parse('$baseUrl/halls/with-status').replace(queryParameters: queryParams.isEmpty ? null : queryParams);
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['response'] != null) {
          final list = data['response'] as List;
          return list.map((json) => HallModel.fromJson(json)).toList();
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  static Future<List<Map<String, dynamic>>> getHallSchedule(String hallId) async {
    try {
      final uri = Uri.parse('$baseUrl/halls/$hallId/schedule');
      final response = await http.get(uri);
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

