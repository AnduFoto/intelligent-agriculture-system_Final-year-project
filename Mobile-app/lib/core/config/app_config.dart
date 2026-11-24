import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String get apiBaseUrl {
    final envUrl = dotenv.env['API_BASE_URL'];
    if (envUrl != null && envUrl.isNotEmpty) {
      return envUrl;
    }
    if (kIsWeb ||
        defaultTargetPlatform == TargetPlatform.windows ||
        defaultTargetPlatform == TargetPlatform.macOS ||
        defaultTargetPlatform == TargetPlatform.linux) {
      return 'http://127.0.0.1:8001/api';
    }
    // Android device / emulator
    return 'http://192.168.43.145:8001/api';
  }

  static String get mediaBaseUrl {
    final envMedia = dotenv.env['MEDIA_BASE_URL'];
    if (envMedia != null && envMedia.isNotEmpty) {
      return envMedia;
    }
    if (kIsWeb ||
        defaultTargetPlatform == TargetPlatform.windows ||
        defaultTargetPlatform == TargetPlatform.macOS ||
        defaultTargetPlatform == TargetPlatform.linux) {
      return 'http://127.0.0.1:8001';
    }
    return 'http://192.168.43.145:8001';
  }

  static String get appName => dotenv.env['APP_NAME'] ?? 'Massaye';

  static String get environment => dotenv.env['ENV'] ?? 'production';

  static String resolveMediaUrl(String? path) {
    if (path == null || path.trim().isEmpty) return '';
    final trimmed = path.trim();

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      // Re-map host for physical mobile devices if backend returned 127.0.0.1 or localhost
      if (!kIsWeb && (trimmed.contains('127.0.0.1:8001') || trimmed.contains('localhost:8001'))) {
        final host = mediaBaseUrl.replaceAll('http://', '').replaceAll('https://', '');
        return trimmed.replaceAll('127.0.0.1:8001', host).replaceAll('localhost:8001', host);
      }
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      return '$mediaBaseUrl$trimmed';
    }
    return '$mediaBaseUrl/$trimmed';
  }
}
