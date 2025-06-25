
import React from 'react';

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-[var(--brand-secondary)]/70 shadow-2xl rounded-xl overflow-hidden backdrop-blur-md border border-[var(--brand-primary)]/30">
      <div className="p-5 sm:p-6 border-b border-[var(--brand-primary)]/20">
        <h2 className="text-2xl font-semibold text-[var(--brand-primary)] flex items-center">
          {icon && <span className="mr-3">{icon}</span>} {/* Icon color should be set on the icon itself or inherit */}
          {title}
        </h2>
      </div>
      <div className="p-5 sm:p-6">
        {children}
      </div>
    </div>
  );
};