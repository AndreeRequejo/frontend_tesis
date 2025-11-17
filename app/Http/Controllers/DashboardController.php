<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use App\Models\Evaluacion;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Mostrar el dashboard con datos recientes
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Si el usuario es administrador, mostrar estadísticas de usuarios
        if ($user->hasRole('administrador')) {
            $totalUsuarios = User::count();
            $usuariosPorRol = User::with('roles')
                ->get()
                ->groupBy(function($usuario) {
                    return $usuario->roles->first()->name ?? 'sin_rol';
                })
                ->map(function($usuarios) {
                    return $usuarios->count();
                });
            
            $usuariosRecientes = User::with('roles')
                ->latest('created_at')
                ->limit(5)
                ->get()
                ->map(function($usuario) {
                    return [
                        'id' => $usuario->getKey(),
                        'name' => $usuario->name,
                        'email' => $usuario->email,
                        'rol' => $usuario->roles->first()->name ?? 'sin_rol',
                        'created_at' => $usuario->created_at->format('d/m/Y'),
                    ];
                });
            
            return Inertia::render('dashboard', [
                'isAdmin' => true,
                'totalUsuarios' => $totalUsuarios,
                'usuariosPorRol' => $usuariosPorRol,
                'usuariosRecientes' => $usuariosRecientes,
            ]);
        }
        
        // Para médicos y secretarios, mostrar datos de pacientes
        // Número de elementos recientes a mostrar (configurable)
        $limit = $request->get('limit', 2);

        // Obtener pacientes recientes (ordenados por fecha de creación)
        $pacientesRecientes = Paciente::with(['evaluaciones' => function($query) {
                $query->latest('fecha')->latest('hora');
            }])
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(function ($paciente) {
                // Obtener la última evaluación del paciente
                $ultimaEvaluacion = $paciente->evaluaciones->first();
                
                return [
                    'id' => $paciente->id,
                    'nombre' => $paciente->nombre_completo,
                    'edad' => $paciente->edad,
                    'ultimaEvaluacion' => $ultimaEvaluacion ? $ultimaEvaluacion->fecha->format('Y-m-d') : null,
                ];
            });

        // Obtener evaluaciones recientes (ordenadas por fecha y hora)
        $evaluacionesRecientes = Evaluacion::with(['paciente', 'imagenPrincipal'])
            ->latest('fecha')
            ->latest('hora')
            ->limit($limit)
            ->get()
            ->map(function ($evaluacion) {
                $imagen = $evaluacion->imagenPrincipal;
                
                return [
                    'id' => $evaluacion->id,
                    'pacienteNombre' => $evaluacion->paciente->nombre_completo,
                    'fecha' => $evaluacion->fecha->format('d/m/Y'),
                    'hora' => $evaluacion->hora->format('H:i'),
                    'severidad' => $evaluacion->clasificacion,
                    'imagen' => $imagen ? $imagen->contenido_base64 : null,
                    'descripcion' => $evaluacion->comentario ?? 'Sin comentarios',
                ];
            });

        return Inertia::render('dashboard', [
            'isAdmin' => false,
            'pacientesRecientes' => $pacientesRecientes,
            'evaluacionesRecientes' => $evaluacionesRecientes,
            'limit' => $limit,
        ]);
    }
}
