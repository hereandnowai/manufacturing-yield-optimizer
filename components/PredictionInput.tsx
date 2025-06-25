
import React from 'react';
import { HypotheticalInputs, ProcessParameter } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { PlayIcon } from './icons';

interface PredictionInputProps {
  parameters: ProcessParameter[];
  inputs: HypotheticalInputs;
  onInputChange: (field: string, value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const PredictionInput: React.FC<PredictionInputProps> = ({ parameters, inputs, onInputChange, onSubmit, isLoading }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parameters.map(param => (
          <div key={param.id}>
            <label htmlFor={param.id} className="block text-sm font-medium text-[var(--brand-text-on-secondary)] mb-1">
              {param.label} {param.unit && <span className="text-xs text-[var(--brand-text-on-secondary-muted)]">({param.unit})</span>}
            </label>
            {param.type === 'select' && param.options ? (
              <select
                id={param.id}
                name={param.id}
                value={inputs[param.id] || ''}
                onChange={(e) => onInputChange(param.id, e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-[var(--brand-primary)]/40 bg-[var(--brand-secondary)]/80 rounded-md shadow-sm focus:outline-none focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] sm:text-sm text-[var(--brand-text-on-secondary)] placeholder-[var(--brand-text-on-secondary-muted)]"
                disabled={isLoading}
              >
                <option value="">Select {param.label}</option>
                {param.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={param.type}
                id={param.id}
                name={param.id}
                value={inputs[param.id] || ''}
                onChange={(e) => onInputChange(param.id, e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-[var(--brand-primary)]/40 bg-[var(--brand-secondary)]/80 rounded-md shadow-sm focus:outline-none focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] sm:text-sm text-[var(--brand-text-on-secondary)] placeholder-[var(--brand-text-on-secondary-muted)]"
                placeholder={`Enter ${param.label.toLowerCase()}`}
                disabled={isLoading}
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-[var(--brand-text-on-primary)] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-darker)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--brand-secondary)] focus:ring-[var(--brand-primary)] disabled:bg-[var(--brand-text-on-secondary-muted)]/50 disabled:text-[var(--brand-text-on-secondary-muted)] disabled:cursor-not-allowed transition-colors duration-150"
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="w-5 h-5 mr-2 text-[var(--brand-text-on-primary)]" />
            Predicting...
          </>
        ) : (
          <>
           <PlayIcon className="w-5 h-5 mr-2" />
            Predict Yield
          </>
        )}
      </button>
    </div>
  );
};