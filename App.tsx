
import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { PredictionInput } from './components/PredictionInput';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SectionCard } from './components/SectionCard';
import { analyzeDataWithGemini, predictYieldWithGemini } from './services/geminiService';
import { AnalysisResult, HypotheticalInputs } from './types';
import { PREDICTION_PARAMETERS } from './constants';
import { 
  AlertTriangleIcon, HelpCircleIcon, ZapIcon,
  BlogIcon, GitHubIcon, InstagramIcon, LinkedInIcon, XIcon, YouTubeIcon,
  EmailIcon, WebsiteIcon
} from './components/icons';

// Make Papa and XLSX globally available for type checking
declare var Papa: any;
declare var XLSX: any;

const BRAND_INFO = {
  organizationShortName: "HERE AND NOW AI",
  organizationLongName: "HERE AND NOW AI - Artificial Intelligence Research Institute",
  website: "https://hereandnowai.com",
  email: "info@hereandnowai.com",
  mobile: "+91 996 296 1000",
  slogan: "designed with passion for innovation",
  logo: {
    title: "https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/HNAI%20Title%20-Teal%20%26%20Golden%20Logo%20-%20DESIGN%203%20-%20Raj-07.png",
  },
  socialMedia: {
    blog: "https://hereandnowai.com/blog",
    linkedin: "https://www.linkedin.com/company/hereandnowai/",
    instagram: "https://instagram.com/hereandnow_ai",
    github: "https://github.com/hereandnowai",
    x: "https://x.com/hereandnow_ai",
    youtube: "https://youtube.com/@hereandnow_ai"
  }
};

const App: React.FC = () => {
  const [parsedDataString, setParsedDataString] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hypotheticalInputs, setHypotheticalInputs] = useState<HypotheticalInputs>({});

  const handleFileUpload = useCallback(async (file: File) => {
    setError(null);
    setAnalysisResult(null);
    setParsedDataString(null);
    setFileName(file.name);
    setIsLoadingAnalysis(true);

    try {
      let fileContentString: string;
      if (file.name.endsWith('.csv')) {
        fileContentString = await readFileAsText(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        fileContentString = XLSX.utils.sheet_to_csv(worksheet);
      } else {
        throw new Error('Unsupported file type. Please upload CSV or Excel files.');
      }
      
      setParsedDataString(fileContentString);
      const result = await analyzeDataWithGemini(fileContentString);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Error processing file or analyzing data:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setAnalysisResult(null); 
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, []);

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handlePrediction = async () => {
    if (!parsedDataString) {
      setError('Please upload and analyze data first before making predictions.');
      return;
    }
    if (Object.keys(hypotheticalInputs).length === 0) {
      setError('Please provide input values for prediction.');
      return;
    }

    setError(null);
    setIsLoadingPrediction(true);
    try {
      const predictionResult = await predictYieldWithGemini(hypotheticalInputs, parsedDataString);
      setAnalysisResult(prevResult => ({
        ...(prevResult || { "Key Insights": [], "Top Yield Impact Factors": [], "Optimization Suggestions": [], "Visualizations": [] }),
        "Optional Predicted Yield (if inputs provided)": predictionResult["Optional Predicted Yield (if inputs provided)"] || "Not predicted",
        "Key Insights": predictionResult["Key Insights"]?.length ? predictionResult["Key Insights"] : prevResult?.["Key Insights"] || [],
        "Top Yield Impact Factors": predictionResult["Top Yield Impact Factors"]?.length ? predictionResult["Top Yield Impact Factors"] : prevResult?.["Top Yield Impact Factors"] || [],
        "Optimization Suggestions": predictionResult["Optimization Suggestions"]?.length ? predictionResult["Optimization Suggestions"] : prevResult?.["Optimization Suggestions"] || [],
        "Visualizations": prevResult?.["Visualizations"] || [], 
      }));
    } catch (err) {
      console.error("Error predicting yield:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during prediction.');
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setHypotheticalInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[var(--brand-secondary)] text-[var(--brand-text-on-secondary)] p-4 sm:p-8 selection:bg-[var(--brand-primary)] selection:text-[var(--brand-text-on-primary)]">
      <header className="text-center mb-10">
        <div className="flex justify-center mb-3">
            <img src={BRAND_INFO.logo.title} alt={`${BRAND_INFO.organizationShortName} Logo`} className="h-16 md:h-20" />
        </div>
        <p className="text-[var(--brand-text-on-secondary-muted)] mt-1 text-base italic">
          {BRAND_INFO.slogan}
        </p>
         <p className="text-[var(--brand-text-on-secondary-muted)] mt-3 text-lg">
          Upload your production data (CSV/Excel) to uncover insights, visualize trends, and predict yield.
        </p>
      </header>

      <div className="main-container space-y-8">
        <SectionCard title="1. Upload Production Data" icon={<ZapIcon className="w-6 h-6 text-[var(--brand-primary)]" />}>
          <FileUpload onFileUpload={handleFileUpload} disabled={isLoadingAnalysis} />
          {fileName && <p className="mt-3 text-sm text-[var(--brand-text-on-secondary-muted)]">Uploaded: <span className="font-semibold text-[var(--brand-text-on-secondary)]">{fileName}</span></p>}
        </SectionCard>

        {error && (
          <div className="bg-red-700/80 border border-red-500 text-red-100 px-4 py-3 rounded-lg relative flex items-start space-x-2" role="alert">
            <AlertTriangleIcon className="w-5 h-5 mt-0.5 text-red-300" />
            <div>
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-1">{error}</span>
            </div>
          </div>
        )}

        {isLoadingAnalysis && (
          <SectionCard title="Analyzing Data & Generating Visualizations..." icon={<LoadingSpinner className="text-[var(--brand-primary)]"/>}>
            <p className="text-[var(--brand-text-on-secondary-muted)] text-center">The AI is processing your file. This may take a moment...</p>
          </SectionCard>
        )}

        {analysisResult && !isLoadingAnalysis && (
          <SectionCard title="2. Analysis Results & Visualizations" icon={<HelpCircleIcon className="w-6 h-6 text-[var(--brand-primary)]" />}>
            <AnalysisDisplay result={analysisResult} />
          </SectionCard>
        )}
        
        {parsedDataString && !isLoadingAnalysis && (
           <SectionCard title="3. Predict Yield (Optional)" icon={<ZapIcon className="w-6 h-6 text-[var(--brand-primary)]" />}>
            <PredictionInput
              parameters={PREDICTION_PARAMETERS}
              inputs={hypotheticalInputs}
              onInputChange={handleInputChange}
              onSubmit={handlePrediction}
              isLoading={isLoadingPrediction}
            />
            {isLoadingPrediction && (
                <div className="flex justify-center mt-4">
                    <LoadingSpinner className="text-[var(--brand-primary)]" /> 
                    <p className="text-[var(--brand-text-on-secondary-muted)] ml-2">Calculating predicted yield...</p>
                </div>
            )}
            {analysisResult?.["Optional Predicted Yield (if inputs provided)"] && !isLoadingPrediction && (
              <div className="mt-6 p-4 bg-[var(--brand-secondary)]/60 rounded-lg border border-[var(--brand-primary)]/30">
                <h4 className="text-lg font-semibold text-[var(--brand-primary)] mb-2">Estimated Yield:</h4>
                <p className="text-2xl font-bold text-[var(--brand-text-on-secondary)]">{analysisResult["Optional Predicted Yield (if inputs provided)"]}</p>
              </div>
            )}
          </SectionCard>
        )}
      </div>
       <footer className="text-center mt-12 py-8 border-t border-[var(--brand-primary)]/20">
        <p className="text-sm text-[var(--brand-text-on-secondary-muted)] mb-1">
          {BRAND_INFO.organizationLongName}
        </p>
        <p className="text-xs text-[var(--brand-text-on-secondary-muted)] mb-4 italic">
          {BRAND_INFO.slogan}
        </p>
        <div className="flex justify-center space-x-5 mb-4">
            <a href={BRAND_INFO.website} target="_blank" rel="noopener noreferrer" title="Website" className="text-[var(--brand-text-on-secondary-muted)] hover:text-[var(--brand-primary)] transition-colors">
                <WebsiteIcon className="w-5 h-5" /> <span className="sr-only">Website</span>
            </a>
            <a href={`mailto:${BRAND_INFO.email}`} title="Email Us" className="text-[var(--brand-text-on-secondary-muted)] hover:text-[var(--brand-primary)] transition-colors">
                <EmailIcon className="w-5 h-5" /> <span className="sr-only">Email</span>
            </a>
            <a href={BRAND_INFO.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="text-[var(--brand-text-on-secondary-muted)] hover:text-[var(--brand-primary)] transition-colors">
                <LinkedInIcon className="w-5 h-5" /> <span className="sr-only">LinkedIn</span>
            </a>
            <a href={BRAND_INFO.socialMedia.github} target="_blank" rel="noopener noreferrer" title="GitHub" className="text-[var(--brand-text-on-secondary-muted)] hover:text-[var(--brand-primary)] transition-colors">
                <GitHubIcon className="w-5 h-5" /> <span className="sr-only">GitHub</span>
            </a>
            <a href={BRAND_INFO.socialMedia.x} target="_blank" rel="noopener noreferrer" title="X (Twitter)" className="text-[var(--brand-text-on-secondary-muted)] hover:text-[var(--brand-primary)] transition-colors">
                <XIcon className="w-5 h-5" /> <span className="sr-only">X</span>
            </a>
            <a href={BRAND_INFO.socialMedia.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" className="text-[var(--brand-text-on-secondary-muted)] hover:text-[var(--brand-primary)] transition-colors">
                <InstagramIcon className="w-5 h-5" /> <span className="sr-only">Instagram</span>
            </a>
             <a href={BRAND_INFO.socialMedia.youtube} target="_blank" rel="noopener noreferrer" title="YouTube" className="text-[var(--brand-text-on-secondary-muted)] hover:text-[var(--brand-primary)] transition-colors">
                <YouTubeIcon className="w-5 h-5" /> <span className="sr-only">YouTube</span>
            </a>
            <a href={BRAND_INFO.socialMedia.blog} target="_blank" rel="noopener noreferrer" title="Blog" className="text-[var(--brand-text-on-secondary-muted)] hover:text-[var(--brand-primary)] transition-colors">
                <BlogIcon className="w-5 h-5" /> <span className="sr-only">Blog</span>
            </a>
        </div>
        <p className="text-xs text-[var(--brand-text-on-secondary-muted)]/70">
          AI-Powered Manufacturing Insights. Version {process.env.APP_VERSION || "1.0.0"}
        </p>
        <p className="text-xs text-[var(--brand-text-on-secondary-muted)]/70 mt-1">
          Developed by R Kawshik[ AI Products Engineering Team ]
        </p>
      </footer>
    </div>
  );
};

export default App;
