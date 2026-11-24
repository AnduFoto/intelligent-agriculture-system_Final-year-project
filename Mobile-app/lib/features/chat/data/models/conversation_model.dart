import 'package:equatable/equatable.dart';

class ConversationModel extends Equatable {
  final int id;
  final int otherUserId;
  final String otherUserName;
  final String otherUserRole;
  final String? otherUserLocation;
  final String? lastMessageText;
  final String? lastMessageType;
  final int unreadCount;
  final String updatedAt;

  const ConversationModel({
    required this.id,
    required this.otherUserId,
    required this.otherUserName,
    required this.otherUserRole,
    this.otherUserLocation,
    this.lastMessageText,
    this.lastMessageType,
    required this.unreadCount,
    required this.updatedAt,
  });

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    final otherMap = json['other_user'] is Map<String, dynamic> ? json['other_user'] : {};
    final lastMsgMap = json['last_message'] is Map<String, dynamic> ? json['last_message'] : null;

    return ConversationModel(
      id: json['id'] ?? 0,
      otherUserId: otherMap['id'] ?? 0,
      otherUserName: otherMap['full_name'] ?? otherMap['first_name'] ?? 'Chat Contact',
      otherUserRole: otherMap['role'] ?? 'FARMER',
      otherUserLocation: otherMap['location_summary'],
      lastMessageText: lastMsgMap != null ? lastMsgMap['text'] : null,
      lastMessageType: lastMsgMap != null ? lastMsgMap['message_type'] : null,
      unreadCount: json['unread_count'] ?? 0,
      updatedAt: json['updated_at'] ?? DateTime.now().toIso8601String(),
    );
  }

  @override
  List<Object?> get props => [
        id,
        otherUserId,
        otherUserName,
        otherUserRole,
        lastMessageText,
        unreadCount,
        updatedAt,
      ];
}
