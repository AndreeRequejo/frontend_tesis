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
export const analyzeAcneSeverity = async (imageFiles: File[]): Promise<AnalysisResult> => {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_MODEL_API_KEY as string });

    // Convertir TODAS las imágenes a formato generativo
    const imagePartsPromises = imageFiles.map((file) => fileToGenerativePart(file));
    const imageParts = await Promise.all(imagePartsPromises);

    try {
        // UN SOLO PROMPT: Validación completa + análisis de acné para MÚLTIPLES imágenes
        const analysisResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `Analyze these ${imageFiles.length} image(s) and provide a COMPLETE CONSOLIDATED assessment in JSON format.
            
            **Step 1: Universal Image Validation**
            Check EACH image. ALL images must be REAL_FULL_FACE or PARTIAL_FACE (as long as they show skin).
            If ANY image contains:
            - Animals
            - Cartoons/Drawings
            - Artificial faces (AI, robots, masks)
            - Objects/Landscapes
            ...then the ENTIRE result category must be the specific invalid category (e.g., ANIMAL).

            **Step 2: Consolidated Acne Assessment**
            - If valid faces are present, analyze the visible skin across ALL images.
            - Determine the WORST case of acne visible.
            - CLEAN: No visible acne on any image.
            - ACNE: Visible signs of acne on AT LEAST ONE image.

            **Response Format:**
            Return ONLY a JSON object with this exact structure:
            {
              "category": "REAL_FULL_FACE" | "PARTIAL_FACE" | "ANIMAL" | "CARTOON" | "DRAWING" | "ARTIFICIAL_FACE" | "BODY_PART" | "OTHER",
                            "acneStatus": "CLEAN" | "ACNE" | "N/A",
                            "description": "string"
            }

                        **Rules for "description":**
                        - Mandatory for valid human face categories.
                        - Write in Spanish.
                        - Brief: 1 sentence (max 20 words).
                        - Purely descriptive of visible skin findings.
                        - Mention only visible acne lesions if present (e.g., comedones, pápulas, pústulas, enrojecimiento local).
                        - If no lesions are visible, explicitly state that no visible acne lesions are observed.
                        - Do NOT mention severity level.
                        - Do NOT mention treatments or recommendations.
                        - Do NOT mention confidence, diagnosis certainty, or next steps.

            **Logic for "category":**
            - If ANY image is ANIMAL -> "ANIMAL"
            - If ANY image is CARTOON/DRAWING -> "CARTOON"
            - If ANY image is ARTIFICIAL -> "ARTIFICIAL_FACE"
            - If images are valid human faces -> "REAL_FULL_FACE"

            **Logic for "acneStatus":**
            - Only if category is REAL_FULL_FACE (or acceptable PARTIAL_FACE context).
            - "ACNE" if acne is visible in ANY image.
            - "CLEAN" if ALL images show clear skin.

            Respond with ONLY the JSON.`,
                        },
                        ...imageParts, // Spread operator para añadir todas las imágenes
                    ],
                },
            ],
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
            throw new Error('No se pudo identificar correctamente el contenido de las imágenes.');
        }

        const category = result.category?.toUpperCase();
        const acneStatus = result.acneStatus?.toUpperCase();
        const description = typeof result.description === 'string' ? result.description.trim() : '';

        console.log('Categoría:', category, '| Acné:', acneStatus);

        // Validar según la categoría detectada
        switch (category) {
            case 'ANIMAL':
                throw new Error(
                    'Se detectó un animal en una de las imágenes. Por favor, asegúrate de que todas sean fotos de rostros humanos reales.',
                );

            case 'CARTOON':
            case 'DRAWING':
                throw new Error('Se detectó un personaje animado, dibujo o ilustración. Por favor, sube solo fotografías reales.');

            case 'ARTIFICIAL_FACE':
                throw new Error('Se detectó un rostro artificial (o generado por IA). Por favor, sube fotografías reales.');

            case 'BODY_PART':
                throw new Error('Se detectó una parte del cuerpo que no permite un análisis facial claro.');

            case 'OTHER':
                throw new Error('No se detectó un rostro humano válido en alguna de las imágenes.');

            case 'REAL_FULL_FACE':
            case 'PARTIAL_FACE': // Permitir partial face si el modelo lo valida como piel analizable
                // Verificación de acné
                if (acneStatus === 'CLEAN') {
                    return {
                        severity: 'Limpio',
                        explanation: description || 'No se observan lesiones acneicas visibles en las imágenes proporcionadas.',
                        description: description || 'No se observan lesiones acneicas visibles en las imágenes proporcionadas.',
                    };
                } else if (acneStatus === 'ACNE') {
                    return {
                        severity: 'Presencia',
                        explanation: description || 'Se observan lesiones acneicas visibles en al menos una de las imágenes.',
                        description: description || 'Se observan lesiones acneicas visibles en al menos una de las imágenes.',
                    };
                } else {
                    // Fallback
                    return {
                        severity: 'Presencia',
                        explanation: description || 'No fue posible describir hallazgos cutáneos con claridad en las imágenes.',
                        description: description || 'No fue posible describir hallazgos cutáneos con claridad en las imágenes.',
                    };
                }

            default:
                throw new Error('No se pudo identificar correctamente el contenido. Intenta con fotos más claras.');
        }
    } catch (e) {
        console.error('Error calling generative API:', e);

        if (e instanceof Error) {
            // Mantener mensajes de validación específicos
            if (
                e.message.includes('detectó') ||
                e.message.includes('rostro') ||
                e.message.includes('animal') ||
                e.message.includes('animado') ||
                e.message.includes('dibujo') ||
                e.message.includes('artific') ||
                e.message.includes('generado') ||
                e.message.includes('parte del cuerpo')
            ) {
                throw e;
            }

            if (e.message.includes('API key') || e.message.includes('quota') || e.message.includes('limit') || e.message.includes('429')) {
                throw new Error(`API_ERROR: ${e.message}`);
            }

            throw new Error(`SERVICE_ERROR: ${e.message}`);
        }

        throw new Error('SERVICE_ERROR: No se pudo conectar con el servicio de análisis.');
    }
};
