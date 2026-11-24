import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import 'package:massaye/core/network/dio_client.dart';
import 'package:massaye/features/consultation/data/models/consultation_model.dart';

class ConsultationRepository {
  final DioClient dioClient;

  ConsultationRepository({required this.dioClient});

  Future<List<Map<String, dynamic>>> getCropTypes() => listCropTypes();
  Future<List<ConsultationModel>> getConsultations() => getMyConsultations();

  /// Lists available active crop types for consultations
  Future<List<Map<String, dynamic>>> listCropTypes() async {
    try {
      final response = await dioClient.dio.get('/consultations/crop-types/');
      final dynamic data = response.data;
      final List results = (data is Map && data['results'] != null) ? data['results'] : (data is List ? data : []);
      return List<Map<String, dynamic>>.from(results);
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to load crop types.';
      throw Exception(detail);
    }
  }

  /// Lists all consultations created by the authenticated farmer
  Future<List<ConsultationModel>> getMyConsultations() async {
    try {
      final response = await dioClient.dio.get('/consultations/consultations/mine/');
      final dynamic data = response.data;
      final List results = (data is Map && data['results'] != null) ? data['results'] : (data is List ? data : []);
      return results.map((json) => ConsultationModel.fromJson(json)).toList();
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to load consultations.';
      throw Exception(detail);
    }
  }

  /// Gets detail of a single consultation including images and conversation messages
  Future<ConsultationModel> getConsultationDetail(int id) async {
    try {
      final response = await dioClient.dio.get('/consultations/consultations/$id/');
      return ConsultationModel.fromJson(response.data);
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to load consultation detail.';
      throw Exception(detail);
    }
  }

  /// Creates a new consultation request with multipart images
  Future<ConsultationModel> createConsultation({
    required int cropTypeId,
    required String title,
    required String description,
    List<XFile> images = const [],
  }) async {
    try {
      final formData = FormData.fromMap({
        'crop_type_id': cropTypeId,
        'title': title.trim(),
        'description': description.trim(),
      });

      for (var img in images) {
        final fileName = img.name.isNotEmpty
            ? img.name
            : img.path.split(RegExp(r'[/\\]')).last;
        final bytes = await img.readAsBytes();
        formData.files.add(
          MapEntry(
            'images',
            MultipartFile.fromBytes(bytes, filename: fileName),
          ),
        );
      }

      final response = await dioClient.dio.post(
        '/consultations/consultations/',
        data: formData,
      );
      return ConsultationModel.fromJson(response.data);
    } on DioException catch (e) {
      final data = e.response?.data;
      String message = 'Could not submit consultation.';
      if (data is Map) {
        if (data['detail'] != null) {
          message = data['detail'];
        } else {
          message = data.values.map((v) => v is List ? v.join(' ') : v.toString()).join(' ');
        }
      }
      throw Exception(message);
    }
  }

  /// Sends a message in the consultation chat thread
  Future<ConsultationMessageModel> sendMessage(int consultationId, String message) async {
    try {
      final response = await dioClient.dio.post(
        '/consultations/consultations/$consultationId/messages/',
        data: {'message': message.trim()},
      );
      return ConsultationMessageModel.fromJson(response.data);
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to send message.';
      throw Exception(detail);
    }
  }

  /// Closes a consultation
  Future<void> closeConsultation(int consultationId) async {
    try {
      await dioClient.dio.post('/consultations/consultations/$consultationId/close/');
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to close consultation.';
      throw Exception(detail);
    }
  }

  /// Resolves a consultation (for Officer)
  Future<void> resolveConsultation(int consultationId) async {
    try {
      await dioClient.dio.post('/consultations/consultations/$consultationId/resolve/');
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Failed to resolve consultation.';
      throw Exception(detail);
    }
  }

  /// Gets activity timeline
  Future<List<Map<String, dynamic>>> getTimeline(int consultationId) async {
    try {
      final response = await dioClient.dio.get('/consultations/consultations/$consultationId/timeline/');
      final dynamic data = response.data;
      final List results = (data is Map && data['results'] != null) ? data['results'] : (data is List ? data : []);
      return List<Map<String, dynamic>>.from(results);
    } on DioException catch (_) {
      return [];
    }
  }
}
