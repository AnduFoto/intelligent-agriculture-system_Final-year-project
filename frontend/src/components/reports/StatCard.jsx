import React from 'react';
import { Card } from 'antd';
import PropTypes from 'prop-types';

const StatCard = ({ title, value, icon, description, loading }) => {
  return (
    <Card 
      className="dark:bg-zinc-800 dark:border-zinc-700 shadow-sm rounded-lg hover:shadow-md transition-shadow"
      loading={loading}
    >
      <div className="flex items-center">
        {icon && (
          <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mr-4">
            {icon}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white m-0">
            {value}
          </h3>
          {description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  description: PropTypes.string,
  loading: PropTypes.bool,
};

export default StatCard;
