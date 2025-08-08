import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface PatientCardProps {
    id: number;
    nombre: string;
    edad: number;
    genero?: string;
    ultimaEvaluacion?: string;
    showActions?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function PatientCard({ 
    id, 
    nombre, 
    edad, 
    genero,
    ultimaEvaluacion, 
    showActions = false,
    onEdit,
    onDelete 
}: PatientCardProps) {
    if (showActions) {
        return (
            <div className='rounded-lg border p-4 shadow hover:shadow-md transition-shadow'>
                <div className='flex justify-between items-start'>
                    <Link 
                        href={`/pacientes/${id}`} 
                        className='flex-1 cursor-pointer'
                    >
                        <h3 className='text-lg font-semibold pb-1'>{nombre}</h3>
                        <div className='flex flex-col'>
                            <span className='text-sm text-gray-600'>Edad: {edad} años</span>
                            {genero && <span className='text-sm text-gray-600'>Género: {genero}</span>}
                        </div>
                    </Link>
                    <div className='flex gap-2 ml-4'>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                                e.preventDefault();
                                onEdit?.();
                            }}
                            className="h-8 w-8"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                                e.preventDefault();
                                onDelete?.();
                            }}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link 
            href={`/pacientes/${id}`} 
            className='block rounded-lg border p-4 shadow hover:shadow-md cursor-pointer transition-shadow'
        >
            <h3 className='text-lg font-semibold pb-1'>{nombre}</h3>
            <div className='flex flex-col'>
                <span className='text-sm text-gray-600'>Edad: {edad} años</span>
                {ultimaEvaluacion && <span className='text-sm text-gray-600'>Última evaluación: {ultimaEvaluacion}</span>}
            </div>
        </Link>
    );
}
