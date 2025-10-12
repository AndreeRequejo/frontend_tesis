import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { usePage } from '@inertiajs/react';
import { ReportePDF } from './ReportePDF';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

// Ejemplo de props, ajusta según tu modelo real
interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  edad: number;
  genero: string;
  // ...otros campos
}

interface Evaluacion {
  id: number;
  fecha: string;
  resultado: string;
  comentario?: string;
  imagenes?: string[];
}

const ReportePaciente: React.FC = () => {
  const { paciente, evaluaciones, showModalNoEvaluaciones } = usePage().props as unknown as { paciente: Paciente; evaluaciones: Evaluacion[]; showModalNoEvaluaciones?: boolean };
  
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          <span>Regresar</span>
        </Button>
      </div>
      {/* El toast se muestra automáticamente si no hay evaluaciones */}
      {!showModalNoEvaluaciones && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Reporte del Paciente</CardTitle>
              <CardDescription>Visualiza los datos y evaluaciones del paciente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-base font-semibold mb-2">Datos del Paciente</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block font-medium text-gray-700">Nombre:</span>
                    <span>{paciente.nombre} {paciente.apellido}</span>
                  </div>
                  <div>
                    <span className="block font-medium text-gray-700">Edad:</span>
                    <span>{paciente.edad} años</span>
                  </div>
                  <div>
                    <span className="block font-medium text-gray-700">Género:</span>
                    <span>{paciente.genero}</span>
                  </div>
                  {/* Otros datos relevantes aquí */}
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">Evaluaciones</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border rounded-lg text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-3 border-b text-left">Fecha</th>
                        <th className="py-2 px-3 border-b text-left">Resultado</th>
                        <th className="py-2 px-3 border-b text-left">Imágenes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evaluaciones.map(ev => (
                        <tr key={ev.id} className="border-b">
                          <td className="py-2 px-3">{ev.fecha}</td>
                          <td className="py-2 px-3">{ev.resultado}</td>
                          <td className="py-2 px-3">
                            {ev.imagenes && ev.imagenes.length > 0 ? (
                              <div className="flex gap-2">
                                {ev.imagenes.map((img: string, idx: number) => (
                                  <img key={idx} src={img} alt={`img-${idx}`} className="w-14 h-14 object-cover rounded border" />
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">Sin imágenes</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
          <PDFDownloadLink
            document={<ReportePDF paciente={paciente} evaluaciones={evaluaciones} />}
            fileName={`REPORTE_PACIENTE_${(paciente.nombre).toUpperCase()}_${paciente.apellido.toUpperCase()}.pdf`}
          >
            {({ loading }) => (
              <Button className="mt-4 w-full" size="lg">
                {loading ? 'Generando PDF...' : 'Descargar PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </>
      )}
    </div>
  );
};

export default ReportePaciente;
