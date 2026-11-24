import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Spin, Alert, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { reportService } from '../../api/reportService';
import ExportMenu from './ExportMenu';

import ReportChart from './ReportChart';

const { Title } = Typography;

const FarmersListSection = ({ role, filters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ farmers: [], chart_data: [] });

  useEffect(() => {
    if (role !== 'ADMINISTRATOR' && role !== 'LEAD_OFFICER') {
      return;
    }

    const fetchFarmers = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await reportService.getFarmers(filters);
        setData(result);
      } catch (err) {
        console.error("Failed to fetch farmers statistics", err);
        setError("Failed to load farmer statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, [filters, role]);

  if (role !== 'ADMINISTRATOR' && role !== 'LEAD_OFFICER') {
    return null;
  }

  const uniqueKebeles = [...new Set(data.farmers.map(u => u.kebele_name).filter(k => k && k !== 'N/A'))];
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
      title: 'Kebele',
      dataIndex: 'kebele_name',
      key: 'kebele_name',
      filters: role === 'ADMINISTRATOR' ? kebeleFilters : null,
      onFilter: role === 'ADMINISTRATOR' ? (value, record) => record.kebele_name === value : null,
    },
    {
      title: 'Date Joined',
      dataIndex: 'date_joined',
      key: 'date_joined',
      sorter: (a, b) => new Date(a.date_joined) - new Date(b.date_joined),
    },
  ];

  if (loading && !data.farmers.length) {
    return <Spin size="large" className="w-full flex justify-center p-12" />;
  }

  if (error) {
    return <Alert type="error" message={error} className="mb-6" />;
  }

  return (
    <div className="mb-8">
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Title level={4} className="dark:text-white m-0">Farmers Roster</Title>
        </Col>
        <Col>
          <ExportMenu reportType="farmers" filters={filters} disabled={data.farmers.length === 0} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card className="dark:bg-zinc-800 dark:border-zinc-700 shadow-sm rounded-lg" styles={{ body: { padding: 0 } }}>
            <Table
              dataSource={data.farmers}
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
              title="Farmers per Kebele" 
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

export default FarmersListSection;
