import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { EvaluacionCard } from '@/components/evaluacion-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Historial clínico',
        href: '/historial',
    },
];

// Datos de ejemplo - estos vendrían de tu backend
const evaluacionesData = [
    {
        id: 1,
        pacienteNombre: "Juan Pérez",
        fecha: "08/08/2025",
        hora: "15:33",
        severidad: "Moderado" as const,
        descripcion: "Inflamación visible en la zona T",
        imagen: 'https://dermacareclinica.com/wp-content/uploads/2021/10/Cicatrices-de-acne%CC%81-la-huella-de-la-adolsecencia-1-960x720.jpg'
    },
    {
        id: 2,
        pacienteNombre: "Juan Pérez",
        fecha: "01/08/2025",
        hora: "15:33",
        severidad: "Severo" as const,
        descripcion: "Acné quístico en la zona del mentón",
        imagen: 'https://dermacareclinica.com/wp-content/uploads/2021/10/Cicatrices-de-acne%CC%81-la-huella-de-la-adolsecencia-1-960x720.jpg'
    },
    {
        id: 3,
        pacienteNombre: "María González",
        fecha: "28/07/2025",
        hora: "14:20",
        severidad: "Leve" as const,
        descripcion: "Comedones abiertos en zona frontal",
        imagen: 'https://dermacareclinica.com/wp-content/uploads/2021/10/Cicatrices-de-acne%CC%81-la-huella-de-la-adolsecencia-1-960x720.jpg'
    },
    {
        id: 4,
        pacienteNombre: "Carlos Rodríguez",
        fecha: "25/07/2025",
        hora: "10:15",
        severidad: "Moderado" as const,
        descripcion: "Pápulas inflamatorias en mejillas",
        imagen: 'https://dermacareclinica.com/wp-content/uploads/2021/10/Cicatrices-de-acne%CC%81-la-huella-de-la-adolsecencia-1-960x720.jpg'
    },
    {
        id: 5,
        pacienteNombre: "Ana Torres",
        fecha: "22/07/2025",
        hora: "16:45",
        severidad: "Leve" as const,
        descripcion: "Comedones cerrados dispersos",
        imagen: 'https://dermacareclinica.com/wp-content/uploads/2021/10/Cicatrices-de-acne%CC%81-la-huella-de-la-adolsecencia-1-960x720.jpg'
    }
];

export default function Historial() {
    const handleGeneratePdf = (evaluacionId: number) => {
        console.log('Generar PDF para evaluación:', evaluacionId);
        // Aquí implementarías la lógica para generar el PDF
    };

    const handleSearch = (searchTerm: string) => {
        console.log('Buscar:', searchTerm);
        // Aquí implementarías la lógica de búsqueda
    };

    const handleFilterBySeverity = (severidad: string) => {
        console.log('Filtrar por severidad:', severidad);
        // Aquí implementarías la lógica de filtrado
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial clínico" />
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
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    {/* Filtro por severidad */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <Select onValueChange={handleFilterBySeverity}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filtrar por severidad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las severidades</SelectItem>
                                <SelectItem value="Leve">Leve</SelectItem>
                                <SelectItem value="Moderado">Moderado</SelectItem>
                                <SelectItem value="Severo">Severo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Lista de evaluaciones */}
                <div className="grid gap-4">
                    {evaluacionesData.map((evaluacion) => (
                        <EvaluacionCard
                            key={evaluacion.id}
                            id={evaluacion.id}
                            pacienteNombre={evaluacion.pacienteNombre}
                            fecha={evaluacion.fecha}
                            hora={evaluacion.hora}
                            severidad={evaluacion.severidad}
                            descripcion={evaluacion.descripcion}
                            imagen={evaluacion.imagen}
                            showPdfButton={true}
                            onGeneratePdf={() => handleGeneratePdf(evaluacion.id)}
                        />
                    ))}
                </div>

                {/* Paginación */}
                <div className="flex justify-center mt-6">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>
                            Anterior
                        </Button>
                        <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                            1
                        </Button>
                        <Button variant="outline" size="sm">
                            2
                        </Button>
                        <Button variant="outline" size="sm">
                            3
                        </Button>
                        <Button variant="outline" size="sm">
                            Siguiente
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}