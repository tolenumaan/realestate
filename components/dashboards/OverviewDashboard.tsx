
import React, { useState, useMemo } from 'react';
import { PlatformData, OverviewProject, UnitAvailabilityStatus, ProjectType, TreemapChartNode } from '../../types';
import { DashboardCard } from '../DashboardCard';
import { SimplePieChart } from '../charts/SimplePieChart';
import { ConstellationMap } from '../charts/ConstellationMap';
import { AdvancedTreemap } from '../charts/AdvancedTreemap';
import { TableComponent, ColumnDefinition } from '../common/TableComponent';
import { ModalComponent } from '../common/ModalComponent';
import { DetailViewDisplay } from '../common/DetailViewDisplay';
import { ArrowTrendingUpIcon, BuildingOfficeIcon, CircleStackIcon, ExclamationTriangleIcon, TagIcon as SolidTagIcon, AcademicCapIcon as SolidAcademicCapIcon } from '@heroicons/react/24/solid';
import { UI_THEME_COLORS } from '../../constants';

interface OverviewDashboardProps {
  platformData: PlatformData;
  searchTerm: string;
}

interface ActiveProjectsDetail {
  totalActiveProjects: number;
  statusBreakdown: Record<string, number>;
  averageProgress: string;
  totalUnitsInActiveProjects: number;
  totalSoldUnitsInActiveProjects: number;
}

interface PortfolioValueDetailItem {
  projectName: string;
  estimatedValue: string;
  valueContributionPercentage: string;
}
interface PortfolioValueDetail {
    totalValue: string;
    valueBreakdownByProject: PortfolioValueDetailItem[];
}

interface SalesProgressDetailItem {
  projectName: string;
  progressPercentage: string;
  unitsSold: number;
  totalUnits: number;
}
interface SalesProgressDetail {
  overallSalesPercentage: string;
  totalUnitsOverall: number;
  totalUnitsSold: number;
  totalUnitsReserved: number;
  detailedSalesByProject: SalesProgressDetailItem[];
}

interface ActiveRiskDetailItem {
  riskDescription: string;
  affectedProjects: string[];
  numberOfProjectsAffected: number;
}
interface ActiveRiskDetail {
    totalUniqueRisks: number;
    risks: ActiveRiskDetailItem[];
}

const ProjectStatusBadge: React.FC<{ status: OverviewProject['status'] }> = ({ status }) => {
  let bgColor = UI_THEME_COLORS.status.planning; 
  let textColor = UI_THEME_COLORS.textDark; 
  switch (status) {
    case 'Construction': bgColor = UI_THEME_COLORS.status.inprogress; textColor = UI_THEME_COLORS.textLight; break;
    case 'Sales Phase': bgColor = UI_THEME_COLORS.charts.aubergine2; textColor = UI_THEME_COLORS.textLight; break;
    case 'Completed': bgColor = UI_THEME_COLORS.status.completed; textColor = UI_THEME_COLORS.textLight; break;
    case 'On Hold': bgColor = UI_THEME_COLORS.status.onhold; textColor = UI_THEME_COLORS.textLight; break;
    case 'Pre-Launch': bgColor = UI_THEME_COLORS.status.pipeline; textColor = UI_THEME_COLORS.textLight; break;
    default: textColor = UI_THEME_COLORS.textLight; // default for planning or other greyish status
  }
  return <span style={{ backgroundColor: bgColor, color: textColor }} className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm`}>{status}</span>;
};

const FinancialHealthBadge: React.FC<{ health: OverviewProject['financialHealth'] }> = ({ health }) => {
  let color = UI_THEME_COLORS.textMedium; 
  switch (health) {
    case 'Excellent': color = UI_THEME_COLORS.status.completed; break;
    case 'Good': color = UI_THEME_COLORS.status.inprogress; break; 
    case 'Fair': color = UI_THEME_COLORS.status.warning; break; 
    case 'Poor': color = UI_THEME_COLORS.status.danger; break; 
    case 'Critical': color = UI_THEME_COLORS.status.critical; break; 
  }
  return <span style={{ color: color }} className={`font-semibold text-base`}>{health}</span>;
};


export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ platformData, searchTerm }) => {
  const { overallProjects } = platformData;

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<OverviewProject | null>(null);

  const [isCardDetailModalOpen, setIsCardDetailModalOpen] = useState(false);
  const [cardDetailData, setCardDetailData] = useState<object | null>(null);
  const [cardDetailTitle, setCardDetailTitle] = useState<string>('');

  const handleProjectClick = (project: OverviewProject) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setSelectedProject(null);
  };

  const closeCardDetailModal = () => {
    setIsCardDetailModalOpen(false);
    setCardDetailData(null);
    setCardDetailTitle('');
  };

  const handleChartItemClick = (item: OverviewProject | TreemapChartNode) => {
    if ('originalProject' in item && item.originalProject) {
        handleProjectClick(item.originalProject);
    } else if ('id' in item) {
        const projectItem = item as OverviewProject;
        if (overallProjects.some(op => op.id === projectItem.id)) {
             handleProjectClick(projectItem);
        }
    }
  };

  const filteredProjects = React.useMemo(() =>
    overallProjects.filter(p => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      if (p.name.toLowerCase().includes(lowerSearchTerm) ||
          p.type.toLowerCase().includes(lowerSearchTerm) ||
          p.status.toLowerCase().includes(lowerSearchTerm) ||
          (p.marketSentiment && p.marketSentiment.toLowerCase().includes(lowerSearchTerm))) {
        return true;
      }
      if (p.tags && p.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))) {
        return true;
      }
      if (p.customFields && p.customFields.some(cf =>
        cf.fieldName.toLowerCase().includes(lowerSearchTerm) ||
        String(cf.fieldValue).toLowerCase().includes(lowerSearchTerm)
      )) {
        return true;
      }
      return false;
    }),
    [overallProjects, searchTerm]
  );

  const totalBudgetAllocated = overallProjects.reduce((sum, p) => sum + (p.units.reduce((unitSum, unit) => unitSum + unit.initialPrice, 0)), 0);
  const totalUnits = overallProjects.reduce((sum, p) => sum + p.totalUnits, 0);
  const totalSoldUnits = overallProjects.reduce((sum, p) => sum + p.unitsSold, 0);
  const totalReservedUnits = overallProjects.reduce((sum, p) =>
    sum + p.units.filter(u => u.availabilityStatus === UnitAvailabilityStatus.Reserved).length, 0
  );
  const overallSalesProgress = totalUnits > 0 ? (totalSoldUnits / totalUnits) * 100 : 0;

  const allRisks = overallProjects.flatMap(p => p.keyRisks);
  const uniqueRisks = [...new Set(allRisks)];
  const totalActiveRisksCount = uniqueRisks.length;

  const projectStatusData = Object.entries(
    overallProjects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<OverviewProject['status'], number>)
  ).map(([name, value]) => ({ name, value }));

  const constellationMapData = overallProjects;

  const treemapData = useMemo<TreemapChartNode[]>(() => {
    const dataByParent: Record<string, TreemapChartNode> = {};
    overallProjects.forEach(project => {
        const projectValue = project.units.reduce((sum, unit) => sum + unit.currentPrice, 0);
        if (projectValue <= 0) return;

        const parentTypeName = project.type;
        if (!dataByParent[parentTypeName]) {
            dataByParent[parentTypeName] = {
                name: parentTypeName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                children: [],
                size: 0,
                projectType: project.type,
            };
        }
        dataByParent[parentTypeName].children?.push({
            name: project.name,
            size: projectValue,
            originalProject: project,
            projectType: project.type,
            financialHealth: project.financialHealth,
        });
    });

    return Object.values(dataByParent)
      .map(parent => ({
        ...parent,
        size: parent.children?.reduce((acc, child) => acc + child.size, 0) || 0
      }))
      .filter(parent => parent.size > 0);
  }, [overallProjects]);

  const projectColumns: ColumnDefinition<OverviewProject>[] = [
    { key: 'name', header: 'Project Name', render: item => (
      <div className="flex items-center">
        <img
            src={item.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name.substring(0,2))}&background=D4AF37&color=120E16&size=128&font-size=0.4&bold=true&rounded=true`}
            alt={item.name}
            className="w-24 h-16 rounded-lg object-cover mr-5 flex-shrink-0 border-2 border-brand-border-accent/30 shadow-md"
            onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=Error&background=B5484D&color=F0E8F3&size=128&font-size=0.3&bold=true&rounded=true`}
        />
        <div>
          <div className="font-semibold text-brand-text-light text-lg">{item.name}</div>
          <div className="text-sm text-brand-text-medium capitalize">{item.type}</div>
        </div>
      </div>
    )},
    { key: 'status', header: 'Status', render: item => <ProjectStatusBadge status={item.status} /> },
    { key: 'overallProgress', header: 'Progress', render: item => (
      <div className="w-full bg-brand-border-primary rounded-full h-3.5 relative shadow-inner">
        <div className="bg-brand-accent h-3.5 rounded-full" style={{ width: `${item.overallProgress}%` }}></div>
        <span className="absolute w-full text-center text-[11px] text-brand-text-dark font-semibold top-0 leading-tight pt-0.5">{item.overallProgress}%</span>
      </div>
    )},
    { key: 'unitsSold', header: 'Sales', render: item => <span className="text-base">{`${item.unitsSold} / ${item.totalUnits} units`}</span> },
    { key: 'financialHealth', header: 'Financial Health', render: item => <FinancialHealthBadge health={item.financialHealth} />},
    { key: 'meta', header: 'Meta', render: item => (
        <div className="flex space-x-2.5 items-center">
            {item.tags && item.tags.length > 0 && <SolidTagIcon className="h-5 w-5 text-brand-secondary" title={`Tags: ${item.tags.join(', ')}`} />}
            {item.customFields && item.customFields.length > 0 && <SolidAcademicCapIcon className="h-5 w-5 text-brand-accent-muted" title={`Custom Fields: ${item.customFields.length}`} />}
        </div>
    )},
    { key: 'estimatedCompletionDate', header: 'Est. Completion', render: item => <span className="text-sm">{item.estimatedCompletionDate}</span>},
  ];

  const handleActiveProjectsCardClick = () => {
    const active = overallProjects.filter(p => p.status !== 'Completed' && p.status !== 'On Hold');
    const statusBreakdown = active.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    const avgProgress = active.length > 0 ? active.reduce((sum, p) => sum + p.overallProgress, 0) / active.length : 0;
    setCardDetailData({
      totalActiveProjects: active.length, statusBreakdown, averageProgress: `${avgProgress.toFixed(1)}%`,
      totalUnitsInActiveProjects: active.reduce((sum, p) => sum + p.totalUnits, 0),
      totalSoldUnitsInActiveProjects: active.reduce((sum, p) => sum + p.unitsSold, 0),
    } as ActiveProjectsDetail);
    setCardDetailTitle('Active Projects Snapshot');
    setIsCardDetailModalOpen(true);
  };

  const handlePortfolioValueCardClick = () => {
    const breakdown: PortfolioValueDetailItem[] = overallProjects.map(p => ({
        projectName: p.name, estimatedValue: `$${(p.units.reduce((s, u) => s + u.currentPrice, 0) / 1_000_000).toFixed(2)}M`,
        valueContributionPercentage: totalBudgetAllocated > 0 ? `${((p.units.reduce((s, u) => s + u.currentPrice, 0) / totalBudgetAllocated) * 100).toFixed(1)}%` : '0%',
    }));
    setCardDetailData({ totalValue: `$${(overallProjects.reduce((sum, p) => sum + p.units.reduce((s, u) => s + u.currentPrice, 0), 0) / 1_000_000).toFixed(1)}M`, valueBreakdownByProject: breakdown } as PortfolioValueDetail);
    setCardDetailTitle('Portfolio Value Breakdown');
    setIsCardDetailModalOpen(true);
  };

  const handleSalesProgressCardClick = () => {
    const details: SalesProgressDetailItem[] = overallProjects.map(p => ({
      projectName: p.name, progressPercentage: p.totalUnits > 0 ? `${((p.unitsSold / p.totalUnits) * 100).toFixed(1)}%` : '0%',
      unitsSold: p.unitsSold, totalUnits: p.totalUnits,
    }));
    setCardDetailData({
      overallSalesPercentage: `${overallSalesProgress.toFixed(1)}%`, totalUnitsOverall: totalUnits, totalUnitsSold: totalSoldUnits, totalUnitsReserved: totalReservedUnits, detailedSalesByProject: details,
    } as SalesProgressDetail);
    setCardDetailTitle('Overall Sales Progress Details');
    setIsCardDetailModalOpen(true);
  };

  const handleActiveRisksCardClick = () => {
    const riskDetails: ActiveRiskDetailItem[] = uniqueRisks.map(risk => {
      const affected = overallProjects.filter(p => p.keyRisks.includes(risk)).map(p => p.name);
      return { riskDescription: risk, affectedProjects: affected, numberOfProjectsAffected: affected.length };
    });
    setCardDetailData({ totalUniqueRisks: totalActiveRisksCount, risks: riskDetails } as ActiveRiskDetail);
    setCardDetailTitle('Active Risk Analysis');
    setIsCardDetailModalOpen(true);
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <DashboardCard title="Active Projects" value={overallProjects.filter(p => p.status !== 'Completed' && p.status !== 'On Hold').length} icon={BuildingOfficeIcon} trend="up" trendValue="+2" onClick={handleActiveProjectsCardClick} />
        <DashboardCard title="Portfolio Value" value={`$${(overallProjects.reduce((sum,p) => sum + p.units.reduce((s,u) => s + u.currentPrice, 0),0) / 1_000_000).toFixed(1)}M`} icon={CircleStackIcon} description="Estimated Current Value" onClick={handlePortfolioValueCardClick} />
        <DashboardCard title="Sales Progress" value={`${overallSalesProgress.toFixed(1)}%`} icon={ArrowTrendingUpIcon} description={`${totalSoldUnits} / ${totalUnits} Sold`} onClick={handleSalesProgressCardClick} />
        <DashboardCard title="Active Risks" value={totalActiveRisksCount} icon={ExclamationTriangleIcon} description="Identified Across Portfolio" onClick={handleActiveRisksCardClick} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AdvancedTreemap
            title="Project Value Distribution by Type"
            data={treemapData}
            onNodeClick={handleChartItemClick}
            height={500}
          />
        </div>
        <div className="space-y-8">
          <SimplePieChart title="Projects by Status" data={projectStatusData} height={235} />
          <ConstellationMap
            title="Progress vs. Budget Utilization"
            data={constellationMapData}
            onPointClick={handleChartItemClick}
            height={235}
          />
        </div>
      </div>

      <div>
           <TableComponent
            title="Portfolio Overview"
            data={filteredProjects}
            columns={projectColumns}
            keyExtractor={(item) => item.id}
            maxHeight="max-h-[450px]"
            onRowClick={handleProjectClick}
          />
      </div>

      <ModalComponent isOpen={isProjectModalOpen} onClose={closeProjectModal} title={`Project Dossier: ${selectedProject?.name || ''}`}>
        <DetailViewDisplay item={selectedProject} />
      </ModalComponent>
      <ModalComponent isOpen={isCardDetailModalOpen} onClose={closeCardDetailModal} title={cardDetailTitle}>
        <DetailViewDisplay item={cardDetailData} />
      </ModalComponent>
    </div>
  );
};