import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Prueba',
        href: '/prueba',
    },
];

export default function Prueba() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Página de Prueba</h1>
            <p>Esta es una página de prueba para verificar la configuración del proyecto.</p>
        </div>
        </AppLayout>
    );
}