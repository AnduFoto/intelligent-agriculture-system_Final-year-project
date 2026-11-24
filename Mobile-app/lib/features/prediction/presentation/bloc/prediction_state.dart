import 'package:equatable/equatable.dart';
import 'package:massaye/features/prediction/data/models/prediction_model.dart';

enum PredictionStatus { initial, analyzing, success, historyLoaded, error }

class PredictionState extends Equatable {
  final PredictionStatus status;
  final PredictionModel? result;
  final List<PredictionModel> history;
  final String? errorMessage;

  const PredictionState({
    required this.status,
    this.result,
    this.history = const [],
    this.errorMessage,
  });

  factory PredictionState.initial() => const PredictionState(status: PredictionStatus.initial);
  factory PredictionState.analyzing() => const PredictionState(status: PredictionStatus.analyzing);
  factory PredictionState.success(PredictionModel result) => PredictionState(status: PredictionStatus.success, result: result);
  factory PredictionState.historyLoaded(List<PredictionModel> history) => PredictionState(status: PredictionStatus.historyLoaded, history: history);
  factory PredictionState.error(String message) => PredictionState(status: PredictionStatus.error, errorMessage: message);

  @override
  List<Object?> get props => [status, result, history, errorMessage];
}
