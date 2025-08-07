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
        Schema::create('informe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('paciente')->onDelete('cascade');
            $table->longText('contenido_pdf'); // base64 o ruta del PDF
            $table->timestamp('fecha_generacion')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('informe');
    }
};
