<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
            'edad' => 'required|integer|min:11|max:40',
            'genero' => 'required|in:Masculino,Femenino',
            'telefono' => 'nullable|string|max:9|unique:paciente,telefono',
        ], [
            'dni.unique' => 'El DNI ingresado ya se encuentra registrado.',
            'edad.min' => 'La edad mínima es 11 años.',
            'edad.max' => 'La edad máxima es 40 años.',
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
            'edad' => 'required|integer|min:11|max:40',
            'genero' => 'required|in:Masculino,Femenino',
            'telefono' => 'nullable|string|max:9|unique:paciente,telefono,' . $paciente->id,
        ], [
            'dni.unique' => 'El DNI ingresado ya se encuentra registrado.',
            'telefono.unique' => 'El teléfono ingresado ya se encuentra registrado.',
            'edad.min' => 'La edad mínima es 11 años.',
            'edad.max' => 'La edad máxima es 40 años.',
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
     * Mostrar el reporte del paciente con sus evaluaciones
     */
    public function reporte($id)
    {
        $paciente = Paciente::with(['evaluaciones' => function($q) {
            $q->orderBy('fecha', 'desc');
        }])->findOrFail($id);

        // Si no tiene evaluaciones, mostrar solo el modal y no abrir el reporte
        if ($paciente->evaluaciones->isEmpty()) {
            return Inertia::render('reports/ReportePaciente', [
                'paciente' => [
                    'id' => $paciente->id,
                    'nombre' => $paciente->nombres,
                    'apellido' => $paciente->apellidos,
                    'edad' => $paciente->edad,
                    'genero' => $paciente->genero,
                    'telefono' => $paciente->telefono,
                    'dni' => $paciente->dni,
                ],
                'evaluaciones' => [],
                'showModalNoEvaluaciones' => true,
            ]);
        }

        // Formatear datos para el frontend
        $evaluaciones = $paciente->evaluaciones->map(function($ev) {
            return [
                'id' => $ev->id,
                'fecha' => $ev->fecha ? $ev->fecha->format('d/m/Y') : '',
                'resultado' => $ev->clasificacion,
                'comentario' => $ev->comentario,
                'imagenes' => $ev->imagenes->map(function($img) {
                    return 'data:image/jpeg;base64,' . $img->contenido_base64;
                })->toArray(),
            ];
        });

        return Inertia::render('reports/ReportePaciente', [
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
            'showModalNoEvaluaciones' => false,
        ]);
    }
}
