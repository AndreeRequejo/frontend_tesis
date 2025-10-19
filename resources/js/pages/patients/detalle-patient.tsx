import { EvaluacionCard } from '@/components/evaluacion-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            </div>
            <Toaster position="top-right" />
        </AppLayout>
    );
}
