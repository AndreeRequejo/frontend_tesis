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
        'hora',
        'confianza',
        'tiempo_procesamiento',
        'probabilidades'
    ];

    protected $casts = [
        'fecha' => 'date',
        'hora' => 'datetime:H:i',
        'confianza' => 'decimal:4',
        'tiempo_procesamiento' => 'decimal:2',
        'probabilidades' => 'array'
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
