import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { CreatePatientModal } from '@/pages/patients/create-patient-modal';
import { Paciente, PacienteFormData } from '@/pages/patients/types';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Camera, ImageIcon, Plus, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
// Detectar si es móvil
const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

interface EvaluationPageProps {
    pacientes: Paciente[];
    pacienteSeleccionado?: Paciente | null;
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluación',
        href: '/evaluacion',
    },
];

export default function Evaluacion() {
    const { pacientes, pacienteSeleccionado } = usePage<EvaluationPageProps>().props;
    const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(pacienteSeleccionado || null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isUsingCamera, setIsUsingCamera] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Configuración para número máximo de imágenes
    const MAX_IMAGES = 1;

    // Preseleccionar paciente si viene desde el detalle
    useEffect(() => {
        if (pacienteSeleccionado) {
            setSelectedPatient(pacienteSeleccionado);
        }
    }, [pacienteSeleccionado]);

    // Limpiar stream de cámara al desmontar el componente
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [stream]);

    const getPatientFullName = (patient: Paciente) => {
        return `${patient.nombres} ${patient.apellidos}`;
    };

    // Función para abrir la cámara
    const handleOpenCamera = async () => {
        if (capturedImages.length >= MAX_IMAGES) {
            alert(`Solo puedes agregar hasta ${MAX_IMAGES} imagen(es).`);
            return;
        }

        try {
            setIsUsingCamera(true);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                },
            });
            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
            setIsUsingCamera(false);
        }
    };

    // Función para capturar la imagen
    const handleCaptureImage = () => {
        if (videoRef.current && canvasRef.current && capturedImages.length < MAX_IMAGES) {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setCapturedImages((prev) => [...prev, imageDataUrl]);

                // Detener la cámara
                if (stream) {
                    stream.getTracks().forEach((track) => track.stop());
                    setStream(null);
                }
                setIsUsingCamera(false);
            }
        }
    };

    // Función para cerrar la cámara sin capturar
    const handleCloseCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        setIsUsingCamera(false);
    };

    // Función para seleccionar imagen del dispositivo
    const handleSelectFromDevice = () => {
        if (capturedImages.length >= MAX_IMAGES) {
            alert(`Ya has alcanzado el máximo de ${MAX_IMAGES} imágenes.`);
            return;
        }

        const remainingSlots = MAX_IMAGES - capturedImages.length;
        console.log(`Puedes seleccionar hasta ${remainingSlots} imagen(es) más.`);

        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Función para manejar la selección de archivo
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const remainingSlots = MAX_IMAGES - capturedImages.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        if (files.length > remainingSlots) {
            alert(`Solo puedes agregar ${remainingSlots} imagen(es) más. Se seleccionarán las primeras ${remainingSlots}.`);
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

        // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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

    const filteredPatients = pacientes.filter(
        (patient) => getPatientFullName(patient).toLowerCase().includes(searchTerm.toLowerCase()) || patient.dni.includes(searchTerm),
    );

    const handlePatientSelect = (patient: Paciente) => {
        setSelectedPatient(patient);
    };

    const handleCreateSubmit = (formData: PacienteFormData) => {
        console.log('Crear paciente:', formData);
        // Aquí implementarías la lógica para crear el paciente
        setIsCreateModalOpen(false);
    };

    const handleBackToSelection = () => {
        setSelectedPatient(null);
    };

    const handleEvaluatePatient = async () => {
        if (!selectedPatient || capturedImages.length === 0) {
            toast.error('Debe seleccionar un paciente y agregar al menos una imagen');
            return;
        }

        setIsEvaluating(true);

        try {
            // Usar router.post de Inertia para manejar la redirección correctamente
            router.post(
                '/evaluacion/predecir',
                {
                    paciente_id: selectedPatient.id,
                    imagenes: capturedImages,
                },
                {
                    onSuccess: () => {
                        // La redirección se maneja automáticamente por Inertia
                    },
                    onError: (errors) => {
                        console.error('Error:', errors);

                        // Extraer el mensaje específico del error
                        let errorMessage = 'Error al procesar la evaluación';

                        if (errors.prediccion) {
                            errorMessage = errors.prediccion;
                        } else if (typeof errors === 'string') {
                            errorMessage = errors;
                        } else if (errors.message) {
                            errorMessage = errors.message;
                        }

                        toast.error(errorMessage);
                    },
                    onFinish: () => {
                        setIsEvaluating(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión al procesar la evaluación');
            setIsEvaluating(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Evaluación" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center gap-4">
                    {selectedPatient && (
                        <Button variant="outline" size="icon" onClick={handleBackToSelection}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <h1 className="text-2xl font-bold">Nueva Evaluación</h1>
                </div>

                {!selectedPatient ? (
                    /* Selección de Paciente */
                    <Card>
                        <CardHeader>
                            <CardTitle>Seleccionar Paciente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Barra de búsqueda con botón de crear */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        placeholder="Buscar paciente..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nuevo Paciente
                                </Button>
                            </div>

                            {/* Lista de pacientes */}
                            <div className="space-y-2">
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map((paciente) => (
                                        <div
                                            key={paciente.id}
                                            onClick={() => handlePatientSelect(paciente)}
                                            className="cursor-pointer rounded-lg border p-4 shadow transition-all hover:bg-gray-50 hover:shadow-md"
                                        >
                                            <h3 className="pb-1 text-lg font-semibold">{getPatientFullName(paciente)}</h3>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-600">
                                                    {paciente.edad} años • {paciente.genero}
                                                </span>
                                                <span className="text-sm text-gray-600">DNI: {paciente.dni}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-gray-500">
                                        {searchTerm ? 'No se encontraron pacientes.' : 'No hay pacientes registrados.'}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    /* Sección de imagen una vez seleccionado el paciente */
                    <>
                        {/* Información del paciente seleccionado */}
                        <Card>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">{getPatientFullName(selectedPatient)}</h3>
                                        <p className="text-sm text-gray-600">
                                            {selectedPatient.edad} años • {selectedPatient.genero}
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-500">DNI: {selectedPatient.dni}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sección de imagen */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Imagen</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Input oculto para seleccionar archivos */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                    {...(isMobile ? { capture: 'environment' } : {})}
                                />

                                {/* Canvas oculto para capturar imagen */}
                                <canvas ref={canvasRef} style={{ display: 'none' }} />

                                {isUsingCamera ? (
                                    /* Vista de cámara */
                                    <div className="space-y-4">
                                        <video ref={videoRef} autoPlay playsInline className="mx-auto w-full max-w-md rounded-lg" />
                                        <div className="flex justify-center gap-2">
                                            <Button onClick={handleCaptureImage}>Capturar</Button>
                                            <Button variant="outline" onClick={handleCloseCamera}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                ) : capturedImages.length > 0 ? (
                                    /* Vista de imágenes capturadas */
                                    <div className="space-y-4">
                                        {/* Contador de imágenes */}
                                        <div className="text-center text-sm text-gray-600">
                                            {capturedImages.length} de {MAX_IMAGES} imágenes
                                        </div>

                                        {/* Grid de imágenes */}
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {capturedImages.map((image, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={image}
                                                        alt={`Imagen ${index + 1}`}
                                                        className="h-48 w-full rounded-lg object-cover shadow-md"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="absolute top-2 right-2 h-8 w-8 p-0"
                                                        onClick={() => handleRemoveImage(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
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
                                                    <Button onClick={handleOpenCamera}>
                                                        <Camera className="mr-2 h-4 w-4" />
                                                        Agregar foto
                                                    </Button>
                                                    <Button variant="outline" onClick={handleSelectFromDevice}>
                                                        <ImageIcon className="mr-2 h-4 w-4" />
                                                        Seleccionar archivo
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* Vista inicial - botones para elegir fuente */
                                    <div className="space-y-4">
                                        {/* Indicador de límite de imágenes */}
                                        <div className="text-center text-sm text-gray-600">Puedes agregar hasta {MAX_IMAGES} imágenes</div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {/* Solo mostrar botón de cámara si NO es móvil */}
                                            {!isMobile && (
                                                <Button
                                                    variant="outline"
                                                    className="flex h-24 flex-col gap-2"
                                                    onClick={handleOpenCamera}
                                                    disabled={capturedImages.length >= MAX_IMAGES}
                                                >
                                                    <Camera className="h-8 w-8" />
                                                    <span>Cámara</span>
                                                </Button>
                                            )}
                                            {/* Botón Dispositivo siempre visible */}
                                            <Button
                                                variant="outline"
                                                className="flex h-24 flex-col gap-2"
                                                onClick={handleSelectFromDevice}
                                                disabled={capturedImages.length >= MAX_IMAGES}
                                            >
                                                <ImageIcon className="h-8 w-8" />
                                                <span>Dispositivo</span>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Botón Evaluación */}
                        <Button className="w-full" size="lg" onClick={handleEvaluatePatient} disabled={capturedImages.length === 0 || isEvaluating}>
                            {isEvaluating ? 'Evaluando...' : 'Evaluar paciente'}
                        </Button>
                    </>
                )}

                {/* Modal para crear paciente */}
                <CreatePatientModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateSubmit} />
            </div>
            <Toaster position="top-right" />
        </AppLayout>
    );
}
