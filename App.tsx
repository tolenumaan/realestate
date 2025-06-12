

import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/dashboards/OverviewDashboard';
import { ProjectSetupDashboard } from './components/dashboards/ProjectSetupDashboard';
import { FinancialDashboard } from './components/dashboards/FinancialDashboard';
import { SalesCrmDashboard } from './components/dashboards/SalesCrmDashboard';
import { ProgressComplianceDashboard } from './components/dashboards/ProgressComplianceDashboard';
import { ReportingDecisionSupportDashboard } from './components/dashboards/ReportingDecisionSupportDashboard';
import { FacilitiesManagementDashboard } from './components/dashboards/FacilitiesManagementDashboard';
import { generatePlatformData } from './services/dataService';
import { View, PlatformData } from './types';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Overview);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const platformData: PlatformData | null = useMemo(() => {
    try {
      return generatePlatformData();
    } catch (error) {
      console.error("Critical Error: Failed to generate platform data.", error);
      return null;
    }
  }, []);

  const renderView = () => {
    if (!platformData) {
      return <div className="text-brand-text-medium p-10 text-center font-sans">Loading platform data or encountering an issue...</div>;
    }
    switch (currentView) {
      case View.Overview:
        return <OverviewDashboard platformData={platformData} searchTerm={searchTerm} />;
      case View.ProjectSetup:
        return <ProjectSetupDashboard projectSetup={platformData.modules.projectPropertySetup} searchTerm={searchTerm} />;
      case View.Financials:
        return <FinancialDashboard financialModule={platformData.modules.financialPaymentPlan} searchTerm={searchTerm} />;
      case View.SalesCRM:
        return <SalesCrmDashboard salesModule={platformData.modules.salesCRM} searchTerm={searchTerm} />;
      case View.ProgressCompliance:
        return <ProgressComplianceDashboard progressModule={platformData.modules.projectProgressCompliance} searchTerm={searchTerm} />;
      case View.Reporting:
        return <ReportingDecisionSupportDashboard
                  reportingModule={platformData.modules.reportingDecisionSupport}
                  platformData={platformData}
                  searchTerm={searchTerm}
                />;
      case View.FacilitiesManagement:
        return <FacilitiesManagementDashboard fmModule={platformData.modules.facilitiesManagement} searchTerm={searchTerm} />;
      default:
        return <OverviewDashboard platformData={platformData} searchTerm={searchTerm} />;
    }
  };

  if (!platformData) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-bg-deep text-brand-text-light p-6 sm:p-8 font-sans">
        <div className="max-w-lg bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 p-8 sm:p-12 rounded-xl shadow-2xl border border-brand-danger/50">
          <ExclamationTriangleIcon className="h-20 w-20 text-brand-danger mx-auto mb-8" />
          <h1 className="text-4xl font-heading font-semibold text-brand-danger mb-5 text-center">Application Error</h1>
          <p className="text-xl text-brand-text-medium mb-3 text-center">A critical issue prevented the application data from loading.</p>
          <p className="text-base text-brand-text-medium/80 text-center">Please check the browser console for technical details or contact technical support for assistance.</p>
           <button 
            onClick={() => window.location.reload()}
            className="mt-10 w-full px-8 py-3.5 bg-brand-danger text-white font-semibold rounded-lg shadow-md hover:bg-opacity-85 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-danger focus:ring-opacity-60 text-base"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-brand-bg-deep text-brand-text-light font-sans">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header platformName={platformData.platform.name} onSearch={setSearchTerm} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-bg-deep p-6 md:p-10 scroll-smooth">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;