import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PatientCard } from '@/components/paciente-card';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pacientes',
        href: '/pacientes',
    },
];

// Datos de ejemplo - estos vendrían de tu backend
const pacientesData = [
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
    const handleEdit = (id: number) => {
        console.log('Editar paciente:', id);
        // Aquí implementarías la lógica para editar
    };

    const handleDelete = (id: number) => {
        console.log('Eliminar paciente:', id);
        // Aquí implementarías la lógica para eliminar
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pacientes" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* Header con título y botón nuevo */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold">Pacientes</h1>
                    <Button className="flex items-center gap-2">
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
            </div>
        </AppLayout>
    );
}