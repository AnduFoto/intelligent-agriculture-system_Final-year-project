import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:massaye/core/config/app_config.dart';
import 'package:massaye/core/theme/app_theme.dart';
import 'package:massaye/features/chat/data/models/chat_message_model.dart';
import 'package:massaye/features/chat/data/models/conversation_model.dart';
import 'package:massaye/features/chat/presentation/bloc/chat_bloc.dart';
import 'package:massaye/features/chat/presentation/bloc/chat_event.dart';
import 'package:massaye/features/chat/presentation/bloc/chat_state.dart';
import 'package:massaye/features/chat/presentation/widgets/voice_message_player.dart';

class ChatRoomPage extends StatefulWidget {
  final ConversationModel conversation;

  const ChatRoomPage({super.key, required this.conversation});

  @override
  State<ChatRoomPage> createState() => _ChatRoomPageState();
}

class _ChatRoomPageState extends State<ChatRoomPage> {
  final _messageController = TextEditingController();
  final ImagePicker _picker = ImagePicker();
  final ScrollController _scrollController = ScrollController();
  late final AudioRecorder _audioRecorder;
  bool _isRecording = false;

  @override
  void initState() {
    super.initState();
    _audioRecorder = AudioRecorder();
    context.read<ChatBloc>().add(FetchMessagesEvent(widget.conversation.id));
  }

  @override
  void dispose() {
    _messageController.dispose();
    _audioRecorder.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _sendText() {
    final text = _messageController.text.trim();
    if (text.isNotEmpty) {
      context.read<ChatBloc>().add(SendTextMessageEvent(
            conversationId: widget.conversation.id,
            content: text,
          ));
      _messageController.clear();
      _scrollToBottom();
    }
  }

  Future<void> _pickImage() async {
    final image = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (image != null) {
      if (!mounted) return;
      context.read<ChatBloc>().add(SendMediaOrAudioMessageEvent(
            conversationId: widget.conversation.id,
            filePath: image.path,
            messageType: 'IMAGE',
          ));
      _scrollToBottom();
    }
  }

  Future<void> _toggleAudioRecording() async {
    if (_isRecording) {
      final path = await _audioRecorder.stop();
      setState(() => _isRecording = false);
      if (path != null && path.isNotEmpty) {
        if (!mounted) return;
        context.read<ChatBloc>().add(SendMediaOrAudioMessageEvent(
              conversationId: widget.conversation.id,
              filePath: path,
              messageType: 'AUDIO',
            ));
        _scrollToBottom();
      }
    } else {
      if (await _audioRecorder.hasPermission()) {
        final dir = await getTemporaryDirectory();
        final path = '${dir.path}/voice_${DateTime.now().millisecondsSinceEpoch}.m4a';

        await _audioRecorder.start(
          const RecordConfig(encoder: AudioEncoder.aacLc),
          path: path,
        );
        setState(() => _isRecording = true);
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
        title: Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.mintGreenPill,
              child: Text(
                widget.conversation.otherUserName.isNotEmpty
                    ? widget.conversation.otherUserName[0].toUpperCase()
                    : 'C',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.darkForest),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.conversation.otherUserName,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.charcoalText),
                  ),
                  Text(
                    widget.conversation.otherUserRole,
                    style: TextStyle(fontSize: 11, color: AppTheme.mutedOlive),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Messages Thread
          Expanded(
            child: BlocConsumer<ChatBloc, ChatState>(
              listener: (context, state) {
                _scrollToBottom();
              },
              builder: (context, state) {
                final messages = state.messagesMap[widget.conversation.id] ?? [];

                if (messages.isEmpty) {
                  return Center(
                    child: Text(
                      'No messages yet. Send a message or voice note to begin!',
                      style: TextStyle(color: AppTheme.mutedOlive, fontSize: 13),
                    ),
                  );
                }

                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  reverse: false,
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final msg = messages[index];
                    return _buildMessageBubble(msg);
                  },
                );
              },
            ),
          ),

          // Voice Recording Indicator Bar
          if (_isRecording) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              color: const Color(0xFFFFEBEE),
              child: Row(
                children: const [
                  Icon(Icons.mic, color: Colors.red),
                  SizedBox(width: 10),
                  Text(
                    'Recording voice message... Tap microphone to stop & send',
                    style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ],
              ),
            ),
          ],

          // Input Toolbar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppTheme.cardWhite,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 10,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: Row(
              children: [
                IconButton(
                  onPressed: _pickImage,
                  icon: const Icon(Icons.add_photo_alternate_outlined, color: AppTheme.darkForest),
                ),
                IconButton(
                  onPressed: _toggleAudioRecording,
                  icon: Icon(
                    _isRecording ? Icons.stop_circle_rounded : Icons.mic_rounded,
                    color: _isRecording ? Colors.red : AppTheme.darkForest,
                    size: 28,
                  ),
                ),
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      filled: true,
                      fillColor: AppTheme.creamBackground,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                IconButton(
                  onPressed: _sendText,
                  icon: const Icon(Icons.send_rounded, color: AppTheme.darkForest),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessageModel msg) {
    final isMe = msg.isSender;
    final mediaUrl = AppConfig.resolveMediaUrl(msg.mediaFile);

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isMe ? AppTheme.darkForest : AppTheme.cardWhite,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: Radius.circular(isMe ? 20 : 4),
            bottomRight: Radius.circular(isMe ? 4 : 20),
          ),
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
            if (msg.messageType == 'AUDIO' && mediaUrl.isNotEmpty) ...[
              VoiceMessagePlayer(audioUrl: mediaUrl, isSender: isMe),
            ] else if (msg.messageType == 'IMAGE' && mediaUrl.isNotEmpty) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Image.network(
                  mediaUrl,
                  height: 200,
                  fit: BoxFit.cover,
                ),
              ),
            ] else ...[
              Text(
                msg.text,
                style: TextStyle(
                  fontSize: 14,
                  color: isMe ? Colors.white : AppTheme.charcoalText,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
