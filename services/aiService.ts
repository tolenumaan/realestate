
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PopulatedUnitDetail, ProjectType } from '../types';

// Ensure API_KEY is available in the environment.
// The build process or environment setup is responsible for making process.env.API_KEY available.
// For example, in a Vite project, you'd use import.meta.env.VITE_API_KEY.
// Here, we assume process.env.API_KEY is directly available, as per typical Node.js or bundler setups.
// If process.env is not defined (e.g., in a strict browser-only ES module context without a bundler),
// this will fail. For this exercise, we assume it's handled by the execution environment.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY for Gemini is not set in environment variables.");
  // Potentially throw an error or have a fallback, depending on desired behavior.
  // For now, we'll let it proceed, and API calls will fail if key is missing.
}

const ai = new GoogleGenAI({ apiKey: apiKey! });
const modelName = 'gemini-2.5-flash-preview-04-17';

export async function generatePropertyDescription(unit: PopulatedUnitDetail): Promise<string> {
  if (!apiKey) {
    return Promise.reject("API_KEY for Gemini is not configured.");
  }
  
  const unitFeaturesString = unit.unitFeatures?.join(', ') || 'standard amenities';
  const customizationNotesString = unit.customizationNotes || 'none';
  const orientationString = unit.orientation || 'not specified';
  const finishesPackageString = unit.selectedFinishesPackage || 'standard';

  const prompt = `
    You are a creative real estate marketing assistant. 
    Generate a compelling and attractive property description for a real estate listing. 
    The property is part of the '${unit.projectName}' development.

    Unit Details:
    - Type: ${unit.bedrooms ? `${unit.bedrooms} bedroom unit` : 'Studio unit'}
    - Size: ${unit.size} ${unit.sizeUnit}
    - View: ${unit.view || 'not specified'}
    - Key Features: ${unitFeaturesString}
    - Orientation: ${orientationString}
    - Finishes Package: ${finishesPackageString}
    ${unit.customizationNotes ? `- Customization Notes: ${customizationNotesString}` : ''}
    ${unit.areaBreakdown && unit.areaBreakdown.length > 0 ? `- Layout includes: ${unit.areaBreakdown.map(ab => ab.roomName).join(', ')}` : ''}

    Highlight its unique selling points and appeal to potential buyers (e.g., families, investors, young professionals, luxury seekers). 
    Keep the description concise, engaging, and around 100-150 words.
    Focus on creating an inviting and desirable image of the property.
    Do not use markdown formatting in your response.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating property description:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
             return Promise.reject("The provided API key is not valid. Please check your configuration.");
        }
         return Promise.reject(`Failed to generate description: ${error.message}`);
    }
    return Promise.reject("An unknown error occurred while generating the description.");
  }
}

export async function analyzeContract(fileContentBase64: string, mimeType: string, userQuery: string): Promise<string> {
  if (!apiKey) {
    return Promise.reject("API_KEY for Gemini is not configured.");
  }

  const documentPart = {
    inlineData: {
      mimeType: mimeType, 
      data: fileContentBase64,
    },
  };

  const textPart = {
    text: `Analyze the following document based on this query: "${userQuery}". Provide a concise summary or answer based directly on the document's content. Focus on extracting relevant information accurately. Do not use markdown formatting in your response.`,
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName, // Ensure this model supports multimodal input if dealing with complex PDFs. For text from PDF, it's fine.
      contents: { parts: [documentPart, textPart] },
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing contract:", error);
     if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
             return Promise.reject("The provided API key is not valid. Please check your configuration.");
        }
         return Promise.reject(`Failed to analyze contract: ${error.message}`);
    }
    return Promise.reject("An unknown error occurred while analyzing the contract.");
  }
}
