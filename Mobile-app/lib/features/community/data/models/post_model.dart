import 'package:equatable/equatable.dart';

class PostModel extends Equatable {
  final int id;
  final String authorName;
  final String authorRole;
  final String? authorAvatar;
  final String? authorLocation;
  final String content;
  final String? cropName;
  final int likesCount;
  final int commentsCount;
  final int sharesCount;
  final bool isLiked;
  final bool isOwner;
  final bool isEdited;
  final List<String> mediaUrls;
  final String createdAt;

  const PostModel({
    required this.id,
    required this.authorName,
    required this.authorRole,
    this.authorAvatar,
    this.authorLocation,
    required this.content,
    this.cropName,
    required this.likesCount,
    required this.commentsCount,
    required this.sharesCount,
    required this.isLiked,
    required this.isOwner,
    required this.isEdited,
    required this.mediaUrls,
    required this.createdAt,
  });

  factory PostModel.fromJson(Map<String, dynamic> json) {
    final authorMap = json['author'] is Map<String, dynamic> ? json['author'] : {};

    List<String> mediaList = [];
    if (json['media_files'] is List) {
      for (var media in json['media_files']) {
        if (media is Map) {
          final url = media['file_url'] ?? media['file'];
          if (url != null && url.toString().isNotEmpty) {
            mediaList.add(url.toString());
          }
        }
      }
    }

    return PostModel(
      id: json['id'] ?? 0,
      authorName: authorMap['full_name'] ?? authorMap['first_name'] ?? 'Agricultural Member',
      authorRole: authorMap['role'] ?? 'FARMER',
      authorAvatar: authorMap['profile_image_url'] ?? authorMap['profile_image'],
      authorLocation: authorMap['location_summary'] ?? json['location_summary'],
      content: json['content'] ?? '',
      cropName: json['crop_name'],
      likesCount: json['likes_count'] ?? 0,
      commentsCount: json['comments_count'] ?? 0,
      sharesCount: json['shares_count'] ?? 0,
      isLiked: json['is_liked'] ?? false,
      isOwner: json['is_owner'] ?? false,
      isEdited: json['is_edited'] ?? false,
      mediaUrls: mediaList,
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
    );
  }

  PostModel copyWith({
    int? likesCount,
    int? commentsCount,
    bool? isLiked,
  }) {
    return PostModel(
      id: id,
      authorName: authorName,
      authorRole: authorRole,
      authorAvatar: authorAvatar,
      authorLocation: authorLocation,
      content: content,
      cropName: cropName,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      sharesCount: sharesCount,
      isLiked: isLiked ?? this.isLiked,
      isOwner: isOwner,
      isEdited: isEdited,
      mediaUrls: mediaUrls,
      createdAt: createdAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        authorName,
        authorRole,
        content,
        likesCount,
        commentsCount,
        isLiked,
        mediaUrls,
      ];
}
