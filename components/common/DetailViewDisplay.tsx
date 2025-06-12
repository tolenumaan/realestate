
import React from 'react';
import { MilestoneSubTask, OverviewProjectActivity, CustomField, PaymentAdherenceMetrics } from '../../types';
import { TagIcon } from '@heroicons/react/24/solid';
import { UI_THEME_COLORS } from '../../constants';

interface DetailViewDisplayProps {
  item: object | null;
}

const formatKey = (key: string): string => {
  const result = key.replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1).trim();
};

const isCurrencyKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return ['price', 'amount', 'revenue', 'cost', 'profit', 'earned', 'budget', 'value', 'salary', 'commission', 'latefeeapplied', 'laborcosts', 'partscost', 'totalcost', 'purchasecost'].some(suffix => lowerKey.includes(suffix))
         && !lowerKey.includes('percentage') && !lowerKey.includes('unit');
};

const isPercentageKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return ['percentage', 'progress', 'utilization', 'roi', 'rate', 'share', 'margin'].some(suffix => lowerKey.includes(suffix))
         && !lowerKey.includes('date');
};


const isMilestoneSubTaskArray = (value: any): value is MilestoneSubTask[] => {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'name' in value[0] && 'status' in value[0] && 'assignedTo' in value[0];
};

const isOverviewProjectActivityArray = (value: any): value is OverviewProjectActivity[] => {
  return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'date' in value[0] && 'activity' in value[0] && 'user' in value[0];
};

const isCustomFieldArray = (value: any): value is CustomField[] => {
    return Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'fieldName' in value[0] && 'fieldValue' in value[0] && 'fieldType' in value[0];
};

const isPaymentAdherenceObject = (value: any, key: string): value is PaymentAdherenceMetrics => {
    return key === 'paymentAdherence' && typeof value === 'object' && value !== null && 'onTimePaymentPercentage' in value;
};


const renderValue = (value: any, key: string): React.ReactNode => {
  if (value === null || value === undefined) {
    return <span className="text-brand-text-medium/70 italic font-light text-base">N/A</span>;
  }
  if (typeof value === 'boolean') {
    return value ? <span className="text-brand-success font-medium text-base">Yes</span> : <span className="text-brand-danger font-medium text-base">No</span>;
  }

  const isImageUrl = typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')) && (value.includes('.jpg') || value.includes('.png') || value.includes('picsum.photos') || value.includes('ui-avatars.com'));

  if (key.toLowerCase().includes('url') && isImageUrl) {
    return <img src={value} alt={formatKey(key)} className="max-w-lg w-full max-h-80 rounded-lg my-2.5 object-cover shadow-lg border-2 border-brand-border-accent/30" onError={(e) => (e.currentTarget.style.display = 'none')} />;
  }
   if (key.toLowerCase().includes('url') && (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')))) {
    return <a href={value} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:text-brand-accent-muted hover:underline break-all transition-colors text-base">{value}</a>;
  }

  if (isMilestoneSubTaskArray(value)) {
    return (
      <ul className="space-y-3.5 mt-2">
        {value.map((task: MilestoneSubTask) => (
          <li key={task.id} className="text-base p-4 bg-brand-bg-deep/70 rounded-lg shadow border border-brand-border-primary/60">
            <p className="font-semibold text-brand-text-light">{task.name}</p>
            <p className="text-brand-text-medium">Status: <span className={`font-medium ${task.status === 'Completed' ? 'text-brand-success' : task.status === 'In Progress' ? 'text-brand-info' : 'text-brand-warning'}`}>{task.status}</span></p>
            <p className="text-brand-text-medium">Assigned To: {task.assignedTo}</p>
            {task.dueDate && <p className="text-brand-text-medium/80 text-sm">Due: {task.dueDate}</p>}
          </li>
        ))}
      </ul>
    );
  }

  if (isOverviewProjectActivityArray(value)) {
     return (
      <ul className="space-y-3.5 mt-2">
        {value.map((activity: OverviewProjectActivity, index: number) => (
          <li key={`${key}-${index}`} className="text-base p-4 bg-brand-bg-deep/70 rounded-lg shadow border border-brand-border-primary/60">
            <p className="font-semibold text-brand-text-light">{activity.activity} <span className="text-brand-text-medium font-normal">by {activity.user}</span></p>
            <p className="text-brand-text-medium/80 text-sm">{activity.date}</p>
          </li>
        ))}
      </ul>
    );
  }

  if (key === 'tags' && Array.isArray(value) && value.every(item => typeof item === 'string')) {
    if (value.length === 0) return <span className="text-brand-text-medium/70 italic font-light text-base">None</span>;
    return (
        <div className="flex flex-wrap gap-2.5 mt-2">
            {value.map((tag: string, index: number) => (
                <span key={`${key}-tag-${index}`} className={`px-4 py-2 text-sm font-medium text-brand-accent-muted bg-brand-primary/60 border border-brand-accent-muted/50 rounded-md flex items-center shadow-sm`}>
                    <TagIcon className="h-4 w-4 mr-2 text-brand-accent-muted/80" />
                    {tag}
                </span>
            ))}
        </div>
    );
  }

  if (isCustomFieldArray(value)) {
      return (
          <div className="mt-3 overflow-x-auto styled-scrollbar">
              <table className="min-w-full text-base border border-brand-border-primary/70 rounded-lg shadow-md">
                  <thead className="bg-brand-bg-deep/80">
                      <tr>
                          <th className="px-5 py-3.5 text-left font-semibold text-brand-accent-muted tracking-wide text-sm">Field Name</th>
                          <th className="px-5 py-3.5 text-left font-semibold text-brand-accent-muted tracking-wide text-sm">Value</th>
                          <th className="px-5 py-3.5 text-left font-semibold text-brand-accent-muted tracking-wide text-sm">Type</th>
                      </tr>
                  </thead>
                  <tbody className="bg-brand-bg-deep/50 divide-y divide-brand-border-primary/60">
                      {value.map((field, index) => (
                          <tr key={`${key}-cf-${index}`}>
                              <td className="px-5 py-3 text-brand-text-medium">{field.fieldName}</td>
                              <td className="px-5 py-3 text-brand-text-light">
                                {field.fieldType === 'date' && field.fieldValue instanceof Date ? field.fieldValue.toLocaleDateString() :
                                 field.fieldType === 'boolean' ? (field.fieldValue ? <span className="text-brand-success">Yes</span> : <span className="text-brand-danger">No</span>) :
                                 String(field.fieldValue)}
                              </td>
                              <td className="px-5 py-3 text-brand-text-medium/80 capitalize">{field.fieldType}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-brand-text-medium/70 italic font-light text-base">None</span>;

    if (value.every(item => typeof item === 'string' || typeof item === 'number')) {
      return (
        <ul className="list-disc list-inside space-y-2 pl-1.5 mt-2">
          {value.map((primitiveItem, index) => (
            <li key={`${key}-primitive-${index}`} className="text-brand-text-light text-base">
              {primitiveItem}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <ul className="space-y-4.5 mt-2">
        {value.map((arrItem, index) => (
          <li key={`${key}-${index}`} className="text-base p-4.5 bg-brand-bg-deep/70 rounded-lg shadow border border-brand-border-primary/60">
            {typeof arrItem === 'object' && arrItem !== null ? (
              <div className="space-y-2.5">
                {Object.entries(arrItem).map(([objKey, objValue]) => (
                  <div key={objKey} className="grid grid-cols-1 sm:grid-cols-12 gap-x-3.5 gap-y-1 text-base items-start">
                    <strong className="text-brand-text-medium font-semibold sm:col-span-4 lg:col-span-3">{formatKey(objKey)}:</strong>
                    <div className="text-brand-text-light break-words sm:col-span-8 lg:col-span-9">{renderValue(objValue, objKey)}</div>
                  </div>
                ))}
              </div>
            ) : (
              String(arrItem)
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (isPaymentAdherenceObject(value, key)) {
    return (
        <div className="mt-3 pl-5 py-4 border-l-4 border-brand-accent-muted/60 space-y-2.5 bg-brand-bg-deep/50 rounded-r-lg">
            <p className="text-lg"><strong className="text-brand-text-medium">On-Time Payment:</strong> <span className={`font-semibold ${value.onTimePaymentPercentage >= 80 ? 'text-brand-success' : value.onTimePaymentPercentage >= 50 ? 'text-brand-warning' : 'text-brand-danger'}`}>{value.onTimePaymentPercentage.toFixed(1)}%</span></p>
            <p className="text-base"><strong className="text-brand-text-medium">Average Days Overdue:</strong> {value.averageDaysOverdue.toFixed(1)} days</p>
            <p className="text-base"><strong className="text-brand-text-medium">Installments:</strong> {value.totalInstallments - value.overdueInstallments} paid / {value.totalInstallments} total (<span className="text-brand-warning">{value.overdueInstallments} overdue</span>)</p>
            {value.nextPaymentDueDate && <p className="text-base"><strong className="text-brand-text-medium">Next Due:</strong> {value.nextPaymentDueDate}</p>}
            {value.lastPaymentAmount && <p className="text-base"><strong className="text-brand-text-medium">Last Payment:</strong> ${value.lastPaymentAmount.toLocaleString()} on {value.lastPaymentDate}</p>}
        </div>
    );
  }

  if (typeof value === 'object' && value !== null) {
    if (key === 'budgetRange' && 'min' in value && 'max' in value && typeof value.min === 'number' && typeof value.max === 'number') {
      return <span className="text-brand-text-light text-base">${value.min.toLocaleString('en-US')} - ${value.max.toLocaleString('en-US')}</span>;
    }

    return (
      <div className="mt-3 pl-5 py-4 border-l-4 border-brand-accent-muted/60 space-y-2.5 bg-brand-bg-deep/50 rounded-r-lg">
        {Object.entries(value).map(([objKey, objValue]) => (
          <div key={objKey} className="grid grid-cols-1 sm:grid-cols-12 gap-x-3.5 gap-y-1 text-base items-start">
            <strong className="text-brand-text-medium font-semibold sm:col-span-4 lg:col-span-3">{formatKey(objKey)}:</strong>
            <div className="text-brand-text-light break-words sm:col-span-8 lg:col-span-9">{renderValue(objValue, objKey)}</div>
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === 'number') {
    if (isCurrencyKey(key)) {
      return <span className="text-brand-accent font-medium text-base">{value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits:0 })}</span>;
    }
    if (isPercentageKey(key)) {
      return <span className="text-brand-info font-medium text-base">{value.toFixed(1)}%</span>;
    }
    return <span className="text-brand-text-light text-base">{value.toLocaleString('en-US')}</span>;
  }

  return <span className="text-brand-text-light font-light text-base">{String(value)}</span>;
};

export const DetailViewDisplay: React.FC<DetailViewDisplayProps> = ({ item }) => {
  if (!item) {
    return <p className="text-brand-text-medium italic text-center py-8 text-base">No details available.</p>;
  }

  return (
    <div className="space-y-6 font-sans">
      {Object.entries(item).map(([key, value]) => (
        (key === 'id' || key.toLowerCase().includes('urlidentifier')) ? null : // Hide ID fields or specific internal keys
        <div key={key} className="grid grid-cols-1 md:grid-cols-12 gap-x-5 gap-y-2 py-5 border-b border-brand-border-primary/50 last:border-b-0 last:pb-0 last:mb-0 items-start">
          <strong className="text-lg font-heading font-medium text-brand-accent-muted capitalize md:col-span-4 lg:col-span-3 self-start pt-0.5">{formatKey(key)}:</strong>
          <div className="text-base md:col-span-8 lg:col-span-9 break-words">{renderValue(value, key)}</div>
        </div>
      ))}
    </div>
  );
};