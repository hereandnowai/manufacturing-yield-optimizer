import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, HypotheticalInputs } from '../types';
import { GEMINI_MODEL_NAME, SYSTEM_INSTRUCTION_ANALYSIS, SYSTEM_INSTRUCTION_PREDICTION } from '../constants';

// Ensure process.env.API_KEY is handled by the execution environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set. Please ensure it is available.");
  // UI should ideally show a persistent error if API_KEY is missing.
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // The '!' asserts API_KEY is non-null

const parseGeminiResponse = (responseText: string): AnalysisResult => {
  if (!responseText || responseText.trim() === "") {
    console.error("Gemini API returned an empty response string.");
    throw new Error("Received an empty response from the AI.");
  }

  const originalTrimmedText = responseText.trim();
  console.log("Attempting to parse AI Response. Raw trimmed response:", originalTrimmedText);

  // Attempt 1: Try parsing directly.
  try {
    const parsed = JSON.parse(originalTrimmedText);
    if (parsed && typeof parsed["Key Insights"] !== 'undefined') { // Basic structure validation
      console.log("Attempt 1: Direct JSON parsing successful.");
      return parsed as AnalysisResult;
    }
    console.warn("Attempt 1: Direct JSON parsing yielded an object, but not the expected structure. Proceeding to other methods.");
  } catch (e1: any) {
    console.warn("Attempt 1: Direct JSON parsing failed. Error:", e1.message);
  }

  // Attempt 2: Extract from a markdown code fence.
  console.log("Attempt 2: Trying to extract JSON from markdown code fence.");
  const fenceRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/;
  const match = originalTrimmedText.match(fenceRegex);

  if (match && match[1]) {
    const fencedContent = match[1].trim();
    console.log("Attempt 2: Found content in markdown fence:", fencedContent);
    try {
      const parsed = JSON.parse(fencedContent);
      if (parsed && typeof parsed["Key Insights"] !== 'undefined') { // Basic structure validation
        console.log("Attempt 2: Successfully parsed JSON from markdown fence.");
        return parsed as AnalysisResult;
      }
      console.warn("Attempt 2: Parsed markdown fence content, but not the expected structure. Falling through.");
    } catch (e2: any) {
      console.warn("Attempt 2: Failed to parse JSON from markdown fence. Error:", e2.message, "Falling through.");
    }
  } else {
    console.log("Attempt 2: No markdown code fence found or content within was empty.");
  }

  // Attempt 3: Try to find the largest JSON-like object substring (starts with { and ends with })
  console.log("Attempt 3: Trying to extract JSON by finding first '{' and last '}'.");
  const firstBrace = originalTrimmedText.indexOf('{');
  const lastBrace = originalTrimmedText.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const objectCandidate = originalTrimmedText.substring(firstBrace, lastBrace + 1);
    console.log("Attempt 3: Found potential JSON object substring:", objectCandidate);
    try {
      const parsed = JSON.parse(objectCandidate);
      if (parsed && typeof parsed["Key Insights"] !== 'undefined') { // Basic structure validation
         console.log("Attempt 3: Successfully parsed JSON substring.");
         return parsed as AnalysisResult;
      }
      console.warn("Attempt 3: Parsed JSON substring, but not the expected structure.");
    } catch (e3: any) {
      console.warn("Attempt 3: Failed to parse JSON substring. Error:", e3.message);
    }
  } else {
    console.log("Attempt 3: No plausible JSON object substring found (missing '{' or '}' or incorrect order).");
  }

  // All attempts failed
  console.error("All JSON parsing attempts failed for the AI response.");
  console.error("Original response text from AI that failed all parsing attempts (raw, untrimmed):", responseText);
  throw new Error(
    "InvalidJSONResponse: AI output was not parsable after multiple attempts (direct, markdown, substring). " +
    "Check console for raw AI response and error details."
  );
};

export const analyzeDataWithGemini = async (fileContentString: string): Promise<AnalysisResult> => {
  if (!API_KEY) throw new Error("API Key is not configured. Cannot analyze data.");
  
  const model = GEMINI_MODEL_NAME;
  const prompt = `Here is the production data in CSV format:\n\n${fileContentString}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ANALYSIS,
        responseMimeType: "application/json",
      }
    });
    return parseGeminiResponse(response.text);
  } catch (error) {
    console.error('Error during Gemini API call or parsing for analysis:', error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('The configured API key is not valid. Please check your API key.');
        }
        // If it's one of our specific parsing errors, re-throw it as is.
        if (error.message.startsWith("InvalidJSONResponse") || error.message.startsWith("Received an empty response")) {
            throw error;
        }
    }
    // General fallback for other errors
    throw new Error(`Failed to analyze data with AI: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const predictYieldWithGemini = async (inputs: HypotheticalInputs, originalDataCsv: string): Promise<AnalysisResult> => {
  if (!API_KEY) throw new Error("API Key is not configured. Cannot predict yield.");

  const model = GEMINI_MODEL_NAME;
  
  let inputsString = "Hypothetical Inputs:\n";
  for (const key in inputs) {
    inputsString += `- ${key}: ${inputs[key]}\n`;
  }

  const prompt = `${inputsString}\n\nOriginal Dataset Context (CSV format):\n${originalDataCsv}`;
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_PREDICTION,
        responseMimeType: "application/json",
      }
    });
    return parseGeminiResponse(response.text);
  } catch (error) {
    console.error('Error during Gemini API call or parsing for prediction:', error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('The configured API key is not valid. Please check your API key.');
        }
        // If it's one of our specific parsing errors, re-throw it as is.
        if (error.message.startsWith("InvalidJSONResponse") || error.message.startsWith("Received an empty response")) {
            throw error;
        }
    }
    // General fallback for other errors
    throw new Error(`Failed to predict yield with AI: ${error instanceof Error ? error.message : String(error)}`);
  }
};