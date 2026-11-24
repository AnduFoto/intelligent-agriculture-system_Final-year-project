import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:massaye/features/chat/data/models/chat_message_model.dart';
import 'package:massaye/features/chat/data/repositories/chat_repository.dart';
import 'package:massaye/features/chat/presentation/bloc/chat_event.dart';
import 'package:massaye/features/chat/presentation/bloc/chat_state.dart';

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final ChatRepository chatRepository;

  ChatBloc({required this.chatRepository}) : super(ChatState.initial()) {
    on<FetchConversationsEvent>(_onFetchConversations);
    on<FetchMessagesEvent>(_onFetchMessages);
    on<SendTextMessageEvent>(_onSendTextMessage);
    on<SendMediaOrAudioMessageEvent>(_onSendMediaOrAudioMessage);
  }

  Future<void> _onFetchConversations(
    FetchConversationsEvent event,
    Emitter<ChatState> emit,
  ) async {
    emit(state.copyWith(status: ChatStatus.loadingConversations));
    try {
      final conversations = await chatRepository.getConversations();
      emit(state.copyWith(
        status: ChatStatus.conversationsLoaded,
        conversations: conversations,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: ChatStatus.error,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      ));
    }
  }

  Future<void> _onFetchMessages(
    FetchMessagesEvent event,
    Emitter<ChatState> emit,
  ) async {
    emit(state.copyWith(status: ChatStatus.loadingMessages));
    try {
      final messages = await chatRepository.getMessages(event.conversationId);
      final newMap = Map<int, List<ChatMessageModel>>.from(state.messagesMap);
      newMap[event.conversationId] = messages;

      emit(state.copyWith(
        status: ChatStatus.messagesLoaded,
        messagesMap: newMap,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: ChatStatus.error,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      ));
    }
  }

  Future<void> _onSendTextMessage(
    SendTextMessageEvent event,
    Emitter<ChatState> emit,
  ) async {
    try {
      final newMsg = await chatRepository.sendTextMessage(
        conversationId: event.conversationId,
        content: event.content,
      );

      final currentMsgs = state.messagesMap[event.conversationId] ?? [];
      final newMap = Map<int, List<ChatMessageModel>>.from(state.messagesMap);
      newMap[event.conversationId] = [...currentMsgs, newMsg];

      emit(state.copyWith(
        status: ChatStatus.messagesLoaded,
        messagesMap: newMap,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: ChatStatus.error,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      ));
    }
  }

  Future<void> _onSendMediaOrAudioMessage(
    SendMediaOrAudioMessageEvent event,
    Emitter<ChatState> emit,
  ) async {
    try {
      final newMsg = await chatRepository.sendMediaOrAudioMessage(
        conversationId: event.conversationId,
        filePath: event.filePath,
        messageType: event.messageType,
      );

      final currentMsgs = state.messagesMap[event.conversationId] ?? [];
      final newMap = Map<int, List<ChatMessageModel>>.from(state.messagesMap);
      newMap[event.conversationId] = [...currentMsgs, newMsg];

      emit(state.copyWith(
        status: ChatStatus.messagesLoaded,
        messagesMap: newMap,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: ChatStatus.error,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      ));
    }
  }
}
