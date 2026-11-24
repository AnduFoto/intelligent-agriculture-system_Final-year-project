import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Spin, Alert, Row, Col, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { reportService } from '../../api/reportService';
import ExportMenu from './ExportMenu';

import ReportChart from './ReportChart';

const { Title } = Typography;

const SpecializationsListSection = ({ role, filters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ specializations: [], chart_data: [] });

  useEffect(() => {
    if (role !== 'ADMINISTRATOR' && role !== 'LEAD_OFFICER') {
      return;
    }

    const fetchSpecializations = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await reportService.getSpecializations(filters);
        setData(result);
      } catch (err) {
        console.error("Failed to fetch specializations statistics", err);
        setError("Failed to load specializations statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecializations();
  }, [filters, role]);

  if (role !== 'ADMINISTRATOR' && role !== 'LEAD_OFFICER') {
    return null;
  }

  const uniqueKebeles = [...new Set(data.specializations.map(s => s.kebele_name).filter(k => k && k !== 'N/A'))];
  const kebeleFilters = uniqueKebeles.map(k => ({ text: k, value: k }));

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Kebele',
      dataIndex: 'kebele_name',
      key: 'kebele_name',
      filters: role === 'ADMINISTRATOR' ? kebeleFilters : null,
      onFilter: role === 'ADMINISTRATOR' ? (value, record) => record.kebele_name === value : null,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
  ];

  if (loading && !data.specializations.length) {
    return <Spin size="large" className="w-full flex justify-center p-12" />;
  }

  if (error) {
    return <Alert type="error" message={error} className="mb-6" />;
  }

  return (
    <div className="mb-8">
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Title level={4} className="dark:text-white m-0">Specializations Roster</Title>
        </Col>
        <Col>
          <ExportMenu reportType="specializations" filters={filters} disabled={data.specializations.length === 0} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card className="dark:bg-zinc-800 dark:border-zinc-700 shadow-sm rounded-lg" styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={data.specializations}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              scroll={{ x: true }}
              className="dark-theme-table"
            />
          </Card>
        </Col>

        {data.chart_data && data.chart_data.length > 0 && (
          <Col xs={24} lg={24} className="mx-auto mt-4">
            <ReportChart 
              title="Specializations per Kebele" 
              type="pie" 
              data={data.chart_data} 
              yKeys={['count']} 
              xKey="kebele_name" 
            />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default SpecializationsListSection;
