import { usePage } from '@inertiajs/react';
import { User, RoleHelper } from '@/lib/roleHelper';
import { type NavItem } from '@/types';
import { LayoutGrid, UsersRound, FileUser, ScanFace, FlaskConical } from 'lucide-react';

interface AuthProps extends Record<string, unknown> {
  auth: {
    user: User | null;
  };
}

// Items de navegación para desktop (sin perfil)
export const mainNavItems: NavItem[] = [
  {
    title: 'Inicio',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Evaluación',
    href: '/evaluacion',
    icon: ScanFace,
  },
  {
    title: 'Pacientes',
    href: '/pacientes',
    icon: UsersRound,
  },
  {
    title: 'Historial',
    href: '/historial',
    icon: FileUser,
  },
  // {
  //   title: 'Prueba',
  //   href: '/prueba',
  //   icon: FlaskConical,
  // },
];

export const useNavigation = () => {
  const { auth } = usePage<AuthProps>().props;
  
  const filterNavItemsByRole = (items: NavItem[]): NavItem[] => {
    if (!auth.user) return [];

    return items.filter(item => {
      // Definir qué rutas puede ver cada rol
      const routePermissions: Record<string, string[]> = {
        '/dashboard': ['medico', 'secretario'],
        '/evaluacion': ['medico'],
        '/pacientes': ['medico', 'secretario'],
        '/historial': ['medico'],
        // '/prueba': ['medico', 'secretario']
      };

      const allowedRoles = routePermissions[item.href] || [];
      
      // Verificar si el usuario tiene alguno de los roles permitidos
      return allowedRoles.some(role => RoleHelper.hasRole(auth.user!, role));
    });
  };

  // Obtener items filtrados automáticamente
  const filteredNavItems = filterNavItemsByRole(mainNavItems);

  return {
    user: auth.user,
    mainNavItems: filteredNavItems,
    filterNavItemsByRole,
    isMedico: auth.user ? RoleHelper.isMedico(auth.user) : false,
    isSecretario: auth.user ? RoleHelper.isSecretario(auth.user) : false,
  };
};