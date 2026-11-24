import 'package:dio/dio.dart';
import 'package:massaye/core/config/app_config.dart';
import 'package:massaye/core/network/auth_interceptor.dart';
import 'package:massaye/core/storage/secure_storage_service.dart';

class DioClient {
  late final Dio dio;
  final SecureStorageService storage;

  DioClient({required this.storage}) {
    dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 20),
        sendTimeout: const Duration(seconds: 30),
      ),
    );

    dio.interceptors.add(AuthInterceptor(storage: storage, dio: dio));
  }
}
