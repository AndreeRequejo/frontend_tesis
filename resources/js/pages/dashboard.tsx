import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Camera } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className='m-4 flex flex-col'>
                <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white shadow-lg">
                    <h2 className="mb-1 text-xl font-semibold">Bienvenido</h2>
                    <p className="mb-4 text-blue-100">Sistema de clasificación de gravedad de acné mediante IA</p>
                    <Button variant="secondary" className="w-full text-primary">
                        <Camera size={18} className="mr-2" />
                        Nueva Evaluación
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
