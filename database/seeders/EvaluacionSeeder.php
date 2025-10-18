<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Evaluacion;
use App\Models\Imagen;
use App\Models\Paciente;

class EvaluacionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener algunos pacientes para asignarles evaluaciones
        $pacientes = Paciente::whereIn('dni', [
            '12345678', // Juan Carlos Pérez García
            '87654321', // María Elena González López
            '11223344', // Pedro Antonio Rodríguez Silva
            '55667788', // Ana Sofía Martínez Fernández
            '99887766', // Carlos Eduardo Vargas Mendoza
            '33445566', // Lucía Isabel Torres Ruiz
        ])->get();

        // Imagen por defecto en base64 (1x1 pixel transparente)
        $imagenDefault = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

        $evaluaciones = [
            [
                'paciente_dni' => '12345678',
                'clasificacion' => 'Moderado',
                'comentario' => 'Inflamación visible en la zona T con presencia de pápulas',
                'fecha' => '2025-08-08',
                'hora' => '15:33'
            ],
            [
                'paciente_dni' => '12345678',
                'clasificacion' => 'Severo',
                'comentario' => 'Acné quístico en la zona del mentón, requiere tratamiento especializado',
                'fecha' => '2025-08-01',
                'hora' => '10:15'
            ],
            [
                'paciente_dni' => '87654321',
                'clasificacion' => 'Leve',
                'comentario' => 'Comedones abiertos en zona frontal, tratamiento tópico recomendado',
                'fecha' => '2025-07-28',
                'hora' => '14:20'
            ],
        ];

        foreach ($evaluaciones as $evaluacionData) {
            $paciente = $pacientes->where('dni', $evaluacionData['paciente_dni'])->first();
            
            if ($paciente) {
                $evaluacion = Evaluacion::create([
                    'paciente_id' => $paciente->id,
                    'clasificacion' => $evaluacionData['clasificacion'],
                    'comentario' => $evaluacionData['comentario'],
                    'fecha' => $evaluacionData['fecha'],
                    'hora' => $evaluacionData['hora']
                ]);

                // Crear imágenes asociadas a la evaluación
                $numImagenes = 1;
                for ($i = 0; $i < $numImagenes; $i++) {
                    Imagen::create([
                        'evaluacion_id' => $evaluacion->id,
                        'contenido_base64' => $imagenDefault
                    ]);
                }
            }
        }
    }
}
