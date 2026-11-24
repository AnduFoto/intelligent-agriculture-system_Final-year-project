import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:massaye/core/config/app_config.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/education/data/models/guide_model.dart';
import 'package:massaye/features/education/data/repositories/education_repository.dart';

class GuideDetailPage extends StatefulWidget {
  final int guideId;
  final String title;

  const GuideDetailPage({
    super.key,
    required this.guideId,
    required this.title,
  });

  @override
  State<GuideDetailPage> createState() => _GuideDetailPageState();
}

class _GuideDetailPageState extends State<GuideDetailPage> {
  GuideModel? _guide;
  bool _isLoading = true;
  String? _error;
  bool _isBookmarking = false;

  @override
  void initState() {
    super.initState();
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final repo = context.read<EducationRepository>();
      final item = await repo.getResourceDetail(widget.guideId);
      if (mounted) {
        setState(() {
          _guide = item;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString().replaceAll('Exception: ', '');
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _toggleBookmark() async {
    if (_guide == null || _isBookmarking) return;

    setState(() => _isBookmarking = true);
    try {
      final repo = context.read<EducationRepository>();
      final newStatus = await repo.toggleBookmark(_guide!.id);
      if (mounted) {
        setState(() {
          _guide = _guide!.copyWith(
            isBookmarked: newStatus,
            bookmarkCount: newStatus
                ? _guide!.bookmarkCount + 1
                : (_guide!.bookmarkCount > 0 ? _guide!.bookmarkCount - 1 : 0),
          );
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(newStatus ? 'Added to Saved Guides' : 'Removed from Saved Guides'),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceAll('Exception: ', ''))),
        );
      }
    } finally {
      if (mounted) setState(() => _isBookmarking = false);
    }
  }

  String _formatDate(String isoString) {
    try {
      final dt = DateTime.parse(isoString).toLocal();
      return DateFormat('MMMM d, yyyy').format(dt);
    } catch (_) {
      return isoString;
    }
  }

  @override
  Widget build(BuildContext context) {
    final guide = _guide;
    final coverUrl = guide != null ? AppConfig.resolveMediaUrl(guide.coverImage) : '';

    return Scaffold(
      backgroundColor: AppTheme.creamBackground,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppTheme.charcoalText),
          onPressed: () => Navigator.pop(context),
          tooltip: 'Back',
        ),
        title: Text(widget.title),
        actions: [
          if (guide != null)
            IconButton(
              onPressed: _isBookmarking ? null : _toggleBookmark,
              icon: Icon(
                guide.isBookmarked ? Icons.bookmark_rounded : Icons.bookmark_outline_rounded,
                color: guide.isBookmarked ? AppTheme.warmAmberText : null,
              ),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline_rounded, size: 48, color: Colors.redAccent),
                        const SizedBox(height: 12),
                        Text(_error!, textAlign: TextAlign.center, style: const TextStyle(fontSize: 14)),
                        const SizedBox(height: 16),
                        ElevatedButton(onPressed: _loadDetail, child: const Text('Retry')),
                      ],
                    ),
                  ),
                )
              : guide == null
                  ? const Center(child: Text('Guide not found'))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (coverUrl.isNotEmpty) ...[
                            ClipRRect(
                              borderRadius: BorderRadius.circular(20),
                              child: Image.network(
                                coverUrl,
                                width: double.infinity,
                                height: 220,
                                fit: BoxFit.cover,
                                errorBuilder: (c, e, s) => const SizedBox.shrink(),
                              ),
                            ),
                            const SizedBox(height: 20),
                          ],

                          // Category & Publisher Badges
                          Row(
                            children: [
                              if (guide.categoryName != null) ...[
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.mintGreenPill,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    guide.categoryName!,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.mintGreenText,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                              ],
                              if (guide.publisherType != null) ...[
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.skyBluePill,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    guide.publisherType!.replaceAll('_', ' '),
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.skyBlueText,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 12),

                          Text(
                            guide.title,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.charcoalText,
                            ),
                          ),
                          const SizedBox(height: 8),

                          Row(
                            children: [
                              const Icon(Icons.account_balance_outlined, size: 14, color: AppTheme.mutedOlive),
                              const SizedBox(width: 4),
                              Text(
                                guide.publisherName ?? 'Agricultural Office',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.darkForest),
                              ),
                              const SizedBox(width: 12),
                              const Icon(Icons.schedule_rounded, size: 14, color: AppTheme.mutedOlive),
                              const SizedBox(width: 4),
                              Text(
                                _formatDate(guide.publishedDate ?? guide.createdAt),
                                style: const TextStyle(fontSize: 12, color: AppTheme.mutedOlive),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),

                          if (guide.shortSummary != null && guide.shortSummary!.isNotEmpty) ...[
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Text(
                                guide.shortSummary!,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontStyle: FontStyle.italic,
                                  color: Color(0xFF475569),
                                  height: 1.4,
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                          ],

                          const Divider(),
                          const SizedBox(height: 16),

                          // Main Content
                          Text(
                            guide.content ?? guide.shortSummary ?? 'No detailed text content provided.',
                            style: const TextStyle(
                              fontSize: 15,
                              height: 1.6,
                              color: Color(0xFF334155),
                            ),
                          ),

                          // Gallery Images
                          if (guide.galleryImages.isNotEmpty) ...[
                            const SizedBox(height: 24),
                            const Text(
                              'Visual Demonstration',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              height: 140,
                              child: ListView.separated(
                                scrollDirection: Axis.horizontal,
                                itemCount: guide.galleryImages.length,
                                separatorBuilder: (_, __) => const SizedBox(width: 10),
                                itemBuilder: (ctx, idx) {
                                  final imgUrl = AppConfig.resolveMediaUrl(guide.galleryImages[idx]);
                                  return ClipRRect(
                                    borderRadius: BorderRadius.circular(14),
                                    child: Image.network(
                                      imgUrl,
                                      width: 180,
                                      height: 140,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ],

                          // Attachments
                          if (guide.attachments.isNotEmpty) ...[
                            const SizedBox(height: 24),
                            const Text(
                              'Attached Resources & Files',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
                            ),
                            const SizedBox(height: 12),
                            ...guide.attachments.map((att) {
                              return Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: Colors.black.withOpacity(0.06)),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.insert_drive_file_outlined, color: AppTheme.darkForest),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            att.fileName,
                                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
                                          ),
                                          Text(
                                            att.fileType.toUpperCase(),
                                            style: const TextStyle(fontSize: 10, color: AppTheme.mutedOlive),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const Icon(Icons.download_rounded, color: AppTheme.darkForest),
                                  ],
                                ),
                              );
                            }),
                          ],

                          const SizedBox(height: 32),
                        ],
                      ),
                    ),
    );
  }
}
