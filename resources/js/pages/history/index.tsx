import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { EvaluacionCard } from '@/components/evaluacion-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DetalleEvaluacionModal } from '@/components/detalle-evaluacion-modal';
import { 
    Search, 
    Filter, 
    ChevronLeft, 
    ChevronRight, 
    FileText,
    Activity,
    Eye
} from 'lucide-react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Historial de evaluaciones',
        href: '/historial',
    },
];

interface Evaluacion {
    id: number;
    pacienteNombre: string;
    fecha: string;
    hora: string;
    severidad: 'Leve' | 'Moderado' | 'Severo';
    descripcion: string;
    imagen?: string;
}

interface Filters {
    search?: string;
    severidad?: string;
    pag?: number;
}

interface Props {
    evaluaciones: {
        data: Evaluacion[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: Filters;
}

export default function HistoryIndex({ evaluaciones, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSeveridad, setSelectedSeveridad] = useState(filters.severidad || 'all');
    const [perPage, setPerPage] = useState(filters.pag || 10);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvaluacionId, setSelectedEvaluacionId] = useState<number | null>(null);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        router.get('/historial', { 
            search: value,
            severidad: selectedSeveridad === 'all' ? undefined : selectedSeveridad,
            pag: perPage
        }, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const handleFilterBySeverity = (value: string) => {
        setSelectedSeveridad(value);
        router.get('/historial', { 
            search: searchTerm,
            severidad: value === 'all' ? undefined : value,
            pag: perPage
        }, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const handlePerPageChange = (value: string) => {
        const newPerPage = parseInt(value);
        setPerPage(newPerPage);
        router.get('/historial', { 
            search: searchTerm,
            severidad: selectedSeveridad === 'all' ? undefined : selectedSeveridad,
            pag: newPerPage
        }, { 
            preserveState: true,
            replace: true 
        });
    };

    const handlePageChange = (url: string) => {
        if (url) {
            router.get(url, {
                search: searchTerm,
                severidad: selectedSeveridad === 'all' ? undefined : selectedSeveridad,
                pag: perPage
            }, { preserveState: true });
        }
    };

    const handleViewDetails = (evaluacionId: number) => {
        setSelectedEvaluacionId(evaluacionId);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedEvaluacionId(null);
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
                    <div className="text-sm text-gray-600">
                        Total: <span className="font-medium">{evaluaciones.total}</span> evaluaciones
                    </div>
                </div>
                
                {evaluaciones.last_page > 1 && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => evaluaciones.prev_page_url && handlePageChange(evaluaciones.prev_page_url)}
                            disabled={!evaluaciones.prev_page_url}
                            className="border-gray-200 hover:bg-gray-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                        </Button>

                        <div className="flex items-center gap-1">
                            {evaluaciones.links.slice(1, -1).map((link, index) => (
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
                            onClick={() => evaluaciones.next_page_url && handlePageChange(evaluaciones.next_page_url)}
                            disabled={!evaluaciones.next_page_url}
                            className="border-gray-200 hover:bg-gray-50"
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* Header moderno */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Historial de Evaluaciones</h1>
                                    <p className="text-blue-100">Registro completo de evaluaciones médicas</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <div className="text-2xl font-bold">{evaluaciones.total}</div>
                                <div className="text-blue-100 text-sm">Evaluaciones registradas</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                        {/* Barra de búsqueda */}
                        <div className="relative w-full sm:flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Buscar por paciente..."
                                className="pl-10 w-full border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        {/* Filtro por severidad */}
                        <div className="flex items-center w-full sm:w-auto">
                            <Select value={selectedSeveridad} onValueChange={handleFilterBySeverity}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-gray-500" />
                                        <SelectValue placeholder="Filtrar por severidad" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todo</SelectItem>
                                    <SelectItem value="Leve">Leve</SelectItem>
                                    <SelectItem value="Moderado">Moderado</SelectItem>
                                    <SelectItem value="Severo">Severo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Paginación superior */}
                <PaginationComponent />

                {/* Lista de evaluaciones */}
                <div className="bg-white rounded-lg border shadow-sm">
                    {evaluaciones.data.length > 0 ? (
                        <>
                            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-sm text-blue-700 flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span>Haz clic en cualquier evaluación para ver los detalles completos</span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {evaluaciones.data.map((evaluacion) => (
                                    <div
                                        key={evaluacion.id}
                                        className="p-4 hover:bg-blue-50/50 transition-colors cursor-pointer"
                                        onClick={() => handleViewDetails(evaluacion.id)}
                                    >
                                        <EvaluacionCard
                                            id={evaluacion.id}
                                            pacienteNombre={evaluacion.pacienteNombre}
                                            fecha={evaluacion.fecha}
                                            hora={evaluacion.hora}
                                            severidad={evaluacion.severidad}
                                            descripcion={evaluacion.descripcion}
                                            imagen={evaluacion.imagen}
                                            onViewDetails={() => handleViewDetails(evaluacion.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="py-16 text-center">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <div className="text-gray-500 text-lg font-medium mb-2">
                                {searchTerm || selectedSeveridad !== 'all' 
                                    ? 'No se encontraron evaluaciones' 
                                    : 'No hay evaluaciones registradas'
                                }
                            </div>
                            <div className="text-gray-400 text-sm">
                                {searchTerm || selectedSeveridad !== 'all'
                                    ? 'Intenta con otros términos de búsqueda o filtros'
                                    : 'Las evaluaciones aparecerán aquí una vez que se registren'
                                }
                            </div>
                        </div>
                    )}
                </div>

                {/* Paginación inferior */}
                <PaginationComponent />

                {/* Modal de detalle */}
                <DetalleEvaluacionModal
                    isOpen={modalOpen}
                    onClose={handleCloseModal}
                    evaluacionId={selectedEvaluacionId}
                    showPatientInfo={true}
                    showActions={true}
                />
            </div>
            <Toaster position="top-right" />
        </AppLayout>
    );
}
