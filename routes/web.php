<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('login');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('pacientes', function () {
        return Inertia::render('patients/index');
    })->name('pacientes');

    Route::get('historial', function () {
        return Inertia::render('history/historial');
    })->name('historial');

    Route::get('evaluacion', function () {
        return Inertia::render('evaluation/evaluacion');
    })->name('evaluacion');

    Route::get('evaluacion/{id}', function ($id) {
        return Inertia::render('evaluation/detalle', ['evaluacionId' => $id]);
    })->name('evaluacion.detalle');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
