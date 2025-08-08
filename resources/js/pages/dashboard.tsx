import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { PatientCard } from '@/components/paciente-card';
import { EvaluacionCard } from '@/components/evaluacion-card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inicio',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className='m-4 flex flex-col gap-3'>
                <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white shadow-lg">
                    <h2 className="mb-1 text-xl font-semibold">Bienvenido</h2>
                    <p className="mb-4 text-blue-100">Sistema de clasificación de gravedad de acné mediante IA</p>
                    <Button variant="secondary" className="w-full text-primary">
                        <Camera size={18} className="mr-2" />
                        Nueva Evaluación
                    </Button>
                </div>
                <div className='flex flex-col gap-4'>
                    <div className='flex flex-row items-center justify-between'>
                        <h2 className="text-lg font-semibold">Pacientes recientes</h2>
                        <Button asChild variant="ghost">
                            <Link href="/pacientes">Ver todos</Link>
                        </Button>
                    </div>
                    { /* Contenido de pacientes recientes */ }
                    <PatientCard 
                        id={1}
                        nombre="Juan Perez"
                        edad={25}
                        ultimaEvaluacion="2023-10-01"
                    />

                    { /* Contenido de evaluaciones recientes */ }
                    <div className='flex flex-row items-center justify-between mt-6'>
                        <h2 className="text-lg font-semibold">Evaluaciones recientes</h2>
                        <Button asChild variant="ghost">
                            <Link href="/evaluaciones">Ver todas</Link>
                        </Button>
                    </div>
                    
                    <EvaluacionCard 
                        id={1}
                        pacienteNombre="Juan Pérez"
                        fecha="08/08/2025"
                        hora="15:33"
                        severidad="Moderado"
                        imagen='https://dermacareclinica.com/wp-content/uploads/2021/10/Cicatrices-de-acne%CC%81-la-huella-de-la-adolsecencia-1-960x720.jpg'
                        descripcion="Inflamación severa"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
