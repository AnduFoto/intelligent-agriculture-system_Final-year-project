import React, { useState, useEffect } from 'react';
import { Table, Tag, Input, Select, Drawer, message as antMessage } from 'antd';
import { useTranslation } from 'react-i18next';
import chatService from '../../api/chatService';
import Card from '../../components/ui/Card';
import { 
  ShieldAlert, 
  Search, 
  RotateCw, 
  AlertTriangle, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  MessageSquare, 
  Users, 
  UserX,
  Mail,
  Calendar,
  AlertOctagon
} from 'lucide-react';

export default function AdminChatReportsPage() {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [search, setSearch] = useState('');

  // Selected Report for Moderation Drawer
  const [selectedReport, setSelectedReport] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter, reasonFilter, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsData, statsData] = await Promise.all([
        chatService.getChatReports({
          status: statusFilter,
          reason: reasonFilter,
          search
        }),
        chatService.getAdminStats()
      ]);
      setReports(reportsData.results || reportsData || []);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load admin chat reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (report) => {
    setSelectedReport(report);
    setAdminNote(report.admin_note || '');
    setDrawerOpen(true);
  };

  const handleResolveReport = async (actionTaken) => {
    if (!selectedReport) return;
    setSubmittingAction(true);

    try {
      const reportStatus = actionTaken === 'DISMISS' ? 'DISMISSED' : 'RESOLVED';
      await chatService.updateChatReport(selectedReport.id, {
        status: reportStatus,
        admin_note: adminNote,
        action_taken: actionTaken
      });

      antMessage.success(t('moderation_action_success', 'Report processed successfully.'));
      setDrawerOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to process moderation action', err);
      antMessage.error(t('moderation_action_failed', 'Failed to process moderation action.'));
    } finally {
      setSubmittingAction(false);
    }
  };

  const getReasonTag = (reason) => {
    switch (reason) {
      case 'HARASSMENT':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">{t('harassment', 'Harassment')}</span>;
      case 'THREAT':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800/50">{t('threat', 'Threat')}</span>;
      case 'SPAM':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">{t('spam', 'Spam')}</span>;
      case 'INAPPROPRIATE':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">{t('inappropriate', 'Inappropriate')}</span>;
      default:
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">{reason}</span>;
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {t('pending', 'Pending')}
          </span>
        );
      case 'REVIEWING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {t('reviewing', 'Reviewing')}
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t('resolved', 'Resolved')}
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            {t('dismissed', 'Dismissed')}
          </span>
        );
      default:
        return <span className="text-xs px-2 py-0.5 rounded bg-slate-100">{status}</span>;
    }
  };

  const columns = [
    {
      title: 'Report ID',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id) => <span className="font-mono font-bold text-xs text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">#{id}</span>
    },
    {
      title: t('reporter', 'Reporter'),
      dataIndex: 'reporter',
      key: 'reporter',
      render: (reporter) => {
        const name = reporter?.full_name || reporter?.email || 'User';
        const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200 dark:border-zinc-700">
              {initials}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-slate-800 dark:text-white truncate block">{name}</span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">{reporter?.role}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: t('reported_user', 'Reported Account'),
      dataIndex: 'reported_user',
      key: 'reported_user',
      render: (user) => {
        const name = user?.full_name || user?.email || 'User';
        const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 flex items-center justify-center font-bold text-xs shrink-0 border border-red-200 dark:border-red-800/50">
              {initials}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-red-600 dark:text-red-400 truncate block">{name}</span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">{user?.role} • {user?.status}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: t('reason', 'Reason'),
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) => getReasonTag(reason)
    },
    {
      title: t('status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: t('submitted_at', 'Reported At'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <span className="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(date).toLocaleString()}
        </span>
      )
    },
    {
      title: t('actions', 'Action'),
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <button
          onClick={() => handleOpenDrawer(record)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 dark:hover:bg-primary-900/50 border border-primary-200/80 dark:border-primary-800/50 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t('review', 'Review')}</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      
      {/* 1. Header (Seamless theme background, no black banner) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200/60 dark:border-amber-800/40">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            {t('chat_safety_oversight', 'Direct Message & Chat Safety')}
          </div> */}
          <h1 className="text-2xl ml-4 sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('chat_reports_moderation', 'Chat Moderation & Reports')}
          </h1>
          <p className="text-sm ml-4 text-slate-500 dark:text-zinc-400 mt-1">
            {t('chat_reports_sub', 'Review reported conversations, investigate harassment or spam, and apply disciplinary measures.')}
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          <span>{t('refresh', 'Refresh')}</span>
        </button>
      </div>

      {/* 2. Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {t('pending_reports', 'Pending Reports')}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.pending_reports}</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t('total_conversations', 'Total Conversations')}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.total_conversations}</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t('messages_today', 'Messages Today')}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.messages_today}</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              {t('suspended_users', 'Suspended Users')}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.suspended_users}</p>
          </div>
        </div>
      )}

      {/* 3. Filter Toolbar */}
      <Card className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder={t('search_users_placeholder', 'Search user by name or email...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              className="w-full sm:w-36"
              options={[
                { value: '', label: t('all_status', 'All Status') },
                { value: 'PENDING', label: t('pending', 'Pending') },
                { value: 'REVIEWING', label: t('reviewing', 'Reviewing') },
                { value: 'RESOLVED', label: t('resolved', 'Resolved') },
                { value: 'DISMISSED', label: t('dismissed', 'Dismissed') }
              ]}
            />

            <Select
              value={reasonFilter}
              onChange={(val) => setReasonFilter(val)}
              className="w-full sm:w-40"
              options={[
                { value: '', label: t('all_reasons', 'All Reasons') },
                { value: 'SPAM', label: t('reason_spam', 'Spam') },
                { value: 'HARASSMENT', label: t('reason_harassment', 'Harassment') },
                { value: 'INAPPROPRIATE', label: t('reason_inappropriate', 'Inappropriate') },
                { value: 'THREAT', label: t('reason_threat', 'Threat') }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* 4. Table Card */}
      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 12 }}
          className="custom-admin-table"
        />
      </Card>

      {/* 5. Moderation Review Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          <div className="flex items-center gap-2 font-black text-slate-800 dark:text-white">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <span>{t('report_review', 'Moderation Report Review')} #{selectedReport?.id}</span>
          </div>
        }
        width={480}
      >
        {selectedReport && (
          <div className="space-y-5">
            {/* Involved Accounts Summary */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">{t('reporter', 'Reporter')}</span>
                <p className="font-bold text-slate-800 dark:text-white text-xs mt-1">{selectedReport.reporter?.full_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{selectedReport.reporter?.email}</p>
              </div>
              <div>
                <span className="text-[11px] text-red-500 font-bold uppercase block">{t('reported_user', 'Reported User')}</span>
                <p className="font-bold text-red-600 dark:text-red-400 text-xs mt-1">{selectedReport.reported_user?.full_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{selectedReport.reported_user?.email}</p>
              </div>
            </div>

            {/* Violation Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">{t('reason', 'Reason')}:</span>
                {getReasonTag(selectedReport.reason)}
              </div>

              {selectedReport.description && (
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold block mb-1">{t('reporter_description', 'Reporter Description')}:</span>
                  "{selectedReport.description}"
                </div>
              )}

              {/* Reported Message Content */}
              {selectedReport.message && (
                <div className="p-3 bg-slate-100 dark:bg-zinc-800 rounded-xl text-xs border-l-4 border-red-500">
                  <span className="font-bold block text-red-600 dark:text-red-400 mb-1">{t('flagged_message_content', 'Flagged Message Content')}:</span>
                  <p className="whitespace-pre-wrap">{selectedReport.message.text || `[${selectedReport.message.message_type}]`}</p>
                </div>
              )}
            </div>

            {/* Admin Notes Form */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                {t('admin_notes', 'Administrator Notes & Rationale')}
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={t('admin_notes_placeholder', 'Enter moderation rationale or reason text...')}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => handleResolveReport('SUSPEND')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-500 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t('suspend_user_account', 'Suspend Reported User Account')}</span>
                </button>

                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => handleResolveReport('WARN')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-500 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{t('issue_user_warning', 'Issue Official Warning')}</span>
                </button>

                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => handleResolveReport('DISMISS')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-slate-700 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{t('dismiss_report', 'Dismiss Report')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
