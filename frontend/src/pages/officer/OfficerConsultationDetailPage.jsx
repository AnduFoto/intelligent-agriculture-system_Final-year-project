import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';
import consultationService from '../../api/consultationService';
import { generateMarkdownFromResult, StreamingMarkdown } from '../farmer/DiseaseDetectionPage';
import TimelinePanel from '../../components/consultations/TimelinePanel';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';

export default function OfficerConsultationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [consultation, setConsultation] = useState(null);
  const [aiResults, setAIResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const [checkingImageId, setCheckingImageId] = useState(null);
  const [editedMessages, setEditedMessages] = useState({});
  const [sendingResultId, setSendingResultId] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [data, results] = await Promise.all([
        consultationService.getConsultationDetail(id),
        consultationService.listAIResults(id),
      ]);
      setConsultation(data);
      setAIResults(results);
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_load_consultation', 'Failed to load this consultation.'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    setError('');
    try {
      await consultationService.sendMessage(id, newMessage.trim());
      setNewMessage('');
      loadAll();
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_send_message', 'Failed to send message.'));
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!window.confirm(t('confirm_resolve', 'Mark this consultation as resolved?'))) return;
    setResolving(true);
    setError('');
    try {
      await axiosInstance.post(`/consultations/consultations/${id}/resolve/`);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_resolve_consultation', 'Failed to resolve consultation.'));
    } finally {
      setResolving(false);
    }
  };

  const handleAICheck = async (imageId) => {
    setCheckingImageId(imageId);
    setError('');
    setSuccess('');
    try {
      await consultationService.runAICheck(id, imageId);
      setSuccess(t('ai_check_complete', 'AI analysis complete — review the result below before sending.'));
      loadAll();
    } catch (err) {
      setError(err.response?.data?.detail || t('ai_check_failed', 'AI check failed.'));
    } finally {
      setCheckingImageId(null);
    }
  };

  const handleSendAIResult = async (resultId, originalMessage) => {
    const finalMessage = editedMessages[resultId] ?? originalMessage;
    if (!finalMessage.trim()) {
      setError(t('empty_message_error', 'Message cannot be empty.'));
      return;
    }
    setSendingResultId(resultId);
    setError('');
    setSuccess('');
    try {
      await consultationService.sendAIResult(id, resultId, finalMessage.trim());
      setSuccess(t('ai_result_sent', 'AI result sent to the farmer.'));
      loadAll();
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_send_ai_result', 'Failed to send AI result.'));
    } finally {
      setSendingResultId(null);
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
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <Alert variant="error">{error}</Alert>
        <button onClick={() => navigate('/officer/consultations')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors bg-slate-100 dark:bg-zinc-800 px-4 py-2 rounded-lg w-fit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t('back_to_assigned_consultations', 'Back to Assigned Consultations')}
        </button>
      </div>
    );
  }

  const isClosed = consultation.status === 'CLOSED';
  const isResolved = consultation.status === 'RESOLVED';
  const unsentResults = aiResults.filter((r) => !r.sent_to_farmer);
  const sentResults = aiResults.filter((r) => r.sent_to_farmer);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      
      {/* NAVIGATION */}
      <button onClick={() => navigate('/officer/consultations')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl w-fit">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        {t('back_to_assigned_consultations', 'Back to Assigned Consultations')}
      </button>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CONSULTATION DETAILS */}
          <Card className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight flex-1">
                {consultation.title}
              </h1>
              <Badge variant={getStatusVariant(consultation.status)} className="shrink-0 text-xs py-1.5 px-3">
                {t(consultation.status.toLowerCase(), consultation.status.replace(/_/g, ' '))}
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 flex flex-col gap-2 bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('farmer_details', 'Farmer Details')}</span>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                    {consultation.farmer_full_name?.charAt(0) || 'F'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">{consultation.farmer_full_name}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{consultation.farmer_email}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col gap-2 bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('location_crop', 'Location & Crop')}</span>
                 <div className="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                   <div className="flex items-center gap-2">
                     <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     {consultation.kebele_name}
                   </div>
                   <div className="flex items-center gap-2">
                     <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                     {consultation.crop_name}
                   </div>
                 </div>
              </div>
            </div>

            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {consultation.description}
            </div>

            {consultation.images.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-4">{t('uploaded_images_ai', 'Uploaded Images & AI Analysis')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {consultation.images.map((img) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm bg-slate-50 dark:bg-zinc-900/50 p-2">
                      <div className="aspect-square rounded-lg overflow-hidden relative mb-2">
                        <img
                          src={img.image}
                          alt="consultation"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {!isClosed && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full flex items-center justify-center gap-2 border-primary-200 dark:border-primary-900/30 text-primary-700 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                          onClick={() => handleAICheck(img.id)}
                          disabled={checkingImageId === img.id}
                          isLoading={checkingImageId === img.id}
                          loadingText={t('checking', 'Checking...')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                          {t('check_disease_ai', 'Check Disease by AI')}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* AI RESULTS SECTION */}
          {unsentResults.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-900/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500">
                  {t('ai_results_pending', 'AI Results (Not sent to farmer)')}
                </h2>
              </div>
              
              <div className="space-y-6">
                {unsentResults.map((r) => (
                  <div key={r.id} className="bg-white dark:bg-zinc-900 border border-amber-100 dark:border-amber-900/30 rounded-xl p-5 shadow-sm">
                    {r.is_valid_crop_image ? (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={r.confidence > 80 ? 'success' : r.confidence > 50 ? 'warning' : 'danger'}>
                            {r.confidence?.toFixed(1)}% {t('confidence', 'Confidence')}
                          </Badge>
                          <span className="text-sm font-black text-slate-800 dark:text-white">{r.display_name}</span>
                          <span className="text-xs text-slate-400 dark:text-zinc-500">({r.crop})</span>
                        </div>
                        {r.solution_detail && (
                          <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-lg p-4 text-sm mt-3 border border-slate-100 dark:border-zinc-700/50">
                            {r.solution_detail.severity && (
                                <p className="mb-3"><strong className="text-slate-800 dark:text-zinc-200">{t('severity', 'Severity')}:</strong> <span className="text-amber-600 dark:text-amber-400 font-medium">{r.solution_detail.severity}</span></p>
                            )}
                            <StreamingMarkdown content={generateMarkdownFromResult(r.solution_detail, t)} speed={15} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-4 text-sm font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        {t('not_valid_crop_image', 'Not recognized as a valid crop image.')}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                        {t('message_to_send', 'Message to send:')}
                      </label>
                      <textarea
                        className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all outline-none resize-none"
                        rows={5}
                        value={editedMessages[r.id] ?? r.agent_message}
                        onChange={(e) => setEditedMessages((prev) => ({ ...prev, [r.id]: e.target.value }))}
                      />
                      <div className="flex justify-end pt-2">
                        <Button
                          onClick={() => handleSendAIResult(r.id, r.agent_message)}
                          disabled={sendingResultId === r.id}
                          isLoading={sendingResultId === r.id}
                          className="bg-amber-600 hover:bg-amber-700 text-white border-none shadow-amber-500/30"
                        >
                          {t('send_to_farmer', 'Send to Farmer')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {sentResults.length > 0 && (
            <Card className="border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t('previous_ai_checks_sent', 'Previous AI Checks (Sent)')}
              </h2>
              <div className="space-y-4">
                {sentResults.map((r, i) => (
                  <div key={r.id} className={`text-sm text-slate-700 dark:text-zinc-300 ${i !== 0 ? 'border-t border-slate-200 dark:border-zinc-800 pt-4' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded">
                        {new Date(r.sent_at).toLocaleString()}
                      </span>
                      {r.was_edited && <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">{t('edited', 'Edited')}</span>}
                    </div>
                    <p className="whitespace-pre-wrap pl-2 border-l-2 border-slate-200 dark:border-zinc-700 italic">{r.sent_message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* CHAT/CONVERSATION */}
          <Card className="p-0 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-zinc-900/30">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                {t('conversation', 'Conversation')}
              </h2>
            </div>
            
            <div className="p-6 space-y-6 flex-1 max-h-[600px] overflow-y-auto">
              {consultation.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">{t('no_messages_yet', 'No messages yet.')}</p>
                </div>
              ) : (
                consultation.messages.map((m) => {
                  const isMe = m.sender_role !== 'FARMER';
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
            <div className="p-6 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
              {!isClosed ? (
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="relative">
                    <textarea
                      className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all outline-none resize-none"
                      rows={3}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t('type_message_placeholder', 'Type a follow-up message...')}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    {!isResolved && (
                       <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleResolve} 
                        disabled={resolving}
                        className="w-full sm:w-auto border-primary-200 dark:border-primary-900/50 text-primary-600 dark:text-primary-400"
                      >
                        {resolving ? t('resolving', 'Resolving...') : t('mark_resolved', 'Mark as Resolved')}
                      </Button>
                    )}
                    
                    <Button type="submit" disabled={sending || !newMessage.trim()} isLoading={sending} loadingText={t('sending', 'Sending...')} className="w-full sm:w-auto px-8 shadow-primary-500/30 sm:ml-auto">
                      {t('send_message', 'Send Message')}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700">
                  <svg className="w-5 h-5 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">{t('consultation_closed', 'This consultation is closed and cannot receive new messages.')}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden">
            <button
              onClick={() => setShowTimeline((v) => !v)}
              className="w-full p-4 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors border-b border-slate-100 dark:border-zinc-800"
            >
              <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t('activity_timeline', 'Activity Timeline')}
              </span>
              <svg className={`w-5 h-5 text-slate-400 transition-transform ${showTimeline ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showTimeline && (
              <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900">
                <TimelinePanel consultationId={id} />
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}