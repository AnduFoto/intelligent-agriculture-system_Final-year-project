import React, { useState, useEffect, useMemo } from 'react';
import { Table, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../api/adminService';
import Card from '../../components/ui/Card';
import { 
  MessageSquare, 
  Search, 
  RotateCw, 
  MapPin, 
  Calendar, 
  User, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Sprout
} from 'lucide-react';

export default function AdminConsultationsPage() {
  const { t } = useTranslation();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 10,
    search: '',
    status: '',
  });

  useEffect(() => {
    fetchConsultations();
  }, [filters]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const res = await adminService.getConsultations(filters);
      if (res.data.results) {
        setConsultations(res.data.results);
        setTotal(res.data.count);
      } else {
        setConsultations(Array.isArray(res.data) ? res.data : []);
        setTotal(Array.isArray(res.data) ? res.data.length : 0);
      }
    } catch (err) {
      console.error('Failed to load consultations overview', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const resolved = consultations.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const pending = consultations.filter(c => c.status === 'NEW' || c.status === 'WAITING_FOR_OFFICER').length;
    return { total, resolved, pending };
  }, [consultations, total]);

  const getStatusTag = (status) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            {t('status_new', 'New')}
          </span>
        );
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {t('status_assigned', 'Assigned')}
          </span>
        );
      case 'WAITING_FOR_FARMER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {t('status_waiting_farmer', 'Waiting for Farmer')}
          </span>
        );
      case 'WAITING_FOR_OFFICER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            {t('status_waiting_officer', 'Waiting for Officer')}
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t('status_resolved', 'Resolved')}
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            {t('status_closed', 'Closed')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const columns = [
    {
      title: 'Case ID',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id) => (
        <span className="font-mono text-xs font-bold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
          #{id}
        </span>
      )
    },
    {
      title: t('title_crop', 'Inquiry & Crop'),
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => {
        const cropName = record.crop_type_name || record.crop_type?.name;
        return (
          <div className="py-1">
            <p className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">
              {title}
            </p>
            {cropName && (
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                <Sprout className="w-3 h-3" />
                <span>{cropName}</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: t('farmer', 'Farmer'),
      dataIndex: 'farmer_name',
      key: 'farmer_name',
      render: (name, record) => {
        const farmerName = name || record.farmer?.get_full_name || record.farmer_email || 'Farmer';
        const initials = farmerName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200 dark:border-emerald-800/50">
              {initials}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-slate-800 dark:text-white truncate block">
                {farmerName}
              </span>
              {(record.kebele_name || record.kebele?.name) && (
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {record.kebele_name || record.kebele?.name}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      title: t('assigned_officer', 'Assigned Officer'),
      dataIndex: 'assigned_officer_name',
      key: 'assigned_officer_name',
      render: (name, record) => {
        const officerName = name || record.assigned_officer?.email;
        if (!officerName) {
          return (
            <span className="text-xs text-slate-400 dark:text-zinc-500 italic">
              {t('unassigned', 'Unassigned')}
            </span>
          );
        }
        const initials = officerName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[11px] shrink-0 border border-blue-200 dark:border-blue-800/50">
              {initials}
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 truncate max-w-[140px]">
              {officerName}
            </span>
          </div>
        );
      }
    },
    {
      title: t('status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      render: (st) => getStatusTag(st)
    },
    {
      title: t('submitted_at', 'Submitted'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-zinc-500">
          <Calendar className="w-3 h-3" />
          <span>{date ? new Date(date).toLocaleDateString() : '—'}</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      
      {/* 1. Header (Seamless theme background, no black banner) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200/60 dark:border-blue-800/40">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            {t('farmer_advisory_oversight', 'Farmer Advisory Oversight')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('consultation_oversight', 'Consultation Case Oversight')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {t('consultation_oversight_desc', 'Operational monitoring of farmer consultations across all regions, woredas, and kebeles.')}
          </p>
        </div>

        <button
          onClick={fetchConsultations}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>{t('refresh', 'Refresh')}</span>
        </button>
      </div>

      {/* 2. Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t('total_cases', 'Total Consultations')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {t('awaiting_action', 'Awaiting Action')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.pending}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t('resolved_cases', 'Resolved / Closed')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.resolved}</p>
        </div>
      </div>

      {/* 3. Search and Status Filter */}
      <Card className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder={t('search_consultations_ph', 'Search case title, farmer, or officer...')}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="w-full sm:w-60">
            <Select
              placeholder={t('filter_by_status', 'Filter by Status')}
              className="w-full"
              value={filters.status || undefined}
              onChange={(val) => setFilters(prev => ({ ...prev, status: val || '', page: 1 }))}
              allowClear
            >
              <Select.Option value="NEW">{t('status_new', 'New')}</Select.Option>
              <Select.Option value="ASSIGNED">{t('status_assigned', 'Assigned')}</Select.Option>
              <Select.Option value="WAITING_FOR_OFFICER">{t('status_waiting_officer', 'Waiting for Officer')}</Select.Option>
              <Select.Option value="WAITING_FOR_FARMER">{t('status_waiting_farmer', 'Waiting for Farmer')}</Select.Option>
              <Select.Option value="RESOLVED">{t('status_resolved', 'Resolved')}</Select.Option>
              <Select.Option value="CLOSED">{t('status_closed', 'Closed')}</Select.Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* 4. Table Card */}
      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <Table
          columns={columns}
          dataSource={consultations}
          rowKey="id"
          loading={loading}
          pagination={{
            current: filters.page,
            pageSize: filters.page_size,
            total: total,
            showSizeChanger: true,
            onChange: (page, pageSize) => setFilters(prev => ({ ...prev, page, page_size: pageSize }))
          }}
          className="custom-admin-table"
        />
      </Card>
    </div>
  );
}
