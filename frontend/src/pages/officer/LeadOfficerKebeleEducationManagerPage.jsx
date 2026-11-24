import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Modal, Form, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { adminService } from '../../api/adminService';
import { getKebeleManagers, assignKebeleManager, removeKebeleManager } from '../../api/educationService';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function LeadOfficerKebeleEducationManagerPage() {
    const { t } = useTranslation();
    const { user, role } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Form data sources
    const [officers, setOfficers] = useState([]);
    const [form] = Form.useForm();
    
    const [checkingLead, setCheckingLead] = useState(true);
    const [leadKebele, setLeadKebele] = useState(null);
    const [leadKebeleName, setLeadKebeleName] = useState('');

    useEffect(() => {
        (async () => {
            if (role === 'ADMINISTRATOR') {
                setCheckingLead(false);
                return;
            }
            setCheckingLead(true);
            try {
                const response = await axiosInstance.get('/auth/my-lead-kebele/');
                if (response.data?.lead_officer) {
                    setLeadKebele(response.data.lead_officer.kebele_id);
                    setLeadKebeleName(response.data.lead_officer.kebele_name || '');
                }
            } catch (err) {
                console.error('Failed to verify lead officer status', err);
            } finally {
                setCheckingLead(false);
            }
        })();
    }, [role]);

    const loadData = useCallback(async () => {
        if (role !== 'ADMINISTRATOR' && !leadKebele) return;
        setLoading(true);
        try {
            const [assignmentsRes, officersRes] = await Promise.all([
                getKebeleManagers(role === 'OFFICER' && leadKebele ? { kebele: leadKebele } : {}),
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
    }, [role, leadKebele, t]);

    useEffect(() => {
        if (!checkingLead) {
            loadData();
        }
    }, [checkingLead, loadData]);

    const handleAssign = async (values) => {
        const officer = officers.find(o => o.id === values.officer);
        const kebeleId = leadKebele 
            || values.kebele 
            || user?.lead_kebele_id 
            || user?.kebele 
            || (officer?.assigned_kebeles && (officer.assigned_kebeles[0]?.kebele?.id || officer.assigned_kebeles[0]?.id || officer.assigned_kebeles[0])) 
            || officer?.kebele;

        if (!kebeleId) {
            message.error(t('could_not_determine_kebele', 'Could not determine Kebele. Ensure you or the officer are assigned to a Kebele.'));
            return;
        }

        setSubmitting(true);
        try {
            await assignKebeleManager({ officer: values.officer, kebele: kebeleId });
            message.success(t('manager_assigned_success', 'Kebele Educational System Manager assigned successfully'));
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
            await removeKebeleManager(id);
            message.success(t('manager_assignment_removed', 'Manager assignment removed'));
            loadData();
        } catch (error) {
            message.error(t('failed_remove_assignment', 'Failed to remove assignment'));
        }
    };

    const columns = [
        {
            title: t('officer_column', 'Officer'),
            dataIndex: 'officer_name',
            key: 'officer_name',
            render: (text) => <span className="font-medium text-emerald-700">{text}</span>
        },
        {
            title: t('kebele_column', 'Kebele'),
            dataIndex: 'kebele_name',
            key: 'kebele_name',
        },
        {
            title: t('assigned_date_column', 'Assigned Date'),
            dataIndex: 'assigned_at',
            key: 'assigned_at',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: t('actions_column', 'Actions'),
            key: 'actions',
            render: (_, record) => (
                <Popconfirm
                    title={t('remove_assignment_q', 'Remove assignment?')}
                    description={t('remove_assignment_desc', "This officer will no longer be able to manage this Kebele's knowledge base.")}
                    onConfirm={() => handleRemove(record.id)}
                    okText={t('yes_remove', 'Yes, Remove')}
                    cancelText={t('cancel', 'Cancel')}
                    okButtonProps={{ danger: true }}
                >
                    <Button danger type="text" icon={<DeleteOutlined />}>{t('remove', 'Remove')}</Button>
                </Popconfirm>
            )
        }
    ];

    if (checkingLead) {
        return <LoadingSpinner fullScreen message={t('checking_authorization', "Checking authorization...")} />;
    }

    if (role !== 'ADMINISTRATOR' && !leadKebele) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <Alert variant="error">
                    {t('access_denied_lead_officer', 'Access Denied: You must be a designated Lead Officer to manage Kebele Education Managers.')}
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('kebele_educational_system_managers', 'Kebele Educational System Managers')}</h1>
                    <p className="text-gray-500">{t('assign_officers_manage_desc', 'Assign officers to manage official agricultural resources for specific Kebeles.')}</p>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setModalVisible(true)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                >
                    {t('assign_manager', 'Assign Manager')}
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={assignments} 
                rowKey="id" 
                loading={loading}
                className="shadow-sm border border-gray-200 rounded-md"
                locale={{ emptyText: t('no_data', 'No data') }}
            />

            <Modal
                title={t('assign_kebele_manager_title', 'Assign Kebele Educational System Manager')}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAssign}
                    className="mt-4"
                >
                    {leadKebeleName && (
                        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 flex items-center justify-between">
                            <span className="font-medium">{t('target_kebele', 'Kebele')}:</span>
                            <span className="font-bold">{leadKebeleName}</span>
                        </div>
                    )}
                    <Form.Item
                        name="officer"
                        label={t('select_officer_label', 'Select Officer')}
                        rules={[{ required: true, message: t('please_select_officer', 'Please select an officer') }]}
                    >
                        <Select
                            showSearch
                            placeholder={t('search_name_email', 'Search by name or email...')}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={officers.map(o => ({
                                value: o.id,
                                label: `${o.first_name} ${o.last_name} (${o.email})`
                            }))}
                        />
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={() => setModalVisible(false)}>{t('cancel', 'Cancel')}</Button>
                        <Button type="primary" htmlType="submit" loading={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                            {t('assign_manager', 'Assign Manager')}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
