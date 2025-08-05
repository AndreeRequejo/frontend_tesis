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
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* <div className="from-medical-blue to-medical-indigo rounded-lg bg-gradient-to-r p-5 text-white shadow-lg">
                    <h2 className="mb-1 text-xl font-semibold">Bienvenido</h2>
                    <p className="mb-4 text-blue-100">Sistema de clasificación de gravedad de acné mediante IA</p>
                    <button className="text-medical-blue w-full bg-white hover:bg-blue-50">
                        <Camera size={18} className="mr-2" />
                        Nueva Evaluación
                    </button>
                </div> */}
            </div>
        </AppLayout>
    );
}
