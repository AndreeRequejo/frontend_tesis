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
 * Optimizado: Todo en UN SOLO PROMPT.
 */
export const analyzeAcneSeverity = async (imageFile: File): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_MODEL_API_KEY as string });
  
  const imagePart = await fileToGenerativePart(imageFile);

  try {
    // UN SOLO PROMPT: Validación completa + análisis de acné
    const analysisResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: { parts: [
        { text: `Analyze this image and provide a complete assessment in JSON format.

          **Step 1: Image Classification**
          First, classify the image into ONE of these categories:
          1. REAL_FULL_FACE: Complete REAL human face (frontal or slightly angled view)
            - Must be a photograph of a real living human being
            - NOT AI-generated, NOT 3D renders, NOT masks, NOT mannequins, NOT robots
          2. PARTIAL_FACE: Incomplete human face (missing eyes, nose, or key features)
          3. ANIMAL: Animal face or body
          4. CARTOON: Animated, drawn, or cartoon character
          5. DRAWING: Hand-drawn or digital illustration
          6. ARTIFICIAL_FACE: Artificial/fake faces including:
            - AI-generated faces or deepfakes
            - Robot faces or masks that look human
            - 3D rendered faces
            - Mannequin or doll faces
            - Synthetic or computer-generated images
          7. BODY_PART: Other human body part (hand, arm, leg, etc.)
          8. OTHER: Objects, landscapes, or anything else

          **IMPORTANT**: Only classify as REAL_FULL_FACE if you are confident it's a photograph of a real, living human being. Any doubt about authenticity should result in ARTIFICIAL_FACE classification.

          **Step 2: Acne Assessment (only if REAL_FULL_FACE)**
          If the image is REAL_FULL_FACE, determine if the skin is:
          - CLEAN: No visible acne (clear skin)
          - ACNE: Visible signs of acne present

          **Response Format:**
          Return ONLY a JSON object with this exact structure:
          {
            "category": "REAL_FULL_FACE" | "PARTIAL_FACE" | "ANIMAL" | "CARTOON" | "DRAWING" | "ARTIFICIAL_FACE" | "BODY_PART" | "OTHER",
            "acneStatus": "CLEAN" | "ACNE" | "N/A"
          }

          **Examples:**
          - Real human face with clear skin: {"category": "REAL_FULL_FACE", "acneStatus": "CLEAN"}
          - Real human face with acne: {"category": "REAL_FULL_FACE", "acneStatus": "ACNE"}
          - AI-generated face: {"category": "ARTIFICIAL_FACE", "acneStatus": "N/A"}
          - Robot with human-like mask: {"category": "ARTIFICIAL_FACE", "acneStatus": "N/A"}
          - 3D rendered face: {"category": "ARTIFICIAL_FACE", "acneStatus": "N/A"}
          - Only forehead visible: {"category": "PARTIAL_FACE", "acneStatus": "N/A"}
          - Dog photo: {"category": "ANIMAL", "acneStatus": "N/A"}
          - Cartoon character: {"category": "CARTOON", "acneStatus": "N/A"}

          Respond with ONLY the JSON, no additional text.` },
        imagePart
      ] },
    });

    // Parsear la respuesta JSON
    const responseText = (analysisResponse.text || '').trim();
    console.log('Respuesta del modelo:', responseText);

    let result;
    try {
      // Extraer JSON si viene con markdown code blocks
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText;
      result = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Error parseando JSON:', parseError);
      throw new Error('No se pudo identificar correctamente el contenido de la imagen. Por favor, asegúrate de subir una fotografía clara de un rostro humano completo.');
    }

    const category = result.category?.toUpperCase();
    const acneStatus = result.acneStatus?.toUpperCase();

    console.log('Categoría:', category, '| Acné:', acneStatus);

    // Validar según la categoría detectada
    switch (category) {
      case 'ANIMAL':
        throw new Error('Se detectó un animal en la imagen. Por favor, sube una fotografía de un rostro humano real.');
      
      case 'CARTOON':
        throw new Error('Se detectó un personaje animado o de caricatura. Por favor, sube una fotografía real de un rostro humano.');
      
      case 'DRAWING':
        throw new Error('Se detectó un dibujo o ilustración. Por favor, sube una fotografía real de un rostro humano, no una ilustración.');
      
      case 'ARTIFICIAL_FACE':
        throw new Error('Se detectó un rostro artificial. Por favor, sube una fotografía real de un rostro humano.');
      
      case 'BODY_PART':
        throw new Error('Se detectó una parte del cuerpo que no es el rostro. Por favor, sube una fotografía que muestre el rostro completo.');
      
      case 'PARTIAL_FACE':
        throw new Error('Se detectó solo una parte del rostro. Por favor, sube una fotografía que muestre el rostro completo (frente, mejillas, mentón) para un análisis preciso.');
      
      case 'OTHER':
        throw new Error('No se detectó un rostro humano en la imagen. Por favor, sube una fotografía clara de un rostro humano real.');
      
      case 'REAL_FULL_FACE':
        // Rostro completo válido - verificar estado de acné
        if (acneStatus === 'CLEAN') {
          return {
            severity: 'Limpio',
            explanation: 'No se detectó acné visible en la imagen proporcionada. La piel aparece clara y sin lesiones de acné.',
          };
        } else if (acneStatus === 'ACNE') {
          return {
            severity: 'Presencia',
            explanation: 'Se detectaron signos visibles de acné. Se utilizará la predicción del modelo de clasificación.',
          };
        } else {
          // Si acneStatus es N/A o inválido para REAL_FULL_FACE, asumir que hay acné
          return {
            severity: 'Presencia',
            explanation: 'Se utilizará la predicción del modelo de clasificación.',
          };
        }
      
      default:
        throw new Error('No se pudo identificar correctamente el contenido de la imagen. Por favor, asegúrate de subir una fotografía clara de un rostro humano real.');
    }

    /*

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
          e.message.includes('artificial') ||
          e.message.includes('generado') ||
          e.message.includes('render') ||
          e.message.includes('robot') ||
          e.message.includes('máscara') ||
          e.message.includes('maniquí') ||
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
