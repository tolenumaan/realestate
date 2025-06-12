

import React, { useState, useMemo } from 'react';
import { ProjectPropertySetupModule, ProjectBlueprintTemplate, PopulatedUnitDetail, UnitAvailabilityStatus, GeospatialLite, PaymentPlanInstallment, DefaultCostCategory, RequestedUpgrade, CustomField, PaymentAdherenceMetrics, AreaBreakdownItem, ProjectType } from '../../types';
import { FeatureCard } from '../common/FeatureCard';
import { TableComponent, ColumnDefinition } from '../common/TableComponent';
import { ModalComponent } from '../common/ModalComponent';
import { DetailViewDisplay } from '../common/DetailViewDisplay';
import { UnitDetailModalContent } from '../common/UnitDetailModalContent';
import { TagIcon as SolidTagIcon, AcademicCapIcon as SolidAcademicCapIcon, ScaleIcon as SolidScaleIcon, CheckCircleIcon, MapPinIcon as SolidMapPinIcon } from '@heroicons/react/24/solid';
import { WrenchScrewdriverIcon, EyeIcon, GlobeAltIcon, PaintBrushIcon, SparklesIcon, BuildingLibraryIcon, UsersIcon, CurrencyDollarIcon, InformationCircleIcon, ListBulletIcon, DocumentTextIcon, SquaresPlusIcon } from '@heroicons/react/24/outline';
import { FEATURE_ICONS, UI_THEME_COLORS } from '../../constants';

interface ProjectSetupDashboardProps {
  projectSetup: ProjectPropertySetupModule;
  searchTerm: string;
}

type ModalItem = ProjectBlueprintTemplate | PopulatedUnitDetail | GeospatialLite['sampleProjectLocations'][0];

const filterData = <T extends object,>(data: T[], searchTerm: string, keysToSearch: (keyof T | string)[]) => {
  if (!searchTerm) return data;
  const lowerSearchTerm = searchTerm.toLowerCase();

  return data.filter(item =>
    keysToSearch.some(key => {
      const value = item[key as keyof T];
      if (typeof value === 'string' && value.toLowerCase().includes(lowerSearchTerm)) return true;
      if (typeof value === 'number' && value.toString().toLowerCase().includes(lowerSearchTerm)) return true;
      if (Array.isArray(value)) {
        if (key === 'unitFeatures' && (value as string[]).some(feature => typeof feature === 'string' && feature.toLowerCase().includes(lowerSearchTerm))) return true;
        if (key === 'requestedUpgrades' && (value as RequestedUpgrade[]).some(upg => typeof upg.upgradeName === 'string' && upg.upgradeName.toLowerCase().includes(lowerSearchTerm))) return true;
        if (key === 'tags' && (value as string[]).some(tag => typeof tag === 'string' && tag.toLowerCase().includes(lowerSearchTerm))) return true;
        if (key === 'customFields' && (value as CustomField[]).some(cf =>
            (typeof cf.fieldName === 'string' && cf.fieldName.toLowerCase().includes(lowerSearchTerm)) ||
            (cf.fieldValue !== undefined && cf.fieldValue !== null && String(cf.fieldValue).toLowerCase().includes(lowerSearchTerm)) )) return true;
        if (key === 'amenities' && (value as string[]).some(amenity => typeof amenity === 'string' && amenity.toLowerCase().includes(lowerSearchTerm))) return true;
      }
      if (key === 'availabilityStatus' && value && typeof value === 'string') return (value as UnitAvailabilityStatus).toString().toLowerCase().includes(lowerSearchTerm);
      if (key === 'type' && value && typeof value === 'string') return value.toString().toLowerCase().includes(lowerSearchTerm);
      if ((key === 'selectedFinishesPackage' || key === 'orientation' || key === 'floorPlanVersion') && typeof value === 'string') return value.toLowerCase().includes(lowerSearchTerm);
      if (key === 'paymentAdherence' && typeof value === 'object' && value !== null) {
          const pa = value as unknown as PaymentAdherenceMetrics;
          if (pa.onTimePaymentPercentage?.toString().includes(lowerSearchTerm)) return true;
          if (pa.nextPaymentDueDate && typeof pa.nextPaymentDueDate === 'string' && pa.nextPaymentDueDate.toLowerCase().includes(lowerSearchTerm)) return true;
      }
      return false;
    })
  );
};

const ProjectBlueprintCard: React.FC<{blueprint: ProjectBlueprintTemplate, onClick: () => void}> = ({ blueprint, onClick }) => {
    const Icon = FEATURE_ICONS['DubaiProjectBlueprint'] || SquaresPlusIcon; // Changed to SquaresPlusIcon for blueprint concept
    let imageUrl = `https://picsum.photos/seed/${blueprint.type.replace(/\s+/g, '')}/500/300`;
    
    return (
        <div
            className="bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 shadow-xl rounded-xl border border-brand-text-light/15 hover:shadow-brand-accent/30 hover:border-brand-accent-muted/50 transition-all duration-300 cursor-pointer flex flex-col justify-between h-full overflow-hidden group transform hover:-translate-y-1.5"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
        >
            <div className="relative h-52"> {/* Increased image height */}
                <img src={imageUrl} alt={blueprint.type} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(blueprint.type.substring(0,2))}&background=6A2E5D&color=F0E8F3&size=500&height=300&font-size=0.2&bold=true`} />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg-surface/80 via-brand-bg-surface/40 to-transparent opacity-85 group-hover:opacity-75 transition-opacity duration-300"></div>
            </div>
            <div className="p-7 flex-grow flex flex-col justify-between">
                <div>
                    <div className="flex items-center mb-4">
                        <Icon className="h-7 w-7 text-brand-accent mr-3.5 flex-shrink-0" /> {/* Adjusted icon size */}
                        <h4 className="text-2xl font-heading font-semibold text-brand-text-light capitalize leading-tight">{blueprint.type}</h4>
                    </div>
                    <p className="text-sm text-brand-text-medium font-light mb-4">
                        Features: {blueprint.revenueStreams.length} Revenue Streams &bull; {blueprint.defaultCostCategories.length} Cost Categories &bull; {blueprint.paymentPlanStructures.length} Payment Plans
                    </p>
                    <p className="text-sm text-brand-text-medium/80 mt-1">
                        Key Cost Areas: {blueprint.defaultCostCategories.slice(0, 2).map(c => c.categoryName).join(', ') + (blueprint.defaultCostCategories.length > 2 ? '...' : '')}
                    </p>
                </div>
                 <button 
                    className="mt-6 w-full text-xs py-1.5 px-3 bg-brand-primary/60 hover:bg-brand-primary/80 text-brand-accent-muted hover:text-brand-accent rounded-md transition-colors duration-200 font-medium flex items-center justify-center group-hover:shadow-lg border border-transparent hover:border-brand-accent/50"
                    aria-label={`View details for ${blueprint.type}`}
                >
                    View Blueprint Details <EyeIcon className="h-3.5 w-3.5 ml-2 transition-transform group-hover:translate-x-0.5" />
                </button>
            </div>
        </div>
    );
};

export const ProjectSetupDashboard: React.FC<ProjectSetupDashboardProps> = ({ projectSetup, searchTerm }) => {
  const { dubaiProjectBlueprint, unitInventoryManager, geospatialLite } = projectSetup.features;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ModalItem | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  const handleItemClick = (item: ModalItem, title: string) => {
    setSelectedItem(item);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setModalTitle('');
  };

  const filteredBlueprintTemplates = useMemo(() =>
    filterData(dubaiProjectBlueprint.templates, searchTerm, ['type']),
    [dubaiProjectBlueprint.templates, searchTerm]
  );

  const filteredUnits = useMemo(() =>
    filterData(unitInventoryManager.sampleUnits, searchTerm, [
        'unitNumber', 'projectName', 'availabilityStatus', 'bedrooms', 'size', 'initialPrice',
        'unitFeatures', 'view', 'selectedFinishesPackage', 'orientation', 'floorPlanVersion', 'requestedUpgrades',
        'tags', 'customFields', 'paymentAdherence'
    ]),
    [unitInventoryManager.sampleUnits, searchTerm]
  );

  const filteredLocations = useMemo(() =>
    filterData(geospatialLite.sampleProjectLocations, searchTerm, ['name', 'amenities']),
    [geospatialLite.sampleProjectLocations, searchTerm]
  );

  const unitColumns: ColumnDefinition<PopulatedUnitDetail>[] = [
    { key: 'thumbnail', header: 'Image', render: item => (
        <img
            src={item.floorPlanUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.unitNumber.substring(0,2))}&background=B08D57&color=120E16&size=128&font-size=0.4&bold=true&rounded=true`}
            alt={`Unit ${item.unitNumber}`}
            className="w-24 h-16 rounded-lg object-cover border-2 border-brand-border-accent/30 shadow-md"
            onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=Err&background=B5484D&color=F0E8F3&size=128&font-size=0.4&bold=true&rounded=true`}
        />
    )},
    { key: 'unitNumber', header: 'Unit No.', render: item => <span className="font-semibold text-brand-accent text-lg">{item.unitNumber}</span>},
    { key: 'projectName', header: 'Project', render: item => <span className="text-base">{item.projectName}</span>},
    { key: 'bedrooms', header: 'Type', render: item => `${item.bedrooms} BR`},
    { key: 'initialPrice', header: 'Price', render: item => `$${item.initialPrice.toLocaleString()}` },
    { key: 'availabilityStatus', header: 'Status', render: item => {
        let bgColor = UI_THEME_COLORS.status.planning;
        let textColor = UI_THEME_COLORS.textDark; 
        if (item.availabilityStatus === UnitAvailabilityStatus.Sold) { bgColor = UI_THEME_COLORS.status.sold; textColor = UI_THEME_COLORS.textLight; }
        else if (item.availabilityStatus === UnitAvailabilityStatus.Available) { bgColor = UI_THEME_COLORS.status.available; textColor = UI_THEME_COLORS.textDark; } 
        else if (item.availabilityStatus === UnitAvailabilityStatus.Reserved) { bgColor = UI_THEME_COLORS.status.reserved; textColor = UI_THEME_COLORS.textDark; } 
        else { textColor = UI_THEME_COLORS.textLight;} 
        return <span style={{backgroundColor: bgColor, color: textColor}} className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm`}>{item.availabilityStatus}</span>
    }},
    { key: 'details', header: 'Details', render: item => (
        <div className="flex space-x-3 items-center">
            {item.selectedFinishesPackage && <PaintBrushIcon className="h-5 w-5 text-brand-secondary" title={`Finishes: ${item.selectedFinishesPackage}`} />}
            {(item.requestedUpgrades && item.requestedUpgrades.length > 0) && <SparklesIcon className="h-5 w-5 text-brand-accent" title={`Upgrades: ${item.requestedUpgrades.length}`} />}
            {item.orientation && <GlobeAltIcon className="h-5 w-5 text-brand-info" title={`Orientation: ${item.orientation}`} />}
            {item.lastMaintenanceDate && <WrenchScrewdriverIcon className="h-5 w-5 text-brand-warning" title={`Last Maint: ${item.lastMaintenanceDate}`}/>}
        </div>
    )},
    { key: 'meta', header: 'Meta', render: item => (
        <div className="flex space-x-3 items-center">
            {item.tags && item.tags.length > 0 && <SolidTagIcon className="h-5 w-5 text-brand-accent-muted" title={`Tags: ${item.tags.join(', ')}`} />}
            {item.customFields && item.customFields.length > 0 && <SolidAcademicCapIcon className="h-5 w-5 text-brand-primary" title={`Custom Fields: ${item.customFields.length}`} />}
            {item.paymentAdherence && (
                <SolidScaleIcon
                    className={`h-5 w-5 ${item.paymentAdherence.onTimePaymentPercentage >= 80 ? 'text-brand-success' : item.paymentAdherence.onTimePaymentPercentage >= 50 ? 'text-brand-warning' : 'text-brand-danger'}`}
                    title={`Payment Adherence: ${item.paymentAdherence.onTimePaymentPercentage.toFixed(0)}% on time`} />
            )}
        </div>
    )}
  ];

  const locationColumns: ColumnDefinition<typeof geospatialLite.sampleProjectLocations[0]>[] = [
      { key: 'name', header: 'Project Name', render: item => <span className="font-semibold text-brand-accent text-base">{item.name}</span> },
      { key: 'lat', header: 'Latitude' },
      { key: 'long', header: 'Longitude' },
      { key: 'amenities', header: 'Nearby Amenities', render: item => <span className="text-sm">{item.amenities.slice(0,3).join(', ') + (item.amenities.length > 3 ? '...' : '')}</span> },
  ];

  const totalUnits = unitInventoryManager.sampleUnits.length;
  const availableUnits = unitInventoryManager.sampleUnits.filter(u => u.availabilityStatus === UnitAvailabilityStatus.Available).length;
  const soldUnits = unitInventoryManager.sampleUnits.filter(u => u.availabilityStatus === UnitAvailabilityStatus.Sold).length;

  return (
    <div className="space-y-12">
      <header className="pb-3">
        <h2 className="text-5xl font-heading font-semibold text-brand-text-light flex items-center">
            <BuildingLibraryIcon className="h-9 w-9 mr-5 text-brand-accent"/>
            {projectSetup.moduleName}
        </h2>
        <p className="text-xl text-brand-text-medium font-light ml-[58px] mt-1.5">Strategic Foundation for Premier Developments</p>
      </header>
      
      <section>
        <div className="flex items-start mb-6">
          <IconFeature iconKey="DubaiProjectBlueprint" large />
          <div className="ml-1.5">
            <h3 className="text-3xl font-heading font-semibold text-brand-text-light">{dubaiProjectBlueprint.name}</h3>
            <p className="text-lg text-brand-text-medium font-light mt-1.5">{dubaiProjectBlueprint.description}</p>
          </div>
        </div>
        {dubaiProjectBlueprint.benefits && dubaiProjectBlueprint.benefits.length > 0 && (
            <ul className="list-none space-y-2.5 mb-8 ml-[66px]">
                {dubaiProjectBlueprint.benefits.map((benefit, index) => (
                <li key={index} className="text-base text-brand-text-medium flex items-start">
                    <span className={`inline-block h-2 w-2 rounded-full bg-brand-accent-muted mr-3.5 mt-[7px] flex-shrink-0`}></span>
                    <span>{benefit}</span>
                </li>
                ))}
            </ul>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlueprintTemplates.length > 0 ? filteredBlueprintTemplates.map(template => (
                <ProjectBlueprintCard
                    key={template.type}
                    blueprint={template}
                    onClick={() => handleItemClick(template, `Blueprint Details: ${template.type}`)}
                />
            )) : <p className="text-brand-text-medium italic md:col-span-full text-center py-10 text-lg">No blueprint templates match your search criteria.</p>}
        </div>
      </section>

      <section className="bg-brand-bg-deep/40 backdrop-blur-lg backdrop-saturate-150 shadow-2xl rounded-2xl p-8 border border-brand-text-light/10">
        <div className="flex items-start mb-6">
           <IconFeature iconKey="UnitInventoryManager" large />
           <div className="ml-1.5">
             <h3 className="text-3xl font-heading font-semibold text-brand-text-light">{unitInventoryManager.name}</h3>
             <p className="text-lg text-brand-text-medium font-light mt-1.5">{unitInventoryManager.description}</p>
           </div>
        </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-7 text-center">
            <div className="bg-brand-bg-surface/50 backdrop-blur-md p-5 rounded-lg shadow-lg border border-brand-text-light/10">
                <p className="text-4xl font-bold text-brand-accent">{totalUnits}</p>
                <p className="text-sm text-brand-text-medium mt-1.5">Total Units</p>
            </div>
            <div className="bg-brand-bg-surface/50 backdrop-blur-md p-5 rounded-lg shadow-lg border border-brand-text-light/10">
                <p className="text-4xl font-bold text-brand-success">{availableUnits}</p>
                <p className="text-sm text-brand-text-medium mt-1.5">Available</p>
            </div>
            <div className="bg-brand-bg-surface/50 backdrop-blur-md p-5 rounded-lg shadow-lg border border-brand-text-light/10">
                <p className="text-4xl font-bold text-brand-danger">{soldUnits}</p>
                <p className="text-sm text-brand-text-medium mt-1.5">Sold</p>
            </div>
             <div className="bg-brand-bg-surface/50 backdrop-blur-md p-5 rounded-lg shadow-lg border border-brand-text-light/10">
                <p className="text-lg text-brand-text-light pt-1.5">{unitInventoryManager.unitDetails.bedrooms}BR, {unitInventoryManager.unitDetails.size}{unitInventoryManager.unitDetails.sizeUnit}</p>
                <p className="text-sm text-brand-text-medium mt-1.5">Base Unit Config</p>
            </div>
        </div>
        <TableComponent
            title="Detailed Unit Inventory"
            data={filteredUnits}
            columns={unitColumns}
            keyExtractor={(item) => item.id}
            maxHeight="max-h-[500px]"
            onRowClick={(item) => handleItemClick(item, `Unit Details: ${item.unitNumber}`)}
        />
      </section>

      <FeatureCard
        title={geospatialLite.name}
        description={geospatialLite.description}
        iconKey="GeospatialLite"
        capabilities={geospatialLite.capabilities}
        benefits={geospatialLite.benefits}
      >
        <TableComponent
            title="Sample Project Locations & Proximity Data"
            data={filteredLocations}
            columns={locationColumns}
            keyExtractor={(item) => item.name}
            maxHeight="max-h-[300px]"
            onRowClick={(item) => handleItemClick(item, `Location Details: ${item.name}`)}
         />
      </FeatureCard>

      <ModalComponent
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
      >
        {selectedItem && 'unitNumber' in selectedItem && typeof selectedItem.unitNumber === 'string' ? (
          <UnitDetailModalContent
            unit={selectedItem as PopulatedUnitDetail}
          />
        ) : (
          <DetailViewDisplay item={selectedItem} />
        )}
      </ModalComponent>
    </div>
  );
};

const IconFeature: React.FC<{iconKey: string, large?: boolean}> = ({iconKey, large}) => {
    const Icon = FEATURE_ICONS[iconKey] || InformationCircleIcon;
    return <Icon className={`${large ? 'h-9 w-9' : 'h-8 w-8'} text-brand-accent mr-5 flex-shrink-0`} />;
}
