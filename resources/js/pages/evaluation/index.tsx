import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { CreatePatientModal } from '@/pages/patients/create-patient-modal';
import { Paciente, PacienteFormData } from '@/pages/patients/types';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { PatientEvaluationSection } from './partials/patient-evaluation-section';

interface EvaluationPageProps {
    pacientes: Paciente[];
    totalPacientes: number;
    pacienteSeleccionado?: Paciente | null;
    filters: {
        search?: string;
    };
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluación',
        href: '/evaluacion',
    },
];

export default function Evaluacion() {
    const { pacientes, totalPacientes, pacienteSeleccionado, filters } = usePage<EvaluationPageProps>().props;
    const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(pacienteSeleccionado || null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Preseleccionar paciente si viene desde el detalle
    useEffect(() => {
        if (pacienteSeleccionado) {
            setSelectedPatient(pacienteSeleccionado);
        }
    }, [pacienteSeleccionado]);

    // Sincronizar el estado local con los filtros de la URL
    useEffect(() => {
        setSearchTerm(filters.search || '');
    }, [filters.search]);

    const getPatientFullName = (patient: Paciente) => {
        return `${patient.apellidos} ${patient.nombres}`;
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        
        // Si el campo está vacío, limpiar la búsqueda
        if (value.trim() === '') {
            router.get('/evaluacion', {}, {
                preserveState: true,
                preserveScroll: true,
                only: ['pacientes', 'filters']
            });
        } else {
            router.get('/evaluacion', 
                { search: value.trim() }, 
                { 
                    preserveState: true,
                    preserveScroll: true,
                    only: ['pacientes', 'filters']
                }
            );
        }
    };

    const handlePatientSelect = (patient: Paciente) => {
        setSelectedPatient(patient);
    };

    const handleCreateSubmit = (formData: PacienteFormData) => {
        router.post('/pacientes', formData, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                toast.success('Paciente guardado correctamente');
                // Recargar solo los pacientes para obtener la lista actualizada
                router.reload({ only: ['pacientes', 'totalPacientes'] });
            },
            onError: (errors) => {
                Object.values(errors).forEach((errorMessage) => {
                    toast.error(errorMessage as string);
                });
            },
        });
    };

    const handleBackToSelection = () => {
        setSelectedPatient(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Evaluación" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {!selectedPatient ? (
                    /* Selección de Paciente */
                    <>
                        <h1 className="text-2xl font-bold">Nueva Evaluación</h1>
                        <Card>
                            <CardHeader>
                                <CardTitle>Seleccionar Paciente</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Barra de búsqueda con botón de crear */}
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                        <Input
                                            placeholder="Buscar paciente por nombre, apellido o DNI..."
                                            className="pl-10"
                                            value={searchTerm}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="default" onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 ">
                                        <Plus className="h-4 w-4" />
                                        Agregar
                                    </Button>
                                </div>

                                {/* Lista de pacientes */}
                                <div className="space-y-2">
                                    {pacientes.length > 0 ? (
                                        <>
                                            {/* Mostrar información de resultados */}
                                            <div className="text-sm text-gray-500 px-1">
                                                {searchTerm ? 
                                                    `${pacientes.length} de ${totalPacientes} paciente(s) encontrado(s)` : 
                                                    `Mostrando ${pacientes.length} de ${totalPacientes} paciente(s) registrado(s)`
                                                }
                                            </div>
                                            
                                            {pacientes.map((paciente) => (
                                                <div
                                                    key={paciente.id}
                                                    onClick={() => handlePatientSelect(paciente)}
                                                    className="cursor-pointer rounded-lg border p-4 shadow transition-all hover:bg-gray-50 hover:shadow-md"
                                                >
                                                    <h3 className="pb-1 text-lg font-semibold">{getPatientFullName(paciente)}</h3>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-600">
                                                            {paciente.edad} años • {paciente.genero}
                                                        </span>
                                                        <span className="text-sm text-gray-600">DNI: {paciente.dni}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            {searchTerm ? 
                                                `No se encontraron pacientes con ese criterio de búsqueda. (Total registrados: ${totalPacientes})` : 
                                                'No hay pacientes registrados.'
                                            }
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    /* Sección de evaluación del paciente */
                    <PatientEvaluationSection selectedPatient={selectedPatient} onBackToSelection={handleBackToSelection} />
                )}

                {/* Modal para crear paciente */}
                <CreatePatientModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateSubmit} />
            </div>
            <Toaster position="top-right" />
        </AppLayout>
    );
}