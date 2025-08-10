<?php

namespace App\Http\Controllers;

use App\Models\Evaluacion;
use App\Models\Paciente;
use App\Models\Imagen;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class EvaluacionController extends Controller
{
    /**
     * Mostrar la página principal de evaluaciones
     */
    public function index()
    {
        return Inertia::render('evaluation/index');
    }

    /**
     * Crear una nueva evaluación
     */
    public function store(Request $request)
    {
        $request->validate([
            'paciente_id' => 'required|exists:paciente,id',
            'clasificacion' => 'required|in:Ausente,Leve,Moderado,Severo',
            'comentario' => 'nullable|string',
            'imagenes' => 'required|array|min:1|max:3',
            'imagenes.*' => 'required|string' // Base64 strings
        ]);

        try {
            DB::beginTransaction();

            // Crear la evaluación
            $evaluacion = Evaluacion::create([
                'paciente_id' => $request->paciente_id,
                'clasificacion' => $request->clasificacion,
                'comentario' => $request->comentario,
                'fecha' => now()->toDateString(),
                'hora' => now()->toTimeString(),
            ]);

            // Crear las imágenes asociadas
            foreach ($request->imagenes as $imagenBase64) {
                // Remover el prefijo data:image si existe
                $imagenBase64 = preg_replace('/^data:image\/[^;]+;base64,/', '', $imagenBase64);
                
                Imagen::create([
                    'evaluacion_id' => $evaluacion->id,
                    'contenido_base64' => $imagenBase64
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Evaluación creada exitosamente',
                'evaluacion' => $evaluacion->load(['paciente', 'imagenes'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Error al crear la evaluación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar una evaluación específica
     */
    public function show($id)
    {
        $evaluacion = Evaluacion::with(['paciente', 'imagenes'])
            ->findOrFail($id);

        $data = [
            'id' => $evaluacion->id,
            'paciente' => [
                'id' => $evaluacion->paciente->id,
                'nombre' => $evaluacion->paciente->nombre_completo,
                'dni' => $evaluacion->paciente->dni,
                'edad' => $evaluacion->paciente->edad,
                'genero' => $evaluacion->paciente->genero,
                'telefono' => $evaluacion->paciente->telefono,
            ],
            'fecha' => $evaluacion->fecha->format('d/m/Y'),
            'hora' => $evaluacion->hora->format('H:i'),
            'clasificacion' => $evaluacion->clasificacion,
            'comentario' => $evaluacion->comentario,
            'imagenes' => $evaluacion->imagenes->map(function ($imagen) {
                return [
                    'id' => $imagen->id,
                    'url' => 'data:image/jpeg;base64,' . $imagen->contenido_base64
                ];
            })->toArray()
        ];

        return response()->json($data);
    }

    /**
     * Actualizar una evaluación existente
     */
    public function update(Request $request, $id)
    {
        $evaluacion = Evaluacion::findOrFail($id);

        $request->validate([
            'clasificacion' => 'required|in:Ausente,Leve,Moderado,Severo',
            'comentario' => 'nullable|string',
        ]);

        $evaluacion->update([
            'clasificacion' => $request->clasificacion,
            'comentario' => $request->comentario,
        ]);

        return response()->json([
            'message' => 'Evaluación actualizada exitosamente',
            'evaluacion' => $evaluacion->load(['paciente', 'imagenes'])
        ]);
    }

    /**
     * Eliminar una evaluación
     */
    public function destroy($id)
    {
        $evaluacion = Evaluacion::findOrFail($id);
        
        // Las imágenes se eliminarán automáticamente por la cascade
        $evaluacion->delete();

        return response()->json([
            'message' => 'Evaluación eliminada exitosamente'
        ]);
    }

    /**
     * Obtener estadísticas de evaluaciones
     */
    public function estadisticas()
    {
        $totalEvaluaciones = Evaluacion::count();
        
        $estadisticasPorSeveridad = Evaluacion::select('clasificacion', DB::raw('count(*) as total'))
            ->groupBy('clasificacion')
            ->get()
            ->pluck('total', 'clasificacion');

        $evaluacionesRecientes = Evaluacion::with('paciente')
            ->orderBy('fecha', 'desc')
            ->orderBy('hora', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($evaluacion) {
                return [
                    'id' => $evaluacion->id,
                    'paciente' => $evaluacion->paciente->nombre_completo,
                    'fecha' => $evaluacion->fecha->format('d/m/Y'),
                    'clasificacion' => $evaluacion->clasificacion
                ];
            });

        return response()->json([
            'total_evaluaciones' => $totalEvaluaciones,
            'por_severidad' => $estadisticasPorSeveridad,
            'recientes' => $evaluacionesRecientes
        ]);
    }

    /**
     * Buscar evaluaciones por criterios específicos
     */
    public function buscar(Request $request)
    {
        $query = Evaluacion::with(['paciente', 'imagenPrincipal']);

        // Filtrar por paciente
        if ($request->filled('paciente_id')) {
            $query->where('paciente_id', $request->paciente_id);
        }

        // Filtrar por clasificación
        if ($request->filled('clasificacion')) {
            $query->where('clasificacion', $request->clasificacion);
        }

        // Filtrar por rango de fechas
        if ($request->filled('fecha_inicio')) {
            $query->whereDate('fecha', '>=', $request->fecha_inicio);
        }

        if ($request->filled('fecha_fin')) {
            $query->whereDate('fecha', '<=', $request->fecha_fin);
        }

        // Buscar por texto en comentarios
        if ($request->filled('texto')) {
            $query->where('comentario', 'like', '%' . $request->texto . '%');
        }

        $evaluaciones = $query->orderBy('fecha', 'desc')
            ->orderBy('hora', 'desc')
            ->paginate(10);

        return response()->json($evaluaciones);
    }
}
