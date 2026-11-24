import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:massaye/features/community/presentation/bloc/community_bloc.dart';
import 'package:massaye/features/community/presentation/bloc/community_event.dart';
import 'package:massaye/features/community/presentation/bloc/community_state.dart';

class CreatePostPage extends StatefulWidget {
  const CreatePostPage({super.key});

  @override
  State<CreatePostPage> createState() => _CreatePostPageState();
}

class _CreatePostPageState extends State<CreatePostPage> {
  final _contentController = TextEditingController();
  final ImagePicker _picker = ImagePicker();
  XFile? _attachedMedia;
  String? _selectedCropTag;

  final List<String> _cropOptions = [
    'Tef',
    'Maize',
    'Potato',
    'Wheat',
    'Coffee',
    'Barley',
    'Sorghum',
  ];

  @override
  void dispose() {
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _pickMedia() async {
    final media = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (media != null) {
      setState(() => _attachedMedia = media);
    }
  }

  void _submitPost() {
    final text = _contentController.text.trim();
    if (text.isEmpty) return;

    context.read<CommunityBloc>().add(CreateCommunityPostEvent(
          content: text,
          cropTag: _selectedCropTag,
          mediaFile: _attachedMedia,
        ));
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthBloc>().state.user;

    return Scaffold(
      backgroundColor: AppTheme.creamBackground,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppTheme.charcoalText),
          onPressed: () => Navigator.pop(context),
          tooltip: 'Back',
        ),
        title: const Text('Create Community Post'),
        actions: [
          BlocConsumer<CommunityBloc, CommunityState>(
            listener: (context, state) {
              if (state.status == CommunityStatus.postCreated) {
                Navigator.pop(context);
              }
            },
            builder: (context, state) {
              final isSubmitting = state.status == CommunityStatus.creatingPost;
              return Padding(
                padding: const EdgeInsets.only(right: 16.0),
                child: ElevatedButton(
                  onPressed: isSubmitting ? null : _submitPost,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
                  ),
                  child: isSubmitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Publish'),
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User Header
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: AppTheme.darkForest,
                  child: Text(
                    user != null && user.firstName.isNotEmpty ? user.firstName[0].toUpperCase() : 'U',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user?.fullName ?? 'Farmer',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
                    ),
                    Text(
                      user?.locationSummary ?? 'Local Kebele Member',
                      style: TextStyle(fontSize: 12, color: AppTheme.mutedOlive),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Content Input Box
            TextField(
              controller: _contentController,
              maxLines: 6,
              decoration: InputDecoration(
                hintText: 'Share your agricultural experience or ask a question...',
                filled: true,
                fillColor: AppTheme.cardWhite,
                contentPadding: const EdgeInsets.all(18),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: BorderSide(color: Colors.black.withOpacity(0.06)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: BorderSide(color: Colors.black.withOpacity(0.06)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: const BorderSide(color: AppTheme.darkForest, width: 2),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Crop Tag Selector
            const Text(
              'Crop Category (Optional)',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _cropOptions.map((crop) {
                final isSelected = _selectedCropTag == crop;
                return ChoiceChip(
                  label: Text(crop),
                  selected: isSelected,
                  selectedColor: AppTheme.darkForest,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppTheme.charcoalText,
                    fontWeight: FontWeight.bold,
                  ),
                  backgroundColor: AppTheme.cardWhite,
                  onSelected: (selected) {
                    setState(() {
                      _selectedCropTag = selected ? crop : null;
                    });
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 20),

            // Attached Media Preview if selected
            if (_attachedMedia != null) ...[
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: kIsWeb
                        ? Image.network(
                            _attachedMedia!.path,
                            height: 180,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          )
                        : Image.file(
                            File(_attachedMedia!.path),
                            height: 180,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: InkWell(
                      onTap: () => setState(() => _attachedMedia = null),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(
                          color: Colors.black54,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.close, color: Colors.white, size: 18),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
            ],

            // Add Media Button
            OutlinedButton.icon(
              onPressed: _pickMedia,
              icon: const Icon(Icons.add_photo_alternate_rounded, color: AppTheme.darkForest),
              label: const Text('Add Photo / Media Attachment', style: TextStyle(color: AppTheme.darkForest, fontWeight: FontWeight.bold)),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                side: const BorderSide(color: AppTheme.darkForest, width: 1.5),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
