import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, Clock, Image as ImageIcon, Save, Target, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface PacienteData {
    id: number;
    nombre: string;
    dni: string;
    edad: number;
    genero: string;
}

interface PrediccionSimple {
    success: boolean;
    prediccion_class: number;
    prediccion_label: string;
    confianza: number;
    confianza_porcentaje: string;
    probabilidades: Record<string, number>;
    tiempo_procesamiento: number;
}

interface PrediccionBatch {
    success: boolean;
    total_images: number;
    successful: number;
    failed: number;
    predicciones: Array<{
        filename: string;
        success: boolean;
        prediccion_class?: number;
        prediccion_label?: string;
        confianza?: number;
        confianza_porcentaje?: string;
        probabilidades?: Record<string, number>;
        error?: string;
    }>;
    tiempo_procesamiento: number;
}

interface PredictionPageProps {
    success: boolean;
    paciente: PacienteData;
    imagenes: string[];
    prediccion: PrediccionSimple | PrediccionBatch;
    fecha_evaluacion: string;
    [key: string]: unknown; // Agregar signatura de índice
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluación',
        href: '/evaluacion',
    },
    {
        title: 'Resultados de Predicción',
        href: '#',
    },
];

// Mapeo de clasificaciones a colores
const getClassificationColor = (label: string) => {
    switch (label.toLowerCase()) {
        case 'ausente':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'leve':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'moderado':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'severo':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

// Componente para mostrar probabilidades
const ProbabilityBars = ({ probabilidades }: { probabilidades: Record<string, number> }) => {
    const sortedProbs = Object.entries(probabilidades).sort(([, a], [, b]) => b - a);

    return (
        <div className="space-y-2">
            {sortedProbs.map(([clase, prob]) => (
                <div key={clase} className="flex items-center gap-3">
                    <span className="w-20 text-right text-sm font-medium">{clase}:</span>
                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                        <div className="h-2 rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${prob * 100}%` }} />
                    </div>
                    <span className="w-12 text-sm text-gray-600">{(prob * 100).toFixed(1)}%</span>
                </div>
            ))}
        </div>
    );
};

export default function Prediction() {
    const { success, paciente, imagenes, prediccion, fecha_evaluacion } = usePage<PredictionPageProps>().props;
    const [isSaving, setIsSaving] = useState(false);
    const [comentario, setComentario] = useState('');

    // Determinar si es predicción simple o batch
    const isSimplePrediction = 'prediccion_class' in prediccion;
    const isBatchPrediction = 'total_images' in prediccion;

    // Inicializar comentario con el texto automático
    useState(() => {
        if (isSimplePrediction) {
            const pred = prediccion as PrediccionSimple;
            // Convertir probabilidades a texto
            const probText = Object.entries(pred.probabilidades)
                .sort(([, a], [, b]) => b - a)
                .map(([clase, prob]) => `${clase}: ${(prob * 100).toFixed(1)}%`)
                .join(', ');
            setComentario(`Clasificación: ${pred.prediccion_label} con un nivel de confianza de ${pred.confianza_porcentaje}. Distribución de probabilidades: ${probText}`);
        } else if (isBatchPrediction) {
            const pred = prediccion as PrediccionBatch;
            setComentario(`Evaluación automática (${pred.successful}/${pred.total_images} imágenes procesadas) - Clasificación más severa detectada`);
        }
    });

    // Función para obtener el layout de las imágenes según la cantidad
    const getImageLayout = (count: number) => {
        switch (count) {
            case 1:
                return {
                    containerClass: 'flex justify-center',
                    imageClass: 'w-full max-w-[300px]'
                };
            case 2:
                return {
                    containerClass: 'flex justify-between gap-4',
                    imageClass: 'w-full max-w-[280px]'
                };
            case 3:
                return {
                    containerClass: 'grid grid-cols-2 gap-4',
                    imageClass: 'w-full max-w-[240px]',
                    thirdImageClass: 'col-span-2 flex justify-center'
                };
            default:
                return {
                    containerClass: 'grid grid-cols-2 gap-4',
                    imageClass: 'w-full max-w-[200px]'
                };
        }
    };

    const imageLayout = getImageLayout(imagenes.length);

    const handleSave = () => {
        setIsSaving(true);

        let clasificacion = '';
        let confianza = 0;
        let tiempo_procesamiento = 0;
        let probabilidades = null;

        if (isSimplePrediction) {
            const pred = prediccion as PrediccionSimple;
            clasificacion = pred.prediccion_label;
            confianza = pred.confianza;
            tiempo_procesamiento = pred.tiempo_procesamiento;
            probabilidades = pred.probabilidades;
        } else if (isBatchPrediction) {
            const pred = prediccion as PrediccionBatch;
            // Para batch, usar la predicción con mayor clase (más severa)
            const prediccionesExitosas = pred.predicciones.filter((p) => p.success);
            if (prediccionesExitosas.length > 0) {
                // Buscar la predicción con mayor clase (más severa)
                const prediccionMasSevera = prediccionesExitosas.reduce((mayor, actual) =>
                    (actual.prediccion_class || 0) > (mayor.prediccion_class || 0) ? actual : mayor,
                );
                clasificacion = prediccionMasSevera.prediccion_label || '';
                confianza = prediccionMasSevera.confianza || 0;
                probabilidades = prediccionMasSevera.probabilidades || null;
            }
            tiempo_procesamiento = pred.tiempo_procesamiento;
        }

        // Usar la ruta POST /evaluaciones que mapea al método store
        router.post(
            '/evaluaciones',
            {
                paciente_id: paciente.id,
                clasificacion,
                comentario, // Usar el comentario del textarea
                imagenes,
                es_prediccion_automatica: true,
                confianza,
                tiempo_procesamiento,
                probabilidades,
            },
            {
                onSuccess: () => {
                    toast.success('Evaluación guardada exitosamente');
                    // No necesitamos redirigir manualmente, el controlador lo hace automáticamente
                },
                onError: (errors) => {
                    console.error('Errores:', errors);
                    // Mostrar el error específico si existe
                    if (errors.general) {
                        toast.error(errors.general);
                    } else {
                        toast.error('Error al guardar la evaluación');
                    }
                },
                onFinish: () => {
                    setIsSaving(false);
                },
            },
        );
    };

    const handleBack = () => {
        router.visit('/evaluacion');
    };

    if (!success) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Error en Predicción" />
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">Error en Predicción</h1>
                    </div>
                    <Card>
                        <CardContent className="flex items-center justify-center p-8">
                            <div className="text-center">
                                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                                <h3 className="mb-2 text-lg font-semibold">Error al procesar las imágenes</h3>
                                <p className="mb-4 text-gray-600">No se pudo realizar la predicción</p>
                                <Button onClick={handleBack}>Volver a intentar</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resultados de Predicción" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">Resultados de Predicción</h1>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <div className='ml-13'>
                        <p className="text-sm font-bold">
                            Paciente:
                            <span className="font-light">
                                {' '}
                                {paciente.nombre} - {paciente.dni}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Layout de 2 columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna izquierda - Imágenes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                {imagenes.length === 1 ? `Imagen evaluada (1)` : `Imágenes evaluadas (${imagenes.length})`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={imageLayout.containerClass}>
                                {imagenes.map((imagen, index) => (
                                    <div 
                                        key={index} 
                                        className={`
                                            ${imagenes.length === 3 && index === 2 ? imageLayout.thirdImageClass : ''}
                                        `}
                                    >
                                        <div className="relative inline-block">
                                            <img
                                                src={imagen}
                                                alt={`Imagen ${index + 1}`}
                                                className={`${imageLayout.imageClass} h-auto rounded-lg object-contain shadow-md`}
                                            />
                                            <div className="absolute bottom-2 left-2 rounded bg-black bg-opacity-75 px-2 py-1 text-sm text-white">
                                                Imagen {index + 1}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Columna derecha - Datos de predicción */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Resultado de la Evaluación
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isSimplePrediction && (
                                <>
                                    {(() => {
                                        const pred = prediccion as PrediccionSimple;
                                        return (
                                            <>
                                                {/* Clasificación principal */}
                                                <div className="text-center">
                                                    <Badge className={`px-4 py-2 text-lg ${getClassificationColor(pred.prediccion_label)}`}>
                                                        {pred.prediccion_label}
                                                    </Badge>
                                                    <p className="mt-2 text-sm text-gray-600">Confianza: {pred.confianza_porcentaje}</p>
                                                </div>

                                                {/* Probabilidades */}
                                                <div>
                                                    <h4 className="mb-3 flex items-center gap-2 font-semibold">
                                                        <TrendingUp className="h-4 w-4" />
                                                        Distribución de Probabilidades
                                                    </h4>
                                                    <ProbabilityBars probabilidades={pred.probabilidades} />
                                                </div>

                                {/* Información técnica */}
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Tiempo: {pred.tiempo_procesamiento}ms
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(fecha_evaluacion).toLocaleString()}
                                    </div>
                                </div>

                                {/* Comentarios */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">Comentarios de la evaluación</h4>
                                    <Textarea
                                        placeholder="Agregar comentarios adicionales sobre la evaluación..."
                                        value={comentario}
                                        onChange={(e) => setComentario(e.target.value)}
                                        className="min-h-[80px] text-sm"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Este comentario se guardará junto con la evaluación
                                    </p>
                                </div>
                            </>
                        );
                    })()}
                </>
            )}

            {isBatchPrediction && (
                <>
                    {(() => {
                        const pred = prediccion as PrediccionBatch;
                        return (
                            <>
                                {/* Resumen general */}
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">{pred.total_images}</p>
                                        <p className="text-xs text-gray-600">Total</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">{pred.successful}</p>
                                        <p className="text-xs text-gray-600">Exitosas</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-red-600">{pred.failed}</p>
                                        <p className="text-xs text-gray-600">Fallidas</p>
                                    </div>
                                </div>

                                {/* Resultados por imagen */}
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    <h4 className="font-semibold text-sm">Resultados por imagen:</h4>
                                    {pred.predicciones.map((resultado, index) => (
                                        <div
                                            key={index}
                                            className={`rounded-lg border p-3 text-sm ${
                                                resultado.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <h5 className="font-medium">Imagen {index + 1}</h5>
                                                {resultado.success ? (
                                                    <Badge className={`text-xs ${getClassificationColor(resultado.prediccion_label || '')}`}>
                                                        {resultado.prediccion_label} ({resultado.confianza_porcentaje})
                                                    </Badge>
                                                ) : (
                                                    <Badge className="text-xs border-red-200 bg-red-100 text-red-800">Error</Badge>
                                                )}
                                            </div>

                                            {!resultado.success && resultado.error && (
                                                <p className="mt-2 text-xs text-red-600">{resultado.error}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Información técnica */}
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Tiempo: {pred.tiempo_procesamiento}ms
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(fecha_evaluacion).toLocaleString()}
                                    </div>
                                </div>

                                {/* Comentarios */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">Comentarios de la evaluación</h4>
                                    <Textarea
                                        placeholder="Agregar comentarios adicionales sobre la evaluación..."
                                        value={comentario}
                                        onChange={(e) => setComentario(e.target.value)}
                                        className="min-h-[80px] text-sm"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Este comentario se guardará junto con la evaluación
                                    </p>
                                </div>
                            </>
                        );
                    })()}
                </>
            )}
        </CardContent>
    </Card>
                </div>                {/* Botones de acción */}
                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={handleBack}>
                        Nueva evaluación
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Guardando...' : 'Guardar Evaluación'}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
