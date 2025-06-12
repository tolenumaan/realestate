

import React from 'react';
import { MagnifyingGlassIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { UI_THEME_COLORS } from '../constants';

interface HeaderProps {
  platformName: string;
  onSearch: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ platformName, onSearch }) => {
  return (
    <header className="h-24 bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 flex items-center justify-between px-10 border-b border-brand-text-light/10 shadow-lg flex-shrink-0">
      <h2 className="text-3xl font-heading font-semibold text-brand-text-light">{platformName}</h2>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-brand-text-medium absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search platform..."
            className="pl-12 pr-5 py-3 w-96 bg-brand-bg-deep text-brand-text-medium rounded-lg border border-brand-border-primary focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none text-base placeholder-brand-text-medium/70 transition-colors duration-150"
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Search platform"
          />
        </div>
        <button 
          className="p-3 rounded-full hover:bg-brand-primary/50 transition-colors group"
          aria-label="Notifications"
        >
          <BellIcon className="h-6 w-6 text-brand-text-medium group-hover:text-brand-accent transition-colors" />
        </button>
        <button 
          className="p-2.5 rounded-full hover:bg-brand-primary/50 transition-colors group"
          aria-label="User profile"
        >
          <UserCircleIcon className="h-7 w-7 text-brand-text-medium group-hover:text-brand-accent transition-colors" />
        </button>
      </div>
    </header>
  );
};