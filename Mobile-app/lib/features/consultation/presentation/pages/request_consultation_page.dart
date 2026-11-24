import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/consultation/data/repositories/consultation_repository.dart';

class RequestConsultationPage extends StatefulWidget {
  const RequestConsultationPage({super.key});

  @override
  State<RequestConsultationPage> createState() => _RequestConsultationPageState();
}

class _RequestConsultationPageState extends State<RequestConsultationPage> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final ImagePicker _picker = ImagePicker();
  final List<XFile> _selectedImages = [];

  List<Map<String, dynamic>> _cropTypes = [];
  int? _selectedCropId;
  bool _isLoadingCrops = true;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadCrops();
  }

  Future<void> _loadCrops() async {
    final repo = context.read<ConsultationRepository>();
    try {
      final crops = await repo.getCropTypes();
      if (mounted) {
        setState(() {
          _cropTypes = crops;
          if (crops.isNotEmpty) _selectedCropId = crops.first['id'];
          _isLoadingCrops = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoadingCrops = false);
      }
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    if (_selectedImages.length >= 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You can attach up to 5 photos.')),
      );
      return;
    }

    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 85,
      );
      if (file != null && mounted) {
        setState(() {
          _selectedImages.add(file);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to pick photo: $e')),
        );
      }
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  Future<void> _submitRequest() async {
    final title = _titleController.text.trim();
    final desc = _descController.text.trim();

    if (title.isEmpty || desc.isEmpty || _selectedCropId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final repo = context.read<ConsultationRepository>();
      await repo.createConsultation(
        cropTypeId: _selectedCropId!,
        title: title,
        description: desc,
        images: _selectedImages,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Consultation request submitted!')),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceAll('Exception: ', ''))),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.creamBackground,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppTheme.charcoalText),
          onPressed: () => Navigator.pop(context),
          tooltip: 'Back',
        ),
        title: const Text('Request Officer Consultation'),
      ),
      body: _isLoadingCrops
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Info Banner
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppTheme.mintGreenPill.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.mintGreenPill),
                    ),
                    child: const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.info_outline_rounded, color: AppTheme.darkForest, size: 20),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Your request will be assigned to your assigned Kebele Extension Officer. Please provide clear details and clear plant photos.',
                            style: TextStyle(fontSize: 12, color: AppTheme.darkForest, height: 1.4),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  const Text(
                    'Select Crop Type *',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<int>(
                    value: _selectedCropId,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: AppTheme.cardWhite,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: Colors.black.withOpacity(0.06)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: Colors.black.withOpacity(0.06)),
                      ),
                    ),
                    items: _cropTypes.map((crop) {
                      return DropdownMenuItem<int>(
                        value: crop['id'],
                        child: Text(crop['name'] ?? 'Crop'),
                      );
                    }).toList(),
                    onChanged: (val) => setState(() => _selectedCropId = val),
                  ),

                  const SizedBox(height: 20),
                  const Text(
                    'Subject / Brief Title *',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _titleController,
                    decoration: InputDecoration(
                      hintText: 'e.g., Yellowing leaves in maize field',
                      hintStyle: const TextStyle(fontSize: 13, color: AppTheme.mutedOlive),
                      filled: true,
                      fillColor: AppTheme.cardWhite,
                      contentPadding: const EdgeInsets.all(16),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: Colors.black.withOpacity(0.06)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: Colors.black.withOpacity(0.06)),
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),
                  const Text(
                    'Detailed Issue Description *',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _descController,
                    maxLines: 5,
                    decoration: InputDecoration(
                      hintText: 'Describe symptoms, land area affected, soil condition, and recent weather...',
                      hintStyle: const TextStyle(fontSize: 13, color: AppTheme.mutedOlive),
                      filled: true,
                      fillColor: AppTheme.cardWhite,
                      contentPadding: const EdgeInsets.all(16),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: Colors.black.withOpacity(0.06)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: Colors.black.withOpacity(0.06)),
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Attach Field Photos (Optional)',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
                      ),
                      Text(
                        '${_selectedImages.length}/5',
                        style: const TextStyle(fontSize: 12, color: AppTheme.mutedOlive, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Image picker row
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        if (_selectedImages.length < 5) ...[
                          InkWell(
                            onTap: () => _pickImage(ImageSource.camera),
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                color: AppTheme.cardWhite,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: Colors.black.withOpacity(0.08)),
                              ),
                              child: const Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.camera_alt_rounded, color: AppTheme.darkForest, size: 24),
                                  SizedBox(height: 4),
                                  Text('Camera', style: TextStyle(fontSize: 10, color: AppTheme.charcoalText, fontWeight: FontWeight.w600)),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          InkWell(
                            onTap: () => _pickImage(ImageSource.gallery),
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                color: AppTheme.cardWhite,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: Colors.black.withOpacity(0.08)),
                              ),
                              child: const Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.photo_library_rounded, color: AppTheme.darkForest, size: 24),
                                  SizedBox(height: 4),
                                  Text('Gallery', style: TextStyle(fontSize: 10, color: AppTheme.charcoalText, fontWeight: FontWeight.w600)),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                        ],
                        ..._selectedImages.asMap().entries.map((entry) {
                          final idx = entry.key;
                          final img = entry.value;
                          return Stack(
                            children: [
                              Container(
                                margin: const EdgeInsets.only(right: 8),
                                width: 80,
                                height: 80,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: Colors.black.withOpacity(0.08)),
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(16),
                                  child: kIsWeb
                                      ? Image.network(img.path, fit: BoxFit.cover)
                                      : Image.file(File(img.path), fit: BoxFit.cover),
                                ),
                              ),
                              Positioned(
                                top: 2,
                                right: 10,
                                child: GestureDetector(
                                  onTap: () => _removeImage(idx),
                                  child: Container(
                                    padding: const EdgeInsets.all(3),
                                    decoration: const BoxDecoration(
                                      color: Colors.black54,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.close, size: 14, color: Colors.white),
                                  ),
                                ),
                              ),
                            ],
                          );
                        }),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitRequest,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.darkForest,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: _isSubmitting
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                              'Submit Request to Kebele Officer',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
