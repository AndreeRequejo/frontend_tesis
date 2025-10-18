<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Primero crear roles y permisos
        $this->call([
            RolePermissionSeeder::class,
        ]);

        // Crear usuarios específicos y asignar roles
        $andree = User::factory()->create([
            'name' => 'Andree Requejo',
            'email' => 'andree09requejo@gmail.com',
            'password' => bcrypt('159357An@'),
        ]);
        $andree->assignRole('medico'); // Asignar rol de médico

        $elizabeth = User::factory()->create([
            'name' => 'Elizabeth Guevara',
            'email' => 'elizabeth@gmail.com',
            'password' => bcrypt('123456'),
        ]);
        $elizabeth->assignRole('medico'); // Asignar rol de médico

        $secretaria = User::factory()->create([
            'name' => 'Maria Gonzales',
            'email' => 'maria@gmail.com',
            'password' => bcrypt('1234'),
        ]);
        $secretaria->assignRole('secretario'); // Asignar rol de secretaria

        // Ejecutar otros seeders
        $this->call([
            PacienteSeeder::class,
            EvaluacionSeeder::class,
        ]);
    }
}
