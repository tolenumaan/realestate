

import React, { useState, useMemo } from 'react';
import { ReportingDecisionSupportModule, ProjectHealthMetric, ProfitabilityData, GeneratedReport, PlatformData } from '../../types';
import { FeatureCard } from '../common/FeatureCard';
import { TableComponent, ColumnDefinition } from '../common/TableComponent';
import { SimpleBarChart } from '../charts/SimpleBarChart';
import { SimplePieChart } from '../charts/SimplePieChart';
import { ModalComponent } from '../common/ModalComponent';
import { DetailViewDisplay } from '../common/DetailViewDisplay';
import { FEATURE_ICONS, UI_THEME_COLORS } from '../../constants';
import { DocumentChartBarIcon, PresentationChartLineIcon, ChartPieIcon, CalculatorIcon, InformationCircleIcon, LightBulbIcon } from '@heroicons/react/24/outline';


interface ReportingDecisionSupportDashboardProps {
  reportingModule: ReportingDecisionSupportModule;
  platformData?: PlatformData;
  searchTerm: string;
}

type ModalItem = ProjectHealthMetric | ProfitabilityData | GeneratedReport;

interface ForecastInputs {
  salesVelocityChange: number;
  constructionCostIncrease: number;
  marketValueAppreciation: number;
}

interface ForecastResults {
  newProjectedPortfolioValue: number;
  adjustedAverageProjectProfitMargin: number;
  estimatedChangeInTimeToSellOutDays: number;
}

const filterData = <T extends object,>(data: T[], searchTerm: string, keysToSearch: (keyof T | string)[]) => {
  if (!searchTerm) return data;
  const lowerSearchTerm = searchTerm.toLowerCase();
  return data.filter(item =>
    keysToSearch.some(key => {
      const value = item[key as keyof T];
      if (typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm)) return true;
      if (typeof value === 'number' && value.toString().toLowerCase().includes(lowerSearchTerm)) return true;
      return false;
    })
  );
};

const HealthIndicatorBadge: React.FC<{ indicator: ProjectHealthMetric['healthIndicator'] }> = ({ indicator }) => {
  let bgColor = UI_THEME_COLORS.status.planning; let textColor = UI_THEME_COLORS.textDark;
  if (indicator === 'Green') {bgColor = UI_THEME_COLORS.status.completed; textColor = UI_THEME_COLORS.textLight;}
  else if (indicator === 'Amber') {bgColor = UI_THEME_COLORS.status.warning; textColor = UI_THEME_COLORS.textDark;} 
  else if (indicator === 'Red') {bgColor = UI_THEME_COLORS.status.critical; textColor = UI_THEME_COLORS.textLight;}
  else {textColor = UI_THEME_COLORS.textLight;}
  return <span style={{backgroundColor: bgColor, color: textColor}} className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm`}>{indicator}</span>;
};


export const ReportingDecisionSupportDashboard: React.FC<ReportingDecisionSupportDashboardProps> = ({ reportingModule, platformData, searchTerm }) => {
  const { projectHealthDashboard, profitabilityAnalysis, investorBankReporting } = reportingModule.features;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ModalItem | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  const [forecastInputs, setForecastInputs] = useState<ForecastInputs>({ salesVelocityChange: 0, constructionCostIncrease: 0, marketValueAppreciation: 0 });
  const [forecastResults, setForecastResults] = useState<ForecastResults | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setForecastInputs(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) || 0 }));

  const runForecast = () => {
    if (!platformData || !platformData.overallProjects || platformData.overallProjects.length === 0) {
        setForecastResults({ newProjectedPortfolioValue: 0, adjustedAverageProjectProfitMargin: 0, estimatedChangeInTimeToSellOutDays: 0 });
        return;
    }
    let currentPortfolioValue = 0, currentTotalBudget = 0, currentTotalProjectedRevenue = 0;
    platformData.overallProjects.forEach(p => {
        const projectValue = p.units.reduce((sum, u) => sum + u.currentPrice, 0);
        currentPortfolioValue += projectValue;
        currentTotalBudget += p.units.reduce((sum, u) => sum + u.initialPrice, 0); 
        currentTotalProjectedRevenue += projectValue; 
    });
    
    currentTotalBudget = currentTotalBudget || 1; 
    currentTotalProjectedRevenue = currentTotalProjectedRevenue || 1;

    const appreciationFactor = 1 + (forecastInputs.marketValueAppreciation / 100);
    const costIncreaseFactor = 1 + (forecastInputs.constructionCostIncrease / 100);
    
    const newProjectedPortfolioValue = (currentTotalProjectedRevenue * appreciationFactor) - (currentTotalBudget * (costIncreaseFactor -1)); 
    
    const newTotalCost = currentTotalBudget * costIncreaseFactor;
    const newTotalRevenue = currentTotalProjectedRevenue * appreciationFactor;
    const newTotalProfit = newTotalRevenue - newTotalCost;
    const adjustedAverageProjectProfitMargin = newTotalRevenue > 0 ? (newTotalProfit / newTotalRevenue) * 100 : 0;
    
    let estimatedChangeInTimeToSellOutDays = 0; 
    if (forecastInputs.salesVelocityChange !== 0) {
        const velocityFactor = 1 + (forecastInputs.salesVelocityChange / 100);
        estimatedChangeInTimeToSellOutDays = velocityFactor > 0 ? ((1 / velocityFactor) - 1) * 100 : 200; 
    }
    setForecastResults({ newProjectedPortfolioValue, adjustedAverageProjectProfitMargin, estimatedChangeInTimeToSellOutDays });
  };

  const handleRowClick = <T extends ModalItem>(item: T, titlePrefix: string, identifierKey: keyof T) => {
    const mainIdentifierValue = item[identifierKey];
    let displayString = (mainIdentifierValue !== null && mainIdentifierValue !== undefined) ? String(mainIdentifierValue) :
                        ((item as any).id || (item as any).projectName || (item as any).reportName || 'Detail');
    setSelectedItem(item);
    setModalTitle(`${titlePrefix}: ${displayString}`);
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setSelectedItem(null); setModalTitle(''); };

  const filteredHealthMetrics = useMemo(() => filterData(projectHealthDashboard.sampleProjectHealthMetrics, searchTerm, ['projectName', 'healthIndicator', 'cashFlowStatus']), [projectHealthDashboard.sampleProjectHealthMetrics, searchTerm]);
  const filteredProfitabilityData = useMemo(() => filterData(profitabilityAnalysis.sampleProfitabilityData, searchTerm, ['projectName', 'period']), [profitabilityAnalysis.sampleProfitabilityData, searchTerm]);
  const filteredReports = useMemo(() => filterData(investorBankReporting.sampleReports, searchTerm, ['reportName', 'reportType', 'generatedFor', 'status']), [investorBankReporting.sampleReports, searchTerm]);

  const healthMetricsColumns: ColumnDefinition<ProjectHealthMetric>[] = [
    { key: 'projectName', header: 'Project', render: item => <span className="font-semibold text-brand-accent text-base">{item.projectName}</span> }, { key: 'healthIndicator', header: 'Health', render: item => <HealthIndicatorBadge indicator={item.healthIndicator} /> },
    { key: 'completionPercentage', header: 'Progress %', render: item => `${item.completionPercentage}%` }, { key: 'unitsSold', header: 'Units Sold', render: item => `${item.unitsSold}/${item.totalUnits}` },
    { key: 'revenueCollected', header: 'Revenue', render: item => `$${(item.revenueCollected/1000000).toFixed(1)}M / $${(item.targetRevenue/1000000).toFixed(1)}M` },
    { key: 'budgetSpent', header: 'Budget Used', render: item => `$${(item.budgetSpent/1000000).toFixed(1)}M / $${(item.totalBudget/1000000).toFixed(1)}M` }, { key: 'cashFlowStatus', header: 'Cash Flow', render: item => <span className="text-sm">{item.cashFlowStatus}</span> },
  ];

  const profitabilityColumns: ColumnDefinition<ProfitabilityData>[] = [
    { key: 'projectName', header: 'Project', render: item => <span className="font-semibold text-brand-accent text-base">{item.projectName}</span> }, { key: 'period', header: 'Period', render: item => <span className="text-sm">{item.period}</span> }, { key: 'totalRevenue', header: 'Total Revenue', render: item => `$${item.totalRevenue.toLocaleString()}` },
    { key: 'grossProfit', header: 'Gross Profit', render: item => `$${item.grossProfit.toLocaleString()}` }, { key: 'netProfit', header: 'Net Profit', render: item => `$${item.netProfit.toLocaleString()}` }, { key: 'roiPercentage', header: 'ROI', render: item => `${item.roiPercentage.toFixed(1)}%` },
  ];

  const reportColumns: ColumnDefinition<GeneratedReport>[] = [
    { key: 'reportName', header: 'Report Name', render: item => <span className="font-medium text-base">{item.reportName}</span> }, { key: 'reportType', header: 'Type', render: item => <span className="text-sm">{item.reportType}</span> }, { key: 'generatedFor', header: 'For', render: item => <span className="text-sm">{item.generatedFor}</span> }, { key: 'generationDate', header: 'Generated On', render: item => <span className="text-sm">{item.generationDate}</span> }, { key: 'status', header: 'Status', render: item => <span className="text-sm">{item.status}</span> },
  ];

  const projectHealthDistribution = Object.entries(projectHealthDashboard.sampleProjectHealthMetrics.reduce((acc, p) => { acc[p.healthIndicator] = (acc[p.healthIndicator] || 0) + 1; return acc; }, {} as Record<ProjectHealthMetric['healthIndicator'], number>)).map(([name, value]) => ({ name, value }));
  const topPerformingProjects = profitabilityAnalysis.sampleProfitabilityData.sort((a,b) => b.netProfit - a.netProfit).slice(0,5).map(p => ({ name: p.projectName.substring(0,15)+'...', netProfit: p.netProfit / 1000000 }));

  return (
    <div className="space-y-12">
      <header className="pb-3">
        <h2 className="text-5xl font-heading font-semibold text-brand-text-light flex items-center">
            <DocumentChartBarIcon className="h-11 w-11 mr-5 text-brand-accent"/>
            {reportingModule.moduleName}
        </h2>
        <p className="text-xl text-brand-text-medium font-light ml-[66px] mt-1.5">Transforming Data into Strategic Imperatives</p>
      </header>

      <section className="bg-brand-bg-deep/40 backdrop-blur-lg backdrop-saturate-150 shadow-2xl rounded-2xl p-8 border border-brand-text-light/10">
        <div className="flex items-start mb-6">
           <IconFeature iconKey="ProjectHealthDashboard" large />
           <div className="ml-1.5">
            <h3 className="text-3xl font-heading font-semibold text-brand-text-light">{projectHealthDashboard.name}</h3>
            <p className="text-lg text-brand-text-medium font-light mt-1.5">{projectHealthDashboard.description}</p>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                 <TableComponent title="All Projects Health Status" data={filteredHealthMetrics} columns={healthMetricsColumns} keyExtractor={(item) => item.id} maxHeight="max-h-[380px]" onRowClick={(item) => handleRowClick(item, 'Project Health Details', 'projectName')}/>
            </div>
            <div>
                 <SimplePieChart title="Health Distribution" data={projectHealthDistribution} height={380} />
            </div>
        </div>
      </section>

      <section className="bg-brand-bg-deep/40 backdrop-blur-lg backdrop-saturate-150 shadow-2xl rounded-2xl p-8 border border-brand-text-light/10">
        <div className="flex items-start mb-6">
           <IconFeature iconKey="ProfitabilityAnalysis" large />
           <div className="ml-1.5">
            <h3 className="text-3xl font-heading font-semibold text-brand-text-light">{profitabilityAnalysis.name}</h3>
            <p className="text-lg text-brand-text-medium font-light mt-1.5">Data Source: {profitabilityAnalysis.dataSource}</p>
           </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                 <TableComponent title="Project Profitability Overview" data={filteredProfitabilityData} columns={profitabilityColumns} keyExtractor={(item) => item.projectId} maxHeight="max-h-[380px]" onRowClick={(item) => handleRowClick(item, 'Profitability Details', 'projectName')}/>
            </div>
            <div>
                 <SimpleBarChart title="Top 5 Project Profit (Net, $M)" data={topPerformingProjects} xAxisKey="name" barKeys={[{key: 'netProfit', name: 'Net Profit ($M)', color: UI_THEME_COLORS.charts.gold1}]} height={380}/>
            </div>
        </div>
      </section>

      <section className="bg-brand-bg-deep/40 backdrop-blur-lg backdrop-saturate-150 shadow-2xl rounded-2xl p-8 border border-brand-text-light/10">
        <div className="flex items-start mb-6">
           <IconFeature iconKey="ScenarioForecasting" large />
           <div className="ml-1.5">
            <h3 className="text-3xl font-heading font-semibold text-brand-text-light">Scenario-Based Forecasting Tool</h3>
            <p className="text-lg text-brand-text-medium font-light mt-1.5">Explore potential outcomes based on changing market and operational factors. (Simplified Model)</p>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-brand-bg-surface/50 backdrop-blur-md p-7 rounded-xl border border-brand-text-light/10">
                <h4 className="text-xl font-heading font-medium text-brand-text-light mb-5">Input Variables:</h4>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="salesVelocityChange" className="block text-base font-medium text-brand-text-medium">Sales Velocity Change (%)</label>
                        <input type="number" name="salesVelocityChange" id="salesVelocityChange" value={forecastInputs.salesVelocityChange} onChange={handleInputChange} className="mt-1.5 block w-full bg-brand-bg-surface border-brand-border-primary text-brand-text-light rounded-lg shadow-sm focus:ring-2 focus:ring-brand-accent focus:border-brand-accent sm:text-base p-3.5"/>
                    </div>
                    <div>
                        <label htmlFor="constructionCostIncrease" className="block text-base font-medium text-brand-text-medium">Construction Cost Increase (%)</label>
                        <input type="number" name="constructionCostIncrease" id="constructionCostIncrease" value={forecastInputs.constructionCostIncrease} onChange={handleInputChange} className="mt-1.5 block w-full bg-brand-bg-surface border-brand-border-primary text-brand-text-light rounded-lg shadow-sm focus:ring-2 focus:ring-brand-accent focus:border-brand-accent sm:text-base p-3.5"/>
                    </div>
                    <div>
                        <label htmlFor="marketValueAppreciation" className="block text-base font-medium text-brand-text-medium">Market Value Appreciation (%)</label>
                        <input type="number" name="marketValueAppreciation" id="marketValueAppreciation" value={forecastInputs.marketValueAppreciation} onChange={handleInputChange} className="mt-1.5 block w-full bg-brand-bg-surface border-brand-border-primary text-brand-text-light rounded-lg shadow-sm focus:ring-2 focus:ring-brand-accent focus:border-brand-accent sm:text-base p-3.5"/>
                    </div>
                </div>
                 <button onClick={runForecast} className="mt-9 w-full px-7 py-3.5 bg-brand-accent hover:bg-brand-accent-muted text-brand-text-dark rounded-lg text-base font-semibold transition-colors duration-200 flex items-center justify-center shadow-md hover:shadow-lg">
                    <LightBulbIcon className="h-5 w-5 mr-3"/> Run Forecast
                </button>
            </div>
            {forecastResults && (
              <div className="bg-brand-bg-surface/50 backdrop-blur-md p-7 rounded-xl border border-brand-accent-muted/30 shadow-lg">
                <h4 className="text-xl font-heading font-medium text-brand-text-light mb-5">Forecasted Impact:</h4>
                <div className="space-y-5">
                    <div className="text-base">
                        <p className="text-brand-text-medium">New Projected Portfolio Value:</p>
                        <p className="font-sans font-semibold text-4xl text-brand-success mt-1">${forecastResults.newProjectedPortfolioValue.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                    </div>
                     <div className="text-base">
                        <p className="text-brand-text-medium">Adjusted Avg. Project Profit Margin:</p>
                        <p className="font-sans font-semibold text-4xl text-brand-info mt-1">{forecastResults.adjustedAverageProjectProfitMargin.toFixed(1)}%</p>
                    </div>
                     <div className="text-base">
                        <p className="text-brand-text-medium">Est. Change in Time to Sell Out:</p>
                        <p className={`font-sans font-semibold text-4xl mt-1 ${forecastResults.estimatedChangeInTimeToSellOutDays < 0 ? 'text-brand-success' : forecastResults.estimatedChangeInTimeToSellOutDays > 0 ? 'text-brand-danger' : 'text-brand-text-medium'}`}>
                            {forecastResults.estimatedChangeInTimeToSellOutDays !== 0 ? `${Math.abs(forecastResults.estimatedChangeInTimeToSellOutDays).toFixed(1)}% ${forecastResults.estimatedChangeInTimeToSellOutDays < 0 ? 'Faster' : 'Slower'}` : 'No Change'}
                        </p>
                    </div>
                </div>
              </div>
            )}
        </div>
      </section>

      <FeatureCard title={investorBankReporting.name} description={investorBankReporting.description} iconKey="InvestorBankReporting" capabilities={investorBankReporting.reportTypes} benefits={investorBankReporting.benefits}>
        <TableComponent title="Generated Reports Log" data={filteredReports} columns={reportColumns} keyExtractor={(item) => item.id} maxHeight="max-h-[330px]" onRowClick={(item) => handleRowClick(item, 'Report Details', 'reportName')}/>
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