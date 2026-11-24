import React, { useState, useEffect } from 'react';
import { Table, Modal, Select, message } from 'antd';
import { 
  ShieldAlert, 
  Flag, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  User, 
  FileText, 
  MessageSquare,
  Trash2,
  AlertOctagon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import communityService from '../../api/communityService';
import Card from '../../components/ui/Card';

export const AdminCommunityReportsPage = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [actionStatus, setActionStatus] = useState('RESOLVED_REMOVED');
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await communityService.getCommunityReports({ status: statusFilter });
      setReports(data.results || data || []);
    } catch (err) {
      message.error(t('community.reportsLoadError', 'Failed to load community reports.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleOpenActionModal = (report) => {
    setSelectedReport(report);
    setActionStatus('RESOLVED_REMOVED');
    setAdminNote('');
    setIsModalOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedReport) return;
    setSubmitting(true);
    try {
      await communityService.resolveCommunityReport(selectedReport.id, {
        status: actionStatus,
        admin_note: adminNote,
      });
      message.success(t('community.reportResolved', 'Report resolved successfully.'));
      setIsModalOpen(false);
      fetchReports();
    } catch (err) {
      message.error(err.response?.data?.detail || t('community.resolveError', 'Failed to resolve report.'));
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Review
          </span>
        );
      case 'RESOLVED_REMOVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60">
            Removed
          </span>
        );
      case 'RESOLVED_WARNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
            Warned
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
            Dismissed
          </span>
        );
      default:
        return <span className="text-xs px-2 py-0.5 rounded bg-slate-100">{status}</span>;
    }
  };

  const columns = [
    {
      title: 'Reported Content',
      key: 'content',
      render: (_, record) => {
        const item = record.post_details || record.comment_details;
        const type = record.post ? 'POST' : 'COMMENT';
        return (
          <div className="space-y-1.5 max-w-md py-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                type === 'POST' 
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50' 
                  : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50'
              }`}>
                {type}
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">
                Author: <strong className="text-slate-700 dark:text-zinc-300">{item?.author?.full_name || 'Unknown'}</strong> ({item?.author?.role || 'User'})
              </span>
            </div>
            <p className="text-xs text-slate-800 dark:text-zinc-200 line-clamp-2 font-medium bg-slate-50 dark:bg-zinc-800/40 p-2 rounded-lg border border-slate-100 dark:border-zinc-800">
              "{item?.content || 'Content unavailable'}"
            </p>
          </div>
        );
      },
    },
    {
      title: 'Reporter',
      key: 'reporter',
      render: (_, record) => {
        const reporterName = record.reporter?.full_name || record.reporter?.email || 'User';
        const initials = reporterName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200 dark:border-zinc-700">
              {initials}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-slate-800 dark:text-white truncate block">{reporterName}</span>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">{record.reporter?.role}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Flagged Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) => (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
          {reason}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => statusBadge(status),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <button
          onClick={() => handleOpenActionModal(record)}
          disabled={record.status !== 'PENDING'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            record.status === 'PENDING'
              ? 'text-white bg-red-600 hover:bg-red-500 shadow-xs'
              : 'text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 cursor-not-allowed'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>{record.status === 'PENDING' ? 'Moderate' : 'Resolved'}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      
      {/* 1. Header (Seamless theme background, no black banner) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider mb-2 border border-red-200/60 dark:border-red-800/40">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            {t('community.adminModerationBadge', 'Community Moderation')}
          </div> */}
          <h1 className="text-2xl ml-4 sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('community.adminModerationTitle', 'Community Content Moderation')}
          </h1>
          <p className="text-sm ml-4 text-slate-500 dark:text-zinc-400 mt-1">
            {t('community.adminModerationSub', 'Review flagged posts and comments reported by community members across the agricultural forum.')}
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : ''}`} />
          <span>{t('refresh', 'Refresh')}</span>
        </button>
      </div>

      {/* 2. Filter Toolbar */}
      <Card className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Filter Status:
            </span>
          </div>

          <div className="w-full sm:w-64">
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              className="w-full"
              options={[
                { value: 'PENDING', label: 'Pending Review' },
                { value: 'RESOLVED_REMOVED', label: 'Removed Content' },
                { value: 'RESOLVED_WARNED', label: 'Issued Policy Warning' },
                { value: 'DISMISSED', label: 'Dismissed Reports' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* 3. Reports Table */}
      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <Table
          dataSource={reports}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="custom-admin-table"
        />
      </Card>

      {/* 4. Moderation Resolution Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        title={
          <div className="flex items-center gap-2 font-black text-slate-800 dark:text-white">
            <Flag className="w-5 h-5 text-red-500" />
            <span>Moderate Flagged Content</span>
          </div>
        }
        className="rounded-2xl"
      >
        {selectedReport && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl text-xs space-y-1 border border-slate-200/60 dark:border-zinc-700/60">
              <div className="font-bold text-slate-700 dark:text-zinc-300">
                Reason: <span className="text-red-600 dark:text-red-400">{selectedReport.reason}</span>
              </div>
              <p className="text-slate-600 dark:text-zinc-400 italic">
                "{selectedReport.description || 'No additional explanation provided by reporter.'}"
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Resolution Action
              </label>
              <Select
                value={actionStatus}
                onChange={(val) => setActionStatus(val)}
                className="w-full"
                options={[
                  { value: 'RESOLVED_REMOVED', label: 'Remove Content (Delete)' },
                  { value: 'RESOLVED_WARNED', label: 'Remove Content & Issue Policy Warning to Author' },
                  { value: 'DISMISSED', label: 'Dismiss Report (Keep Content)' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Administrative Note / Warning Message
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Explain the moderation decision or details of the policy warning..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleResolve}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
              >
                {submitting ? 'Applying...' : 'Apply Moderation'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCommunityReportsPage;
