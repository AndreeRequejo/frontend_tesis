<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Informe extends Model
{
    protected $table = 'informe';

    protected $fillable = [
        'paciente_id',
        'contenido_pdf',
        'fecha_generacion',
    ];

    protected $casts = [
        'fecha_generacion' => 'datetime',
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }
}
