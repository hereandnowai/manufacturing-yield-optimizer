
import React, { useCallback, useState } from 'react';
import { UploadCloudIcon } from './icons';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled && event.dataTransfer.items && event.dataTransfer.items.length > 0) {
        event.dataTransfer.dropEffect = 'copy'; 
    } else {
        event.dataTransfer.dropEffect = 'none';
    }
  }, [disabled]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload, disabled]);

  const baseClasses = "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out";
  // Use CSS variables for brand colors
  const idleClasses = "border-[var(--brand-primary)]/50 hover:border-[var(--brand-primary)] bg-[var(--brand-secondary)]/30 hover:bg-[var(--brand-secondary)]/50";
  const draggingClasses = "border-[var(--brand-primary)] bg-[var(--brand-primary)]/20";
  const disabledClasses = "border-[var(--brand-text-on-secondary-muted)]/30 bg-[var(--brand-secondary)]/20 cursor-not-allowed opacity-60";

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`${baseClasses} ${disabled ? disabledClasses : (isDragging ? draggingClasses : idleClasses)}`}
    >
      <label htmlFor="file-upload" className={`flex flex-col items-center justify-center w-full h-full ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <UploadCloudIcon className={`w-12 h-12 mb-3 ${isDragging ? 'text-[var(--brand-primary)]' : 'text-[var(--brand-text-on-secondary-muted)]'}`} />
        <p className={`mb-2 text-sm ${isDragging ? 'text-[var(--brand-primary)]' : 'text-[var(--brand-text-on-secondary)]'}`}>
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className={`text-xs ${isDragging ? 'text-[var(--brand-primary)]/80' : 'text-[var(--brand-text-on-secondary-muted)]'}`}>CSV or Excel files (XLS, XLSX)</p>
        <input 
            id="file-upload" 
            type="file" 
            className="hidden" 
            accept=".csv, .xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange} 
            disabled={disabled} 
        />
      </label>
    </div>
  );
};