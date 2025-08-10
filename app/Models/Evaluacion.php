<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluacion extends Model
{
    protected $table = 'evaluacion';
    public $timestamps = false;

    protected $fillable = [
        'paciente_id',
        'clasificacion',
        'comentario',
        'fecha',
        'hora'
    ];

    protected $casts = [
        'fecha' => 'date',
        'hora' => 'datetime:H:i',
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }

    public function imagenes()
    {
        return $this->hasMany(Imagen::class);
    }

    // Obtener la primera imagen para mostrar en las cards
    public function imagenPrincipal()
    {
        return $this->hasOne(Imagen::class)->oldest('id');
    }
}
