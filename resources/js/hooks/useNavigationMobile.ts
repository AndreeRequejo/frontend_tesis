import { LayoutGrid, UsersRound, FileUser, ScanFace, CircleUserRound, Shield } from 'lucide-react';
import { type NavItem } from '@/types';
import { User, RoleHelper } from '@/lib/roleHelper';
import { usePage } from '@inertiajs/react';

interface AuthProps extends Record<string, unknown> {
  auth: {
    user: User | null;
  };
}

export const mainNavItems: NavItem[] = [
  {
    title: 'Inicio',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Pacientes',
    href: '/pacientes',
    icon: UsersRound,
  },
  {
    title: 'Evaluación',
    href: '/evaluacion',
    icon: ScanFace,
  },
  {
    title: 'Historial',
    href: '/historial',
    icon: FileUser,
  },
  {
    title: 'Usuarios',
    href: '/usuarios',
    icon: Shield,
  },
  {
    title: 'Perfil',
    href: '/settings/profile',
    icon: CircleUserRound,
  },
];

export const getNavItemsForRole = (user: User | null): NavItem[] => {
  if (!user) return [];

  // Definir qué elementos puede ver cada rol
  const rolePermissions: Record<string, string[]> = {
    '/dashboard': ['medico', 'secretario', 'administrador'],
    '/pacientes': ['medico', 'secretario'],
    '/evaluacion': ['medico'],
    '/historial': ['medico'],
    '/usuarios': ['administrador'],
    '/settings/profile': ['medico', 'secretario', 'administrador'],
  };

  return mainNavItems.filter(item => {
    const allowedRoles = rolePermissions[item.href] || [];
    return allowedRoles.some(role => RoleHelper.hasRole(user, role));
  });
};

// Hook para usar en componentes móviles
export const useNavigationMobile = () => {
  const { auth } = usePage<AuthProps>().props;
  
  // Obtener los elementos de navegación filtrados por rol
  const filteredNavItems = getNavItemsForRole(auth.user);
  
  return {
    mainNavItems: filteredNavItems,
    user: auth.user,
  };
};