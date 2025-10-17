<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paciente extends Model
{
    protected $table = 'paciente';

    protected $fillable = [
        'dni',
        'nombres',
        'apellidos',
        'edad',
        'genero',
        'telefono',
    ];

    protected $casts = [
        'edad' => 'integer',
    ];

    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class);
    }

    /**
     * Obtener el nombre completo del paciente
     */
    public function getNombreCompletoAttribute()
    {
        return "{$this->apellidos} {$this->nombres}";
    }
}
