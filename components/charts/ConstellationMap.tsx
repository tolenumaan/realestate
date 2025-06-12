

import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { OverviewProject, ProjectType } from '../../types';
import { UI_THEME_COLORS } from '../../constants';

interface ConstellationMapProps {
  data: OverviewProject[];
  onPointClick: (project: OverviewProject) => void;
  title?: string;
  height?: number;
}

// Updated color mapping using the new theme's chart colors
const projectTypeColors: Record<ProjectType, string> = {
  [ProjectType.ResidentialVillaCompound]: UI_THEME_COLORS.charts.aubergine1,
  [ProjectType.ApartmentBuilding]: UI_THEME_COLORS.charts.gold1,
  [ProjectType.CommercialOfficeSpace]: UI_THEME_COLORS.charts.mutedBlue,
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-brand-bg-deep/90 backdrop-blur-sm p-4.5 rounded-lg border border-brand-border-accent/50 shadow-2xl text-sm font-sans">
        <p className="font-heading font-semibold text-brand-accent text-lg mb-2">{data.name}</p>
        <p className="text-brand-text-medium">Type: <span className="capitalize text-brand-text-light">{data.type}</span></p>
        <p className="text-brand-text-medium">Progress: <span className="text-brand-text-light">{data.overallProgress}%</span></p>
        <p className="text-brand-text-medium">Budget Util: <span className="text-brand-text-light">{data.budgetUtilization}%</span></p>
        <p className="text-brand-text-medium">Status: <span className="text-brand-text-light">{data.status}</span></p>
      </div>
    );
  }
  return null;
};

export const ConstellationMap: React.FC<ConstellationMapProps> = ({ data, onPointClick, title, height = 350 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 shadow-xl rounded-xl p-7 border border-brand-text-light/15">
        {title && <h3 className="text-2xl font-heading font-semibold text-brand-text-light mb-6">{title}</h3>}
        <p className="text-brand-text-medium text-center py-8 font-sans italic text-base">No data available for constellation map.</p>
      </div>
    );
  }

  const chartData = data.map(p => ({
    ...p,
    x: p.overallProgress,
    y: p.budgetUtilization,
    z: p.unitsSold > 0 ? p.unitsSold * 15 : 60, 
  }));

  const uniqueProjectTypes = Array.from(new Set(data.map(p => p.type)));

  return (
    <div className="bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 shadow-xl rounded-xl p-7 border border-brand-text-light/15 transition-all duration-300 hover:shadow-brand-accent/20 hover:border-brand-accent-muted/40">
      {title && <h3 className="text-2xl font-heading font-semibold text-brand-text-light mb-6">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="2 2" strokeOpacity={0.08} stroke={UI_THEME_COLORS.textMedium}/>
          <XAxis
            type="number"
            dataKey="x"
            name="Overall Progress"
            unit="%"
            tick={{ fill: UI_THEME_COLORS.textMedium, fontSize: 12, fontFamily: 'Inter, sans-serif' }}
            domain={[0, 100]}
            axisLine={{stroke: UI_THEME_COLORS.borderPrimary, strokeOpacity: 0.4}}
            tickLine={{stroke: UI_THEME_COLORS.borderPrimary, strokeOpacity: 0.4}}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Budget Utilization"
            unit="%"
            tick={{ fill: UI_THEME_COLORS.textMedium, fontSize: 12, fontFamily: 'Inter, sans-serif' }}
            domain={[dataMin => Math.max(0, dataMin -10), dataMax => Math.min(150, dataMax + 10)]} 
            axisLine={{stroke: UI_THEME_COLORS.borderPrimary, strokeOpacity: 0.4}}
            tickLine={{stroke: UI_THEME_COLORS.borderPrimary, strokeOpacity: 0.4}}
          />
          <ZAxis type="number" dataKey="z" range={[80, 700]} name="Units Sold Value" unit="" />
          <Tooltip
            cursor={{ strokeDasharray: '4 4', strokeOpacity: 0.3, stroke: UI_THEME_COLORS.accentMuted }}
            content={<CustomTooltip />}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: UI_THEME_COLORS.textMedium, fontFamily: 'Inter, sans-serif', paddingTop: '15px' }} 
            iconSize={10} 
            iconType="circle"
            formatter={(value) => <span style={{color: UI_THEME_COLORS.textMedium, marginLeft: '4px'}}>{value}</span>}
          />

          {uniqueProjectTypes.map((type) => {
            const safeType = typeof type === 'string' ? type : 'Unknown Type';
            const typeColor = projectTypeColors[type as ProjectType] || UI_THEME_COLORS.charts.cream;
            return (
              <Scatter
                key={safeType}
                name={safeType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                data={chartData.filter(p => p.type === type)}
                shape="circle"
                onClick={(props) => {
                  if (props && props.id) {
                      const clickedProject = data.find(p => p.id === props.id);
                      if (clickedProject) {
                          onPointClick(clickedProject);
                      }
                  }
                }}
              >
                {chartData.filter(p => p.type === type).map((entry, index) => (
                  <Cell 
                    key={`cell-${safeType}-${index}`} 
                    fill={typeColor} 
                    stroke={UI_THEME_COLORS.bgDeep} 
                    strokeWidth={0.75}
                    opacity={0.8} 
                  />
                ))}
              </Scatter>
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};