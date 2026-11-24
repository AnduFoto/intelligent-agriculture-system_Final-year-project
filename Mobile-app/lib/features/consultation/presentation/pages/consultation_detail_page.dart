import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:massaye/core/config/app_config.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/consultation/data/models/consultation_model.dart';
import 'package:massaye/features/consultation/data/repositories/consultation_repository.dart';

class ConsultationDetailPage extends StatefulWidget {
  final int consultationId;

  const ConsultationDetailPage({super.key, required this.consultationId});

  @override
  State<ConsultationDetailPage> createState() => _ConsultationDetailPageState();
}

class _ConsultationDetailPageState extends State<ConsultationDetailPage> {
  ConsultationModel? _consultation;
  bool _isLoading = true;
  String? _error;
  final TextEditingController _messageController = TextEditingController();
  bool _isSending = false;
  bool _isClosing = false;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadConsultation();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadConsultation() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final repo = context.read<ConsultationRepository>();
      final item = await repo.getConsultationDetail(widget.consultationId);
      if (mounted) {
        setState(() {
          _consultation = item;
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

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _isSending) return;

    setState(() => _isSending = true);
    try {
      final repo = context.read<ConsultationRepository>();
      await repo.sendMessage(widget.consultationId, text);
      _messageController.clear();
      await _loadConsultation();
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent + 80,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceAll('Exception: ', ''))),
        );
      }
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  Future<void> _closeConsultation() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Close Consultation?'),
        content: const Text(
          'Are you sure you want to close this consultation? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Close Consultation', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isClosing = true);
    try {
      final repo = context.read<ConsultationRepository>();
      await repo.closeConsultation(widget.consultationId);
      await _loadConsultation();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Consultation closed successfully.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString().replaceAll('Exception: ', ''))),
        );
      }
    } finally {
      if (mounted) setState(() => _isClosing = false);
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
      return DateFormat('MMM d, yyyy • h:mm a').format(dt);
    } catch (_) {
      return isoString;
    }
  }

  void _showImageModal(String imageUrl) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(12),
        child: Stack(
          alignment: Alignment.topRight,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.network(
                AppConfig.resolveMediaUrl(imageUrl),
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => Container(
                  color: Colors.black54,
                  padding: const EdgeInsets.all(32),
                  child: const Text('Failed to load image', style: TextStyle(color: Colors.white)),
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close, color: Colors.white, size: 28),
              onPressed: () => Navigator.pop(ctx),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final consultation = _consultation;

    return Scaffold(
      backgroundColor: AppTheme.creamBackground,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppTheme.charcoalText),
          onPressed: () => Navigator.pop(context),
          tooltip: 'Back',
        ),
        title: Text(consultation != null ? consultation.cropName : 'Consultation Detail'),
        actions: [
          if (consultation != null && consultation.status.toUpperCase() != 'CLOSED')
            TextButton(
              onPressed: _isClosing ? null : _closeConsultation,
              child: _isClosing
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text(
                      'Close',
                      style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                    ),
            ),
          IconButton(
            onPressed: _loadConsultation,
            icon: const Icon(Icons.refresh_rounded),
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
                        Text(
                          _error!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 14, color: AppTheme.charcoalText),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _loadConsultation,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : consultation == null
                  ? const Center(child: Text('Consultation not found'))
                  : Column(
                      children: [
                        Expanded(
                          child: ListView(
                            controller: _scrollController,
                            padding: const EdgeInsets.all(16),
                            children: [
                              // Header Status Card
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: AppTheme.cardWhite,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: Colors.black.withOpacity(0.04)),
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
                                            consultation.cropName,
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
                                            color: _getStatusBg(consultation.status),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            consultation.status.replaceAll('_', ' '),
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              color: _getStatusColor(consultation.status),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Text(
                                      consultation.title,
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.charcoalText,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        const Icon(Icons.location_on_outlined, size: 14, color: AppTheme.mutedOlive),
                                        const SizedBox(width: 4),
                                        Text(
                                          consultation.kebeleName,
                                          style: const TextStyle(fontSize: 12, color: AppTheme.mutedOlive),
                                        ),
                                        const SizedBox(width: 12),
                                        const Icon(Icons.schedule_rounded, size: 14, color: AppTheme.mutedOlive),
                                        const SizedBox(width: 4),
                                        Text(
                                          _formatDate(consultation.createdAt),
                                          style: const TextStyle(fontSize: 12, color: AppTheme.mutedOlive),
                                        ),
                                      ],
                                    ),
                                    if (consultation.assignedOfficerEmail != null) ...[
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          const Icon(Icons.support_agent_rounded, size: 14, color: AppTheme.darkForest),
                                          const SizedBox(width: 4),
                                          Text(
                                            'Officer: ${consultation.assignedOfficerEmail}',
                                            style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: AppTheme.darkForest,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                    if (consultation.description != null &&
                                        consultation.description!.trim().isNotEmpty) ...[
                                      const Divider(height: 24),
                                      const Text(
                                        'Problem Description:',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.charcoalText,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        consultation.description!,
                                        style: const TextStyle(fontSize: 13, height: 1.4, color: Color(0xFF475569)),
                                      ),
                                    ],
                                    if (consultation.images.isNotEmpty) ...[
                                      const Divider(height: 24),
                                      const Text(
                                        'Attached Images:',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.charcoalText,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      SizedBox(
                                        height: 80,
                                        child: ListView.separated(
                                          scrollDirection: Axis.horizontal,
                                          itemCount: consultation.images.length,
                                          separatorBuilder: (_, __) => const SizedBox(width: 8),
                                          itemBuilder: (ctx, idx) {
                                            final img = consultation.images[idx];
                                            final fullUrl = AppConfig.resolveMediaUrl(img.image);
                                            return GestureDetector(
                                              onTap: () => _showImageModal(img.image),
                                              child: ClipRRect(
                                                borderRadius: BorderRadius.circular(12),
                                                child: Image.network(
                                                  fullUrl,
                                                  width: 80,
                                                  height: 80,
                                                  fit: BoxFit.cover,
                                                  errorBuilder: (_, __, ___) => Container(
                                                    width: 80,
                                                    height: 80,
                                                    color: Colors.grey.shade200,
                                                    child: const Icon(Icons.broken_image, size: 24),
                                                  ),
                                                ),
                                              ),
                                            );
                                          },
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),

                              const SizedBox(height: 20),
                              const Text(
                                'Conversation & Advice',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.charcoalText,
                                ),
                              ),
                              const SizedBox(height: 10),

                              // Chat Messages List
                              if (consultation.messages.isEmpty)
                                Container(
                                  padding: const EdgeInsets.all(20),
                                  margin: const EdgeInsets.only(top: 8),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: const Center(
                                    child: Text(
                                      'No messages yet. Send a message to your extension officer.',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(fontSize: 13, color: AppTheme.mutedOlive),
                                    ),
                                  ),
                                )
                              else
                                ...consultation.messages.map((msg) {
                                  final isOfficer = msg.senderRole.toUpperCase() == 'OFFICER' ||
                                      msg.senderRole.toUpperCase() == 'LEAD_OFFICER';

                                  return Container(
                                    margin: const EdgeInsets.only(bottom: 12),
                                    padding: const EdgeInsets.all(14),
                                    decoration: BoxDecoration(
                                      color: isOfficer ? const Color(0xFFF0FDF4) : AppTheme.cardWhite,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(
                                        color: isOfficer ? AppTheme.darkForest.withOpacity(0.2) : Colors.black.withOpacity(0.04),
                                      ),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Row(
                                              children: [
                                                Text(
                                                  msg.senderFullName,
                                                  style: const TextStyle(
                                                    fontSize: 13,
                                                    fontWeight: FontWeight.bold,
                                                    color: AppTheme.charcoalText,
                                                  ),
                                                ),
                                                const SizedBox(width: 6),
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                  decoration: BoxDecoration(
                                                    color: isOfficer ? AppTheme.darkForest : const Color(0xFF64748B),
                                                    borderRadius: BorderRadius.circular(6),
                                                  ),
                                                  child: Text(
                                                    isOfficer ? 'Officer' : 'Farmer',
                                                    style: const TextStyle(
                                                      fontSize: 9,
                                                      fontWeight: FontWeight.bold,
                                                      color: Colors.white,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                            Text(
                                              _formatDate(msg.createdAt),
                                              style: const TextStyle(fontSize: 10, color: AppTheme.mutedOlive),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          msg.message,
                                          style: const TextStyle(
                                            fontSize: 13,
                                            height: 1.4,
                                            color: Color(0xFF334155),
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                }),
                            ],
                          ),
                        ),

                        // Chat Input Box
                        if (consultation.status.toUpperCase() != 'CLOSED')
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 10,
                                  offset: const Offset(0, -3),
                                ),
                              ],
                            ),
                            child: SafeArea(
                              child: Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      controller: _messageController,
                                      minLines: 1,
                                      maxLines: 4,
                                      decoration: InputDecoration(
                                        hintText: 'Type message or question...',
                                        hintStyle: const TextStyle(fontSize: 13, color: AppTheme.mutedOlive),
                                        filled: true,
                                        fillColor: AppTheme.creamBackground,
                                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                        border: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(24),
                                          borderSide: BorderSide.none,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  IconButton.filled(
                                    onPressed: _isSending ? null : _sendMessage,
                                    style: IconButton.styleFrom(
                                      backgroundColor: AppTheme.darkForest,
                                    ),
                                    icon: _isSending
                                        ? const SizedBox(
                                            width: 18,
                                            height: 18,
                                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                          )
                                        : const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                                  ),
                                ],
                              ),
                            ),
                          )
                        else
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(14),
                            color: const Color(0xFFF1F5F9),
                            child: const Text(
                              'This consultation is closed. No new messages can be posted.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                            ),
                          ),
                      ],
                    ),
    );
  }
}
