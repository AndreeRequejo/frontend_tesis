import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Paciente } from '@/pages/patients/types';
import { router, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImageCaptureSection } from './image-capture-section';
import { ImageRecommendations } from './image-recommendations';
import { analyzeAcneSeverity, ENABLE_MODEL_ANALYSIS, MODEL_FIRST } from '@/services/model';

interface PatientEvaluationSectionProps {
    selectedPatient: Paciente;
    onBackToSelection: () => void;
}

export function PatientEvaluationSection({ selectedPatient, onBackToSelection }: PatientEvaluationSectionProps) {
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { errors } = usePage().props as { errors?: Record<string, string> };

    const getPatientFullName = (patient: Paciente) => {
        return `${patient.apellidos} ${patient.nombres}`;
    };

    // useEffect para detectar errores de Inertia del backend
    useEffect(() => {
        if (errors?.detail) {
            setErrorMessage(errors.detail);
            setIsEvaluating(false);
        }
    }, [errors]);

    // useEffect para cerrar automáticamente la alerta después de 4 segundos
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 6000); // 6 segundos

            // Limpiar el timeout si el componente se desmonta o si el errorMessage cambia
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    const handleEvaluatePatient = async () => {
        if (!selectedPatient || capturedImages.length === 0) {
            setErrorMessage('Debe seleccionar un paciente y agregar al menos una imagen');
            return;
        }

        // Limpiar errores previos
        setErrorMessage(null);
        setIsEvaluating(true);

        // FLUJO 1: Modelo externo PRIMERO (si MODEL_FIRST = true)
        if (ENABLE_MODEL_ANALYSIS && MODEL_FIRST) {
            try {
                // Convertir base64 a objeto File para verificación con modelo externo
                const firstImageBase64 = capturedImages[0];
                const blobResponse = await fetch(firstImageBase64);
                const blob = await blobResponse.blob();
                const imageFile = new File([blob], "evaluation_image.jpg", { type: blob.type });

                // PRIMERO: Llamar al modelo externo para validación exhaustiva
                const analysisResult = await analyzeAcneSeverity(imageFile);

                // Almacenar resultado en sessionStorage
                sessionStorage.setItem('model_analysis', JSON.stringify(analysisResult));

                // LUEGO: Llamar al backend para predicción
                callBackendPrediction();

            } catch (modelError) {
                const errorMsg = modelError instanceof Error ? modelError.message : '';
                
                console.warn('Error en modelo externo:', errorMsg);
                
                // Errores de VALIDACIÓN - DETENER el flujo
                if (errorMsg.includes('detectó') || 
                    errorMsg.includes('animal') ||
                    errorMsg.includes('animado') ||
                    errorMsg.includes('dibujo') ||
                    errorMsg.includes('artificial') ||
                    errorMsg.includes('generado') ||
                    errorMsg.includes('render') ||
                    errorMsg.includes('robot') ||
                    errorMsg.includes('máscara') ||
                    errorMsg.includes('maniquí') ||
                    errorMsg.includes('parte del rostro') ||
                    errorMsg.includes('parte del cuerpo')) {
                    setErrorMessage(errorMsg);
                    setIsEvaluating(false);
                    sessionStorage.removeItem('model_analysis');
                    return;
                }
                
                // Errores de SERVICIO/API - CONTINUAR con backend
                if (errorMsg.includes('API_ERROR') || errorMsg.includes('SERVICE_ERROR')) {
                    console.log('⚠️ Modelo externo no disponible. Continuando con predicción del backend...');
                    sessionStorage.removeItem('model_analysis');
                    callBackendPrediction();
                } else {
                    console.log('⚠️ Error desconocido en modelo externo. Continuando con backend...');
                    sessionStorage.removeItem('model_analysis');
                    callBackendPrediction();
                }
            }
            return;
        }

        // FLUJO 2: Backend PRIMERO (si MODEL_FIRST = false o modelo deshabilitado)
        callBackendPrediction();
    };

    // Función auxiliar para llamar al backend
    const callBackendPrediction = () => {
        router.post(
            '/evaluacion/predecir',
            {
                paciente_id: selectedPatient.id,
                imagenes: capturedImages,
            },
            {
                preserveState: true,
                preserveScroll: true,
                only: [],
                onSuccess: async () => {
                    // Si el backend responde exitosamente Y el modelo NO se ejecutó primero
                    if (ENABLE_MODEL_ANALYSIS && !MODEL_FIRST) {
                        try {
                            const firstImageBase64 = capturedImages[0];
                            const blobResponse = await fetch(firstImageBase64);
                            const blob = await blobResponse.blob();
                            const imageFile = new File([blob], "evaluation_image.jpg", { type: blob.type });

                            const analysisResult = await analyzeAcneSeverity(imageFile);
                            sessionStorage.setItem('model_analysis', JSON.stringify(analysisResult));
                        } catch (modelError) {
                            const errorMsg = modelError instanceof Error ? modelError.message : '';
                            
                            console.warn('Error en modelo externo:', errorMsg);
                            
                            // Errores de VALIDACIÓN - DETENER
                            if (errorMsg.includes('detectó') || 
                                errorMsg.includes('animal') ||
                                errorMsg.includes('animado') ||
                                errorMsg.includes('dibujo') ||
                                errorMsg.includes('artificial') ||
                                errorMsg.includes('generado') ||
                                errorMsg.includes('render') ||
                                errorMsg.includes('robot') ||
                                errorMsg.includes('máscara') ||
                                errorMsg.includes('maniquí') ||
                                errorMsg.includes('parte del rostro') ||
                                errorMsg.includes('parte del cuerpo')) {
                                setErrorMessage(errorMsg);
                                setIsEvaluating(false);
                                sessionStorage.removeItem('model_analysis');
                                return;
                            }
                            
                            // Errores de SERVICIO/API - CONTINUAR
                            console.log('⚠️ Modelo externo no disponible. Continuando con predicción del backend...');
                            sessionStorage.removeItem('model_analysis');
                        }
                    }

                    // Navegar a resultados
                    router.visit('/evaluacion/resultado');
                    setIsEvaluating(false);
                },
                onError: () => {
                    setIsEvaluating(false);
                },
            }
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onBackToSelection}
                    className="flex-shrink-0 border-blue-200 transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                    <ArrowLeft className="h-4 w-4 text-blue-600" />
                </Button>
                <h1 className="text-2xl font-bold">Nueva Evaluación</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Columna izquierda: Información del paciente y captura de imagen */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Información del paciente seleccionado */}
                    <Card className='border-l-4 border-l-blue-500 shadow-xs'>
                        <CardHeader>
                            <CardTitle className='text-blue-600'>Paciente Seleccionado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">{getPatientFullName(selectedPatient)}</h3>
                                    <p className="text-sm text-gray-600">
                                        {selectedPatient.edad} años • {selectedPatient.genero}
                                    </p>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700">
                                    <span className="text-blue-600">DNI</span>
                                    <span className="font-semibold">{selectedPatient.dni}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alerta de error */}
                    {errorMessage && (
                        <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-yellow-800">Error en la evaluación</p>
                                <p className="mt-1 text-sm text-yellow-700">{errorMessage}</p>
                            </div>
                            <button
                                onClick={() => setErrorMessage(null)}
                                className="cursor-pointer text-yellow-600 transition-colors hover:text-yellow-800"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Sección de captura de imagen */}
                    <ImageCaptureSection capturedImages={capturedImages} setCapturedImages={setCapturedImages} />

                    {/* Botón de evaluación */}
                    <Button className="w-full" size="lg" onClick={handleEvaluatePatient} disabled={capturedImages.length === 0 || isEvaluating}>
                        {isEvaluating ? 'Evaluando...' : 'Evaluar paciente'}
                    </Button>
                </div>

                {/* Columna derecha: Recomendaciones */}
                <div className="lg:col-span-1">
                    <ImageRecommendations />
                </div>
            </div>
        </div>
    );
}
