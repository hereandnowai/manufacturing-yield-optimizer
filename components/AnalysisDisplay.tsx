
import React from 'react';
import { AnalysisResult, GeneratedVisualization } from '../types';
import { CheckCircleIcon, ListIcon, LightbulbIcon, ChartBarIcon } from './icons'; 
import ChartRenderer from './ChartRenderer';

interface AnalysisDisplayProps {
  result: AnalysisResult;
}

const ResultSection: React.FC<{ title: string; items: string[] | undefined; icon: React.ReactNode }> = ({ title, items, icon }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-xl font-semibold text-[var(--brand-primary)] mb-3 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      <ul className="space-y-2 list-inside pl-1">
        {items.map((item, index) => (
          <li key={index} className="text-[var(--brand-text-on-secondary)] leading-relaxed bg-[var(--brand-secondary)]/50 p-3 rounded-md shadow flex items-start border border-[var(--brand-primary)]/20">
            <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2 mt-1 flex-shrink-0" /> {/* Keeping specific icon color for semantic meaning */}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const VisualizationsDisplaySection: React.FC<{ visualizations: GeneratedVisualization[] | undefined }> = ({ visualizations }) => {
  if (!visualizations || visualizations.length === 0) return null;

  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-xl font-semibold text-[var(--brand-primary)] mb-4 flex items-center">
        <ChartBarIcon className="w-6 h-6 text-[var(--brand-primary)]" />
        <span className="ml-2">Data Visualizations</span>
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {visualizations.map((vis, index) => (
          <ChartRenderer key={`${index}-${vis.title}`} visualization={vis} />
        ))}
      </div>
    </div>
  );
};


export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {
  return (
    <div className="space-y-8 p-1">
      <ResultSection title="Key Insights" items={result["Key Insights"]} icon={<LightbulbIcon className="w-6 h-6 text-[var(--brand-primary)]" />} />
      <ResultSection title="Top Yield Impact Factors" items={result["Top Yield Impact Factors"]} icon={<ListIcon className="w-6 h-6 text-[var(--brand-primary)]" />} />
      <ResultSection title="Optimization Suggestions" items={result["Optimization Suggestions"]} icon={<CheckCircleIcon className="w-6 h-6 text-green-400" />} /> {/* Keeping specific green for suggestion success */}
      <VisualizationsDisplaySection visualizations={result["Visualizations"]} />
    </div>
  );
};