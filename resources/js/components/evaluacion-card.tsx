import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { FileText } from 'lucide-react';

interface EvaluacionCardProps {
    id: number;
    pacienteNombre: string;
    fecha: string;
    hora: string;
    severidad: 'Ausente' | 'Leve' | 'Moderado' | 'Severo';
    descripcion: string;
    imagen?: string;
}

const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
        case 'Ausente':
            return 'bg-gray-100 text-gray-800';
        case 'Leve':
            return 'bg-green-100 text-green-800';
        case 'Moderado':
            return 'bg-yellow-100 text-yellow-800';
        case 'Severo':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const formatImageSrc = (imagen: string) => {
    // Si la imagen está vacía o es null/undefined, retornar null
    if (!imagen || imagen.trim() === '') {
        return null;
    }
    
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

export function EvaluacionCard({
    id,
    pacienteNombre,
    fecha,
    hora,
    severidad,
    descripcion,
    imagen,
}: EvaluacionCardProps) {

    return (
        <Link href={`/evaluacion/${id}`} className="block cursor-pointer rounded-lg border bg-white p-4 shadow transition-shadow hover:shadow-md">
            <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{pacienteNombre}</h3>
                    <p className="text-sm text-gray-500">
                        {fecha} {hora}
                    </p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getSeveridadColor(severidad)}`}>{severidad}</span>
            </div>

            <div className="flex items-center gap-3">
                {imagen ? (
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <img src={formatImageSrc(imagen)!} alt={`Evaluación de ${pacienteNombre}`} className="h-full w-full object-cover" />
                    </div>
                ) : (
                    <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                )}
                <div className="flex-1">
                    <p className="line-clamp-2 text-sm text-gray-600">{descripcion}</p>
                </div>
            </div>
        </Link>
    );
}
