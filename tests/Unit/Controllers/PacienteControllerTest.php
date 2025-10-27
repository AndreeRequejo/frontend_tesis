<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\PacienteController;
use ReflectionClass;

class PacienteControllerTest extends TestCase
{
    /** @test */
    public function detect_mime_type_reconoce_jpeg_y_png()
    {
        $controller = new PacienteController();
        $reflection = new ReflectionClass($controller);
        $method = $reflection->getMethod('detectMimeType');
        $method->setAccessible(true);

        // Imagen JPEG
        $jpeg = imagecreatetruecolor(10, 10);
        ob_start();
        imagejpeg($jpeg);
        $jpegData = ob_get_clean();
        $base64Jpeg = base64_encode($jpegData);

        $mimeJpeg = $method->invoke($controller, $base64Jpeg);
        $this->assertEquals('image/jpeg', $mimeJpeg);

        // Imagen PNG
        $png = imagecreatetruecolor(10, 10);
        ob_start();
        imagepng($png);
        $pngData = ob_get_clean();
        $base64Png = base64_encode($pngData);

        $mimePng = $method->invoke($controller, $base64Png);
        $this->assertEquals('image/png', $mimePng);
    }
}
