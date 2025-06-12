
import { 
  PlatformData, PlatformInfo, PlatformModules, 
  ProjectPropertySetupModule, FinancialPaymentPlanModule, SalesCRMModule, ProjectProgressComplianceModule, ReportingDecisionSupportModule,
  FacilitiesManagementModule, FacilityAsset, MaintenanceTask, ServiceProvider, MaintenanceLogEntry, AssetRegisterFeature, MaintenanceSchedulerFeature, ServiceProviderDirectoryFeature,
  ProjectType, UnitSizeUnit, UnitAvailabilityStatus, PopulatedUnitDetail, RequestedUpgrade, AreaBreakdownItem, PaymentAdherenceMetrics, CustomField,
  CashFlowDataPoint, ReceivablePayment, ExpenseItem, Lead, UnitReservation, Broker, AutomatedCommunicationLog, LeadInteraction, UnitViewing, UnitViewingFeedbackFeature,
  MilestoneStatus, MilestoneSubTask, MediaUpload, ComplianceItem, StoredDocument, DocumentVersion, DocumentAccessLogEntry, QualityInspectionRecord, QualityInspectionChecklistItem, QualityChecklistFeature,
  ProjectHealthMetric, ProfitabilityData, GeneratedReport, OverviewProject, PaymentPlanStructure, PaymentPlanInstallment, OverviewProjectActivity,
  DefaultCostCategory, CostSubCategory, Invoice, InvoiceTrackingFeature, AssetComponent
} from '../types';
import { MOCK_PROJECT_NAMES, MOCK_BUYER_NAMES, MOCK_AGENT_NAMES, MOCK_BROKER_AGENCIES, MOCK_MILESTONES_GENERAL, MOCK_DOCUMENT_TYPES_GENERAL, MOCK_TECHNICIAN_NAMES } from '../constants';

const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

const randomNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals: number = 2): number => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const selectRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const selectRandomMultiple = <T,>(arr: T[], maxCount: number): T[] => {
    const count = randomNumber(1, Math.min(maxCount, arr.length));
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
const generateId = (): string => Math.random().toString(36).substr(2, 9);

// --- Fine-grained Data Generation Helpers (NEW & UPDATED) ---

const generateCustomFields = (count: number): CustomField[] => {
    const fieldNames = ["Legacy ID", "Internal Rating", "Market Segment Code", "Special Handling Required", "Next Review Date", "External System Link"];
    const fieldTypes: CustomField['fieldType'][] = ['text', 'number', 'date', 'boolean'];
    return Array.from({ length: count }, () => {
        const fieldType = selectRandom(fieldTypes);
        let fieldValue: string | number | boolean | Date;
        switch (fieldType) {
            case 'number': fieldValue = randomNumber(1, 1000); break;
            case 'date': fieldValue = new Date(randomDate(new Date(2022,0,1), new Date(2025,0,1))); break;
            case 'boolean': fieldValue = Math.random() > 0.5; break;
            default: fieldValue = `CF-${generateId().substring(0,5)}`; break;
        }
        return {
            fieldName: selectRandom(fieldNames),
            fieldType,
            fieldValue,
        };
    });
};

const generateTags = (count: number): string[] => {
    const allTags = ["High Priority", "Investor Target", "Luxury", "Eco-Friendly", "Phase 1", "Phase 2", "Under Review", "Flagged", "Premium Location", "Fast Track"];
    return selectRandomMultiple(allTags, count);
};

const calculatePaymentAdherence = (unit: PopulatedUnitDetail, allInvoices: Invoice[]): PaymentAdherenceMetrics | undefined => {
    if (unit.availabilityStatus !== UnitAvailabilityStatus.Sold && unit.availabilityStatus !== UnitAvailabilityStatus.Reserved) {
        return undefined;
    }

    const unitInvoices = allInvoices.filter(inv => inv.unitId === unit.id);
    if (unitInvoices.length === 0) return undefined;

    let totalDaysOverdue = 0;
    let paidOnTimeCount = 0;
    let paidInstallmentsCount = 0;
    let overdueInstallments = 0;
    const today = new Date();
    let nextDueDate: string | undefined = undefined;
    let lastPaymentAmount: number | undefined = undefined;
    let lastPaymentDate: string | undefined = undefined;

    unitInvoices.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    for (const invoice of unitInvoices) {
        if (invoice.status === 'Paid' && invoice.paymentDate) {
            paidInstallmentsCount++;
            const dueDate = new Date(invoice.dueDate);
            const paymentDate = new Date(invoice.paymentDate);
            const daysDiff = (paymentDate.getTime() - dueDate.getTime()) / (1000 * 3600 * 24);
            if (daysDiff > 0) {
                totalDaysOverdue += daysDiff;
            }
            if (daysDiff <= 0) { // Paid on or before due date
                paidOnTimeCount++;
            }
            if (!lastPaymentDate || paymentDate > new Date(lastPaymentDate)) {
                lastPaymentDate = invoice.paymentDate;
                lastPaymentAmount = invoice.amountDue;
            }
        } else if (invoice.status === 'Overdue' || ( (invoice.status === 'Sent' || invoice.status === 'Draft') && new Date(invoice.dueDate) < today ) ) {
            overdueInstallments++;
        }

        if ((invoice.status === 'Sent' || invoice.status === 'Draft' || invoice.status === 'Overdue') && new Date(invoice.dueDate) >= today) {
            if (!nextDueDate || new Date(invoice.dueDate) < new Date(nextDueDate)) {
                nextDueDate = invoice.dueDate;
            }
        }
    }
    
    return {
        averageDaysOverdue: paidInstallmentsCount > 0 ? totalDaysOverdue / paidInstallmentsCount : 0,
        onTimePaymentPercentage: paidInstallmentsCount > 0 ? (paidOnTimeCount / paidInstallmentsCount) * 100 : 100,
        totalInstallments: unitInvoices.length,
        overdueInstallments,
        nextPaymentDueDate: nextDueDate,
        lastPaymentAmount: lastPaymentAmount,
        lastPaymentDate: lastPaymentDate,
    };
};


const generateRequestedUpgrades = (count: number): RequestedUpgrade[] => {
    const upgradeNames = ["Marble Flooring", "Smart Thermostat", "Premium Kitchen Appliances", "Jacuzzi Tub", "Extended Balcony"];
    return Array.from({ length: count }, () => ({
        upgradeName: selectRandom(upgradeNames),
        cost: randomNumber(1000, 25000),
        status: selectRandom(['Requested', 'Approved', 'Installed', 'Rejected'] as const),
        notes: Math.random() > 0.7 ? selectRandom(["Client to confirm by EOD.", "Awaiting stock.", "Requires custom order."]) : undefined,
    }));
};

const generateAreaBreakdown = (totalArea: number): AreaBreakdownItem[] => {
    const rooms = ["Living Room", "Master Bedroom", "Kitchen", "Bathroom 1", "Balcony"];
    const breakdown: AreaBreakdownItem[] = [];
    let remainingArea = totalArea;
    for (let i = 0; i < randomNumber(2, rooms.length); i++) {
        if (remainingArea <= 0) break;
        const roomArea = Math.min(remainingArea, randomNumber(Math.floor(totalArea * 0.1), Math.floor(totalArea * 0.4)));
        breakdown.push({ roomName: rooms[i], areaSqft: roomArea });
        remainingArea -= roomArea;
    }
    if (remainingArea > 0 && breakdown.length > 0) { // Add remaining to last item or as a new "Other"
        breakdown[breakdown.length - 1].areaSqft += remainingArea;
    } else if (remainingArea > 0) {
        breakdown.push({ roomName: "Other", areaSqft: remainingArea });
    }
    return breakdown;
};

const generateCostSubCategories = (count: number, totalPercentageForParent: number): CostSubCategory[] => {
    const subCategoryNames = ["Site Work", "Foundation", "Structural Steel", "HVAC Systems", "Electrical Wiring", "Interior Finishes", "Landscaping"];
    let remainingPercentage = totalPercentageForParent;
    return Array.from({length: count}, (_, i) => {
        const perc = i === count -1 ? remainingPercentage : randomNumber(Math.floor(totalPercentageForParent * 0.1), Math.min(Math.floor(totalPercentageForParent * 0.4), remainingPercentage));
        remainingPercentage -= perc;
        return {
            name: selectRandom(subCategoryNames),
            estimatedPercentage: Math.max(0, perc), // Ensure non-negative
            notes: Math.random() > 0.8 ? "High variability component." : undefined,
        };
    }).filter(sc => sc.estimatedPercentage > 0);
};

const generateDefaultCostCategories = (count: number): DefaultCostCategory[] => {
    const categories = ["Site Preparation & Demolition", "Foundation & Substructure", "Superstructure", "Exterior & Facade", "Interior Construction & Finishes", "MEP Systems", "External Works & Landscaping"];
    let totalOverallPercentage = 100;
    return Array.from({length: count}, (_, i) => {
        const parentPercentage = i === count - 1 ? totalOverallPercentage : randomNumber(10, Math.min(40, totalOverallPercentage - (count - 1 - i)*5));
        totalOverallPercentage -= parentPercentage;
        const subCats = generateCostSubCategories(randomNumber(2,4), parentPercentage);
        return {
            categoryName: categories[i % categories.length],
            subCategories: subCats,
            totalEstimatedPercentage: subCats.reduce((sum, sc) => sum + sc.estimatedPercentage, 0),
        }
    }).filter(cat => cat.totalEstimatedPercentage > 0);
};

const generateLeadInteractions = (count: number): LeadInteraction[] => {
    const interactionTypes: LeadInteraction['type'][] = ['Call', 'Email', 'Meeting', 'Site Visit', 'SMS', 'Chat'];
    return Array.from({ length: count }, () => ({
        date: randomDate(new Date(2023, 8, 1), new Date(2024, 0, 15)),
        type: selectRandom(interactionTypes),
        agent: selectRandom(MOCK_AGENT_NAMES),
        summary: selectRandom(["Discussed pricing options.", "Scheduled site visit.", "Sent brochure.", "Followed up on proposal."]),
        nextAction: Math.random() > 0.5 ? selectRandom(["Send follow-up email", "Call to confirm", "Prepare offer"]) : undefined,
        nextActionDate: Math.random() > 0.3 ? randomDate(new Date(2024, 0, 16), new Date(2024, 1, 15)) : undefined,
        durationMinutes: Math.random() > 0.5 ? randomNumber(15, 60) : undefined,
    }));
};

const generateUnitViewings = (count: number, leads: Lead[], units: PopulatedUnitDetail[]): UnitViewing[] => {
    if (leads.length === 0 || units.length === 0) return [];
    return Array.from({ length: count }, () => {
        const lead = selectRandom(leads);
        const unit = selectRandom(units);
        return {
            id: `VW-${generateId().toUpperCase()}`,
            date: randomDate(new Date(2023, 9, 1), new Date(2024, 0, 15)),
            leadId: lead.id,
            leadName: lead.name,
            agent: selectRandom(MOCK_AGENT_NAMES),
            unitId: unit.id,
            unitNumber: unit.unitNumber,
            projectName: unit.projectName,
            feedbackScore: Math.random() > 0.2 ? selectRandom([1, 2, 3, 4, 5] as const) : undefined,
            positiveNotes: Math.random() > 0.5 ? selectRandom(["Loved the view!", "Spacious layout.", "Good amenities."]) : undefined,
            negativeNotes: Math.random() > 0.6 ? selectRandom(["Price is a bit high.", "Kitchen too small.", "Needs more storage."]) : undefined,
            outcome: Math.random() > 0.4 ? selectRandom(['Interested', 'Not Interested', 'Follow-up Required', 'Offer Made'] as const) : undefined,
        };
    });
};

const generateDocumentVersions = (count: number, initialFilePath: string, docName: string): DocumentVersion[] => {
    let currentVersion = 1;
    let currentMinor = 0;
    return Array.from({ length: count }, (_,i) => {
        if (i > 0 && Math.random() > 0.3) { // New major version
            currentVersion++;
            currentMinor = 0;
        } else if (i > 0) { // New minor version
            currentMinor++;
        }
        return {
            version: `v${currentVersion}.${currentMinor}`,
            uploadDate: randomDate(new Date(2022, 0, 1 + i*10), new Date(2023, 11, 30)),
            uploadedBy: selectRandom(MOCK_AGENT_NAMES),
            changeReason: selectRandom(["Initial draft", "Minor revisions", "Approved version", "Updated clauses", "Corrected typos"]),
            filePath: initialFilePath.replace('.pdf', `_v${currentVersion}.${currentMinor}.pdf`),
        };
    }).sort((a,b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()); // Ensure chronological order
};

const generateDocumentAccessLog = (count: number): DocumentAccessLogEntry[] => {
    const userNames = MOCK_AGENT_NAMES.concat(MOCK_BUYER_NAMES.slice(0,3));
    return Array.from({ length: count }, () => ({
        userId: `user-${generateId()}`,
        userName: selectRandom(userNames),
        accessDate: randomDate(new Date(2023, 0, 1), new Date(2024, 0, 15)),
        action: selectRandom(['Viewed', 'Downloaded', 'Shared', 'Edited', 'VersionChanged'] as const),
    }));
};

const generateQualityInspectionChecklistItems = (count: number): QualityInspectionChecklistItem[] => {
    const items = ["Paint finish quality", "Fixture installation accuracy", "Floor leveling", "Window sealing", "Electrical socket functionality", "Plumbing leak check"];
    return Array.from({ length: count }, () => ({
        item: selectRandom(items),
        status: selectRandom(['Pass', 'Fail', 'Observation', 'Not Applicable'] as const),
        notes: Math.random() > 0.6 ? selectRandom(["Minor scratch noted.", "Requires adjustment.", "Exceeds standard."]) : undefined,
        photoUrl: Math.random() > 0.7 ? `https://picsum.photos/seed/${generateId()}/200/150` : undefined,
        correctedDate: Math.random() > 0.8 ? randomDate(new Date(2023, 10,1), new Date(2023, 11, 15)) : undefined,
    }));
};

const generateAssetComponents = (count: number, assetType: string): AssetComponent[] => {
    const componentNames: Record<string, string[]> = {
        'HVAC': ["Compressor", "Fan Motor", "Thermostat", "Filter Bank"],
        'Elevator': ["Motor Unit", "Control Panel", "Door Mechanism", "Safety Brakes"],
        'Plumbing System': ["Main Pump", "Water Heater", "Pressure Valve"],
        'Electrical Panel': ["Main Breaker", "Circuit Breaker A1", "Surge Protector"],
        'Default': ["Primary Unit", "Sensor Array", "Power Supply", "Housing"]
    };
    const names = componentNames[assetType] || componentNames['Default'];
    return Array.from({length: count}, (_,i) => ({
        componentId: `COMP-${assetType.substring(0,3).toUpperCase()}-${generateId().substring(0,4)}-${i+1}`,
        name: selectRandom(names),
        serialNumber: Math.random() > 0.3 ? `SN-${randomNumber(100000,999999)}` : undefined,
        installDate: randomDate(new Date(2020,0,1), new Date(2022,0,1)),
        warrantyExpiryDate: Math.random() > 0.5 ? randomDate(new Date(2024,0,1), new Date(2026,0,1)) : undefined,
        lastServiceDate: Math.random() > 0.4 ? randomDate(new Date(2022,6,1), new Date(2023,11,1)) : undefined,
        manufacturer: Math.random() > 0.6 ? selectRandom(["Generic Corp", "GlobalTech", "Reliable Parts Co."]) : undefined,
        status: selectRandom(['Operational', 'Needs Repair', 'Replaced'] as const),
    }));
};

// --- Main Entity Generation Functions (Updated) ---

const generatePaymentPlanStructures = (count: number): PaymentPlanStructure[] => {
    const plans: PaymentPlanStructure[] = [];
    const planNames = ["Standard 20/80", "Aggressive 40/60", "Post-Handover 10/90", "Milestone-Based A", "Milestone-Based B"];
    for (let i = 0; i < count; i++) {
        const installments: PaymentPlanInstallment[] = [];
        let remainingPercentage = 100;
        const numInstallments = randomNumber(3,6);
        for(let j=0; j < numInstallments; j++) {
            const perc = j === numInstallments -1 ? remainingPercentage : randomNumber(10, Math.min(30, remainingPercentage - (numInstallments - 1 - j)*5));
            remainingPercentage -= perc;
            installments.push({
                percentage: perc,
                milestone: selectRandom(['Booking', '20% Construction', '40% Construction', 'Slab Completion', 'Structure Complete', 'Handover', '1 Year Post-Handover'] as const),
                dueDate: j > 0 && Math.random() > 0.5 ? randomDate(new Date(2024, 0, 1), new Date(2026,11,31)) : undefined,
                invoiceId: undefined // Will be linked when invoices are generated
            });
            if(remainingPercentage <=0) break;
        }
        plans.push({
            planName: selectRandom(planNames) + ` Var ${i+1}`,
            installments,
        });
    }
    return plans;
}

const generatePopulatedUnitDetails = (count: number, projectName: string, allInvoices: Invoice[]): PopulatedUnitDetail[] => {
    const allFeatures = ["Balcony", "Smart Home Ready", "Sea View Upgrade", "Private Garden", "Pool Access", "Gym Membership Included", "Covered Parking", "High Floor"];
    const finishPackages = ["Standard", "Premium", "Luxury Gold", "Modern Minimalist"];
    const orientations: PopulatedUnitDetail['orientation'][] = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];

    return Array.from({ length: count }, (_, i) => {
        const size = randomNumber(500, 3000);
        const unit: PopulatedUnitDetail = {
            id: generateId(),
            unitNumber: `${String.fromCharCode(65 + Math.floor(i/20))}-${(i%20)+1}${randomNumber(0,9)}`, // Adjusted for more units per floor/block
            projectName,
            size,
            sizeUnit: selectRandom(Object.values(UnitSizeUnit)),
            bedrooms: randomNumber(1,5),
            initialPrice: randomNumber(500000, 5000000),
            currentPrice: randomNumber(550000, 5500000),
            availabilityStatus: selectRandom(Object.values(UnitAvailabilityStatus)),
            view: selectRandom(['City View', 'Sea View', 'Garden View', 'Pool View', 'Partial Sea View', undefined] as const),
            floor: randomNumber(1,50),
            unitFeatures: selectRandomMultiple(allFeatures, randomNumber(1,4)),
            lastMaintenanceDate: Math.random() > 0.3 ? randomDate(new Date(2022, 0, 1), new Date(2023, 11, 31)) : undefined,
            floorPlanUrl: `https://picsum.photos/seed/unit${generateId()}/400/300`, // Ensure URL
            // Fine-grained
            selectedFinishesPackage: Math.random() > 0.4 ? selectRandom(finishPackages) : undefined,
            requestedUpgrades: Math.random() > 0.6 ? generateRequestedUpgrades(randomNumber(1,3)) : [],
            customizationNotes: Math.random() > 0.8 ? selectRandom(["Client requested specific tile color.", "Wants additional power outlets in living room."]) : undefined,
            floorPlanVersion: Math.random() > 0.5 ? `v${randomNumber(1,3)}.${randomNumber(0,5)}` : undefined,
            floorPlanLastRevisedDate: Math.random() > 0.6 ? randomDate(new Date(2022,6,1), new Date(2023,6,1)) : undefined,
            areaBreakdown: Math.random() > 0.5 ? generateAreaBreakdown(size) : [],
            orientation: Math.random() > 0.3 ? selectRandom(orientations) : undefined,
            customFields: Math.random() > 0.7 ? generateCustomFields(randomNumber(1,3)) : [],
            tags: Math.random() > 0.6 ? generateTags(randomNumber(1,4)) : [],
            paymentAdherence: undefined, // Will be calculated next
        };
        unit.paymentAdherence = calculatePaymentAdherence(unit, allInvoices);
        return unit;
    });
};

const generateOverviewProjectActivities = (count: number): OverviewProjectActivity[] => {
    const activities: OverviewProjectActivity[] = [];
    const activityTypes = ["Milestone Updated", "New Document Uploaded", "Budget Adjusted", "Lead Converted", "Compliance Status Changed", "Invoice Paid", "New Risk Identified"];
    for(let i = 0; i < count; i++) {
        activities.push({
            date: randomDate(new Date(2023, 10, 1), new Date(2024, 0, 15)),
            activity: selectRandom(activityTypes),
            user: selectRandom(MOCK_AGENT_NAMES),
            details: Math.random() > 0.6 ? selectRandom(["Status changed to 'Completed'.", "Contract signed.", "Payment of $50,000 received."]) : undefined,
        });
    }
    return activities;
};

const generateRawOverviewProjects = (count: number): Omit<OverviewProject, 'units'>[] => {
  return MOCK_PROJECT_NAMES.slice(0, count).map((name, i) => ({
    id: generateId(),
    name,
    type: selectRandom(Object.values(ProjectType)),
    status: selectRandom(['Planning', 'Pre-Launch', 'Construction', 'Sales Phase', 'Completed', 'On Hold'] as const),
    overallProgress: randomNumber(5, 95),
    budgetUtilization: randomNumber(10, 110), // Can be >100 if over budget
    estimatedCompletionDate: randomDate(new Date(2024, 6, 1), new Date(2027, 11, 31)),
    unitsSold: randomNumber(10, 100), 
    totalUnits: randomNumber(100, 200), 
    keyRisks: Array.from({length: randomNumber(1,3)}, () => selectRandom(['Supply Chain Delay', 'Regulatory Approval Pending', 'Market Fluctuation', 'Contractor Performance', 'Unexpected Site Conditions'] as const)),
    financialHealth: selectRandom(['Excellent', 'Good', 'Fair', 'Poor', 'Critical'] as const),
    thumbnailUrl: `https://picsum.photos/seed/proj${name.replace(/\s+/g, '').substring(0,5)}/200/200`, // Ensure URL
    recentActivity: generateOverviewProjectActivities(randomNumber(3,7)),
    marketSentiment: selectRandom(['Positive', 'Neutral', 'Cautious', 'Negative', 'Volatile'] as const),
    customFields: Math.random() > 0.7 ? generateCustomFields(randomNumber(1,2)) : [],
    tags: Math.random() > 0.6 ? generateTags(randomNumber(1,3)) : [],
  }));
};

const generateMilestoneSubTasks = (count: number): MilestoneSubTask[] => {
    return Array.from({length: count}, (_, i) => {
        const status = selectRandom(['Pending', 'In Progress', 'Completed', 'Blocked', 'Deferred'] as const);
        const startDate = status !== 'Pending' ? randomDate(new Date(2023, 0, 1), new Date(2023, 6, 30)) : undefined;
        return {
            id: generateId(),
            name: `Sub-task ${i+1} for ${selectRandom(['Electrical Wiring', 'Plumbing', 'Interior Painting', 'Fixture Installation', 'Facade Panel Mounting'])}`,
            status,
            assignedTo: selectRandom(MOCK_AGENT_NAMES.concat(MOCK_TECHNICIAN_NAMES)),
            dueDate: Math.random() > 0.5 ? randomDate(new Date(2024, 0, 1), new Date(2024, 6, 30)) : undefined,
            progressPercentage: status === 'Completed' ? 100 : (status === 'In Progress' ? randomNumber(10,90) : 0),
            startDate,
            actualEndDate: status === 'Completed' && startDate ? randomDate(new Date(startDate), new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 30))) : undefined,
            blockers: status === 'Blocked' ? [selectRandom(["Material not available", "Awaiting dependent task", "Access restricted"])] : [],
            dependsOnTasks: Math.random() > 0.8 ? [`task-${generateId().substring(0,4)}`] : [],
            estimatedHours: randomNumber(4, 40),
            actualHours: status === 'Completed' ? randomNumber(3, 45) : undefined,
        };
    });
};

const generateMaintenanceLogEntries = (count: number): MaintenanceLogEntry[] => {
  return Array.from({ length: count }, () => ({
    date: randomDate(new Date(2022, 0, 1), new Date(2023, 11, 31)),
    notes: selectRandom(["Routine inspection completed.", "Filter replaced.", "System recalibrated.", "Minor repairs performed.", "Component upgraded."]),
    performedBy: selectRandom(MOCK_TECHNICIAN_NAMES),
    cost: Math.random() > 0.3 ? randomNumber(50, 500) : undefined,
  }));
};

const generateFacilityAssets = (count: number, projectNames: string[]): FacilityAsset[] => {
  const assetTypes: FacilityAsset['assetType'][] = ['HVAC', 'Elevator', 'Plumbing System', 'Electrical Panel', 'Fire Safety System', 'Swimming Pool Equipment', 'Security System', 'Landscaping Feature', 'Generator', 'Water Pump'];
  return Array.from({ length: count }, (_, i) => {
    const assetType = selectRandom(assetTypes);
    const installationDate = randomDate(new Date(2020, 0, 1), new Date(2023, 0, 1));
    const lastMaintenance = Math.random() > 0.2 ? randomDate(new Date(2023, 0, 1), new Date(2023, 11, 1)) : undefined;
    const nextMaintenance = lastMaintenance && Math.random() > 0.3 ? 
        new Date(new Date(lastMaintenance).setMonth(new Date(lastMaintenance).getMonth() + randomNumber(3,12))).toISOString().split('T')[0]
        : randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31));

    return {
      id: `FA-${generateId().toUpperCase()}`,
      name: `${assetType} Unit ${String.fromCharCode(65 + (i % 5))}-${randomNumber(1,3)}`,
      assetType,
      projectLocation: selectRandom(projectNames),
      specificLocation: selectRandom(['Rooftop', `Tower ${String.fromCharCode(65 + (i % 3))}, Level ${randomNumber(1,10)}`, 'Basement B1', 'Common Area', `Villa ${randomNumber(1,20)}`]),
      status: selectRandom(['Operational', 'Maintenance Due', 'Under Repair', 'Out of Order', 'Scheduled Replacement', 'Decommissioned'] as const),
      installationDate,
      lastMaintenanceDate: lastMaintenance,
      nextMaintenanceDueDate: nextMaintenance,
      assignedTechnician: Math.random() > 0.4 ? selectRandom(MOCK_TECHNICIAN_NAMES) : undefined,
      maintenanceLog: generateMaintenanceLogEntries(randomNumber(1, 5)),
      warrantyExpiryDate: Math.random() > 0.5 ? randomDate(new Date(2024, 0, 1), new Date(2026, 0, 1)) : undefined,
      purchaseCost: Math.random() > 0.4 ? randomNumber(5000, 150000) : undefined,
      operationalHours: randomNumber(1000, 20000),
      expectedLifespanYears: randomNumber(10, 30),
      components: generateAssetComponents(randomNumber(2,5), assetType),
      customFields: Math.random() > 0.7 ? generateCustomFields(randomNumber(1,2)) : [],
      tags: Math.random() > 0.6 ? generateTags(randomNumber(1,3)) : [],
    };
  });
};

const generateMaintenanceTasks = (count: number, facilityAssets: FacilityAsset[]): MaintenanceTask[] => {
  if (facilityAssets.length === 0) return [];
  const taskDescriptions = [ "Inspect and clean filters", "Check fluid levels", "Lubricate moving parts", "Test safety sensors", "Replace worn component", "Calibrate system", "Emergency repair call", "Scheduled system overhaul", "Software Update", "Pressure Test"];
  const taskTypes: MaintenanceTask['taskType'][] = ['Preventive', 'Corrective', 'Inspection', 'Emergency'];
  return Array.from({ length: count }, () => {
    const asset = selectRandom(facilityAssets);
    const reportedDate = randomDate(new Date(2023, 9, 1), new Date(2024, 0, 10));
    const status = selectRandom(['Pending', 'Scheduled', 'In Progress', 'On Hold - Parts', 'Completed', 'Cancelled', 'Requires Follow-up'] as const);
    const laborCosts = status === 'Completed' ? randomNumber(100, 1000) : undefined;
    const partsCost = status === 'Completed' && Math.random() > 0.4 ? randomNumber(50, 2000) : undefined;
    return {
      id: `MT-${generateId().toUpperCase()}`,
      facilityAssetId: asset.id,
      facilityAssetName: asset.name,
      taskDescription: `${selectRandom(taskDescriptions)} for ${asset.assetType}`,
      priority: selectRandom(['High', 'Medium', 'Low', 'Critical'] as const),
      taskType: selectRandom(taskTypes),
      status,
      reportedDate,
      scheduledDate: status === 'Scheduled' || status === 'In Progress' ? randomDate(new Date(reportedDate), new Date(new Date(reportedDate).setDate(new Date(reportedDate).getDate() + 14))) : undefined,
      completedDate: status === 'Completed' ? randomDate(new Date(reportedDate), new Date(new Date(reportedDate).setDate(new Date(reportedDate).getDate() + 30))) : undefined,
      assignedTo: selectRandom(MOCK_TECHNICIAN_NAMES.concat(["External HVAC Experts", "Elevator Co.", "Plumbing Specialists"])),
      notes: Math.random() > 0.6 ? selectRandom(["Parts ordered, awaiting delivery.", "Requires specialized equipment.", "Client notified of delay.", "Completed ahead of schedule."]) : undefined,
      estimatedHours: randomNumber(1, 8),
      actualHours: status === 'Completed' ? randomNumber(1, 10) : undefined,
      laborCosts,
      partsCost,
      totalCost: laborCosts && partsCost ? laborCosts + partsCost : laborCosts ? laborCosts : partsCost ? partsCost : undefined,
      invoiceReference: status === 'Completed' && (laborCosts || partsCost) ? `INV-MAINT-${generateId().substring(0,5)}` : undefined,
      toolsRequired: Math.random() > 0.5 ? selectRandomMultiple(["Standard Toolkit", "Ladder", "Voltage Meter", "Welding Kit"], randomNumber(1,2)) : [],
    };
  });
};

const generateServiceProviders = (count: number): ServiceProvider[] => {
  const specializations = ['HVAC', 'Elevators', 'Plumbing', 'Electrical', 'Fire Safety', 'Landscaping', 'Security Systems', 'General Maintenance', 'Pest Control', 'Waste Management'];
  return Array.from({length: count}, (_,i) => ({
    id: `SP-${generateId().toUpperCase()}`,
    name: `${selectRandom(["Alpha", "Beta", "Gamma", "Delta", "Omega", "Prime", "Vertex"])} ${selectRandom(["Solutions", "Maintenance", "Services", "Pro", "Experts", "Group"])} ${i+1}`,
    contactPerson: selectRandom(MOCK_BUYER_NAMES), 
    contactNumber: `+971 5${randomNumber(0,8)} ${randomNumber(100,999)} ${randomNumber(1000,9999)}`,
    email: `contact@${generateId().substring(0,6)}.ae`,
    specialization: selectRandomMultiple(specializations, randomNumber(1,3)),
    rating: Math.random() > 0.2 ? randomFloat(3.0, 5.0, 1) : undefined,
    notes: Math.random() > 0.7 ? "Preferred vendor for high-rise projects." : undefined,
    contractId: Math.random() > 0.5 ? `CON-${generateId().substring(0,6)}` : undefined,
    contractExpiryDate: Math.random() > 0.6 ? randomDate(new Date(2024,6,1), new Date(2026,11,31)) : undefined,
    address: Math.random() > 0.4 ? `${randomNumber(10,99)} ${selectRandom(["Sheikh Zayed Rd", "Business Bay Ave", "Al Khail St"])}, Dubai` : undefined,
  }));
};

const generateInvoices = (count: number, projects: OverviewProject[], paymentPlans: PaymentPlanStructure[]): Invoice[] => {
    const invoices: Invoice[] = [];
    if(projects.length === 0 || paymentPlans.length === 0) return [];

    for(let i=0; i<count; i++) {
        const project = selectRandom(projects);
        if(project.units.length === 0) continue;
        const unit = selectRandom(project.units.filter(u => u.availabilityStatus === UnitAvailabilityStatus.Sold || u.availabilityStatus === UnitAvailabilityStatus.Reserved));
        if(!unit) continue;

        const paymentPlan = selectRandom(paymentPlans);
        if(paymentPlan.installments.length === 0) continue;
        const installment = selectRandom(paymentPlan.installments);

        const issueDate = randomDate(new Date(2023,0,1), new Date(2024,0,1));
        const dueDate = installment.dueDate || randomDate(new Date(issueDate), new Date(new Date(issueDate).setDate(new Date(issueDate).getDate() + 30)));
        const status = selectRandom(['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'] as const);
        
        invoices.push({
            id: `INV-${generateId().toUpperCase()}`,
            invoiceNumber: `INV-${new Date(issueDate).getFullYear()}-${randomNumber(1000,9999)}`,
            unitId: unit.id,
            buyerName: selectRandom(MOCK_BUYER_NAMES), // In a real system, this would come from the lead/customer linked to the unit
            installmentMilestone: installment.milestone,
            amountDue: unit.initialPrice * (installment.percentage / 100),
            issueDate,
            dueDate,
            status,
            paymentDate: status === 'Paid' ? randomDate(new Date(dueDate), new Date(new Date(dueDate).setDate(new Date(dueDate).getDate() + 10))) : undefined,
            paymentMethod: status === 'Paid' ? selectRandom(['Bank Transfer', 'Credit Card', 'Cheque', 'Crypto'] as const) : undefined,
            transactionId: status === 'Paid' ? `TXN-${generateId().toUpperCase()}` : undefined,
            paymentAttempts: status === 'Overdue' ? randomNumber(1,3) : undefined,
            lateFeeApplied: status === 'Overdue' && Math.random() > 0.6 ? randomNumber(50,500) : undefined,
            notes: Math.random() > 0.8 ? "Partial payment discussion ongoing." : undefined,
            linkedPaymentPlanName: paymentPlan.planName,
        });
    }
    return invoices;
};

const generateQualityInspectionRecords = (count: number, projects: OverviewProject[]): QualityInspectionRecord[] => {
    if(projects.length === 0) return [];
    const inspectionTypes: QualityInspectionRecord['inspectionType'][] = ['Snagging', 'Pre-Handover', 'Milestone Completion', 'Safety Audit'];
    
    return Array.from({length: count}, (_,i) => {
        const project = selectRandom(projects);
        const unitSpecific = Math.random() > 0.4 && project.units.length > 0;
        const unit = unitSpecific ? selectRandom(project.units) : undefined;
        return {
            id: `QIR-${generateId().toUpperCase()}`,
            inspectionIdNumber: `QIR-${new Date().getFullYear()}-${randomNumber(100,999)}-${i}`,
            project: project.name,
            unitId: unit?.id,
            milestoneName: Math.random() > 0.5 ? selectRandom(MOCK_MILESTONES_GENERAL) : undefined,
            areaInspected: unit ? `${unit.unitNumber} - ${selectRandom(["Kitchen", "Master Bathroom", "Living Area", "Overall"])}` : selectRandom(["Common Lobby", "Roof Deck", "External Facade - North Wing"]),
            inspectionDate: randomDate(new Date(2023,6,1), new Date(2024,0,1)),
            inspector: selectRandom(MOCK_AGENT_NAMES.concat(["Third Party QA Ltd."])),
            inspectionType: selectRandom(inspectionTypes),
            checklistItems: generateQualityInspectionChecklistItems(randomNumber(5,15)),
            overallStatus: selectRandom(['Approved', 'Rework Needed', 'Pending Review'] as const),
            reworkDueDate: Math.random() > 0.7 ? randomDate(new Date(2024,0,1), new Date(2024,1,15)) : undefined,
            followUpInspectionId: Math.random() > 0.8 ? `QIR-${generateId().toUpperCase().substring(0,5)}` : undefined,
        };
    });
};


// --- Main Data Generation Orchestration ---
export const generatePlatformData = (): PlatformData => {
  const numProjects = MOCK_PROJECT_NAMES.length;
  const rawOverviewProjects = generateRawOverviewProjects(numProjects); // Generate raw projects first
  const samplePaymentPlans = generatePaymentPlanStructures(10);
  
  // Generate invoices based on raw projects and payment plans
  // Create a temporary structure with units for invoice generation, as OverviewProject needs PopulatedUnitDetail
  const tempProjectsForInvoiceGen = rawOverviewProjects.map(op => ({
      ...op,
      units: Array.from({length: op.totalUnits}, (_, i) => ({ // Simplified PopulatedUnitDetail for invoice gen
          id: `temp-unit-${op.id}-${i}`,
          unitNumber: `TEMP-${i}`,
          projectName: op.name,
          initialPrice: randomNumber(500000, 5000000),
          availabilityStatus: selectRandom(Object.values(UnitAvailabilityStatus)),
          size: 100, sizeUnit: UnitSizeUnit.Sqm, // dummy values
          floorPlanUrl: `https://picsum.photos/seed/tempUnit${generateId()}/80/60`, // ensure this exists
      } as PopulatedUnitDetail))
  }));
  const allInvoices = generateInvoices(200, tempProjectsForInvoiceGen, samplePaymentPlans);


  const overviewProjectsWithUnits: OverviewProject[] = rawOverviewProjects.map(op => {
      const units = generatePopulatedUnitDetails(op.totalUnits, op.name, allInvoices);
      const soldUnitsCount = units.filter(u => u.availabilityStatus === UnitAvailabilityStatus.Sold).length;
      // Recalculate budget utilization if it depends on unit prices (example heuristic)
      const totalInitialValue = units.reduce((sum, u) => sum + u.initialPrice, 0);
      const budgetUtilization = totalInitialValue > 0 ? (op.budgetUtilization / 100 * totalInitialValue) / totalInitialValue * 100 : op.budgetUtilization;

      return {
        ...op,
        units: units,
        unitsSold: soldUnitsCount, 
        budgetUtilization: Math.min(150, Math.max(10, budgetUtilization)), // cap utilization
      };
  });
  
  const allLeads = Array.from({length: 50}, (_,i) => { // Increased lead count
      const budgetMin = randomNumber(300000, 2000000);
      return {
          id: generateId(), name: selectRandom(MOCK_BUYER_NAMES) + ` Lead ${i}`, source: selectRandom(['Website', 'Referral', 'Social Media', 'Cold Call', 'Event', 'Broker'] as const),
          status: selectRandom(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed - Won', 'Closed - Lost', 'On Hold'] as const),
          assignedAgent: selectRandom(MOCK_AGENT_NAMES), lastContactDate: randomDate(new Date(2023,10,1), new Date(2024,0,15)),
          projectInterest: selectRandom(MOCK_PROJECT_NAMES), notes: "Interested in 3BR, budget $1.5M. Follow up next week.",
          leadScore: randomNumber(30, 95),
          preferredContactMethod: selectRandom(['Email', 'Phone', 'WhatsApp'] as const),
          detailedNeeds: selectRandom(["Looking for a spacious family home with a garden.", "Needs a penthouse unit with city views.", "Investment property, high ROI potential is key.", "Requires ground floor access and modern amenities."]),
          budgetRange: { min: budgetMin, max: budgetMin + randomNumber(100000, 1000000) },
          interactionHistory: generateLeadInteractions(randomNumber(2,7)),
          customFields: Math.random() > 0.7 ? generateCustomFields(randomNumber(1,2)) : [],
          tags: Math.random() > 0.6 ? generateTags(randomNumber(1,3)) : [],
      };
  });
  
  const allUnitsForViewings = overviewProjectsWithUnits.flatMap(p => p.units);
  const sampleUnitViewings = generateUnitViewings(30, allLeads, allUnitsForViewings);

  const projectNamesForFM = overviewProjectsWithUnits.map(p => p.name);
  const sampleFacilityAssets = generateFacilityAssets(40, projectNamesForFM); // Increased asset count
  const sampleMaintenanceTasks = generateMaintenanceTasks(60, sampleFacilityAssets); // Increased task count
  const sampleServiceProviders = generateServiceProviders(15);
  // const samplePaymentPlans = generatePaymentPlanStructures(10); // Already generated
  // const sampleInvoices = generateInvoices(40, overviewProjectsWithUnits, samplePaymentPlans); // Already generated
  const sampleQualityInspections = generateQualityInspectionRecords(25, overviewProjectsWithUnits);


  const platform: PlatformInfo = {
    name: "Insignia Dashboard",
    targetMarket: {
      segment: "Boutique & Luxury Real Estate Developers",
      industry: "High-End Property Development & Asset Management",
      projectValue: "Projects ranging from $10M to $500M+",
      location: "Prime Global Real Estate Markets",
    },
    corePhilosophy: [ 
        "Excellence in Design & Craftsmanship",
        "Unwavering Commitment to Quality & Detail",
        "Data-Driven Insights for Superior Returns",
        "Building Legacies, Not Just Structures"
    ],
    keyChallenges: [
        { challenge: "Maintaining exclusivity and brand prestige while scaling.", description: "Curating a portfolio that reflects discernment and lasting value." },
        { challenge: "Sourcing unique opportunities in competitive high-value markets.", description: "Identifying and securing prime locations and development prospects." },
        { challenge: "Delivering unparalleled client experiences and after-sales service.", description: "Ensuring every touchpoint reinforces the luxury brand promise." },
        { challenge: "Integrating cutting-edge technology to enhance luxury and efficiency.", description: "Leveraging innovation to streamline operations and elevate resident experiences." }
    ],
  };

  const modules: PlatformModules = {
    projectPropertySetup: {
      moduleName: "Project & Property Setup (Global Standards)",
      features: {
        dubaiProjectBlueprint: { 
          name: "Universal Project Blueprint Templates",
          description: "Pre-configured templates for common global project types (e.g. residential, commercial, mixed-use).",
          templates: Object.values(ProjectType).map(type => ({
            type,
            defaultCostCategories: generateDefaultCostCategories(randomNumber(3,5)),
            revenueStreams: ['Unit Sales', 'Rental Income', 'Commercial Leases', 'Service Fees', 'Parking Fees'].slice(0, randomNumber(2,4)),
            paymentPlanStructures: generatePaymentPlanStructures(randomNumber(2,4)),
          })),
          benefits: ["Reduces setup time drastically", "Ensures comprehensive data capture from day one", "Guides developers on best-practice data structures"],
        },
        unitInventoryManager: {
          name: "Intuitive Unit Inventory Manager",
          description: "Visual floor plans (conceptual) where developers can click on units to add/edit details.",
          unitDetails: { size: 1200, sizeUnit: UnitSizeUnit.Sqft, bedrooms: 2, initialPrice: 750000, availabilityStatus: UnitAvailabilityStatus.Available },
          sampleUnits: overviewProjectsWithUnits.slice(0,3).flatMap(p => p.units.slice(0, randomNumber(8,20))), // More sample units
          benefits: ["Quick overview of available and sold stock", "Easy to update unit status as sales progress", "Centralized unit data for all teams"],
        },
        geospatialLite: {
          name: "Geospatial Lite Mapping",
          description: "Simple map integration to pinpoint project locations and key area data.",
          capabilities: ["Display nearby amenities", "Visualize high-level zoning information", "Embed maps in marketing materials"],
          benefits: ["Aids in initial site assessment and feasibility", "Supports marketing and sales efforts", "Provides context for project planning"],
          sampleProjectLocations: overviewProjectsWithUnits.map(p => ({ name: p.name, lat: randomFloat(25.0, 25.2, 4) , long: randomFloat(55.1, 55.4, 4), amenities: ['Metro Station', 'Shopping Mall', 'International School', 'Hospital', 'Park', 'Beach Access'].slice(0, randomNumber(2,5))})),
        },
      },
    },
    financialPaymentPlan: {
      moduleName: "Financial & Payment Plan Mastery (Core Engine)",
      features: {
        dynamicPaymentPlanCreator: {
          name: "Dynamic Payment Plan Creator",
          interface: "Drag-and-Drop or Rule-Based Interface",
          capabilities: ["Define installment percentages and amounts", "Link payments to construction milestones or fixed dates", "Automated calculation of installment schedules"],
          milestoneExamples: MOCK_MILESTONES_GENERAL.slice(0,randomNumber(3,5)),
          benefits: ["Eliminates complex manual calculations", "Reduces errors in payment schedules", "Allows for quick adjustments to market conditions"],
          samplePaymentPlans,
        },
        realTimeCashFlowDashboard: {
          name: "Real-time Cash Flow Dashboard (Project & Portfolio)",
          visualElements: ["Visual graphs of projected vs. actual cash inflows/outflows", "Cash balance trends over time"],
          inflows: ["Unit sales payments", "Financing disbursements", "Rental Income"],
          outflows: ["Construction costs", "Marketing & sales expenses", "Operational Costs"],
          benefits: ["Provides exact financial position", "Helps anticipate cash shortfalls or surpluses", "Enables timely decisions to manage liquidity"],
          sampleCashFlowData: Array.from({ length: 12 }, (_, i) => {
            const month = new Date(2023, i, 1).toLocaleString('default', { month: 'short' });
            return {
              date: `${month} 2023`,
              projectedInflow: randomNumber(500000, 2000000), actualInflow: randomNumber(400000, 1900000),
              projectedOutflow: randomNumber(300000, 1500000), actualOutflow: randomNumber(250000, 1600000),
            };
          }),
        },
        invoiceTracking: { // Switched to new Invoice feature
            name: "Automated Invoice Tracking",
            capabilities: ["Generate invoices from payment plans", "Track invoice status (Draft, Sent, Paid, Overdue)", "Automated reminders for overdue invoices"],
            benefits: ["Streamlines billing process", "Improves cash flow by reducing payment delays", "Clear audit trail of financial transactions"],
            sampleInvoices: allInvoices,
        },
        budgetVsActuals: {
          name: "Budget vs. Actuals for Expenses (Detailed Tracking)",
          description: "Categorize and track all project expenses against pre-defined budgets with variance analysis.",
          benefits: ["Highlights cost overruns or savings early", "Allows corrective action to maintain profitability", "Improves future budgeting accuracy"],
          sampleExpenses: ['Land', 'Design', 'Foundation', 'Structure', 'Facade', 'MEP', 'Finishes', 'Marketing', 'Sales Commission', 'Legal Fees', 'Overheads', 'Contingency Allocation'].map(item => {
              const budgeted = randomNumber(100000, 5000000);
              const actual = budgeted * randomFloat(0.75, 1.25); // Wider variance
              return {
                category: selectRandom(['Hard Costs', 'Soft Costs', 'Marketing & Sales', 'Overheads', 'Financing Costs'] as const),
                budgetItem: item, budgetedAmount: budgeted, actualAmount: actual, variance: actual - budgeted,
                invoiceReference: Math.random() > 0.5 ? `INV-${generateId().substring(0,6)}` : undefined,
                supplierName: Math.random() > 0.6 ? selectRandom(["Global Construction Supplies", "Creative Marketing Agency", "Legal Eagles LLP"]) : undefined,
                paymentDate: Math.random() > 0.7 ? randomDate(new Date(2023,0,1), new Date(2024,0,1)) : undefined,
                paymentStatus: Math.random() > 0.3 ? selectRandom(['Pending', 'Paid', 'Disputed', 'Scheduled'] as const) : 'Paid',
              };
          }),
        },
      },
    },
    salesCRM: {
        moduleName: "Sales & Customer Relationship Management (Streamlined)",
        features: {
            leadProspectTracker: {
                name: "Lead & Prospect Tracker (Intelligent CRM)",
                capabilities: ["Manage inquiries from multiple channels", "Automated lead scoring and assignment", "Track complete communication history"],
                benefits: ["Eliminates scattered spreadsheets and lost leads", "Centralizes sales efforts", "Improves lead conversion rates"],
                sampleLeads: allLeads,
            },
            unitReservationBooking: {
                name: "Unit Reservation & Booking System",
                description: "Quick, reliable process to mark units as 'reserved' or 'sold', preventing double bookings and errors.",
                integration: "Directly links to payment plans, inventory, and customer accounts.",
                benefits: ["Instant visibility on unit availability", "Reduces administrative overhead", "Streamlines the sales transaction process"],
                sampleReservations: overviewProjectsWithUnits.flatMap(p => 
                    p.units
                        .filter(u => u.availabilityStatus === UnitAvailabilityStatus.Sold || u.availabilityStatus === UnitAvailabilityStatus.Reserved)
                        .slice(0,randomNumber(3,8)) // More reservations
                        .map(u => ({
                            unitId: u.id, unitNumber: u.unitNumber, projectName: p.name,
                            status: u.availabilityStatus === UnitAvailabilityStatus.Sold ? ('Sold' as const) : ('Reserved' as const), 
                            clientName: selectRandom(MOCK_BUYER_NAMES),
                            reservationDate: randomDate(new Date(2023,6,1), new Date(2023,11,31)),
                            linkedPaymentPlan: selectRandom(samplePaymentPlans.map(sp => sp.planName)),
                            salePrice: u.availabilityStatus === UnitAvailabilityStatus.Sold ? u.currentPrice : undefined,
                            agentId: selectRandom(MOCK_AGENT_NAMES),
                        }))
                ).slice(0,30), 
            },
            brokerManagement: {
                name: "Broker & Channel Partner Management",
                capabilities: ["Register and manage external brokers/agencies", "Track broker-registered clients and deal progression", "Automate commission calculations"],
                benefits: ["Fair, transparent, and efficient commission management", "Fosters strong relationships with sales channel partners", "Expands market reach"],
                sampleBrokers: Array.from({length:20}, (_,i) => { // More brokers
                    const deals = randomNumber(1,15);
                    return {
                        id: generateId(), name: `Broker ${selectRandom(MOCK_BUYER_NAMES).split(' ')[1]} ${i}`, agency: selectRandom(MOCK_BROKER_AGENCIES),
                        clientsRegistered: randomNumber(deals * 2, deals * 10), dealsClosed: deals,
                        commissionEarned: randomNumber(10000, 250000), status: selectRandom(['Active', 'Inactive', 'Probation'] as const),
                        leadsGenerated: randomNumber(20,100),
                        leadToViewingRate: randomFloat(20,70),
                        viewingToOfferRate: randomFloat(10,50),
                        averageDealClosureTimeDays: randomNumber(15,90),
                        specialization: selectRandomMultiple(Object.values(ProjectType), randomNumber(1,2)),
                        contactEmail: `${generateId().substring(0,5)}@${selectRandom(MOCK_BROKER_AGENCIES).toLowerCase().replace(/\s/g, '')}.com`,
                        contactPhone: `+971 50 ${randomNumber(100,999)} ${randomNumber(1000,9999)}`,
                    };
                }),
            },
            automatedCustomerCommunication: {
                name: "Automated Customer Communication Engine",
                communications: ["Send automated payment reminders & receipts", "Construction progress updates", "Handover notifications", "New property launch alerts", "Viewing confirmations & reminders"],
                benefits: ["Enhances customer satisfaction", "Reduces manual outreach", "Builds trust through consistent information"],
                sampleCommunicationLogs: Array.from({length:30}, (_,i) => ({ // More logs
                    id: generateId(), customerId: `CUST-${randomNumber(1000,5000)}`, customerName: selectRandom(MOCK_BUYER_NAMES),
                    communicationType: selectRandom(['Payment Reminder', 'Construction Update', 'Handover Notification', 'General Announcement', 'New Offer', 'Viewing Confirmation'] as const),
                    channel: selectRandom(['Email', 'SMS', 'App Notification', 'WhatsApp'] as const), sentDate: randomDate(new Date(2023,11,1), new Date(2024,0,15)),
                    status: selectRandom(['Sent', 'Opened', 'Clicked', 'Failed', 'Bounced'] as const), contentSnippet: "Your next installment of $XXX is due on YYY..."
                })),
            },
            unitViewingFeedback: { // New feature populated
                name: "Unit Viewing Feedback Capture",
                description: "Collect and analyze feedback from prospective buyers after unit viewings.",
                benefits: ["Understand property appeal", "Identify areas for improvement", "Gauge agent effectiveness"],
                sampleViewings: sampleUnitViewings,
            }
        }
    },
    projectProgressCompliance: {
        moduleName: "Project Progress & Compliance (Global Standards)",
        features: {
            milestoneProgressTracker: {
                name: "Milestone & Progress Tracker (Advanced)",
                milestones: MOCK_MILESTONES_GENERAL,
                capabilities: ["Define key construction and project milestones", "Update completion status with evidence", "Link milestones to payment plan triggers", "Track sub-task progress and dependencies"],
                benefits: ["Simple, visual progress tracking", "Supports communication with regulatory bodies", "Early identification of potential delays and bottlenecks"],
                sampleMilestoneStatuses: overviewProjectsWithUnits.flatMap(p => 
                    MOCK_MILESTONES_GENERAL.slice(0,randomNumber(4,MOCK_MILESTONES_GENERAL.length)).map(mName => ({
                        milestoneName: mName, project: p.name, 
                        definedDate: randomDate(new Date(2023,0,1), new Date(2025,0,1)),
                        completionDate: Math.random() > 0.3 ? randomDate(new Date(2023,0,1), new Date(2025,0,1)) : undefined,
                        status: selectRandom(['Pending', 'In Progress', 'Completed', 'Delayed', 'At Risk'] as const),
                        linkedToPayment: Math.random() > 0.5,
                        progressPercentage: randomNumber(0,100),
                        subTasks: generateMilestoneSubTasks(randomNumber(2,7)), // More sub-tasks
                        issuesOrBlockers: Math.random() > 0.7 ? selectRandomMultiple(['Permit delay', 'Material shortage', 'Contractor issue', 'Weather impact', 'Design change'], randomNumber(1,2)) : [],
                    }))
                ).slice(0,40), // More milestones
            },
            photoVideoUpload: {
                name: "Photo & Video Upload for Progress Verification",
                description: "Site managers can easily upload timestamped, geotagged photos/videos directly from mobile or desktop.",
                capabilities: ["Timestamped and geotagged uploads", "Tagging to specific milestones", "Mobile device support", "Categorization (e.g., Progress, Snagging, Safety)"],
                benefits: ["Verifiable proof of progress", "Supports remote project monitoring", "Enhances transparency"],
                sampleUploads: Array.from({length:30}, (_,i) => ({ // More uploads
                    id: generateId(), fileName: `IMG_${randomNumber(1000,9999)}.jpg`, 
                    type: selectRandom(['Photo', 'Video', 'Document Scan', '360 Tour', 'Drone Footage'] as const),
                    uploadDate: randomDate(new Date(2023,10,1), new Date(2024,0,15)),
                    timestamp: new Date().toISOString(), uploadedBy: selectRandom(MOCK_AGENT_NAMES), 
                    milestoneTag: selectRandom(MOCK_MILESTONES_GENERAL), project: selectRandom(MOCK_PROJECT_NAMES),
                    url: `https://picsum.photos/seed/media${generateId()}/300/200`, // Ensure URL
                    geotag: Math.random() > 0.6 ? {lat: randomFloat(25.0, 25.2, 4), long: randomFloat(55.1, 55.4, 4)} : undefined,
                    description: Math.random() > 0.5 ? selectRandom(["Foundation pour complete", "Facade inspection view", "Safety drill footage"]) : undefined,
                })),
            },
            reraComplianceChecklists: { 
                name: "Regulatory Compliance Checklists & Reminders",
                description: "Pre-built, customizable checklists for common regulatory requirements.",
                requirements: ["Environmental Impact Assessment", "Building Permit Application", "Utility Connection Approval", "Civil Defense Approval", "Handover Certification"],
                capabilities: ["Automated reminders for submission deadlines", "Customizable checklists", "Document attachment and versioning", "Audit trail for compliance actions"],
                benefits: ["Reduces risk of non-compliance", "Ensures smooth project flow", "Centralizes all compliance-related documentation"],
                sampleComplianceItems: Array.from({length:25}, (_,i) => ({ // More items
                    id: generateId(), requirementName: selectRandom(["EIA Approval", "Building Permit", "Fire Safety Cert", "Handover Cert", "Escrow Account Setup"] as const),
                    authority: selectRandom(['Local Municipality', 'Utility Provider', 'Environmental Agency', 'Civil Defense', 'Real Estate Regulatory Authority'] as const),
                    status: selectRandom(['Not Started', 'In Progress', 'Submitted', 'Approved', 'Rejected', 'Expired'] as const),
                    dueDate: randomDate(new Date(2024,1,1), new Date(2025,6,1)),
                    submissionDate: Math.random() > 0.5 ? randomDate(new Date(2024,0,1), new Date(2025,0,1)) : undefined,
                    approvalDate: Math.random() > 0.3 ? randomDate(new Date(2024,0,15), new Date(2025,1,15)) : undefined,
                    expiryDate: Math.random() > 0.2 ? randomDate(new Date(2025,6,1), new Date(2027,6,1)) : undefined,
                    responsiblePerson: selectRandom(MOCK_AGENT_NAMES), notes: "Awaiting feedback on phase 1 submission.",
                    linkedDocumentId: Math.random() > 0.6 ? `DOC-${generateId().substring(0,6)}` : undefined,
                })),
            },
            digitalDocumentRepository: {
                name: "Digital Document Repository (Secure & Categorized)",
                description: "Store all project-related documents securely, with version control, accessible by authorized personnel.",
                documentTypes: MOCK_DOCUMENT_TYPES_GENERAL.concat(["Sales Agreements", "Supplier Contracts", "Compliance Certificates", "Inspection Reports"]),
                capabilities: ["Secure, cloud-based storage", "Categorized organization with tagging", "Powerful search functionality", "Version control", "Access logs and audit trails"],
                benefits: ["Centralized, single source of truth for documents", "Supports audits and legal discovery", "Reduces risk of lost documents", "Controlled access based on roles"],
                sampleDocuments: Array.from({length:40}, (_,i) => { // More documents
                    const initialFilePath = `/docs/${selectRandom(MOCK_PROJECT_NAMES).replace(' ','_')}/${generateId()}.pdf`;
                    const versions = generateDocumentVersions(randomNumber(1,5), initialFilePath, `Doc ${i}`);
                    return {
                        id: `DOC-${generateId().substring(0,6)}`, 
                        documentName: `${selectRandom(['Contract', 'Permit', 'NOC', 'Drawing', 'Report', 'Agreement', 'Certificate'] as const)}-${randomNumber(100,500)}.pdf`,
                        documentType: selectRandom(MOCK_DOCUMENT_TYPES_GENERAL), project: selectRandom(MOCK_PROJECT_NAMES),
                        uploadDate: versions[versions.length-1].uploadDate, 
                        currentVersion: versions[versions.length-1].version,
                        status: selectRandom(['Draft', 'Approved', 'Archived', 'Superseded', 'Under Review'] as const),
                        accessPermissions: ['Admin', selectRandom(['Project Manager', 'Legal Team', 'Sales Team', 'Finance Team'] as const)],
                        filePath: versions[versions.length-1].filePath,
                        expiryDate: Math.random() > 0.8 ? randomDate(new Date(2024, 6, 1), new Date(2026, 11, 31)) : null,
                        reviewers: selectRandomMultiple(MOCK_AGENT_NAMES.concat(MOCK_BUYER_NAMES.slice(0,5)), randomNumber(1,3)),
                        keywords: selectRandomMultiple(["legal", "financial", "technical", "approval", "blueprint", "sales", "safety", "contract", "permit"], randomNumber(2,4)),
                        versionHistory: versions,
                        accessLog: generateDocumentAccessLog(randomNumber(3,10)),
                        department: selectRandom(['Legal', 'Finance', 'Construction', 'Sales'] as const),
                    };
                }),
            },
            qualityChecklists: { // New feature populated
                name: "Quality Assurance & Control Checklists",
                description: "Conduct and track quality inspections for construction milestones and unit handovers.",
                benefits: ["Ensures adherence to quality standards", "Systematic defect (snag) tracking and resolution", "Improves client satisfaction with final product"],
                sampleInspections: sampleQualityInspections,
            }
        }
    },
    reportingDecisionSupport: {
        moduleName: "Reporting & Decision Support (Actionable Insights)",
        features: {
            projectHealthDashboard: {
                name: "Comprehensive Project Health Dashboard",
                description: "At-a-glance, configurable view of key performance indicators (KPIs) across projects or portfolio.",
                keyMetrics: ["Units Sold vs. Target", "Revenue Collected vs. Forecast", "Budget vs. Actual Spend", "Project Completion Percentage", "Customer Satisfaction Index", "Risk Exposure Level"],
                benefits: ["Immediate understanding of project performance", "No need to dig through multiple reports", "Enables proactive decision-making"],
                sampleProjectHealthMetrics: overviewProjectsWithUnits.map(p => ({
                    id: p.id, projectName: p.name,
                    unitsSold: p.unitsSold, totalUnits: p.totalUnits,
                    revenueCollected: randomNumber(1000000, 50000000), targetRevenue: randomNumber(1500000, 60000000),
                    budgetSpent: p.budgetUtilization * (p.units.reduce((s,u)=>s+u.initialPrice,0)/100 || 50000), totalBudget: (p.units.reduce((s,u)=>s+u.initialPrice,0) || 5000000), 
                    completionPercentage: p.overallProgress,
                    cashFlowStatus: selectRandom(['Positive', 'Neutral', 'Negative'] as const),
                    overduePaymentsCount: randomNumber(0,15),
                    healthIndicator: selectRandom(['Green', 'Amber', 'Red'] as const),
                    riskLevel: selectRandom(['Low', 'Medium', 'High'] as const)
                })),
            },
            profitabilityAnalysis: {
                name: "Advanced Profitability Analysis & Forecasting",
                calculations: ["Estimated Gross Profit Margin", "Net Profit Margin", "Return on Investment (ROI)", "Internal Rate of Return (IRR)"],
                dataSource: "Based on actuals from financial module and projections from sales/cost plans.",
                benefits: ["Deep understanding of project financial success", "Supports investment decisions", "Identifies most profitable project types"],
                sampleProfitabilityData: overviewProjectsWithUnits.map(p => {
                    const totalRevenue = randomNumber(5000000, 100000000);
                    const totalCost = totalRevenue * randomFloat(0.6, 0.85);
                    const grossProfit = totalRevenue - totalCost;
                    const netProfit = grossProfit * randomFloat(0.5, 0.8);
                    return {
                        projectId: p.id, projectName: p.name, totalRevenue, totalCost, grossProfit, netProfit,
                        roiPercentage: (netProfit / totalCost) * 100, period: `YTD ${new Date().getFullYear()}`,
                        revenueBreakdown: [{source: "Unit Sales", amount: totalRevenue * 0.9}, {source: "Other Fees", amount: totalRevenue * 0.1}],
                        costBreakdown: [{category: "Construction", amount: totalCost * 0.7}, {category: "Marketing & Sales", amount: totalCost * 0.15}, {category: "Overheads", amount: totalCost * 0.15}]
                    };
                }),
            },
            investorBankReporting: {
                name: "Investor & Bank Reporting Templates (Customizable)",
                description: "Generate clear, concise, and professional reports tailored for investors, banks, and other stakeholders.",
                reportTypes: ["Quarterly Project Progress Report", "Annual Financial Performance Summary", "Unit Sales & Inventory Status Report", "Compliance Audit Summary", "Market Analysis Report"],
                benefits: ["Professional, consistent, and accurate reporting", "Saves significant time in report preparation", "Builds trust with financial partners"],
                sampleReports: Array.from({length:20}, (_,i) => ({ // More reports
                    id: generateId(), reportName: `${selectRandom(['Q4 Update', 'Annual Review', 'Sales Summary', 'Compliance Check'] as const)} - ${selectRandom(MOCK_PROJECT_NAMES)}`,
                    reportType: selectRandom(['Project Progress', 'Financial Performance', 'Unit Sales Summary', 'Investor Update', 'Compliance Audit'] as const),
                    generatedFor: selectRandom(['Investor Group A', 'Bank XYZ', 'Internal Management', 'Regulatory Body'] as const), 
                    generationDate: randomDate(new Date(2023,9,1), new Date(2024,0,15)),
                    periodCovered: `Q${randomNumber(1,4)} ${new Date().getFullYear()-1}`,
                    status: selectRandom(['Draft', 'Finalized', 'Sent', 'Archived'] as const),
                    format: selectRandom(['PDF', 'Excel', 'Dashboard Snapshot'] as const)
                })),
            } 
        } 
    },
    facilitiesManagement: { 
        moduleName: "Facilities Management & Operations",
        features: {
            assetRegister: {
                name: "Centralized Asset Register",
                description: "Manage all critical facility assets across projects, from HVAC units to elevators.",
                benefits: ["Comprehensive overview of all manageable assets", "Track maintenance history and warranty", "Plan for replacements and upgrades effectively", "Detailed component tracking"],
                sampleAssets: sampleFacilityAssets,
            },
            maintenanceScheduler: {
                name: "Proactive Maintenance Scheduler",
                description: "Schedule, assign, and track preventive and corrective maintenance tasks with cost monitoring.",
                benefits: ["Reduce asset downtime", "Optimize technician workload", "Ensure timely completion of critical maintenance", "Track maintenance costs accurately"],
                sampleTasks: sampleMaintenanceTasks,
            },
            serviceProviderDirectory: { 
                name: "Service Provider Directory",
                description: "Manage contacts, contracts, and performance for external service providers.",
                benefits: ["Quickly find and dispatch qualified vendors", "Track service quality and costs", "Manage contracts and SLAs"],
                sampleProviders: sampleServiceProviders,
            }
        }
    }
  }; 
  
  return { platform, modules, overallProjects: overviewProjectsWithUnits };
};
// End of file: services/dataService.ts. Verified structure.
