import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { PatientCard } from '@/components/paciente-card';
import { Button } from '@/components/ui/button';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { CreatePatientModal } from './create-patient-modal';
import { EditPatientModal } from './edit-patient-modal';
import { DeletePatientModal } from './delete-patient-modal';
import { Paciente, PacienteFormData, PaginatedResponse } from './types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pacientes',
        href: '/pacientes',
    },
];

interface PageProps {
    pacientes: PaginatedResponse<Paciente>;
    filters: {
        search?: string;
    };
    [key: string]: unknown;
}

export default function Pacientes() {
    const { pacientes, filters } = usePage<PageProps>().props;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Debounce para la búsqueda
    useEffect(() => {
        // Evitar la búsqueda en la carga inicial
        if (isInitialLoad) {
            setIsInitialLoad(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            const currentSearch = filters?.search || '';
            if (searchTerm !== currentSearch) {
                router.get('/pacientes', 
                    { search: searchTerm || undefined }, 
                    { 
                        preserveState: true,
                        replace: true 
                    }
                );
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filters?.search, isInitialLoad]);

    const handleEdit = (id: number) => {
        const patient = pacientes.data.find(p => p.id === id);
        if (patient) {
            // Asegurar que se limpie el estado anterior y se establezca el nuevo
            setSelectedPatient(null);
            setTimeout(() => {
                setSelectedPatient(patient);
                setIsEditModalOpen(true);
            }, 0);
        }
    };

    const handleDelete = (id: number) => {
        const patient = pacientes.data.find(p => p.id === id);
        if (patient) {
            setSelectedPatient(patient);
            setIsDeleteModalOpen(true);
        }
    };

    const handleCreateSubmit = (formData: PacienteFormData) => {
        router.post('/pacientes', formData, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
            }
        });
    };

    const handleEditSubmit = (formData: PacienteFormData) => {
        if (selectedPatient) {
            router.put(`/pacientes/${selectedPatient.id}`, formData, {
                preserveState: true,
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setSelectedPatient(null);
                },
                onError: () => {
                    // Mantener el modal abierto en caso de error
                }
            });
        }
    };

    const handleDeleteConfirm = () => {
        if (selectedPatient) {
            router.delete(`/pacientes/${selectedPatient.id}`, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedPatient(null);
                }
            });
        }
    };

    const handlePageChange = (url: string) => {
        router.get(url, { search: searchTerm }, { 
            preserveState: true,
            replace: true 
        });
    };

    const getPatientFullName = (patient: Paciente) => {
        return `${patient.nombres} ${patient.apellidos}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pacientes" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* Header con título y botón nuevo */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Pacientes</h1>
                        <p className="text-sm text-gray-600">
                            Total: {pacientes.total} pacientes
                        </p>
                    </div>
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
                        placeholder="Buscar por nombres, apellidos o DNI..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Lista de pacientes */}
                <div className="grid gap-4">
                    {pacientes.data.length > 0 ? (
                        pacientes.data.map((paciente) => (
                            <PatientCard
                                key={paciente.id}
                                id={paciente.id}
                                nombre={getPatientFullName(paciente)}
                                edad={paciente.edad}
                                genero={paciente.genero}
                                dni={paciente.dni}
                                telefono={paciente.telefono}
                                ultimaEvaluacion="" // Eliminar o manejar desde evaluaciones
                                showActions={true}
                                onEdit={() => handleEdit(paciente.id)}
                                onDelete={() => handleDelete(paciente.id)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            {searchTerm ? 'No se encontraron pacientes que coincidan con la búsqueda.' : 'No hay pacientes registrados.'}
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {pacientes.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                            Mostrando {pacientes.from} a {pacientes.to} de {pacientes.total} resultados
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => pacientes.prev_page_url && handlePageChange(pacientes.prev_page_url)}
                                disabled={!pacientes.prev_page_url}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </Button>
                            
                            <div className="flex items-center gap-1">
                                {pacientes.links.slice(1, -1).map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => link.url && handlePageChange(link.url)}
                                        disabled={!link.url}
                                    >
                                        {link.label}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => pacientes.next_page_url && handlePageChange(pacientes.next_page_url)}
                                disabled={!pacientes.next_page_url}
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Modales */}
                <CreatePatientModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateSubmit}
                />

                <EditPatientModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedPatient(null);
                    }}
                    onSubmit={handleEditSubmit}
                    patient={selectedPatient}
                />

                <DeletePatientModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    patientName={selectedPatient ? getPatientFullName(selectedPatient) : undefined}
                />
            </div>
        </AppLayout>
    );
}
