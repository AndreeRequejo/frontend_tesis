import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Paciente } from '@/pages/patients/types';
import { router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImageCaptureSection } from './image-capture-section';
import { ImageRecommendations } from './image-recommendations';
import { analyzeAcneSeverity, ENABLE_MODEL_ANALYSIS } from '@/services/model';

interface PatientEvaluationSectionProps {
    selectedPatient: Paciente;
    onBackToSelection: () => void;
}

export function PatientEvaluationSection({ selectedPatient, onBackToSelection }: PatientEvaluationSectionProps) {
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const getPatientFullName = (patient: Paciente) => {
        return `${patient.apellidos} ${patient.nombres}`;
    };

    // useEffect para cerrar automáticamente la alerta después de 2 segundos
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 4000); // 4 segundos

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

        try {
            // Convertir base64 a objeto File para verificación con modelo externo (si está habilitado)
            const firstImageBase64 = capturedImages[0];
            const response = await fetch(firstImageBase64);
            const blob = await response.blob();
            const imageFile = new File([blob], "evaluation_image.jpg", { type: blob.type });

            // Verificar si el análisis con modelo externo está habilitado
            if (ENABLE_MODEL_ANALYSIS) {
                try {
                    // Llamar al modelo para verificar si el rostro está limpio
                    const analysisResult = await analyzeAcneSeverity(imageFile);

                    // Almacenar resultado en sessionStorage para usarlo en la página de predicción
                    sessionStorage.setItem('model_analysis', JSON.stringify(analysisResult));
                } catch (modelError) {
                    // Si el modelo lanza un error (por ejemplo, no es un rostro real), mostrar el error y detener
                    const errorMsg = modelError instanceof Error 
                        ? modelError.message 
                        : 'No se pudo analizar la imagen. Por favor, intenta con una foto clara de un rostro humano.';
                    setErrorMessage(errorMsg);
                    setIsEvaluating(false);
                    return; // Detener la ejecución
                }
            }

            // Ahora llamar al backend para la predicción
            router.post(
                '/evaluacion/predecir',
                {
                    paciente_id: selectedPatient.id,
                    imagenes: capturedImages,
                },
                {
                    onSuccess: () => {
                        setErrorMessage(null);
                    },
                    onError: (errors) => {
                        console.error('Error:', errors);
                        // Limpiar sessionStorage en caso de error
                        sessionStorage.removeItem('model_analysis');

                        let errorMsg = 'Error al procesar la evaluación';

                        if (errors.prediccion) {
                            errorMsg = errors.prediccion;
                        } else if (typeof errors === 'string') {
                            errorMsg = errors;
                        } else if (errors.message) {
                            errorMsg = errors.message;
                        }

                        setErrorMessage(errorMsg);
                    },
                    onFinish: () => {
                        setIsEvaluating(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error de conexión al procesar la evaluación';
            setErrorMessage(errorMessage);
            setIsEvaluating(false);
        }
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
