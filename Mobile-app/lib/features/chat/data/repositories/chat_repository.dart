import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import 'package:massaye/core/network/dio_client.dart';
import 'package:massaye/features/chat/data/models/chat_message_model.dart';
import 'package:massaye/features/chat/data/models/conversation_model.dart';

class ChatRepository {
  final DioClient dioClient;

  ChatRepository({required this.dioClient});

  Future<List<ConversationModel>> getConversations() async {
    try {
      final response = await dioClient.dio.get('/chat/conversations/');
      final List results = response.data['results'] ?? response.data;
      return results.map((json) => ConversationModel.fromJson(json)).toList();
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to load conversations.';
      throw Exception(detail);
    }
  }

  Future<ConversationModel> startOrCreateConversation(int targetUserId) async {
    try {
      final response = await dioClient.dio.post(
        '/chat/conversations/',
        data: {'recipient_id': targetUserId},
      );
      return ConversationModel.fromJson(response.data);
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Could not start conversation.';
      throw Exception(detail);
    }
  }

  Future<List<ChatMessageModel>> getMessages(int conversationId) async {
    try {
      final response = await dioClient.dio.get('/chat/conversations/$conversationId/messages/');
      final List results = response.data['results'] ?? response.data;
      return results.map((json) => ChatMessageModel.fromJson(json)).toList();
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to load chat messages.';
      throw Exception(detail);
    }
  }

  Future<ChatMessageModel> sendTextMessage({
    required int conversationId,
    required String content,
  }) async {
    try {
      final response = await dioClient.dio.post(
        '/chat/conversations/$conversationId/messages/',
        data: {
          'message_type': 'TEXT',
          'text': content.trim(),
        },
      );
      return ChatMessageModel.fromJson(response.data);
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to send text message.';
      throw Exception(detail);
    }
  }

  Future<ChatMessageModel> sendMediaOrAudioMessage({
    required int conversationId,
    required String filePath,
    required String messageType, // IMAGE or AUDIO
  }) async {
    try {
      final fileName = filePath.split(RegExp(r'[/\\]')).last;
      final bytes = await XFile(filePath).readAsBytes();
      final formData = FormData.fromMap({
        'message_type': messageType,
        'media_file': MultipartFile.fromBytes(
          bytes,
          filename: fileName,
        ),
      });

      final response = await dioClient.dio.post(
        '/chat/conversations/$conversationId/messages/',
        data: formData,
      );

      return ChatMessageModel.fromJson(response.data);
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to upload audio/media message.';
      throw Exception(detail);
    }
  }

  Future<List<Map<String, dynamic>>> searchUsers(String query) async {
    try {
      final response = await dioClient.dio.get(
        '/chat/users/search/',
        queryParameters: {'q': query.trim()},
      );
      final List results = response.data['results'] ?? response.data;
      return List<Map<String, dynamic>>.from(results);
    } on DioException catch (_) {
      return [];
    }
  }
}
