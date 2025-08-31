import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Evaluacion } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, FileText, Trash2, Edit3, Save, X } from 'lucide-react';
import { useState, type ChangeEvent, useEffect } from 'react';

interface DetalleProps {
    evaluacion: Evaluacion;
}

interface PageProps extends Record<string, unknown> {
    evaluacion: Evaluacion;
    flash?: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Historial clínico',
        href: '/historial',
    },
    {
        title: 'Detalle de Evaluación',
        href: '#',
    },
];

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
    // Si ya tiene el prefijo data:, lo devuelve tal como está
    if (imagen.startsWith('data:')) {
        return imagen;
    }
    // Si es una URL normal, la devuelve tal como está
    if (imagen.startsWith('http') || imagen.startsWith('/')) {
        return imagen;
    }
    // Si es base64 puro, le agrega el prefijo
    return `data:image/jpeg;base64,${imagen}`;
};

export default function DetalleEvaluacion({ evaluacion }: DetalleProps) {
    const { flash } = usePage<PageProps>().props;
    const [isEditingComment, setIsEditingComment] = useState(false);
    const [comentarioEditado, setComentarioEditado] = useState(evaluacion.comentario || '');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Manejar mensajes flash del backend
    useEffect(() => {
        if (flash?.success) {
            console.log('Éxito:', flash.success);
        }
        if (flash?.error) {
            console.error('Error:', flash.error);
        }
    }, [flash]);

    const handleGoBack = () => {
        router.visit('/historial');
    };

    const handleGeneratePdf = () => {
        router.post(`/historial/${evaluacion.id}/pdf`);
    };

    const handleSaveComment = () => {
        setIsSubmitting(true);
        router.put(`/evaluaciones/${evaluacion.id}`, {
            clasificacion: evaluacion.clasificacion,
            comentario: comentarioEditado,
        }, {
            onSuccess: () => {
                setIsEditingComment(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleCancelEdit = () => {
        setComentarioEditado(evaluacion.comentario || '');
        setIsEditingComment(false);
    };

    const handleDelete = () => {
        setIsSubmitting(true);
        router.delete(`/evaluaciones/${evaluacion.id}`, {
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    // Determinar el grid de imágenes según la cantidad
    const getImageGridClass = (imageCount: number) => {
        if (imageCount === 1) {
            return 'grid-cols-1 max-w-md';
        } else if (imageCount === 2) {
            return 'grid-cols-1 md:grid-cols-2';
        } else {
            return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detalle de Evaluación" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* Header con botón de regreso */}
                <div className="flex items-center gap-4">
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleGoBack}
                        className="flex-shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Detalle de Evaluación</h1>
                </div>

                <div className="grid gap-6">
                    {/* Información del paciente */}
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
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resultado de la evaluación */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Resultado</CardTitle>
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
                                                className="aspect-square rounded-lg bg-gray-100 overflow-hidden border"
                                            >
                                                <img 
                                                    src={formatImageSrc(imagen)} 
                                                    alt={`Evaluación ${index + 1}`}
                                                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
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
                            {!isEditingComment && (
                                <Button 
                                    variant="outline" 
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

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between">
                        <Button 
                            onClick={handleGeneratePdf}
                            className="flex items-center gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            Generar PDF
                        </Button>
                        
                        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <DialogTrigger asChild>
                                <Button 
                                    variant="destructive"
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Eliminar
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>¿Está seguro?</DialogTitle>
                                    <DialogDescription>
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente 
                                        la evaluación y todos sus datos asociados.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowDeleteDialog(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Eliminando...' : 'Eliminar'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
