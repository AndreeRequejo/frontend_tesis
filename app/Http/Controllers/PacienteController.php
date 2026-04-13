<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class PacienteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Paciente::query();

        // Búsqueda
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombres', 'like', "%{$search}%")
                  ->orWhere('apellidos', 'like', "%{$search}%")
                  ->orWhere('dni', 'like', "%{$search}%");
            });
        }

        // Paginación con parámetro personalizado 'pag'
        $perPage = $request->input('pag', 10); // Default 10 elementos por página
        
        // Validar que el valor esté dentro de los valores permitidos
        $allowedPerPage = [5, 10, 15, 25, 50];
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 10;
        }
        
        $pacientes = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return Inertia::render('patients/index', [
            'pacientes' => $pacientes,
            'filters' => $request->only(['search', 'pag'])
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'dni' => 'required|string|min:8|max:8|unique:paciente,dni',
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'edad' => 'required|integer|min:11|max:30',
            'genero' => 'required|in:Masculino,Femenino',
            'telefono' => 'nullable|string|min:9|max:9|unique:paciente,telefono',
        ], [
            'dni.min' => 'El DNI debe tener al menos 8 caracteres.',
            'dni.unique' => 'El DNI ingresado ya se encuentra registrado.',
            'edad.required' => 'La edad es obligatoria.',
            'edad.min' => 'La edad mínima es 11 años.',
            'edad.max' => 'La edad máxima es 30 años.',
            'telefono.unique' => 'El teléfono ingresado ya se encuentra registrado.',
            'telefono.min' => 'El teléfono debe tener al menos 9 caracteres.',
            'genero.required' => 'Seleccione el género del paciente.'
        ]);

        // Si el teléfono está vacío, establecerlo como null
        if (empty($validated['telefono'])) {
            $validated['telefono'] = null;
        }

        // Convertir nombres y apellidos a mayúsculas
        $validated['nombres'] = strtoupper($validated['nombres']);
        $validated['apellidos'] = strtoupper($validated['apellidos']);

        Paciente::create($validated);

        return redirect()->back()->with('success', 'Paciente creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Paciente $paciente)
    {
        return Inertia::render('patients/detalle-patient', [
            'paciente' => $paciente->load([
                'evaluaciones' => function ($q) {
                    $q->orderByDesc('fecha')->orderByDesc('hora');
                },
                'evaluaciones.imagenPrincipal',
                'evaluaciones.imagenes',
            ])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Paciente $paciente)
    {
        $validated = $request->validate([
            'dni' => 'required|string|max:8|unique:paciente,dni,' . $paciente->id,
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'edad' => 'required|integer|min:11|max:30',
            'genero' => 'required|in:Masculino,Femenino',
            'telefono' => 'nullable|string|max:9|unique:paciente,telefono,' . $paciente->id,
        ], [
            'dni.unique' => 'El DNI ingresado ya se encuentra registrado.',
            'telefono.unique' => 'El teléfono ingresado ya se encuentra registrado.',
            'edad.required' => 'La edad es obligatoria.',
            'edad.min' => 'La edad mínima es 11 años.',
            'edad.max' => 'La edad máxima es 30 años.',
            'genero.required' => 'Seleccione el género del paciente.'
        ]);

        // Si el teléfono está vacío, establecerlo como null
        if (empty($validated['telefono'])) {
            $validated['telefono'] = null;
        }

        // Convertir nombres y apellidos a mayúsculas
        $validated['nombres'] = strtoupper($validated['nombres']);
        $validated['apellidos'] = strtoupper($validated['apellidos']);

        $paciente->update($validated);

        // Si la petición viene desde la página de detalle, devolver los datos actualizados
        if ($request->header('X-Inertia')) {
            return back()->with('success', 'Paciente actualizado exitosamente.');
        }

        return redirect()->back()->with('success', 'Paciente actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Paciente $paciente)
    {
        // Verificar si el paciente tiene evaluaciones
        $evaluacionesCount = $paciente->evaluaciones()->count();
        
        if ($evaluacionesCount > 0) {
            return redirect()->back()->withErrors([
                'delete' => "No se puede eliminar el paciente porque tiene {$evaluacionesCount} evaluación(es) registrada(s). Debe eliminar las evaluaciones primero."
            ]);
        }

        $paciente->delete();

        return redirect()->back()->with('success', 'Paciente eliminado exitosamente.');
    }

    /**
     * Generar y descargar el reporte PDF del paciente
     */
    public function reporte($id)
    {
        $paciente = Paciente::with(['evaluaciones' => function($q) {
            $q->orderBy('fecha', 'desc');
        }])->findOrFail($id);

        // Si no tiene evaluaciones, redirigir con mensaje de error
        if ($paciente->evaluaciones->isEmpty()) {
            return redirect()->back()->with('error', 'Este paciente no tiene evaluaciones registradas.');
        }

        // Formatear datos para la vista
        $evaluaciones = $paciente->evaluaciones->map(function($ev) {
            return [
                'id' => $ev->id,
                'fecha' => $ev->fecha ? $ev->fecha->format('d/m/Y') : '',
                'resultado' => $ev->clasificacion,
                'comentario' => $ev->comentario,
                'imagenes' => $ev->imagenes->map(function($img) {
                    $mimeType = $this->detectMimeType($img->contenido_base64);
                    return "data:{$mimeType};base64," . $img->contenido_base64;
                })->toArray(),
            ];
        });

        $datos = [
            'paciente' => [
                'id' => $paciente->id,
                'nombre' => $paciente->nombres,
                'apellido' => $paciente->apellidos,
                'edad' => $paciente->edad,
                'genero' => $paciente->genero,
                'telefono' => $paciente->telefono,
                'dni' => $paciente->dni,
            ],
            'evaluaciones' => $evaluaciones,
        ];

        // Generar PDF
        $pdf = Pdf::loadView('reports.reporte-paciente', $datos);
        
        // Configuraciones del PDF
        $pdf->setPaper('A4', 'landscape');
        $pdf->setOptions([
            'defaultFont' => 'Arial',
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => true
        ]);

        // Nombre del archivo
        $nombreArchivo = 'REPORTE_PACIENTE_' . strtoupper($paciente->nombres) . '_' . strtoupper($paciente->apellidos) . '.pdf';

        // Descargar el PDF
        return $pdf->download($nombreArchivo);
    }

    /**
     * Generar reporte comparativo entre las 2 últimas evaluaciones del paciente.
     */
    public function reporteComparativo(Request $request, $id)
    {
        $paciente = Paciente::findOrFail($id);

        $ultimasEvaluaciones = $paciente->evaluaciones()
            ->with('imagenes')
            ->orderByDesc('fecha')
            ->orderByDesc('hora')
            ->take(2)
            ->get();

        if ($ultimasEvaluaciones->count() < 2) {
            return response()->json([
                'message' => 'Se requieren al menos 2 evaluaciones para generar el reporte comparativo.',
            ], 422);
        }

        $validated = $request->validate([
            'evaluacion_ids' => 'required|array|size:2',
            'evaluacion_ids.*' => 'required|integer|distinct',
            'imagenes_por_evaluacion' => 'required|array',
        ]);

        $latestEvaluationIds = $ultimasEvaluaciones->pluck('id')->map(fn ($value) => (int) $value)->toArray();
        sort($latestEvaluationIds);

        $requestedEvaluationIds = collect($validated['evaluacion_ids'])->map(fn ($value) => (int) $value)->toArray();
        sort($requestedEvaluationIds);

        if ($latestEvaluationIds !== $requestedEvaluationIds) {
            return response()->json([
                'message' => 'Solo se permite comparar las 2 últimas evaluaciones registradas.',
            ], 422);
        }

        foreach ($ultimasEvaluaciones as $evaluacion) {
            $selectedImageIds = $validated['imagenes_por_evaluacion'][(string) $evaluacion->id] ?? [];

            if (!is_array($selectedImageIds)) {
                return response()->json([
                    'message' => 'Formato inválido en la selección de imágenes.',
                ], 422);
            }

            $selectedImageIds = collect($selectedImageIds)->map(fn ($value) => (int) $value)->unique()->values();

            if ($selectedImageIds->count() < 1 || $selectedImageIds->count() > 3) {
                return response()->json([
                    'message' => 'Debes seleccionar entre 1 y 3 imágenes por evaluación.',
                ], 422);
            }

            $availableImageIds = $evaluacion->imagenes->pluck('id')->map(fn ($value) => (int) $value);
            $invalidImageIds = $selectedImageIds->diff($availableImageIds);

            if ($invalidImageIds->isNotEmpty()) {
                return response()->json([
                    'message' => 'La selección contiene imágenes que no pertenecen a las evaluaciones comparadas.',
                ], 422);
            }
        }

        $evaluaciones = $ultimasEvaluaciones->map(function ($ev) use ($validated) {
            $selectedImageIds = collect($validated['imagenes_por_evaluacion'][(string) $ev->id] ?? [])
                ->map(fn ($value) => (int) $value)
                ->values();

            $imagenesSeleccionadas = $ev->imagenes
                ->whereIn('id', $selectedImageIds)
                ->sortBy(function ($img) use ($selectedImageIds) {
                    return $selectedImageIds->search((int) $img->id);
                })
                ->map(function ($img) {
                    $mimeType = $this->detectMimeType($img->contenido_base64);
                    return [
                        'id' => $img->id,
                        'src' => "data:{$mimeType};base64," . $img->contenido_base64,
                    ];
                })
                ->values()
                ->toArray();

            return [
                'id' => $ev->id,
                'fecha' => $ev->fecha ? $ev->fecha->format('d/m/Y') : '',
                'hora' => $ev->hora ? date('H:i', strtotime($ev->hora)) : '',
                'resultado' => $ev->clasificacion,
                'comentario' => $ev->comentario,
                'imagenes' => $imagenesSeleccionadas,
            ];
        })->values()->toArray();

        $datos = [
            'paciente' => [
                'id' => $paciente->id,
                'nombre' => $paciente->nombres,
                'apellido' => $paciente->apellidos,
                'edad' => $paciente->edad,
                'genero' => $paciente->genero,
                'telefono' => $paciente->telefono,
                'dni' => $paciente->dni,
            ],
            'evaluacion_actual' => $evaluaciones[0],
            'evaluacion_anterior' => $evaluaciones[1],
        ];

        $pdf = Pdf::loadView('reports.reporte-comparativo-paciente', $datos);

        $pdf->setPaper('A4', 'landscape');
        $pdf->setOptions([
            'defaultFont' => 'Arial',
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => true,
        ]);

        $nombreArchivo = 'REPORTE_COMPARATIVO_' . strtoupper($paciente->nombres) . '_' . strtoupper($paciente->apellidos) . '.pdf';

        return $pdf->download($nombreArchivo);
    }

    /**
     * Detecta el tipo MIME de una imagen basándose en su contenido base64
     */
    private function detectMimeType($base64Content)
    {
        // Decodificar el contenido base64 para obtener los primeros bytes
        $imageData = base64_decode($base64Content);
        
        // Obtener información de la imagen
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->buffer($imageData);
        
        // Validar que sea una imagen válida
        $validMimeTypes = [
            'image/jpeg' => 'image/jpeg',
            'image/jpg' => 'image/jpeg',
            'image/png' => 'image/png',
            'image/gif' => 'image/gif',
            'image/webp' => 'image/webp',
            'image/bmp' => 'image/bmp'
        ];
        
        return isset($validMimeTypes[$mimeType]) ? $validMimeTypes[$mimeType] : 'image/png';
    }
}
