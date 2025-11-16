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
    // Verificar si es un rostro humano real y si está libre de acné visible
    const analysisResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: { parts: [
        { text: "Analyze this image and answer two questions:\n1. Is this a real human face (not animated, cartoon, drawing, or artificial)?\n2. If it's a real human face, is it free of visible acne?\n\nRespond in this exact format:\nFace: [Yes/No]\nClear: [Yes/No]\n\nExample responses:\n- If it's a real human face with no acne: 'Face: Yes\\nClear: Yes'\n- If it's a real human face with acne: 'Face: Yes\\nClear: No'\n- If it's not a real human face: 'Face: No\\nClear: N/A'" },
        imagePart
      ] },
    });

    const result = (analysisResponse.text || '').trim().toLowerCase();
    console.log('Respuesta del modelo:', result);

    // Verificar si es un rostro real
    if (!result.includes('face: yes')) {
      // No es un rostro real, lanzar error
      throw new Error('No se detectó un rostro humano real en la imagen. Por favor, sube una foto clara de un rostro humano.');
    }

    // Si es un rostro real, verificar si está limpio
    if (result.includes('clear: yes')) {
      // Si está limpio, retornar 'Limpio' (que será convertido a 'Ausente' en el frontend)
      return {
        severity: 'Limpio',
        explanation: 'No se detectó acné visible en la imagen proporcionada.',
      };
    }

    // Si no está limpio, retornar un marcador indicando presencia de acné
    console.log('Rostro detectado: con acné presente');
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
    
    // Proporcionar mensajes de error más específicos
    if (e instanceof Error) {
      // Si el error ya tiene un mensaje específico (como el de validación de rostro), mantenerlo
      if (e.message.includes('rostro humano real')) {
        throw e;
      }
      // Para otros errores, proporcionar contexto adicional
      throw new Error(`Error al analizar la imagen: ${e.message}`);
    }
    
    throw new Error("No se pudo analizar la imagen. Por favor, intenta nuevamente con una foto clara de un rostro.");
  }
};
