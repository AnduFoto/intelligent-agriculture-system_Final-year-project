import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Spin, Tag, Empty } from 'antd';
import { SearchOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import chatService from '../../api/chatService';
import locationService from '../../api/locationService';

export const NewChatModal = ({
  open,
  onClose,
  onStartChat
}) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startingChatId, setStartingChatId] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  
  // Location Hierarchy State (XOR Structure)
  const [regions, setRegions] = useState([]);
  const [zones, setZones] = useState([]);
  const [specialWoredas, setSpecialWoredas] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [kebeles, setKebeles] = useState([]);

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedSpecialWoreda, setSelectedSpecialWoreda] = useState('');
  const [selectedWoreda, setSelectedWoreda] = useState('');
  const [selectedKebele, setSelectedKebele] = useState('');

  useEffect(() => {
    if (open) {
      loadRegions();
      fetchUsers();
    }
  }, [open]);

  useEffect(() => {
    fetchUsers();
  }, [search, role, selectedKebele, selectedWoreda, selectedSpecialWoreda]);

  const loadRegions = async () => {
    try {
      const data = await locationService.getRegions();
      setRegions(data.results || data || []);
    } catch (err) {
      console.error('Failed to load regions', err);
    }
  };

  const handleRegionChange = async (val) => {
    setSelectedRegion(val);
    setSelectedZone('');
    setSelectedSpecialWoreda('');
    setSelectedWoreda('');
    setSelectedKebele('');
    setZones([]);
    setSpecialWoredas([]);
    setWoredas([]);
    setKebeles([]);

    if (val) {
      try {
        const [zData, swData] = await Promise.all([
          locationService.getZones({ region: val }),
          locationService.getSpecialWoredas({ region: val })
        ]);
        setZones(zData.results || zData || []);
        setSpecialWoredas(swData.results || swData || []);
      } catch (err) {
        console.error('Failed to load zones/special woredas', err);
      }
    }
  };

  const handleZoneChange = async (val) => {
    setSelectedZone(val);
    setSelectedSpecialWoreda('');
    setSelectedWoreda('');
    setSelectedKebele('');
    setWoredas([]);
    setKebeles([]);

    if (val) {
      try {
        const data = await locationService.getWoredas({ zone: val });
        setWoredas(data.results || data || []);
      } catch (err) {
        console.error('Failed to load woredas', err);
      }
    }
  };

  const handleSpecialWoredaChange = async (val) => {
    setSelectedSpecialWoreda(val);
    setSelectedZone('');
    setSelectedWoreda('');
    setSelectedKebele('');
    setWoredas([]);
    setKebeles([]);

    if (val) {
      try {
        const data = await locationService.getKebeles({ special_woreda: val });
        setKebeles(data.results || data || []);
      } catch (err) {
        console.error('Failed to load kebeles for special woreda', err);
      }
    }
  };

  const handleWoredaChange = async (val) => {
    setSelectedWoreda(val);
    setSelectedKebele('');
    setKebeles([]);

    if (val) {
      try {
        const data = await locationService.getKebeles({ woreda: val });
        setKebeles(data.results || data || []);
      } catch (err) {
        console.error('Failed to load kebeles', err);
      }
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await chatService.searchUsers({
        search,
        role,
        kebele: selectedKebele,
        woreda: selectedWoreda,
        special_woreda: selectedSpecialWoreda
      });
      setUsers(data.results || data || []);
    } catch (err) {
      console.error('Failed to search users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (userId) => {
    setStartingChatId(userId);
    try {
      await onStartChat(userId);
      onClose();
    } catch (err) {
      console.error('Failed to start chat', err);
    } finally {
      setStartingChatId(null);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMINISTRATOR': return 'gold';
      case 'OFFICER': return 'emerald';
      case 'FARMER': return 'blue';
      default: return 'default';
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={<span className="font-bold text-slate-800 dark:text-slate-100">{t('start_new_chat', 'Start a New Chat')}</span>}
      width={600}
      centered
      className="dark:bg-zinc-900"
    >
      <div className="space-y-4 py-2">
        
        {/* Search & Role Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder={t('search_by_name_email', 'Search by name or email...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </div>
          <div>
            <Select
              value={role}
              onChange={(val) => setRole(val)}
              className="w-full"
              options={[
                { value: '', label: t('all_roles', 'All Roles') },
                { value: 'FARMER', label: t('farmers', 'Farmers') },
                { value: 'OFFICER', label: t('officers', 'Officers') },
                { value: 'ADMINISTRATOR', label: t('administrators', 'Administrators') }
              ]}
            />
          </div>
        </div>

        {/* Dynamic Location Controls (XOR Special Woreda Support) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl">
          <Select
            placeholder={t('region', 'Region')}
            value={selectedRegion || undefined}
            onChange={handleRegionChange}
            allowClear
            className="w-full"
            size="small"
            options={regions.map(r => ({ value: r.id, label: r.name }))}
          />

          <Select
            placeholder={t('zone_or_special', 'Zone / Special Woreda')}
            value={selectedZone ? `z-${selectedZone}` : selectedSpecialWoreda ? `sw-${selectedSpecialWoreda}` : undefined}
            onChange={(val) => {
              if (!val) {
                setSelectedZone('');
                setSelectedSpecialWoreda('');
              } else if (val.startsWith('z-')) {
                handleZoneChange(val.replace('z-', ''));
              } else if (val.startsWith('sw-')) {
                handleSpecialWoredaChange(val.replace('sw-', ''));
              }
            }}
            allowClear
            disabled={!selectedRegion}
            className="w-full"
            size="small"
            options={[
              ...zones.map(z => ({ value: `z-${z.id}`, label: `Zone: ${z.name}` })),
              ...specialWoredas.map(sw => ({ value: `sw-${sw.id}`, label: `Special Woreda: ${sw.name}` }))
            ]}
          />

          {/* Woreda select disabled/hidden if Special Woreda selected */}
          <Select
            placeholder={t('woreda', 'Woreda')}
            value={selectedWoreda || undefined}
            onChange={handleWoredaChange}
            allowClear
            disabled={!selectedZone || !!selectedSpecialWoreda}
            className="w-full"
            size="small"
            options={woredas.map(w => ({ value: w.id, label: w.name }))}
          />

          <Select
            placeholder={t('kebele', 'Kebele')}
            value={selectedKebele || undefined}
            onChange={(val) => setSelectedKebele(val || '')}
            allowClear
            disabled={(!selectedWoreda && !selectedSpecialWoreda)}
            className="w-full"
            size="small"
            options={kebeles.map(k => ({ value: k.id, label: k.name }))}
          />
        </div>

        {/* User Search Results List */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex justify-center p-8"><Spin /></div>
          ) : users.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('no_users_found', 'No users found matching filters')} />
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-base">
                    {u.first_name ? u.first_name[0].toUpperCase() : <UserOutlined />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{u.full_name}</span>
                      <Tag color={getRoleColor(u.role)} className="m-0 text-[10px] font-semibold border-none">
                        {u.role_display || u.role}
                      </Tag>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{u.location_summary}</p>
                  </div>
                </div>

                <Button
                  type="primary"
                  size="small"
                  icon={<MessageOutlined />}
                  loading={startingChatId === u.id}
                  className="bg-emerald-600 hover:bg-emerald-700 font-medium"
                  onClick={() => handleSelectUser(u.id)}
                >
                  {t('chat', 'Chat')}
                </Button>
              </div>
            ))
          )}
        </div>

      </div>
    </Modal>
  );
};
