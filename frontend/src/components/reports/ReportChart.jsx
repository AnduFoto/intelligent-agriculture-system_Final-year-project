import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import { 
  ResponsiveContainer, 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e'];

const ReportChart = ({ type, data, title, xKey, yKeys, loading, height = 400 }) => {
  if (loading) {
    return <Card className="dark:bg-zinc-800 dark:border-zinc-700 w-full" loading={true} style={{ height: height + 60 }} />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="dark:bg-zinc-800 dark:border-zinc-700 w-full" title={<span className="dark:text-white">{title}</span>}>
        <div className="flex justify-center items-center text-gray-500 dark:text-gray-400" style={{ height }}>
          No data available
        </div>
      </Card>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey={xKey} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
              itemStyle={{ color: '#f3f4f6' }}
            />
            <Legend />
            {yKeys.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={COLORS[index % COLORS.length]} 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            ))}
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey={xKey} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
              cursor={{fill: '#374151', opacity: 0.4}}
            />
            <Legend />
            {yKeys.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={COLORS[index % COLORS.length]} 
                radius={[4, 4, 0, 0]} 
              />
            ))}
          </BarChart>
        );
      case 'pie':
        // For pie, we assume single yKey which contains the value
        return (
          <PieChart margin={{ top: 30, bottom: 40, left: 20, right: 20 }}>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
            />
            <Legend />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={height / 2.5}
              fill="#8884d8"
              dataKey={yKeys[0]}
              nameKey={xKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      case 'doughnut':
        return (
          <PieChart margin={{ top: 30, bottom: 40, left: 20, right: 20 }}>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
            />
            <Legend />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={height / 4}
              outerRadius={height / 2.5}
              fill="#8884d8"
              dataKey={yKeys[0]}
              nameKey={xKey}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <Card 
      title={<span className="dark:text-white font-semibold">{title}</span>} 
      className="dark:bg-zinc-800 dark:border-zinc-700 shadow-sm rounded-lg"
    >
      <div style={{ width: '100%', height, minWidth: 1, minHeight: 1 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

ReportChart.propTypes = {
  type: PropTypes.oneOf(['line', 'bar', 'pie', 'doughnut']).isRequired,
  data: PropTypes.array,
  title: PropTypes.string.isRequired,
  xKey: PropTypes.string.isRequired,
  yKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool,
  height: PropTypes.number,
};

export default ReportChart;
