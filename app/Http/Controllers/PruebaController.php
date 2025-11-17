<?php

namespace App\Http\Controllers;

use App\Models\Evaluacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PruebaController extends Controller
{
    public function index()
    {
        // Obtener la cantidad de evaluaciones según la severididad de acne, es decir cuantas leves, moderadas y severas hay
        $evaluacionesFiltro = [
            'total' => Evaluacion::count(),
            'total_leve' => Evaluacion::where('clasificacion', 'Leve')->count(),
            'total_moderada' => Evaluacion::where('clasificacion', 'Moderado')->count(),
            'total_severa' => Evaluacion::where('clasificacion', 'Severo')->count(),
        ];

        return Inertia::render('prueba', [
            'evaluacionesFiltro' => $evaluacionesFiltro
        ]);
    }
}