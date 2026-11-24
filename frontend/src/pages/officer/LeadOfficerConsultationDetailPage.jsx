import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';
import consultationService from '../../api/consultationService';
import specializationService from '../../api/specializationService';
import TimelinePanel from '../../components/consultations/TimelinePanel';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import SelectField from '../../components/ui/SelectField';
import TextField from '../../components/ui/TextField';

export default function LeadOfficerConsultationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [consultation, setConsultation] = useState(null);
  const [kebeleId, setKebeleId] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [reassignOfficerId, setReassignOfficerId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassigning, setReassigning] = useState(false);

  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [data, notesData] = await Promise.all([
        consultationService.getConsultationDetail(id),
        consultationService.listNotes(id),
      ]);
      setConsultation(data);
      setNotes(notesData);

      const leadData = await specializationService.getMyLeadKebele();
      if (leadData.lead_officer) {
        const kId = leadData.lead_officer.kebele_id;
        setKebeleId(kId);
        const load = await consultationService.getKebeleOfficerWorkload(kId);
        setWorkload(load);
      }
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_load_consultation', 'Failed to load this consultation.'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!reassignOfficerId) {
      setError(t('select_officer_reassign', 'Select an officer to reassign to.'));
      return;
    }
    setReassigning(true);
    setError('');
    setSuccess('');
    try {
      await consultationService.reassignConsultation(id, Number(reassignOfficerId), reassignReason);
      setSuccess(t('consultation_reassigned', 'Consultation reassigned.'));
      setReassignOfficerId('');
      setReassignReason('');
      loadAll();
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_reassign', 'Failed to reassign.'));
    } finally {
      setReassigning(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    setError('');
    try {
      await consultationService.createNote(id, newNote.trim());
      setNewNote('');
      loadAll();
    } catch (err) {
      setError(err.response?.data?.detail || t('failed_add_note', 'Failed to add note.'));
    } finally {
      setAddingNote(false);
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
        <button onClick={() => navigate('/officer/kebele-consultations')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors bg-slate-100 dark:bg-zinc-800 px-4 py-2 rounded-lg w-fit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t('back_to_kebele_consultations', 'Back to Kebele Consultations')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      
      {/* NAVIGATION */}
      <button onClick={() => navigate('/officer/kebele-consultations')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 transition-colors bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl w-fit">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        {t('back_to_kebele_consultations', 'Back to Kebele Consultations')}
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

            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap mb-6">
              {consultation.description}
            </div>

            {consultation.images.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-4">{t('attached_images', 'Attached Images')}</h4>
                <div className="flex gap-4 flex-wrap">
                  {consultation.images.map((img) => (
                    <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm w-32 h-32">
                      <img
                        src={img.image}
                        alt="consultation"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {consultation.assigned_officer_email && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2 text-sm">
                <span className="font-semibold text-slate-500 dark:text-zinc-400">{t('currently_assigned_to', 'Currently assigned to')}:</span>
                <span className="font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                  {consultation.assigned_officer_email}
                </span>
              </div>
            )}
          </Card>

          {/* CHAT/CONVERSATION */}
          <Card className="p-0 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-zinc-900/30">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                {t('conversation', 'Conversation')}
              </h2>
            </div>
            
            <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
              {consultation.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">{t('no_messages_yet', 'No messages yet.')}</p>
                </div>
              ) : (
                consultation.messages.map((m) => {
                  const isMe = m.sender_role !== 'FARMER';
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                          {isMe ? t('officer', 'Officer') : `${m.sender_full_name} (${m.sender_role})`}
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
          </Card>
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="space-y-6">

          {/* REASSIGNMENT */}
          {consultation.status !== 'CLOSED' && (
            <Card className="border-primary-200 dark:border-primary-900/50 bg-primary-50/30 dark:bg-primary-900/10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                {t('reassign_consultation', 'Reassign Consultation')}
              </h2>
              <form onSubmit={handleReassign} className="space-y-4">
                <SelectField
                  value={reassignOfficerId}
                  onChange={setReassignOfficerId}
                >
                  <option value="">-- {t('select_an_officer', 'Select an officer')} --</option>
                  {workload.map((w) => (
                    <option key={w.officer_id} value={w.officer_id}>
                      {w.officer_full_name} ({w.active_consultations} {t('active', 'active')})
                    </option>
                  ))}
                </SelectField>
                <TextField
                  value={reassignReason}
                  onChange={setReassignReason}
                  placeholder={t('reason_optional', 'Reason (optional, e.g. "Officer A on leave")')}
                />
                <Button type="submit" disabled={reassigning || !reassignOfficerId} isLoading={reassigning} className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/30">
                  {t('reassign', 'Reassign')}
                </Button>
              </form>
            </Card>
          )}

          {/* INTERNAL NOTES */}
          <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              {t('internal_notes', 'Internal Notes')}
            </h2>
            <p className="text-[11px] font-semibold text-amber-600/70 dark:text-amber-500/70 mb-4">{t('staff_only', '(Staff only, never visible to farmer)')}</p>
            
            <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
              {notes.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-zinc-400 italic text-center py-4">{t('no_internal_notes', 'No internal notes yet.')}</p>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="bg-white dark:bg-zinc-900 border border-amber-100 dark:border-amber-900/50 rounded-lg p-3 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-1">
                      {n.author_email} <span className="text-slate-300 dark:text-zinc-600 px-1">&bull;</span> {new Date(n.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-wrap">{n.note}</p>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                className="w-full bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 transition-all outline-none resize-none"
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={t('add_internal_note', 'Add an internal note...')}
              />
              <Button type="submit" disabled={addingNote || !newNote.trim()} isLoading={addingNote} size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white border-none shadow-sm shadow-amber-500/30">
                {t('add_note', 'Add Note')}
              </Button>
            </form>
          </Card>

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