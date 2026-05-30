import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:tsukiyomi/config/api_config.dart';
import 'package:tsukiyomi/services/auth_service.dart';

class TsukiyomiApi {
  Future<Map<String, String>> _headers() async {
    final token = await AuthService.instance.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>?> getUser(String phone) async {
    final response = await http.get(
      ApiConfig.uri('/user/get/$phone'),
      headers: await _headers(),
    );
    if (response.statusCode >= 400 || response.body.isEmpty) return null;
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>?> createUser(String phone) async {
    final response = await http.post(
      ApiConfig.uri('/user/create'),
      headers: await _headers(),
      body: jsonEncode({'phone': phone}),
    );
    if (response.statusCode >= 400) return null;
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<List<dynamic>> getGenres() async {
    final response = await http.get(
      ApiConfig.uri('/genre/list/all'),
      headers: await _headers(),
    );
    if (response.statusCode >= 400) return [];
    return jsonDecode(response.body) as List<dynamic>;
  }

  Future<Map<String, dynamic>?> getGame(int refId) async {
    final response = await http.get(
      ApiConfig.uri('/game/get/$refId'),
      headers: await _headers(),
    );
    if (response.statusCode >= 400 || response.body == 'null') return null;
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  Future<List<dynamic>> getRecommended(String phone) async {
    final response = await http.get(
      ApiConfig.uri('/user/recommended/$phone'),
      headers: await _headers(),
    );
    if (response.statusCode >= 400) return [];
    return jsonDecode(response.body) as List<dynamic>;
  }

  Future<bool> isFavorite(String phone, String romId) async {
    final response = await http.get(
      ApiConfig.uri('/user/favorite/$phone/$romId'),
      headers: await _headers(),
    );
    if (response.statusCode >= 400) return false;
    return jsonDecode(response.body) == true;
  }

  Future<bool?> toggleFavorite(String phone, Map<String, dynamic> rom) async {
    final response = await http.put(
      ApiConfig.uri('/user/edit/$phone'),
      headers: await _headers(),
      body: jsonEncode({
        'update': 'favorite',
        'favorite': rom,
      }),
    );
    if (response.statusCode >= 400) return null;
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return data['liked'] as bool?;
  }
}
