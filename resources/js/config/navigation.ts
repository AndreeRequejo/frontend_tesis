import { LayoutGrid, UsersRound, FileUser, ScanFace } from 'lucide-react';
import { type NavItem } from '@/types';

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
    title: 'Historial clínico',
    href: '/historial',
    icon: FileUser,
  },
];