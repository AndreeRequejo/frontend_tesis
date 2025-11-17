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
import { EditUserModalProps, UserEditFormData } from './types';
import { Eye, EyeOff } from 'lucide-react';

export function EditUserModal({ isOpen, onClose, onSubmit, usuario, roles }: EditUserModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    // Cargar datos del usuario cuando se abre el modal
    useEffect(() => {
        if (usuario && isOpen) {
            setFormData({
                name: usuario.name,
                email: usuario.email,
                password: '',
                password_confirmation: '',
                role: usuario.roles && usuario.roles.length > 0 ? usuario.roles[0].name : ''
            });
        } else if (!isOpen) {
            setFormData({
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                role: ''
            });
            setShowPassword(false);
            setShowPasswordConfirmation(false);
        }
    }, [usuario, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const submitData: UserEditFormData = {
            name: formData.name.toUpperCase(),
            email: formData.email.toLowerCase(),
            role: formData.role
        };

        // Solo incluir contraseña si se proporcionó una nueva
        if (formData.password) {
            submitData.password = formData.password;
            submitData.password_confirmation = formData.password_confirmation;
        }

        onSubmit(submitData);
    };

    const handleClose = () => {
        setShowPassword(false);
        setShowPasswordConfirmation(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del usuario. Deja la contraseña en blanco si no deseas cambiarla.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Nombre */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nombre Completo</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').toUpperCase();
                                    setFormData({...formData, name: value});
                                }}
                                placeholder="JUAN PÉREZ"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Correo Electrónico</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase()})}
                                placeholder="usuario@ejemplo.com"
                                required
                            />
                        </div>

                        {/* Contraseña (Opcional) */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-password">Nueva Contraseña (Opcional)</Label>
                            <div className="relative">
                                <Input
                                    id="edit-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder="Dejar en blanco para mantener actual"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Confirmar Contraseña (Opcional) */}
                        {formData.password && (
                            <div className="grid gap-2">
                                <Label htmlFor="edit-password-confirmation">Confirmar Nueva Contraseña</Label>
                                <div className="relative">
                                    <Input
                                        id="edit-password-confirmation"
                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                        value={formData.password_confirmation}
                                        onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                                        placeholder="Confirmar contraseña"
                                        required={!!formData.password}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                    >
                                        {showPasswordConfirmation ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Rol */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-role">Rol</Label>
                            <Select 
                                value={formData.role} 
                                onValueChange={(value) => setFormData({...formData, role: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
