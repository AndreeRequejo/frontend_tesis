import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { router } from '@inertiajs/react';
import { Paciente } from '@/pages/patients/types';
import { ImageCaptureSection } from './image-capture-section';
import { ImageRecommendations } from './image-recommendations';

interface PatientEvaluationSectionProps {
    selectedPatient: Paciente;
    onBackToSelection: () => void;
}

export function PatientEvaluationSection({ selectedPatient, onBackToSelection }: PatientEvaluationSectionProps) {
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [isEvaluating, setIsEvaluating] = useState(false);

    const getPatientFullName = (patient: Paciente) => {
        return `${patient.nombres} ${patient.apellidos}`;
    };

    const handleEvaluatePatient = async () => {
        if (!selectedPatient || capturedImages.length === 0) {
            toast.error('Debe seleccionar un paciente y agregar al menos una imagen');
            return;
        }

        setIsEvaluating(true);

        try {
            router.post(
                '/evaluacion/predecir',
                {
                    paciente_id: selectedPatient.id,
                    imagenes: capturedImages,
                },
                {
                    onSuccess: () => {
                        // La redirección se maneja automáticamente por Inertia
                    },
                    onError: (errors) => {
                        console.error('Error:', errors);

                        let errorMessage = 'Error al procesar la evaluación';

                        if (errors.prediccion) {
                            errorMessage = errors.prediccion;
                        } else if (typeof errors === 'string') {
                            errorMessage = errors;
                        } else if (errors.message) {
                            errorMessage = errors.message;
                        }

                        toast.error(errorMessage);
                    },
                    onFinish: () => {
                        setIsEvaluating(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión al procesar la evaluación');
            setIsEvaluating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={onBackToSelection}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Nueva Evaluación</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Columna izquierda: Información del paciente y captura de imagen */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Información del paciente seleccionado */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Paciente Seleccionado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">{getPatientFullName(selectedPatient)}</h3>
                                    <p className="text-sm text-gray-600">
                                        {selectedPatient.edad} años • {selectedPatient.genero}
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500">DNI: {selectedPatient.dni}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sección de captura de imagen */}
                    <ImageCaptureSection capturedImages={capturedImages} setCapturedImages={setCapturedImages} />

                    {/* Botón de evaluación */}
                    <Button 
                        className="w-full" 
                        size="lg" 
                        onClick={handleEvaluatePatient} 
                        disabled={capturedImages.length === 0 || isEvaluating}
                    >
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