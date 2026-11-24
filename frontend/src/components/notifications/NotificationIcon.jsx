import React from 'react';
import { 
  LockOutlined, 
  MessageOutlined, 
  RobotOutlined, 
  BookOutlined, 
  UserOutlined, 
  SettingOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const ICON_MAP = {
  AUTHENTICATION: <LockOutlined className="text-blue-500" />,
  CONSULTATION: <MessageOutlined className="text-emerald-500" />,
  AI_PREDICTION: <RobotOutlined className="text-purple-500" />,
  EDUCATION: <BookOutlined className="text-indigo-500" />,
  ADMINISTRATION: <SettingOutlined className="text-slate-500" />,
  ASSIGNMENT: <UserOutlined className="text-orange-500" />,
  USER_MANAGEMENT: <UserOutlined className="text-sky-500" />,
  LOCATION: <EnvironmentOutlined className="text-teal-500" />,
  SYSTEM: <SettingOutlined className="text-slate-500" />
};

const TYPE_MAP = {
  WARNING: <ExclamationCircleOutlined className="text-yellow-500" />,
  ERROR: <ExclamationCircleOutlined className="text-red-500" />,
  SUCCESS: <CheckCircleOutlined className="text-emerald-500" />,
  INFORMATION: <InfoCircleOutlined className="text-blue-500" />
};

export const NotificationIcon = ({ category, type, className = "" }) => {
  // If it's an error or warning, prioritize the type icon to alert the user
  if (type === 'ERROR' || type === 'WARNING') {
    return (
      <div className={`text-xl ${className}`}>
        {TYPE_MAP[type] || <InfoCircleOutlined />}
      </div>
    );
  }

  // Otherwise show the category icon
  return (
    <div className={`text-xl ${className}`}>
      {ICON_MAP[category] || TYPE_MAP[type] || <InfoCircleOutlined />}
    </div>
  );
};
