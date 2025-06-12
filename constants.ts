
import { View } from './types';
import {
  ChartBarIcon, PresentationChartLineIcon, CurrencyDollarIcon, UsersIcon,
  ClipboardDocumentCheckIcon, DocumentChartBarIcon, HomeIcon, AdjustmentsHorizontalIcon,
  CreditCardIcon, UserGroupIcon, BuildingOffice2Icon, QueueListIcon, MapPinIcon, CameraIcon, DocumentDuplicateIcon, PresentationChartBarIcon, BanknotesIcon, ShieldCheckIcon, ChartPieIcon,
  WrenchScrewdriverIcon, CogIcon, DocumentMagnifyingGlassIcon as SolidDocumentMagnifyingGlassIcon, ChatBubbleLeftRightIcon,
  AcademicCapIcon, ScaleIcon, CalculatorIcon, TagIcon, SparklesIcon, DocumentTextIcon,
  DocumentMagnifyingGlassIcon as OutlineDocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export const UI_THEME_COLORS = {
  // Core UI Colors - Deep Aubergine and Gold Luxury Palette
  primary: '#4A003D',           // Deep Aubergine (Primary Action, Active States)
  primaryDarker: '#3A002D',      // Darker Deep Aubergine
  secondary: '#6A2E5D',         // Medium Aubergine (Secondary Elements, Headers)
  accent: '#D4AF37',            // Rich Gold (Primary Accent)
  accentMuted: '#B08D57',       // Antique Gold (Muted Accent, Borders)
  
  bgDeep: '#120E16',            // Very Dark Plum/Charcoal (Main Page Background)
  bgSurface: '#211D29',         // Dark Plum/Charcoal (Card/Surface Backgrounds)
  bgSurfaceLight: '#2C2836',    // Slightly Lighter Plum/Charcoal (Hover on Surfaces)

  textLight: '#F0E8F3',         // Light Lavender/Off-White (Primary Text on Dark)
  textMedium: '#C3B8C9',        // Muted Lavender/Grey (Secondary Text on Dark)
  textDark: '#312A38',          // Dark Plum (Text on Light/Gold Backgrounds)
  textPlaceholder: '#897F92',   // Muted Lavender for placeholders

  borderPrimary: '#312A38',     // Dark Plum border (Subtle on surfaces)
  borderAccent: '#B08D57',      // Antique Gold border (Highlight borders)

  // Status Colors - Sophisticated Tones
  status: {
    success: '#638A54',        // Muted Olive Green
    warning: '#C78D4D',        // Terracotta/Amber
    danger: '#B5484D',         // Muted Crimson
    info: '#6A839C',           // Dusty Blue/Slate
    
    completed: '#638A54',
    inprogress: '#6A839C',     // Dusty Blue/Slate (Using info for in-progress)
    onhold: '#C78D4D',
    pipeline: '#8C4C7C',       // Lighter Aubergine (Matches a chart color)
    planning: '#897F92',       // Placeholder text color for subtle planning state
    cancelled: '#B5484D', 
    critical: '#B5484D',
    
    high: '#C78D4D',           // Warning color for high priority
    medium: '#D4AF37',         // Gold for medium priority/highlight
    low: '#6A839C',            // Info color for low priority
    normal: '#638A54',         // Success color
    
    operational: '#638A54',
    maintenance: '#D4AF37',    // Gold for maintenance state
    degraded: '#C78D4D',
    offline: '#6D6A75',        // Medium Grey-Purple (from old palette, could be UI_THEME_COLORS.textMedium)
    
    active: '#638A54',
    standby: '#6A839C',
    inactive: '#897F92',
    error: '#B5484D',
    pending: '#C78D4D',
    
    available: '#A9E0A4',      // Light, desaturated green - or could use a light gold/cream text with specific bg
    sold: '#4A003D',           // Primary Aubergine (for text on light bg, or bg itself)
    reserved: '#D4AF37',       // Gold for reserved
  },

  // Chart Colors - Sophisticated and Harmonious
  charts: {
    gold1: '#D4AF37',          // Rich Gold
    gold2: '#B08D57',          // Antique Gold
    aubergine1: '#6A2E5D',      // Medium Aubergine
    aubergine2: '#8C4C7C',      // Light Aubergine
    cream: '#E0D8CC',          // Warm Cream
    silver: '#A9A9A9',          // Muted Silver/Grey
    mutedGreen: '#7A9E7E',     // Soft, desaturated Green
    mutedBlue: '#6C8490',       // Soft, desaturated Blue
    deepRed: '#A42A28',         // For negative values or critical highlights in charts
    lightLavender: '#C3B8C9'   // For grid lines or subtle elements
  },
};

export const NAVIGATION_ITEMS = [
  { name: View.Overview, icon: HomeIcon, href: '#' },
  { name: View.ProjectSetup, icon: BuildingOffice2Icon, href: '#' },
  { name: View.Financials, icon: CurrencyDollarIcon, href: '#' },
  { name: View.SalesCRM, icon: UsersIcon, href: '#' },
  { name: View.ProgressCompliance, icon: ClipboardDocumentCheckIcon, href: '#' },
  { name: View.Reporting, icon: DocumentChartBarIcon, href: '#' },
  { name: View.FacilitiesManagement, icon: WrenchScrewdriverIcon, href: '#' },
];

export const FEATURE_ICONS: { [key: string]: React.ElementType } = {
  // Project Setup
  DubaiProjectBlueprint: QueueListIcon,
  UnitInventoryManager: AdjustmentsHorizontalIcon,
  GeospatialLite: MapPinIcon,
  // Financials
  DynamicPaymentPlanCreator: CreditCardIcon,
  RealTimeCashFlowDashboard: PresentationChartLineIcon,
  ReceivablesPaymentsTracking: BanknotesIcon,
  InvoiceTracking: BanknotesIcon,
  BudgetVsActuals: ChartPieIcon,
  // Sales & CRM
  LeadProspectTracker: UserGroupIcon,
  UnitReservationBooking: ShieldCheckIcon,
  BrokerManagement: UsersIcon,
  AutomatedCustomerCommunication: PresentationChartBarIcon,
  UnitViewingFeedback: ChatBubbleLeftRightIcon,
  // Progress & Compliance
  MilestoneProgressTracker: ChartBarIcon,
  PhotoVideoUpload: CameraIcon,
  RERAComplianceChecklists: ClipboardDocumentCheckIcon,
  DigitalDocumentRepository: DocumentDuplicateIcon,
  QualityChecklists: SolidDocumentMagnifyingGlassIcon,
  ContractAnalysis: OutlineDocumentMagnifyingGlassIcon,
  // Reporting
  ProjectHealthDashboard: PresentationChartLineIcon,
  ProfitabilityAnalysis: ChartPieIcon,
  InvestorBankReporting: DocumentChartBarIcon,
  ScenarioForecasting: CalculatorIcon,
  // Facilities Management
  AssetRegister: CogIcon,
  MaintenanceScheduler: ClipboardDocumentCheckIcon,
  ServiceProviderDirectory: UserGroupIcon,
  TechnicianPerformance: UsersIcon,

  // General / Fine-grained Indicators
  CustomFields: AcademicCapIcon,
  Tags: TagIcon,
  PaymentAdherence: ScaleIcon,
  AiGenerate: SparklesIcon,
};


export const MOCK_PROJECT_NAMES = [
  "Elysian Towers", "Azure Residences", "Veridian Plaza", "Serene Gardens Villas", "Quantum Business Hub",
  "Celestial Apartments", "Pinnacle Heights", "Oasis Springs", "Terra Nova Complex", "Horizon Suites",
  "Starlight Towers", "Golden Gate Condos", "Silver Creek Estates", "Sapphire Business Park", "Emerald Greens"
];

export const MOCK_BUYER_NAMES = [
  "Alice Smith", "Bob Johnson", "Carol Williams", "David Brown", "Eve Jones", "Frank Garcia", "Grace Miller",
  "Henry Davis", "Ivy Rodriguez", "Jack Wilson", "Kate Martinez", "Liam Anderson", "Mia Thomas", "Noah Jackson",
  "Olivia White", "Peter Harris", "Quinn Martin", "Ryan Thompson", "Sophia Garcia", "Tyler Robinson"
];

export const MOCK_AGENT_NAMES = ["Agent Sinclair", "Agent Dubois", "Agent Al Fayed", "Agent Vanderbilt", "Agent Chen", "Supervisor Sterling", "Manager Hawthorne", "Director DeVere"];
export const MOCK_TECHNICIAN_NAMES = ["Tech Alistair B.", "Tech Brenda C.", "Tech Carlos D.", "Tech Diana E.", "Tech Edward F.", "Lead Tech Priya S.", "Maintenance Team Alpha", "Service Pro Excellence"];


export const MOCK_BROKER_AGENCIES = ["Global Realty Partners", "Prestige Properties Inc.", "Cityscape Brokers United", "Prime Locations Ltd.", "Desert Homes Real Estate"];

export const MOCK_MILESTONES_GENERAL = ["Foundation Complete", "Structure Level 1", "Structure Top-Out", "External Cladding 50%", "Internal Finishing Start", "Landscaping Phase 1", "Handover Process Start", "Project Completion"];

export const MOCK_DOCUMENT_TYPES_GENERAL = ["NOC - Authority A", "Permit - Construction Phase 1", "Contract - Main Contractor", "Drawing - Architectural Floor Plan Set", "Compliance Certificate - Safety Audit", "Sales & Purchase Agreement Template", "Supplier Contract - HVAC"];

export const CHART_COLORS = Object.values(UI_THEME_COLORS.charts);
