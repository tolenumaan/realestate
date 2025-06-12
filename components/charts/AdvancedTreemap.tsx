

import React from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { TreemapChartNode, ProjectType } from '../../types';
import { CHART_COLORS, UI_THEME_COLORS } from '../../constants';

interface AdvancedTreemapProps {
  data: TreemapChartNode[];
  onNodeClick: (node: TreemapChartNode) => void;
  title?: string;
  height?: number;
}

const CustomizedTreemapContent = (props: any) => {
  const { depth, x, y, width, height, name, value, originalProject, projectType, customOnNodeClick, index } = props;
  const [isHovered, setIsHovered] = React.useState(false);

  const colorPalette = [
    UI_THEME_COLORS.charts.aubergine1,
    UI_THEME_COLORS.charts.gold1,
    UI_THEME_COLORS.charts.aubergine2,
    UI_THEME_COLORS.charts.gold2,
    UI_THEME_COLORS.charts.mutedBlue,
    UI_THEME_COLORS.charts.mutedGreen,
    UI_THEME_COLORS.charts.cream,
    UI_THEME_COLORS.charts.silver,
  ];
  const fill = colorPalette[index % colorPalette.length];
  
  const textColor = UI_THEME_COLORS.textLight;

  const isLeafNode = !!originalProject;

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleClick = () => {
    if (isLeafNode && customOnNodeClick) {
      customOnNodeClick({ name, size: value, originalProject, projectType });
    }
  };

  const safeName = typeof name === 'string' ? name : '';

  if (width < 25 || height < 25) { 
    return (
       <g>
        <rect
          x={x} y={y} width={width} height={height}
          rx={4} ry={4} 
          style={{
            fill: fill,
            stroke: UI_THEME_COLORS.bgDeep, 
            strokeWidth: 1.5,
            opacity: isLeafNode && isHovered ? 0.85 : 0.95,
            filter: isLeafNode && isHovered ? `brightness(1.35) drop-shadow(0 0 5px ${UI_THEME_COLORS.accentMuted})` : 'brightness(1)',
            transition: 'all 0.25s ease-in-out',
            cursor: isLeafNode ? 'pointer' : 'default',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
      </g>
    );
  }

  const baseFontSize = 15;
  let nameFontSize = depth === 1 ? baseFontSize * 1.15 : baseFontSize * 0.9;
  let valueFontSize = depth === 1 ? baseFontSize * 0.85 : baseFontSize * 0.75;

  nameFontSize = Math.max(11, Math.min(nameFontSize, width / (safeName.length * 0.40 || 1), height / 2.2)); 
  valueFontSize = Math.max(10, Math.min(valueFontSize, width / 7, height / 3.2));


  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={depth === 1 ? 8 : 5} 
        ry={depth === 1 ? 8 : 5}
        style={{
          fill: fill,
          stroke: UI_THEME_COLORS.bgDeep, 
          strokeWidth: depth === 1 ? 2.5 : 1.8,
          opacity: isHovered ? (isLeafNode ? 0.8 : 0.9) : 1, 
          filter: isHovered ? (isLeafNode ? `brightness(1.4) drop-shadow(0 0 8px ${UI_THEME_COLORS.accent})` : 'brightness(1.25)') : 'brightness(1)',
          transition: 'all 0.3s ease-in-out',
          cursor: isLeafNode ? 'pointer' : 'default',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
      {width > 45 && height > 30 && ( 
        <foreignObject x={x + 8} y={y + 8} width={width - 16} height={height - 16} style={{ overflow: 'hidden', pointerEvents: 'none' }}>
          <div
            style={{
              width: `${width - 16}px`,
              height: `${height - 16}px`,
              color: textColor,
              fontFamily: depth === 1 ? '"Helvetica Neue", Helvetica, Arial, sans-serif' : 'Inter, sans-serif',
              fontSize: `${nameFontSize}px`,
              fontWeight: depth === 1 ? '700' : '500',
              lineHeight: '1.3',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: depth === 1 || (isLeafNode && height > 55) ? 'space-between' : 'flex-start', 
              padding: '3px',
            }}
          >
            <span style={{ display: 'block', whiteSpace: 'normal', wordBreak: 'break-word', textOverflow: 'ellipsis', overflow: 'hidden', maxHeight: `${height - 16 - (valueFontSize + 10)}px` }}>
              {safeName}
            </span>
            {( (depth === 1 && width > 90 && height > 45) || (isLeafNode && width > 70 && height > 40) ) && value && (
              <span style={{ fontSize: `${valueFontSize}px`, opacity: 0.9, display: 'block', marginTop: 'auto', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                ${value.toLocaleString()}
              </span>
            )}
          </div>
        </foreignObject>
      )}
    </g>
  );
};

const CustomTooltipContent = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; 
    return (
      <div className="bg-brand-bg-deep/90 backdrop-blur-sm p-4.5 rounded-lg border border-brand-border-accent/50 shadow-2xl text-sm font-sans">
        <h4 className="font-heading font-semibold text-brand-accent text-lg mb-2">{data.name}</h4>
        <p className="text-brand-text-medium">Value: <span className="text-brand-text-light">${data.value.toLocaleString()}</span></p>
        {data.originalProject && <p className="text-brand-text-medium">Type: <span className="text-brand-text-light capitalize">{data.originalProject.type}</span></p>}
        {data.originalProject && <p className="text-brand-text-medium">Health: <span className="text-brand-text-light">{data.originalProject.financialHealth}</span></p>}
      </div>
    );
  }
  return null;
};


export const AdvancedTreemap: React.FC<AdvancedTreemapProps> = ({ data, onNodeClick, title, height = 450 }) => {
   if (!data || data.length === 0) {
    return (
      <div className="bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 shadow-xl rounded-xl p-7 border border-brand-text-light/15">
        {title && <h3 className="text-2xl font-heading font-semibold text-brand-text-light mb-6">{title}</h3>}
        <p className="text-brand-text-medium text-center py-8 font-sans italic text-base">No data available for treemap.</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 shadow-xl rounded-xl p-7 border border-brand-text-light/15 transition-all duration-300 hover:shadow-brand-accent/20 hover:border-brand-accent-muted/40">
      {title && <h3 className="text-2xl font-heading font-semibold text-brand-text-light mb-6">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <Treemap
          data={data}
          dataKey="size"
          aspectRatio={16 / 9} 
          stroke={UI_THEME_COLORS.bgDeep} 
          isAnimationActive={true}
          animationDuration={1200}
          animationEasing="ease-out"
          content={<CustomizedTreemapContent customOnNodeClick={onNodeClick} />}
        >
          <Tooltip content={<CustomTooltipContent />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};