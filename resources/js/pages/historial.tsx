import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Historial clínico',
        href: '/historial',
    },
];

export default function Historial() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial clínico" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                
            </div>
        </AppLayout>
    );
}