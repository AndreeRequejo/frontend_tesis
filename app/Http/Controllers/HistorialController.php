<?php

namespace App\Http\Controllers;

use App\Models\Evaluacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HistorialController extends Controller
{
    /**
     * Mostrar el historial de evaluaciones con paginación, búsqueda y filtros
     */
    public function index(Request $request)
    {
        $query = Evaluacion::with(['paciente', 'imagenPrincipal']);

        // Búsqueda por nombre del paciente
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->whereHas('paciente', function ($q) use ($search) {
                $q->where('nombres', 'like', "%{$search}%")
                  ->orWhere('apellidos', 'like', "%{$search}%");
            });
        }

        // Filtro por severidad
        if ($request->filled('severidad') && $request->get('severidad') !== 'all') {
            $query->where('clasificacion', $request->get('severidad'));
        }

        // Ordenar por fecha y hora más reciente
        $query->orderBy('fecha', 'desc')->orderBy('hora', 'desc');

        // Paginación con parámetro personalizado 'pag'
        $perPage = $request->input('pag', 10); // Default 10 elementos por página
        
        // Validar que el valor esté dentro de los valores permitidos
        $allowedPerPage = [5, 10, 15, 25, 50];
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 10;
        }
        
        $evaluaciones = $query->paginate($perPage)->withQueryString();

        // Transformar los datos para el frontend
        $evaluaciones->getCollection()->transform(function ($evaluacion) {
            return [
                'id' => $evaluacion->id,
                'pacienteNombre' => $evaluacion->paciente->nombre_completo,
                'fecha' => $evaluacion->fecha->format('d/m/Y'),
                'hora' => $evaluacion->hora->format('H:i'),
                'severidad' => $evaluacion->clasificacion,
                'descripcion' => $evaluacion->comentario ?? 'Sin comentarios',
                'imagen' => $evaluacion->imagenPrincipal 
                    ? 'data:image/jpeg;base64,' . $evaluacion->imagenPrincipal->contenido_base64
                    : null
            ];
        });

        return Inertia::render('history/index', [
            'evaluaciones' => $evaluaciones,
            'filters' => [
                'search' => $request->get('search'),
                'severidad' => $request->get('severidad'),
                'pag' => $perPage,
            ]
        ]);
    }

    /**
     * Mostrar el detalle de una evaluación específica
     */
    public function show(Request $request, $id)
    {
        $evaluacion = Evaluacion::with(['paciente', 'imagenes'])
            ->findOrFail($id);

        $data = [
            'id' => $evaluacion->id,
            'paciente' => [
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
                return 'data:image/jpeg;base64,' . $imagen->contenido_base64;
            })->toArray()
        ];

        // Si es una petición AJAX, devolver JSON para el modal
        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'props' => [
                    'evaluacion' => $data
                ]
            ]);
        }

        // Si es una petición normal, devolver la vista Inertia
        return Inertia::render('history/detalle', [
            'evaluacion' => $data
        ]);
    }
}
