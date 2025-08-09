import { useState } from 'react';
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
import { PacienteFormData } from './types';

interface CreatePatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: PacienteFormData) => void;
}

export function CreatePatientModal({ isOpen, onClose, onSubmit }: CreatePatientModalProps) {
    const [formData, setFormData] = useState({
        dni: '',
        nombres: '',
        apellidos: '',
        edad: '',
        genero: '' as 'Masculino' | 'Femenino' | '',
        telefono: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            dni: formData.dni,
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            edad: parseInt(formData.edad),
            genero: formData.genero as 'Masculino' | 'Femenino',
            telefono: formData.telefono || undefined
        });
        setFormData({ 
            dni: '', 
            nombres: '', 
            apellidos: '', 
            edad: '', 
            genero: '', 
            telefono: '' 
        });
    };

    const handleClose = () => {
        setFormData({ 
            dni: '', 
            nombres: '', 
            apellidos: '', 
            edad: '', 
            genero: '', 
            telefono: '' 
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Paciente</DialogTitle>
                    <DialogDescription>
                        Ingresa los datos del nuevo paciente aquí.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Primera fila - DNI y Nombres */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="dni">DNI</Label>
                                <Input
                                    id="dni"
                                    value={formData.dni}
                                    onChange={(e) => setFormData({...formData, dni: e.target.value})}
                                    placeholder="12345678"
                                    maxLength={8}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nombres">Nombres</Label>
                                <Input
                                    id="nombres"
                                    value={formData.nombres}
                                    onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                                    placeholder="Juan Carlos"
                                    required
                                />
                            </div>
                        </div>

                        {/* Segunda fila - Apellidos */}
                        <div className="grid gap-2">
                            <Label htmlFor="apellidos">Apellidos</Label>
                            <Input
                                id="apellidos"
                                value={formData.apellidos}
                                onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                                placeholder="Pérez García"
                                required
                            />
                        </div>

                        {/* Tercera fila - Edad y Género */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edad">Edad</Label>
                                <Input
                                    id="edad"
                                    type="number"
                                    value={formData.edad}
                                    onChange={(e) => setFormData({...formData, edad: e.target.value})}
                                    placeholder="25"
                                    min="0"
                                    max="150"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="genero">Género</Label>
                                <Select 
                                    value={formData.genero} 
                                    onValueChange={(value: 'Masculino' | 'Femenino') => setFormData({...formData, genero: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el género" />
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
                            <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                            <Input
                                id="telefono"
                                value={formData.telefono}
                                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                placeholder="987654321"
                                maxLength={15}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">Crear Paciente</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
