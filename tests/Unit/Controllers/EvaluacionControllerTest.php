<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\EvaluacionController;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use ReflectionClass;

class EvaluacionControllerTest extends TestCase
{
    /** @test */
    public function comprimir_imagen_devuelve_base64_jpeg()
    {
        // Crear una imagen PNG de prueba
        Storage::fake('local');
        $file = UploadedFile::fake()->image('test.png', 1000, 800);
        $base64 = base64_encode(file_get_contents($file->getRealPath()));

        $controller = new EvaluacionController();
        $reflection = new ReflectionClass($controller);
        $method = $reflection->getMethod('comprimirImagen');
        $method->setAccessible(true);

        $base64Jpeg = $method->invoke($controller, $base64);

        // Debe devolver un string base64 diferente (comprimido)
        $this->assertIsString($base64Jpeg);
        $this->assertNotEquals($base64, $base64Jpeg);

        // Decodificar y verificar que es una imagen JPEG
        $imageData = base64_decode($base64Jpeg);
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->buffer($imageData);
        $this->assertEquals('image/jpeg', $mime);
    }
}
