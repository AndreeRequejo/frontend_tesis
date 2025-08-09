<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('pacientes', function () {
        return Inertia::render('patients/index');
    })->name('pacientes');

    Route::get('pacientes/{id}', function ($id) {
        return Inertia::render('patients/detalle', ['pacienteId' => $id]);
    })->name('pacientes.detalle');

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
