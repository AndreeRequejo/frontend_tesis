import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { EvaluacionCard } from '@/components/evaluacion-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
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
    severidad: 'Ausente' | 'Leve' | 'Moderado' | 'Severo';
    descripcion: string;
    imagen: string;
}

interface PaginatedData {
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
}

interface Props {
    evaluaciones: PaginatedData;
    filters: {
        search?: string;
        severidad?: string;
    };
}

export default function Historial({ evaluaciones, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSeveridad, setSelectedSeveridad] = useState(filters.severidad || 'all');

    // ...función PDF eliminada...

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        router.get('/historial', { 
            search: value,
            severidad: selectedSeveridad === 'all' ? undefined : selectedSeveridad 
        }, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const handleFilterBySeverity = (value: string) => {
        setSelectedSeveridad(value);
        router.get('/historial', { 
            search: searchTerm,
            severidad: value === 'all' ? undefined : value 
        }, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const handlePageChange = (url: string) => {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold">Historial de Evaluaciones</h1>
                </div>

                {/* Filtros y búsqueda */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Barra de búsqueda */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Buscar por paciente..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    {/* Filtro por severidad */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <Select value={selectedSeveridad} onValueChange={handleFilterBySeverity}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filtrar por severidad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las severidades</SelectItem>
                                <SelectItem value="Ausente">Ausente</SelectItem>
                                <SelectItem value="Leve">Leve</SelectItem>
                                <SelectItem value="Moderado">Moderado</SelectItem>
                                <SelectItem value="Severo">Severo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Lista de evaluaciones */}
                <div className="grid gap-4">
                    {evaluaciones.data.map((evaluacion) => (
                        <EvaluacionCard
                            key={evaluacion.id}
                            id={evaluacion.id}
                            pacienteNombre={evaluacion.pacienteNombre}
                            fecha={evaluacion.fecha}
                            hora={evaluacion.hora}
                            severidad={evaluacion.severidad}
                            descripcion={evaluacion.descripcion}
                            imagen={evaluacion.imagen}
                            // ...sin PDF...
                            // ...sin PDF...
                        />
                    ))}
                </div>

                {/* Mostrar mensaje si no hay evaluaciones */}
                {evaluaciones.data.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No se encontraron evaluaciones.</p>
                    </div>
                )}

                {/* Paginación */}
                {evaluaciones.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                            Mostrando {evaluaciones.from} a {evaluaciones.to} de {evaluaciones.total} resultados
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => evaluaciones.prev_page_url && handlePageChange(evaluaciones.prev_page_url)}
                                disabled={!evaluaciones.prev_page_url}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex items-center gap-1">
                                {evaluaciones.links.slice(1, -1).map((link, index) => (
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
                                onClick={() => evaluaciones.next_page_url && handlePageChange(evaluaciones.next_page_url)}
                                disabled={!evaluaciones.next_page_url}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <Toaster position="top-right" />
        </AppLayout>
    );
}
