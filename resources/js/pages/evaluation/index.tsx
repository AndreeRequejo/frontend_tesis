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
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                            <h1 className="text-2xl font-bold">Nueva Evaluación</h1>
                        </div>
                        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
                            <CardHeader>
                                <CardTitle className="text-blue-700 flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Seleccionar Paciente
                                </CardTitle>
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
                                    <Button variant="default" onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
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
                                                    className="cursor-pointer rounded-lg border border-blue-100 p-4 shadow-sm bg-white hover:bg-blue-50 hover:shadow-md hover:border-blue-200 transition-all duration-200"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="pb-1 text-lg font-semibold text-blue-700">{getPatientFullName(paciente)}</h3>
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm text-gray-600">
                                                                    {paciente.edad} años • {paciente.genero}
                                                                </span>
                                                                <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 w-fit">
                                                                    <span className="text-xs text-blue-600">DNI</span>
                                                                    <span className="font-semibold">{paciente.dni}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-blue-400">
                                                            →
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-100 shadow-lg">
                                                <Search className="h-8 w-8 text-blue-500" />
                                            </div>
                                            <h3 className="mb-2 text-lg font-medium text-slate-700">
                                                {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                                            </h3>
                                            <p className="mx-auto mb-6 max-w-sm text-slate-500">
                                                {searchTerm ? 
                                                    `No se encontraron pacientes con ese criterio de búsqueda. (Total registrados: ${totalPacientes})` : 
                                                    'Comienza creando el primer paciente para realizar evaluaciones.'
                                                }
                                            </p>
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