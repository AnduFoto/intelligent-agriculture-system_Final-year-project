import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import 'package:massaye/core/network/dio_client.dart';
import 'package:massaye/features/community/data/models/comment_model.dart';
import 'package:massaye/features/community/data/models/post_model.dart';

class CommunityRepository {
  final DioClient dioClient;

  CommunityRepository({required this.dioClient});

  Future<List<PostModel>> getPosts({
    String? cropTag,
    String? roleFilter,
    String? search,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (cropTag != null && cropTag.isNotEmpty) queryParams['crop'] = cropTag;
      if (roleFilter != null && roleFilter.isNotEmpty && roleFilter != 'All Roles') {
        queryParams['role'] = roleFilter.toUpperCase();
      }
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final response = await dioClient.dio.get(
        '/community/posts/',
        queryParameters: queryParams,
      );

      final List results = response.data['results'] ?? response.data;
      return results.map((json) => PostModel.fromJson(json)).toList();
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to load community posts.';
      throw Exception(detail);
    }
  }

  Future<PostModel> createPost({
    required String content,
    String? cropTag,
    XFile? mediaFile,
  }) async {
    try {
      final mapData = <String, dynamic>{
        'content': content.trim(),
      };
      if (cropTag != null && cropTag.isNotEmpty) {
        mapData['crop_name'] = cropTag;
      }

      if (mediaFile != null) {
        final fileName = mediaFile.name.isNotEmpty
            ? mediaFile.name
            : mediaFile.path.split(RegExp(r'[/\\]')).last;
        final bytes = await mediaFile.readAsBytes();
        final formData = FormData.fromMap({
          'content': content.trim(),
          if (cropTag != null && cropTag.isNotEmpty) 'crop_name': cropTag,
          'files': MultipartFile.fromBytes(
            bytes,
            filename: fileName,
          ),
        });
        final response = await dioClient.dio.post('/community/posts/', data: formData);
        return PostModel.fromJson(response.data);
      } else {
        final response = await dioClient.dio.post('/community/posts/', data: mapData);
        return PostModel.fromJson(response.data);
      }
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ??
          e.response?.data?['content']?[0] ??
          'Could not submit community post.';
      throw Exception(detail);
    }
  }

  Future<Map<String, dynamic>> toggleLike(int postId) async {
    try {
      final response = await dioClient.dio.post('/community/posts/$postId/like/');
      return response.data;
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Like action failed.';
      throw Exception(detail);
    }
  }

  Future<List<CommentModel>> getComments(int postId) async {
    try {
      final response = await dioClient.dio.get(
        '/community/comments/',
        queryParameters: {'post': postId},
      );
      final List results = response.data['results'] ?? response.data;
      return results.map((json) => CommentModel.fromJson(json)).toList();
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Could not load post comments.';
      throw Exception(detail);
    }
  }

  Future<CommentModel> addComment(int postId, String content) async {
    try {
      final response = await dioClient.dio.post(
        '/community/comments/',
        data: {
          'post': postId,
          'content': content.trim(),
        },
      );
      return CommentModel.fromJson(response.data);
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Could not post comment.';
      throw Exception(detail);
    }
  }
}
