import { Link } from '@inertiajs/react';

interface EvaluacionCardProps {
    id: number;
    pacienteNombre: string;
    fecha: string;
    hora: string;
    severidad: 'Leve' | 'Moderado' | 'Severo';
    descripcion: string;
    imagen?: string;
}

const getSeveridadColor = (severidad: string) => {
    switch (severidad) {
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
    imagen 
}: EvaluacionCardProps) {
    return (
        <Link 
            href={`/evaluacion/${id}`} 
            className='block rounded-lg border p-4 shadow hover:shadow-md cursor-pointer transition-shadow bg-white'
        >
            <div className='flex items-start justify-between mb-2'>
                <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900'>{pacienteNombre}</h3>
                    <p className='text-sm text-gray-500'>{fecha} {hora}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeveridadColor(severidad)}`}>
                    {severidad}
                </span>
            </div>
            
            <div className='flex gap-3 items-center'>
                {imagen && (
                    <div className='w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden'>
                        <img 
                            src={formatImageSrc(imagen)} 
                            alt={`Evaluación de ${pacienteNombre}`}
                            className='w-full h-full object-cover'
                        />
                    </div>
                )}
                <div className='flex-1'>
                    <p className='text-sm text-gray-600 line-clamp-2'>{descripcion}</p>
                </div>
            </div>
        </Link>
    );
}
