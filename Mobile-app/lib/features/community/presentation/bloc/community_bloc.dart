import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:massaye/features/community/data/models/post_model.dart';
import 'package:massaye/features/community/data/models/comment_model.dart';
import 'package:massaye/features/community/data/repositories/community_repository.dart';
import 'package:massaye/features/community/presentation/bloc/community_event.dart';
import 'package:massaye/features/community/presentation/bloc/community_state.dart';

class CommunityBloc extends Bloc<CommunityEvent, CommunityState> {
  final CommunityRepository communityRepository;

  CommunityBloc({required this.communityRepository}) : super(CommunityState.initial()) {
    on<FetchCommunityPostsEvent>(_onFetchPosts);
    on<CreateCommunityPostEvent>(_onCreatePost);
    on<TogglePostLikeEvent>(_onToggleLike);
    on<FetchPostCommentsEvent>(_onFetchComments);
    on<AddPostCommentEvent>(_onAddComment);
  }

  Future<void> _onFetchPosts(
    FetchCommunityPostsEvent event,
    Emitter<CommunityState> emit,
  ) async {
    emit(state.copyWith(status: CommunityStatus.loading));
    try {
      final posts = await communityRepository.getPosts(
        cropTag: event.cropTag,
        roleFilter: event.roleFilter,
        search: event.search,
      );
      emit(state.copyWith(status: CommunityStatus.success, posts: posts));
    } catch (e) {
      emit(state.copyWith(
        status: CommunityStatus.error,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      ));
    }
  }

  Future<void> _onCreatePost(
    CreateCommunityPostEvent event,
    Emitter<CommunityState> emit,
  ) async {
    emit(state.copyWith(status: CommunityStatus.creatingPost));
    try {
      final newPost = await communityRepository.createPost(
        content: event.content,
        cropTag: event.cropTag,
        mediaFile: event.mediaFile,
      );
      final updatedPosts = [newPost, ...state.posts];
      emit(state.copyWith(status: CommunityStatus.postCreated, posts: updatedPosts));
    } catch (e) {
      emit(state.copyWith(
        status: CommunityStatus.error,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      ));
    }
  }

  Future<void> _onToggleLike(
    TogglePostLikeEvent event,
    Emitter<CommunityState> emit,
  ) async {
    final postIndex = state.posts.indexWhere((p) => p.id == event.postId);
    if (postIndex == -1) return;

    final targetPost = state.posts[postIndex];
    final originalIsLiked = targetPost.isLiked;
    final originalLikesCount = targetPost.likesCount;

    // Optimistic UI update
    final updatedPost = targetPost.copyWith(
      isLiked: !originalIsLiked,
      likesCount: originalIsLiked ? originalLikesCount - 1 : originalLikesCount + 1,
    );

    final updatedPosts = List<PostModel>.from(state.posts);
    updatedPosts[postIndex] = updatedPost;
    emit(state.copyWith(posts: updatedPosts));

    try {
      await communityRepository.toggleLike(event.postId);
    } catch (_) {
      // Rollback on error
      final revertedPosts = List<PostModel>.from(state.posts);
      revertedPosts[postIndex] = targetPost;
      emit(state.copyWith(posts: revertedPosts));
    }
  }

  Future<void> _onFetchComments(
    FetchPostCommentsEvent event,
    Emitter<CommunityState> emit,
  ) async {
    try {
      final comments = await communityRepository.getComments(event.postId);
      final newMap = Map<int, List<CommentModel>>.from(state.commentsMap);
      newMap[event.postId] = comments;
      emit(state.copyWith(status: CommunityStatus.commentsLoaded, commentsMap: newMap));
    } catch (e) {
      // Handle error quietly
    }
  }

  Future<void> _onAddComment(
    AddPostCommentEvent event,
    Emitter<CommunityState> emit,
  ) async {
    try {
      final newComment = await communityRepository.addComment(event.postId, event.content);
      final existingComments = state.commentsMap[event.postId] ?? [];
      final newMap = Map<int, List<CommentModel>>.from(state.commentsMap);
      newMap[event.postId] = [...existingComments, newComment];

      // Update post comment count
      final postIndex = state.posts.indexWhere((p) => p.id == event.postId);
      List<PostModel> updatedPosts = List.from(state.posts);
      if (postIndex != -1) {
        final p = state.posts[postIndex];
        updatedPosts[postIndex] = p.copyWith(commentsCount: p.commentsCount + 1);
      }

      emit(state.copyWith(
        status: CommunityStatus.commentsLoaded,
        commentsMap: newMap,
        posts: updatedPosts,
      ));
    } catch (e) {
      emit(state.copyWith(
        status: CommunityStatus.error,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      ));
    }
  }
}
