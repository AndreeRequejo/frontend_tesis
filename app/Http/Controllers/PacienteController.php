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
            'edad' => 'required|integer|min:0|max:150',
            'genero' => 'required|in:Masculino,Femenino',
            'telefono' => 'nullable|string|max:15',
        ]);

        $paciente = Paciente::create($validated);

        return redirect()->route('pacientes.index')->with('success', 'Paciente creado exitosamente.');
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
            'edad' => 'required|integer|min:0|max:150',
            'genero' => 'required|in:Masculino,Femenino',
            'telefono' => 'nullable|string|max:15',
        ]);

        $paciente->update($validated);

        // Si la petición viene desde la página de detalle, devolver los datos actualizados
        if ($request->header('X-Inertia')) {
            return back()->with('success', 'Paciente actualizado exitosamente.');
        }

        return redirect()->route('pacientes.index')->with('success', 'Paciente actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Paciente $paciente)
    {
        $paciente->delete();

        return redirect()->route('pacientes.index')->with('success', 'Paciente eliminado exitosamente.');
    }
}
