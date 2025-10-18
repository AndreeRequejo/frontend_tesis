import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { 
    ChevronLeft, 
    ChevronRight, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    User, 
    Phone, 
    Calendar,
    Eye
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { CreatePatientModal } from './create-patient-modal';
import { DeletePatientModal } from './delete-patient-modal';
import { EditPatientModal } from './edit-patient-modal';
import { Paciente, PacienteFormData, PaginatedResponse } from './types';
import { RoleHelper, User as UserType } from '@/lib/roleHelper';

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
        pag?: number;
    };
    auth: {
        user: UserType;
    };
    [key: string]: unknown;
}

export default function Pacientes() {
    const { pacientes, filters, auth } = usePage<PageProps>().props;
    const user = auth.user;
    
    // Verificar permisos del usuario
    const canViewDetails = RoleHelper.isMedico(user);
    const canDeletePatients = RoleHelper.hasPermission(user, 'eliminar_pacientes');
    const canEditPatients = RoleHelper.hasPermission(user, 'editar_pacientes');
    const canCreatePatients = RoleHelper.hasPermission(user, 'crear_pacientes');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.pag || 10);
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
                router.get(
                    '/pacientes',
                    { 
                        search: searchTerm || undefined,
                        pag: perPage 
                    },
                    {
                        preserveState: true,
                        replace: true,
                    },
                );
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filters?.search, perPage, isInitialLoad]);

    const handleEdit = (id: number) => {
        // Verificar permisos antes de editar
        if (!canEditPatients) {
            toast.error('No tienes permisos para editar pacientes');
            return;
        }
        
        const patient = pacientes.data.find((p) => p.id === id);
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
        // Verificar permisos antes de eliminar
        if (!canDeletePatients) {
            toast.error('No tienes permisos para eliminar pacientes');
            return;
        }
        
        const patient = pacientes.data.find((p) => p.id === id);
        if (patient) {
            setSelectedPatient(patient);
            setIsDeleteModalOpen(true);
        }
    };

    const handleViewDetails = (id: number) => {
        // Solo médicos pueden ver detalles
        if (!canViewDetails) {
            toast.error('No tienes permisos para ver los detalles del paciente');
            return;
        }
        router.visit(`/pacientes/${id}`);
    };

    const handleCreateSubmit = (formData: PacienteFormData) => {
        router.post('/pacientes', formData, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                toast.success('Paciente guardado correctamente');
            },
            onError: (errors) => {
                Object.values(errors).forEach((errorMessage) => {
                    toast.error(errorMessage as string);
                });
            },
        });
    };

    const handleEditSubmit = (formData: PacienteFormData) => {
        if (selectedPatient) {
            router.put(`/pacientes/${selectedPatient.id}`, formData, {
                preserveState: true,
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setSelectedPatient(null);
                    toast.success('Paciente editado correctamente');
                },
                onError: (errors) => {
                    Object.values(errors).forEach((errorMessage) => {
                        toast.error(errorMessage as string);
                    });
                },
            });
        }
    };

    const handleDeleteConfirm = () => {
        if (selectedPatient) {
            router.delete(`/pacientes/${selectedPatient.id}`, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedPatient(null);
                    toast.success('Paciente eliminado correctamente');
                },
                onError: () => {
                    toast.error('Error al eliminar el paciente');
                },
            });
        }
    };

    const handlePageChange = (url: string) => {
        router.get(
            url,
            { 
                search: searchTerm,
                pag: perPage 
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePerPageChange = (value: string) => {
        const newPerPage = parseInt(value);
        setPerPage(newPerPage);
        router.get(
            '/pacientes',
            { 
                search: searchTerm || undefined,
                pag: newPerPage 
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const getPatientFullName = (patient: Paciente) => {
        return `${patient.apellidos} ${patient.nombres}`;
    };

    // Componente de paginación reutilizable
    const PaginationComponent = () => (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Mostrar:</span>
                        <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                            <SelectTrigger className="w-20 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="15">15</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-600">por página</span>
                    </div>
                </div>
                
                {pacientes.last_page > 1 && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pacientes.prev_page_url && handlePageChange(pacientes.prev_page_url)}
                            disabled={!pacientes.prev_page_url}
                            className="border-gray-200 hover:bg-gray-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {pacientes.links.slice(1, -1).map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => link.url && handlePageChange(link.url)}
                                    disabled={!link.url}
                                    className={link.active 
                                        ? 'bg-blue-600 hover:bg-blue-700 border-blue-600' 
                                        : 'border-gray-200 hover:bg-gray-50'
                                    }
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
                            className="border-gray-200 hover:bg-gray-50"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pacientes" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header con título y botón nuevo */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Gestión de Pacientes</h1>
                                    <p className="text-blue-100">Sistema de registro médico</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <div className="text-2xl font-bold">{pacientes.total}</div>
                                <div className="text-blue-100 text-sm">Pacientes registrados</div>
                            </div>
                            {canCreatePatients && (
                                <Button 
                                    className="bg-white text-blue-600 hover:bg-blue-50 border-0 shadow-md flex items-center gap-2" 
                                    onClick={() => setIsCreateModalOpen(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    Nuevo Paciente
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Barra de búsqueda */}
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                        placeholder="Buscar por nombres, apellidos o DNI..."
                        className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Paginación superior */}
                <PaginationComponent />

                {/* Tabla de pacientes */}
                <div className="rounded-lg border bg-white shadow-sm">
                    {pacientes.data.length > 0 ? (
                        <>
                            {canViewDetails && (
                                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-sm text-blue-700 flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    <span>Haz clic en cualquier fila para ver el detalle completo del paciente</span>
                                </div>
                            )}
                            <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead className="w-[60px]">
                                        <User className="h-4 w-4 text-gray-500" />
                                    </TableHead>
                                    <TableHead className="font-semibold">Paciente</TableHead>
                                    <TableHead className="font-semibold">DNI</TableHead>
                                    <TableHead className="font-semibold">Edad</TableHead>
                                    <TableHead className="font-semibold">Género</TableHead>
                                    <TableHead className="font-semibold">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Teléfono
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Registro
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pacientes.data.map((paciente) => (
                                    <TableRow 
                                        key={paciente.id} 
                                        className={`hover:bg-blue-50/50 transition-colors ${canViewDetails ? 'cursor-pointer' : ''}`}
                                        onClick={canViewDetails ? () => handleViewDetails(paciente.id) : undefined}
                                    >
                                        <TableCell>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">
                                                {paciente.nombres.charAt(0)}{paciente.apellidos.charAt(0)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium text-gray-900">
                                                    {getPatientFullName(paciente)}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-700 inline-block">
                                                {paciente.dni}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    {paciente.edad} años
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {paciente.genero === 'Masculino' ? (
                                                    <>
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                            Masculino
                                                        </Badge>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                                                            Femenino
                                                        </Badge>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {paciente.telefono ? (
                                                <div className="text-sm text-gray-700">
                                                    {paciente.telefono}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-400 italic">
                                                    No registrado
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-600">
                                                {paciente.created_at 
                                                    ? new Date(paciente.created_at).toLocaleDateString('es-ES')
                                                    : 'N/A'
                                                }
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Botón Ver detalles - Solo médicos */}
                                                {canViewDetails && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewDetails(paciente.id);
                                                        }}
                                                        className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-300"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                )}
                                                
                                                {/* Botón Editar - Médicos y Secretarios */}
                                                {canEditPatients && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(paciente.id);
                                                        }}
                                                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300"
                                                        title="Editar paciente"
                                                    >
                                                        <Edit2 className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                )}
                                                
                                                {/* Botón Eliminar - Solo médicos */}
                                                {canDeletePatients && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(paciente.id);
                                                        }}
                                                        className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300"
                                                        title="Eliminar paciente"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </>
                    ) : (
                        <div className="py-16 text-center">
                            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <div className="text-gray-500 text-lg font-medium mb-2">
                                {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                            </div>
                            <div className="text-gray-400 text-sm">
                                {searchTerm 
                                    ? 'Intenta con otros términos de búsqueda'
                                    : 'Comienza agregando tu primer paciente'
                                }
                            </div>
                        </div>
                    )}
                </div>

                {/* Paginación inferior */}
                <PaginationComponent />

                {/* Modales - Solo mostrar si el usuario tiene permisos */}
                {canCreatePatients && (
                    <CreatePatientModal 
                        isOpen={isCreateModalOpen} 
                        onClose={() => setIsCreateModalOpen(false)} 
                        onSubmit={handleCreateSubmit} 
                    />
                )}

                {canEditPatients && (
                    <EditPatientModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setSelectedPatient(null);
                        }}
                        onSubmit={handleEditSubmit}
                        patient={selectedPatient}
                    />
                )}

                {canDeletePatients && (
                    <DeletePatientModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDeleteConfirm}
                        patientName={selectedPatient ? getPatientFullName(selectedPatient) : undefined}
                    />
                )}
            </div>
            <Toaster position="top-right" />
        </AppLayout>
    );
}
