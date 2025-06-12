

import React, { useState, useMemo } from 'react';
import { ProjectProgressComplianceModule, MilestoneStatus, MilestoneSubTask, MediaUpload, ComplianceItem, StoredDocument, QualityInspectionRecord } from '../../types';
import { FeatureCard } from '../common/FeatureCard';
import { TableComponent, ColumnDefinition } from '../common/TableComponent';
import { SimpleBarChart } from '../charts/SimpleBarChart';
import { ModalComponent } from '../common/ModalComponent';
import { DetailViewDisplay } from '../common/DetailViewDisplay';
import { ContractAnalysisCard } from '../common/ContractAnalysisCard';
import { CalendarDaysIcon, UserGroupIcon, ExclamationCircleIcon, ListBulletIcon, DocumentCheckIcon, ShieldCheckIcon, ClockIcon, FolderOpenIcon, CameraIcon, ClipboardDocumentCheckIcon, DocumentDuplicateIcon, DocumentMagnifyingGlassIcon, ChartBarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { FEATURE_ICONS, UI_THEME_COLORS } from '../../constants';

interface ProgressComplianceDashboardProps {
  progressModule: ProjectProgressComplianceModule;
  searchTerm: string;
}

type ModalItem = MilestoneStatus | MediaUpload | ComplianceItem | StoredDocument | QualityInspectionRecord;

const filterData = <T extends object,>(data: T[], searchTerm: string, keysToSearch: (keyof T | string)[]) => {
  if (!searchTerm) return data;
  const lowerSearchTerm = searchTerm.toLowerCase();
  return data.filter(item =>
    keysToSearch.some(key => {
      const value = item[key as keyof T];
      if (typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm)) return true;
      if (typeof value === 'number' && value.toString().toLowerCase().includes(lowerSearchTerm)) return true;
      if (Array.isArray(value)) {
        if (key === 'subTasks' && (value as MilestoneSubTask[]).some(st => st.name.toLowerCase().includes(lowerSearchTerm) || st.status.toLowerCase().includes(lowerSearchTerm) || (st.blockers && st.blockers.some(b => b.toLowerCase().includes(lowerSearchTerm))))) return true;
        if (key === 'issuesOrBlockers' && (value as string[]).some(issue => issue.toLowerCase().includes(lowerSearchTerm))) return true;
        if (key === 'reviewers' && (value as string[]).some(rev => rev.toLowerCase().includes(lowerSearchTerm))) return true;
        if (key === 'keywords' && (value as string[]).some(kw => kw.toLowerCase().includes(lowerSearchTerm))) return true;
        if (key === 'versionHistory' && typeof searchTerm === 'string' && (value as any[]).some(v => v.version.toLowerCase().includes(lowerSearchTerm) || v.changeReason.toLowerCase().includes(lowerSearchTerm))) return true;
        if (key === 'checklistItems' && typeof searchTerm === 'string' && (value as any[]).some(ci => ci.item.toLowerCase().includes(lowerSearchTerm) || (ci.notes && ci.notes.toLowerCase().includes(lowerSearchTerm)))) return true;
      }
      if((key === 'inspector' || key === 'inspectionType' || key === 'inspectionIdNumber') && typeof value === 'string') return value.toLowerCase().includes(lowerSearchTerm);
      return false;
    })
  );
};

export const ProgressComplianceDashboard: React.FC<ProgressComplianceDashboardProps> = ({ progressModule, searchTerm }) => {
  const { milestoneProgressTracker, photoVideoUpload, reraComplianceChecklists, digitalDocumentRepository, qualityChecklists } = progressModule.features;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ModalItem | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  const handleRowClick = <T extends ModalItem>(item: T, titlePrefix: string, identifierKey: keyof T | 'inspectionIdNumber' | 'milestoneName' | 'fileName' | 'requirementName' | 'documentName') => {
    const itemAsAny = item as any;
    const mainIdentifierValue = itemAsAny[identifierKey as string];
    let displayString = mainIdentifierValue ? String(mainIdentifierValue) : (item as any).id || 'Detail';
    setSelectedItem(item);
    setModalTitle(`${titlePrefix}: ${displayString}`);
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setSelectedItem(null); setModalTitle(''); };

  const filteredMilestones = useMemo(() => filterData(milestoneProgressTracker.sampleMilestoneStatuses, searchTerm, ['milestoneName', 'project', 'status', 'subTasks', 'issuesOrBlockers']), [milestoneProgressTracker.sampleMilestoneStatuses, searchTerm]);
  const filteredUploads = useMemo(() => filterData(photoVideoUpload.sampleUploads, searchTerm, ['fileName', 'project', 'uploadedBy', 'type', 'description']), [photoVideoUpload.sampleUploads, searchTerm]);
  const filteredComplianceItems = useMemo(() => filterData(reraComplianceChecklists.sampleComplianceItems, searchTerm, ['requirementName', 'authority', 'status', 'responsiblePerson', 'notes']), [reraComplianceChecklists.sampleComplianceItems, searchTerm]);
  const filteredDocuments = useMemo(() => filterData(digitalDocumentRepository.sampleDocuments, searchTerm, ['documentName', 'project', 'documentType', 'status', 'reviewers', 'keywords', 'expiryDate', 'versionHistory', 'department']), [digitalDocumentRepository.sampleDocuments, searchTerm]);
  const filteredInspections = useMemo(() => filterData(qualityChecklists.sampleInspections, searchTerm, ['inspectionIdNumber', 'project', 'unitId', 'areaInspected', 'inspector', 'inspectionType', 'overallStatus', 'checklistItems']), [qualityChecklists.sampleInspections, searchTerm]);

  const milestoneColumns: ColumnDefinition<MilestoneStatus>[] = [
    { key: 'milestoneName', header: 'Milestone', render: item => <span className="font-semibold text-brand-accent text-base">{item.milestoneName}</span> },
    { key: 'project', header: 'Project', render: item => <span className="text-sm">{item.project}</span> },
    { key: 'status', header: 'Status', render: item => {
        let bgColor = UI_THEME_COLORS.status.planning; let textColor = UI_THEME_COLORS.textDark;
        if (item.status === 'Completed') { bgColor = UI_THEME_COLORS.status.completed; textColor = UI_THEME_COLORS.textLight;}
        else if (item.status === 'Delayed' || item.status === 'At Risk') { bgColor = UI_THEME_COLORS.status.critical; textColor = UI_THEME_COLORS.textLight;}
        else if (item.status === 'In Progress') { bgColor = UI_THEME_COLORS.status.inprogress; textColor = UI_THEME_COLORS.textLight;}
        else if (item.status === 'Pending') { bgColor = UI_THEME_COLORS.status.pending; textColor = UI_THEME_COLORS.textDark;} 
        else { textColor = UI_THEME_COLORS.textLight;}
        return <span style={{backgroundColor: bgColor, color: textColor}} className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm`}>{item.status}</span>
    }},
    { key: 'progressPercentage', header: 'Progress', render: item => (
        <div className="w-full bg-brand-border-primary rounded-full h-3.5 relative shadow-inner">
         <div className="bg-brand-accent h-3.5 rounded-full" style={{ width: `${item.progressPercentage}%` }}></div>
         <span className="absolute w-full text-center text-[11px] text-brand-text-dark font-semibold top-0 leading-tight pt-0.5">{item.progressPercentage}%</span>
        </div>
    )},
    { key: 'subTasks', header: 'Sub-Tasks', render: item => {
        const total = item.subTasks?.length || 0; const completed = item.subTasks?.filter(st => st.status === 'Completed').length || 0; const blocked = item.subTasks?.filter(st => st.status === 'Blocked').length || 0;
        if (total === 0) return <span className="text-sm text-brand-text-medium/70 italic">N/A</span>;
        return <span className="text-sm text-brand-text-medium"><ListBulletIcon className="h-4.5 w-4.5 inline mr-1.5 text-brand-accent-muted"/>{completed}/{total} {blocked > 0 && <ExclamationCircleIcon title={`${blocked} blocked`} className="h-4.5 w-4.5 inline ml-2 text-brand-danger"/>}</span>;
    }},
    { key: 'issuesOrBlockers', header: 'Issues', render: item => (item.issuesOrBlockers?.length || 0) > 0 ? <span className="text-sm text-brand-danger font-medium"><ExclamationCircleIcon className="h-4.5 w-4.5 inline mr-1.5"/>{item.issuesOrBlockers?.length} active</span> : <span className="text-sm text-brand-success">None</span> },
    { key: 'definedDate', header: 'Target Date', render: item => <span className="text-sm">{item.definedDate}</span> },
  ];

  const uploadColumns: ColumnDefinition<MediaUpload>[] = [
    { key: 'fileName', header: 'File', render: (item) => (
      <div className="flex items-center">
        <img
            src={item.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fileName.substring(0,2))}&background=B08D57&color=120E16&size=128&font-size=0.4&bold=true&rounded=true`}
            alt={item.fileName.substring(0,10)}
            className="w-20 h-14 rounded-lg object-cover mr-4 flex-shrink-0 border-2 border-brand-border-accent/30 shadow"
            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=Err&background=B5484D&color=F0E8F3&size=128&font-size=0.3&bold=true&rounded=true`; e.currentTarget.alt="Error";}}
        />
        <span className="truncate w-40 text-base text-brand-text-light" title={item.fileName}>{item.fileName}</span>
      </div>
    )},
    { key: 'project', header: 'Project', render: item => <span className="text-sm">{item.project}</span>}, { key: 'type', header: 'Type', render: item => <span className="text-sm">{item.type}</span> }, { key: 'uploadDate', header: 'Upload Date', render: item => <span className="text-sm">{item.uploadDate}</span> },
    { key: 'description', header: 'Desc.', render: item => <span className="text-sm truncate w-32" title={item.description}>{item.description || <span className="text-brand-text-medium/70 italic">N/A</span>}</span>}
  ];

  const complianceColumns: ColumnDefinition<ComplianceItem>[] = [
    { key: 'requirementName', header: 'Requirement', render: item => <span className="font-medium text-base">{item.requirementName}</span> }, { key: 'authority', header: 'Authority', render: item => <span className="text-sm">{item.authority}</span> }, { key: 'status', header: 'Status', render: item => <span className="text-sm">{item.status}</span> }, { key: 'dueDate', header: 'Due Date', render: item => <span className="text-sm">{item.dueDate}</span> }, { key: 'responsiblePerson', header: 'Responsible', render: item => <span className="text-sm">{item.responsiblePerson}</span> },
    { key: 'expiryDate', header: 'Expiry', render: item => item.expiryDate ? <CalendarDaysIcon className="h-5.5 w-5.5 text-brand-warning" title={`Expires: ${item.expiryDate}`} /> : <span className="text-sm text-brand-text-medium/70 italic">N/A</span>},
  ];

  const documentColumns: ColumnDefinition<StoredDocument>[] = [
    { key: 'documentName', header: 'Document Name', render: item => <span className="text-base truncate w-52 text-brand-text-light" title={item.documentName}>{item.documentName}</span> },
    { key: 'project', header: 'Project', render: item => <span className="text-sm">{item.project}</span>}, { key: 'documentType', header: 'Type', render: item => <span className="text-sm">{item.documentType}</span> }, { key: 'status', header: 'Status', render: item => <span className="text-sm">{item.status}</span> },
    { key: 'versionHistory', header: 'Versions', render: item => (item.versionHistory && item.versionHistory.length > 0) ? <ClockIcon className="h-5.5 w-5.5 text-brand-info" title={`${item.versionHistory.length} versions`} /> : <span className="text-sm text-brand-text-medium/70 italic">-</span> },
    { key: 'accessLog', header: 'Access', render: item => (item.accessLog && item.accessLog.length > 0) ? <FolderOpenIcon className="h-5.5 w-5.5 text-brand-secondary" title={`${item.accessLog.length} access logs`} /> : <span className="text-sm text-brand-text-medium/70 italic">-</span> },
  ];

  const qualityInspectionColumns: ColumnDefinition<QualityInspectionRecord>[] = [
      { key: 'inspectionIdNumber', header: 'Insp. ID', render: item => <span className="font-semibold text-base">{item.inspectionIdNumber}</span> }, { key: 'project', header: 'Project', render: item => <span className="text-sm">{item.project}</span>},
      { key: 'areaInspected', header: 'Area', render: item => <span className="text-sm truncate w-40" title={item.areaInspected}>{item.areaInspected}</span>},
      { key: 'inspectionType', header: 'Type', render: item => <span className="text-sm">{item.inspectionType}</span> },
      { key: 'overallStatus', header: 'Status', render: item => {
          let bgColor = UI_THEME_COLORS.status.planning; let textColor = UI_THEME_COLORS.textDark;
          if (item.overallStatus === 'Approved') { bgColor = UI_THEME_COLORS.status.completed; textColor = UI_THEME_COLORS.textLight;}
          else if (item.overallStatus === 'Rework Needed') { bgColor = UI_THEME_COLORS.status.critical; textColor = UI_THEME_COLORS.textLight;}
          else if (item.overallStatus === 'Pending Review') { bgColor = UI_THEME_COLORS.status.pending; textColor = UI_THEME_COLORS.textDark;}
          else { textColor = UI_THEME_COLORS.textLight;}
          return <span style={{backgroundColor: bgColor, color: textColor}} className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm`}>{item.overallStatus}</span>
      }},
      { key: 'inspectionDate', header: 'Date', render: item => <span className="text-sm">{item.inspectionDate}</span> },
  ];

  const milestoneProgressChartData = milestoneProgressTracker.sampleMilestoneStatuses.slice(0, 10).map(m => ({ name: `${m.project.substring(0,3)}..-${m.milestoneName.substring(0,10)}..`, progress: m.progressPercentage }));

  return (
    <div className="space-y-12">
      <header className="pb-3">
        <h2 className="text-5xl font-heading font-semibold text-brand-text-light flex items-center">
            <ClipboardDocumentCheckIcon className="h-11 w-11 mr-5 text-brand-accent"/>
            {progressModule.moduleName}
        </h2>
        <p className="text-xl text-brand-text-medium font-light ml-[66px] mt-1.5">Ensuring Excellence and Adherence to Standards</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <FeatureCard title={milestoneProgressTracker.name} iconKey="MilestoneProgressTracker" capabilities={milestoneProgressTracker.capabilities} benefits={milestoneProgressTracker.benefits}>
            <SimpleBarChart title="Key Milestone Progress" data={milestoneProgressChartData} xAxisKey="name" barKeys={[{key: 'progress', name: 'Completion %', color: UI_THEME_COLORS.charts.gold1}]} height={320}/>
        </FeatureCard>
        <FeatureCard title={photoVideoUpload.name} description={photoVideoUpload.description} iconKey="PhotoVideoUpload" capabilities={photoVideoUpload.capabilities} benefits={photoVideoUpload.benefits}>
            <TableComponent title="Recent Media Uploads" data={filteredUploads.slice(0,5)} columns={uploadColumns} keyExtractor={(item) => item.id} maxHeight="max-h-[300px]" onRowClick={(item) => handleRowClick(item as MediaUpload, 'Media Upload Details', 'fileName')}/>
        </FeatureCard>
      </section>

      <section className="bg-brand-bg-deep/40 backdrop-blur-lg backdrop-saturate-150 shadow-2xl rounded-2xl p-8 border border-brand-text-light/10">
        <ContractAnalysisCard />
      </section>

      <section className="bg-brand-bg-deep/40 backdrop-blur-lg backdrop-saturate-150 shadow-2xl rounded-2xl p-8 border border-brand-text-light/10">
        <div className="flex items-start mb-6">
           <IconFeature iconKey="MilestoneProgressTracker" large />
           <div className="ml-1.5">
            <h3 className="text-3xl font-heading font-semibold text-brand-text-light">Detailed Milestone Tracking</h3>
            <p className="text-lg text-brand-text-medium font-light mt-1.5">Comprehensive overview of all project milestones and their current status.</p>
           </div>
        </div>
        <TableComponent title="All Milestone Statuses" data={filteredMilestones} columns={milestoneColumns} keyExtractor={(item) => `${item.project}-${item.milestoneName}`} maxHeight="max-h-[400px]" onRowClick={(item) => handleRowClick(item, 'Milestone Details', 'milestoneName')}/>
      </section>

      <FeatureCard title={qualityChecklists.name} description={qualityChecklists.description} iconKey="QualityChecklists" benefits={qualityChecklists.benefits}>
        <TableComponent title="Quality Inspection Records" data={filteredInspections} columns={qualityInspectionColumns} keyExtractor={(item) => item.id} maxHeight="max-h-[330px]" onRowClick={(item) => handleRowClick(item, 'Inspection Details', 'inspectionIdNumber')}/>
      </FeatureCard>

      <FeatureCard title={reraComplianceChecklists.name} description={reraComplianceChecklists.description} iconKey="RERAComplianceChecklists" capabilities={reraComplianceChecklists.capabilities} benefits={reraComplianceChecklists.benefits}>
        <TableComponent title="Compliance Item Tracking" data={filteredComplianceItems} columns={complianceColumns} keyExtractor={(item) => item.id} maxHeight="max-h-[330px]" onRowClick={(item) => handleRowClick(item, 'Compliance Item Details', 'requirementName')}/>
      </FeatureCard>

      <FeatureCard title={digitalDocumentRepository.name} description={digitalDocumentRepository.description} iconKey="DigitalDocumentRepository" capabilities={digitalDocumentRepository.capabilities} benefits={digitalDocumentRepository.benefits}>
        <TableComponent title="Document Repository Overview" data={filteredDocuments} columns={documentColumns} keyExtractor={(item) => item.id} maxHeight="max-h-[330px]" onRowClick={(item) => handleRowClick(item, 'Document Details', 'documentName')}/>
      </FeatureCard>

       <ModalComponent isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
        <DetailViewDisplay item={selectedItem} />
      </ModalComponent>
    </div>
  );
};

const IconFeature: React.FC<{iconKey: string, large?:boolean}> = ({iconKey, large}) => {
    const Icon = FEATURE_ICONS[iconKey] || InformationCircleIcon;
    return <Icon className={`${large ? 'h-11 w-11' : 'h-9 w-9'} text-brand-accent mr-5 flex-shrink-0`} />;
}