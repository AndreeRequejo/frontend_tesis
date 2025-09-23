<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('evaluacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('paciente')->onDelete('cascade');
            $table->enum('clasificacion', ['Ausente', 'Leve', 'Moderado', 'Severo']);
            $table->text('comentario')->nullable();
            $table->date('fecha');
            $table->time('hora');
            // Campos para predicción automática
            $table->boolean('es_prediccion_automatica')->default(false);
            $table->decimal('confianza', 5, 4)->nullable(); // 0.0000 - 1.0000
            $table->decimal('tiempo_procesamiento', 8, 2)->nullable(); // en milisegundos
            $table->json('probabilidades')->nullable(); // almacenar todas las probabilidades
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluacion');
    }
};
