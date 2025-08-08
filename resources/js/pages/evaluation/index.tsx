import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Camera, ImageIcon, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { CreatePatientModal } from '@/pages/patients/create-patient-modal';
import { Paciente, PacienteFormData } from '@/pages/patients/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluación',
        href: '/evaluacion',
    },
];

// Datos de ejemplo - estos vendrían de tu backend
const pacientesData: Paciente[] = [
    {
        id: 1,
        nombre: "Juan Pérez",
        edad: 25,
        genero: "Masculino",
        ultimaEvaluacion: "2023-10-01",
    },
    {
        id: 2,
        nombre: "María González",
        edad: 30,
        genero: "Femenino",
        ultimaEvaluacion: "2023-09-28",
    },
];

export default function Evaluacion() {
    const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const filteredPatients = pacientesData.filter(patient =>
        patient.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePatientSelect = (patient: Paciente) => {
        setSelectedPatient(patient);
    };

    const handleCreateSubmit = (formData: PacienteFormData) => {
        console.log('Crear paciente:', formData);
        // Aquí implementarías la lógica para crear el paciente
        setIsCreateModalOpen(false);
    };

    const handleBackToSelection = () => {
        setSelectedPatient(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Evaluación" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    {selectedPatient && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleBackToSelection}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <h1 className="text-2xl font-bold">Nueva Evaluación</h1>
                </div>

                {!selectedPatient ? (
                    /* Selección de Paciente */
                    <Card>
                        <CardHeader>
                            <CardTitle>Seleccionar Paciente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Barra de búsqueda con botón de crear */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Buscar paciente..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    variant="outline"
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nuevo Paciente
                                </Button>
                            </div>

                            {/* Lista de pacientes */}
                            <div className="space-y-2">
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map((paciente) => (
                                        <div 
                                            key={paciente.id}
                                            onClick={() => handlePatientSelect(paciente)}
                                            className="cursor-pointer rounded-lg border p-4 shadow hover:shadow-md hover:bg-gray-50 transition-all"
                                        >
                                            <h3 className="text-lg font-semibold pb-1">{paciente.nombre}</h3>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-600">{paciente.edad} años • {paciente.genero}</span>
                                                {paciente.ultimaEvaluacion && (
                                                    <span className="text-sm text-gray-600">
                                                        Última evaluación: {paciente.ultimaEvaluacion}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        {searchTerm ? 'No se encontraron pacientes.' : 'No hay pacientes registrados.'}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* Sección de imagen una vez seleccionado el paciente */
                    <>
                        {/* Información del paciente seleccionado */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold">{selectedPatient.nombre}</h3>
                                        <p className="text-sm text-gray-600">
                                            {selectedPatient.edad} años • {selectedPatient.genero}
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Última evaluación: {selectedPatient.ultimaEvaluacion}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sección de imagen */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Imagen</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Botón Cámara */}
                                    <Button
                                        variant="outline"
                                        className="h-24 flex flex-col gap-2"
                                        onClick={() => {
                                            // Aquí implementarías la lógica para abrir la cámara
                                            console.log('Abrir cámara');
                                        }}
                                    >
                                        <Camera className="h-8 w-8" />
                                        <span>Cámara</span>
                                    </Button>

                                    {/* Botón Galería */}
                                    <Button
                                        variant="outline"
                                        className="h-24 flex flex-col gap-2"
                                        onClick={() => {
                                            // Aquí implementarías la lógica para abrir la galería
                                            console.log('Abrir galería');
                                        }}
                                    >
                                        <ImageIcon className="h-8 w-8" />
                                        <span>Galería</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Botón Guardar Evaluación */}
                        <Button className="w-full" size="lg">
                            Guardar Evaluación
                        </Button>
                    </>
                )}

                {/* Modal para crear paciente */}
                <CreatePatientModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateSubmit}
                />
            </div>
        </AppLayout>
    );
}