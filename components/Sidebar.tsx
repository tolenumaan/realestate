

import React from 'react';
import { View } from '../types';
import { NAVIGATION_ITEMS, UI_THEME_COLORS } from '../constants';
import { BuildingStorefrontIcon } from '@heroicons/react/24/solid'; // Using solid for brand icon

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <div className="w-80 bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 text-brand-text-medium flex flex-col border-r border-brand-text-light/10 shadow-2xl">
      <div className="h-28 flex items-center justify-center px-8 border-b border-brand-text-light/10">
         <BuildingStorefrontIcon className="h-12 w-12 text-brand-accent mr-4" />
        <h1 className="text-4xl font-heading font-bold text-brand-text-light tracking-tight">Insignia</h1>
      </div>
      <nav className="flex-1 p-7 space-y-3.5">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.name;
          return (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                setCurrentView(item.name);
              }}
              className={`flex items-center px-5 py-3.5 rounded-lg text-base font-medium transition-all duration-200 ease-in-out group
                ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-lg scale-100' 
                    : 'hover:bg-brand-primary/40 hover:text-brand-text-light hover:shadow-md' 
                }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                className={`h-6 w-6 mr-5 flex-shrink-0 transition-colors duration-200 
                  ${isActive ? 'text-brand-accent' : 'text-brand-text-medium group-hover:text-brand-accent-muted'}`
                } 
              />
              <span className={`transition-colors duration-200 ${isActive ? 'font-semibold' : 'group-hover:text-brand-text-light'}`}>
                {item.name}
              </span>
            </a>
          );
        })}
      </nav>
      <div className="p-8 border-t border-brand-text-light/10">
        <p className="text-sm text-brand-text-medium/75">&copy; {new Date().getFullYear()} Insignia Corp.</p>
        <p className="text-sm text-brand-text-medium/75">Refined Real Estate Intelligence.</p>
      </div>
    </div>
  );
};