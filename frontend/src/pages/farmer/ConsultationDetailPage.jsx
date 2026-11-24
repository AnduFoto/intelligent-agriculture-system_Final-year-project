import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import consultationService from '../../api/consultationService';
import TimelinePanel from '../../components/consultations/TimelinePanel';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';

export default function ConsultationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const loadConsultation = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await consultationService.getConsultationDetail(id);
      setConsultation(data);
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_load_consultation', 'Failed to load this consultation.'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    loadConsultation();
  }, [loadConsultation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    setError('');
    try {
      await consultationService.sendMessage(id, newMessage.trim());
      setNewMessage('');
      loadConsultation();
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_send_message', 'Failed to send message.'));
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm(t('confirm_close_consultation', 'Close this consultation? This cannot be undone.'))) return;
    setClosing(true);
    setError('');
    try {
      await consultationService.closeConsultation(id);
      loadConsultation();
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_close_consultation', 'Failed to close consultation.'));
    } finally {
      setClosing(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'NEW': return 'default';
      case 'ASSIGNED': return 'blue';
      case 'WAITING_FOR_FARMER': return 'warning';
      case 'WAITING_FOR_OFFICER': return 'purple';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{t('loading_consultation', 'Loading consultation...')}</p>
      </div>
    );
  }

  if (error && !consultation) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <Alert variant="error">{error}</Alert>
        <button 
          onClick={() => navigate('/farmer/consultations')} 
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors bg-slate-100 dark:bg-zinc-800 px-4 py-2 rounded-xl w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('back_to_consultations', 'Back to My Consultations')}
        </button>
      </div>
    );
  }

  const isClosed = consultation.status === 'CLOSED';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      
      {/* NAVIGATION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <button 
            onClick={() => navigate('/farmer/consultations')} 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl w-fit mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('back_to_consultations', 'Back to My Consultations')}
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('consultation_details', 'Consultation Details')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
            {t('consultation_id', 'Reference')}: #{consultation.id} &bull; {new Date(consultation.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
        </div>

        <Badge variant={getStatusVariant(consultation.status)} className="text-xs py-1.5 px-3 uppercase font-bold tracking-wider">
          {t(consultation.status.toLowerCase(), consultation.status.replace(/_/g, ' '))}
        </Badge>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CONSULTATION DETAILS */}
          <Card className="p-6 sm:p-8 shadow-md border-primary-100 dark:border-primary-500/20">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-tight mb-4">
              {consultation.title}
            </h2>
            
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-6 bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>{consultation.crop_name}</span>
              </div>
              <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{consultation.kebele_name}</span>
              </div>
              {consultation.assigned_officer_email && (
                <>
                  <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
                  <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{t('assigned_to', 'Assigned')}: {consultation.assigned_officer_email}</span>
                  </div>
                </>
              )}
            </div>

            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {consultation.description}
            </div>

            {consultation.images && consultation.images.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-4">
                  {t('attached_images', 'Attached Evidence')} ({consultation.images.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {consultation.images.map((img) => (
                    <div 
                      key={img.id} 
                      onClick={() => setSelectedImage(img.image)}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm cursor-pointer bg-slate-100 dark:bg-zinc-800"
                    >
                      <img
                        src={img.image}
                        alt="consultation evidence"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* CHAT/CONVERSATION */}
          <Card className="p-0 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-zinc-900/30 shadow-md border-primary-100 dark:border-primary-500/20">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t('conversation', 'Conversation')}
              </h2>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                {consultation.messages?.length || 0} {t('messages', 'messages')}
              </span>
            </div>
            
            <div className="p-6 space-y-6 flex-1 max-h-[600px] overflow-y-auto">
              {!consultation.messages || consultation.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{t('no_messages_yet', 'No messages yet.')}</p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{t('send_msg_to_start', 'Send a follow-up message below to ask questions or give updates.')}</p>
                </div>
              ) : (
                consultation.messages.map((m) => {
                  const isMe = m.sender_role === 'FARMER';
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                          {isMe ? t('you', 'You') : `${m.sender_full_name} (${m.sender_role})`}
                        </span>
                        <span className="text-slate-300 dark:text-zinc-600">&bull;</span>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
                          {new Date(m.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[75%] text-sm shadow-sm ${
                        isMe 
                          ? 'bg-primary-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded-tl-none border border-slate-100 dark:border-zinc-700'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* MESSAGE INPUT */}
            <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
              {!isClosed ? (
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="relative">
                    <textarea
                      className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all outline-none resize-none"
                      rows={3}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t('type_message_placeholder', 'Type a follow-up message to the extension officer...')}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleClose} 
                      disabled={closing}
                      className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      {closing ? t('closing', 'Closing...') : t('close_consultation', 'Close Consultation')}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={sending || !newMessage.trim()} 
                      isLoading={sending} 
                      loadingText={t('sending', 'Sending...')} 
                      className="w-full sm:w-auto px-8 shadow-primary-500/30"
                    >
                      {t('send_message', 'Send Message')}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700">
                  <svg className="w-5 h-5 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">{t('consultation_closed', 'This consultation is marked as closed.')}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden shadow-md border-primary-100 dark:border-primary-500/20">
            <button
              onClick={() => setShowTimeline((v) => !v)}
              className="w-full p-4 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors border-b border-slate-100 dark:border-zinc-800"
            >
              <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('activity_timeline', 'Activity Timeline')}
              </span>
              <svg className={`w-5 h-5 text-slate-400 transition-transform ${showTimeline ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTimeline && (
              <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900">
                <TimelinePanel consultationId={id} />
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* FULLSCREEN IMAGE MODAL */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl">
            <img src={selectedImage} alt="Enlarged evidence" className="w-full h-full object-contain" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}