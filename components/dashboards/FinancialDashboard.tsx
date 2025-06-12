

import React, { useState, useMemo } from 'react';
import { FinancialPaymentPlanModule, CashFlowDataPoint, ExpenseItem, PaymentPlanStructure, PaymentPlanInstallment, Invoice } from '../../types';
import { FeatureCard } from '../common/FeatureCard';
import { SimpleLineChart } from '../charts/SimpleLineChart';
import { SimpleBarChart } from '../charts/SimpleBarChart';
import { TableComponent, ColumnDefinition } from '../common/TableComponent';
import { ModalComponent } from '../common/ModalComponent';
import { DetailViewDisplay } from '../common/DetailViewDisplay';
import { CurrencyDollarIcon, CreditCardIcon, CheckBadgeIcon, DocumentTextIcon, CalendarDaysIcon, UserCircleIcon, PresentationChartLineIcon, BanknotesIcon, ChartPieIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { FEATURE_ICONS, CHART_COLORS, UI_THEME_COLORS } from '../../constants';


interface FinancialDashboardProps {
  financialModule: FinancialPaymentPlanModule;
  searchTerm: string;
}

type ModalItem = PaymentPlanStructure | Invoice | ExpenseItem;

const filterData = <T extends object,>(data: T[], searchTerm: string, keysToSearch: (keyof T | string)[]) => {
  if (!searchTerm) return data;
  const lowerSearchTerm = searchTerm.toLowerCase();
  return data.filter(item =>
    keysToSearch.some(key => {
      const value = item[key as keyof T];
      if (typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm)) return true;
      if (typeof value === 'number' && value.toString().toLowerCase().includes(lowerSearchTerm)) return true;
      if ((key === 'invoiceNumber' || key === 'supplierName' || key === 'paymentStatus') && typeof value === 'string') return value.toLowerCase().includes(lowerSearchTerm);
      return false;
    })
  );
};

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ financialModule, searchTerm }) => {
  const { dynamicPaymentPlanCreator, realTimeCashFlowDashboard, invoiceTracking, budgetVsActuals } = financialModule.features;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ModalItem | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  const handleRowClick = (item: ModalItem, title: string) => {
    setSelectedItem(item);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setModalTitle('');
  };

  const renderInstallmentSummary = (installments: PaymentPlanInstallment[]) => {
    if (!installments || installments.length === 0) return "N/A";
    const first = installments[0];
    const totalPercentage = installments.reduce((sum, inst) => sum + inst.percentage, 0);
    return `${installments.length} Installments: ${first.milestone} (${first.percentage}%), Total ${totalPercentage}%`;
  };

  const filteredPaymentPlans = useMemo(() =>
    filterData(dynamicPaymentPlanCreator.samplePaymentPlans, searchTerm, ['planName']),
    [dynamicPaymentPlanCreator.samplePaymentPlans, searchTerm]
  );

  const filteredInvoices = useMemo(() =>
    filterData(invoiceTracking.sampleInvoices, searchTerm, ['invoiceNumber', 'buyerName', 'unitId', 'status', 'amountDue', 'paymentMethod', 'installmentMilestone']),
    [invoiceTracking.sampleInvoices, searchTerm]
  );

  const filteredExpenses = useMemo(() =>
    filterData(budgetVsActuals.sampleExpenses, searchTerm, ['category', 'budgetItem', 'budgetedAmount', 'actualAmount', 'supplierName', 'invoiceReference', 'paymentStatus']),
    [budgetVsActuals.sampleExpenses, searchTerm]
  );

  const paymentPlanColumns: ColumnDefinition<PaymentPlanStructure>[] = [
    { key: 'planName', header: 'Plan Name', render: item => <span className="font-semibold text-brand-accent text-base">{item.planName}</span>},
    { key: 'installments', header: 'Structure Summary', render: item => <span className="text-sm text-brand-text-medium">{renderInstallmentSummary(item.installments)}</span> },
  ];

  const cashFlowLineData = realTimeCashFlowDashboard.sampleCashFlowData.map(d => ({
    date: d.date,
    ProjectedInflow: d.projectedInflow,
    ActualInflow: d.actualInflow,
  }));
   const cashFlowBarData = realTimeCashFlowDashboard.sampleCashFlowData.map(d => ({
    date: d.date,
    ProjectedOutflow: d.projectedOutflow,
    ActualOutflow: d.actualOutflow,
  }));


  const invoiceColumns: ColumnDefinition<Invoice>[] = [
    { key: 'invoiceNumber', header: 'Invoice #', render: item => <span className="font-medium text-brand-text-light text-base">{item.invoiceNumber}</span> },
    { key: 'buyerName', header: 'Buyer', render: item => <span className="text-sm">{item.buyerName}</span> },
    { key: 'unitId', header: 'Unit ID', render: item => <span className="text-sm">{item.unitId}</span> },
    { key: 'amountDue', header: 'Amount Due', render: item => `$${item.amountDue.toLocaleString()}` },
    { key: 'dueDate', header: 'Due Date', render: item => <span className="text-sm">{item.dueDate}</span>},
    { key: 'status', header: 'Status', render: item => {
        let bgColor = UI_THEME_COLORS.status.planning;
        let textColor = UI_THEME_COLORS.textDark; 
        if (item.status === 'Paid') { bgColor = UI_THEME_COLORS.status.completed; textColor = UI_THEME_COLORS.textLight;}
        else if (item.status === 'Overdue') { bgColor = UI_THEME_COLORS.status.critical; textColor = UI_THEME_COLORS.textLight;}
        else if (item.status === 'Sent') { bgColor = UI_THEME_COLORS.status.inprogress; textColor = UI_THEME_COLORS.textLight;}
        else if (item.status === 'Draft' || item.status === 'Cancelled') { bgColor = UI_THEME_COLORS.status.onhold; textColor = UI_THEME_COLORS.textLight;}
        else { textColor = UI_THEME_COLORS.textLight;}
        return <span style={{backgroundColor: bgColor, color: textColor}} className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm`}>{item.status}</span>
    }},
    { key: 'paymentMethod', header: 'Method', render: item => item.paymentMethod ? <CreditCardIcon className="h-5.5 w-5.5 text-brand-accent-muted inline-block" title={item.paymentMethod} /> : <span className="text-sm text-brand-text-medium/70 italic">N/A</span> },
  ];

  const expenseColumns: ColumnDefinition<ExpenseItem>[] = [
    { key: 'budgetItem', header: 'Item', render: item => <span className="font-medium text-brand-text-light text-base">{item.budgetItem}</span> },
    { key: 'category', header: 'Category', render: item => <span className="text-sm">{item.category}</span> },
    { key: 'budgetedAmount', header: 'Budgeted', render: item => `$${item.budgetedAmount.toLocaleString()}` },
    { key: 'actualAmount', header: 'Actual', render: item => `$${item.actualAmount.toLocaleString()}` },
    { key: 'variance', header: 'Variance %', render: item => {
        const varianceClass = item.variance > 0 ? 'text-brand-danger' : item.variance < 0 ? 'text-brand-success' : 'text-brand-text-medium';
        const percentage = item.budgetedAmount !== 0 ? ((item.variance / item.budgetedAmount) * 100).toFixed(1) : '0.0';
        return <span className={`${varianceClass} font-medium text-base`}>{item.variance > 0 ? '+' : ''}{percentage}%</span>
    }},
    { key: 'supplierName', header: 'Supplier', render: item => item.supplierName ? <span className="text-sm">{item.supplierName}</span> : <span className="text-sm text-brand-text-medium/70 italic">N/A</span> },
    { key: 'paymentStatus', header: 'Pay Status', render: item => item.paymentStatus ? <span className={`text-sm capitalize px-2.5 py-1 rounded-md ${item.paymentStatus === 'Paid' ? 'bg-brand-success/80 text-white' : 'bg-brand-secondary/60 text-brand-text-medium'}`}>{item.paymentStatus}</span> : <span className="text-sm text-brand-text-medium/70 italic">N/A</span> }
  ];

  return (
    <div className="space-y-12">
      <header className="pb-3">
        <h2 className="text-5xl font-heading font-semibold text-brand-text-light flex items-center">
            <CurrencyDollarIcon className="h-11 w-11 mr-5 text-brand-accent"/>
            {financialModule.moduleName}
        </h2>
        <p className="text-xl text-brand-text-medium font-light ml-[66px] mt-1.5">Strategic Financial Oversight and Planning</p>
      </header>

      <section className="bg-brand-bg-deep/40 backdrop-blur-lg backdrop-saturate-150 shadow-2xl rounded-2xl p-8 border border-brand-text-light/10">
        <div className="flex items-start mb-6">
           <IconFeature iconKey="RealTimeCashFlowDashboard" large />
           <div className="ml-1.5">
            <h3 className="text-3xl font-heading font-semibold text-brand-text-light">{realTimeCashFlowDashboard.name}</h3>
            <p className="text-lg text-brand-text-medium font-light mt-1.5">Visualizing inflows and outflows over time.</p>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SimpleLineChart
            title="Cash Inflows (Projected vs. Actual)"
            data={cashFlowLineData}
            xAxisKey="date"
            lineKeys={[
                { key: 'ProjectedInflow', name: 'Projected Inflow', color: UI_THEME_COLORS.charts.aubergine2, strokeDasharray: "5 5" },
                { key: 'ActualInflow', name: 'Actual Inflow', color: UI_THEME_COLORS.charts.gold1 },
            ]}
            height={320}
            />
             <SimpleBarChart
                title="Cash Outflows (Projected vs. Actual)"
                data={cashFlowBarData}
                xAxisKey="date"
                barKeys={[
                    {key: 'ProjectedOutflow', name: 'Projected Outflows', color: UI_THEME_COLORS.charts.mutedBlue},
                    {key: 'ActualOutflow', name: 'Actual Outflows', color: UI_THEME_COLORS.charts.aubergine1}
                ]}
                height={320}
            />
        </div>
      </section>

       <FeatureCard
        title={dynamicPaymentPlanCreator.name}
        iconKey="DynamicPaymentPlanCreator"
        capabilities={dynamicPaymentPlanCreator.capabilities}
        benefits={dynamicPaymentPlanCreator.benefits}
      >
        <p className="text-base text-brand-text-medium mb-4 font-light">Interface: {dynamicPaymentPlanCreator.interface}. Milestones include: {dynamicPaymentPlanCreator.milestoneExamples.slice(0,2).join(', ')}.</p>
        <TableComponent
            title="Sample Payment Plan Templates"
            data={filteredPaymentPlans}
            columns={paymentPlanColumns}
            keyExtractor={item => item.planName}
            maxHeight="max-h-[280px]"
            onRowClick={(item) => handleRowClick(item, `Payment Plan Details: ${item.planName}`)}
        />
      </FeatureCard>

      <FeatureCard
        title={invoiceTracking.name}
        iconKey="InvoiceTracking"
        capabilities={invoiceTracking.capabilities}
        benefits={invoiceTracking.benefits}
      >
        <TableComponent
            title="Tracked Invoices"
            data={filteredInvoices}
            columns={invoiceColumns}
            keyExtractor={(item) => item.id}
            maxHeight="max-h-[350px]"
            onRowClick={(item) => handleRowClick(item, `Invoice Details: ${item.invoiceNumber}`)}
        />
      </FeatureCard>

      <FeatureCard
        title={budgetVsActuals.name}
        description={budgetVsActuals.description}
        iconKey="BudgetVsActuals"
        benefits={budgetVsActuals.benefits}
      >
        <TableComponent
            title="Expense Tracking (Budget vs. Actuals)"
            data={filteredExpenses}
            columns={expenseColumns}
            keyExtractor={(item) => `${item.category}-${item.budgetItem}-${item.supplierName || 'internal'}`}
            maxHeight="max-h-[350px]"
            onRowClick={(item) => handleRowClick(item, `Expense Details: ${item.budgetItem}`)}
        />
      </FeatureCard>

      <ModalComponent isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
        <DetailViewDisplay item={selectedItem} />
      </ModalComponent>
    </div>
  );
};

const IconFeature: React.FC<{iconKey: string, large?: boolean}> = ({iconKey, large}) => {
    const Icon = FEATURE_ICONS[iconKey] || InformationCircleIcon;
    return <Icon className={`${large ? 'h-11 w-11' : 'h-9 w-9'} text-brand-accent mr-5 flex-shrink-0`} />;
}