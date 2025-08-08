import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EvaluacionCard } from '@/components/evaluacion-card';
import { ArrowLeft, Plus, Edit3 } from 'lucide-react';

interface DetalleProps {
    pacienteId: string;
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

// Datos de ejemplo - estos vendrían de tu backend
const pacienteData = {
    id: 1,
    nombre: "Juan Pérez",
    edad: 25,
    genero: "Masculino",
    fechaRegistro: "08/08/2025",
    telefono: "+51 987 654 321",
    email: "juan.perez@email.com",
    direccion: "Av. Los Pinos 123, Lima",
    evaluaciones: [
        {
            id: 1,
            pacienteNombre: "Juan Pérez",
            fecha: "08/08/2025",
            hora: "15:33",
            severidad: "Moderado" as const,
            descripcion: "Inflamación visible en la zona T",
            imagen: 'https://dermacareclinica.com/wp-content/uploads/2021/10/Cicatrices-de-acne%CC%81-la-huella-de-la-adolsecencia-1-960x720.jpg'
        },
        {
            id: 2,
            pacienteNombre: "Juan Pérez",
            fecha: "01/08/2025",
            hora: "15:33",
            severidad: "Severo" as const,
            descripcion: "Acné quístico en la zona del mentón",
            imagen: 'https://dermacareclinica.com/wp-content/uploads/2021/10/Cicatrices-de-acne%CC%81-la-huella-de-la-adolsecencia-1-960x720.jpg'
        },
        {
            id: 3,
            pacienteNombre: "Juan Pérez",
            fecha: "25/07/2025",
            hora: "10:15",
            severidad: "Leve" as const,
            descripcion: "Mejora notable en la zona frontal",
            imagen: 'https://dermacareclinica.com/wp-content/uploads/2021/10/Cicatrices-de-acne%CC%81-la-huella-de-la-adolsecencia-1-960x720.jpg'
        }
    ]
};

export default function DetallePaciente({ pacienteId }: DetalleProps) {
    const handleGoBack = () => {
        router.visit('/pacientes');
    };

    const handleEdit = () => {
        console.log('Editar paciente:', pacienteId);
        // Aquí implementarías la lógica para editar el paciente
    };

    const handleNewEvaluation = () => {
        console.log('Nueva evaluación para paciente:', pacienteId);
        // Aquí implementarías la lógica para crear una nueva evaluación
    };

    const handleGeneratePdf = (evaluacionId: number) => {
        console.log('Generar PDF para evaluación:', evaluacionId);
        // Aquí implementarías la lógica para generar el PDF
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detalles del Paciente" />
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
                    <h1 className="text-2xl font-bold">Detalles del Paciente</h1>
                </div>

                <div className="grid gap-6">
                    {/* Información del paciente */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Información Personal</CardTitle>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleEdit}
                                className="flex items-center gap-2"
                            >
                                <Edit3 className="h-4 w-4" />
                                Editar
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-lg font-semibold">{pacienteData.nombre}</h3>
                                        <p className="text-sm text-gray-600">
                                            {pacienteData.edad} años • {pacienteData.genero}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Fecha de registro</p>
                                        <p className="text-sm">{pacienteData.fechaRegistro}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Teléfono</p>
                                        <p className="text-sm">{pacienteData.telefono}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p className="text-sm">{pacienteData.email}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Dirección</p>
                                        <p className="text-sm">{pacienteData.direccion}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Evaluaciones */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Evaluaciones</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">
                                    Historial de evaluaciones realizadas
                                </p>
                            </div>
                            <Button 
                                onClick={handleNewEvaluation}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Nueva
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {pacienteData.evaluaciones.length > 0 ? (
                                <div className="space-y-4">
                                    {pacienteData.evaluaciones.map((evaluacion) => (
                                        <EvaluacionCard
                                            key={evaluacion.id}
                                            id={evaluacion.id}
                                            pacienteNombre={evaluacion.pacienteNombre}
                                            fecha={evaluacion.fecha}
                                            hora={evaluacion.hora}
                                            severidad={evaluacion.severidad}
                                            descripcion={evaluacion.descripcion}
                                            imagen={evaluacion.imagen}
                                            showPdfButton={true}
                                            onGeneratePdf={() => handleGeneratePdf(evaluacion.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">No hay evaluaciones registradas</p>
                                    <Button 
                                        onClick={handleNewEvaluation}
                                        className="flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Crear primera evaluación
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
