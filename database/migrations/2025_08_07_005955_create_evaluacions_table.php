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
            $table->foreignId('imagen_id')->nullable()->constrained('imagen')->onDelete('set null');
            $table->enum('clasificacion', ['Ausente', 'Leve', 'Moderado', 'Severo']);
            $table->text('comentario')->nullable();
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
