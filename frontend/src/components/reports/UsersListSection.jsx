import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Spin, Alert, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { reportService } from '../../api/reportService';
import ExportMenu from './ExportMenu';
import ReportChart from './ReportChart';

const { Title } = Typography;

const UsersListSection = ({ role, filters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ users: [], chart_data: [] });

  useEffect(() => {
    // Only fetch for roles that should see this section
    if (role !== 'ADMINISTRATOR' && role !== 'LEAD_OFFICER') {
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await reportService.getUsers(filters);
        setData(result);
      } catch (err) {
        console.error("Failed to fetch users statistics", err);
        setError("Failed to load user statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filters, role]);

  if (role !== 'ADMINISTRATOR' && role !== 'LEAD_OFFICER') {
    return null;
  }

  const uniqueKebeles = [...new Set(data.users.map(u => u.kebeles).filter(Boolean).flatMap(k => k.split(', ')))];
  const kebeleFilters = uniqueKebeles.map(k => ({ text: k, value: k }));

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone_number',
      key: 'phone_number',
    },
    {
      title: 'Kebeles Assigned',
      dataIndex: 'kebeles',
      key: 'kebeles',
      filters: role === 'ADMINISTRATOR' ? kebeleFilters : null,
      onFilter: role === 'ADMINISTRATOR' ? (value, record) => record.kebeles && record.kebeles.includes(value) : null,
    },
    {
      title: 'Role',
      dataIndex: 'role_display',
      key: 'role_display',
      filters: [
        { text: 'Lead Officer', value: 'Lead Officer' },
        { text: 'Agriculture Officer', value: 'Agriculture Officer' },
      ],
      onFilter: (value, record) => record.role_display === value,
    },
    {
      title: 'Date Joined',
      dataIndex: 'date_joined',
      key: 'date_joined',
      sorter: (a, b) => new Date(a.date_joined) - new Date(b.date_joined),
    },
  ];

  if (loading && !data.users.length) {
    return <Spin size="large" className="w-full flex justify-center p-12" />;
  }

  if (error) {
    return <Alert type="error" message={error} className="mb-6" />;
  }

  return (
    <div className="mb-8">
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Title level={4} className="dark:text-white m-0">Officer Roster</Title>
        </Col>
        <Col>
          <ExportMenu reportType="users" filters={filters} disabled={data.users.length === 0} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card className="dark:bg-zinc-800 dark:border-zinc-700 shadow-sm rounded-lg" styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={data.users}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              scroll={{ x: true }}
              className="dark-theme-table"
            />
          </Card>
        </Col>

        {role === 'ADMINISTRATOR' && data.chart_data && data.chart_data.length > 0 && (
          <Col xs={24} lg={24} className="mx-auto mt-4">
            <ReportChart 
              title="Officers per Kebele" 
              type="pie" 
              data={data.chart_data} 
              yKeys={['officer_count']} 
              xKey="kebele_name" 
            />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default UsersListSection;
