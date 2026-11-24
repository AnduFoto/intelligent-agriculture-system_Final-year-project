import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:massaye/core/config/app_config.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/community/presentation/bloc/community_bloc.dart';
import 'package:massaye/features/community/presentation/bloc/community_event.dart';
import 'package:massaye/features/community/presentation/bloc/community_state.dart';

class CommentsBottomSheet extends StatefulWidget {
  final int postId;

  const CommentsBottomSheet({super.key, required this.postId});

  @override
  State<CommentsBottomSheet> createState() => _CommentsBottomSheetState();
}

class _CommentsBottomSheetState extends State<CommentsBottomSheet> {
  final _commentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    context.read<CommunityBloc>().add(FetchPostCommentsEvent(widget.postId));
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  void _sendComment() {
    final text = _commentController.text.trim();
    if (text.isNotEmpty) {
      context.read<CommunityBloc>().add(AddPostCommentEvent(
            postId: widget.postId,
            content: text,
          ));
      _commentController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: AppTheme.creamBackground,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        children: [
          // Drag indicator handle
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          const SizedBox(height: 14),

          // Header Title
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              'Comments',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.charcoalText,
              ),
            ),
          ),
          const SizedBox(height: 10),
          const Divider(height: 1),

          // Comments List
          Expanded(
            child: BlocBuilder<CommunityBloc, CommunityState>(
              builder: (context, state) {
                final comments = state.commentsMap[widget.postId] ?? [];

                if (comments.isEmpty) {
                  return Center(
                    child: Text(
                      'No comments yet. Be the first to share your thoughts!',
                      style: TextStyle(color: AppTheme.mutedOlive, fontSize: 13),
                    ),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: comments.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 14),
                  itemBuilder: (context, index) {
                    final item = comments[index];
                    final avatarUrl = AppConfig.resolveMediaUrl(item.authorAvatar);

                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          radius: 16,
                          backgroundColor: AppTheme.mintGreenPill,
                          backgroundImage: avatarUrl.isNotEmpty ? NetworkImage(avatarUrl) : null,
                          child: avatarUrl.isEmpty
                              ? Text(
                                  item.authorName.isNotEmpty ? item.authorName[0].toUpperCase() : 'M',
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.darkForest),
                                )
                              : null,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppTheme.cardWhite,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      item.authorName,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.charcoalText,
                                      ),
                                    ),
                                    Text(
                                      item.authorRole,
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.mutedOlive,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  item.content,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: AppTheme.charcoalText,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                );
              },
            ),
          ),

          // Comment Input Field
          Container(
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: 12,
              bottom: MediaQuery.of(context).viewInsets.bottom + 12,
            ),
            decoration: BoxDecoration(
              color: AppTheme.cardWhite,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _commentController,
                    decoration: InputDecoration(
                      hintText: 'Add a comment...',
                      filled: true,
                      fillColor: AppTheme.creamBackground,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: _sendComment,
                  icon: const Icon(Icons.send_rounded, color: AppTheme.darkForest),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
