import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PatientCard } from '@/components/paciente-card';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { CreatePatientModal } from './create-patient-modal';
import { EditPatientModal } from './edit-patient-modal';
import { DeletePatientModal } from './delete-patient-modal';
import { Paciente } from './types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pacientes',
        href: '/pacientes',
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
    // Puedes agregar más pacientes aquí
];

export default function Pacientes() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);

    const handleEdit = (id: number) => {
        const patient = pacientesData.find(p => p.id === id);
        if (patient) {
            setSelectedPatient(patient);
            setIsEditModalOpen(true);
        }
    };

    const handleDelete = (id: number) => {
        const patient = pacientesData.find(p => p.id === id);
        if (patient) {
            setSelectedPatient(patient);
            setIsDeleteModalOpen(true);
        }
    };

    const handleCreateSubmit = (formData: Omit<Paciente, 'id'>) => {
        console.log('Crear paciente:', formData);
        // Aquí implementarías la lógica para crear
        setIsCreateModalOpen(false);
    };

    const handleEditSubmit = (formData: Omit<Paciente, 'id'>) => {
        console.log('Editar paciente:', selectedPatient?.id, formData);
        // Aquí implementarías la lógica para editar
        setIsEditModalOpen(false);
        setSelectedPatient(null);
    };

    const handleDeleteConfirm = () => {
        console.log('Eliminar paciente:', selectedPatient?.id);
        // Aquí implementarías la lógica para eliminar
        setIsDeleteModalOpen(false);
        setSelectedPatient(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pacientes" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* Header con título y botón nuevo */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold">Pacientes</h1>
                    <Button 
                        className="flex items-center gap-2"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Nuevo
                    </Button>
                </div>

                {/* Barra de búsqueda */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Buscar paciente..."
                        className="pl-10"
                    />
                </div>

                {/* Lista de pacientes */}
                <div className="grid gap-4">
                    {pacientesData.map((paciente) => (
                        <PatientCard
                            key={paciente.id}
                            id={paciente.id}
                            nombre={paciente.nombre}
                            edad={paciente.edad}
                            genero={paciente.genero}
                            ultimaEvaluacion={paciente.ultimaEvaluacion}
                            showActions={true}
                            onEdit={() => handleEdit(paciente.id)}
                            onDelete={() => handleDelete(paciente.id)}
                        />
                    ))}
                </div>

                {/* Modales */}
                <CreatePatientModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateSubmit}
                />

                <EditPatientModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleEditSubmit}
                    patient={selectedPatient}
                />

                <DeletePatientModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    patientName={selectedPatient?.nombre}
                />
            </div>
        </AppLayout>
    );
}
