export interface Usuario {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: Role[];
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

export interface UserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
    [key: string]: string;
}

export interface UserEditFormData {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    role: string;
    [key: string]: string | undefined;
}

export interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: UserFormData) => void;
    roles: Role[];
}

export interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: UserEditFormData) => void;
    usuario: Usuario | null;
    roles: Role[];
}

export interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    usuario: Usuario | null;
}
