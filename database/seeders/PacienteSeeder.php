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
                'nombres' => 'Juan Carlos',
                'apellidos' => 'Pérez García',
                'edad' => 25,
                'genero' => 'Masculino',
                'telefono' => '987654321'
            ],
            [
                'dni' => '87654321',
                'nombres' => 'María Elena',
                'apellidos' => 'González López',
                'edad' => 30,
                'genero' => 'Femenino',
                'telefono' => '912345678'
            ],
            [
                'dni' => '11223344',
                'nombres' => 'Pedro Antonio',
                'apellidos' => 'Rodríguez Silva',
                'edad' => 45,
                'genero' => 'Masculino',
                'telefono' => '998877665'
            ],
            [
                'dni' => '55667788',
                'nombres' => 'Ana Sofía',
                'apellidos' => 'Martínez Fernández',
                'edad' => 28,
                'genero' => 'Femenino',
                'telefono' => '966554433'
            ],
            [
                'dni' => '99887766',
                'nombres' => 'Carlos Eduardo',
                'apellidos' => 'Vargas Mendoza',
                'edad' => 35,
                'genero' => 'Masculino',
                'telefono' => '944332211'
            ],
            [
                'dni' => '33445566',
                'nombres' => 'Lucía Isabel',
                'apellidos' => 'Torres Ruiz',
                'edad' => 22,
                'genero' => 'Femenino',
                'telefono' => null
            ],
            [
                'dni' => '77889900',
                'nombres' => 'Roberto Miguel',
                'apellidos' => 'Castillo Herrera',
                'edad' => 55,
                'genero' => 'Masculino',
                'telefono' => '977665544'
            ],
            [
                'dni' => '22334455',
                'nombres' => 'Carmen Rosa',
                'apellidos' => 'Jiménez Paredes',
                'edad' => 42,
                'genero' => 'Femenino',
                'telefono' => '955443322'
            ],
            [
                'dni' => '66778899',
                'nombres' => 'Fernando José',
                'apellidos' => 'Morales Vega',
                'edad' => 38,
                'genero' => 'Masculino',
                'telefono' => '933221100'
            ],
            [
                'dni' => '44556677',
                'nombres' => 'Patricia Elena',
                'apellidos' => 'Ramírez Castro',
                'edad' => 33,
                'genero' => 'Femenino',
                'telefono' => '911223344'
            ],
            [
                'dni' => '88990011',
                'nombres' => 'Diego Alejandro',
                'apellidos' => 'Gutiérrez Flores',
                'edad' => 29,
                'genero' => 'Masculino',
                'telefono' => '988776655'
            ],
            [
                'dni' => '55443322',
                'nombres' => 'Gabriela Cristina',
                'apellidos' => 'Salinas Rojas',
                'edad' => 26,
                'genero' => 'Femenino',
                'telefono' => '966554477'
            ]
        ];

        foreach ($pacientes as $paciente) {
            Paciente::firstOrCreate(
                ['dni' => $paciente['dni']],
                $paciente
            );
        }
    }
}
