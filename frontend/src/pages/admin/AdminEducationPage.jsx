import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, Input, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../api/adminService';
import Card from '../../components/ui/Card';
import { 
  BookOpen, 
  Search, 
  RotateCw, 
  Eye, 
  Download, 
  Layers, 
  CheckCircle2, 
  FileText,
  Building2,
  Calendar
} from 'lucide-react';

export default function AdminEducationPage() {
  const { t } = useTranslation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 10,
    search: '',
    status: '',
  });

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await adminService.getEducationResources(filters);
      if (res.data.results) {
        setResources(res.data.results);
        setTotal(res.data.count);
      } else {
        setResources(Array.isArray(res.data) ? res.data : []);
        setTotal(Array.isArray(res.data) ? res.data.length : 0);
      }
    } catch (err) {
      console.error('Failed to fetch education resources oversight', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const published = resources.filter(r => r.status === 'PUBLISHED').length;
    const views = resources.reduce((acc, r) => acc + (r.view_count || 0), 0);
    return { total, published, views };
  }, [resources, total]);

  const getStatusTag = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t('published', 'Published')}
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {t('draft', 'Draft')}
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            {t('archived', 'Archived')}
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
      title: t('title', 'Article / Guide'),
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <div className="py-1">
          <p className="font-bold text-slate-800 dark:text-white text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            {title}
          </p>
          {record.short_summary && (
            <p className="text-xs text-slate-400 dark:text-zinc-500 line-clamp-1 mt-0.5">
              {record.short_summary}
            </p>
          )}
        </div>
      )
    },
    {
      title: t('category', 'Category'),
      dataIndex: 'category_name',
      key: 'category_name',
      render: (cat, record) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
          {cat || record.category?.name || 'General'}
        </span>
      )
    },
    {
      title: t('publisher', 'Publisher Scope'),
      dataIndex: 'publisher_name',
      key: 'publisher_name',
      render: (pub, record) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-[140px]">{pub || record.publisher?.name || 'Central'}</span>
        </div>
      )
    },
    {
      title: t('status', 'Status'),
      dataIndex: 'status',
      key: 'status',
      render: (st) => getStatusTag(st)
    },
    {
      title: t('engagement', 'Engagement'),
      key: 'engagement',
      render: (_, record) => (
        <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{record.view_count || 0}</span>
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>{record.download_count || 0}</span>
          </span>
        </div>
      )
    },
    {
      title: t('created_at', 'Created Date'),
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
          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200/60 dark:border-emerald-800/40">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {t('content_governance', 'Content Governance')}
          </div> */}
          <h1 className="text-2xl ml-4 sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {t('education_oversight', 'Education & Resource Management')}
          </h1>
          <p className="text-sm ml-4 text-slate-500 dark:text-zinc-400 mt-1">
            {t('education_oversight_desc', 'Monitor agricultural guides published across woredas and kebeles, review reader engagement, and maintain quality standards.')}
          </p>
        </div>

        <button
          onClick={fetchResources}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>{t('refresh', 'Refresh')}</span>
        </button>
      </div>

      {/* 2. Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {t('total_resources', 'Total Resources')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.total}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t('published_materials', 'Published Materials')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.published}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {t('total_reads', 'Total Reads / Views')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{stats.views}</p>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <Card className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder={t('search_education_ph', 'Search resources, topics, summaries...')}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              placeholder={t('filter_by_status', 'Filter by Status')}
              className="w-full"
              value={filters.status || undefined}
              onChange={(val) => setFilters(prev => ({ ...prev, status: val || '', page: 1 }))}
              allowClear
            >
              <Select.Option value="PUBLISHED">{t('published', 'Published')}</Select.Option>
              <Select.Option value="DRAFT">{t('draft', 'Draft')}</Select.Option>
              <Select.Option value="ARCHIVED">{t('archived', 'Archived')}</Select.Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* 4. Table Card */}
      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <Table
          columns={columns}
          dataSource={resources}
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
