import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult } from '../types/analysis';

// Variable de configuración: habilitar/deshabilitar análisis con modelo externo
export const ENABLE_MODEL_ANALYSIS = import.meta.env.VITE_ENABLE_MODEL_ANALYSIS === 'true';

// Variable de configuración: ejecutar modelo externo ANTES del backend (true) o DESPUÉS (false)
export const MODEL_FIRST = import.meta.env.VITE_MODEL_FIRST === 'true';

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
 * Valida la imagen antes o después del backend según configuración.
 * Proporciona mensajes personalizados según el tipo de contenido detectado.
 */
export const analyzeAcneSeverity = async (imageFile: File): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_MODEL_API_KEY as string });
  
  const imagePart = await fileToGenerativePart(imageFile);

  try {
    // PASO 1: Validación detallada del contenido de la imagen
    const validationResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: { parts: [
        { text: `Analyze this image carefully and classify it into ONE of these categories:

1. FULL_FACE: A complete, real human face (frontal or slightly angled view)
2. PARTIAL_FACE: Only part of a human face (missing eyes, nose, or other key features)
3. ANIMAL: An animal face or body
4. CARTOON: Animated, drawn, or cartoon character
5. DRAWING: Hand-drawn or digital illustration of a person
6. BODY_PART: Other human body part (hand, arm, leg, etc.)
7. OTHER: Anything else (objects, landscapes, etc.)

Respond with ONLY the category name (e.g., "FULL_FACE" or "ANIMAL").

IMPORTANT: If you see a human face but it's not complete (e.g., only showing forehead, or only chin, or missing major features), respond with "PARTIAL_FACE".` },
        imagePart
      ] },
    });

    const category = (validationResponse.text || '').trim().toUpperCase();
    console.log('Categoría detectada:', category);

    // Validar según la categoría detectada
    switch (category) {
      case 'ANIMAL':
        throw new Error('Se detectó un animal en la imagen. Por favor, sube una fotografía de un rostro humano completo.');
      
      case 'CARTOON':
        throw new Error('Se detectó un personaje animado o de caricatura. Por favor, sube una fotografía real de un rostro humano.');
      
      case 'DRAWING':
        throw new Error('Se detectó un dibujo o ilustración. Por favor, sube una fotografía real de un rostro humano, no una ilustración.');
      
      case 'BODY_PART':
        throw new Error('Se detectó una parte del cuerpo que no es el rostro. Por favor, sube una fotografía que muestre el rostro completo.');
      
      case 'PARTIAL_FACE':
        throw new Error('Se detectó solo una parte del rostro. Por favor, sube una fotografía que muestre el rostro completo (frente, mejillas, mentón) para un análisis preciso.');
      
      case 'OTHER':
        throw new Error('No se detectó un rostro humano en la imagen. Por favor, sube una fotografía clara de un rostro humano.');
      
      case 'FULL_FACE':
        // Continuar con el análisis de acné
        break;
      
      default:
        // Si el modelo devuelve algo inesperado, tratarlo como inválido
        throw new Error('No se pudo identificar correctamente el contenido de la imagen. Por favor, asegúrate de subir una fotografía clara de un rostro humano completo.');
    }

    // PASO 2: Si es un rostro completo, verificar si está limpio de acné
    const acneResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: { parts: [
        { text: "Looking at this human face, is the skin clear and free of visible acne (pimples, blackheads, whiteheads, cysts, etc.)?\n\nRespond with only:\n- YES if the skin appears clear with no visible acne\n- NO if you see any signs of acne" },
        imagePart
      ] },
    });

    const isClean = (acneResponse.text || '').trim().toUpperCase();
    console.log('¿Piel limpia?:', isClean);

    if (isClean === 'YES') {
      // Rostro limpio sin acné
      return {
        severity: 'Limpio',
        explanation: 'No se detectó acné visible en la imagen proporcionada. La piel aparece clara y sin lesiones de acné.',
      };
    }

    // Rostro con presencia de acné - continuar con predicción del backend
    console.log('Rostro detectado: con acné presente');
    return {
      severity: 'Presencia',
      explanation: 'Se detectaron signos visibles de acné. Se utilizará la predicción del modelo de clasificación.',
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
      // Si el error ya tiene un mensaje específico de validación, mantenerlo
      if (e.message.includes('detectó') || 
          e.message.includes('rostro') || 
          e.message.includes('animal') ||
          e.message.includes('animado') ||
          e.message.includes('dibujo') ||
          e.message.includes('parte del rostro') ||
          e.message.includes('parte del cuerpo')) {
        throw e; // Error de validación - debe detener el flujo
      }
      
      // Errores de API (créditos, configuración, etc.) - no deben detener el flujo
      if (e.message.includes('API key') || 
          e.message.includes('quota') || 
          e.message.includes('limit') ||
          e.message.includes('authentication') ||
          e.message.includes('permission') ||
          e.message.includes('RESOURCE_EXHAUSTED')) {
        throw new Error(`API_ERROR: ${e.message}`);
      }
      
      // Para otros errores técnicos, marcarlos como errores de servicio
      throw new Error(`SERVICE_ERROR: ${e.message}`);
    }
    
    // Error genérico - tratarlo como error de servicio
    throw new Error("SERVICE_ERROR: No se pudo conectar con el servicio de análisis.");
  }
};
