import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage();

  static const String _keyAccessToken = 'jwt_access_token';
  static const String _keyRefreshToken = 'jwt_refresh_token';
  static const String _keyUserJson = 'user_data_json';
  static const String _keyLanguage = 'user_language_preference';

  Future<void> saveTokens({required String access, required String refresh}) async {
    await _storage.write(key: _keyAccessToken, value: access);
    await _storage.write(key: _keyRefreshToken, value: refresh);
  }

  Future<String?> getAccessToken() async {
    return await _storage.read(key: _keyAccessToken);
  }

  Future<String?> getRefreshToken() async {
    return await _storage.read(key: _keyRefreshToken);
  }

  Future<void> saveUserData(String userJson) async {
    await _storage.write(key: _keyUserJson, value: userJson);
  }

  Future<String?> getUserData() async {
    return await _storage.read(key: _keyUserJson);
  }

  Future<void> saveLanguage(String lang) async {
    await _storage.write(key: _keyLanguage, value: lang);
  }

  Future<String?> getLanguage() async {
    return await _storage.read(key: _keyLanguage);
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
