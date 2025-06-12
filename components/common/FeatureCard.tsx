

import React from 'react';
import { FEATURE_ICONS, UI_THEME_COLORS } from '../../constants';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';


interface FeatureCardProps {
  title: string;
  description?: string;
  iconKey?: string;
  benefits?: string[];
  capabilities?: string[];
  children?: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  iconKey,
  benefits,
  capabilities,
  children
}) => {
  const Icon = iconKey ? FEATURE_ICONS[iconKey] : null;

  return (
    <div className="bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 shadow-xl rounded-xl p-8 border border-brand-text-light/15 transition-all duration-300 hover:shadow-brand-accent/25 hover:border-brand-accent-muted/40">
      <div className="flex items-start mb-5">
        {Icon && <Icon className="h-8 w-8 text-brand-accent mr-5 flex-shrink-0 mt-1" /> /* Reduced icon size here */}
        <div>
          <h4 className="text-3xl font-heading font-semibold text-brand-text-light">{title}</h4>
          {description && <p className="text-base text-brand-text-medium mt-2 font-light">{description}</p>}
        </div>
      </div>

      {(capabilities && capabilities.length > 0) && (
        <div className="mt-7">
          <h5 className="text-base font-semibold font-sans text-brand-accent-muted mb-3 tracking-wide">Key Capabilities:</h5>
          <ul className="space-y-2.5 pl-1.5">
            {capabilities.map((cap, index) => (
              <li key={`cap-${index}`} className="text-base text-brand-text-medium flex items-start">
                <CheckBadgeIcon className="h-5 w-5 mr-3 text-brand-accent-muted flex-shrink-0 mt-0.5" /> {/* Changed color */}
                {cap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(benefits && benefits.length > 0) && (
        <div className="mt-7">
          <h5 className="text-base font-semibold font-sans text-brand-accent-muted mb-3 tracking-wide">Core Benefits:</h5>
          <ul className="space-y-2.5 pl-1.5">
            {benefits.map((benefit, index) => (
              <li key={`benefit-${index}`} className="text-base text-brand-text-medium flex items-start">
                 <CheckBadgeIcon className="h-5 w-5 mr-3 text-brand-accent-muted flex-shrink-0 mt-0.5" /> {/* Changed color */}
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {children && <div className="mt-8 pt-7 border-t border-brand-border-primary/50">{children}</div>}
    </div>
  );
};