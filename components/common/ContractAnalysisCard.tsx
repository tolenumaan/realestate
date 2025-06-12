

import React, { useState, useCallback } from 'react';
import { analyzeContract } from '../../services/aiService';
import { FEATURE_ICONS, UI_THEME_COLORS } from '../../constants';
import { ArrowUpOnSquareIcon, QuestionMarkCircleIcon, DocumentMagnifyingGlassIcon as OutlineDocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ContractAnalysisCardProps {}

const fileToBas_64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const ContractAnalysisCard: React.FC<ContractAnalysisCardProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const AiContractIcon = FEATURE_ICONS['ContractAnalysis'] || OutlineDocumentMagnifyingGlassIcon;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" || selectedFile.type === "text/plain" || selectedFile.type === "application/msword" || selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setFile(selectedFile);
        setFilePreview(selectedFile.name);
        setError(null);
      } else {
        setError("Invalid file type. Please upload a PDF, DOCX, or TXT file.");
        setFile(null);
        setFilePreview(null);
      }
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!file) {
      setError("Please select a contract file for analysis.");
      return;
    }
    if (!query.trim()) {
      setError("Please articulate your query regarding the contract.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult('');

    try {
      const base64Content = await fileToBas_64(file);
      const mimeType = file.type;
      const result = await analyzeContract(base64Content, mimeType, query);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'Contract analysis failed due to an unexpected issue.');
    } finally {
      setIsLoading(false);
    }
  }, [file, query]);

  return (
    <div className="bg-brand-bg-surface/60 backdrop-blur-lg backdrop-saturate-150 shadow-2xl rounded-xl p-8 border border-brand-text-light/15 transition-all duration-300 hover:shadow-brand-accent/30 hover:border-brand-accent-muted/40 space-y-7">
      <div className="flex items-center">
        <AiContractIcon className="h-9 w-9 text-brand-accent mr-5 flex-shrink-0" />
        <div>
          <h4 className="text-3xl font-heading font-semibold text-brand-text-light">AI Contract Intelligence</h4>
          <p className="text-base text-brand-text-medium font-light mt-1">Upload a contract (PDF, DOCX, TXT) and pose specific queries for AI-driven insights.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="contract-file-upload" className="block text-base font-medium text-brand-text-medium mb-2">
            Upload Contract Document
          </label>
          <div className="mt-1.5 flex justify-center px-7 py-10 border-2 border-brand-border-primary/70 border-dashed rounded-lg hover:border-brand-accent-muted/70 transition-colors duration-200 bg-brand-bg-deep/60">
            <div className="space-y-1.5 text-center">
              <ArrowUpOnSquareIcon className="mx-auto h-14 w-14 text-brand-text-medium/60" />
              <div className="flex text-base text-brand-text-medium">
                <label
                  htmlFor="contract-upload"
                  className="relative cursor-pointer bg-brand-secondary rounded-md font-medium text-brand-accent hover:text-brand-accent-muted focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-brand-bg-surface focus-within:ring-brand-accent px-4 py-2 transition-colors"
                >
                  <span>Select a file</span>
                  <input id="contract-upload" name="contract-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.txt,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                </label>
                <p className="pl-2.5 self-center">or drag and drop</p>
              </div>
              <p className="text-sm text-brand-text-medium/60">PDF, DOCX, TXT up to 10MB</p>
            </div>
          </div>
          {filePreview && <p className="mt-3 text-sm text-brand-success font-medium">Selected: {filePreview}</p>}
        </div>

        <div>
          <label htmlFor="contract-query" className="block text-base font-medium text-brand-text-medium mb-2">
            Your Query
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <QuestionMarkCircleIcon className="h-5 w-5 text-brand-text-medium/80" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="contract-query"
              id="contract-query"
              className="block w-full pl-12 pr-5 py-3.5 bg-brand-bg-deep border border-brand-border-primary text-brand-text-light rounded-lg shadow-sm focus:ring-2 focus:ring-brand-accent focus:border-brand-accent text-base placeholder-brand-text-medium/70 transition-colors"
              placeholder="e.g., What are the key obligations for Party A?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !file}
          className="w-full px-7 py-3.5 bg-brand-accent hover:bg-brand-accent-muted text-brand-text-dark rounded-lg text-base font-semibold transition-colors duration-200 flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-brand-text-dark mr-3"></div>
              Analyzing Document...
            </>
          ) : (
            <>
              <AiContractIcon className="h-5 w-5 mr-3" />
              Process & Analyze Contract
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="my-5 p-5 bg-brand-danger/20 border border-brand-danger/50 text-brand-danger rounded-lg text-base shadow">
          <p className="font-semibold mb-1.5">Analysis Error:</p>
          <p className="font-light">{error}</p>
        </div>
      )}

      {analysisResult && !isLoading && (
        <div className="space-y-4 pt-5 border-t border-brand-text-light/10">
          <h5 className="text-xl font-heading font-semibold text-brand-text-light">AI Generated Analysis:</h5>
          <div className="p-6 bg-brand-bg-deep/70 rounded-lg border border-brand-border-primary/50 shadow-inner">
            <p className="text-lg text-brand-text-light whitespace-pre-wrap leading-relaxed font-light">{analysisResult}</p>
          </div>
        </div>
      )}
    </div>
  );
};