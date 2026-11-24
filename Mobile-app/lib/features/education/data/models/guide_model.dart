import 'package:equatable/equatable.dart';

class GuideAttachmentModel extends Equatable {
  final int id;
  final String file;
  final String fileName;
  final String fileType;

  const GuideAttachmentModel({
    required this.id,
    required this.file,
    required this.fileName,
    required this.fileType,
  });

  factory GuideAttachmentModel.fromJson(Map<String, dynamic> json) {
    return GuideAttachmentModel(
      id: json['id'] ?? 0,
      file: json['file'] ?? '',
      fileName: json['file_name'] ?? 'Document',
      fileType: json['file_type'] ?? 'file',
    );
  }

  @override
  List<Object?> get props => [id, file, fileName, fileType];
}

class GuideModel extends Equatable {
  final int id;
  final String title;
  final String? shortSummary;
  final String? content;
  final String? publisherName;
  final String? publisherType; // WOREDA, SPECIAL_WOREDA, KEBELE, REGIONAL
  final String? categoryName;
  final String? authorName;
  final String? coverImage;
  final int viewCount;
  final int bookmarkCount;
  final bool isBookmarked;
  final List<GuideAttachmentModel> attachments;
  final List<String> galleryImages;
  final String createdAt;
  final String? publishedDate;

  const GuideModel({
    required this.id,
    required this.title,
    this.shortSummary,
    this.content,
    this.publisherName,
    this.publisherType,
    this.categoryName,
    this.authorName,
    this.coverImage,
    this.viewCount = 0,
    this.bookmarkCount = 0,
    this.isBookmarked = false,
    this.attachments = const [],
    this.galleryImages = const [],
    required this.createdAt,
    this.publishedDate,
  });

  factory GuideModel.fromJson(Map<String, dynamic> json) {
    List<GuideAttachmentModel> atts = [];
    if (json['attachments'] is List) {
      atts = (json['attachments'] as List)
          .map((a) => GuideAttachmentModel.fromJson(a))
          .toList();
    }

    List<String> images = [];
    if (json['gallery_images'] is List) {
      images = (json['gallery_images'] as List)
          .map((g) => g is Map ? (g['image'] ?? '').toString() : g.toString())
          .where((s) => s.isNotEmpty)
          .toList();
    }

    return GuideModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? 'Farming Guide',
      shortSummary: json['short_summary'],
      content: json['content'],
      publisherName: json['publisher_name'],
      publisherType: json['publisher_type'],
      categoryName: json['category_name'],
      authorName: json['author_name'],
      coverImage: json['cover_image'],
      viewCount: json['view_count'] ?? 0,
      bookmarkCount: json['bookmark_count'] ?? 0,
      isBookmarked: json['is_bookmarked'] ?? false,
      attachments: atts,
      galleryImages: images,
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
      publishedDate: json['published_date'],
    );
  }

  GuideModel copyWith({
    bool? isBookmarked,
    int? bookmarkCount,
  }) {
    return GuideModel(
      id: id,
      title: title,
      shortSummary: shortSummary,
      content: content,
      publisherName: publisherName,
      publisherType: publisherType,
      categoryName: categoryName,
      authorName: authorName,
      coverImage: coverImage,
      viewCount: viewCount,
      bookmarkCount: bookmarkCount ?? this.bookmarkCount,
      isBookmarked: isBookmarked ?? this.isBookmarked,
      attachments: attachments,
      galleryImages: galleryImages,
      createdAt: createdAt,
      publishedDate: publishedDate,
    );
  }

  @override
  List<Object?> get props => [
        id,
        title,
        categoryName,
        publisherName,
        isBookmarked,
        bookmarkCount,
        createdAt,
      ];
}
