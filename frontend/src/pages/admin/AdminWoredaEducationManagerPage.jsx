import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Modal, Form, Select, message, Popconfirm } from 'antd';
import { adminService } from '../../api/adminService';
import { getWoredaManagers, assignWoredaManager, removeWoredaManager } from '../../api/educationService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  MapPin, 
  Calendar, 
  Users, 
  BookOpen,
  Mail
} from 'lucide-react';

export default function AdminWoredaEducationManagerPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Form data sources
    const [officers, setOfficers] = useState([]);
    const [form] = Form.useForm();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [assignmentsRes, officersRes] = await Promise.all([
                getWoredaManagers(),
                adminService.listUsers({ role: 'OFFICER' })
            ]);
            
            setAssignments(assignmentsRes.results || assignmentsRes);
            
            const officersData = officersRes.data;
            setOfficers(officersData.results || officersData);
        } catch (error) {
            message.error(t('failed_load_data', 'Failed to load data'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAssign = async (values) => {
        const officer = officers.find(o => o.id === values.officer);
        
        const woredaId = officer?.woreda || user?.woreda;
        const specialWoredaId = officer?.special_woreda || user?.special_woreda;

        if (!woredaId && !specialWoredaId) {
            message.error(t('woreda_location_error', 'Could not determine Location. Ensure the officer belongs to a Woreda or Special Woreda.'));
            return;
        }

        const payload = { officer: values.officer };
        if (woredaId) payload.woreda = woredaId;
        if (specialWoredaId) payload.special_woreda = specialWoredaId;

        setSubmitting(true);
        try {
            await assignWoredaManager(payload);
            message.success(t('manager_assigned_success', 'Woreda Educational System Manager assigned successfully'));
            setModalVisible(false);
            form.resetFields();
            loadData();
        } catch (error) {
            message.error(error.response?.data?.detail || t('failed_assign_manager', 'Failed to assign manager'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (id) => {
        try {
            await removeWoredaManager(id);
            message.success(t('manager_assignment_removed', 'Manager assignment removed'));
            loadData();
        } catch (error) {
            message.error(t('failed_remove_assignment', 'Failed to remove assignment'));
        }
    };

    const columns = [
        {
            title: t('officer_col', 'Educational Manager'),
            dataIndex: 'officer_name',
            key: 'officer_name',
            render: (text, record) => {
                const initials = (text || 'M')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                return (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 shrink-0">
                            {initials}
                        </div>
                        <div>
                            <span className="font-bold text-slate-800 dark:text-white block">{text}</span>
                            {record.officer_email && (
                                <span className="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {record.officer_email}
                                </span>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            title: t('woreda_col', 'Jurisdiction / Woreda'),
            dataIndex: 'woreda_name',
            key: 'woreda_name',
            render: (text) => (
                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{text || t('special_woreda', 'Special Woreda')}</span>
                </div>
            )
        },
        {
            title: t('assigned_date_col', 'Appointment Date'),
            dataIndex: 'assigned_at',
            key: 'assigned_at',
            render: (date) => (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{date ? new Date(date).toLocaleDateString() : '—'}</span>
                </div>
            )
        },
        {
            title: t('actions_col', 'Action'),
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Popconfirm
                    title={t('remove_assignment_title', 'Remove assignment?')}
                    description={t('remove_assignment_desc_woreda', "This officer will no longer manage this Woreda's knowledge base.")}
                    onConfirm={() => handleRemove(record.id)}
                    okText={t('yes_remove', 'Yes, Remove')}
                    cancelText={t('cancel', 'Cancel')}
                    okButtonProps={{ danger: true }}
                >
                    <button
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/50 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('remove', 'Remove')}</span>
                    </button>
                </Popconfirm>
            )
        }
    ];

    return (
        <div className="space-y-6 ml-4 animate-fadeIn max-w-7xl mx-auto">
            
            {/* 1. Header (Seamless theme background, no black banner) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
                <div>
                    {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200/60 dark:border-emerald-800/40">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {t('knowledge_oversight', 'Knowledge System Oversight')}
                    </div> */}
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                        {t('woreda_edu_managers_title', 'Woreda Educational System Managers')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                        {t('woreda_edu_managers_desc', 'Assign and oversee officers managing official agricultural resources for specific Woredas.')}
                    </p>
                </div>

                <button 
                    onClick={() => setModalVisible(true)}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm shadow-emerald-500/25 transition-all text-xs sm:text-sm active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>{t('assign_manager_btn', 'Assign Manager')}</span>
                </button>
            </div>

            {/* 2. Stat KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                            {t('active_managers', 'Active Managers')}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <BookOpen className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{assignments.length}</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            {t('available_officers', 'Available Officers')}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mt-2">{officers.length}</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                            {t('coverage_scope', 'Scope')}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                            <MapPin className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mt-2">{t('woreda_level', 'Woreda & Special Woreda')}</p>
                </div>
            </div>

            {/* 3. Managers Table Card */}
            <Card className="p-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                <Table 
                    columns={columns} 
                    dataSource={assignments} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    className="custom-admin-table"
                />
            </Card>

            {/* 4. Assignment Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-white">
                        <GraduationCap className="w-5 h-5 text-emerald-600" />
                        <span>{t('assign_woreda_manager_modal_title', 'Assign Woreda Educational System Manager')}</span>
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                destroyOnClose
                className="rounded-2xl"
            >
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
                    {t('assign_manager_modal_desc', 'Select an agriculture officer to authorize publication and management of agricultural knowledge resources.')}
                </p>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAssign}
                    className="mt-2"
                >
                    <Form.Item
                        name="officer"
                        label={<span className="font-bold text-xs text-slate-700 dark:text-zinc-300">{t('select_officer_label', 'Select Officer')}</span>}
                        rules={[{ required: true, message: t('select_officer_required', 'Please select an officer') }]}
                    >
                        <Select
                            showSearch
                            placeholder={t('search_officer_placeholder', 'Search by name or email...')}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={officers.map(o => ({
                                value: o.id,
                                label: `${o.first_name} ${o.last_name} (${o.email})`
                            }))}
                            className="w-full"
                        />
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={() => setModalVisible(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            {t('cancel', 'Cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all shadow-sm shadow-emerald-500/25"
                        >
                            {submitting ? '...' : t('assign_manager_btn', 'Assign Manager')}
                        </button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
