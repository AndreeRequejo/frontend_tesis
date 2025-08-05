import { NavItem } from '@/types';
import { Link } from '@inertiajs/react';

interface BottomBarProps {
  items: NavItem[];
}

export function BottomBar({ items }: BottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t bg-white shadow-md rounded-t-xl overflow-hidden md:hidden">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-col items-center justify-center px-4 py-2 text-xs text-muted-foreground hover:text-primary"
        >
          {item.icon && <item.icon className="mb-1 h-5 w-5" />}
          {item.title}
        </Link>
      ))}
    </div>
  );
}