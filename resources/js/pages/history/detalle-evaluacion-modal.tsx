import { useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { ScanFace, Save, X, Edit3, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';

interface EvaluacionDetalle {
    id: number;
    paciente?: {
        nombre: string;
        dni: string;
        edad: number;
        genero: string;
        telefono?: string;
    };
    fecha: string;
    hora: string;
    clasificacion: 'Leve' | 'Moderado' | 'Severo';
    comentario?: string;
    imagenes: string[];
}

interface EvaluacionModalDetalleProps {
    isOpen: boolean;
    onClose: () => void;
    evaluacionId: number | null;
    showPatientInfo?: boolean;
    showActions?: boolean;
}

const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
        case 'Leve':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'Moderado':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Severo':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const formatImageSrc = (imagen: string) => {
    if (imagen.startsWith('data:')) {
        return imagen;
    }
    if (imagen.startsWith('http') || imagen.startsWith('/')) {
        return imagen;
    }
    return `data:image/jpeg;base64,${imagen}`;
};

const getImageGridClass = (imageCount: number) => {
    if (imageCount === 1) {
        return 'grid-cols-1 max-w-md mx-auto';
    } else if (imageCount === 2) {
        return 'grid-cols-1 md:grid-cols-2';
    } else {
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
};

export function DetalleEvaluacionModal({ 
    isOpen, 
    onClose, 
    evaluacionId, 
    showPatientInfo = false,
    showActions = false 
}: EvaluacionModalDetalleProps) {
    const [evaluacion, setEvaluacion] = useState<EvaluacionDetalle | null>(null);
    const [loading, setLoading] = useState(false);
    const [isEditingComment, setIsEditingComment] = useState(false);
    const [comentarioEditado, setComentarioEditado] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Función para cargar los datos de la evaluación
    const loadEvaluacion = useCallback(async () => {
        if (!evaluacionId) return;
        
        setLoading(true);
        try {
            const response = await fetch(`/historial/${evaluacionId}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setEvaluacion(data.props.evaluacion);
                setComentarioEditado(data.props.evaluacion.comentario || '');
            } else {
                console.error('Error al cargar los detalles');
                toast.error('Error al cargar los detalles de la evaluación');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar los detalles de la evaluación');
        } finally {
            setLoading(false);
        }
    }, [evaluacionId]);

    // Cargar datos cuando se abre el modal
    useEffect(() => {
        if (isOpen && evaluacionId) {
            loadEvaluacion();
        } else if (!isOpen) {
            setEvaluacion(null);
            setIsEditingComment(false);
            setIsSubmitting(false); // Resetear estado de submitting al cerrar
        }
    }, [isOpen, evaluacionId, loadEvaluacion]);

    const handleSaveComment = () => {
        if (!evaluacion) return;
        
        setIsSubmitting(true);
        router.put(`/evaluaciones/${evaluacion.id}`, {
            clasificacion: evaluacion.clasificacion,
            comentario: comentarioEditado,
        }, {
            onSuccess: () => {
                setIsEditingComment(false);
                toast.success('Comentario editado correctamente');
                // Recargar los datos
                loadEvaluacion();
            },
            onError: () => {
                toast.error('Error al editar el comentario');
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleCancelEdit = () => {
        setComentarioEditado(evaluacion?.comentario || '');
        setIsEditingComment(false);
    };

    const handleDelete = () => {
        if (!evaluacion) return;
        
        setIsSubmitting(true);
        router.delete(`/evaluaciones/${evaluacion.id}`, {
            onSuccess: () => {
                toast.success('Evaluación eliminada correctamente');
                onClose();
            },
            onError: () => {
                toast.error('Error al eliminar la evaluación');
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ScanFace className="h-5 w-5 text-blue-600" />
                        </div>
                        Detalle de Evaluación
                    </DialogTitle>
                </DialogHeader>
                
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-gray-500">Cargando detalles...</div>
                    </div>
                ) : evaluacion ? (
                    <div className="space-y-6">
                        {/* Información del paciente (opcional) */}
                        {showPatientInfo && evaluacion.paciente && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Datos del Paciente</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-lg font-semibold">{evaluacion.paciente.nombre}</p>
                                        <p className="text-sm text-gray-600">
                                            {evaluacion.paciente.edad} años • {evaluacion.paciente.genero}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            DNI: {evaluacion.paciente.dni}
                                        </p>
                                        {evaluacion.paciente.telefono && (
                                            <p className="text-sm text-gray-600">
                                                Teléfono: {evaluacion.paciente.telefono}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Resultado de la evaluación */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Resultado de clasificación:</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {evaluacion.fecha} {evaluacion.hora}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeveridadColor(evaluacion.clasificacion)}`}>
                                    {evaluacion.clasificacion}
                                </span>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Imágenes de la evaluación */}
                                {evaluacion.imagenes.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-3">Imágenes de la evaluación</h4>
                                        <div className={`grid gap-4 ${getImageGridClass(evaluacion.imagenes.length)}`}>
                                            {evaluacion.imagenes.map((imagen: string, index: number) => (
                                                <div 
                                                    key={index}
                                                    className="aspect-square rounded-lg bg-gray-100 overflow-hidden border shadow-sm"
                                                >
                                                    <img 
                                                        src={formatImageSrc(imagen)} 
                                                        alt={`Evaluación ${index + 1}`}
                                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                                        onClick={() => window.open(formatImageSrc(imagen), '_blank')}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Comentarios */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Comentarios</CardTitle>
                                {!isEditingComment && showActions && (
                                    <Button 
                                        variant="default" 
                                        size="sm"
                                        onClick={() => setIsEditingComment(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                        Editar
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {isEditingComment ? (
                                    <div className="space-y-4">
                                        <Textarea
                                            value={comentarioEditado}
                                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setComentarioEditado(e.target.value)}
                                            placeholder="Agregar comentarios sobre la evaluación..."
                                            className="min-h-[100px]"
                                        />
                                        <div className="flex gap-2">
                                            <Button 
                                                onClick={handleSaveComment}
                                                disabled={isSubmitting}
                                                className="flex items-center gap-2"
                                                size="sm"
                                            >
                                                <Save className="h-4 w-4" />
                                                {isSubmitting ? 'Guardando...' : 'Guardar'}
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                onClick={handleCancelEdit}
                                                disabled={isSubmitting}
                                                className="flex items-center gap-2"
                                                size="sm"
                                            >
                                                <X className="h-4 w-4" />
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-700 leading-relaxed">
                                        {evaluacion.comentario || 'Sin comentarios'}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Acciones (opcional) */}
                        {showActions && (
                            <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4 border-t">
                                <Button 
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {isSubmitting ? 'Eliminando...' : 'Eliminar'}
                                </Button>
                                <Button 
                                    onClick={onClose}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Cerrar
                                </Button>
                            </div>
                        )}

                        {/* Botón de cerrar simple si no hay acciones */}
                        {!showActions && (
                            <div className="flex justify-end pt-4 border-t">
                                <Button 
                                    onClick={onClose}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Cerrar
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-gray-500">No se pudo cargar la evaluación</div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}