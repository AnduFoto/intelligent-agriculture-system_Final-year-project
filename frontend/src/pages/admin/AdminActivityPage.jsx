import React, { useState, useEffect } from 'react';
import { Table, DatePicker, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  Search, 
  RotateCw, 
  FileDown, 
  Eye, 
  MapPin, 
  Calendar, 
  Filter, 
  User, 
  Layers,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../api/adminService';
import { locationAdminService } from '../../api/locationAdminService';
import AuditLogDetailModal from '../../components/admin/AuditLogDetailModal';
import Card from '../../components/ui/Card';

const { RangePicker } = DatePicker;

export default function AdminActivityPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // State for data
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 10,
    search: '',
    category: '',
    region: null,
    zone: null,
    woreda: null,
    special_woreda: null,
    kebele: null,
    start_date: null,
    end_date: null
  });

  // Kebeles dropdown list
  const [kebeles, setKebeles] = useState([]);

  useEffect(() => {
    initLocationContext();
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const initLocationContext = async () => {
    try {
      const userRegionId = typeof user?.region === 'object' ? user?.region?.id : user?.region;
      const userZoneId = typeof user?.zone === 'object' ? user?.zone?.id : user?.zone;
      const userSpecialWoredaId = typeof user?.special_woreda === 'object' ? user?.special_woreda?.id : user?.special_woreda;
      const userWoredaId = typeof user?.woreda === 'object' ? user?.woreda?.id : user?.woreda;
      const userKebeleId = typeof user?.kebele === 'object' ? user?.kebele?.id : user?.kebele;

      let loadedKebeles = [];

      if (userSpecialWoredaId) {
        const kebRes = await locationAdminService.listKebelesBySpecialWoreda(userSpecialWoredaId);
        loadedKebeles = kebRes.data || [];
      } else if (userWoredaId) {
        const kebRes = await locationAdminService.listKebelesByWoreda(userWoredaId);
        loadedKebeles = kebRes.data || [];
      } else if (userZoneId) {
        const woredasRes = await locationAdminService.listWoredas(userZoneId);
        const worList = woredasRes.data || [];
        const kebelePromises = worList.map(w => locationAdminService.listKebelesByWoreda(w.id));
        const kebeleResults = await Promise.all(kebelePromises);
        loadedKebeles = kebeleResults.flatMap(r => r.data || []);
      } else if (userRegionId) {
        const [zonesRes, specialRes] = await Promise.all([
          locationAdminService.listZones(userRegionId),
          locationAdminService.listSpecialWoredas(userRegionId)
        ]);
        const zonesList = zonesRes.data || [];
        const specialsList = specialRes.data || [];
        
        const specKebPromises = specialsList.map(sw => locationAdminService.listKebelesBySpecialWoreda(sw.id));
        const specKebResults = await Promise.all(specKebPromises);
        const kebelesFromSpecials = specKebResults.flatMap(r => r.data || []);

        let kebelesFromZones = [];
        if (zonesList.length > 0) {
          const worPromises = zonesList.map(z => locationAdminService.listWoredas(z.id));
          const worResults = await Promise.all(worPromises);
          const allWoredas = worResults.flatMap(r => r.data || []);
          const worKebPromises = allWoredas.map(w => locationAdminService.listKebelesByWoreda(w.id));
          const worKebResults = await Promise.all(worKebPromises);
          kebelesFromZones = worKebResults.flatMap(r => r.data || []);
        }

        loadedKebeles = [...kebelesFromSpecials, ...kebelesFromZones];
      }

      setKebeles(loadedKebeles);

      setFilters(prev => ({
        ...prev,
        region: userRegionId || null,
        zone: userZoneId || null,
        special_woreda: userSpecialWoredaId || null,
        woreda: userWoredaId || null,
        kebele: userKebeleId || null,
        page: 1
      }));
    } catch (err) {
      console.error('Failed to initialize internal location context', err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: filters.page,
        page_size: filters.page_size,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.region && { region: filters.region }),
        ...(filters.zone && { zone: filters.zone }),
        ...(filters.woreda && { woreda: filters.woreda }),
        ...(filters.special_woreda && { special_woreda: filters.special_woreda }),
        ...(filters.kebele && { kebele: filters.kebele }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date }),
      };

      const res = await adminService.getAuditLogs(queryParams);
      if (res.data.results) {
        setLogs(res.data.results);
        setTotal(res.data.count);
      } else {
        setLogs(Array.isArray(res.data) ? res.data : []);
        setTotal(Array.isArray(res.data) ? res.data.length : 0);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      const queryParams = {
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.region && { region: filters.region }),
        ...(filters.zone && { zone: filters.zone }),
        ...(filters.woreda && { woreda: filters.woreda }),
        ...(filters.special_woreda && { special_woreda: filters.special_woreda }),
        ...(filters.kebele && { kebele: filters.kebele }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date }),
      };

      const res = await adminService.exportAuditLogsPDF(queryParams);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.setAttribute('download', `audit_logs_report_${timestamp}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export PDF report', err);
    } finally {
      setExportingPDF(false);
    }
  };

  const handleResetFilters = () => {
    const userRegionId = typeof user?.region === 'object' ? user?.region?.id : user?.region;
    const userZoneId = typeof user?.zone === 'object' ? user?.zone?.id : user?.zone;
    const userSpecialWoredaId = typeof user?.special_woreda === 'object' ? user?.special_woreda?.id : user?.special_woreda;
    const userWoredaId = typeof user?.woreda === 'object' ? user?.woreda?.id : user?.woreda;

    setFilters({
      page: 1,
      page_size: 10,
      search: '',
      category: '',
      region: userRegionId || null,
      zone: userZoneId || null,
      special_woreda: userSpecialWoredaId || null,
      woreda: userWoredaId || null,
      kebele: null,
      start_date: null,
      end_date: null
    });
  };

  const getLocationScopeText = () => {
    const parts = [];
    const rName = user?.region_name || (typeof user?.region === 'object' ? user?.region?.name : null);
    const swName = user?.special_woreda_name || (typeof user?.special_woreda === 'object' ? user?.special_woreda?.name : null);
    const zName = user?.zone_name || (typeof user?.zone === 'object' ? user?.zone?.name : null);
    const wName = user?.woreda_name || (typeof user?.woreda === 'object' ? user?.woreda?.name : null);

    if (rName) parts.push(rName);
    if (swName) parts.push(`${swName} (Special)`);
    else if (zName) {
      parts.push(zName);
      if (wName) parts.push(wName);
    } else if (wName) {
      parts.push(wName);
    }
    return parts.length > 0 ? parts.join(' › ') : 'System Global';
  };

  const getCategoryBadge = (cat, label) => {
    switch (cat) {
      case 'USER':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">{label || cat}</span>;
      case 'LOCATION':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">{label || cat}</span>;
      case 'ASSIGNMENT':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">{label || cat}</span>;
      case 'EDUCATION':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">{label || cat}</span>;
      case 'CONSULTATION':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50">{label || cat}</span>;
      default:
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">{label || cat}</span>;
    }
  };

  const columns = [
    {
      title: t('timestamp', 'Timestamp'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (date) => (
        <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-slate-400" />
          {new Date(date).toLocaleString()}
        </span>
      ),
    },
    {
      title: t('actor', 'Actor / Administrator'),
      dataIndex: 'actor_name',
      key: 'actor_name',
      render: (text, record) => {
        const actorName = text || t('system', 'System');
        const initials = actorName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-200 dark:border-zinc-700">
              {initials}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-slate-800 dark:text-white truncate block">{actorName}</span>
              {record.actor_email && (
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 truncate block">{record.actor_email}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: t('category', 'Category'),
      dataIndex: 'category',
      key: 'category',
      width: 140,
      render: (cat, record) => getCategoryBadge(cat, record.category_display),
    },
    {
      title: t('action', 'Action'),
      dataIndex: 'action_display',
      key: 'action_display',
      render: (text, record) => (
        <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
          {text || record.action}
        </span>
      ),
    },
    {
      title: t('description', 'Description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <span className="text-slate-600 dark:text-zinc-400 text-xs line-clamp-1" title={text}>
          {text}
        </span>
      ),
    },
    {
      title: t('location', 'Location Scope'),
      key: 'location',
      render: (_, record) => {
        const parts = [];
        if (record.region_name) parts.push(record.region_name);
        if (record.special_woreda_name) parts.push(record.special_woreda_name);
        else if (record.woreda_name) parts.push(record.woreda_name);
        if (record.kebele_name) parts.push(record.kebele_name);

        return (
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
            {parts.length > 0 ? parts.join(' › ') : 'Global'}
          </span>
        );
      },
    },
    {
      title: t('actions', 'Action'),
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <button
          onClick={() => {
            setSelectedLog(record);
            setModalVisible(true);
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          title={t('view_detail', 'View Detail')}
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      
      {/* 1. Header (Seamless theme background, no black banner) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider mb-2 border border-slate-200 dark:border-zinc-700">
            <Activity className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
            {t('governance_audit', 'Governance & Audit Trail')}
          </div> */}
          <h1 className="text-2xl  ml-4 sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('system_activity_logs', 'System Audit & Activity Logs')}
          </h1>
          <p className="text-sm ml-4 text-slate-500 dark:text-zinc-400 mt-1">
            {t('activity_logs_desc', 'Track sensitive governance actions, user account changes, and system operations across the platform.')}
          </p>
        </div>

        <div className="flex items-center -ml-60 gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-red-600 hover:bg-red-500 active:scale-95 disabled:opacity-50 transition-all shadow-xs"
          >
            <FileDown className="w-4 h-4" />
            <span>{exportingPDF ? 'Exporting...' : t('export_pdf', 'Export PDF')}</span>
          </button>

          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-600' : ''}`} />
            <span>{t('refresh', 'Refresh')}</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Scope Toolbar */}
      <Card className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder={t('search_logs_ph', 'Search actor, action, or description...')}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-800 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <Select
              placeholder={t('filter_by_category', 'Filter Category')}
              className="w-full"
              value={filters.category || undefined}
              onChange={(val) => setFilters(prev => ({ ...prev, category: val || '', page: 1 }))}
              allowClear
            >
              <Select.Option value="USER">{t('user_management', 'User Management')}</Select.Option>
              <Select.Option value="LOCATION">{t('location_management', 'Location Management')}</Select.Option>
              <Select.Option value="ASSIGNMENT">{t('officer_assignments', 'Officer Assignments')}</Select.Option>
              <Select.Option value="EDUCATION">{t('education_management', 'Education Management')}</Select.Option>
              <Select.Option value="CONSULTATION">{t('consultation_management', 'Consultation Management')}</Select.Option>
              <Select.Option value="SYSTEM">{t('system_settings', 'System Administration')}</Select.Option>
            </Select>
          </div>

          {/* Kebele Select */}
          <div className="lg:col-span-3">
            <Select
              placeholder={t('select_kebele', 'All Kebeles')}
              className="w-full"
              value={filters.kebele || undefined}
              onChange={(val) => setFilters(prev => ({ ...prev, kebele: val || null, page: 1 }))}
              allowClear
            >
              {kebeles.map(k => (
                <Select.Option key={k.id} value={k.id}>{k.name}</Select.Option>
              ))}
            </Select>
          </div>

          {/* Clear Button */}
          <div className="lg:col-span-2 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('clear_filters', 'Reset')}</span>
            </button>
          </div>
        </div>

        {/* Admin Location Scope Banner */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-primary-500" />
            <span>{t('assigned_location_scope', 'Assigned Scope')}:</span>
            <span className="font-mono font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-md border border-primary-200 dark:border-primary-800/40">
              {getLocationScopeText()}
            </span>
          </div>

          {filters.kebele && (
            <button 
              type="button" 
              onClick={() => setFilters(prev => ({ ...prev, kebele: null, page: 1 }))}
              className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline"
            >
              {t('show_all_kebeles', 'Show All Kebeles in Scope')}
            </button>
          )}
        </div>
      </Card>

      {/* 3. Table Card */}
      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <Table
          columns={columns}
          dataSource={logs}
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

      {/* 4. Detail Modal */}
      <AuditLogDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        auditLog={selectedLog}
      />
    </div>
  );
}
