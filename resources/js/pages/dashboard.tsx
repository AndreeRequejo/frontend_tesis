import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Camera, Users, Shield, UserCog, Activity } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { PatientCard } from '@/components/paciente-card';
import { EvaluacionCard } from '@/components/evaluacion-card';
import { DetalleEvaluacionModal } from '@/pages/history/detalle-evaluacion-modal';
import { useState } from 'react';
import { RoleHelper, User } from '@/lib/roleHelper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface UsuarioReciente {
    id: number;
    name: string;
    email: string;
    rol: string;
    created_at: string;
}

interface DashboardProps {
    isAdmin?: boolean;
    totalUsuarios?: number;
    usuariosPorRol?: Record<string, number>;
    usuariosRecientes?: UsuarioReciente[];
    pacientesRecientes?: PacienteReciente[];
    evaluacionesRecientes?: EvaluacionReciente[];
    limit?: number;
    auth: {
        user: User;
    };
}

export default function Dashboard({ 
    isAdmin = false,
    totalUsuarios,
    usuariosPorRol,
    usuariosRecientes,
    pacientesRecientes = [], 
    evaluacionesRecientes = [], 
    auth 
}: DashboardProps) {
    const user = auth.user;
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvaluacionId, setSelectedEvaluacionId] = useState<number | null>(null);

    // Verificar roles del usuario
    const isMedico = RoleHelper.isMedico(user);
    const isAdministrador = RoleHelper.isAdministrador(user);

    const handleViewDetails = (evaluacionId: number) => {
        setSelectedEvaluacionId(evaluacionId);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEvaluacionId(null);
    };

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName.toLowerCase()) {
            case 'administrador':
                return 'bg-red-100 text-red-800';
            case 'medico':
                return 'bg-blue-100 text-blue-800';
            case 'secretario':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Vista para administradores
    if (isAdministrador && isAdmin) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard - Administrador" />
                <div className='m-4 flex flex-col gap-3'>
                    {/* Header Administrador */}
                    <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white shadow-lg">
                        <h2 className="mb-1 text-xl font-semibold flex items-center gap-2">
                            <Shield className="h-6 w-6" />
                            Bienvenido Administrador {user.name}
                        </h2>
                        <p className="mb-4 text-blue-100">Gestiona los usuarios y roles del sistema</p>
                        <Button asChild variant="secondary" className="w-full text-primary">
                            <Link href="/usuarios">
                                <UserCog size={18} className="mr-2" />
                                Gestionar usuarios
                            </Link>
                        </Button>
                    </div>

                    {/* Estadísticas de usuarios */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="bg-white shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Usuarios</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold text-blue-600">{totalUsuarios}</div>
                                    <Users className="h-8 w-8 text-blue-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-500">Médicos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold text-blue-600">{usuariosPorRol?.medico || 0}</div>
                                    <Activity className="h-8 w-8 text-blue-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-500">Secretarios</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold text-green-600">{usuariosPorRol?.secretario || 0}</div>
                                    <Users className="h-8 w-8 text-green-500 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Usuarios recientes */}
                    <div className="rounded-lg border bg-white p-4 shadow-sm">
                        <h3 className="mb-3 text-lg font-semibold text-gray-800">Usuarios Recientes</h3>
                        <div className="space-y-3">
                            {usuariosRecientes && usuariosRecientes.length > 0 ? (
                                usuariosRecientes.map((usuario) => (
                                    <div key={usuario.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                <Shield className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{usuario.name}</p>
                                                <p className="text-sm text-gray-500">{usuario.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(usuario.rol)}`}>
                                                {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
                                            </span>
                                            <p className="mt-1 text-xs text-gray-500">{usuario.created_at}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">No hay usuarios recientes</p>
                            )}
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Vista para médicos y secretarios
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className='m-4 flex flex-col gap-3'>
                {/* Header diferente según el rol */}
                {isMedico ? (
                    <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white shadow-lg">
                        <h2 className="mb-1 text-xl font-semibold">Bienvenido Dr. {user.name}</h2>
                        <p className="mb-4 text-blue-100">Evalúa la gravedad del acné mediante una imagen facial</p>
                        <Button asChild variant="secondary" className="w-full text-primary">
                            <Link href="/evaluacion">
                                <Camera size={18} className="mr-2" />
                                Nueva evaluación
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white shadow-lg">
                        <h2 className="mb-1 text-xl font-semibold">Bienvenido {user.name}</h2>
                        <p className="mb-4 text-green-100">Gestiona el registro y datos de pacientes</p>
                        <Button asChild variant="secondary" className="w-full text-primary">
                            <Link href="/pacientes">
                                <Users size={18} className="mr-2" />
                                Gestionar pacientes
                            </Link>
                        </Button>
                    </div>
                )}
                <div className='flex flex-col gap-4'>
                    {/* Sección de pacientes recientes - visible para ambos roles */}
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

                    {/* Sección de evaluaciones recientes - solo para médicos */}
                    {isMedico && (
                        <>
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
                        </>
                    )}
                </div>

                {/* Modal de detalle de evaluación - solo para médicos */}
                {isMedico && (
                    <DetalleEvaluacionModal
                        isOpen={modalOpen}
                        onClose={handleCloseModal}
                        evaluacionId={selectedEvaluacionId}
                        showPatientInfo={false}
                        showActions={true}
                    />
                )}
            </div>
        </AppLayout>
    );
}
