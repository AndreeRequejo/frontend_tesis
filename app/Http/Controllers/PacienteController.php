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

        // Paginación
        $pacientes = $query->orderBy('created_at', 'desc')->paginate(6);

        return Inertia::render('patients/index', [
            'pacientes' => $pacientes,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'dni' => 'required|string|max:8|unique:paciente,dni',
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'edad' => 'required|integer|min:11|max:30',
            'genero' => 'required|in:Masculino,Femenino',
            'telefono' => 'nullable|string|max:9|unique:paciente,telefono',
        ], [
            'dni.unique' => 'El DNI ingresado ya se encuentra registrado.',
            'edad.min' => 'La edad mínima es 11 años.',
            'edad.max' => 'La edad máxima es 30 años.',
            'telefono.unique' => 'El teléfono ingresado ya se encuentra registrado.',
            'genero.required' => 'Seleccione el género del paciente.'
        ]);

        Paciente::create($validated);

        return redirect()->back()->with('success', 'Paciente creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Paciente $paciente)
    {
        return Inertia::render('patients/detalle', [
            'paciente' => $paciente->load(['evaluaciones.imagenPrincipal'])
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
            'edad.min' => 'La edad mínima es 11 años.',
            'edad.max' => 'La edad máxima es 30 años.',
            'genero.required' => 'Seleccione el género del paciente.'
        ]);

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
        $pdf->setPaper('A4', 'portrait');
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
