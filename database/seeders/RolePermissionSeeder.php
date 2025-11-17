<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Resetear caché de permisos
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Crear permisos
        $permissions = [
            // Gestión de pacientes
            'pacientes',
            'crear_pacientes',
            'editar_pacientes',
            'ver_pacientes',
            'eliminar_pacientes',
            
            // Gestión de historiales médicos
            'historial',
            
            // Gestión de informes
            'reporte',
            
            // Gestión de evaluaciones
            'evaluacion',
            
            // Gestión de usuarios
            'usuarios',
            'crear_usuarios',
            'editar_usuarios',
            'eliminar_usuarios',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Crear roles
        $medicoRole = Role::create(['name' => 'medico']);
        $secretarioRole = Role::create(['name' => 'secretario']);
        $adminRole = Role::create(['name' => 'administrador']);

        // Asignar permisos al rol médico (acceso completo)
        $medicoRole->givePermissionTo([
            'pacientes',
            'crear_pacientes',
            'editar_pacientes',
            'ver_pacientes',
            'eliminar_pacientes',
            'historial',
            'reporte',
            'evaluacion',
        ]);

        // Asignar permisos limitados al secretario
        $secretarioRole->givePermissionTo([
            'pacientes',
            'crear_pacientes',
            'editar_pacientes',
        ]);

        // Asignar permisos al rol administrador
        $adminRole->givePermissionTo([
            'usuarios',
            'crear_usuarios',
            'editar_usuarios',
            'eliminar_usuarios',
        ]);
    }
}
