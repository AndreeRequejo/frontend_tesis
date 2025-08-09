import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User, Phone } from 'lucide-react';

interface PatientCardProps {
    id: number;
    nombre: string;
    edad: number;
    genero?: string;
    dni?: string;
    telefono?: string;
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
    dni,
    telefono,
    ultimaEvaluacion, 
    showActions = false,
    onEdit,
    onDelete 
}: PatientCardProps) {
    if (showActions) {
        return (
            <div className='rounded-lg border p-4 shadow hover:shadow-md transition-shadow bg-white'>
                <div className='flex justify-between items-center'>
                    <Link 
                        href={`/pacientes/${id}`} 
                        className='flex-1 cursor-pointer'
                    >
                        <div className='flex items-center gap-2 mb-2'>
                            <User className='h-5 w-5 text-blue-600' />
                            <h3 className='text-lg font-semibold text-gray-900'>{nombre}</h3>
                        </div>
                        <div className='grid grid-cols-2 gap-2 text-sm text-gray-600'>
                            <div className='flex flex-col gap-1'>
                                {dni && <span>DNI: {dni}</span>}
                                <span>Edad: {edad} años</span>
                            </div>
                            <div className='flex flex-col gap-1'>
                                {genero && <span>Género: {genero}</span>}
                                {telefono && (
                                    <div className='flex items-center gap-1'>
                                        <Phone className='h-3 w-3' />
                                        <span>{telefono}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                    <div className='flex gap-2 ml-4 flex-shrink-0'>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                                e.preventDefault();
                                onEdit?.();
                            }}
                            className="h-8 w-8 hover:text-blue-500 hover:bg-blue-50 hover:border-blue-200"
                            title="Editar paciente"
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
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                            title="Eliminar paciente"
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
            className='block rounded-lg border p-4 shadow hover:shadow-md cursor-pointer transition-shadow bg-white'
        >
            <div className='flex items-center gap-2 mb-2'>
                <User className='h-5 w-5 text-blue-600' />
                <h3 className='text-lg font-semibold text-gray-900'>{nombre}</h3>
            </div>
            <div className='grid grid-cols-2 gap-2 text-sm text-gray-600'>
                <div className='flex flex-col gap-1'>
                    {dni && <span>DNI: {dni}</span>}
                    <span>Edad: {edad} años</span>
                </div>
                <div className='flex flex-col gap-1'>
                    {genero && <span>Género: {genero}</span>}
                    {telefono && (
                        <div className='flex items-center gap-1'>
                            <Phone className='h-3 w-3' />
                            <span>{telefono}</span>
                        </div>
                    )}
                </div>
            </div>
            {ultimaEvaluacion && (
                <div className='mt-2 pt-2 border-t text-sm text-gray-500'>
                    Última evaluación: {ultimaEvaluacion}
                </div>
            )}
        </Link>
    );
}
