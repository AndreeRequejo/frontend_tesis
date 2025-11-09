<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PacienteController;
use App\Http\Controllers\HistorialController;
use App\Http\Controllers\EvaluacionController;
use App\Http\Controllers\PruebaController;

Route::middleware(['auth'])->group(function () {
    // Dashboard accesible para ambos roles
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('prueba', [PruebaController::class, 'index']);

    // RUTAS COMPARTIDAS (ambos roles pueden acceder)
    Route::middleware(['role:medico|secretario'])->group(function () {
        Route::get('pacientes', [PacienteController::class, 'index'])->name('pacientes.index');
        Route::post('pacientes', [PacienteController::class, 'store'])->name('pacientes.store');
        Route::put('pacientes/{paciente}', [PacienteController::class, 'update'])->name('pacientes.update');
    });

    // RUTAS SOLO PARA MÉDICOS
    Route::middleware(['role:medico'])->group(function () {
        // Funciones adicionales de pacientes que solo médicos pueden usar
        Route::get('pacientes/{paciente}', [PacienteController::class, 'show'])->name('pacientes.show');
        Route::delete('pacientes/{paciente}', [PacienteController::class, 'destroy'])->name('pacientes.destroy');

        // Reportes (solo médicos)
        Route::get('reporte-paciente/{id}', [PacienteController::class, 'reporte'])->name('paciente.reporte');

        // Historial médico (solo médicos)
        Route::get('historial', [HistorialController::class, 'index'])->name('historial');
        Route::get('historial/{id}', [HistorialController::class, 'show'])->name('historial.detalle');
        Route::post('historial/{id}/pdf', [HistorialController::class, 'generarPdf'])->name('historial.pdf');

        // Evaluaciones (solo médicos)
        Route::get('evaluacion', [EvaluacionController::class, 'index'])->name('evaluacion');
        Route::post('evaluaciones', [EvaluacionController::class, 'store'])->name('evaluaciones.store');
        Route::put('evaluaciones/{id}', [EvaluacionController::class, 'update'])->name('evaluaciones.update');
        Route::delete('evaluaciones/{id}', [EvaluacionController::class, 'destroy'])->name('evaluaciones.destroy');
        Route::post('evaluacion/predecir', [EvaluacionController::class, 'predecir'])->name('evaluacion.predecir');
        Route::get('evaluacion/{id}', [HistorialController::class, 'show'])->name('evaluacion.detalle');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
