import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { PatientCard } from '@/components/paciente-card';
import { EvaluacionCard } from '@/components/evaluacion-card';
import { DetalleEvaluacionModal } from '@/pages/history/detalle-evaluacion-modal';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inicio',
        href: '/dashboard',
    },
];

interface PacienteReciente {
    id: number;
    nombre: string;
    edad: number;
    ultimaEvaluacion: string | null;
}

interface EvaluacionReciente {
    id: number;
    pacienteNombre: string;
    fecha: string;
    hora: string;
    severidad: 'Ausente' | 'Leve' | 'Moderado' | 'Severo';
    imagen: string | null;
    descripcion: string;
}

interface DashboardProps {
    pacientesRecientes: PacienteReciente[];
    evaluacionesRecientes: EvaluacionReciente[];
    limit: number;
}

export default function Dashboard({ pacientesRecientes, evaluacionesRecientes }: DashboardProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvaluacionId, setSelectedEvaluacionId] = useState<number | null>(null);

    const handleViewDetails = (evaluacionId: number) => {
        setSelectedEvaluacionId(evaluacionId);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEvaluacionId(null);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className='m-4 flex flex-col gap-3'>
                <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white shadow-lg">
                    <h2 className="mb-1 text-xl font-semibold">Bienvenido</h2>
                    <p className="mb-4 text-blue-100">Evalúa la gravedad del acné mediante una imagen facial</p>
                    <Button asChild variant="secondary" className="w-full text-primary">
                        <Link href="/evaluacion">
                            <Camera size={18} className="mr-2" />
                            Nueva evaluación
                        </Link>
                    </Button>
                </div>
                <div className='flex flex-col gap-4'>
                    <div className='flex flex-row items-center justify-between'>
                        <h2 className="text-lg font-semibold">Pacientes recientes</h2>
                        <Button asChild variant="ghost">
                            <Link href="/pacientes">Ver todos</Link>
                        </Button>
                    </div>
                    
                    {/* Contenido de pacientes recientes */}
                    {pacientesRecientes.length > 0 ? (
                        <div className="grid gap-4">
                            {pacientesRecientes.map((paciente) => (
                                <PatientCard 
                                    key={paciente.id}
                                    id={paciente.id}
                                    nombre={paciente.nombre}
                                    edad={paciente.edad}
                                    ultimaEvaluacion={paciente.ultimaEvaluacion || undefined}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No hay pacientes registrados aún.</p>
                            <Button asChild variant="outline" className="mt-2">
                                <Link href="/pacientes">Registrar primer paciente</Link>
                            </Button>
                        </div>
                    )}

                    {/* Contenido de evaluaciones recientes */}
                    <div className='flex flex-row items-center justify-between mt-6'>
                        <h2 className="text-lg font-semibold">Evaluaciones recientes</h2>
                        <Button asChild variant="ghost">
                            <Link href="/historial">Ver todas</Link>
                        </Button>
                    </div>
                    
                    {evaluacionesRecientes.length > 0 ? (
                        <div className="grid gap-4">
                            {evaluacionesRecientes.map((evaluacion) => (
                                <EvaluacionCard 
                                    key={evaluacion.id}
                                    id={evaluacion.id}
                                    pacienteNombre={evaluacion.pacienteNombre}
                                    fecha={evaluacion.fecha}
                                    hora={evaluacion.hora}
                                    severidad={evaluacion.severidad}
                                    imagen={evaluacion.imagen || undefined}
                                    descripcion={evaluacion.descripcion}
                                    onViewDetails={() => handleViewDetails(evaluacion.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No hay evaluaciones registradas aún.</p>
                            <Button asChild variant="outline" className="mt-2">
                                <Link href="/evaluacion">Realizar primera evaluación</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Modal de detalle de evaluación */}
                <DetalleEvaluacionModal
                    isOpen={modalOpen}
                    onClose={handleCloseModal}
                    evaluacionId={selectedEvaluacionId}
                    showPatientInfo={true}
                    showActions={true}
                />
            </div>
        </AppLayout>
    );
}
