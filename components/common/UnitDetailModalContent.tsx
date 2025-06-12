
import React, { useState, useCallback } from 'react';
import { PopulatedUnitDetail } from '../../types';
import { DetailViewDisplay } from './DetailViewDisplay';
import { generatePropertyDescription } from '../../services/aiService';
import { FEATURE_ICONS } from '../../constants';
import { ClipboardDocumentIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface UnitDetailModalContentProps {
  unit: PopulatedUnitDetail;
}

export const UnitDetailModalContent: React.FC<UnitDetailModalContentProps> = ({ unit }) => {
  const [generatedDescription, setGeneratedDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const AiIcon = FEATURE_ICONS['AiGenerate'];

  const handleGenerateDescription = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const description = await generatePropertyDescription(unit);
      setGeneratedDescription(description);
    } catch (err: any) {
      setError((err instanceof Error ? err.message : String(err)) || 'Failed to generate description.');
      setGeneratedDescription('');
    } finally {
      setIsLoading(false);
    }
  }, [unit]);

  const handleCopyToClipboard = () => {
    if (generatedDescription) {
      navigator.clipboard.writeText(generatedDescription)
        .then(() => {
          // Consider a more subtle notification system in a real app
          alert("Narrative copied to clipboard!");
        })
        .catch(copyError => {
          console.error('Failed to copy text: ', copyError);
          alert("Failed to copy narrative.");
        });
    }
  };

  return (
    <div className="space-y-10">
      <DetailViewDisplay item={unit} />

      <div className="pt-8 border-t border-brand-border-primary/50">
        <h4 className="text-2xl font-heading font-semibold text-brand-text-light mb-5 flex items-center">
          {AiIcon && <AiIcon className="h-7 w-7 mr-3.5 text-brand-accent" />}
          AI-Crafted Narrative
        </h4>

        {!generatedDescription && !isLoading && (
          <button
            onClick={handleGenerateDescription}
            className="w-full px-7 py-3.5 bg-brand-accent hover:bg-brand-accent-muted text-brand-text-dark rounded-lg text-base font-semibold transition-colors duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
            disabled={isLoading}
          >
            {AiIcon && <AiIcon className="h-5.5 w-5.5 mr-3" />}
            Generate Property Narrative
          </button>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent mx-auto"></div>
            <p className="mt-4 text-base text-brand-text-medium">Crafting narrative...</p>
          </div>
        )}

        {error && (
          <div className="my-5 p-5 bg-brand-danger/20 border border-brand-danger/50 text-brand-danger rounded-lg text-base shadow">
            <p className="font-semibold mb-1.5">Error Generating Narrative:</p>
            <p className="font-light">{error}</p>
          </div>
        )}

        {generatedDescription && !isLoading && (
          <div className="space-y-5">
            <div className="p-6 bg-brand-bg-deep/60 rounded-lg border border-brand-border-primary/50 shadow-inner">
              <p className="text-lg text-brand-text-light whitespace-pre-wrap leading-relaxed font-light">{generatedDescription}</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3.5 sm:space-y-0 sm:space-x-5">
              <button
                onClick={handleCopyToClipboard}
                className="flex-1 px-6 py-3 bg-brand-secondary hover:bg-brand-primary/80 text-brand-text-light rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center border border-brand-border-primary shadow-sm hover:shadow-md"
              >
                <ClipboardDocumentIcon className="h-5 w-5 mr-2.5" />
                Copy Narrative
              </button>
              <button
                onClick={handleGenerateDescription} // Regenerate
                className="flex-1 px-6 py-3 bg-brand-accent hover:bg-brand-accent-muted text-brand-text-dark rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                disabled={isLoading}
              >
                <ArrowPathIcon className="h-5 w-5 mr-2.5" />
                Refine Narrative
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};