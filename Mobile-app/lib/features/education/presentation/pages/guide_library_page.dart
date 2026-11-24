import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:massaye/core/config/app_config.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/education/data/models/guide_model.dart';
import 'package:massaye/features/education/data/repositories/education_repository.dart';
import 'package:massaye/features/education/presentation/pages/guide_detail_page.dart';

class GuideLibraryPage extends StatefulWidget {
  const GuideLibraryPage({super.key});

  @override
  State<GuideLibraryPage> createState() => _GuideLibraryPageState();
}

class _GuideLibraryPageState extends State<GuideLibraryPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<GuideModel> _allGuides = [];
  List<GuideModel> _savedGuides = [];
  bool _isLoadingAll = true;
  bool _isLoadingSaved = true;

  String _searchQuery = '';
  String _selectedPublisherType = 'ALL';
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, String>> _publisherFilters = [
    {'label': 'All Publishers', 'value': 'ALL'},
    {'label': 'Woreda', 'value': 'WOREDA'},
    {'label': 'Kebele', 'value': 'KEBELE'},
    {'label': 'Special Woreda', 'value': 'SPECIAL_WOREDA'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging && _tabController.index == 1) {
        _loadSavedGuides();
      }
    });
    _loadAllGuides();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadAllGuides() async {
    setState(() => _isLoadingAll = true);
    try {
      final repo = context.read<EducationRepository>();
      final list = await repo.getResources(
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
        publisherType: _selectedPublisherType != 'ALL' ? _selectedPublisherType : null,
      );
      if (mounted) {
        setState(() {
          _allGuides = list;
          _isLoadingAll = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingAll = false);
    }
  }

  Future<void> _loadSavedGuides() async {
    setState(() => _isLoadingSaved = true);
    try {
      final repo = context.read<EducationRepository>();
      final list = await repo.getBookmarkedResources();
      if (mounted) {
        setState(() {
          _savedGuides = list;
          _isLoadingSaved = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingSaved = false);
    }
  }

  Future<void> _toggleBookmark(GuideModel item) async {
    try {
      final repo = context.read<EducationRepository>();
      final newStatus = await repo.toggleBookmark(item.id);
      if (mounted) {
        setState(() {
          _allGuides = _allGuides.map((g) {
            if (g.id == item.id) {
              return g.copyWith(
                isBookmarked: newStatus,
                bookmarkCount: newStatus ? g.bookmarkCount + 1 : (g.bookmarkCount > 0 ? g.bookmarkCount - 1 : 0),
              );
            }
            return g;
          }).toList();

          if (!newStatus) {
            _savedGuides.removeWhere((g) => g.id == item.id);
          } else {
            _loadSavedGuides();
          }
        });
      }
    } catch (_) {}
  }

  Widget _buildGuideCard(GuideModel item) {
    final coverUrl = AppConfig.resolveMediaUrl(item.coverImage);

    return InkWell(
      onTap: () async {
        await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => GuideDetailPage(
              guideId: item.id,
              title: item.title,
            ),
          ),
        );
        _loadAllGuides();
        if (_tabController.index == 1) _loadSavedGuides();
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.cardWhite,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.black.withOpacity(0.04)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (coverUrl.isNotEmpty)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                child: Image.network(
                  coverUrl,
                  height: 140,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (c, e, s) => const SizedBox.shrink(),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          if (item.categoryName != null) ...[
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppTheme.mintGreenPill,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                item.categoryName!,
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.mintGreenText,
                                ),
                              ),
                            ),
                            const SizedBox(width: 6),
                          ],
                          if (item.publisherType != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppTheme.skyBluePill,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                item.publisherType!.replaceAll('_', ' '),
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.skyBlueText,
                                ),
                              ),
                            ),
                        ],
                      ),
                      IconButton(
                        visualDensity: VisualDensity.compact,
                        icon: Icon(
                          item.isBookmarked ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                          color: item.isBookmarked ? AppTheme.warmAmberText : AppTheme.mutedOlive,
                          size: 20,
                        ),
                        onPressed: () => _toggleBookmark(item),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    item.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.charcoalText,
                    ),
                  ),
                  if (item.shortSummary != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      item.shortSummary!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.3),
                    ),
                  ],
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        item.publisherName ?? 'Agricultural Office',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.darkForest),
                      ),
                      const Row(
                        children: [
                          Text('Read Guide', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.darkForest)),
                          SizedBox(width: 4),
                          Icon(Icons.arrow_forward_ios_rounded, size: 10, color: AppTheme.darkForest),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Color(0xFFF3E5F5),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.menu_book_rounded, size: 48, color: Color(0xFF7B1FA2)),
            ),
            const SizedBox(height: 16),
            const Text(
              'No Educational Guides Found',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
            ),
            const SizedBox(height: 6),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: AppTheme.mutedOlive),
            ),
          ],
        ),
      ),
    );
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
        title: const Text('Farming Knowledge Base'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.darkForest,
          unselectedLabelColor: AppTheme.mutedOlive,
          indicatorColor: AppTheme.darkForest,
          indicatorWeight: 3,
          tabs: const [
            Tab(text: 'Library'),
            Tab(text: 'Saved Guides'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // TAB 1: ALL GUIDES
          Column(
            children: [
              // Search & Filter header
              Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Column(
                  children: [
                    TextField(
                      controller: _searchController,
                      onChanged: (val) {
                        setState(() => _searchQuery = val.trim());
                        _loadAllGuides();
                      },
                      decoration: InputDecoration(
                        hintText: 'Search guides, crops, pests, fertilizers...',
                        hintStyle: const TextStyle(fontSize: 13, color: AppTheme.mutedOlive),
                        prefixIcon: const Icon(Icons.search_rounded, size: 20, color: AppTheme.mutedOlive),
                        suffixIcon: _searchQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear, size: 18),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() => _searchQuery = '');
                                  _loadAllGuides();
                                },
                              )
                            : null,
                        filled: true,
                        fillColor: AppTheme.creamBackground,
                        contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _publisherFilters.map((f) {
                          final isSelected = _selectedPublisherType == f['value'];
                          return Padding(
                            padding: const EdgeInsets.only(right: 8.0),
                            child: FilterChip(
                              label: Text(
                                f['label']!,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                  color: isSelected ? Colors.white : AppTheme.charcoalText,
                                ),
                              ),
                              selected: isSelected,
                              onSelected: (_) {
                                setState(() => _selectedPublisherType = f['value']!);
                                _loadAllGuides();
                              },
                              selectedColor: AppTheme.darkForest,
                              backgroundColor: AppTheme.creamBackground,
                              checkmarkColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                                side: BorderSide(color: isSelected ? AppTheme.darkForest : Colors.transparent),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),

              Expanded(
                child: _isLoadingAll
                    ? const Center(child: CircularProgressIndicator())
                    : _allGuides.isEmpty
                        ? _buildEmptyState('No guides match your criteria.')
                        : RefreshIndicator(
                            onRefresh: _loadAllGuides,
                            child: ListView.separated(
                              padding: const EdgeInsets.all(16),
                              itemCount: _allGuides.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 14),
                              itemBuilder: (ctx, idx) => _buildGuideCard(_allGuides[idx]),
                            ),
                          ),
              ),
            ],
          ),

          // TAB 2: SAVED GUIDES
          _isLoadingSaved
              ? const Center(child: CircularProgressIndicator())
              : _savedGuides.isEmpty
                  ? _buildEmptyState('You haven\'t bookmarked any guides yet.')
                  : RefreshIndicator(
                      onRefresh: _loadSavedGuides,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _savedGuides.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 14),
                        itemBuilder: (ctx, idx) => _buildGuideCard(_savedGuides[idx]),
                      ),
                    ),
        ],
      ),
    );
  }
}
