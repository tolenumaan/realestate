

import React from 'react';
import { UI_THEME_COLORS } from '../constants'; // UI_THEME_COLORS can still be used for dynamic parts or fallbacks

interface DashboardCardProps {
  title: string;
  value?: string | number;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  icon?: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title, value, description, children, className, icon: Icon, trend, trendValue, onClick
}) => {
  const trendColorClass = trend === 'up' ? 'text-brand-success' : trend === 'down' ? 'text-brand-danger' : 'text-brand-text-medium';
  const TrendIcon = trend === 'up' ? ArrowUpIcon : trend === 'down' ? ArrowDownIcon : null;

  const cardBaseClasses = "bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 shadow-xl rounded-xl p-7 border border-brand-text-light/15 transition-all duration-300 ease-in-out relative overflow-hidden";
  const interactiveClasses = onClick 
    ? "cursor-pointer hover:shadow-brand-accent/30 hover:border-brand-accent-muted/40 hover:transform hover:-translate-y-0.5" 
    : "hover:shadow-brand-primary/20";

  return (
    <div
      className={`${cardBaseClasses} ${interactiveClasses} ${className || ''}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-2xl font-heading font-semibold text-brand-text-light leading-tight">{title}</h3>
        {Icon && <Icon className="h-8 w-8 text-brand-accent-muted opacity-80" />}
      </div>
      
      {value !== undefined && (
        <p className="text-5xl font-sans font-bold text-brand-accent mb-2">{value}</p>
      )}
      
      {description && (
        <p className="text-base text-brand-text-medium font-light mb-4">{description}</p>
      )}
      
      {trend && trendValue && TrendIcon && (
        <div className={`mt-4 flex items-center text-sm ${trendColorClass}`}>
          <TrendIcon className="h-4.5 w-4.5 mr-2" />
          <span className="font-semibold">{trendValue}</span>
          <span className="text-brand-text-medium/80 ml-2">vs last period</span>
        </div>
      )}
      
      {children && <div className="mt-6 pt-5 border-t border-brand-border-primary/40">{children}</div>}
    </div>
  );
};

// Slimmer arrows, more refined
const ArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5l7.5-7.5 7.5 7.5" />
  </svg>
);

const ArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5l-7.5 7.5-7.5-7.5" />
  </svg>
);