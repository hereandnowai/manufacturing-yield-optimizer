
export interface ChartDataset {
  label: string; // e.g., 'Yield', 'Defect Rate'
  data: (number | { x: string | number; y: number })[]; // Array of numbers for bar/pie/line y-values, or {x,y} for scatter
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  fill?: boolean | string | { target: string | number | 'start' | 'end' | 'origin'; above?: string; below?: string; }; // For line charts, updated for Chart.js fill options
  borderWidth?: number;
  tension?: number; // For line charts (curve)
  pointRadius?: number; // For scatter/line points
  pointBackgroundColor?: string | string[];
}

export interface ChartData {
  labels?: string[]; // X-axis labels for bar/line/pie
  datasets: ChartDataset[];
}

export interface GeneratedVisualization {
  title: string;
  type: 'bar' | 'scatter' | 'pie' | 'line';
  chartData: ChartData;
}

export interface AnalysisResult {
  "Key Insights": string[];
  "Top Yield Impact Factors": string[];
  "Optimization Suggestions": string[];
  "Optional Predicted Yield (if inputs provided)"?: string;
  "Visualizations"?: GeneratedVisualization[]; // Changed from SuggestedVisualizations
}

export interface HypotheticalInputs {
  [key: string]: string | number;
}

export interface ProcessParameter {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[]; // For select type
  unit?: string; // e.g., °C, %
}
