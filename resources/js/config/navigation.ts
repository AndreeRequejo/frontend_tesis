import { LayoutGrid, UsersRound, FileUser, ScanFace, CircleUserRound } from 'lucide-react';
import { type NavItem } from '@/types';

export const mainNavItems: NavItem[] = [
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
    title: 'Inicio',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Historial',
    href: '/historial',
    icon: FileUser,
  },
  {
    title: 'Perfil',
    href: '/settings/profile',
    icon: CircleUserRound,
  },
];