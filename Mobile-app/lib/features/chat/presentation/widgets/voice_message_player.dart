import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:massaye/core/theme/app_theme.dart';

class VoiceMessagePlayer extends StatefulWidget {
  final String audioUrl;
  final bool isSender;

  const VoiceMessagePlayer({
    super.key,
    required this.audioUrl,
    required this.isSender,
  });

  @override
  State<VoiceMessagePlayer> createState() => _VoiceMessagePlayerState();
}

class _VoiceMessagePlayerState extends State<VoiceMessagePlayer> {
  late final AudioPlayer _player;
  bool _isPlaying = false;
  Duration _duration = Duration.zero;
  Duration _position = Duration.zero;

  @override
  void initState() {
    super.initState();
    _player = AudioPlayer();

    _player.onPlayerStateChanged.listen((state) {
      if (mounted) {
        setState(() => _isPlaying = state == PlayerState.playing);
      }
    });

    _player.onDurationChanged.listen((d) {
      if (mounted) {
        setState(() => _duration = d);
      }
    });

    _player.onPositionChanged.listen((p) {
      if (mounted) {
        setState(() => _position = p);
      }
    });
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _togglePlay() async {
    if (_isPlaying) {
      await _player.pause();
    } else {
      await _player.play(UrlSource(widget.audioUrl));
    }
  }

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final activeColor = widget.isSender ? Colors.white : AppTheme.darkForest;
    final inactiveColor = widget.isSender ? Colors.white70 : AppTheme.mutedOlive;

    return Container(
      width: 220,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      child: Row(
        children: [
          IconButton(
            onPressed: _togglePlay,
            icon: Icon(
              _isPlaying ? Icons.pause_circle_filled_rounded : Icons.play_circle_fill_rounded,
              size: 34,
              color: activeColor,
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                SliderTheme(
                  data: SliderThemeData(
                    thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                    trackHeight: 3,
                    activeTrackColor: activeColor,
                    inactiveTrackColor: inactiveColor.withOpacity(0.3),
                    thumbColor: activeColor,
                  ),
                  child: Slider(
                    min: 0.0,
                    max: _duration.inMilliseconds.toDouble() > 0
                        ? _duration.inMilliseconds.toDouble()
                        : 1.0,
                    value: _position.inMilliseconds.toDouble().clamp(
                          0.0,
                          _duration.inMilliseconds.toDouble() > 0
                              ? _duration.inMilliseconds.toDouble()
                              : 1.0,
                        ),
                    onChanged: (val) async {
                      await _player.seek(Duration(milliseconds: val.toInt()));
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 10.0),
                  child: Text(
                    _isPlaying ? _formatDuration(_position) : (_duration > Duration.zero ? _formatDuration(_duration) : 'Voice Note'),
                    style: TextStyle(fontSize: 10, color: inactiveColor, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
