import React, { useState, useEffect } from 'react';
import { Select, DatePicker, Row, Col, Space, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { locationAdminService } from '../../api/locationAdminService';
import PropTypes from 'prop-types';

const { Option } = Select;
const { RangePicker } = DatePicker;

const LocationDateFilter = ({ onFilterChange, loading, initialFilters = {}, role }) => {
  const { t } = useTranslation();
  
  const [regions, setRegions] = useState([]);
  const [zones, setZones] = useState([]);
  const [specialWoredas, setSpecialWoredas] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);
  
  const [filters, setFilters] = useState(initialFilters);

  // Load Regions initially
  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await locationAdminService.listRegions();
      setRegions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchZonesAndSpecialWoredas = async (regionId) => {
    try {
      const [zonesRes, spWoredasRes] = await Promise.all([
        locationAdminService.listZones(regionId),
        locationAdminService.listSpecialWoredas(regionId)
      ]);
      setZones(zonesRes.data);
      setSpecialWoredas(spWoredasRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWoredas = async (zoneId) => {
    try {
      const res = await locationAdminService.listWoredas(zoneId);
      setWoredas(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKebelesByWoreda = async (woredaId) => {
    try {
      const res = await locationAdminService.listKebelesByWoreda(woredaId);
      setKebeles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKebelesBySpecialWoreda = async (spWoredaId) => {
    try {
      const res = await locationAdminService.listKebelesBySpecialWoreda(spWoredaId);
      setKebeles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    // Cascading resets
    if (key === 'region') {
      newFilters.zone = null;
      newFilters.special_woreda = null;
      newFilters.woreda = null;
      newFilters.kebele = null;
      setZones([]);
      setSpecialWoredas([]);
      setWoredas([]);
      setKebeles([]);
      if (value) fetchZonesAndSpecialWoredas(value);
    } else if (key === 'zone') {
      newFilters.special_woreda = null; // Enforce XOR
      newFilters.woreda = null;
      newFilters.kebele = null;
      setWoredas([]);
      setKebeles([]);
      if (value) fetchWoredas(value);
    } else if (key === 'special_woreda') {
      newFilters.zone = null; // Enforce XOR
      newFilters.woreda = null;
      newFilters.kebele = null;
      setZones([]); // We keep them in state but they are effectively ignored
      setWoredas([]);
      setKebeles([]);
      if (value) fetchKebelesBySpecialWoreda(value);
    } else if (key === 'woreda') {
      newFilters.kebele = null;
      setKebeles([]);
      if (value) fetchKebelesByWoreda(value);
    }

    setFilters(newFilters);
  };

  const handleDatePresetChange = (value) => {
    handleFilterChange('date_preset', value);
    // If preset is selected, clear custom date range
    if (value) {
      handleFilterChange('start_date', null);
      handleFilterChange('end_date', null);
    }
  };

  const handleCustomDateChange = (dates, dateStrings) => {
    const newFilters = { ...filters };
    newFilters.date_preset = null;
    if (dates && dates.length === 2) {
      newFilters.start_date = dateStrings[0];
      newFilters.end_date = dateStrings[1];
    } else {
      newFilters.start_date = null;
      newFilters.end_date = null;
    }
    setFilters(newFilters);
  };

  const applyFilters = () => {
    // clean up empty values
    const cleanFilters = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) cleanFilters[key] = value;
    }
    onFilterChange(cleanFilters);
  };

  const showLocationFilters = role !== 'ADMINISTRATOR' && role !== 'LEAD_OFFICER' && role !== 'OFFICER';

  return (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-zinc-700">
      <Row gutter={[16, 16]}>
        {showLocationFilters && (
          <Col xs={24} sm={12} md={8} lg={6}>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('region', 'Region')}</label>
            <Select 
              allowClear 
              placeholder={t('selectRegion', 'Select Region')}
              value={filters.region}
              onChange={(v) => handleFilterChange('region', v)}
              className="w-full"
              disabled={loading}
            >
              {regions.map(r => <Option key={r.id} value={r.id}>{r.name}</Option>)}
            </Select>
          </div>
        </Col>
        )}

        {showLocationFilters && !filters.special_woreda && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('zone', 'Zone')}</label>
              <Select 
                allowClear 
                placeholder={t('selectZone', 'Select Zone')}
                value={filters.zone}
                onChange={(v) => handleFilterChange('zone', v)}
                className="w-full"
                disabled={!filters.region || loading}
              >
                {zones.map(z => <Option key={z.id} value={z.id}>{z.name}</Option>)}
              </Select>
            </div>
          </Col>
        )}

        {/* XOR Logic: If zone is NOT selected, show Special Woreda */}
        {showLocationFilters && !filters.zone && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('specialWoreda', 'Special Woreda')}</label>
              <Select 
                allowClear 
                placeholder={t('selectSpecialWoreda', 'Select Sp. Woreda')}
                value={filters.special_woreda}
                onChange={(v) => handleFilterChange('special_woreda', v)}
                className="w-full"
                disabled={!filters.region || loading}
              >
                {specialWoredas.map(sw => <Option key={sw.id} value={sw.id}>{sw.name}</Option>)}
              </Select>
            </div>
          </Col>
        )}

        {/* Normal Woreda (only visible if a zone is selected) */}
        {showLocationFilters && filters.zone && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('woreda', 'Woreda')}</label>
              <Select 
                allowClear 
                placeholder={t('selectWoreda', 'Select Woreda')}
                value={filters.woreda}
                onChange={(v) => handleFilterChange('woreda', v)}
                className="w-full"
                disabled={!filters.zone || loading}
              >
                {woredas.map(w => <Option key={w.id} value={w.id}>{w.name}</Option>)}
              </Select>
            </div>
          </Col>
        )}

        {showLocationFilters && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('kebele', 'Kebele')}</label>
              <Select 
                allowClear 
                placeholder={t('selectKebele', 'Select Kebele')}
                value={filters.kebele}
                onChange={(v) => handleFilterChange('kebele', v)}
                className="w-full"
                disabled={(!filters.woreda && !filters.special_woreda) || loading}
              >
                {kebeles.map(k => <Option key={k.id} value={k.id}>{k.name}</Option>)}
              </Select>
            </div>
          </Col>
        )}
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('datePreset', 'Date Preset')}</label>
            <Select 
              allowClear 
              placeholder={t('selectPreset', 'Select Preset')}
              value={filters.date_preset}
              onChange={handleDatePresetChange}
              className="w-full"
              disabled={loading}
            >
              <Option value="today">{t('today', 'Today')}</Option>
              <Option value="yesterday">{t('yesterday', 'Yesterday')}</Option>
              <Option value="last_7_days">{t('last7Days', 'Last 7 Days')}</Option>
              <Option value="last_30_days">{t('last30Days', 'Last 30 Days')}</Option>
              <Option value="this_month">{t('thisMonth', 'This Month')}</Option>
              <Option value="last_month">{t('lastMonth', 'Last Month')}</Option>
              <Option value="this_year">{t('thisYear', 'This Year')}</Option>
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={24} md={12} lg={8}>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('customDateRange', 'Custom Date Range')}</label>
            <RangePicker 
              onChange={handleCustomDateChange} 
              className="w-full"
              disabled={!!filters.date_preset || loading}
              allowEmpty={[true, true]}
            />
          </div>
        </Col>

        <Col xs={24} className="flex justify-end items-end">
          <Button 
            type="primary" 
            onClick={applyFilters} 
            loading={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {t('applyFilters', 'Apply Filters')}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

LocationDateFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  initialFilters: PropTypes.object
};

export default LocationDateFilter;
