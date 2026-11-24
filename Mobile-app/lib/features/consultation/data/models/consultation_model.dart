import 'package:equatable/equatable.dart';

class ConsultationImageModel extends Equatable {
  final int id;
  final String image;
  final String? uploadedAt;

  const ConsultationImageModel({
    required this.id,
    required this.image,
    this.uploadedAt,
  });

  factory ConsultationImageModel.fromJson(Map<String, dynamic> json) {
    return ConsultationImageModel(
      id: json['id'] ?? 0,
      image: json['image'] ?? '',
      uploadedAt: json['uploaded_at'],
    );
  }

  @override
  List<Object?> get props => [id, image, uploadedAt];
}

class ConsultationMessageModel extends Equatable {
  final int id;
  final String senderEmail;
  final String senderFullName;
  final String senderRole;
  final String message;
  final String createdAt;

  const ConsultationMessageModel({
    required this.id,
    required this.senderEmail,
    required this.senderFullName,
    required this.senderRole,
    required this.message,
    required this.createdAt,
  });

  factory ConsultationMessageModel.fromJson(Map<String, dynamic> json) {
    return ConsultationMessageModel(
      id: json['id'] ?? 0,
      senderEmail: json['sender_email'] ?? '',
      senderFullName: json['sender_full_name'] ?? 'User',
      senderRole: json['sender_role'] ?? 'FARMER',
      message: json['message'] ?? '',
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
    );
  }

  @override
  List<Object?> get props => [id, senderEmail, senderRole, message, createdAt];
}

class ConsultationModel extends Equatable {
  final int id;
  final String cropName;
  final String kebeleName;
  final String title;
  final String? description;
  final String status; // NEW, ASSIGNED, WAITING_FOR_FARMER, WAITING_FOR_OFFICER, RESOLVED, CLOSED
  final String farmerEmail;
  final String farmerFullName;
  final String? assignedOfficerEmail;
  final List<ConsultationImageModel> images;
  final List<ConsultationMessageModel> messages;
  final String createdAt;
  final String? updatedAt;
  final String? resolvedAt;
  final String? closedAt;

  const ConsultationModel({
    required this.id,
    required this.cropName,
    required this.kebeleName,
    required this.title,
    this.description,
    required this.status,
    required this.farmerEmail,
    required this.farmerFullName,
    this.assignedOfficerEmail,
    this.images = const [],
    this.messages = const [],
    required this.createdAt,
    this.updatedAt,
    this.resolvedAt,
    this.closedAt,
  });

  factory ConsultationModel.fromJson(Map<String, dynamic> json) {
    var rawImages = json['images'];
    List<ConsultationImageModel> parsedImages = [];
    if (rawImages is List) {
      parsedImages = rawImages.map((i) => ConsultationImageModel.fromJson(i)).toList();
    }

    var rawMessages = json['messages'];
    List<ConsultationMessageModel> parsedMessages = [];
    if (rawMessages is List) {
      parsedMessages = rawMessages.map((m) => ConsultationMessageModel.fromJson(m)).toList();
    }

    return ConsultationModel(
      id: json['id'] ?? 0,
      cropName: json['crop_name'] ?? 'General Crop',
      kebeleName: json['kebele_name'] ?? 'Kebele',
      title: json['title'] ?? 'Consultation',
      description: json['description'],
      status: json['status'] ?? 'NEW',
      farmerEmail: json['farmer_email'] ?? '',
      farmerFullName: json['farmer_full_name'] ?? 'Farmer',
      assignedOfficerEmail: json['assigned_officer_email'],
      images: parsedImages,
      messages: parsedMessages,
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
      updatedAt: json['updated_at'],
      resolvedAt: json['resolved_at'],
      closedAt: json['closed_at'],
    );
  }

  @override
  List<Object?> get props => [
        id,
        cropName,
        kebeleName,
        title,
        status,
        farmerFullName,
        assignedOfficerEmail,
        images,
        messages,
        createdAt,
      ];
}
