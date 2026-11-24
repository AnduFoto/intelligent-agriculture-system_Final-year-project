import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import { Flame, Clock, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import cropTypeService from '../../api/cropTypeService';

export const FeedFilters = ({ filters, onFilterChange, onResetFilters }) => {
  const { t } = useTranslation();
  const [crops, setCrops] = useState([]);

  useEffect(() => {
    cropTypeService.listCropTypes().then(res => setCrops(res.results || res || [])).catch(() => {});
  }, []);

  const roles = [
    { value: '', label: t('community.allRoles', 'All Roles') },
    { value: 'FARMER', label: t('community.farmerRole', 'Farmers') },
    { value: 'OFFICER', label: t('community.officerRole', 'Officers') },
    { value: 'ADMINISTRATOR', label: t('community.adminRole', 'Administrators') },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-700/80 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Sorting Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl">
          <button
            onClick={() => onFilterChange('sort', 'latest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filters.sort !== 'popular'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('community.latest', 'Latest')}</span>
          </button>

          <button
            onClick={() => onFilterChange('sort', 'popular')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filters.sort === 'popular'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{t('community.popular', 'Popular')}</span>
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap flex-1 justify-end">
          {/* Role Filter */}
          <Select
            value={filters.role || ''}
            onChange={(val) => onFilterChange('role', val)}
            options={roles}
            className="w-36 text-xs"
            placeholder="Role"
          />

          {/* Crop Filter */}
          <Select
            allowClear
            value={filters.crop || undefined}
            onChange={(val) => onFilterChange('crop', val)}
            options={crops.map(c => ({ value: c.id, label: c.name }))}
            className="w-40 text-xs"
            placeholder={t('community.filterCrop', 'Filter Crop')}
          />

          {(filters.role || filters.crop) && (
            <button
              onClick={onResetFilters}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              title="Reset Filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedFilters;
