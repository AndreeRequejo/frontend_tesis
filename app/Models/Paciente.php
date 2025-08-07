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

    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class);
    }
}
