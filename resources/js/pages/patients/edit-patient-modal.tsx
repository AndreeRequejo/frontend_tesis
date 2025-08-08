import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Paciente, PacienteFormData } from './types';

interface EditPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: PacienteFormData) => void;
    patient: Paciente | null;
}

export function EditPatientModal({ isOpen, onClose, onSubmit, patient }: EditPatientModalProps) {
    const [formData, setFormData] = useState({
        nombre: '',
        edad: '',
        genero: '',
        ultimaEvaluacion: ''
    });

    // Cargar datos del paciente cuando se abre el modal
    useEffect(() => {
        if (patient) {
            setFormData({
                nombre: patient.nombre,
                edad: patient.edad.toString(),
                genero: patient.genero,
                ultimaEvaluacion: patient.ultimaEvaluacion
            });
        }
    }, [patient]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            nombre: formData.nombre,
            edad: parseInt(formData.edad),
            genero: formData.genero,
            ultimaEvaluacion: formData.ultimaEvaluacion
        });
        setFormData({ nombre: '', edad: '', genero: '', ultimaEvaluacion: '' });
    };

    const handleClose = () => {
        setFormData({ nombre: '', edad: '', genero: '', ultimaEvaluacion: '' });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Paciente</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del paciente.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-nombre" className="text-right">
                                Nombre
                            </Label>
                            <Input
                                id="edit-nombre"
                                value={formData.nombre}
                                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-edad" className="text-right">
                                Edad
                            </Label>
                            <Input
                                id="edit-edad"
                                type="number"
                                value={formData.edad}
                                onChange={(e) => setFormData({...formData, edad: e.target.value})}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-genero" className="text-right">
                                Género
                            </Label>
                            <Select 
                                value={formData.genero} 
                                onValueChange={(value) => setFormData({...formData, genero: value})}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecciona el género" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Masculino">Masculino</SelectItem>
                                    <SelectItem value="Femenino">Femenino</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-ultimaEvaluacion" className="text-right">
                                Última Evaluación
                            </Label>
                            <Input
                                id="edit-ultimaEvaluacion"
                                type="date"
                                value={formData.ultimaEvaluacion}
                                onChange={(e) => setFormData({...formData, ultimaEvaluacion: e.target.value})}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">Guardar Cambios</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
