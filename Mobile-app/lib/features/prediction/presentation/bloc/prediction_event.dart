import 'package:equatable/equatable.dart';
import 'package:image_picker/image_picker.dart';

abstract class PredictionEvent extends Equatable {
  const PredictionEvent();

  @override
  List<Object?> get props => [];
}

class UploadImageForDiagnosisEvent extends PredictionEvent {
  final XFile imageFile;

  const UploadImageForDiagnosisEvent(this.imageFile);

  @override
  List<Object?> get props => [imageFile];
}

class LoadPredictionHistoryEvent extends PredictionEvent {}

class ResetPredictionScannerEvent extends PredictionEvent {}
