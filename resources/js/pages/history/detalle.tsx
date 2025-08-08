import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Trash2, Edit3 } from 'lucide-react';

interface DetalleProps {
    evaluacionId: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Historial clínico',
        href: '/historial',
    },
    {
        title: 'Detalle de Evaluación',
        href: '#',
    },
];

// Datos de ejemplo - estos vendrían de tu backend
const evaluacionData = {
    id: 1,
    paciente: {
        nombre: "Juan Pérez",
        edad: 25,
        genero: "Masculino"
    },
    fecha: "08/08/2025",
    hora: "15:33",
    severidad: "Moderado",
    comentarios: "Inflamación visible en la zona T",
    imagenes: [
        'https://dermacareclinica.com/wp-content/uploads/2021/10/Cicatrices-de-acne%CC%81-la-huella-de-la-adolsecencia-1-960x720.jpg',
        'https://static.wixstatic.com/media/3b9b14_8f3c4e5c6d7a4b5f8c9d0e1f2a3b4c5d~mv2.jpg',
        'https://example.com/imagen3.jpg'
    ]
};

const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
        case 'Leve':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'Moderado':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Severo':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const formatImageSrc = (imagen: string) => {
    // Si ya tiene el prefijo data:, lo devuelve tal como está
    if (imagen.startsWith('data:')) {
        return imagen;
    }
    // Si es una URL normal, la devuelve tal como está
    if (imagen.startsWith('http') || imagen.startsWith('/')) {
        return imagen;
    }
    // Si es base64 puro, le agrega el prefijo
    return `data:image/jpeg;base64,${imagen}`;
};

export default function DetalleEvaluacion({ evaluacionId }: DetalleProps) {
    const handleGoBack = () => {
        router.visit('/historial');
    };

    const handleGeneratePdf = () => {
        console.log('Generar PDF para evaluación:', evaluacionId);
        // Aquí implementarías la lógica para generar el PDF
    };

    const handleEdit = () => {
        console.log('Editar evaluación:', evaluacionId);
        // Aquí implementarías la lógica para editar
    };

    const handleDelete = () => {
        console.log('Eliminar evaluación:', evaluacionId);
        // Aquí implementarías la lógica para eliminar
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detalle de Evaluación" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                {/* Header con botón de regreso */}
                <div className="flex items-center gap-4">
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleGoBack}
                        className="flex-shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Detalle de Evaluación</h1>
                </div>

                <div className="grid gap-6">
                    {/* Información del paciente */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos del Paciente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-lg font-semibold">{evaluacionData.paciente.nombre}</p>
                                <p className="text-sm text-gray-600">
                                    {evaluacionData.paciente.edad} años • {evaluacionData.paciente.genero}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resultado de la evaluación */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Resultado</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">
                                    {evaluacionData.fecha} {evaluacionData.hora}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeveridadColor(evaluacionData.severidad)}`}>
                                {evaluacionData.severidad}
                            </span>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Imágenes de la evaluación */}
                            {evaluacionData.imagenes.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-3">Imágenes de la evaluación</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {evaluacionData.imagenes.map((imagen, index) => (
                                            <div 
                                                key={index}
                                                className="aspect-square rounded-lg bg-gray-100 overflow-hidden border"
                                            >
                                                <img 
                                                    src={formatImageSrc(imagen)} 
                                                    alt={`Evaluación ${index + 1}`}
                                                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Comentarios */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Comentarios</CardTitle>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleEdit}
                                className="flex items-center gap-2"
                            >
                                <Edit3 className="h-4 w-4" />
                                Editar
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 leading-relaxed">
                                {evaluacionData.comentarios}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between">
                        <Button 
                            onClick={handleGeneratePdf}
                            className="flex items-center gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            Generar PDF
                        </Button>
                        
                        <Button 
                            variant="destructive"
                            onClick={handleDelete}
                            className="flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
