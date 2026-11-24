import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:massaye/core/config/app_config.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/prediction/data/models/prediction_model.dart';
import 'package:massaye/features/prediction/presentation/bloc/prediction_bloc.dart';
import 'package:massaye/features/prediction/presentation/bloc/prediction_event.dart';
import 'package:massaye/features/prediction/presentation/bloc/prediction_state.dart';
import 'package:massaye/features/prediction/presentation/pages/prediction_result_page.dart';

class PredictionHistoryPage extends StatefulWidget {
  const PredictionHistoryPage({super.key});

  @override
  State<PredictionHistoryPage> createState() => _PredictionHistoryPageState();
}

class _PredictionHistoryPageState extends State<PredictionHistoryPage> {
  String _filter = 'ALL'; // ALL, HEALTHY, DISEASED
  String _search = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadHistory() {
    context.read<PredictionBloc>().add(LoadPredictionHistoryEvent());
  }

  String _formatDate(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      return DateFormat('MMM d, yyyy • h:mm a').format(dt);
    } catch (_) {
      return iso;
    }
  }

  List<PredictionModel> _filterList(List<PredictionModel> list) {
    return list.where((item) {
      if (_filter == 'HEALTHY' && !item.isHealthy) return false;
      if (_filter == 'DISEASED' && item.isHealthy) return false;

      if (_search.isNotEmpty) {
        final q = _search.toLowerCase();
        final matchesCrop = item.crop.toLowerCase().contains(q);
        final matchesName = item.displayName.toLowerCase().contains(q);
        return matchesCrop || matchesName;
      }
      return true;
    }).toList();
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
        title: const Text('My Crop Scans History'),
        actions: [
          IconButton(
            onPressed: _loadHistory,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Filter header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  onChanged: (val) => setState(() => _search = val.trim()),
                  decoration: InputDecoration(
                    hintText: 'Search by crop or disease...',
                    hintStyle: const TextStyle(fontSize: 13, color: AppTheme.mutedOlive),
                    prefixIcon: const Icon(Icons.search_rounded, size: 20, color: AppTheme.mutedOlive),
                    suffixIcon: _search.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _search = '');
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
                Row(
                  children: [
                    FilterChip(
                      label: const Text('All Scans'),
                      selected: _filter == 'ALL',
                      onSelected: (_) => setState(() => _filter = 'ALL'),
                      selectedColor: AppTheme.darkForest,
                      labelStyle: TextStyle(
                        fontSize: 12,
                        fontWeight: _filter == 'ALL' ? FontWeight.bold : FontWeight.w500,
                        color: _filter == 'ALL' ? Colors.white : AppTheme.charcoalText,
                      ),
                      backgroundColor: AppTheme.creamBackground,
                      checkmarkColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide.none),
                    ),
                    const SizedBox(width: 8),
                    FilterChip(
                      label: const Text('Healthy'),
                      selected: _filter == 'HEALTHY',
                      onSelected: (_) => setState(() => _filter = 'HEALTHY'),
                      selectedColor: AppTheme.mintGreenText,
                      labelStyle: TextStyle(
                        fontSize: 12,
                        fontWeight: _filter == 'HEALTHY' ? FontWeight.bold : FontWeight.w500,
                        color: _filter == 'HEALTHY' ? Colors.white : AppTheme.charcoalText,
                      ),
                      backgroundColor: AppTheme.creamBackground,
                      checkmarkColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide.none),
                    ),
                    const SizedBox(width: 8),
                    FilterChip(
                      label: const Text('Diseased'),
                      selected: _filter == 'DISEASED',
                      onSelected: (_) => setState(() => _filter = 'DISEASED'),
                      selectedColor: const Color(0xFFDC2626),
                      labelStyle: TextStyle(
                        fontSize: 12,
                        fontWeight: _filter == 'DISEASED' ? FontWeight.bold : FontWeight.w500,
                        color: _filter == 'DISEASED' ? Colors.white : AppTheme.charcoalText,
                      ),
                      backgroundColor: AppTheme.creamBackground,
                      checkmarkColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide.none),
                    ),
                  ],
                ),
              ],
            ),
          ),

          Expanded(
            child: BlocBuilder<PredictionBloc, PredictionState>(
              builder: (context, state) {
                if (state.status == PredictionStatus.analyzing) {
                  return const Center(child: CircularProgressIndicator());
                }

                final history = _filterList(state.history);

                if (state.history.isEmpty) {
                  return RefreshIndicator(
                    onRefresh: () async => _loadHistory(),
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(20),
                              decoration: const BoxDecoration(
                                color: AppTheme.mintGreenPill,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.history_rounded, size: 48, color: AppTheme.darkForest),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'No Scan Records Yet',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Your past AI crop disease diagnostics will be saved and displayed here.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 13, color: AppTheme.mutedOlive),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }

                if (history.isEmpty) {
                  return const Center(
                    child: Text('No scans match your search or filter.', style: TextStyle(color: AppTheme.mutedOlive)),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async => _loadHistory(),
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: history.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final item = history[index];
                      final imageUrl = AppConfig.resolveMediaUrl(item.image);

                      return InkWell(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => PredictionResultPage(result: item),
                            ),
                          );
                        },
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.all(14),
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
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(14),
                                child: imageUrl.isNotEmpty
                                    ? Image.network(
                                        imageUrl,
                                        width: 68,
                                        height: 68,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => Container(
                                          width: 68,
                                          height: 68,
                                          color: AppTheme.creamBackground,
                                          child: const Icon(Icons.broken_image_rounded, color: AppTheme.mutedOlive),
                                        ),
                                      )
                                    : Container(
                                        width: 68,
                                        height: 68,
                                        color: AppTheme.creamBackground,
                                        child: const Icon(Icons.eco_rounded, color: AppTheme.darkForest),
                                      ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: AppTheme.creamBackground,
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            item.crop.toUpperCase(),
                                            style: const TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              color: AppTheme.darkForest,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: item.isHealthy ? AppTheme.mintGreenPill : const Color(0xFFFFEBEE),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            item.isHealthy ? 'Healthy' : 'Diseased',
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              color: item.isHealthy ? AppTheme.mintGreenText : const Color(0xFFC62828),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      item.displayName,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.charcoalText,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          _formatDate(item.createdAt),
                                          style: const TextStyle(fontSize: 11, color: AppTheme.mutedOlive),
                                        ),
                                        Text(
                                          '${(item.confidence > 1.0 ? item.confidence : item.confidence * 100).toStringAsFixed(1)}%',
                                          style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: AppTheme.darkForest,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppTheme.mutedOlive),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
