import 'package:equatable/equatable.dart';

abstract class ChatEvent extends Equatable {
  const ChatEvent();

  @override
  List<Object?> get props => [];
}

class FetchConversationsEvent extends ChatEvent {}

class FetchMessagesEvent extends ChatEvent {
  final int conversationId;

  const FetchMessagesEvent(this.conversationId);

  @override
  List<Object?> get props => [conversationId];
}

class SendTextMessageEvent extends ChatEvent {
  final int conversationId;
  final String content;

  const SendTextMessageEvent({required this.conversationId, required this.content});

  @override
  List<Object?> get props => [conversationId, content];
}

class SendMediaOrAudioMessageEvent extends ChatEvent {
  final int conversationId;
  final String filePath;
  final String messageType;

  const SendMediaOrAudioMessageEvent({
    required this.conversationId,
    required this.filePath,
    required this.messageType,
  });

  @override
  List<Object?> get props => [conversationId, filePath, messageType];
}
