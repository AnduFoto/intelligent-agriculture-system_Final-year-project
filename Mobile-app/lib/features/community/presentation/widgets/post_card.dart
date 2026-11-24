import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:massaye/core/config/app_config.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/community/data/models/post_model.dart';
import 'package:massaye/features/community/presentation/bloc/community_bloc.dart';
import 'package:massaye/features/community/presentation/bloc/community_event.dart';
import 'package:massaye/features/community/presentation/widgets/comments_bottom_sheet.dart';

class PostCard extends StatelessWidget {
  final PostModel post;

  const PostCard({super.key, required this.post});

  @override
  Widget build(BuildContext context) {
    final avatarUrl = AppConfig.resolveMediaUrl(post.authorAvatar);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.cardWhite,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.black.withOpacity(0.04)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ==========================================
          // 1. AUTHOR HEADER ROW
          // ==========================================
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: AppTheme.mintGreenPill,
                backgroundImage: avatarUrl.isNotEmpty ? NetworkImage(avatarUrl) : null,
                child: avatarUrl.isEmpty
                    ? Text(
                        post.authorName.isNotEmpty ? post.authorName[0].toUpperCase() : 'M',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.darkForest),
                      )
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            post.authorName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.charcoalText,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.mintGreenPill,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            post.authorRole,
                            style: const TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.mintGreenText,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      post.authorLocation ?? 'Ethiopian Agricultural Network',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppTheme.mutedOlive,
                      ),
                    ),
                  ],
                ),
              ),

              if (post.cropName != null && post.cropName!.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.skyBluePill,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Text(
                    post.cropName!,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.skyBlueText,
                    ),
                  ),
                ),
              ],
            ],
          ),

          const SizedBox(height: 14),

          // ==========================================
          // 2. POST CONTENT BODY
          // ==========================================
          Text(
            post.content,
            style: const TextStyle(
              fontSize: 14,
              color: AppTheme.charcoalText,
              height: 1.45,
            ),
          ),

          // ==========================================
          // 3. MEDIA ATTACHMENTS
          // ==========================================
          if (post.mediaUrls.isNotEmpty) ...[
            const SizedBox(height: 14),
            ClipRRect(
              borderRadius: BorderRadius.circular(18),
              child: Image.network(
                AppConfig.resolveMediaUrl(post.mediaUrls.first),
                width: double.infinity,
                height: 220,
                fit: BoxFit.cover,
                errorBuilder: (c, e, s) => const SizedBox.shrink(),
              ),
            ),
          ],

          const SizedBox(height: 14),

          const Divider(height: 1),

          const SizedBox(height: 8),

          // ==========================================
          // 4. ACTION BAR (Like, Comment, Share)
          // ==========================================
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              // Like Button
              InkWell(
                onTap: () {
                  context.read<CommunityBloc>().add(TogglePostLikeEvent(post.id));
                },
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Row(
                    children: [
                      Icon(
                        post.isLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                        size: 20,
                        color: post.isLiked ? Colors.red : AppTheme.mutedOlive,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${post.likesCount}',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: post.isLiked ? Colors.red : AppTheme.charcoalText,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Comment Button
              InkWell(
                onTap: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (_) => CommentsBottomSheet(postId: post.id),
                  );
                },
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.chat_bubble_outline_rounded,
                        size: 20,
                        color: AppTheme.mutedOlive,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${post.commentsCount}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.charcoalText,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Share Button
              InkWell(
                onTap: () {},
                borderRadius: BorderRadius.circular(12),
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Row(
                    children: [
                      Icon(
                        Icons.share_outlined,
                        size: 20,
                        color: AppTheme.mutedOlive,
                      ),
                      SizedBox(width: 6),
                      Text(
                        'Share',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.charcoalText,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
