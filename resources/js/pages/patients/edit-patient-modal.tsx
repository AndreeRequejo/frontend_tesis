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
        dni: '',
        nombres: '',
        apellidos: '',
        edad: '',
        genero: '' as 'Masculino' | 'Femenino' | '',
        telefono: ''
    });

    // Cargar datos del paciente cuando se abre el modal
    useEffect(() => {
        if (patient && isOpen) {
            setFormData({
                dni: patient.dni,
                nombres: patient.nombres,
                apellidos: patient.apellidos,
                edad: patient.edad.toString(),
                genero: patient.genero,
                telefono: patient.telefono || ''
            });
        } else if (!isOpen) {
            // Limpiar formulario cuando se cierra el modal
            setFormData({
                dni: '',
                nombres: '',
                apellidos: '',
                edad: '',
                genero: '' as 'Masculino' | 'Femenino' | '',
                telefono: ''
            });
        }
    }, [patient, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            dni: formData.dni,
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            edad: parseInt(formData.edad),
            genero: formData.genero as 'Masculino' | 'Femenino',
            telefono: formData.telefono.trim() || null
        });
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Editar Paciente</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del paciente.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Primera fila - DNI y Nombres */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-dni">Doc. Identif.</Label>
                                <Input
                                    id="edit-dni"
                                    value={formData.dni.replace(/\D/g, '')}
                                    type='text'
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setFormData({...formData, dni: value});
                                    }}
                                    placeholder="12345678"
                                    maxLength={8}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-nombres">Nombres</Label>
                                <Input
                                    id="edit-nombres"
                                    value={formData.nombres}
                                    onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                                    placeholder="Juan Carlos"
                                    required
                                />
                            </div>
                        </div>

                        {/* Segunda fila - Apellidos */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-apellidos">Apellidos</Label>
                            <Input
                                id="edit-apellidos"
                                value={formData.apellidos}
                                onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                                placeholder="Pérez García"
                                required
                            />
                        </div>

                        {/* Tercera fila - Edad y Género */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-edad">Edad</Label>
                                <Input
                                    id="edit-edad"
                                    type="tel"
                                    value={formData.edad}
                                    onChange={(e) => setFormData({...formData, edad: e.target.value})}
                                    placeholder="25"
                                    maxLength={2}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-genero">Género</Label>
                                <Select 
                                    value={formData.genero} 
                                    onValueChange={(value: 'Masculino' | 'Femenino') => setFormData({...formData, genero: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Masculino">Masculino</SelectItem>
                                        <SelectItem value="Femenino">Femenino</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Cuarta fila - Teléfono */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-telefono">Teléfono (Opcional)</Label>
                            <Input
                                id="edit-telefono"
                                type='text'
                                value={formData.telefono.replace(/\D/g, '')}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setFormData({...formData, telefono: value});
                                }}
                                placeholder="987654321"
                                maxLength={9}
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
