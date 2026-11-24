import 'package:equatable/equatable.dart';
import 'package:image_picker/image_picker.dart';

abstract class CommunityEvent extends Equatable {
  const CommunityEvent();

  @override
  List<Object?> get props => [];
}

class FetchCommunityPostsEvent extends CommunityEvent {
  final String? cropTag;
  final String? roleFilter;
  final String? search;

  const FetchCommunityPostsEvent({this.cropTag, this.roleFilter, this.search});

  @override
  List<Object?> get props => [cropTag, roleFilter, search];
}

class CreateCommunityPostEvent extends CommunityEvent {
  final String content;
  final String? cropTag;
  final XFile? mediaFile;

  const CreateCommunityPostEvent({
    required this.content,
    this.cropTag,
    this.mediaFile,
  });

  @override
  List<Object?> get props => [content, cropTag, mediaFile];
}

class TogglePostLikeEvent extends CommunityEvent {
  final int postId;

  const TogglePostLikeEvent(this.postId);

  @override
  List<Object?> get props => [postId];
}

class FetchPostCommentsEvent extends CommunityEvent {
  final int postId;

  const FetchPostCommentsEvent(this.postId);

  @override
  List<Object?> get props => [postId];
}

class AddPostCommentEvent extends CommunityEvent {
  final int postId;
  final String content;

  const AddPostCommentEvent({required this.postId, required this.content});

  @override
  List<Object?> get props => [postId, content];
}
