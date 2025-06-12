

import React, { useState, useMemo } from 'react';
import { SalesCRMModule, Lead, UnitReservation, Broker, AutomatedCommunicationLog, UnitViewing, LeadInteraction, CustomField } from '../../types';
import { FeatureCard } from '../common/FeatureCard';
import { TableComponent, ColumnDefinition } from '../common/TableComponent';
import { SimplePieChart } from '../charts/SimplePieChart';
import { ModalComponent } from '../common/ModalComponent';
import { DetailViewDisplay } from '../common/DetailViewDisplay';
import { StarIcon, WalletIcon, ChatBubbleBottomCenterTextIcon, UserPlusIcon, ArrowTrendingUpIcon, ClockIcon, AcademicCapIcon as SolidAcademicCapIcon, TagIcon as SolidTagIcon, ShieldCheckIcon, UsersIcon as SolidUsersIcon, ChatBubbleLeftRightIcon, PresentationChartBarIcon } from '@heroicons/react/24/solid';
import { EyeIcon, InformationCircleIcon, UsersIcon } from '@heroicons/react/24/outline'; 
import { FEATURE_ICONS, UI_THEME_COLORS } from '../../constants';


interface SalesCrmDashboardProps {
  salesModule: SalesCRMModule;
  searchTerm: string;
}

type ModalItem = Lead | UnitReservation | Broker | AutomatedCommunicationLog | UnitViewing;

const filterData = <T extends object,>(data: T[], searchTerm: string, keysToSearch: (keyof T | string)[]) => {
  if (!searchTerm) return data;
  const lowerSearchTerm = searchTerm.toLowerCase();
  return data.filter(item =>
    keysToSearch.some(key => {
      const value = item[key as keyof T];
       if (typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm)) return true;
      if (typeof value === 'number' && value.toString().toLowerCase().includes(lowerSearchTerm)) return true;
      if (key === 'budgetRange' && typeof value === 'object' && value !== null) {
        const potentialBudget = value as { min?: unknown, max?: unknown };
        if (typeof potentialBudget.min === 'number' && potentialBudget.min.toString().toLowerCase().includes(lowerSearchTerm)) return true;
        if (typeof potentialBudget.max === 'number' && potentialBudget.max.toString().toLowerCase().includes(lowerSearchTerm)) return true;
      }
      if (key === 'interactionHistory' && Array.isArray(value)) return (value as LeadInteraction[]).some(interaction => interaction.summary.toLowerCase().includes(lowerSearchTerm) || interaction.type.toLowerCase().includes(lowerSearchTerm));
      if ((key === 'specialization' && Array.isArray(value)) && (value as string[]).some(spec => spec.toLowerCase().includes(lowerSearchTerm))) return true;
      if (key === 'positiveNotes' || key === 'negativeNotes' || key === 'outcome') return typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm);
      if (key === 'tags' && Array.isArray(value) && (value as string[]).some(tag => tag.toLowerCase().includes(lowerSearchTerm))) return true;
      if (key === 'customFields' && Array.isArray(value) && (value as CustomField[]).some(cf => cf.fieldName.toLowerCase().includes(lowerSearchTerm) || String(cf.fieldValue).toLowerCase().includes(lowerSearchTerm) )) return true;
      return false;
    })
  );
};


export const SalesCrmDashboard: React.FC<SalesCrmDashboardProps> = ({ salesModule, searchTerm }) => {
  const { leadProspectTracker, unitReservationBooking, brokerManagement, automatedCustomerCommunication, unitViewingFeedback } = salesModule.features;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ModalItem | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  const handleRowClick = <T extends ModalItem>(item: T, titlePrefix: string, identifierKey: keyof T) => {
    const mainIdentifierValue = item[identifierKey];
    let displayString = (mainIdentifierValue !== null && mainIdentifierValue !== undefined) ? String(mainIdentifierValue) :
                        (('id' in item && (item as {id?: any}).id) ? String((item as {id: any}).id) :
                         ('name' in item && (item as {name?: any}).name) ? String((item as {name: any}).name) :
                         ('unitNumber' in item && (item as {unitNumber?: any}).unitNumber) ? String((item as {unitNumber: any}).unitNumber) : 'Detail');
    setSelectedItem(item);
    setModalTitle(`${titlePrefix}: ${displayString}`);
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setSelectedItem(null); setModalTitle(''); };

  const filteredLeads = useMemo(() => filterData(leadProspectTracker.sampleLeads, searchTerm, ['name', 'status', 'assignedAgent', 'projectInterest', 'leadScore', 'preferredContactMethod', 'budgetRange', 'interactionHistory', 'tags', 'customFields']), [leadProspectTracker.sampleLeads, searchTerm]);
  const filteredReservations = useMemo(() => filterData(unitReservationBooking.sampleReservations, searchTerm, ['unitNumber', 'projectName', 'clientName', 'status']), [unitReservationBooking.sampleReservations, searchTerm]);
  const filteredBrokers = useMemo(() => filterData(brokerManagement.sampleBrokers, searchTerm, ['name', 'agency', 'status', 'specialization', 'leadsGenerated', 'averageDealClosureTimeDays']), [brokerManagement.sampleBrokers, searchTerm]);
  const filteredCommLogs = useMemo(() => filterData(automatedCustomerCommunication.sampleCommunicationLogs, searchTerm, ['customerName', 'communicationType', 'status']), [automatedCustomerCommunication.sampleCommunicationLogs, searchTerm]);
  const filteredViewings = useMemo(() => filterData(unitViewingFeedback.sampleViewings, searchTerm, ['leadName', 'unitNumber', 'projectName', 'agent', 'outcome', 'positiveNotes', 'negativeNotes']), [unitViewingFeedback.sampleViewings, searchTerm]);

  const leadStatusData = Object.entries(leadProspectTracker.sampleLeads.reduce((acc, lead) => { acc[lead.status] = (acc[lead.status] || 0) + 1; return acc; }, {} as Record<Lead['status'], number>)).map(([name, value]) => ({ name, value }));

  const leadColumns: ColumnDefinition<Lead>[] = [
    { key: 'name', header: 'Lead Name', render: item => <span className="font-semibold text-brand-accent text-base">{item.name}</span> },
    { key: 'projectInterest', header: 'Project Interest', render: item => <span className="text-sm">{item.projectInterest}</span>},
    { key: 'status', header: 'Status', render: item => {
        let bgColor = UI_THEME_COLORS.status.planning; let textColor = UI_THEME_COLORS.textDark;
        if (item.status === 'Closed - Won') { bgColor = UI_THEME_COLORS.status.completed; textColor = UI_THEME_COLORS.textLight;}
        else if (item.status === 'Closed - Lost') { bgColor = UI_THEME_COLORS.status.cancelled; textColor = UI_THEME_COLORS.textLight;}
        else if (item.status === 'New') { bgColor = UI_THEME_COLORS.status.pipeline; textColor = UI_THEME_COLORS.textLight;}
        else if (item.status === 'Qualified' || item.status === 'Proposal Sent' || item.status === 'Negotiation') { bgColor = UI_THEME_COLORS.status.inprogress; textColor = UI_THEME_COLORS.textLight;}
        else { bgColor = UI_THEME_COLORS.bgDeep; textColor = UI_THEME_COLORS.textMedium;} 
        return <span style={{backgroundColor: bgColor, color: textColor}} className={`text-xs capitalize px-3 py-1.5 rounded-md shadow-sm`}>{item.status}</span>
    }},
    { key: 'leadScore', header: 'Score', render: item => item.leadScore ? <span className="text-sm"><StarIcon className={`h-4.5 w-4.5 inline mr-1.5 ${item.leadScore > 75 ? 'text-brand-accent' : 'text-brand-accent-muted/70'}`} />{item.leadScore}</span> : <span className="text-brand-text-medium/70 italic text-sm">N/A</span> },
    { key: 'budgetRange', header: 'Budget', render: item => item.budgetRange ? <span className="text-sm"><WalletIcon className="h-4.5 w-4.5 inline mr-1.5 text-brand-success"/>${(item.budgetRange.min/1000).toFixed(0)}k-${(item.budgetRange.max/1000).toFixed(0)}k</span> : <span className="text-brand-text-medium/70 italic text-sm">N/A</span>},
    { key: 'meta', header: 'Meta', render: item => (
        <div className="flex space-x-3 items-center">
             {(item.interactionHistory && item.interactionHistory.length > 0) && <ChatBubbleBottomCenterTextIcon className="h-5.5 w-5.5 text-brand-secondary" title={`${item.interactionHistory.length} interactions`} />}
            {item.tags && item.tags.length > 0 && <SolidTagIcon className="h-5.5 w-5.5 text-brand-info" title={`Tags: ${item.tags.join(', ')}`} />}
            {item.customFields && item.customFields.length > 0 && <SolidAcademicCapIcon className="h-5.5 w-5.5 text-brand-accent-muted" title={`Custom Fields: ${item.customFields.length}`} />}
        </div>
    )},
    { key: 'assignedAgent', header: 'Agent', render: item => <span className="text-sm">{item.assignedAgent}</span> },
  ];

  const reservationColumns: ColumnDefinition<UnitReservation>[] = [
    { key: 'unitNumber', header: 'Unit No.', render: item => <span className="font-semibold text-base">{item.unitNumber}</span> }, { key: 'projectName', header: 'Project', render: item => <span className="text-sm">{item.projectName}</span> }, { key: 'clientName', header: 'Client', render: item => <span className="text-sm">{item.clientName}</span> },
    { key: 'status', header: 'Status', render: item => {
        let bgColor = UI_THEME_COLORS.status.planning; let textColor = UI_THEME_COLORS.textDark;
        if (item.status === 'Sold') { bgColor = UI_THEME_COLORS.status.sold; textColor = UI_THEME_COLORS.textLight;}
        else if (item.status === 'Reserved') { bgColor = UI_THEME_COLORS.status.reserved; textColor = UI_THEME_COLORS.textDark;}
        else if (item.status === 'Booking Confirmed') { bgColor = UI_THEME_COLORS.status.active; textColor = UI_THEME_COLORS.textLight;}
        else { bgColor = UI_THEME_COLORS.status.cancelled; textColor = UI_THEME_COLORS.textLight;}
        return <span style={{backgroundColor: bgColor, color: textColor}} className={`text-xs capitalize px-3 py-1.5 rounded-md shadow-sm`}>{item.status}</span>
    }},
    { key: 'salePrice', header: 'Sale Price', render: item => item.salePrice ? `$${item.salePrice.toLocaleString()}` : <span className="text-brand-text-medium/70 italic text-sm">N/A</span>}, { key: 'reservationDate', header: 'Res. Date', render: item => <span className="text-sm">{item.reservationDate}</span> },
  ];

  const brokerColumns: ColumnDefinition<Broker>[] = [
    { key: 'name', header: 'Broker Name', render: item => <span className="font-semibold text-base">{item.name}</span> }, { key: 'agency', header: 'Agency', render: item => <span className="text-sm">{item.agency}</span> },
    { key: 'performance', header: 'Performance', render: item => (
        <div className="flex space-x-3 items-center">
            {item.leadsGenerated !== undefined && <UserPlusIcon className="h-5 w-5 text-brand-info" title={`Leads: ${item.leadsGenerated}`} />}
            {item.leadToViewingRate !== undefined && <ArrowTrendingUpIcon className="h-5 w-5 text-brand-success" title={`LTV: ${item.leadToViewingRate.toFixed(0)}%`} />}
            {item.averageDealClosureTimeDays !== undefined && <ClockIcon className="h-5 w-5 text-brand-accent" title={`Avg. Closure: ${item.averageDealClosureTimeDays}d`} />}
        </div>
    )},
    { key: 'dealsClosed', header: 'Deals Closed' }, { key: 'commissionEarned', header: 'Commission', render: item => `$${item.commissionEarned.toLocaleString()}` }, { key: 'status', header: 'Status', render: item => <span className="text-sm">{item.status}</span> },
  ];

  const commLogColumns: ColumnDefinition<AutomatedCommunicationLog>[] = [
    { key: 'customerName', header: 'Customer', render: item => <span className="text-base">{item.customerName}</span> }, { key: 'communicationType', header: 'Type', render: item => <span className="text-sm">{item.communicationType}</span> },
    { key: 'channel', header: 'Channel', render: item => <span className="text-sm">{item.channel}</span> }, { key: 'sentDate', header: 'Sent Date', render: item => <span className="text-sm">{item.sentDate}</span> }, { key: 'status', header: 'Status', render: item => <span className="text-sm">{item.status}</span> },
  ];

  const viewingColumns: ColumnDefinition<UnitViewing>[] = [
    { key: 'leadName', header: 'Lead', render: item => <span className="text-base">{item.leadName}</span> }, { key: 'unitNumber', header: 'Unit', render: item => <span className="text-sm">{`${item.projectName} - ${item.unitNumber}`}</span>},
    { key: 'agent', header: 'Agent', render: item => <span className="text-sm">{item.agent}</span> }, { key: 'date', header: 'Date', render: item => <span className="text-sm">{item.date}</span> },
    { key: 'feedbackScore', header: 'Rating', render: item => item.feedbackScore ? <span className="text-brand-accent">{Array(item.feedbackScore).fill(null).map((_,i) => '★').join('')}</span> : <span className="text-brand-text-medium/70 italic text-sm">N/A</span> },
    { key: 'outcome', header: 'Outcome', render: item => <span className="text-sm">{item.outcome || <span className="text-brand-text-medium/70 italic">N/A</span>}</span> },
  ];

  return (
    <div className="space-y-12">
      <header className="pb-3">
        <h2 className="text-5xl font-heading font-semibold text-brand-text-light flex items-center">
            <UsersIcon className="h-11 w-11 mr-5 text-brand-accent"/>
            {salesModule.moduleName}
        </h2>
        <p className="text-xl text-brand-text-medium font-light ml-[66px] mt-1.5">Cultivating Relationships, Driving Success</p>
      </header>

      <section className="bg-brand-bg-deep/40 backdrop-blur-lg backdrop-saturate-150 shadow-2xl rounded-2xl p-8 border border-brand-text-light/10">
        <div className="flex items-start mb-6">
           <IconFeature iconKey="LeadProspectTracker" large />
           <div className="ml-1.5">
            <h3 className="text-3xl font-heading font-semibold text-brand-text-light">{leadProspectTracker.name}</h3>
            <p className="text-lg text-brand-text-medium font-light mt-1.5">Central hub for tracking and managing sales leads.</p>
           </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <TableComponent title="Active Leads Pipeline" data={filteredLeads} columns={leadColumns} keyExtractor={(item) => item.id} maxHeight="max-h-[420px]" onRowClick={(item) => handleRowClick(item, 'Lead Details', 'name')}/>
            </div>
            <div className="flex flex-col space-y-7">
                <SimplePieChart title="Lead Status Distribution" data={leadStatusData} height={350} />
            </div>
        </div>
      </section>

      <FeatureCard title={unitReservationBooking.name} description={unitReservationBooking.description} iconKey="UnitReservationBooking" benefits={unitReservationBooking.benefits}>
        <p className="text-base text-brand-text-medium mb-4 font-light">Integration: {unitReservationBooking.integration}</p>
        <TableComponent title="Unit Reservations & Bookings" data={filteredReservations} columns={reservationColumns} keyExtractor={(item) => item.unitId + item.clientName} maxHeight="max-h-[300px]" onRowClick={(item) => handleRowClick(item, 'Reservation Details', 'unitNumber')}/>
      </FeatureCard>

      <FeatureCard title={unitViewingFeedback.name} description={unitViewingFeedback.description} iconKey="UnitViewingFeedback" benefits={unitViewingFeedback.benefits}>
        <TableComponent title="Recent Unit Viewings & Feedback" data={filteredViewings} columns={viewingColumns} keyExtractor={(item) => item.id} maxHeight="max-h-[300px]" onRowClick={(item) => handleRowClick(item, 'Viewing Details', 'id')}/>
      </FeatureCard>

      <FeatureCard title={brokerManagement.name} iconKey="BrokerManagement" capabilities={brokerManagement.capabilities} benefits={brokerManagement.benefits}>
        <TableComponent title="Managed Brokers & Performance" data={filteredBrokers} columns={brokerColumns} keyExtractor={(item) => item.id} maxHeight="max-h-[300px]" onRowClick={(item) => handleRowClick(item, 'Broker Details', 'name')}/>
      </FeatureCard>

      <FeatureCard title={automatedCustomerCommunication.name} iconKey="AutomatedCustomerCommunication" capabilities={automatedCustomerCommunication.communications} benefits={automatedCustomerCommunication.benefits}>
        <TableComponent title="Recent Automated Communications Log" data={filteredCommLogs} columns={commLogColumns} keyExtractor={(item) => item.id} maxHeight="max-h-[300px]" onRowClick={(item) => handleRowClick(item, 'Communication Log', 'id')}/>
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