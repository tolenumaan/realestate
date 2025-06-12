
// Enums based on schema & needs
export enum View {
  Overview = "Overview",
  ProjectSetup = "Project & Property Setup",
  Financials = "Financial & Payment Plan",
  SalesCRM = "Sales & CRM",
  ProgressCompliance = "Project Progress & Compliance",
  Reporting = "Reporting & Decision Support",
  FacilitiesManagement = "Facilities Management",
}

export enum ProjectType {
  ResidentialVillaCompound = "residential villa compound",
  ApartmentBuilding = "apartment building",
  CommercialOfficeSpace = "commercial office space",
}

export enum UnitSizeUnit {
  Sqft = "sqft",
  Sqm = "sqm",
  Custom = "custom",
}

export enum UnitAvailabilityStatus {
  Available = "available",
  Reserved = "reserved",
  Sold = "sold",
  Blocked = "blocked",
}

// Platform structure based on JSON schema
export interface PlatformTargetMarket {
  segment: string;
  industry: string;
  projectValue: string;
  location: string;
}

export interface PlatformInfo {
  name: string;
  targetMarket: PlatformTargetMarket;
  corePhilosophy: string[];
  keyChallenges: Array<{ challenge: string; description: string }>;
}

// --- Custom Fields & Tags ---
export interface CustomField {
  fieldName: string;
  fieldValue: string | number | boolean | Date;
  fieldType: 'text' | 'number' | 'date' | 'boolean';
}

// --- Project & Property Setup Module ---
export interface PaymentPlanInstallment {
  percentage: number;
  milestone: string;
  dueDate?: string;
  invoiceId?: string; // Link to a generated Invoice
}

export interface PaymentPlanStructure {
  planName: string;
  installments: PaymentPlanInstallment[];
}

export interface CostSubCategory {
  name: string;
  estimatedPercentage: number;
  notes?: string;
}
export interface DefaultCostCategory {
  categoryName: string;
  subCategories: CostSubCategory[];
  totalEstimatedPercentage: number;
}
export interface ProjectBlueprintTemplate {
  type: ProjectType;
  defaultCostCategories: DefaultCostCategory[]; // Updated for granularity
  revenueStreams: string[];
  paymentPlanStructures: PaymentPlanStructure[];
}

export interface DubaiProjectBlueprint {
  name: string;
  description: string;
  templates: ProjectBlueprintTemplate[];
  benefits: string[];
}

export interface UnitDetailsSchema {
  size: number;
  sizeUnit: UnitSizeUnit;
  view?: string;
  bedrooms?: number;
  initialPrice: number;
  availabilityStatus: UnitAvailabilityStatus;
}

export interface UnitInventoryManager {
  name: string;
  description: string;
  unitDetails: UnitDetailsSchema;
  sampleUnits: PopulatedUnitDetail[];
  benefits: string[];
}

export interface RequestedUpgrade {
  upgradeName: string;
  cost: number;
  status: 'Requested' | 'Approved' | 'Installed' | 'Rejected';
  notes?: string;
}
export interface AreaBreakdownItem {
  roomName: string;
  areaSqft: number;
}

export interface PaymentAdherenceMetrics {
  averageDaysOverdue: number;
  onTimePaymentPercentage: number;
  totalInstallments: number;
  overdueInstallments: number;
  nextPaymentDueDate?: string;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
}

export interface PopulatedUnitDetail extends UnitDetailsSchema {
  id: string;
  unitNumber: string;
  floor?: number;
  currentPrice: number;
  projectName: string;
  unitFeatures?: string[];
  lastMaintenanceDate?: string;
  floorPlanUrl?: string;
  // Fine-grained additions:
  selectedFinishesPackage?: string;
  requestedUpgrades?: RequestedUpgrade[];
  customizationNotes?: string;
  floorPlanVersion?: string;
  floorPlanLastRevisedDate?: string;
  areaBreakdown?: AreaBreakdownItem[];
  orientation?: 'North' | 'South' | 'East' | 'West' | 'North-East' | 'North-West' | 'South-East' | 'South-West';
  // Features from "pending" implementation
  customFields?: CustomField[];
  tags?: string[];
  paymentAdherence?: PaymentAdherenceMetrics;
}

export interface GeospatialLite {
  name: string;
  description: string;
  capabilities: string[];
  benefits: string[];
  sampleProjectLocations: Array<{name: string, lat: number, long: number, amenities: string[]}>;
}

export interface ProjectPropertySetupModule {
  moduleName: string;
  features: {
    dubaiProjectBlueprint: DubaiProjectBlueprint;
    unitInventoryManager: UnitInventoryManager;
    geospatialLite: GeospatialLite;
  };
}

// --- Financial & Payment Plan Module ---
export interface DynamicPaymentPlanCreator {
  name: string;
  interface: string;
  capabilities: string[];
  milestoneExamples: string[];
  benefits: string[];
  samplePaymentPlans: PaymentPlanStructure[];
}

export interface CashFlowDataPoint {
  date: string; 
  projectedInflow: number;
  actualInflow: number;
  projectedOutflow: number;
  actualOutflow: number;
}

export interface RealTimeCashFlowDashboard {
  name: string;
  visualElements: string[];
  inflows: string[];
  outflows: string[];
  benefits: string[];
  sampleCashFlowData: CashFlowDataPoint[];
}

// Enhanced Receivable/Invoice Structure
export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g., INV-2024-00123
  unitId: string;
  buyerName: string;
  installmentMilestone: string; // e.g., "20% Construction Completion"
  amountDue: number;
  issueDate: string;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  paymentDate?: string;
  paymentMethod?: 'Bank Transfer' | 'Credit Card' | 'Cheque' | 'Crypto';
  transactionId?: string | null;
  paymentAttempts?: number;
  lateFeeApplied?: number;
  notes?: string;
  linkedPaymentPlanName?: string;
}
export interface InvoiceTrackingFeature { // New feature name for clarity
  name: string;
  capabilities: string[];
  benefits: string[];
  sampleInvoices: Invoice[];
}

// Kept simple ReceivablePayment for other potential uses or simpler contexts if needed
export interface ReceivablePayment {
  id: string;
  unitId: string;
  buyerName: string;
  amountDue: number;
  dueDate: string;
  status: 'Paid' | 'Upcoming' | 'Overdue';
  reminderSent?: boolean;
  paymentMethod?: 'Bank Transfer' | 'Credit Card' | 'Cheque' | 'Crypto';
  transactionId?: string | null;
}
export interface ReceivablesPaymentsTracking { // Original feature, might be deprecated or simplified
  name: string;
  capabilities: string[];
  benefits: string[];
  sampleReceivables: ReceivablePayment[]; // This might become less prominent
}


export interface ExpenseItem {
    category: string;
    budgetItem: string;
    budgetedAmount: number;
    actualAmount: number;
    variance: number;
    // Fine-grained additions:
    invoiceReference?: string;
    supplierName?: string;
    paymentDate?: string;
    paymentStatus?: 'Pending' | 'Paid' | 'Disputed' | 'Scheduled';
}
export interface BudgetVsActuals {
  name: string;
  description: string;
  benefits: string[];
  sampleExpenses: ExpenseItem[];
}

export interface FinancialPaymentPlanModule {
  moduleName: string;
  features: {
    dynamicPaymentPlanCreator: DynamicPaymentPlanCreator;
    realTimeCashFlowDashboard: RealTimeCashFlowDashboard;
    invoiceTracking: InvoiceTrackingFeature; // Using new Invoice based feature
    budgetVsActuals: BudgetVsActuals;
    // receivablesPaymentsTracking: ReceivablesPaymentsTracking; // Consider deprecating or simplifying
  };
}

// --- Sales & CRM Module ---
export interface LeadInteraction {
    date: string;
    type: 'Call' | 'Email' | 'Meeting' | 'Site Visit' | 'SMS' | 'Chat';
    agent: string;
    summary: string;
    nextAction?: string;
    nextActionDate?: string;
    durationMinutes?: number; // For calls/meetings
}
export interface Lead {
    id: string;
    name: string;
    source: string;
    status: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Closed - Won' | 'Closed - Lost' | 'On Hold';
    assignedAgent: string;
    lastContactDate: string;
    projectInterest: string; // Could be array if interested in multiple
    notes: string;
    leadScore?: number; 
    preferredContactMethod?: 'Email' | 'Phone' | 'WhatsApp';
    detailedNeeds?: string;
    budgetRange?: { min: number, max: number };
    // Fine-grained additions:
    interactionHistory?: LeadInteraction[];
    // Features from "pending" implementation
    customFields?: CustomField[];
    tags?: string[];
}
export interface LeadProspectTracker {
  name: string;
  capabilities: string[];
  benefits: string[];
  sampleLeads: Lead[];
}

export interface UnitReservation {
    unitId: string;
    unitNumber: string;
    projectName: string;
    status: 'Reserved' | 'Booking Confirmed' | 'Sold' | 'Cancelled';
    clientName: string; // Or link to Lead/Customer ID
    reservationDate: string;
    bookingDate?: string;
    linkedPaymentPlan: string;
    salePrice?: number;
    agentId?: string;
}
export interface UnitReservationBooking {
  name: string;
  description: string;
  integration: string;
  benefits: string[];
  sampleReservations: UnitReservation[];
}

export interface UnitViewing { // New entity
    id: string;
    date: string;
    leadId: string; // Link to Lead
    leadName: string; // Denormalized
    agent: string;
    unitId: string; // Link to PopulatedUnitDetail
    unitNumber: string; // Denormalized
    projectName: string; // Denormalized
    feedbackScore?: 1 | 2 | 3 | 4 | 5; // 1 (Poor) to 5 (Excellent)
    positiveNotes?: string;
    negativeNotes?: string;
    outcome?: 'Interested' | 'Not Interested' | 'Follow-up Required' | 'Offer Made';
}
export interface UnitViewingFeedbackFeature { // New feature for the dashboard
    name: string;
    description: string;
    benefits: string[];
    sampleViewings: UnitViewing[];
}


export interface Broker {
    id: string;
    name: string;
    agency: string;
    clientsRegistered: number; // Number of leads/clients they brought
    dealsClosed: number;
    commissionEarned: number;
    status: 'Active' | 'Inactive' | 'Probation';
    // Fine-grained additions:
    leadsGenerated?: number;
    leadToViewingRate?: number; // percentage
    viewingToOfferRate?: number; // percentage
    averageDealClosureTimeDays?: number;
    specialization?: ProjectType[];
    contactEmail?: string;
    contactPhone?: string;
}
export interface BrokerManagement {
  name: string;
  capabilities: string[];
  benefits: string[];
  sampleBrokers: Broker[];
}

export interface AutomatedCommunicationLog {
    id: string;
    customerId: string; // Or Lead ID
    customerName: string;
    communicationType: 'Payment Reminder' | 'Construction Update' | 'Handover Notification' | 'General Announcement' | 'New Offer' | 'Viewing Confirmation';
    channel: 'Email' | 'SMS' | 'App Notification' | 'WhatsApp';
    sentDate: string;
    status: 'Sent' | 'Opened' | 'Clicked' | 'Failed' | 'Bounced';
    contentSnippet: string;
}
export interface AutomatedCustomerCommunication {
  name: string;
  communications: string[]; 
  benefits: string[];
  sampleCommunicationLogs: AutomatedCommunicationLog[];
}

export interface SalesCRMModule {
  moduleName: string;
  features: {
    leadProspectTracker: LeadProspectTracker;
    unitReservationBooking: UnitReservationBooking;
    brokerManagement: BrokerManagement;
    automatedCustomerCommunication: AutomatedCustomerCommunication;
    unitViewingFeedback: UnitViewingFeedbackFeature; // New feature
  };
}

// --- Project Progress & Compliance Module ---
export interface MilestoneSubTask {
    id: string;
    name: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked' | 'Deferred';
    assignedTo: string;
    dueDate?: string;
    // Fine-grained additions:
    progressPercentage?: number; // 0-100
    startDate?: string;
    actualEndDate?: string;
    blockers?: string[]; // Descriptions of blocking issues
    dependsOnTasks?: string[]; // IDs of other sub-tasks it depends on
    estimatedHours?: number;
    actualHours?: number;
}
export interface MilestoneStatus {
    milestoneName: string;
    project: string;
    definedDate: string;
    completionDate?: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed' | 'At Risk';
    linkedToPayment: boolean;
    progressPercentage: number;
    subTasks?: MilestoneSubTask[];
    issuesOrBlockers?: string[];
}
export interface MilestoneProgressTracker {
  name: string;
  milestones: string[]; 
  capabilities: string[];
  benefits: string[];
  sampleMilestoneStatuses: MilestoneStatus[];
}

export interface MediaUpload {
    id: string;
    fileName: string;
    type: 'Photo' | 'Video' | 'Document Scan' | '360 Tour' | 'Drone Footage';
    uploadDate: string;
    timestamp: string;
    uploadedBy: string;
    milestoneTag?: string;
    project: string;
    url: string; 
    geotag?: { lat: number, long: number };
    description?: string;
}
export interface PhotoVideoUpload {
  name: string;
  description: string;
  capabilities: string[];
  benefits: string[];
  sampleUploads: MediaUpload[];
}

export interface ComplianceItem {
    id: string;
    requirementName: string;
    authority: string; 
    status: 'Not Started' | 'In Progress' | 'Submitted' | 'Approved' | 'Rejected' | 'Expired';
    dueDate?: string;
    submissionDate?: string;
    approvalDate?: string;
    expiryDate?: string;
    responsiblePerson: string;
    notes: string;
    linkedDocumentId?: string; // Link to StoredDocument
}
export interface RERAComplianceChecklists { 
  name: string;
  description: string;
  requirements: string[]; 
  capabilities: string[];
  benefits: string[];
  sampleComplianceItems: ComplianceItem[];
}

export interface DocumentVersion {
    version: string; // e.g., "v1.0", "v2.1 Draft"
    uploadDate: string;
    uploadedBy: string;
    changeReason: string;
    filePath: string; // Path for this specific version
}
export interface DocumentAccessLogEntry {
    userId: string;
    userName: string; // Denormalized
    accessDate: string;
    action: 'Viewed' | 'Downloaded' | 'Shared' | 'Edited' | 'VersionChanged';
}
export interface StoredDocument {
    id: string;
    documentName: string;
    documentType: string; 
    project: string;
    uploadDate: string; // Date of initial upload or latest version upload
    currentVersion: string; // The active version string
    status: 'Draft' | 'Approved' | 'Archived' | 'Superseded' | 'Under Review';
    accessPermissions: string[]; 
    filePath: string; // Path to the current version
    expiryDate?: string | null;
    reviewers?: string[];
    keywords?: string[];
    // Fine-grained additions:
    versionHistory?: DocumentVersion[];
    accessLog?: DocumentAccessLogEntry[];
    department?: 'Legal' | 'Finance' | 'Construction' | 'Sales';
}
export interface DigitalDocumentRepository {
  name: string;
  description: string;
  documentTypes: string[];
  capabilities: string[];
  benefits: string[];
  sampleDocuments: StoredDocument[];
}

export interface QualityInspectionChecklistItem {
    item: string; // e.g., "Paint finish quality", "Fixture installation"
    status: 'Pass' | 'Fail' | 'Observation' | 'Not Applicable';
    notes?: string;
    photoUrl?: string; // Link to MediaUpload
    correctedDate?: string;
}
export interface QualityInspectionRecord { // New entity
    id: string;
    inspectionIdNumber: string; // Human-readable ID
    project: string;
    unitId?: string; // If specific to a unit
    milestoneName?: string; // Milestone this inspection relates to
    areaInspected: string; // e.g., "Apartment 301 - Kitchen", "Common Area - Lobby"
    inspectionDate: string;
    inspector: string; // Name or ID
    inspectionType: 'Snagging' | 'Pre-Handover' | 'Milestone Completion' | 'Safety Audit';
    checklistItems: QualityInspectionChecklistItem[];
    overallStatus: 'Approved' | 'Rework Needed' | 'Pending Review';
    reworkDueDate?: string;
    followUpInspectionId?: string; // Link to a subsequent inspection
}
export interface QualityChecklistFeature { // New feature for the dashboard
    name: string;
    description: string;
    benefits: string[];
    sampleInspections: QualityInspectionRecord[];
}


export interface ProjectProgressComplianceModule {
  moduleName: string;
  features: {
    milestoneProgressTracker: MilestoneProgressTracker;
    photoVideoUpload: PhotoVideoUpload;
    reraComplianceChecklists: RERAComplianceChecklists;
    digitalDocumentRepository: DigitalDocumentRepository;
    qualityChecklists: QualityChecklistFeature; // New feature
  };
}

// --- Reporting & Decision Support Module ---
export interface ProjectHealthMetric {
    id: string;
    projectName: string;
    unitsSold: number;
    totalUnits: number;
    revenueCollected: number;
    targetRevenue: number;
    budgetSpent: number;
    totalBudget: number;
    completionPercentage: number;
    cashFlowStatus: 'Positive' | 'Neutral' | 'Negative';
    overduePaymentsCount: number;
    healthIndicator: 'Green' | 'Amber' | 'Red';
    riskLevel?: 'Low' | 'Medium' | 'High'; // Added from implicit overview data
}
export interface ProjectHealthDashboard {
  name: string;
  description: string;
  keyMetrics: string[]; 
  benefits: string[];
  sampleProjectHealthMetrics: ProjectHealthMetric[];
}

export interface ProfitabilityData {
    projectId: string;
    projectName: string;
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    netProfit: number; 
    roiPercentage: number;
    period: string; 
    revenueBreakdown?: Array<{source: string, amount: number}>; // e.g. [{source: 'Unit Sales', amount: X}, {source: 'Amenities', amount: Y}]
    costBreakdown?: Array<{category: string, amount: number}>;
}
export interface ProfitabilityAnalysis {
  name: string;
  calculations: string[]; 
  dataSource: string;
  benefits: string[];
  sampleProfitabilityData: ProfitabilityData[];
}

export interface GeneratedReport {
    id: string;
    reportName: string;
    reportType: 'Project Progress' | 'Financial Performance' | 'Unit Sales Summary' | 'Investor Update' | 'Compliance Audit';
    generatedFor: 'Investor Group A' | 'Bank XYZ' | 'Internal Management' | 'Regulatory Body';
    generationDate: string;
    periodCovered: string;
    status: 'Draft' | 'Finalized' | 'Sent' | 'Archived';
    format?: 'PDF' | 'Excel' | 'Dashboard Snapshot';
}
export interface InvestorBankReporting {
  name: string;
  description: string;
  reportTypes: string[]; 
  benefits: string[];
  sampleReports: GeneratedReport[];
}

export interface ReportingDecisionSupportModule {
  moduleName: string;
  features: {
    projectHealthDashboard: ProjectHealthDashboard;
    profitabilityAnalysis: ProfitabilityAnalysis;
    investorBankReporting: InvestorBankReporting;
  };
}

// --- Facilities Management Module ---
export interface MaintenanceLogEntry {
  date: string;
  notes: string;
  performedBy: string;
  cost?: number;
}

export interface AssetComponent { // New for FacilityAsset
    componentId: string; // e.g., COMP-HVAC-001-Compressor
    name: string; // e.g., "Compressor", "Fan Motor"
    serialNumber?: string;
    installDate: string;
    warrantyExpiryDate?: string;
    lastServiceDate?: string;
    manufacturer?: string;
    supplier?: string;
    status?: 'Operational' | 'Needs Repair' | 'Replaced';
}
export interface FacilityAsset {
  id: string;
  name: string; 
  assetType: 'HVAC' | 'Elevator' | 'Plumbing System' | 'Electrical Panel' | 'Fire Safety System' | 'Swimming Pool Equipment' | 'Security System' | 'Landscaping Feature' | 'Generator' | 'Water Pump';
  projectLocation: string; 
  specificLocation?: string; 
  status: 'Operational' | 'Maintenance Due' | 'Under Repair' | 'Out of Order' | 'Scheduled Replacement' | 'Decommissioned';
  installationDate: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDueDate?: string;
  assignedTechnician?: string;
  maintenanceLog?: MaintenanceLogEntry[];
  warrantyExpiryDate?: string;
  // Fine-grained additions:
  purchaseCost?: number;
  operationalHours?: number;
  expectedLifespanYears?: number;
  components?: AssetComponent[]; // Detailed components
  // Features from "pending" implementation
  customFields?: CustomField[];
  tags?: string[];
}

export interface MaintenanceTask {
  id: string;
  facilityAssetId: string; 
  facilityAssetName: string; 
  taskDescription: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  taskType?: 'Preventive' | 'Corrective' | 'Inspection' | 'Emergency';
  status: 'Pending' | 'Scheduled' | 'In Progress' | 'On Hold - Parts' | 'Completed' | 'Cancelled' | 'Requires Follow-up';
  reportedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  assignedTo: string; 
  notes?: string;
  estimatedHours?: number;
  actualHours?: number;
  // Fine-grained additions:
  laborCosts?: number;
  partsCost?: number;
  totalCost?: number; // Auto-calculated or manual
  invoiceReference?: string; // Link to an expense invoice
  toolsRequired?: string[];
}

export interface ServiceProvider {
  id: string;
  name: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  specialization: string[]; 
  rating?: number; 
  notes?: string;
  contractId?: string;
  contractExpiryDate?: string;
  address?: string;
}

export interface AssetRegisterFeature {
    name: string;
    description: string;
    benefits: string[];
    sampleAssets: FacilityAsset[];
}
export interface MaintenanceSchedulerFeature {
    name: string;
    description: string;
    benefits: string[];
    sampleTasks: MaintenanceTask[];
}
export interface ServiceProviderDirectoryFeature { // Re-adding for completeness, was optional
    name: string;
    description: string;
    benefits: string[];
    sampleProviders: ServiceProvider[];
}

export interface FacilitiesManagementModule {
  moduleName: string;
  features: {
    assetRegister: AssetRegisterFeature;
    maintenanceScheduler: MaintenanceSchedulerFeature;
    serviceProviderDirectory: ServiceProviderDirectoryFeature; // Include this
  };
}


// --- Overall Platform Data Structure ---
export interface PlatformModules {
  projectPropertySetup: ProjectPropertySetupModule;
  financialPaymentPlan: FinancialPaymentPlanModule;
  salesCRM: SalesCRMModule;
  projectProgressCompliance: ProjectProgressComplianceModule;
  reportingDecisionSupport: ReportingDecisionSupportModule;
  facilitiesManagement: FacilitiesManagementModule;
}

export interface OverviewProjectActivity {
  date: string;
  activity: string;
  user: string;
  details?: string; // Added detail
}
export interface PlatformData {
  platform: PlatformInfo;
  modules: PlatformModules;
  overallProjects: OverviewProject[]; 
}

// Simplified Project for Overview
export interface OverviewProject {
  id: string;
  name: string;
  type: ProjectType;
  status: 'Planning' | 'Construction' | 'Sales Phase' | 'Completed' | 'On Hold' | 'Pre-Launch';
  overallProgress: number; // 0-100
  budgetUtilization: number; // percentage of budget spent
  estimatedCompletionDate: string;
  unitsSold: number;
  totalUnits: number;
  keyRisks: string[];
  financialHealth: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical'; // Heuristic
  thumbnailUrl: string; 
  units: PopulatedUnitDetail[]; 
  recentActivity?: OverviewProjectActivity[];
  marketSentiment?: 'Positive' | 'Neutral' | 'Cautious' | 'Negative' | 'Volatile';
  // Features from "pending" implementation
  customFields?: CustomField[];
  tags?: string[];
}

// For AdvancedTreemap component
export interface TreemapChartNode {
  name: string; 
  size: number; 
  children?: TreemapChartNode[];
  originalProject?: OverviewProject; 
  projectType?: ProjectType; 
  financialHealth?: OverviewProject['financialHealth'];
}
