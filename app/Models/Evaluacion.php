<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluacion extends Model
{
    protected $table = 'evaluacion';

    protected $fillable = [
        'paciente_id',
        'imagen_id',
        'resultado',
        'comentario_medico',
        'fecha'
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }

    public function imagen()
    {
        return $this->belongsTo(Imagen::class);
    }
}
