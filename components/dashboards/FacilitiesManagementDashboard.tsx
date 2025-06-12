

import React, { useState, useMemo } from 'react';
import { FacilitiesManagementModule, FacilityAsset, MaintenanceTask, ServiceProvider, AssetComponent, CustomField } from '../../types';
import { FeatureCard } from '../common/FeatureCard';
import { TableComponent, ColumnDefinition } from '../common/TableComponent';
import { ModalComponent } from '../common/ModalComponent';
import { DetailViewDisplay } from '../common/DetailViewDisplay';
import { SimplePieChart } from '../charts/SimplePieChart';
import { DashboardCard } from '../DashboardCard';
import { TagIcon as SolidTagIcon, AcademicCapIcon as SolidAcademicCapIcon } from '@heroicons/react/24/solid';
import { CalendarDaysIcon, UserCircleIcon, WrenchIcon, ExclamationTriangleIcon, CogIcon, CurrencyDollarIcon, UserGroupIcon, PhoneIcon, CircleStackIcon, ClipboardDocumentCheckIcon, BeakerIcon, WrenchScrewdriverIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { FEATURE_ICONS, UI_THEME_COLORS } from '../../constants';

interface FacilitiesManagementDashboardProps {
  fmModule: FacilitiesManagementModule;
  searchTerm: string;
}

type ModalItem = FacilityAsset | MaintenanceTask | ServiceProvider;

interface TechnicianPerformanceData {
    technicianName: string;
    tasksAssigned: number;
    tasksCompleted: number;
    tasksCompletedOnTime: number;
    averageCompletionTimeDays: number;
    currentOpenTasks: number;
}

const filterData = <T extends object,>(data: T[], searchTerm: string, keysToSearch: (keyof T | string)[]) => {
  if (!searchTerm) return data;
  const lowerSearchTerm = searchTerm.toLowerCase();
  return data.filter(item =>
    keysToSearch.some(key => {
      const value = item[key as keyof T];
      if (typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm)) return true;
      if (typeof value === 'number' && value.toString().toLowerCase().includes(lowerSearchTerm)) return true;
      if (key === 'components' && Array.isArray(value)) return (value as AssetComponent[]).some(comp => comp.name.toLowerCase().includes(lowerSearchTerm) || (comp.serialNumber && comp.serialNumber.toLowerCase().includes(lowerSearchTerm)));
      if (key === 'specialization' && Array.isArray(value)) return (value as string[]).some(spec => spec.toLowerCase().includes(lowerSearchTerm));
      if ((key === 'taskType' || key === 'toolsRequired') && typeof value === 'string') return value.toLowerCase().includes(lowerSearchTerm); // This seems to be an error, toolsRequired is string[]
      if (key === 'toolsRequired' && Array.isArray(value)) return (value as string[]).some(tool => tool.toLowerCase().includes(lowerSearchTerm));
      if (key === 'tags' && Array.isArray(value) && (value as string[]).some(tag => tag.toLowerCase().includes(lowerSearchTerm))) return true;
      if (key === 'customFields' && Array.isArray(value) && (value as CustomField[]).some(cf => cf.fieldName.toLowerCase().includes(lowerSearchTerm) || String(cf.fieldValue).toLowerCase().includes(lowerSearchTerm) )) return true;
      return false;
    })
  );
};

const AssetStatusBadge: React.FC<{ status: FacilityAsset['status'] }> = ({ status }) => {
  let bgColor = UI_THEME_COLORS.status.planning; let textColor = UI_THEME_COLORS.textDark;
  if (status === 'Operational') { bgColor = UI_THEME_COLORS.status.operational; textColor = UI_THEME_COLORS.textLight;}
  else if (status === 'Maintenance Due') { bgColor = UI_THEME_COLORS.status.maintenance; textColor = UI_THEME_COLORS.textDark;} 
  else if (status === 'Under Repair') { bgColor = UI_THEME_COLORS.status.inprogress; textColor = UI_THEME_COLORS.textLight;}
  else if (status === 'Out of Order') { bgColor = UI_THEME_COLORS.status.critical; textColor = UI_THEME_COLORS.textLight;}
  else if (status === 'Scheduled Replacement') { bgColor = UI_THEME_COLORS.status.pipeline; textColor = UI_THEME_COLORS.textLight;}
  else if (status === 'Decommissioned') { bgColor = UI_THEME_COLORS.status.offline; textColor = UI_THEME_COLORS.textLight;}
  else { textColor = UI_THEME_COLORS.textLight;}
  return <span style={{backgroundColor: bgColor, color: textColor}} className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm`}>{status}</span>;
};

const TaskStatusBadge: React.FC<{ status: MaintenanceTask['status'] }> = ({ status }) => {
  let bgColor = UI_THEME_COLORS.status.planning; let textColor = UI_THEME_COLORS.textDark;
  if (status === 'Completed') { bgColor = UI_THEME_COLORS.status.completed; textColor = UI_THEME_COLORS.textLight;}
  else if (status === 'Scheduled' || status === 'In Progress') { bgColor = UI_THEME_COLORS.status.inprogress; textColor = UI_THEME_COLORS.textLight;}
  else if (status === 'Pending') { bgColor = UI_THEME_COLORS.status.pending; textColor = UI_THEME_COLORS.textDark;} 
  else if (status === 'On Hold - Parts') { bgColor = UI_THEME_COLORS.status.onhold; textColor = UI_THEME_COLORS.textDark;} 
  else if (status === 'Cancelled') { bgColor = UI_THEME_COLORS.status.cancelled; textColor = UI_THEME_COLORS.textLight;}
  else if (status === 'Requires Follow-up') { bgColor = UI_THEME_COLORS.status.pipeline; textColor = UI_THEME_COLORS.textLight;}
  else { textColor = UI_THEME_COLORS.textLight;}
  return <span style={{backgroundColor: bgColor, color: textColor}} className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm`}>{status}</span>;
};

const PriorityIcon: React.FC<{ priority: MaintenanceTask['priority'] }> = ({ priority }) => {
  if (priority === 'Critical') return <ExclamationTriangleIcon className="h-5 w-5 text-brand-danger inline-block mr-1.5" title="Critical Priority"/>;
  if (priority === 'High') return <ExclamationTriangleIcon className="h-5 w-5 text-brand-warning inline-block mr-1.5" title="High Priority"/>;
  if (priority === 'Medium') return <WrenchIcon className="h-5 w-5 text-brand-accent inline-block mr-1.5" title="Medium Priority"/>;
  return <WrenchIcon className="h-5 w-5 text-brand-text-medium inline-block mr-1.5" title="Low Priority"/>;
}

export const FacilitiesManagementDashboard: React.FC<FacilitiesManagementDashboardProps> = ({ fmModule, searchTerm }) => {
  const { assetRegister, maintenanceScheduler, serviceProviderDirectory } = fmModule.features;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ModalItem | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  const handleRowClick = (item: ModalItem, titlePrefix: string) => {
    let identifier = ('name' in item && typeof item.name === 'string') ? item.name :
                     ('taskDescription' in item && typeof (item as MaintenanceTask).taskDescription === 'string') ? (item as MaintenanceTask).taskDescription.substring(0,30) + '...' :
                     (item as any).id || 'Unknown Item';
    setSelectedItem(item);
    setModalTitle(`${titlePrefix}: ${identifier}`);
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setSelectedItem(null); setModalTitle(''); };

  const filteredAssets = useMemo(() => filterData(assetRegister.sampleAssets, searchTerm, ['name', 'assetType', 'projectLocation', 'status', 'assignedTechnician', 'specificLocation', 'components', 'tags', 'customFields']), [assetRegister.sampleAssets, searchTerm]);
  const filteredTasks = useMemo(() => filterData(maintenanceScheduler.sampleTasks, searchTerm, ['facilityAssetName', 'taskDescription', 'priority', 'status', 'assignedTo', 'taskType', 'toolsRequired']), [maintenanceScheduler.sampleTasks, searchTerm]);
  const filteredServiceProviders = useMemo(() => filterData(serviceProviderDirectory.sampleProviders, searchTerm, ['name', 'contactPerson', 'email', 'specialization', 'contractId']), [serviceProviderDirectory.sampleProviders, searchTerm]);

  const technicianPerformanceData = useMemo<TechnicianPerformanceData[]>(() => {
    const perfMap: Record<string, TechnicianPerformanceData> = {};
    maintenanceScheduler.sampleTasks.forEach(task => {
        if (!task.assignedTo) return;
        if (!perfMap[task.assignedTo]) perfMap[task.assignedTo] = { technicianName: task.assignedTo, tasksAssigned: 0, tasksCompleted: 0, tasksCompletedOnTime: 0, averageCompletionTimeDays: 0, currentOpenTasks: 0 };
        const tech = perfMap[task.assignedTo];
        tech.tasksAssigned++;
        if (task.status === 'Completed') {
            tech.tasksCompleted++;
            if (task.completedDate && ((task.scheduledDate && new Date(task.completedDate) <= new Date(task.scheduledDate)) || (!task.scheduledDate && task.reportedDate && new Date(task.completedDate).getTime() - new Date(task.reportedDate).getTime() <= (task.estimatedHours || 24) * 3600 * 1000 * 1.2))) tech.tasksCompletedOnTime++;
            if (task.completedDate && task.reportedDate) {
                const diffDays = Math.ceil(Math.abs(new Date(task.completedDate).getTime() - new Date(task.reportedDate).getTime()) / (1000 * 3600 * 24));
                tech.averageCompletionTimeDays = (tech.averageCompletionTimeDays * (tech.tasksCompleted - 1) + diffDays) / tech.tasksCompleted;
            }
        } else if (['Pending', 'Scheduled', 'In Progress', 'On Hold - Parts'].includes(task.status)) tech.currentOpenTasks++;
    });
    return Object.values(perfMap);
  }, [maintenanceScheduler.sampleTasks]);

  const assetColumns: ColumnDefinition<FacilityAsset>[] = [
    { key: 'name', header: 'Asset Name', render: item => <span className="font-semibold text-brand-accent text-base">{item.name}</span> },
    { key: 'assetType', header: 'Type', render: item => <span className="text-sm">{item.assetType}</span> },
    { key: 'projectLocation', header: 'Project', render: item => <span className="text-sm">{item.projectLocation}</span> },
    { key: 'status', header: 'Status', render: item => <AssetStatusBadge status={item.status} /> },
    { key: 'meta', header: 'Meta', render: item => (
        <div className="flex space-x-3 items-center">
            {(item.components && item.components.length > 0) && <CogIcon className="h-5.5 w-5.5 text-brand-secondary" title={`${item.components.length} components`} />}
            {item.tags && item.tags.length > 0 && <SolidTagIcon className="h-5.5 w-5.5 text-brand-info" title={`Tags: ${item.tags.join(', ')}`} />}
            {item.customFields && item.customFields.length > 0 && <SolidAcademicCapIcon className="h-5.5 w-5.5 text-brand-accent-muted" title={`Custom Fields: ${item.customFields.length}`} />}
        </div>
    )},
    { key: 'nextMaintenanceDueDate', header: 'Next Maint.', render: item => item.nextMaintenanceDueDate ? <span className="text-sm text-brand-warning"><CalendarDaysIcon className="h-5 w-5 inline mr-2"/>{item.nextMaintenanceDueDate}</span> : <span className="text-sm text-brand-text-medium/70 italic">N/A</span> },
  ];

  const taskColumns: ColumnDefinition<MaintenanceTask>[] = [
    { key: 'taskDescription', header: 'Task', render: item => <span className="text-base text-brand-text-light w-52 truncate block" title={item.taskDescription}>{item.taskDescription}</span> },
    { key: 'facilityAssetName', header: 'Asset', render: item => <span className="text-sm">{item.facilityAssetName}</span> },
    { key: 'priority', header: 'Priority', render: item => <PriorityIcon priority={item.priority}/> },
    { key: 'status', header: 'Status', render: item => <TaskStatusBadge status={item.status} /> },
    { key: 'costs', header: 'Costs ($)', render: item => (item.totalCost || item.laborCosts || item.partsCost) ? <span className="text-base text-brand-success">{item.totalCost?.toLocaleString() || (item.laborCosts || 0 + item.partsCost || 0).toLocaleString()}</span> : <span className="text-sm text-brand-text-medium/70 italic">-</span>},
    { key: 'assignedTo', header: 'Assigned To', render: item => <span className="text-sm"><UserCircleIcon className="h-5 w-5 inline mr-2 text-brand-text-medium"/>{item.assignedTo}</span> },
  ];

  const serviceProviderColumns: ColumnDefinition<ServiceProvider>[] = [
      { key: 'name', header: 'Provider Name', render: item => <span className="font-semibold text-brand-text-light text-base">{item.name}</span> },
      { key: 'specialization', header: 'Specialization', render: item => <span className="text-sm">{item.specialization.join(', ')}</span> },
      { key: 'contactPerson', header: 'Contact', render: item => <span className="text-sm">{item.contactPerson}</span> }, { key: 'rating', header: 'Rating', render: item => item.rating ? <span className="text-brand-accent text-base">{`${item.rating}/5 ★`}</span> : <span className="text-brand-text-medium/70 italic text-sm">N/A</span>},
      { key: 'contractId', header: 'Contract ID', render: item => item.contractId || <span className="text-sm text-brand-text-medium/70 italic">N/A</span>},
  ];

   const technicianPerformanceColumns: ColumnDefinition<TechnicianPerformanceData>[] = [
    { key: 'technicianName', header: 'Technician', render: item => <span className="font-medium text-brand-text-light text-base">{item.technicianName}</span> },
    { key: 'tasksAssigned', header: 'Assigned' }, { key: 'tasksCompleted', header: 'Completed' },
    { key: 'tasksCompletedOnTime', header: 'On Time %', render: item => <span className="font-semibold text-base">{`${item.tasksCompleted > 0 ? ((item.tasksCompletedOnTime / item.tasksCompleted) * 100).toFixed(0) : 0}%`}</span>},
    { key: 'averageCompletionTimeDays', header: 'Avg. Comp. (Days)', render: item => item.averageCompletionTimeDays.toFixed(1) }, { key: 'currentOpenTasks', header: 'Open Tasks' },
  ];

  const maintenanceTaskStatusData = Object.entries(maintenanceScheduler.sampleTasks.reduce((acc, task) => { acc[task.status] = (acc[task.status] || 0) + 1; return acc; }, {} as Record<MaintenanceTask['status'], number>)).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-12">
      <header className="pb-3">
        <h2 className="text-5xl font-heading font-semibold text-brand-text-light flex items-center">
            <WrenchScrewdriverIcon className="h-11 w-11 mr-5 text-brand-accent"/>
            {fmModule.moduleName}
        </h2>
        <p className="text-xl text-brand-text-medium font-light ml-[66px] mt-1.5">Optimizing Asset Longevity and Operational Efficiency</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <DashboardCard title="Total Managed Assets" value={assetRegister.sampleAssets.length} icon={FEATURE_ICONS['AssetRegister'] || CircleStackIcon} description="Across all properties" />
        <DashboardCard title="Active Maintenance Tasks" value={maintenanceScheduler.sampleTasks.filter(t => ['Pending', 'Scheduled', 'In Progress', 'On Hold - Parts'].includes(t.status)).length} icon={FEATURE_ICONS['MaintenanceScheduler'] || ClipboardDocumentCheckIcon} description="Requiring attention"/>
        <DashboardCard title="Critical Asset Alerts" value={assetRegister.sampleAssets.filter(a => a.status === 'Out of Order' || a.status === 'Under Repair').length} icon={ExclamationTriangleIcon} trend="down" trendValue="Immediate Action" description="Assets Out of Order or Under Repair"/>
      </div>

      <FeatureCard title={assetRegister.name} description={assetRegister.description} iconKey="AssetRegister" benefits={assetRegister.benefits}>
        <TableComponent title="Managed Facility Assets" data={filteredAssets} columns={assetColumns} keyExtractor={(item) => item.id} maxHeight="max-h-[420px]" onRowClick={(item) => handleRowClick(item, "Asset Details")}/>
      </FeatureCard>

    <section className="bg-brand-bg-deep/40 backdrop-blur-lg backdrop-saturate-150 shadow-2xl rounded-2xl p-8 border border-brand-text-light/10">
        <div className="flex items-start mb-6">
           <IconFeature iconKey="MaintenanceScheduler" large />
           <div className="ml-1.5">
            <h3 className="text-3xl font-heading font-semibold text-brand-text-light">{maintenanceScheduler.name} & Performance</h3>
            <p className="text-lg text-brand-text-medium font-light mt-1.5">Track tasks, technician workload, and status distribution.</p>
           </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <TableComponent title="Current Maintenance Tasks" data={filteredTasks} columns={taskColumns} keyExtractor={(item) => item.id} maxHeight="max-h-[420px]" onRowClick={(item) => handleRowClick(item, "Task Details")}/>
            </div>
            <div className="space-y-7">
                <SimplePieChart title="Tasks by Status" data={maintenanceTaskStatusData} height={420} />
            </div>
        </div>
        <div className="mt-9">
            <TableComponent title="Technician Performance Metrics" data={technicianPerformanceData} columns={technicianPerformanceColumns} keyExtractor={(item) => item.technicianName} maxHeight="max-h-[350px]" />
        </div>
    </section>

    <FeatureCard title={serviceProviderDirectory.name} description={serviceProviderDirectory.description} iconKey="ServiceProviderDirectory" benefits={serviceProviderDirectory.benefits}>
        <TableComponent title="External Service Providers" data={filteredServiceProviders} columns={serviceProviderColumns} keyExtractor={(item) => item.id} maxHeight="max-h-[350px]" onRowClick={(item) => handleRowClick(item, "Service Provider Details")}/>
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