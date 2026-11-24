import React, { useState, useEffect } from 'react';
import { Tabs, Row, Col, Typography, message, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  FileTextOutlined,
  CommentOutlined,
  RobotOutlined,
  BookOutlined,
} from '@ant-design/icons';
import StatCard from './StatCard';
import ReportChart from './ReportChart';
import LocationDateFilter from './LocationDateFilter';
import ExportMenu from './ExportMenu';
import UsersListSection from './UsersListSection';
import FarmersListSection from './FarmersListSection';
import CropsListSection from './CropsListSection';
import SpecializationsListSection from './SpecializationsListSection';
import { reportService } from '../../api/reportService';
import PropTypes from 'prop-types';

const { Title, Text } = Typography;

const ReportsDashboard = ({ role }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // Define what tabs a role can see and location filter access
  const hasLocationFilter = role === 'ADMINISTRATOR';
  
  const getTabsByRole = () => {
    switch (role) {
      case 'ADMINISTRATOR':
        return ['overview', 'consultations', 'ai', 'education'];
      case 'LEAD_OFFICER':
        return ['overview', 'consultations', 'ai', 'education'];
      case 'OFFICER':
        return ['overview', 'consultations', 'education'];
      case 'FARMER':
        return ['overview', 'consultations', 'ai', 'education'];
      default:
        return ['overview'];
    }
  };

  const tabs = getTabsByRole();

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      switch (activeTab) {
        case 'overview':
          res = await reportService.getOverview(filters);
          break;
        case 'consultations':
          res = await reportService.getConsultations(filters);
          break;
        case 'ai':
          res = await reportService.getAI(filters);
          break;
        case 'education':
          res = await reportService.getEducation(filters);
          break;
        default:
          res = await reportService.getOverview(filters);
      }
      setData(res);
    } catch (err) {
      message.error(t('failedToFetchData', 'Failed to fetch report data.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [activeTab, filters]);

  const renderOverview = () => {
    if (!data) return null;
    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <StatCard 
              title={t('totalConsultations', 'Total Consultations')}
              value={data.consultations?.total || 0}
              icon={<CommentOutlined className="text-xl" />}
              loading={loading}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard 
              title={t('aiPredictions', 'AI Predictions')}
              value={data.ai_predictions?.total || 0}
              icon={<RobotOutlined className="text-xl" />}
              loading={loading}
            />
          </Col>
          
          {(role === 'ADMINISTRATOR' || role === 'LEAD_OFFICER') && data.users && (
            <>
              <Col xs={24} sm={12} md={6}>
                <StatCard 
                  title={t('totalFarmers', 'Total Farmers')}
                  value={data.users.total_farmers || 0}
                  loading={loading}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard 
                  title={t('totalOfficers', 'Total Officers')}
                  value={data.users.total_officers || 0}
                  loading={loading}
                />
              </Col>
            </>
          )}

          {role === 'ADMINISTRATOR' && data.locations && (
            <Col xs={24}>
              <Alert 
                message={t('systemLocations', 'System Locations')} 
                description={`Regions: ${data.locations.regions}, Zones: ${data.locations.zones}, Special Woredas: ${data.locations.special_woredas}, Woredas: ${data.locations.woredas}, Kebeles: ${data.locations.kebeles}`}
                type="info" 
                showIcon 
                className="mt-4"
              />
            </Col>
          )}
        </Row>
      </div>
    );
  };

  const renderConsultations = () => {
    if (!data) return null;
    return (
      <div>
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={8} md={4}>
            <StatCard title={t('total', 'Total')} value={data.counts?.total || 0} loading={loading} />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <StatCard title={t('new', 'New')} value={data.counts?.new || 0} loading={loading} />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <StatCard title={t('assigned', 'Assigned')} value={data.counts?.assigned || 0} loading={loading} />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <StatCard title={t('resolved', 'Resolved')} value={data.counts?.resolved || 0} loading={loading} />
          </Col>
          <Col xs={24} sm={16} md={8}>
            <StatCard 
              title={t('avgResolutionTime', 'Avg Resolution Time')} 
              value={data.avg_resolution_hours ? `${data.avg_resolution_hours.toFixed(1)} hrs` : 'N/A'} 
              loading={loading} 
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <ReportChart 
              type="line"
              title={t('consultationTrends', 'Consultation Trends')}
              data={data.trend}
              xKey="date"
              yKeys={['count']}
              loading={loading}
            />
          </Col>
          <Col xs={24} lg={8}>
            <ReportChart 
              type="pie"
              title={t('consultationsByCrop', 'Consultations By Crop')}
              data={data.crops}
              xKey="crop_type__name"
              yKeys={['count']}
              loading={loading}
            />
          </Col>
        </Row>
      </div>
    );
  };

  const renderAI = () => {
    if (!data) return null;
    return (
      <div>
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12}>
            <StatCard title={t('totalPredictions', 'Total Predictions')} value={data.total || 0} loading={loading} />
          </Col>
          <Col xs={24} sm={12}>
            <StatCard 
              title={t('avgConfidence', 'Avg Confidence')} 
              value={data.avg_confidence ? `${(data.avg_confidence * 100).toFixed(1)}%` : 'N/A'} 
              loading={loading} 
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <ReportChart 
              type="bar"
              title={t('mostDetectedDiseases', 'Most Detected Diseases')}
              data={data.diseases}
              xKey="disease_class"
              yKeys={['count']}
              loading={loading}
            />
          </Col>
          <Col xs={24} lg={12}>
            <ReportChart 
              type="bar"
              title={t('mostAnalyzedCrops', 'Most Analyzed Crops')}
              data={data.crops}
              xKey="crop"
              yKeys={['count']}
              loading={loading}
            />
          </Col>
          <Col xs={24}>
            <ReportChart 
              type="line"
              title={t('predictionTrends', 'Prediction Trends')}
              data={data.trend}
              xKey="date"
              yKeys={['count']}
              loading={loading}
            />
          </Col>
        </Row>
      </div>
    );
  };

  const renderEducation = () => {
    if (!data) return null;
    return (
      <div>
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <StatCard title={t('totalResources', 'Total Resources')} value={data.total || 0} loading={loading} />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard title={t('published', 'Published')} value={data.published || 0} loading={loading} />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard title={t('totalViews', 'Total Views')} value={data.views || 0} loading={loading} />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard title={t('totalDownloads', 'Total Downloads')} value={data.downloads || 0} loading={loading} />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <ReportChart 
              type="doughnut"
              title={t('resourcesByCategory', 'Resources by Category')}
              data={data.categories}
              xKey="category__name"
              yKeys={['count']}
              loading={loading}
            />
          </Col>
          <Col xs={24} lg={12}>
            <ReportChart 
              type="bar"
              title={t('resourcesByPublisher', 'Resources by Publisher')}
              data={data.publishers}
              xKey="publisher__name"
              yKeys={['count']}
              loading={loading}
            />
          </Col>
        </Row>
      </div>
    );
  };

  const tabItems = [
    ...(tabs.includes('overview') ? [{
      key: 'overview',
      label: <span><FileTextOutlined /> {t('overview', 'Overview')}</span>,
      children: renderOverview()
    }] : []),
    ...(tabs.includes('consultations') ? [{
      key: 'consultations',
      label: <span><CommentOutlined /> {t('consultations', 'Consultations')}</span>,
      children: renderConsultations()
    }] : []),
    ...(tabs.includes('ai') ? [{
      key: 'ai',
      label: <span><RobotOutlined /> {t('aiAnalytics', 'AI Analytics')}</span>,
      children: renderAI()
    }] : []),
    ...(tabs.includes('education') ? [{
      key: 'education',
      label: <span><BookOutlined /> {t('educationAnalytics', 'Education Analytics')}</span>,
      children: renderEducation()
    }] : []),
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <Title level={2} className="dark:text-white mb-1">
            {t('reportsAndAnalytics', 'Reports & Analytics')}
          </Title>
          <Text className="text-gray-500 dark:text-gray-400">
            {t('reportsDesc', 'View and export system data.')}
          </Text>
        </div>
        <div className="mt-4 sm:mt-0">
          <ExportMenu reportType={activeTab} filters={filters} />
        </div>
      </div>

      {hasLocationFilter && (
        <LocationDateFilter 
          onFilterChange={setFilters} 
          loading={loading} 
          role={role}
        />
      )}
      
      {!hasLocationFilter && (
        <div className="mb-6">
          <LocationDateFilter 
            onFilterChange={setFilters} 
            loading={loading} 
            role={role}
          />
        </div>
      )}

      {/* USER LIST SECTION FOR ADMIN & LEAD OFFICER */}
      <UsersListSection role={role} filters={filters} />
      <FarmersListSection role={role} filters={filters} />
      <CropsListSection role={role} filters={filters} />
      <SpecializationsListSection role={role} filters={filters} />

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        className="reports-tabs"
        items={tabItems}
        destroyInactiveTabPane={true}
      />
    </div>
  );
};

ReportsDashboard.propTypes = {
  role: PropTypes.string.isRequired,
};

export default ReportsDashboard;
