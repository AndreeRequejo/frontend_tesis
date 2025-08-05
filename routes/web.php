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
        return Inertia::render('pacientes');
    })->name('pacientes');

    Route::get('historial', function () {
        return Inertia::render('historial');
    })->name('historial');

    Route::get('evaluacion', function () {
        return Inertia::render('evaluacion');
    })->name('evaluacion');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
