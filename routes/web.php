<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\HistorialController;
use App\Http\Controllers\EvaluacionController;

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Rutas de pacientes
    Route::resource('pacientes', PacienteController::class)->names([
        'index' => 'pacientes.index',
        'store' => 'pacientes.store',
        'show' => 'pacientes.show',
        'update' => 'pacientes.update',
        'destroy' => 'pacientes.destroy',
    ])->except(['create', 'edit']);

    // Rutas del historial
    Route::get('historial', [HistorialController::class, 'index'])->name('historial');
    Route::get('historial/{id}', [HistorialController::class, 'show'])->name('historial.detalle');
    Route::post('historial/{id}/pdf', [HistorialController::class, 'generarPdf'])->name('historial.pdf');

    // Rutas de evaluaciones
    Route::get('evaluacion', [EvaluacionController::class, 'index'])->name('evaluacion');
    Route::post('evaluaciones', [EvaluacionController::class, 'store'])->name('evaluaciones.store');
    Route::get('evaluaciones/{id}', [EvaluacionController::class, 'show'])->name('evaluaciones.show');
    Route::put('evaluaciones/{id}', [EvaluacionController::class, 'update'])->name('evaluaciones.update');
    Route::delete('evaluaciones/{id}', [EvaluacionController::class, 'destroy'])->name('evaluaciones.destroy');
    Route::get('evaluaciones/estadisticas/general', [EvaluacionController::class, 'estadisticas'])->name('evaluaciones.estadisticas');
    Route::get('evaluaciones/buscar/avanzada', [EvaluacionController::class, 'buscar'])->name('evaluaciones.buscar');

    Route::get('evaluacion/{id}', function ($id) {
        return Inertia::render('history/detalle', ['evaluacionId' => $id]);
    })->name('evaluacion.detalle');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
