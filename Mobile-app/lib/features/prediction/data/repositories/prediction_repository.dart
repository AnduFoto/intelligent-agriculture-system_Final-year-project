import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';
import 'package:massaye/core/network/dio_client.dart';
import 'package:massaye/features/prediction/data/models/prediction_model.dart';

class PredictionRepository {
  final DioClient dioClient;

  PredictionRepository({required this.dioClient});

  Future<PredictionModel> predictCropDisease(XFile imageFile) async {
    try {
      final fileName = imageFile.name.isNotEmpty
          ? imageFile.name
          : imageFile.path.split(RegExp(r'[/\\]')).last;
      final bytes = await imageFile.readAsBytes();
      final formData = FormData.fromMap({
        'image': MultipartFile.fromBytes(
          bytes,
          filename: fileName,
        ),
      });

      final response = await dioClient.dio.post(
        '/predictions/predict/',
        data: formData,
      );

      final data = response.data;
      if (data['is_valid_crop_image'] == false) {
        final agentMsg = data['agent_message'] ??
            'The uploaded image could not be identified as a supported crop plant. Please capture a clear, close-up photo of the infected leaves.';
        return PredictionModel.invalidImageResponse(agentMsg);
      }

      return PredictionModel.fromJson(data);
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ??
          e.response?.data?['image']?[0] ??
          'AI Service is currently undergoing maintenance. Please try again shortly.';
      throw Exception(detail);
    }
  }

  Future<List<PredictionModel>> getPredictionHistory() async {
    try {
      final response = await dioClient.dio.get('/predictions/history/');
      final List results = response.data['results'] ?? response.data;
      return results.map((json) => PredictionModel.fromJson(json)).toList();
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Could not load prediction history.';
      throw Exception(detail);
    }
  }

  Future<PredictionModel> getPredictionDetail(int id) async {
    try {
      final response = await dioClient.dio.get('/predictions/history/$id/');
      return PredictionModel.fromJson(response.data);
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Could not load prediction details.';
      throw Exception(detail);
    }
  }
}
