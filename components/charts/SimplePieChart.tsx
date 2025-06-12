

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { CHART_COLORS, UI_THEME_COLORS } from '../../constants';

interface PieChartDataItem {
  name: string;
  value: number;
}

interface SimplePieChartProps {
  data: PieChartDataItem[];
  title?: string;
  height?: number;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, fill }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.4; // Adjusted for better placement
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? 'start' : 'end';

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  const rgb = hexToRgb(fill);
  const luminance = rgb ? (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255 : 0;
  const labelColor = luminance > 0.45 ? UI_THEME_COLORS.textDark : UI_THEME_COLORS.textLight;


  if (percent * 100 < 6) return null; // Don't render label for very small slices

  return (
    <text
      x={x}
      y={y}
      fill={labelColor}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fontSize="12px"
      fontFamily="Inter, sans-serif"
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const SimplePieChart: React.FC<SimplePieChartProps> = ({ data, title, height = 300 }) => {
  return (
    <div className="bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 shadow-xl rounded-xl p-7 border border-brand-text-light/15 transition-all duration-300 hover:shadow-brand-accent/20 hover:border-brand-accent-muted/40">
      {title && <h3 className="text-2xl font-heading font-semibold text-brand-text-light mb-6">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={Math.min(height / 2.6, 120)}
            innerRadius={Math.min(height / 4.5, 60)}
            fill="#8884d8" 
            dataKey="value"
            stroke={UI_THEME_COLORS.bgSurface} 
            strokeWidth={2.5}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ 
              backgroundColor: UI_THEME_COLORS.bgDeep, 
              border: `1px solid ${UI_THEME_COLORS.borderAccent}/60`, 
              borderRadius: '0.6rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
              fontFamily: 'Inter, sans-serif',
              padding: '10px 12px',
            }}
            labelStyle={{ color: UI_THEME_COLORS.textLight, marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}
            itemStyle={{ color: UI_THEME_COLORS.textMedium, fontSize: '13px' }}
            formatter={(value: number, name: string) => [`${value.toLocaleString()}`, name]}
          />
          <Legend 
            wrapperStyle={{ fontSize: '13px', color: UI_THEME_COLORS.textMedium, fontFamily: 'Inter, sans-serif', paddingTop: '20px' }} 
            iconType="circle"
            iconSize={10}
            formatter={(value, entry) => <span style={{color: UI_THEME_COLORS.textMedium, marginLeft: '5px'}}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};