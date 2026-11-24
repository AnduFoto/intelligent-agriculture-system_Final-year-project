import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Spin, Alert, Row, Col, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { reportService } from '../../api/reportService';
import ExportMenu from './ExportMenu';

import ReportChart from './ReportChart';

const { Title } = Typography;

const CropsListSection = ({ role, filters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ crops: [], chart_data: [] });

  useEffect(() => {
    if (role !== 'ADMINISTRATOR' && role !== 'LEAD_OFFICER') {
      return;
    }

    const fetchCrops = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await reportService.getCrops(filters);
        setData(result);
      } catch (err) {
        console.error("Failed to fetch crop statistics", err);
        setError("Failed to load crop statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, [filters, role]);

  if (role !== 'ADMINISTRATOR' && role !== 'LEAD_OFFICER') {
    return null;
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
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

  if (loading && !data.crops.length) {
    return <Spin size="large" className="w-full flex justify-center p-12" />;
  }

  if (error) {
    return <Alert type="error" message={error} className="mb-6" />;
  }

  return (
    <div className="mb-8">
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Title level={4} className="dark:text-white m-0">Crop Types Catalog</Title>
        </Col>
        <Col>
          <ExportMenu reportType="crops" filters={filters} disabled={data.crops.length === 0} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card className="dark:bg-zinc-800 dark:border-zinc-700 shadow-sm rounded-lg" styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={data.crops}
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
              title="Active vs Inactive Crops" 
              type="pie" 
              data={data.chart_data} 
              yKeys={['count']} 
              xKey="status" 
            />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default CropsListSection;
