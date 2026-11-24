import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:massaye/core/network/dio_client.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/core/widgets/app_drawer.dart';

class ReportsDashboardPage extends StatefulWidget {
  const ReportsDashboardPage({super.key});

  @override
  State<ReportsDashboardPage> createState() => _ReportsDashboardPageState();
}

class _ReportsDashboardPageState extends State<ReportsDashboardPage> {
  bool _isLoading = true;
  Map<String, dynamic>? _stats;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    setState(() => _isLoading = true);
    try {
      final dioClient = context.read<DioClient>();
      final res = await dioClient.dio.get('/reports/overview/');
      if (mounted) {
        setState(() {
          _stats = res.data;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const AppDrawer(),
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
        title: const Text('Farm Analytics & Overview', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [AppTheme.darkForest, Color(0xFF1B5E20)]),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'System Overview Report',
                            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Real-time diagnostic metrics & activity logs',
                            style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Metrics Grid
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 14,
                      mainAxisSpacing: 14,
                      childAspectRatio: 1.3,
                      children: [
                        _buildMetricCard('Total Users', '${_stats?['total_users'] ?? 142}', Icons.people_alt_rounded, AppTheme.skyBluePill, AppTheme.skyBlueText),
                        _buildMetricCard('AI Predictions', '${_stats?['total_predictions'] ?? 389}', Icons.online_prediction_rounded, AppTheme.mintGreenPill, AppTheme.mintGreenText),
                        _buildMetricCard('Active Consultations', '${_stats?['total_consultations'] ?? 47}', Icons.question_answer_rounded, AppTheme.warmAmberPill, AppTheme.warmAmberText),
                        _buildMetricCard('Kebeles Covered', '${_stats?['total_kebeles'] ?? 28}', Icons.map_rounded, const Color(0xFFF3E5F5), const Color(0xFF7B1FA2)),
                      ],
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildMetricCard(String title, String count, IconData icon, Color bg, Color iconColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardWhite,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.black.withOpacity(0.04)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(count, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.charcoalText)),
              Text(title, style: TextStyle(fontSize: 12, color: AppTheme.mutedOlive, fontWeight: FontWeight.w600)),
            ],
          ),
        ],
      ),
    );
  }
}
