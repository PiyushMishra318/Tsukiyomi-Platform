import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:tsukiyomi/config/api_config.dart';

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  static const _tokenKey = 'tsukiyomi_access_token';
  static const _phoneKey = 'tsukiyomi_phone';
  final _storage = const FlutterSecureStorage();

  Future<String?> getToken() => _storage.read(key: _tokenKey);
  Future<String?> getPhone() => _storage.read(key: _phoneKey);

  Future<void> saveSession(String token, String phone) async {
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _phoneKey, value: phone);
  }

  Future<void> clearSession() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _phoneKey);
  }

  Future<Map<String, dynamic>?> register({
    required String phone,
    required String password,
  }) async {
    final response = await http.post(
      ApiConfig.uri('/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone, 'password': password}),
    );
    if (response.statusCode >= 400) return null;
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final token = data['accessToken'] as String?;
    if (token == null) return null;
    await saveSession(token, phone);
    return data['user'] as Map<String, dynamic>?;
  }

  Future<Map<String, dynamic>?> login({
    required String phone,
    required String password,
  }) async {
    final response = await http.post(
      ApiConfig.uri('/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone, 'password': password}),
    );
    if (response.statusCode >= 400) return null;
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final token = data['accessToken'] as String?;
    if (token == null) return null;
    await saveSession(token, phone);
    return data['user'] as Map<String, dynamic>?;
  }

  Future<bool> restoreSession() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }
}
