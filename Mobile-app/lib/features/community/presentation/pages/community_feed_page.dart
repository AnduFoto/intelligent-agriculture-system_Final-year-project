import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/community/presentation/bloc/community_bloc.dart';
import 'package:massaye/features/community/presentation/bloc/community_event.dart';
import 'package:massaye/features/community/presentation/bloc/community_state.dart';
import 'package:massaye/features/community/presentation/pages/create_post_page.dart';
import 'package:massaye/features/community/presentation/widgets/post_card.dart';

class CommunityFeedPage extends StatefulWidget {
  const CommunityFeedPage({super.key});

  @override
  State<CommunityFeedPage> createState() => _CommunityFeedPageState();
}

class _CommunityFeedPageState extends State<CommunityFeedPage> {
  String? _selectedCropFilter;
  String _selectedRoleFilter = 'All Roles';

  final List<String> _roleOptions = ['All Roles', 'Farmer', 'Officer', 'Administrator'];
  final List<String> _cropOptions = ['All Crops', 'Tef', 'Maize', 'Potato', 'Wheat', 'Coffee'];

  @override
  void initState() {
    super.initState();
    _loadPosts();
  }

  void _loadPosts() {
    context.read<CommunityBloc>().add(FetchCommunityPostsEvent(
          cropTag: _selectedCropFilter == 'All Crops' ? null : _selectedCropFilter,
          roleFilter: _selectedRoleFilter == 'All Roles' ? null : _selectedRoleFilter,
        ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.creamBackground,
      appBar: AppBar(
        title: const Text('Community Discussion'),
        actions: [
          IconButton(
            onPressed: _loadPosts,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: AppTheme.creamBackground,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  // Role Filter
                  ..._roleOptions.map((role) {
                    final isSelected = _selectedRoleFilter == role;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: ChoiceChip(
                        label: Text(role),
                        selected: isSelected,
                        selectedColor: AppTheme.darkForest,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : AppTheme.charcoalText,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                        backgroundColor: AppTheme.cardWhite,
                        onSelected: (selected) {
                          if (selected) {
                            setState(() => _selectedRoleFilter = role);
                            _loadPosts();
                          }
                        },
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),

          // Posts Feed List
          Expanded(
            child: BlocBuilder<CommunityBloc, CommunityState>(
              builder: (context, state) {
                if (state.status == CommunityStatus.loading) {
                  return const Center(child: CircularProgressIndicator());
                }

                final posts = state.posts;

                if (posts.isEmpty) {
                  return RefreshIndicator(
                    onRefresh: () async => _loadPosts(),
                    child: ListView(
                      children: [
                        const SizedBox(height: 80),
                        Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(20),
                                decoration: const BoxDecoration(
                                  color: AppTheme.skyBluePill,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.forum_rounded, size: 48, color: AppTheme.skyBlueText),
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'No Community Posts Found',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Be the first to share an agricultural update or ask a question!',
                                style: TextStyle(fontSize: 13, color: AppTheme.mutedOlive),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => _loadPosts(),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    itemCount: posts.length,
                    itemBuilder: (context, index) => PostCard(post: posts[index]),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CreatePostPage()),
          );
        },
        backgroundColor: AppTheme.darkForest,
        icon: const Icon(Icons.edit_note_rounded, color: Colors.white),
        label: const Text('Share Update', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
