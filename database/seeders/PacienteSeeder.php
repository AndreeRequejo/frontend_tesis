<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Paciente;

class PacienteSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $pacientes = [
            [
                'dni' => '12345678',
                'nombres' => 'JUAN CARLOS',
                'apellidos' => 'PÉREZ GARCÍA',
                'edad' => 25,
                'genero' => 'Masculino',
                'telefono' => '987654321'
            ],
            [
                'dni' => '87654321',
                'nombres' => 'MARÍA ELENA',
                'apellidos' => 'GONZÁLEZ LÓPEZ',
                'edad' => 30,
                'genero' => 'Femenino',
                'telefono' => '912345678'
            ],
            [
                'dni' => '11223344',
                'nombres' => 'PEDRO ANTONIO',
                'apellidos' => 'RODRÍGUEZ SILVA',
                'edad' => 45,
                'genero' => 'Masculino',
                'telefono' => '998877665'
            ],
            [
                'dni' => '55667788',
                'nombres' => 'ANA SOFÍA',
                'apellidos' => 'MARTÍNEZ FERNÁNDEZ',
                'edad' => 28,
                'genero' => 'Femenino',
                'telefono' => '966554433'
            ],
            [
                'dni' => '99887766',
                'nombres' => 'CARLOS EDUARDO',
                'apellidos' => 'VARGAS MENDOZA',
                'edad' => 35,
                'genero' => 'Masculino',
                'telefono' => '944332211'
            ],
        ];

        foreach ($pacientes as $paciente) {
            Paciente::firstOrCreate(
                ['dni' => $paciente['dni']],
                $paciente
            );
        }
    }
}
