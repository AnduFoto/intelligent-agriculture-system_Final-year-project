import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:massaye/core/config/app_config.dart';
import 'package:massaye/core/network/dio_client.dart';
import 'package:massaye/core/storage/secure_storage_service.dart';
import 'package:massaye/features/auth/data/models/user_model.dart';

class AuthRepository {
  final DioClient dioClient;
  final SecureStorageService storage;

  AuthRepository({required this.dioClient, required this.storage});

  Future<UserModel> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await dioClient.dio.post(
        '/auth/login/',
        data: {
          'email': email.trim().toLowerCase(),
          'password': password,
        },
      );

      final data = response.data;
      final access = data['access'];
      final refresh = data['refresh'];

      await storage.saveTokens(access: access, refresh: refresh);

      // Fetch full detailed user profile
      final profileUser = await getProfile();
      if (profileUser.role.toUpperCase() != 'FARMER') {
        await storage.clearAll();
        throw Exception(
          'Access Denied: This mobile app is exclusively designed for Farmers. '
          'Extension officers and administrators should use the web portal.',
        );
      }
      await storage.saveUserData(json.encode(profileUser.toJson()));
      return profileUser;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.connectionError ||
          e.response == null) {
        throw Exception(
          'Cannot connect to backend (${AppConfig.apiBaseUrl}).\n'
          'Ensure Django is running with: python manage.py runserver 0.0.0.0:8001',
        );
      }
      final msg = e.response?.data?['detail'] ??
          e.response?.data?['non_field_errors']?[0] ??
          'Authentication failed. Please check your credentials.';
      throw Exception(msg);
    }
  }

  Future<List<dynamic>> getLocationsTree() async {
    try {
      final response = await dioClient.dio.get('/locations/tree/');
      return response.data as List<dynamic>;
    } catch (_) {
      return [];
    }
  }

  Future<String> registerFarmer({
    required String firstName,
    String? middleName,
    required String lastName,
    required String email,
    required String phoneNumber,
    required String password,
    required String confirmPassword,
    required int regionId,
    int? zoneId,
    int? woredaId,
    int? specialWoredaId,
    required int kebeleId,
  }) async {
    try {
      final payload = {
        'first_name': firstName.trim(),
        'middle_name': middleName?.trim() ?? '',
        'last_name': lastName.trim(),
        'email': email.trim().toLowerCase(),
        'phone_number': phoneNumber.trim(),
        'password': password,
        'confirm_password': confirmPassword,
        'region': regionId,
        if (zoneId != null) 'zone': zoneId,
        if (woredaId != null) 'woreda': woredaId,
        if (specialWoredaId != null) 'special_woreda': specialWoredaId,
        'kebele': kebeleId,
        'language_preference': 'en',
      };

      final response = await dioClient.dio.post('/auth/register/', data: payload);
      return response.data['message'] ?? 'Registration successful. You can now log in.';
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.connectionError ||
          e.response == null) {
        throw Exception(
          'Cannot connect to server (${AppConfig.apiBaseUrl}). Ensure Django backend is running with 0.0.0.0:8001',
        );
      }
      final data = e.response?.data;
      if (data is Map) {
        final errors = <String>[];
        data.forEach((k, v) {
          if (v is List) {
            errors.add('$k: ${v.join(", ")}');
          } else {
            errors.add('$k: $v');
          }
        });
        if (errors.isNotEmpty) throw Exception(errors.join('\n'));
      }
      throw Exception('Registration failed. Please check your inputs.');
    }
  }

  Future<UserModel?> checkAuthStatus() async {
    final token = await storage.getAccessToken();
    if (token == null || token.isEmpty) return null;

    try {
      final user = await getProfile();
      if (user.role.toUpperCase() != 'FARMER') {
        await storage.clearAll();
        return null;
      }
      await storage.saveUserData(json.encode(user.toJson()));
      return user;
    } catch (_) {
      // Fallback to local storage if offline
      final cachedJson = await storage.getUserData();
      if (cachedJson != null && cachedJson.isNotEmpty) {
        final cachedUser = UserModel.fromJson(json.decode(cachedJson));
        if (cachedUser.role.toUpperCase() == 'FARMER') {
          return cachedUser;
        } else {
          await storage.clearAll();
          return null;
        }
      }
      return null;
    }
  }

  Future<UserModel> getProfile() async {
    final response = await dioClient.dio.get('/auth/profile/');
    return UserModel.fromJson(response.data);
  }

  Future<void> logout() async {
    final refreshToken = await storage.getRefreshToken();
    if (refreshToken != null && refreshToken.isNotEmpty) {
      try {
        await dioClient.dio.post(
          '/auth/logout/',
          data: {'refresh': refreshToken},
        );
      } catch (_) {
        // Silently clear local storage even if network request fails
      }
    }
    await storage.clearAll();
  }
}
