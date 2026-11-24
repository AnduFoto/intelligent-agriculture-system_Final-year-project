import 'package:dio/dio.dart';
import 'package:massaye/core/config/app_config.dart';
import 'package:massaye/core/storage/secure_storage_service.dart';

class AuthInterceptor extends Interceptor {
  final SecureStorageService storage;
  final Dio dio;

  AuthInterceptor({required this.storage, required this.dio});

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await storage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    options.headers['Accept'] = 'application/json';
    return handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      final refreshToken = await storage.getRefreshToken();
      if (refreshToken != null && refreshToken.isNotEmpty) {
        try {
          final refreshDio = Dio();
          final response = await refreshDio.post(
            '${AppConfig.apiBaseUrl}/auth/token/refresh/',
            data: {'refresh': refreshToken},
          );

          if (response.statusCode == 200 && response.data != null) {
            final newAccess = response.data['access'];
            final newRefresh = response.data['refresh'] ?? refreshToken;

            await storage.saveTokens(access: newAccess, refresh: newRefresh);

            final opts = err.requestOptions;
            opts.headers['Authorization'] = 'Bearer $newAccess';

            final clonedRequest = await dio.fetch(opts);
            return handler.resolve(clonedRequest);
          }
        } catch (_) {
          await storage.clearAll();
        }
      }
    }
    return handler.next(err);
  }
}
