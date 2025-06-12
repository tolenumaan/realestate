

import React from 'react';
import { UI_THEME_COLORS } from '../../constants';

export interface ColumnDefinition<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string; // e.g., 'w-1/4', 'min-w-[150px]'
}

interface TableComponentProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  title?: string;
  keyExtractor: (item: T) => string | number;
  maxHeight?: string;
  onRowClick?: (item: T) => void;
}

export const TableComponent = <T extends object,>(
  { data, columns, title, keyExtractor, maxHeight = 'max-h-[550px]', onRowClick }: TableComponentProps<T>
) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 shadow-lg rounded-xl p-8 border border-brand-text-light/15">
        {title && <h3 className="text-xl font-heading font-medium text-brand-text-light mb-5">{title}</h3>}
        <p className="text-brand-text-medium text-center py-8 font-sans italic text-base">No data available to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 shadow-xl rounded-xl border border-brand-text-light/15 overflow-hidden">
      {title && <h3 className="text-xl font-heading font-medium text-brand-text-light p-7 pb-5">{title}</h3>}
      <div className={`overflow-x-auto ${maxHeight} overflow-y-auto styled-scrollbar`}>
        <table className="min-w-full divide-y divide-brand-text-light/10">
          <thead className="bg-brand-bg-deep/50 backdrop-blur-md sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  scope="col"
                  className={`px-7 py-4 text-left text-xs font-semibold font-sans text-brand-accent-muted uppercase tracking-wider ${col.width ? col.width : ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-text-light/10">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={`transition-colors duration-150 ease-in-out 
                  ${onRowClick ? 'cursor-pointer hover:bg-brand-primary/30' : 'hover:bg-brand-bg-surface-light/20'}`}
                onClick={() => onRowClick && onRowClick(item)}
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyPress={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    onRowClick(item);
                  }
                }}
              >
                {columns.map((col) => (
                  <td
                    key={`${keyExtractor(item)}-${String(col.key)}`}
                    className="px-7 py-4.5 whitespace-nowrap text-base text-brand-text-light font-sans"
                  >
                    {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};