import 'package:equatable/equatable.dart';

class ChatMessageModel extends Equatable {
  final int id;
  final int conversationId;
  final int senderId;
  final String senderName;
  final String senderRole;
  final bool isSender;
  final String messageType; // TEXT, IMAGE, AUDIO, FILE
  final String text;
  final String? mediaFile;
  final bool isRead;
  final String createdAt;

  const ChatMessageModel({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderName,
    required this.senderRole,
    required this.isSender,
    required this.messageType,
    required this.text,
    this.mediaFile,
    required this.isRead,
    required this.createdAt,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) {
    final senderMap = json['sender'] is Map<String, dynamic> ? json['sender'] : {};

    return ChatMessageModel(
      id: json['id'] ?? 0,
      conversationId: json['conversation_id'] ?? 0,
      senderId: senderMap['id'] ?? 0,
      senderName: senderMap['full_name'] ?? senderMap['first_name'] ?? 'Member',
      senderRole: senderMap['role'] ?? 'FARMER',
      isSender: json['is_sender'] ?? false,
      messageType: json['message_type'] ?? 'TEXT',
      text: json['text'] ?? '',
      mediaFile: json['media_file'],
      isRead: json['is_read'] ?? false,
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
    );
  }

  @override
  List<Object?> get props => [
        id,
        conversationId,
        senderId,
        isSender,
        messageType,
        text,
        mediaFile,
        createdAt,
      ];
}
