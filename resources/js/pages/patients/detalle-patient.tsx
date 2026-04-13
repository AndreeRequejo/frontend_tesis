import { EvaluacionCard } from '@/components/evaluacion-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { DetalleEvaluacionModal } from '@/pages/history/detalle-evaluacion-modal';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Download, Edit3, FileText } from 'lucide-react';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { EditPatientModal } from './edit-patient-modal';
import { Paciente, PacienteFormData } from './types';

interface Evaluacion {
    id: number;
    paciente_id: number;
    clasificacion: 'Ausente' | 'Leve' | 'Moderado' | 'Severo';
    comentario: string | null;
    fecha: string;
    hora: string;
    imagen_principal?: {
        id: number;
        contenido_base64: string;
    };
    imagenes?: Array<{
        id: number;
        contenido_base64: string;
    }>;
}

interface DetalleProps {
    paciente: Paciente & {
        evaluaciones: Evaluacion[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pacientes',
        href: '/pacientes',
    },
    {
        title: 'Detalle del Paciente',
        href: '#',
    },
];

export default function DetallePaciente({ paciente }: DetalleProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvaluacionId, setSelectedEvaluacionId] = useState<number | null>(null);
    const [isComparativeModalOpen, setIsComparativeModalOpen] = useState(false);
    const [selectedImagesByEvaluation, setSelectedImagesByEvaluation] = useState<Record<number, number[]>>({});

    const handleGoBack = () => {
        router.visit('/pacientes');
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleViewDetails = (evaluacionId: number) => {
        setSelectedEvaluacionId(evaluacionId);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEvaluacionId(null);
    };

    const handleEditSubmit = (formData: PacienteFormData) => {
        router.put(`/pacientes/${paciente.id}`, formData, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                toast.success('Paciente editado correctamente');
            },
            onError: (errors) => {
                Object.values(errors).forEach((errorMessage) => {
                    toast.error(errorMessage as string);
                });
            },
        });
    };

    const handleGenerateReport = () => {
        if (!paciente.evaluaciones || paciente.evaluaciones.length === 0) {
            toast.error('Este paciente no tiene evaluaciones registradas.', {
                duration: 1500,
                position: 'top-center',
                icon: '⚠️',
            });
            return;
        }

        // Función que retorna una promesa para descargar el PDF
        const downloadReport = async () => {
            const downloadUrl = `/reporte-paciente/${paciente.id}`;

            // Realizar la petición para obtener el PDF
            const response = await fetch(downloadUrl);

            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }

            // Obtener el blob del PDF
            const blob = await response.blob();

            // Crear URL temporal y descargar
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Reporte-${paciente.nombres} ${paciente.apellidos}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return 'Reporte descargado correctamente';
        };

        // Usar toast.promise para mostrar el estado de la descarga
        toast.promise(downloadReport(), {
            loading: 'Generando reporte...',
            success: <b>¡Reporte descargado!</b>,
            error: <b>Error al generar el reporte.</b>,
        });
    };

    const getImageSrc = (contenidoBase64: string) => {
        if (!contenidoBase64 || contenidoBase64.trim() === '') {
            return '';
        }

        if (contenidoBase64.startsWith('data:')) {
            return contenidoBase64;
        }

        return `data:image/jpeg;base64,${contenidoBase64}`;
    };

    const latestTwoEvaluations = [...(paciente.evaluaciones || [])]
        .sort((a, b) => {
            const dateA = new Date(`${a.fecha} ${a.hora || '00:00:00'}`).getTime();
            const dateB = new Date(`${b.fecha} ${b.hora || '00:00:00'}`).getTime();
            return dateB - dateA;
        })
        .slice(0, 2);

    const handleOpenComparativeReportModal = () => {
        if (!paciente.evaluaciones || paciente.evaluaciones.length < 2) {
            toast.error('Se necesitan al menos 2 evaluaciones para generar el reporte comparativo.', {
                duration: 1800,
                position: 'top-center',
            });
            return;
        }

        const initialSelection: Record<number, number[]> = {};

        latestTwoEvaluations.forEach((evaluation) => {
            const imageIds = (evaluation.imagenes || []).slice(0, 3).map((img) => img.id);
            initialSelection[evaluation.id] = imageIds;
        });

        setSelectedImagesByEvaluation(initialSelection);
        setIsComparativeModalOpen(true);
    };

    const toggleEvaluationImage = (evaluationId: number, imageId: number) => {
        setSelectedImagesByEvaluation((prev) => {
            const current = prev[evaluationId] || [];
            const isChecked = current.includes(imageId);

            if (isChecked) {
                if (current.length <= 1) {
                    toast.error('Debes mantener al menos 1 imagen seleccionada por evaluación.');
                    return prev;
                }
                return {
                    ...prev,
                    [evaluationId]: current.filter((id) => id !== imageId),
                };
            }

            if (current.length >= 3) {
                toast.error('Solo puedes seleccionar hasta 3 imágenes por evaluación.');
                return prev;
            }

            return {
                ...prev,
                [evaluationId]: [...current, imageId],
            };
        });
    };

    const handleGenerateComparativeReport = async () => {
        if (latestTwoEvaluations.length < 2) {
            toast.error('Se necesitan al menos 2 evaluaciones para generar el reporte comparativo.');
            return;
        }

        const hasInvalidSelection = latestTwoEvaluations.some((evaluation) => {
            const selectedCount = (selectedImagesByEvaluation[evaluation.id] || []).length;
            return selectedCount < 1 || selectedCount > 3;
        });

        if (hasInvalidSelection) {
            toast.error('Selecciona entre 1 y 3 imágenes por cada evaluación.');
            return;
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        const downloadComparativeReport = async () => {
            const response = await fetch(`/reporte-paciente/${paciente.id}/comparativo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    evaluacion_ids: latestTwoEvaluations.map((evaluation) => evaluation.id),
                    imagenes_por_evaluacion: selectedImagesByEvaluation,
                }),
            });

            if (!response.ok) {
                let errorMessage = 'Error al generar el reporte comparativo.';
                try {
                    const errorData = await response.json();
                    if (errorData?.message) {
                        errorMessage = errorData.message;
                    }
                } catch {
                    // No-op: si no viene JSON, usamos el mensaje por defecto.
                }
                throw new Error(errorMessage);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Reporte-Comparativo-${paciente.nombres} ${paciente.apellidos}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return 'Reporte comparativo descargado';
        };

        await toast.promise(downloadComparativeReport(), {
            loading: 'Generando reporte comparativo...',
            success: <b>¡Reporte comparativo descargado!</b>,
            error: (err) => <b>{err instanceof Error ? err.message : 'Error al generar el reporte comparativo.'}</b>,
        });

        setIsComparativeModalOpen(false);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'No registrada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getPatientFullName = () => {
        return `${paciente.apellidos} ${paciente.nombres}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detalles del Paciente" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header con botón de regreso */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleGoBack}
                        className="flex-shrink-0 border-blue-200 transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                        <ArrowLeft className="h-4 w-4 text-blue-600" />
                    </Button>
                    <h1 className="text-2xl font-bold">Detalles del Paciente</h1>
                </div>

                <div className="grid gap-6">
                    {/* Información del paciente */}
                    <Card className="border-l-4 border-l-blue-500 shadow-lg transition-shadow duration-200 hover:shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r">
                            <CardTitle className="text-blue-700">Información Personal</CardTitle>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleEdit}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                            >
                                <Edit3 className="h-4 w-4" />
                                Editar
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-blue-700">{getPatientFullName()}</h3>
                                        <p className="text-sm text-gray-600">
                                            {paciente.edad} años • {paciente.genero}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">Documento Ident.</p>
                                        <p className="font-mono text-sm font-semibold text-blue-600">{paciente.dni}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">Fecha de registro:</p>
                                        <p className="font-mono text-sm">{formatDate(paciente.created_at || '')}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium">Teléfono:</p>
                                        <p className="font-mono text-sm">{paciente.telefono || 'No registrado'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Evaluaciones */}
                    <Card className="border-l-4 border-l-blue-500 shadow-lg transition-shadow duration-200 hover:shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r">
                            <div>
                                <CardTitle className="text-blue-700">Evaluaciones</CardTitle>
                                <p className="mt-1 text-sm">Historial de evaluaciones realizadas</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleOpenComparativeReportModal}
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Reporte comparativo
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={handleGenerateReport}
                                    className="flex items-center gap-2 bg-blue-600 shadow-lg hover:bg-blue-700 hover:shadow-blue-200"
                                >
                                    <Download className="h-4 w-4" />
                                    Reporte
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="to-blue-25 bg-gradient-to-br from-white">
                            {paciente.evaluaciones && paciente.evaluaciones.length > 0 ? (
                                <div className="space-y-4">
                                    {paciente.evaluaciones.map((evaluacion) => (
                                        <EvaluacionCard
                                            key={evaluacion.id}
                                            id={evaluacion.id}
                                            pacienteNombre={getPatientFullName()}
                                            fecha={formatDate(evaluacion.fecha)}
                                            hora={evaluacion.hora}
                                            severidad={evaluacion.clasificacion}
                                            descripcion={evaluacion.comentario || 'Sin comentarios'}
                                            imagen={evaluacion.imagen_principal?.contenido_base64}
                                            onViewDetails={() => handleViewDetails(evaluacion.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-100 shadow-lg">
                                        <FileText className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-medium text-slate-700">No hay evaluaciones registradas</h3>
                                    <p className="mx-auto mb-6 max-w-sm text-slate-500">
                                        Este paciente aún no tiene evaluaciones. Crea la primera evaluación para comenzar el seguimiento.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Modal de edición */}
                <EditPatientModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSubmit} patient={paciente} />

                {/* Modal de detalle de evaluación */}
                <DetalleEvaluacionModal
                    isOpen={modalOpen}
                    onClose={handleCloseModal}
                    evaluacionId={selectedEvaluacionId}
                    showPatientInfo={false} // No mostrar info del paciente porque ya estamos en su detalle
                    showActions={true}
                />

                <Dialog open={isComparativeModalOpen} onOpenChange={setIsComparativeModalOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Reporte comparativo</DialogTitle>
                            <DialogDescription>
                                Selecciona imágenes de las 2 últimas evaluaciones (mínimo 1 y máximo 3 por evaluación).
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5">
                            {latestTwoEvaluations.map((evaluation, index) => {
                                const images = evaluation.imagenes || [];
                                return (
                                    <div key={evaluation.id} className="rounded-lg border p-4">
                                        <div className="mb-3">
                                            <p className="font-semibold text-slate-800">
                                                {index === 0 ? 'Evaluación más reciente' : 'Evaluación anterior'}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {formatDate(evaluation.fecha)} {evaluation.hora} - {evaluation.clasificacion}
                                            </p>
                                        </div>

                                        {images.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                                                {images.slice(0, 3).map((image, imageIndex) => {
                                                    const checked = (selectedImagesByEvaluation[evaluation.id] || []).includes(image.id);
                                                    return (
                                                        <label
                                                            key={image.id}
                                                            className="flex cursor-pointer flex-col gap-2 rounded-md border p-2 hover:bg-slate-50"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Checkbox
                                                                    checked={checked}
                                                                    onCheckedChange={() => toggleEvaluationImage(evaluation.id, image.id)}
                                                                />
                                                                <span className="text-xs text-slate-600">Imagen {imageIndex + 1}</span>
                                                            </div>
                                                            <img
                                                                src={getImageSrc(image.contenido_base64)}
                                                                alt={`Evaluación ${evaluation.id} - Imagen ${imageIndex + 1}`}
                                                                className="h-28 w-full rounded-md object-cover"
                                                            />
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500">Esta evaluación no tiene imágenes registradas.</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsComparativeModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleGenerateComparativeReport}>Generar reporte comparativo</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <Toaster position="top-right" />
        </AppLayout>
    );
}
