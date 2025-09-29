import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Camera, Lightbulb } from 'lucide-react';

export function ImageRecommendations() {
    const recommendations = [
        {
            icon: <Camera className="h-4 w-4" />,
            title: 'Imagen nítida',
            description: 'Foto nítida, sin desenfoque, con el rostro ocupando la mayor parte del encuadre.',
        },
        {
            icon: <Lightbulb className="h-4 w-4" />,
            title: 'Iluminación',
            description: 'Asegúrese de tomar la foto con luz natural o buena iluminación.',
        },
        {
            icon: <AlertTriangle className="h-4 w-4" />,
            title: 'Importante',
            description: 'La imagen debe mostrar únicamente un rostro completo y centrado',
        },
    ];

    const importantNotes = [
        'Rostro limpio, sin maquillaje ni productos aplicados.',
        'Evitar el uso de filtros o edición de la imagen.',
        'Evitar sombras en el rostro.',
    ];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Recomendaciones para la imagen
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Recomendaciones principales */}
                    <div className="space-y-3">
                        {recommendations.map((rec, index) => (
                            <div key={index} className="flex gap-3">
                                <div className="mt-0.5 flex-shrink-0 text-blue-600">{rec.icon}</div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium">{rec.title}</h4>
                                    <p className="text-xs text-gray-600">{rec.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2 pt-3">
                        <div className="flex items-center gap-2 font-bold text-amber-600">
                            <AlertTriangle className="h-5 w-5" />
                            Consideraciones importantes
                        </div>
                        <Alert className="py-2">
                            {importantNotes.map((note, index) => (
                                <AlertDescription key={index} className="text-xs pt-1.5">
                                    • {note}
                                </AlertDescription>
                            ))}
                        </Alert>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
