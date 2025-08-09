<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PacienteController;

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Rutas de pacientes
    Route::resource('pacientes', PacienteController::class)->names([
        'index' => 'pacientes.index',
        'store' => 'pacientes.store',
        'show' => 'pacientes.show',
        'update' => 'pacientes.update',
        'destroy' => 'pacientes.destroy',
    ])->except(['create', 'edit']);

    Route::get('historial', function () {
        return Inertia::render('history/index');
    })->name('historial');

    Route::get('evaluacion', function () {
        return Inertia::render('evaluation/index');
    })->name('evaluacion');

    Route::get('evaluacion/{id}', function ($id) {
        return Inertia::render('history/detalle', ['evaluacionId' => $id]);
    })->name('evaluacion.detalle');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
