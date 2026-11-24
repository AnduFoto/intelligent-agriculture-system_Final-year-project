import React, { useState, useRef, useEffect } from 'react';
import { Button, Tooltip } from 'antd';
import { SendOutlined, PictureOutlined, VideoCameraOutlined, AudioOutlined, CloseOutlined, StopOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import chatService from '../../api/chatService';

export const MessageInput = ({
  conversationId,
  onSendMessage,
  replyingTo,
  onCancelReply,
  isDisabled
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [fileAttachment, setFileAttachment] = useState(null);
  const [attachmentType, setAttachmentType] = useState('FILE'); // 'IMAGE' | 'VIDEO' | 'FILE'
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle typing indicator trigger
  const handleTextChange = (e) => {
    setText(e.target.value);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      if (conversationId) {
        chatService.sendTyping(conversationId).catch(() => {});
      }
    }, 500);
  };

  // Voice recording controls
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert(t('mic_access_denied', 'Microphone access denied or not supported in browser.'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFileAttachment(file);
      setAttachmentType(type);
    }
  };

  const removeFileAttachment = () => {
    setFileAttachment(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if (isDisabled) return;

    if (audioBlob) {
      // Send Voice Message
      const formData = new FormData();
      formData.append('media_file', audioBlob, 'voice_recording.webm');
      formData.append('message_type', 'VOICE');
      if (replyingTo) formData.append('reply_to_id', replyingTo.id);
      
      onSendMessage(formData);
      cancelRecording();
    } else if (fileAttachment) {
      // Send Media File
      const formData = new FormData();
      formData.append('media_file', fileAttachment);
      formData.append('message_type', attachmentType);
      formData.append('file_name', fileAttachment.name);
      if (text.trim()) formData.append('text', text.trim());
      if (replyingTo) formData.append('reply_to_id', replyingTo.id);

      onSendMessage(formData);
      removeFileAttachment();
      setText('');
    } else if (text.trim()) {
      // Send Text Message
      onSendMessage({
        text: text.trim(),
        message_type: 'TEXT',
        reply_to_id: replyingTo ? replyingTo.id : null
      });
      setText('');
    }

    if (onCancelReply) onCancelReply();
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isDisabled) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-center text-sm font-medium rounded-xl border border-amber-200 dark:border-amber-800">
        {t('chat_disabled_blocked', 'Messaging is currently disabled for this conversation.')}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 p-3 rounded-b-2xl transition-colors">
      
      {/* Replying Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-2 mb-2 bg-slate-100 dark:bg-zinc-800 rounded-lg text-xs border-l-4 border-emerald-500">
          <div className="truncate">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{t('replying_to', 'Replying to')} {replyingTo.sender?.full_name}:</span>
            <span className="text-slate-600 dark:text-slate-300 ml-2 truncate">{replyingTo.text || t('attachment', 'Attachment')}</span>
          </div>
          <button onClick={onCancelReply} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2">
            <CloseOutlined />
          </button>
        </div>
      )}

      {/* Attachment Preview Banner */}
      {fileAttachment && (
        <div className="flex items-center justify-between px-3 py-2 mb-2 bg-slate-100 dark:bg-zinc-800 rounded-lg text-xs">
          <div className="flex items-center gap-2 truncate">
            <PaperClipOutlined className="text-emerald-600" />
            <span className="font-medium truncate">{fileAttachment.name}</span>
            <span className="text-slate-400">({(fileAttachment.size / 1024).toFixed(1)} KB)</span>
          </div>
          <button onClick={removeFileAttachment} className="text-slate-400 hover:text-red-500">
            <CloseOutlined />
          </button>
        </div>
      )}

      {/* Audio Recording / Preview Mode */}
      {isRecording ? (
        <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-mono text-sm font-semibold">{t('recording', 'Recording')}: {formatTimer(recordingTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={cancelRecording}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button size="small" type="primary" danger icon={<StopOutlined />} onClick={stopRecording}>
              {t('done', 'Done')}
            </Button>
          </div>
        </div>
      ) : audioUrl ? (
        <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <audio src={audioUrl} controls className="h-8 max-w-xs" />
          <div className="flex items-center gap-2">
            <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={cancelRecording} />
            <Button size="small" type="primary" icon={<SendOutlined />} className="bg-emerald-600" onClick={handleSend}>
              {t('send', 'Send')}
            </Button>
          </div>
        </div>
      ) : (
        /* Normal Input Toolbar */
        <div className="flex items-end gap-2">
          
          {/* File Action Buttons */}
          <div className="flex items-center gap-1">
            <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'IMAGE')} />
            <Tooltip title={t('attach_image', 'Attach Image')}>
              <Button type="text" icon={<PictureOutlined className="text-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400" />} onClick={() => imageInputRef.current?.click()} />
            </Tooltip>

            <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, 'VIDEO')} />
            <Tooltip title={t('attach_video', 'Attach Video')}>
              <Button type="text" icon={<VideoCameraOutlined className="text-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400" />} onClick={() => videoInputRef.current?.click()} />
            </Tooltip>

            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'FILE')} />
            <Tooltip title={t('attach_file', 'Attach File')}>
              <Button type="text" icon={<PaperClipOutlined className="text-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400" />} onClick={() => fileInputRef.current?.click()} />
            </Tooltip>
          </div>

          {/* Multiline Text Input */}
          <div className="flex-1 relative">
            <textarea
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t('type_message_placeholder', 'Type a message...')}
              className="w-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-colors max-h-28"
            />
          </div>

          {/* Voice Record or Send Button */}
          {text.trim() || fileAttachment ? (
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              className="bg-emerald-600 hover:bg-emerald-700 h-10 w-10 flex items-center justify-center border-none shadow-md"
              onClick={handleSend}
            />
          ) : (
            <Tooltip title={t('record_voice', 'Record Voice')}>
              <Button
                type="primary"
                shape="circle"
                icon={<AudioOutlined />}
                className="bg-emerald-600 hover:bg-emerald-700 h-10 w-10 flex items-center justify-center border-none shadow-md"
                onClick={startRecording}
              />
            </Tooltip>
          )}

        </div>
      )}

    </div>
  );
};
