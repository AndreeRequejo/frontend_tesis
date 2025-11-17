import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { 
    ChevronLeft, 
    ChevronRight, 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Mail,
    Shield
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { CreateUserModal } from './create-user-modal';
import { DeleteUserModal } from './delete-user-modal';
import { EditUserModal } from './edit-user-modal';
import { Usuario, UserFormData, UserEditFormData, Role } from './types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '/usuarios',
    },
];

interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface PageProps {
    usuarios: PaginatedResponse<Usuario>;
    roles: Role[];
    filters: {
        search?: string;
        pag?: number;
    };
    [key: string]: unknown;
}

export default function Usuarios() {
    const { usuarios, roles, filters } = usePage<PageProps>().props;
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [perPage, setPerPage] = useState(filters?.pag || 10);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Debounce para la búsqueda
    useEffect(() => {
        if (isInitialLoad) {
            setIsInitialLoad(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            const currentSearch = filters?.search || '';
            if (searchTerm !== currentSearch) {
                router.get(
                    '/usuarios',
                    { 
                        search: searchTerm || undefined,
                        pag: perPage 
                    },
                    {
                        preserveState: true,
                        replace: true,
                    },
                );
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filters?.search, perPage, isInitialLoad]);

    const handleEdit = (id: number) => {
        const user = usuarios.data.find((u) => u.id === id);
        if (user) {
            setSelectedUser(user);
            setIsEditModalOpen(true);
        }
    };

    const handleDelete = (id: number) => {
        const user = usuarios.data.find((u) => u.id === id);
        if (user) {
            setSelectedUser(user);
            setIsDeleteModalOpen(true);
        }
    };

    const handleCreateSubmit = (formData: UserFormData) => {
        router.post('/usuarios', formData, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                toast.success('Usuario creado exitosamente');
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError as string);
            },
        });
    };

    const handleEditSubmit = (formData: UserEditFormData) => {
        if (!selectedUser) return;

        router.put(`/usuarios/${selectedUser.id}`, formData, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedUser(null);
                toast.success('Usuario actualizado exitosamente');
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError as string);
            },
        });
    };

    const handleDeleteConfirm = () => {
        if (!selectedUser) return;

        router.delete(`/usuarios/${selectedUser.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
                toast.success('Usuario eliminado exitosamente');
            },
            onError: (errors) => {
                const errorMessage = errors.delete || Object.values(errors)[0];
                toast.error(errorMessage as string);
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
            },
        });
    };

    const handlePageChange = (url: string) => {
        router.get(
            url,
            { 
                search: searchTerm,
                pag: perPage 
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePerPageChange = (value: string) => {
        const newPerPage = parseInt(value);
        setPerPage(newPerPage);
        router.get(
            '/usuarios',
            { 
                search: searchTerm || undefined, 
                pag: newPerPage 
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName.toLowerCase()) {
            case 'administrador':
                return 'bg-red-100 text-red-800 hover:bg-red-100';
            case 'medico':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'secretario':
                return 'bg-green-100 text-green-800 hover:bg-green-100';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Usuarios" />
            <Toaster position="top-right" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header con título y botón nuevo */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                                    <p className="text-blue-100">Sistema de administración</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <div className="text-2xl font-bold">{usuarios.total}</div>
                                <div className="text-blue-100 text-sm">Usuarios registrados</div>
                            </div>
                            <Button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-white text-blue-600 hover:bg-blue-50 border-0 shadow-md flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Nuevo Usuario
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Search bar */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Pagination Top */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Mostrar:</span>
                                <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                                    <SelectTrigger className="w-20 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="15">15</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-sm text-gray-600">por página</span>
                            </div>
                        </div>
                        
                        {usuarios.last_page > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => usuarios.prev_page_url && handlePageChange(usuarios.prev_page_url)}
                                    disabled={!usuarios.prev_page_url}
                                    className="border-gray-200 hover:bg-gray-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <div className="flex items-center gap-1">
                                    {usuarios.links.slice(1, -1).map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => link.url && handlePageChange(link.url)}
                                            disabled={!link.url}
                                            className={link.active 
                                                ? 'bg-blue-600 hover:bg-blue-700 border-blue-600' 
                                                : 'border-gray-200 hover:bg-gray-50'
                                            }
                                        >
                                            {link.label}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => usuarios.next_page_url && handlePageChange(usuarios.next_page_url)}
                                    disabled={!usuarios.next_page_url}
                                    className="border-gray-200 hover:bg-gray-50"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usuarios.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <Shield className="h-12 w-12 text-muted-foreground" />
                                            <p className="text-muted-foreground">
                                                No se encontraron usuarios
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                usuarios.data.map((usuario) => (
                                    <TableRow key={usuario.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{usuario.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{usuario.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {usuario.roles && usuario.roles.length > 0 ? (
                                                <Badge 
                                                    variant="secondary"
                                                    className={getRoleBadgeColor(usuario.roles[0].name)}
                                                >
                                                    {usuario.roles[0].name.charAt(0).toUpperCase() + usuario.roles[0].name.slice(1)}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Sin rol</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(usuario.id)}
                                                    title="Editar usuario"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(usuario.id)}
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Mostrar:</span>
                                <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                                    <SelectTrigger className="w-20 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="15">15</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-sm text-gray-600">por página</span>
                            </div>
                        </div>
                        
                        {usuarios.last_page > 1 && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => usuarios.prev_page_url && handlePageChange(usuarios.prev_page_url)}
                                    disabled={!usuarios.prev_page_url}
                                    className="border-gray-200 hover:bg-gray-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <div className="flex items-center gap-1">
                                    {usuarios.links.slice(1, -1).map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => link.url && handlePageChange(link.url)}
                                            disabled={!link.url}
                                            className={link.active 
                                                ? 'bg-blue-600 hover:bg-blue-700 border-blue-600' 
                                                : 'border-gray-200 hover:bg-gray-50'
                                            }
                                        >
                                            {link.label}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => usuarios.next_page_url && handlePageChange(usuarios.next_page_url)}
                                    disabled={!usuarios.next_page_url}
                                    className="border-gray-200 hover:bg-gray-50"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateSubmit}
                roles={roles}
            />
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                }}
                onSubmit={handleEditSubmit}
                usuario={selectedUser}
                roles={roles}
            />
            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedUser(null);
                }}
                onConfirm={handleDeleteConfirm}
                usuario={selectedUser}
            />
        </AppLayout>
    );
}
