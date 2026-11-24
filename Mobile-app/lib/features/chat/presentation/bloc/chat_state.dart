import 'package:equatable/equatable.dart';
import 'package:massaye/features/chat/data/models/chat_message_model.dart';
import 'package:massaye/features/chat/data/models/conversation_model.dart';

enum ChatStatus { initial, loadingConversations, conversationsLoaded, loadingMessages, messagesLoaded, sendingMessage, error }

class ChatState extends Equatable {
  final ChatStatus status;
  final List<ConversationModel> conversations;
  final Map<int, List<ChatMessageModel>> messagesMap;
  final String? errorMessage;

  const ChatState({
    required this.status,
    this.conversations = const [],
    this.messagesMap = const {},
    this.errorMessage,
  });

  factory ChatState.initial() => const ChatState(status: ChatStatus.initial);

  ChatState copyWith({
    ChatStatus? status,
    List<ConversationModel>? conversations,
    Map<int, List<ChatMessageModel>>? messagesMap,
    String? errorMessage,
  }) {
    return ChatState(
      status: status ?? this.status,
      conversations: conversations ?? this.conversations,
      messagesMap: messagesMap ?? this.messagesMap,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, conversations, messagesMap, errorMessage];
}
