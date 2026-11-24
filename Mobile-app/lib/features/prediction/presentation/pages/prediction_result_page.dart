import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:massaye/core/config/app_config.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/consultation/presentation/pages/request_consultation_page.dart';
import 'package:massaye/features/prediction/data/models/prediction_model.dart';
import 'package:massaye/features/prediction/data/repositories/prediction_repository.dart';

class PredictionResultPage extends StatefulWidget {
  final PredictionModel result;

  const PredictionResultPage({super.key, required this.result});

  @override
  State<PredictionResultPage> createState() => _PredictionResultPageState();
}

class _PredictionResultPageState extends State<PredictionResultPage>
    with SingleTickerProviderStateMixin {
  late PredictionModel _result;
  bool _isLoadingDetail = false;

  // Stream simulation variables
  Timer? _streamTimer;
  int _charIndex = 0;
  String _streamedFullText = '';
  String _streamedTextVisible = '';
  bool _isStreamingActive = false;

  @override
  void initState() {
    super.initState();
    _result = widget.result;

    if (_result.isValidCropImage &&
        _result.id > 0 &&
        (_result.solutionDetail == null || _result.solutionDetail!.isEmpty)) {
      _fetchFullDetail();
    } else if (_result.isValidCropImage) {
      _startTextStream();
    }
  }

  void _startTextStream() {
    final sol = _result.solutionDetail ?? {};
    final description = sol['description']?.toString() ??
        'AI neural analysis identified ${_result.displayName} on this crop with high confidence.';

    final immediate = _extractList(sol['immediate_actions'] ?? sol['actions']);
    final immediateSnippet = immediate.isNotEmpty
        ? '\n\n⚡ Immediate Action:\n• ' + immediate.take(2).join('\n• ')
        : '';

    _streamedFullText = '$description$immediateSnippet';
    _charIndex = 0;
    _streamedTextVisible = '';
    _isStreamingActive = true;

    _streamTimer?.cancel();
    _streamTimer = Timer.periodic(const Duration(milliseconds: 18), (timer) {
      if (_charIndex < _streamedFullText.length) {
        setState(() {
          _charIndex = (_charIndex + 3).clamp(0, _streamedFullText.length);
          _streamedTextVisible = _streamedFullText.substring(0, _charIndex);
        });
      } else {
        timer.cancel();
        if (mounted) setState(() => _isStreamingActive = false);
      }
    });
  }

  @override
  void dispose() {
    _streamTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchFullDetail() async {
    setState(() => _isLoadingDetail = true);
    try {
      final repo = context.read<PredictionRepository>();
      final full = await repo.getPredictionDetail(_result.id);
      if (mounted) {
        setState(() {
          _result = full;
          _isLoadingDetail = false;
        });
        _startTextStream();
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoadingDetail = false);
        _startTextStream();
      }
    }
  }

  List<String> _extractList(dynamic value) {
    if (value is List) {
      return value.map((e) => e.toString()).toList();
    }
    if (value is String && value.trim().isNotEmpty) {
      return [value];
    }
    return [];
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required Color iconColor,
    required Color headerBg,
    required Widget content,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppTheme.cardWhite,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.black.withOpacity(0.04)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: headerBg,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Row(
              children: [
                Icon(icon, size: 20, color: iconColor),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: iconColor,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: content,
          ),
        ],
      ),
    );
  }

  Widget _buildBulletList(List<String> items, {Color bulletColor = AppTheme.darkForest}) {
    if (items.isEmpty) {
      return const Text(
        'No specific recommendations listed.',
        style: TextStyle(fontSize: 13, color: AppTheme.mutedOlive),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items.map((item) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 8.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 5.0),
                child: Icon(Icons.circle, size: 6, color: bulletColor),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  item,
                  style: const TextStyle(fontSize: 13, color: Color(0xFF334155), height: 1.4),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final result = _result;

    if (!result.isValidCropImage) {
      return Scaffold(
        backgroundColor: AppTheme.creamBackground,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: AppTheme.charcoalText),
            onPressed: () => Navigator.pop(context),
            tooltip: 'Back',
          ),
          title: const Text('Diagnostic Results'),
        ),
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  color: Color(0xFFFFF3E0),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.warning_amber_rounded, size: 60, color: Colors.orange),
              ),
              const SizedBox(height: 20),
              const Text(
                'Image Not Recognized as a Supported Crop',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.charcoalText,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                result.agentMessage ??
                    'The AI system could not confirm a valid crop plant in this photo. Please take a clear, focused photo of the infected leaf in good lighting.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, color: AppTheme.mutedOlive, height: 1.4),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.darkForest,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: const Text('Try Again', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final sol = result.solutionDetail ?? {};
    final symptoms = _extractList(sol['symptoms']);
    final immediateActions = _extractList(sol['immediate_actions'] ?? sol['actions']);
    final chemicalTreatments = _extractList(sol['chemical_treatment'] ?? sol['treatments']);
    final organicTreatments = _extractList(sol['organic_treatment']);
    final preventions = _extractList(sol['prevention'] ?? sol['preventions'] ?? sol['preventive_measures']);
    final fertilizerAdvice = sol['fertilizer_advice']?.toString() ?? '';
    final topPredictions = result.topPredictions ?? [];

    final imageUrl = AppConfig.resolveMediaUrl(result.image);

    return Scaffold(
      backgroundColor: AppTheme.creamBackground,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppTheme.charcoalText),
          onPressed: () => Navigator.pop(context),
          tooltip: 'Back',
        ),
        title: Text(result.crop.isNotEmpty ? '${result.crop} Diagnosis' : 'Diagnostic Results'),
        actions: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.close_rounded),
            tooltip: 'Close',
          ),
        ],
      ),
      body: _isLoadingDetail
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ==========================================
                  // 1. HERO SUMMARY CARD WITH IMAGE & STATUS
                  // ==========================================
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppTheme.cardWhite,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.black.withOpacity(0.04)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (imageUrl.isNotEmpty) ...[
                          ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: Image.network(
                              imageUrl,
                              width: double.infinity,
                              height: 200,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: result.isHealthy ? AppTheme.mintGreenPill : const Color(0xFFFFEBEE),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    result.isHealthy ? Icons.check_circle_rounded : Icons.warning_rounded,
                                    size: 16,
                                    color: result.isHealthy ? AppTheme.mintGreenText : const Color(0xFFC62828),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    result.isHealthy ? 'Healthy Plant' : 'Disease Detected',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: result.isHealthy ? AppTheme.mintGreenText : const Color(0xFFC62828),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppTheme.creamBackground,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                result.crop.toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.darkForest,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          result.displayName,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.charcoalText,
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Confidence Meter
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'AI Confidence',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.mutedOlive),
                            ),
                            Text(
                              '${(result.confidence > 1.0 ? result.confidence : result.confidence * 100).toStringAsFixed(1)}%',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.darkForest,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: LinearProgressIndicator(
                            value: result.confidence > 1.0 ? result.confidence / 100.0 : result.confidence,
                            minHeight: 8,
                            backgroundColor: AppTheme.creamBackground,
                            color: result.isHealthy ? AppTheme.darkForest : const Color(0xFFD97706),
                          ),
                        ),

                        // ==========================================
                        // LIVE AI STREAMING DIAGNOSIS CARD
                        // ==========================================
                        const SizedBox(height: 16),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFF064E3B).withOpacity(0.06),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFF10B981).withOpacity(0.2)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: _isStreamingActive ? const Color(0xFF10B981) : AppTheme.darkForest,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    _isStreamingActive ? 'AI DIAGNOSTIC STREAM • ANALYZING...' : 'AI CLINICAL SUMMARY',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.darkForest,
                                      letterSpacing: 0.8,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _streamedTextVisible.isEmpty
                                    ? 'Generating clinical diagnosis and treatments...'
                                    : _streamedTextVisible + (_isStreamingActive ? ' ▌' : ''),
                                style: const TextStyle(
                                  fontSize: 13,
                                  height: 1.45,
                                  color: Color(0xFF1E293B),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Quick Officer Consultation CTA
                        if (!result.isHealthy) ...[
                          const SizedBox(height: 16),
                          InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const RequestConsultationPage()),
                              );
                            },
                            borderRadius: BorderRadius.circular(14),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF0FDF4),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: AppTheme.darkForest.withOpacity(0.2)),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.support_agent_rounded, size: 20, color: AppTheme.darkForest),
                                  SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      'Need expert help? Request an officer consultation',
                                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.darkForest),
                                    ),
                                  ),
                                  Icon(Icons.arrow_forward_ios_rounded, size: 12, color: AppTheme.darkForest),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // ==========================================
                  // 2. MODEL PROBABILITIES BREAKDOWN
                  // ==========================================
                  if (topPredictions.length > 1)
                    _buildSectionCard(
                      title: 'Model Alternative Probabilities',
                      icon: Icons.bar_chart_rounded,
                      iconColor: const Color(0xFF2563EB),
                      headerBg: const Color(0xFFEFF6FF),
                      content: Column(
                        children: topPredictions.map((p) {
                          final name = p['disease'] ?? p['display_name'] ?? p['class'] ?? 'Option';
                          final rawConf = p['confidence'] ?? 0;
                          final double confVal = (rawConf is num) ? rawConf.toDouble() : 0.0;
                          final double pct = confVal > 1.0 ? confVal : confVal * 100.0;

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 10.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        name.toString(),
                                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.charcoalText),
                                      ),
                                    ),
                                    Text(
                                      '${pct.toStringAsFixed(1)}%',
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2563EB)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(6),
                                  child: LinearProgressIndicator(
                                    value: pct / 100.0,
                                    minHeight: 6,
                                    backgroundColor: const Color(0xFFF1F5F9),
                                    color: const Color(0xFF3B82F6),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),

                  // ==========================================
                  // 3. SYMPTOMS & IMMEDIATE ACTIONS
                  // ==========================================
                  if (symptoms.isNotEmpty)
                    _buildSectionCard(
                      title: 'Symptoms',
                      icon: Icons.remove_red_eye_outlined,
                      iconColor: const Color(0xFFD97706),
                      headerBg: const Color(0xFFFFFBEB),
                      content: _buildBulletList(symptoms, bulletColor: const Color(0xFFD97706)),
                    ),

                  if (immediateActions.isNotEmpty)
                    _buildSectionCard(
                      title: 'Immediate Actions',
                      icon: Icons.flash_on_rounded,
                      iconColor: const Color(0xFFDC2626),
                      headerBg: const Color(0xFFFEF2F2),
                      content: _buildBulletList(immediateActions, bulletColor: const Color(0xFFDC2626)),
                    ),

                  // ==========================================
                  // 4. TREATMENTS (ORGANIC & CHEMICAL)
                  // ==========================================
                  if (organicTreatments.isNotEmpty)
                    _buildSectionCard(
                      title: 'Organic / Biological Treatment',
                      icon: Icons.eco_rounded,
                      iconColor: AppTheme.darkForest,
                      headerBg: const Color(0xFFF0FDF4),
                      content: _buildBulletList(organicTreatments, bulletColor: AppTheme.darkForest),
                    ),

                  if (chemicalTreatments.isNotEmpty)
                    _buildSectionCard(
                      title: 'Chemical Treatment',
                      icon: Icons.science_rounded,
                      iconColor: const Color(0xFF7C3AED),
                      headerBg: const Color(0xFFF5F3FF),
                      content: _buildBulletList(chemicalTreatments, bulletColor: const Color(0xFF7C3AED)),
                    ),

                  // ==========================================
                  // 5. PREVENTION & FERTILIZER ADVICE
                  // ==========================================
                  if (preventions.isNotEmpty)
                    _buildSectionCard(
                      title: 'Prevention & Cultural Practices',
                      icon: Icons.shield_outlined,
                      iconColor: const Color(0xFF0D9488),
                      headerBg: const Color(0xFFF0FDFA),
                      content: _buildBulletList(preventions, bulletColor: const Color(0xFF0D9488)),
                    ),

                  if (fertilizerAdvice.isNotEmpty)
                    _buildSectionCard(
                      title: 'Fertilizer & Soil Advice',
                      icon: Icons.grass_rounded,
                      iconColor: const Color(0xFF059669),
                      headerBg: const Color(0xFFECFDF5),
                      content: Text(
                        fertilizerAdvice,
                        style: const TextStyle(fontSize: 13, height: 1.45, color: Color(0xFF334155)),
                      ),
                    ),

                  const SizedBox(height: 20),

                  // Bottom Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(context),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppTheme.darkForest),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                          child: const Text('Back / Done', style: TextStyle(color: AppTheme.darkForest, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.darkForest,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                          child: const Text('Scan Another', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }
}
