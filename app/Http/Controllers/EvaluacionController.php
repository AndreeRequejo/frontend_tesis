<?php

namespace App\Http\Controllers;

use App\Models\Evaluacion;
use App\Models\Paciente;
use App\Models\Imagen;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EvaluacionController extends Controller
{
    /**
     * Mostrar la página principal de evaluaciones
     */
    public function index(Request $request)
    {
        // Obtener solo los 5 últimos pacientes registrados
        $pacientes = Paciente::orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Si se pasa un paciente_id, buscarlo para preseleccionarlo
        $pacienteSeleccionado = null;
        if ($request->has('paciente_id')) {
            $pacienteSeleccionado = Paciente::find($request->paciente_id);
        }

        return Inertia::render('evaluation/index', [
            'pacientes' => $pacientes,
            'pacienteSeleccionado' => $pacienteSeleccionado
        ]);
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
            'imagenes.*' => 'required|string', // Base64 strings
            // Campos opcionales para predicción automática
            'es_prediccion_automatica' => 'nullable|boolean',
            'confianza' => 'nullable|numeric|between:0,1',
            'tiempo_procesamiento' => 'nullable|numeric',
            'probabilidades' => 'nullable|array'
        ]);

        try {
            DB::beginTransaction();

            // Preparar datos de la evaluación
            $evaluacionData = [
                'paciente_id' => $request->paciente_id,
                'clasificacion' => $request->clasificacion,
                'comentario' => $request->comentario,
                'fecha' => now()->toDateString(),
                'hora' => now()->toTimeString(),
                'confianza' => $request->confianza,
                'tiempo_procesamiento' => $request->tiempo_procesamiento,
                'probabilidades' => $request->probabilidades ? json_encode($request->probabilidades) : null
            ];

            // Crear la evaluación
            $evaluacion = Evaluacion::create($evaluacionData);

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

            // Retornar redirección de Inertia en lugar de JSON
            return redirect()->route('historial')
                ->with('success', 'Evaluación guardada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear evaluación: ' . $e->getMessage());

            // Retornar con errores en lugar de JSON
            return redirect()->back()
                ->withErrors(['general' => 'Error al guardar la evaluación: ' . $e->getMessage()])
                ->withInput();
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
                    'url' => 'data:image/jpg;base64,' . $imagen->contenido_base64
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

        return redirect()->back()->with('success', 'Evaluación actualizada exitosamente');
    }

    /**
     * Eliminar una evaluación
     */
    public function destroy($id)
    {
        $evaluacion = Evaluacion::findOrFail($id);

        // Las imágenes se eliminarán automáticamente por la cascade
        $evaluacion->delete();

        return redirect()->route('historial')->with('success', 'Evaluación eliminada exitosamente');
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

    /**
     * Evaluar imagen(es) usando la API de predicción
     */
    public function predecir(Request $request)
    {
        $request->validate([
            'paciente_id' => 'required|exists:paciente,id',
            'imagenes' => 'required|array|min:1|max:3',
            'imagenes.*' => 'required|string' // Base64 strings
        ]);

        try {
            $paciente = Paciente::findOrFail($request->paciente_id);
            $imagenes = $request->imagenes;
            $backendUrl = config('app.backend_url');

            // Determinar si usar predicción simple o batch
            if (count($imagenes) === 1) {
                // Predicción simple
                $resultado = $this->predecirImagen($imagenes[0], $backendUrl);
            } else {
                // Predicción batch
                $resultado = $this->predecirImagenes($imagenes, $backendUrl);
            }

            if (!$resultado['success']) {
                // Extraer el mensaje de detail del JSON de error si existe
                $errorMessage = $resultado['message'];
                try {
                    // Si el mensaje contiene JSON, intentar extraer el detail
                    if (strpos($errorMessage, 'Error en la API de predicción:') === 0) {
                        $jsonPart = str_replace('Error en la API de predicción: ', '', $errorMessage);
                        $errorData = json_decode($jsonPart, true);
                        if (isset($errorData['detail'])) {
                            $errorMessage = $errorData['detail'];
                        }
                    }
                } catch (\Exception $e) {
                    // Si no se puede parsear, usar el mensaje original
                }

                return redirect()->back()->withErrors([
                    'prediccion' => $errorMessage
                ]);
            }

            // Preparar datos para la vista de resultados
            $resultadoConPaciente = [
                'success' => true,
                'paciente' => [
                    'id' => $paciente->id,
                    'nombre' => $paciente->nombres . ' ' . $paciente->apellidos,
                    'dni' => $paciente->dni,
                    'edad' => $paciente->edad,
                    'genero' => $paciente->genero
                ],
                'imagenes' => $imagenes,
                'prediccion' => $resultado['data'],
                'fecha_evaluacion' => now()->toDateTimeString()
            ];

            return Inertia::render('evaluation/prediction', $resultadoConPaciente);

        } catch (\Exception $e) {
            Log::error('Error en predicción: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'prediccion' => 'Error interno del servidor: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Predicción para una sola imagen
     */
    private function predecirImagen($imagenBase64, $backendUrl)
    {
        try {
            // Convertir base64 a archivo temporal
            $imageData = base64_decode(preg_replace('/^data:image\/[^;]+;base64,/', '', $imagenBase64));
            $tempFile = tempnam(sys_get_temp_dir(), 'prediction_') . '.jpg';
            file_put_contents($tempFile, $imageData);

            $response = Http::timeout(60)
                ->attach('file', file_get_contents($tempFile), 'image.jpg')
                ->post($backendUrl . '/predict');

            // Limpiar archivo temporal
            unlink($tempFile);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            } else {
                Log::error('Error en API de predicción: ' . $response->body());
                return [
                    'success' => false,
                    'message' => 'Error en la API de predicción: ' . $response->body()
                ];
            }
        } catch (\Exception $e) {
            Log::error('Error en predicción simple: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al procesar la imagen: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Predicción para múltiples imágenes (batch)
     */
    private function predecirImagenes($imagenesBase64, $backendUrl)
    {
        try {
            $request = Http::timeout(60);
            $tempFiles = [];

            // Convertir cada imagen base64 a archivo temporal
            foreach ($imagenesBase64 as $index => $imagenBase64) {
                $imageData = base64_decode(preg_replace('/^data:image\/[^;]+;base64,/', '', $imagenBase64));
                $tempFile = tempnam(sys_get_temp_dir(), 'batch_prediction_' . $index . '_') . '.jpg';
                file_put_contents($tempFile, $imageData);
                $tempFiles[] = $tempFile;

                $request->attach('files', file_get_contents($tempFile), 'image_' . $index . '.jpg');
            }

            $response = $request->post($backendUrl . '/predict/batch');

            // Limpiar archivos temporales
            foreach ($tempFiles as $tempFile) {
                if (file_exists($tempFile)) {
                    unlink($tempFile);
                }
            }

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            } else {
                Log::error('Error en API de predicción batch: ' . $response->body());
                return [
                    'success' => false,
                    'message' => 'Error en la API de predicción batch: ' . $response->body()
                ];
            }
        } catch (\Exception $e) {
            Log::error('Error en predicción batch: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error al procesar las imágenes: ' . $e->getMessage()
            ];
        }
    }
}
