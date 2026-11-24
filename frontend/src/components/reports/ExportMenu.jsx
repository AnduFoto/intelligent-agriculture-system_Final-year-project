import React, { useState } from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { DownloadOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { reportService } from '../../api/reportService';
import PropTypes from 'prop-types';

const ExportMenu = ({ reportType, filters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleExport = async (format) => {
    setLoading(true);
    try {
      await reportService.downloadExport(reportType, format, filters);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'pdf',
      icon: <FilePdfOutlined className="text-red-500" />,
      label: t('exportPdf', 'Export PDF'),
      onClick: () => handleExport('pdf'),
    },
    {
      key: 'csv',
      icon: <FileExcelOutlined className="text-green-600" />,
      label: t('exportCsv', 'Export CSV'),
      onClick: () => handleExport('csv'),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      <Button icon={<DownloadOutlined />} loading={loading} className="dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
        {t('export', 'Export')}
      </Button>
    </Dropdown>
  );
};

ExportMenu.propTypes = {
  reportType: PropTypes.string.isRequired,
  filters: PropTypes.object.isRequired
};

export default ExportMenu;
