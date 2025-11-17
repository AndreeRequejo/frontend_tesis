import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { DeleteUserModalProps } from './types';

export function DeleteUserModal({ isOpen, onClose, onConfirm, usuario }: DeleteUserModalProps) {
    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Confirmar Eliminación
                    </DialogTitle>
                    <DialogDescription className="space-y-3">
                        <p>
                            ¿Estás seguro de que deseas eliminar al usuario{' '}
                            <strong>{usuario?.name}</strong> ({usuario?.email})?
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-400">
                            <strong>Advertencia: </strong>Esta acción no se puede deshacer.
                        </div>
                        <p className="text-sm text-gray-600">
                            El usuario será eliminado permanentemente del sistema.
                        </p>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={handleConfirm}
                    >
                        Eliminar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
