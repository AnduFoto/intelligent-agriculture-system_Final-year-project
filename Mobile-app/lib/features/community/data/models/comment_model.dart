import 'package:equatable/equatable.dart';

class CommentModel extends Equatable {
  final int id;
  final int postId;
  final String authorName;
  final String authorRole;
  final String? authorAvatar;
  final String content;
  final int likesCount;
  final bool isLiked;
  final bool isOwner;
  final String createdAt;

  const CommentModel({
    required this.id,
    required this.postId,
    required this.authorName,
    required this.authorRole,
    this.authorAvatar,
    required this.content,
    required this.likesCount,
    required this.isLiked,
    required this.isOwner,
    required this.createdAt,
  });

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    final authorMap = json['author'] is Map<String, dynamic> ? json['author'] : {};

    return CommentModel(
      id: json['id'] ?? 0,
      postId: json['post'] ?? 0,
      authorName: authorMap['full_name'] ?? authorMap['first_name'] ?? 'Member',
      authorRole: authorMap['role'] ?? 'FARMER',
      authorAvatar: authorMap['profile_image_url'] ?? authorMap['profile_image'],
      content: json['content'] ?? '',
      likesCount: json['likes_count'] ?? 0,
      isLiked: json['is_liked'] ?? false,
      isOwner: json['is_owner'] ?? false,
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
    );
  }

  @override
  List<Object?> get props => [id, postId, authorName, content, likesCount, isLiked];
}
