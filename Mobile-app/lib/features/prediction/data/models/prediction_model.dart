import 'package:equatable/equatable.dart';

class PredictionModel extends Equatable {
  final int id;
  final String diseaseClass;
  final String displayName;
  final String crop;
  final double confidence;
  final bool isHealthy;
  final String? image;
  final Map<String, dynamic>? solutionDetail;
  final List<dynamic>? topPredictions;
  final String createdAt;
  final bool isValidCropImage;
  final String? agentMessage;

  const PredictionModel({
    required this.id,
    required this.diseaseClass,
    required this.displayName,
    required this.crop,
    required this.confidence,
    required this.isHealthy,
    this.image,
    this.solutionDetail,
    this.topPredictions,
    required this.createdAt,
    this.isValidCropImage = true,
    this.agentMessage,
  });

  factory PredictionModel.fromJson(Map<String, dynamic> json) {
    return PredictionModel(
      id: json['id'] ?? 0,
      diseaseClass: json['disease_class'] ?? '',
      displayName: json['display_name'] ?? json['disease_class'] ?? 'Analysis Complete',
      crop: json['crop'] ?? 'Crop',
      confidence: (json['confidence'] is num) ? (json['confidence'] as num).toDouble() : 0.0,
      isHealthy: json['is_healthy'] ?? false,
      image: json['image'],
      solutionDetail: json['solution_detail'] is Map<String, dynamic> ? json['solution_detail'] : null,
      topPredictions: json['top_predictions'] is List ? json['top_predictions'] : null,
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
      isValidCropImage: json['is_valid_crop_image'] ?? true,
      agentMessage: json['agent_message'],
    );
  }

  factory PredictionModel.invalidImageResponse(String agentMessage) {
    return PredictionModel(
      id: 0,
      diseaseClass: 'INVALID_IMAGE',
      displayName: 'Not a Valid Crop Image',
      crop: 'Unknown',
      confidence: 0.0,
      isHealthy: false,
      createdAt: DateTime.now().toIso8601String(),
      isValidCropImage: false,
      agentMessage: agentMessage,
    );
  }

  @override
  List<Object?> get props => [
        id,
        diseaseClass,
        displayName,
        crop,
        confidence,
        isHealthy,
        image,
        isValidCropImage,
      ];
}
