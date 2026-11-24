import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/prediction/presentation/bloc/prediction_bloc.dart';
import 'package:massaye/features/prediction/presentation/bloc/prediction_event.dart';
import 'package:massaye/features/prediction/presentation/bloc/prediction_state.dart';
import 'package:massaye/features/prediction/presentation/pages/prediction_result_page.dart';

class PredictionScannerPage extends StatefulWidget {
  const PredictionScannerPage({super.key});

  @override
  State<PredictionScannerPage> createState() => _PredictionScannerPageState();
}

class _PredictionScannerPageState extends State<PredictionScannerPage> {
  final ImagePicker _picker = ImagePicker();
  XFile? _selectedImage;

  Future<void> _pickFromCamera() async {
    final XFile? photo = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 85,
    );
    if (photo != null) {
      setState(() => _selectedImage = photo);
    }
  }

  Future<void> _pickFromGallery() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (image != null) {
      setState(() => _selectedImage = image);
    }
  }

  void _runAnalysis() {
    if (_selectedImage != null) {
      context.read<PredictionBloc>().add(UploadImageForDiagnosisEvent(_selectedImage!));
    }
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
        title: const Text('AI Disease Diagnostics'),
      ),
      body: BlocConsumer<PredictionBloc, PredictionState>(
        listener: (context, state) {
          if (state.status == PredictionStatus.success && state.result != null) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => PredictionResultPage(result: state.result!),
              ),
            );
          }
        },
        builder: (context, state) {
          final isAnalyzing = state.status == PredictionStatus.analyzing;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Banner
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    gradient: const LinearGradient(
                      colors: [AppTheme.sunriseStart, AppTheme.sunriseEnd],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: const BoxDecoration(
                          color: AppTheme.darkForest,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.psychology_rounded, color: Colors.white, size: 28),
                      ),
                      const SizedBox(width: 14),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Instant AI Diagnostics',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.charcoalText,
                              ),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Upload a clear leaf photo for disease identification & treatment.',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppTheme.charcoalText,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Error Banner if present
                if (state.status == PredictionStatus.error && state.errorMessage != null) ...[
                  Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFEBEE),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFFFCDD2)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline_rounded, color: Colors.red),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            state.errorMessage!,
                            style: const TextStyle(
                              fontSize: 13,
                              color: Color(0xFFC62828),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // Image Preview Card
                Container(
                  width: double.infinity,
                  height: 260,
                  decoration: BoxDecoration(
                    color: AppTheme.cardWhite,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.black.withOpacity(0.06)),
                  ),
                  child: _selectedImage != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(24),
                          child: kIsWeb
                              ? Image.network(
                                  _selectedImage!.path,
                                  fit: BoxFit.cover,
                                  width: double.infinity,
                                )
                              : Image.file(
                                  File(_selectedImage!.path),
                                  fit: BoxFit.cover,
                                  width: double.infinity,
                                ),
                        )
                      : Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: const BoxDecoration(
                                color: AppTheme.mintGreenPill,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.add_a_photo_rounded,
                                size: 40,
                                color: AppTheme.darkForest,
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'No Crop Image Selected',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.charcoalText,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Use Camera or Gallery to select a leaf photo',
                              style: TextStyle(fontSize: 12, color: AppTheme.mutedOlive),
                            ),
                          ],
                        ),
                ),

                const SizedBox(height: 20),

                // Source Selector Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: isAnalyzing ? null : _pickFromCamera,
                        icon: const Icon(Icons.camera_alt_rounded, color: AppTheme.darkForest),
                        label: const Text('Camera', style: TextStyle(color: AppTheme.darkForest, fontWeight: FontWeight.bold)),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          side: const BorderSide(color: AppTheme.darkForest, width: 1.5),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: isAnalyzing ? null : _pickFromGallery,
                        icon: const Icon(Icons.photo_library_rounded, color: AppTheme.darkForest),
                        label: const Text('Gallery', style: TextStyle(color: AppTheme.darkForest, fontWeight: FontWeight.bold)),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          side: const BorderSide(color: AppTheme.darkForest, width: 1.5),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Analyze CTA Button
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: (_selectedImage == null || isAnalyzing) ? null : _runAnalysis,
                    child: isAnalyzing
                        ? const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                              ),
                              SizedBox(width: 12),
                              Text('Analyzing Crop Image...'),
                            ],
                          )
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.auto_awesome_rounded, size: 20),
                              SizedBox(width: 10),
                              Text('Run AI Diagnosis'),
                            ],
                          ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
