import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult } from '../types/analysis';

// Variable de configuración: habilitar/deshabilitar análisis con modelo externo
export const ENABLE_MODEL_ANALYSIS = import.meta.env.VITE_ENABLE_MODEL_ANALYSIS === 'true';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

/**
 * analyzeAcneSeverity
 *
 * Flujo mínimo: solo verifica si el rostro en la imagen está "limpio" (sin acné visible).
 * - Si el modelo indica que el rostro está limpio -> retorna { severity: 'Limpio', explanation: ... }.
 * - Esta función se llama DESPUÉS de que la validación del backend sea exitosa.
 */
export const analyzeAcneSeverity = async (imageFile: File): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_MODEL_API_KEY as string });
  
  const imagePart = await fileToGenerativePart(imageFile);

  try {
    // ¿El rostro está libre de acné visible?
    const clearCheckResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [
        { text: "Is the person's face in this image free of visible acne? Answer with only 'Yes' or 'No'." },
        imagePart
      ] },
    });

    const clearResult = (clearCheckResponse.text || '').trim().toLowerCase();

    if (clearResult.includes('yes')) {
      // Si está limpio, retornar 'Limpio' (que será convertido a 'Ausente' en el frontend)
      return {
        severity: 'Limpio',
        explanation: 'No se detectó acné visible en la imagen proporcionada.',
      };
    }

    // Si no está limpio, retornar un marcador indicando presencia de acné
    return {
      severity: 'Presencia',
      explanation: 'Visible signs of acne detected. Backend prediction will be used.',
    };

    /*
    // --- OPCIONAL: Análisis completo
    // Validación de presencia de rostro:
    const faceDetectionResponse = await model.generateContent({
        contents: [{
            parts: [
                { text: "Is there a clear, visible human face in this image? Respond with only 'Yes' or 'No'." },
                imagePart
            ]
        }],
        generationConfig,
        safetySettings,
    });
    // ... manejar faceDetectionResponse ...

    // Verificación humano/animado:
    const humanValidationResponse = await model.generateContent({
        contents: [{
            parts: [
                { text: "Is the face in this image from a real human, or is it an animated/cartoon/artificial character? Respond with only 'Real' or 'Artificial'." },
                imagePart
            ]
        }],
        generationConfig,
        safetySettings,
    });

    // Análisis completo de severidad de acné retornando esquema JSON:
    const acneAnalysisResponse = await model.generateContent({
        contents: [{
            parts: [
                { text: "Analyze the attached image of a human face. Classify the acne severity into one of the following categories: 'Clear', 'Mild', 'Moderate', or 'Severe'.\n- 'Clear': Clear skin with no visible acne.\n- 'Mild': Some scattered blackheads, whiteheads, and minor pimples.\n- 'Moderate': More widespread blackheads, whiteheads, and pimples, and some inflamed papules and pustules.\n- 'Severe': Numerous papules, pustules, nodules, or large, painful cysts. Potential for scarring.\n\nProvide a brief one-paragraph explanation for your classification, describing the visible signs that led to your conclusion.\n\nStructure your response as a JSON object with two keys: \"severity\" and \"explanation\"." },
                imagePart
            ]
        }],
        generationConfig,
        safetySettings,
    });
    */

  } catch (e) {
    console.error("Error calling generative API:", e);
    throw new Error("Failed to analyze image. Please try again.");
  }
};
