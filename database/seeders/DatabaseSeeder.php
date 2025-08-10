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

        User::factory()->create([
            'name' => 'Andree Requejo',
            'email' => 'andree09requejo@gmail.com',
            'password' => bcrypt('159357An@'),
        ]);

        User::factory()->create([
            'name' => 'Elizabeth Guevara',
            'email' => 'elizabeth@gmail.com',
            'password' => bcrypt('123456'),
        ]);

        $this->call([
            PacienteSeeder::class,
            EvaluacionSeeder::class,
        ]);
    }
}
