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
        $query = Paciente::query();

        // Obtener el total de pacientes registrados
        $totalPacientes = Paciente::count();

        // Si hay término de búsqueda, aplicar filtros y cargar todos los resultados
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombres', 'like', '%' . $search . '%')
                  ->orWhere('apellidos', 'like', '%' . $search . '%')
                  ->orWhere('dni', 'like', '%' . $search . '%');
            });
            
            // Obtener todos los pacientes que coincidan con la búsqueda
            $pacientes = $query->orderBy('created_at', 'desc')->get();
        } else {
            // Si no hay búsqueda, cargar solo los 5 más recientes
            $pacientes = $query->orderBy('created_at', 'desc')->take(5)->get();
        }

        // Si se pasa un paciente_id, buscarlo para preseleccionarlo
        $pacienteSeleccionado = null;
        if ($request->has('paciente_id')) {
            $pacienteSeleccionado = Paciente::find($request->paciente_id);
        }

        return Inertia::render('evaluation/index', [
            'pacientes' => $pacientes,
            'totalPacientes' => $totalPacientes,
            'pacienteSeleccionado' => $pacienteSeleccionado,
            'filters' => $request->only(['search'])
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

            // Crear las imágenes asociadas — comprimir al momento de guardar
            foreach ($request->imagenes as $imagenBase64) {
                // La función comprimirImagen maneja la eliminación del prefijo data:image/...;base64,
                // y devuelve la cadena base64 del JPEG comprimido.
                $imagenComprimida = $this->comprimirImagen($imagenBase64);

                Imagen::create([
                    'evaluacion_id' => $evaluacion->id,
                    // Guardamos la imagen ya comprimida (base64 sin prefijo)
                    'contenido_base64' => $imagenComprimida
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
     * Comprimir imagen manteniendo la calidad adecuada para predicción
     */
    private function comprimirImagen($imagenBase64, $calidadJpeg = 85, $maxWidth = 800, $maxHeight = 600)
    {
        try {
            // Decodificar la imagen base64
            $imageData = base64_decode(preg_replace('/^data:image\/[^;]+;base64,/', '', $imagenBase64));
            
            // Crear imagen desde string
            $image = imagecreatefromstring($imageData);
            if (!$image) {
                throw new \Exception('No se pudo crear la imagen desde los datos base64');
            }
            
            // Obtener dimensiones originales
            $originalWidth = imagesx($image);
            $originalHeight = imagesy($image);
            
            // Calcular nuevas dimensiones manteniendo la proporción
            $ratio = min($maxWidth / $originalWidth, $maxHeight / $originalHeight);
            
            // Solo redimensionar si la imagen es más grande que los límites
            if ($ratio < 1) {
                $newWidth = (int)($originalWidth * $ratio);
                $newHeight = (int)($originalHeight * $ratio);
                
                // Crear nueva imagen redimensionada
                $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
                
                // Mantener transparencia para PNG
                imagealphablending($resizedImage, false);
                imagesavealpha($resizedImage, true);
                
                // Redimensionar
                imagecopyresampled(
                    $resizedImage, $image,
                    0, 0, 0, 0,
                    $newWidth, $newHeight,
                    $originalWidth, $originalHeight
                );
                
                imagedestroy($image);
                $image = $resizedImage;
            }
            
            // Comprimir y convertir a JPEG
            ob_start();
            imagejpeg($image, null, $calidadJpeg);
            $compressedData = ob_get_contents();
            ob_end_clean();
            
            // Limpiar memoria
            imagedestroy($image);
            
            return base64_encode($compressedData);
            
        } catch (\Exception $e) {
            Log::error('Error al comprimir imagen: ' . $e->getMessage());
            // Si falla la compresión, retornar la imagen original
            return preg_replace('/^data:image\/[^;]+;base64,/', '', $imagenBase64);
        }
    }

    /**
     * Predicción para una sola imagen
     */
    private function predecirImagen($imagenBase64, $backendUrl)
    {
        try {
            // Base64 sin el prefijo data:image
            $imagen = preg_replace('/^data:image\/[^;]+;base64,/', '', $imagenBase64);

            // Convertir base64 a archivo temporal
            $imageData = base64_decode($imagen);
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
                // Base64 sin el prefijo data:image
                $imagen = preg_replace('/^data:image\/[^;]+;base64,/', '', $imagenBase64);

                $imageData = base64_decode($imagen);
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
