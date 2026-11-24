import 'package:dio/dio.dart';
import 'package:massaye/core/network/dio_client.dart';
import 'package:massaye/features/education/data/models/guide_model.dart';

class EducationRepository {
  final DioClient dioClient;

  EducationRepository({required this.dioClient});

  /// Lists educational guides/resources with optional search and filters
  Future<List<GuideModel>> getResources({
    String? search,
    String? publisherType,
    int? categoryId,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (search != null && search.isNotEmpty) queryParams['search'] = search;
      if (publisherType != null && publisherType.isNotEmpty) {
        queryParams['publisher_type'] = publisherType;
      }
      if (categoryId != null) queryParams['category'] = categoryId;

      final response = await dioClient.dio.get(
        '/education/resources/',
        queryParameters: queryParams,
      );
      final dynamic data = response.data;
      final List results = (data is Map && data['results'] != null)
          ? data['results']
          : (data is List ? data : []);
      return results.map((json) => GuideModel.fromJson(json)).toList();
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to load educational guides.';
      throw Exception(detail);
    }
  }

  /// Alias for backward compatibility
  Future<List<GuideModel>> getGuides() => getResources();
  Future<GuideModel> getGuideDetail(int id) => getResourceDetail(id);

  /// Gets single resource detail including markdown content and attachments
  Future<GuideModel> getResourceDetail(int id) async {
    try {
      final response = await dioClient.dio.get('/education/resources/$id/');
      return GuideModel.fromJson(response.data);
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to load guide details.';
      throw Exception(detail);
    }
  }

  /// Toggles bookmark on a resource, returns true if now bookmarked, false if unbookmarked
  Future<bool> toggleBookmark(int id) async {
    try {
      final response = await dioClient.dio.post('/education/resources/$id/bookmark/');
      final status = response.data?['status'];
      return status == 'bookmarked';
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to update bookmark.';
      throw Exception(detail);
    }
  }

  /// Lists bookmarked resources for the current user
  Future<List<GuideModel>> getBookmarkedResources() async {
    try {
      final response = await dioClient.dio.get('/education/resources/bookmarked/');
      final dynamic data = response.data;
      final List results = (data is Map && data['results'] != null)
          ? data['results']
          : (data is List ? data : []);
      return results
          .map((json) => GuideModel.fromJson(json).copyWith(isBookmarked: true))
          .toList();
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to load bookmarks.';
      throw Exception(detail);
    }
  }

  /// Gets AI-driven educational recommendations by topic
  Future<List<GuideModel>> getRecommendations(List<String> topics) async {
    try {
      final queryParams = {'topics': topics.join(',')};
      final response = await dioClient.dio.get(
        '/education/recommendations/',
        queryParameters: queryParams,
      );
      final dynamic data = response.data;
      final List results = (data is Map && data['results'] != null)
          ? data['results']
          : (data is List ? data : []);
      return results.map((json) => GuideModel.fromJson(json)).toList();
    } on DioException catch (_) {
      return [];
    }
  }
}
