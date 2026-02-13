import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, ImageIcon, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRef } from 'react';

// Detectar si es móvil
const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

interface ImageCaptureSectionProps {
    capturedImages: string[];
    setCapturedImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ImageCaptureSection({ capturedImages, setCapturedImages }: ImageCaptureSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Configuración para número máximo de imágenes
    const MAX_IMAGES = 3;

    // Función para seleccionar imagen de la galería (móvil) o dispositivo (desktop)
    const handleSelectFromGallery = () => {
        if (capturedImages.length >= MAX_IMAGES) {
            toast.error(`Ya has alcanzado el máximo de ${MAX_IMAGES} imágenes.`);
            return;
        }

        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Función para abrir cámara directamente (solo móvil)
    const handleOpenCamera = () => {
        if (capturedImages.length >= MAX_IMAGES) {
            toast.error(`Ya has alcanzado el máximo de ${MAX_IMAGES} imágenes.`);
            return;
        }

        if (cameraInputRef.current) {
            cameraInputRef.current.click();
        }
    };

    // Función para manejar la selección de archivo
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const remainingSlots = MAX_IMAGES - capturedImages.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        if (files.length > remainingSlots) {
            toast.error(`Solo puedes agregar ${remainingSlots} imagen. Se seleccionará ${remainingSlots}.`);
        }

        // Procesar cada archivo seleccionado
        filesToProcess.forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setCapturedImages((prev) => {
                        if (prev.length < MAX_IMAGES) {
                            return [...prev, e.target?.result as string];
                        }
                        return prev;
                    });
                };
                reader.readAsDataURL(file);
            }
        });

        // Limpiar ambos inputs para permitir seleccionar el mismo archivo de nuevo
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }
    };

    // Función para remover una imagen específica
    const handleRemoveImage = (index: number) => {
        setCapturedImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Función para remover todas las imágenes
    const handleRemoveAllImages = () => {
        setCapturedImages([]);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Captura de Imagen</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Inputs para seleccionar archivos */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                
                {/* Input para cámara directa (solo móviles) */}
                {isMobile && (
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                )}

                {capturedImages.length > 0 ? (
                    /* Vista de imágenes capturadas */
                    <div className="space-y-4">
                        {/* Contador de imágenes */}
                        <div className="text-center text-sm text-gray-600">
                            {capturedImages.length} de {MAX_IMAGES} imagen(es)
                        </div>

                        {/* Grid de imágenes */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                            {capturedImages.map((image, index) => (
                                <div key={index} className="flex justify-center">
                                    <div className="relative inline-block">
                                        <img
                                            src={image}
                                            alt={`Imagen ${index + 1}`}
                                            className="h-auto w-full max-w-[260px] rounded-lg object-contain shadow-md"
                                        />
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="absolute top-1 right-1 h-7 w-7 rounded-full p-0 shadow"
                                            onClick={() => handleRemoveImage(index)}
                                            style={{ zIndex: 10 }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-wrap justify-center gap-2">
                            <Button variant="outline" onClick={handleRemoveAllImages}>
                                Remover todas
                            </Button>
                            {capturedImages.length < MAX_IMAGES && (
                                <>
                                    {isMobile ? (
                                        /* Dos botones para móvil */
                                        <>
                                            <Button onClick={handleOpenCamera}>
                                                <Camera className="mr-2 h-4 w-4" />
                                                Cámara
                                            </Button>
                                            <Button variant="outline" onClick={handleSelectFromGallery}>
                                                <ImageIcon className="mr-2 h-4 w-4" />
                                                Galería
                                            </Button>
                                        </>
                                    ) : (
                                        /* Un botón para desktop */
                                        <Button onClick={handleSelectFromGallery}>
                                            <ImageIcon className="mr-2 h-4 w-4" />
                                            Seleccionar archivo
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Vista inicial - botones según dispositivo */
                    <div className="space-y-4">
                        {/* Indicador de límite de imágenes */}
                        <div className="text-center text-sm text-gray-600">
                            Puedes agregar hasta {MAX_IMAGES} imagen(es)
                        </div>

                        <div className="flex justify-center">
                            {isMobile ? (
                                /* Dos botones para móvil - Grid de 2 columnas */
                                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                    <Button
                                        variant="outline"
                                        className="flex h-24 flex-col gap-2"
                                        onClick={handleOpenCamera}
                                        disabled={capturedImages.length >= MAX_IMAGES}
                                    >
                                        <Camera className="h-8 w-8" />
                                        <span>Cámara</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex h-24 flex-col gap-2"
                                        onClick={handleSelectFromGallery}
                                        disabled={capturedImages.length >= MAX_IMAGES}
                                    >
                                        <ImageIcon className="h-8 w-8" />
                                        <span>Galería</span>
                                    </Button>
                                </div>
                            ) : (
                                /* Un botón para desktop */
                                <Button
                                    variant="outline"
                                    className="flex h-24 w-full max-w-xs flex-col gap-2"
                                    onClick={handleSelectFromGallery}
                                    disabled={capturedImages.length >= MAX_IMAGES}
                                >
                                    <ImageIcon className="h-8 w-8" />
                                    <span>Seleccionar del dispositivo</span>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}