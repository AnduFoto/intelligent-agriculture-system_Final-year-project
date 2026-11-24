import 'package:equatable/equatable.dart';
import 'package:massaye/features/community/data/models/comment_model.dart';
import 'package:massaye/features/community/data/models/post_model.dart';

enum CommunityStatus { initial, loading, success, creatingPost, postCreated, loadingComments, commentsLoaded, error }

class CommunityState extends Equatable {
  final CommunityStatus status;
  final List<PostModel> posts;
  final Map<int, List<CommentModel>> commentsMap;
  final String? errorMessage;

  const CommunityState({
    required this.status,
    this.posts = const [],
    this.commentsMap = const {},
    this.errorMessage,
  });

  factory CommunityState.initial() => const CommunityState(status: CommunityStatus.initial);
  factory CommunityState.loading() => const CommunityState(status: CommunityStatus.loading);
  factory CommunityState.success(List<PostModel> posts) => CommunityState(status: CommunityStatus.success, posts: posts);

  CommunityState copyWith({
    CommunityStatus? status,
    List<PostModel>? posts,
    Map<int, List<CommentModel>>? commentsMap,
    String? errorMessage,
  }) {
    return CommunityState(
      status: status ?? this.status,
      posts: posts ?? this.posts,
      commentsMap: commentsMap ?? this.commentsMap,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, posts, commentsMap, errorMessage];
}
