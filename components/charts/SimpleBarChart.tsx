

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, UI_THEME_COLORS } from '../../constants';

interface SimpleBarChartProps {
  data: any[];
  xAxisKey: string;
  barKeys: Array<{ key: string; name: string; color?: string }>;
  title?: string;
  height?: number;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, xAxisKey, barKeys, title, height = 300 }) => {
  return (
    <div className="bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 shadow-xl rounded-xl p-7 border border-brand-text-light/15 transition-all duration-300 hover:shadow-brand-accent/20 hover:border-brand-accent-muted/40">
      {title && <h3 className="text-2xl font-heading font-semibold text-brand-text-light mb-6">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 25, left: -5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} stroke={UI_THEME_COLORS.textMedium} />
          <XAxis dataKey={xAxisKey} tick={{ fill: UI_THEME_COLORS.textMedium, fontSize: 13, fontFamily: 'Inter, sans-serif' }} axisLine={{stroke: UI_THEME_COLORS.borderPrimary, strokeOpacity: 0.5}} tickLine={{stroke: UI_THEME_COLORS.borderPrimary, strokeOpacity: 0.5}} />
          <YAxis tick={{ fill: UI_THEME_COLORS.textMedium, fontSize: 13, fontFamily: 'Inter, sans-serif' }} axisLine={{stroke: UI_THEME_COLORS.borderPrimary, strokeOpacity: 0.5}} tickLine={{stroke: UI_THEME_COLORS.borderPrimary, strokeOpacity: 0.5}}/>
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
            cursor={{fill: UI_THEME_COLORS.bgSurfaceLight, opacity: 0.4}}
          />
          <Legend wrapperStyle={{ fontSize: '13px', color: UI_THEME_COLORS.textMedium, fontFamily: 'Inter, sans-serif', paddingTop: '15px' }} />
          {barKeys.map((barItem, index) => (
            <Bar key={barItem.key} dataKey={barItem.key} name={barItem.name} fill={barItem.color || CHART_COLORS[index % CHART_COLORS.length]} radius={[6, 6, 0, 0]} barSize={22} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};