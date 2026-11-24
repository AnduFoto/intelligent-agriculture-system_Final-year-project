import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:massaye/features/prediction/data/repositories/prediction_repository.dart';
import 'package:massaye/features/prediction/presentation/bloc/prediction_event.dart';
import 'package:massaye/features/prediction/presentation/bloc/prediction_state.dart';

class PredictionBloc extends Bloc<PredictionEvent, PredictionState> {
  final PredictionRepository predictionRepository;

  PredictionBloc({required this.predictionRepository}) : super(PredictionState.initial()) {
    on<UploadImageForDiagnosisEvent>(_onUploadImage);
    on<LoadPredictionHistoryEvent>(_onLoadHistory);
    on<ResetPredictionScannerEvent>(_onReset);
  }

  Future<void> _onUploadImage(
    UploadImageForDiagnosisEvent event,
    Emitter<PredictionState> emit,
  ) async {
    emit(PredictionState.analyzing());
    try {
      final result = await predictionRepository.predictCropDisease(event.imageFile);
      emit(PredictionState.success(result));
    } catch (e) {
      emit(PredictionState.error(e.toString().replaceAll('Exception: ', '')));
    }
  }

  Future<void> _onLoadHistory(
    LoadPredictionHistoryEvent event,
    Emitter<PredictionState> emit,
  ) async {
    try {
      final history = await predictionRepository.getPredictionHistory();
      emit(PredictionState.historyLoaded(history));
    } catch (e) {
      emit(PredictionState.error(e.toString().replaceAll('Exception: ', '')));
    }
  }

  void _onReset(
    ResetPredictionScannerEvent event,
    Emitter<PredictionState> emit,
  ) {
    emit(PredictionState.initial());
  }
}
