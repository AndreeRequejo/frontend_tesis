import { cn } from '@/lib/utils'; // Para concatenar clases
import { NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface BottomBarProps {
    items: NavItem[];
}

export function BottomBar({ items }: BottomBarProps) {
    const { url } = usePage();

    return (
        <div className="fixed right-0 bottom-0 left-0 z-50 flex h-14 justify-around overflow-hidden rounded-t-xl border-t border-border bg-background shadow-md md:hidden">
            {items.map((item) => {
                const isActive = url.startsWith(item.href); // O usa === si quieres exacto

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex flex-col items-center justify-center rounded-md px-4 py-2 text-xs transition-colors',
                            isActive ? 'bg-primary/10 font-medium text-foreground' : 'text-foreground/75 hover:text-foreground',
                        )}
                    >
                        {item.icon && <item.icon className={cn('mb-1 h-5 w-5', isActive ? 'text-primary' : 'text-foreground/80')} />}
                        {item.title}
                    </Link>
                );
            })}
        </div>
    );
}