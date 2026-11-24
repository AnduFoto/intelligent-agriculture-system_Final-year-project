import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/consultation/data/models/consultation_model.dart';
import 'package:massaye/features/consultation/data/repositories/consultation_repository.dart';
import 'package:massaye/features/consultation/presentation/pages/consultation_detail_page.dart';
import 'package:massaye/features/consultation/presentation/pages/request_consultation_page.dart';

class ConsultationsPage extends StatefulWidget {
  const ConsultationsPage({super.key});

  @override
  State<ConsultationsPage> createState() => _ConsultationsPageState();
}

class _ConsultationsPageState extends State<ConsultationsPage> {
  List<ConsultationModel> _consultations = [];
  bool _isLoading = true;
  String? _error;
  String _selectedStatus = 'ALL';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  final List<String> _statusFilters = [
    'ALL',
    'PENDING',
    'ASSIGNED',
    'RESOLVED',
    'CLOSED',
  ];

  @override
  void initState() {
    super.initState();
    _loadConsultations();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadConsultations() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final repo = context.read<ConsultationRepository>();
      final list = await repo.getMyConsultations();
      if (mounted) {
        setState(() {
          _consultations = list;
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

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
      case 'NEW':
        return AppTheme.warmAmberText;
      case 'ASSIGNED':
      case 'WAITING_FOR_OFFICER':
        return AppTheme.skyBlueText;
      case 'WAITING_FOR_FARMER':
        return const Color(0xFF9333EA);
      case 'RESOLVED':
        return AppTheme.mintGreenText;
      case 'CLOSED':
      default:
        return AppTheme.mutedOlive;
    }
  }

  Color _getStatusBg(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
      case 'NEW':
        return AppTheme.warmAmberPill;
      case 'ASSIGNED':
      case 'WAITING_FOR_OFFICER':
        return AppTheme.skyBluePill;
      case 'WAITING_FOR_FARMER':
        return const Color(0xFFF3E8FF);
      case 'RESOLVED':
        return AppTheme.mintGreenPill;
      case 'CLOSED':
      default:
        return const Color(0xFFE2E8F0);
    }
  }

  String _formatDate(String isoString) {
    try {
      final dt = DateTime.parse(isoString).toLocal();
      return DateFormat('MMM d, yyyy').format(dt);
    } catch (_) {
      return isoString;
    }
  }

  List<ConsultationModel> get _filteredConsultations {
    return _consultations.where((c) {
      // Status filter
      if (_selectedStatus != 'ALL') {
        if (_selectedStatus == 'PENDING') {
          if (c.status.toUpperCase() != 'PENDING' && c.status.toUpperCase() != 'NEW') {
            return false;
          }
        } else if (_selectedStatus == 'ASSIGNED') {
          if (c.status.toUpperCase() != 'ASSIGNED' &&
              c.status.toUpperCase() != 'WAITING_FOR_OFFICER' &&
              c.status.toUpperCase() != 'WAITING_FOR_FARMER') {
            return false;
          }
        } else if (c.status.toUpperCase() != _selectedStatus) {
          return false;
        }
      }

      // Search filter
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchesTitle = c.title.toLowerCase().contains(q);
        final matchesCrop = c.cropName.toLowerCase().contains(q);
        final matchesKebele = c.kebeleName.toLowerCase().contains(q);
        return matchesTitle || matchesCrop || matchesKebele;
      }

      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredConsultations;

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
        title: const Text('Officer Consultations'),
        actions: [
          IconButton(
            onPressed: _loadConsultations,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadConsultations,
        child: Column(
          children: [
            // Search and Status Filters
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                children: [
                  TextField(
                    controller: _searchController,
                    onChanged: (val) => setState(() => _searchQuery = val.trim()),
                    decoration: InputDecoration(
                      hintText: 'Search by crop, title, or kebele...',
                      hintStyle: const TextStyle(fontSize: 13, color: AppTheme.mutedOlive),
                      prefixIcon: const Icon(Icons.search_rounded, size: 20, color: AppTheme.mutedOlive),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 18),
                              onPressed: () {
                                _searchController.clear();
                                setState(() => _searchQuery = '');
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
                      children: _statusFilters.map((st) {
                        final isSelected = _selectedStatus == st;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: FilterChip(
                            label: Text(
                              st == 'ALL' ? 'All' : st[0] + st.substring(1).toLowerCase(),
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                color: isSelected ? Colors.white : AppTheme.charcoalText,
                              ),
                            ),
                            selected: isSelected,
                            onSelected: (val) {
                              setState(() => _selectedStatus = st);
                            },
                            selectedColor: AppTheme.darkForest,
                            backgroundColor: AppTheme.creamBackground,
                            checkmarkColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                              side: BorderSide(
                                color: isSelected ? AppTheme.darkForest : Colors.transparent,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),

            // Content
            Expanded(
              child: _isLoading
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
                                Text(
                                  _error!,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(fontSize: 14, color: AppTheme.charcoalText),
                                ),
                                const SizedBox(height: 16),
                                ElevatedButton(
                                  onPressed: _loadConsultations,
                                  child: const Text('Try Again'),
                                ),
                              ],
                            ),
                          ),
                        )
                      : filtered.isEmpty
                          ? Center(
                              child: Padding(
                                padding: const EdgeInsets.all(24.0),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(20),
                                      decoration: const BoxDecoration(
                                        color: AppTheme.warmAmberPill,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.support_agent_rounded, size: 48, color: AppTheme.warmAmberText),
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      _searchQuery.isNotEmpty || _selectedStatus != 'ALL'
                                          ? 'No matching consultations'
                                          : 'No Consultation Requests Yet',
                                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
                                    ),
                                    const SizedBox(height: 6),
                                    const Text(
                                      'Request an expert extension officer consultation to resolve crop issues.',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(fontSize: 13, color: AppTheme.mutedOlive),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          : ListView.separated(
                              padding: const EdgeInsets.all(16),
                              itemCount: filtered.length,
                              separatorBuilder: (context, index) => const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                final item = filtered[index];

                                return InkWell(
                                  onTap: () async {
                                    await Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => ConsultationDetailPage(consultationId: item.id),
                                      ),
                                    );
                                    _loadConsultations();
                                  },
                                  borderRadius: BorderRadius.circular(20),
                                  child: Container(
                                    padding: const EdgeInsets.all(16),
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
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                              decoration: BoxDecoration(
                                                color: AppTheme.mintGreenPill,
                                                borderRadius: BorderRadius.circular(12),
                                              ),
                                              child: Text(
                                                item.cropName,
                                                style: const TextStyle(
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.bold,
                                                  color: AppTheme.mintGreenText,
                                                ),
                                              ),
                                            ),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                              decoration: BoxDecoration(
                                                color: _getStatusBg(item.status),
                                                borderRadius: BorderRadius.circular(12),
                                              ),
                                              child: Text(
                                                item.status.replaceAll('_', ' '),
                                                style: TextStyle(
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.bold,
                                                  color: _getStatusColor(item.status),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 10),
                                        Text(
                                          item.title,
                                          style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.bold,
                                            color: AppTheme.charcoalText,
                                          ),
                                        ),
                                        if (item.description != null && item.description!.isNotEmpty) ...[
                                          const SizedBox(height: 4),
                                          Text(
                                            item.description!,
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                                          ),
                                        ],
                                        const SizedBox(height: 10),
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Row(
                                              children: [
                                                const Icon(Icons.location_on_outlined, size: 14, color: AppTheme.mutedOlive),
                                                const SizedBox(width: 4),
                                                Text(
                                                  item.kebeleName,
                                                  style: const TextStyle(fontSize: 12, color: AppTheme.mutedOlive),
                                                ),
                                              ],
                                            ),
                                            Row(
                                              children: [
                                                const Icon(Icons.calendar_today_outlined, size: 12, color: AppTheme.mutedOlive),
                                                const SizedBox(width: 4),
                                                Text(
                                                  _formatDate(item.createdAt),
                                                  style: const TextStyle(fontSize: 11, color: AppTheme.mutedOlive),
                                                ),
                                                const SizedBox(width: 8),
                                                const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: AppTheme.mutedOlive),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final res = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const RequestConsultationPage()),
          );
          if (res == true) _loadConsultations();
        },
        backgroundColor: AppTheme.darkForest,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Request Officer', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
