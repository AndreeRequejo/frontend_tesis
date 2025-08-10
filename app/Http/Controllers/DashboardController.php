<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use App\Models\Evaluacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Mostrar el dashboard con datos recientes
     */
    public function index(Request $request)
    {
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
            'pacientesRecientes' => $pacientesRecientes,
            'evaluacionesRecientes' => $evaluacionesRecientes,
            'limit' => $limit,
        ]);
    }
}
