import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Label, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Prueba',
        href: '/prueba',
    },
];

interface FilterEvaluacion {
    total: number;
    total_leve: number;
    total_moderada: number;
    total_severa: number;
}

interface PruebaProps {
    evaluacionesFiltro: FilterEvaluacion | null;
}

export default function Prueba({ evaluacionesFiltro }: PruebaProps) {
    const totalEvaluaciones = evaluacionesFiltro?.total || 0;
    const evaluacionesLeves = evaluacionesFiltro?.total_leve || 0;
    const evaluacionesModeradas = evaluacionesFiltro?.total_moderada || 0;
    const evaluacionesSeveras = evaluacionesFiltro?.total_severa || 0;

    const chartData = [
        { severity: 'Leve', evaluaciones: evaluacionesLeves, fill: 'var(--color-leve)' },
        { severity: 'Moderado', evaluaciones: evaluacionesModeradas, fill: 'var(--color-moderado)' },
        { severity: 'Severo', evaluaciones: evaluacionesSeveras, fill: 'var(--color-severo)' },
    ];

    const chartConfig = {
        evaluaciones: {
            label: 'Categorías de acné',
        },
        leve: {
            label: 'Leve',
            color: '#4285F4',
        },
        moderado: {
            label: 'Moderado',
            color: '#FBBC05',
        },
        severo: {
            label: 'Severo',
            color: '#EA4335',
        },
    } satisfies ChartConfig;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-4">
                <h1 className="mb-4 text-2xl font-bold">Página de Prueba</h1>

                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-0">
                        <CardTitle>Cantidad de Evaluaciones según Severidad</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                            <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie data={chartData} dataKey="evaluaciones" nameKey="severity" innerRadius={60} strokeWidth={5}>
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                return (
                                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                                            {totalEvaluaciones}
                                                        </tspan>
                                                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                                            Evaluaciones
                                                        </tspan>
                                                    </text>
                                                );
                                            }
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
