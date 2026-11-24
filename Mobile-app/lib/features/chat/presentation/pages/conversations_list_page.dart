import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/chat/presentation/bloc/chat_bloc.dart';
import 'package:massaye/features/chat/presentation/bloc/chat_event.dart';
import 'package:massaye/features/chat/presentation/bloc/chat_state.dart';
import 'package:massaye/features/chat/presentation/pages/chat_room_page.dart';

class ConversationsListPage extends StatefulWidget {
  const ConversationsListPage({super.key});

  @override
  State<ConversationsListPage> createState() => _ConversationsListPageState();
}

class _ConversationsListPageState extends State<ConversationsListPage> {
  @override
  void initState() {
    super.initState();
    context.read<ChatBloc>().add(FetchConversationsEvent());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.creamBackground,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppTheme.charcoalText),
          onPressed: () {
            if (Navigator.canPop(context)) {
              Navigator.pop(context);
            } else {
              context.go('/');
            }
          },
          tooltip: 'Back to Home',
        ),
        title: const Text('Direct Messaging'),
        actions: [
          IconButton(
            onPressed: () {
              context.read<ChatBloc>().add(FetchConversationsEvent());
            },
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: BlocBuilder<ChatBloc, ChatState>(
        builder: (context, state) {
          if (state.status == ChatStatus.loadingConversations) {
            return const Center(child: CircularProgressIndicator());
          }

          final conversations = state.conversations;

          if (conversations.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: const BoxDecoration(
                      color: AppTheme.warmAmberPill,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.chat_bubble_outline_rounded, size: 48, color: AppTheme.warmAmberText),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'No Messages Yet',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Consultation messages with extension officers will appear here.',
                    style: TextStyle(fontSize: 13, color: AppTheme.mutedOlive),
                  ),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: conversations.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final item = conversations[index];

              return InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ChatRoomPage(conversation: item),
                    ),
                  );
                },
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.cardWhite,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.black.withOpacity(0.04)),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: AppTheme.darkForest,
                        child: Text(
                          item.otherUserName.isNotEmpty ? item.otherUserName[0].toUpperCase() : 'C',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Flexible(
                                  child: Text(
                                    item.otherUserName,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.charcoalText,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppTheme.mintGreenPill,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    item.otherUserRole,
                                    style: const TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.mintGreenText,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              item.lastMessageText ?? 'Tap to start conversation',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 13,
                                color: item.unreadCount > 0 ? AppTheme.charcoalText : AppTheme.mutedOlive,
                                fontWeight: item.unreadCount > 0 ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (item.unreadCount > 0) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(
                            color: AppTheme.darkForest,
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            '${item.unreadCount}',
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
