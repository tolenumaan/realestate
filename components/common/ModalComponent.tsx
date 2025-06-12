

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UI_THEME_COLORS } from '../../constants';

interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const ModalComponent: React.FC<ModalComponentProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-brand-bg-deep bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 md:p-10 transition-opacity duration-300 ease-in-out animate-fadeIn" // Overlay blur
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-brand-bg-surface/70 backdrop-blur-xl backdrop-saturate-150 rounded-xl shadow-2xl w-[85vw] max-w-screen-xl max-h-[90vh] flex flex-col border border-brand-text-light/20 animate-slideUp" // Modal panel glass
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-7 border-b border-brand-text-light/10">
          <h3 className="text-3xl font-heading font-semibold text-brand-text-light">{title}</h3>
          <button
            onClick={onClose}
            className="text-brand-text-medium hover:text-brand-accent transition-colors p-1.5 rounded-full hover:bg-brand-primary/40"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>
        <div className="p-7 md:p-9 overflow-y-auto styled-scrollbar flex-grow">
          {children}
        </div>
        <div className="p-6 bg-brand-bg-deep/40 backdrop-blur-sm border-t border-brand-text-light/10 flex justify-end space-x-5 rounded-b-xl"> {/* Footer glass */}
            <button
                onClick={onClose}
                className="px-7 py-3 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg text-base font-medium transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-opacity-50"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};