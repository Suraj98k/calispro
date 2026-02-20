// client/src/components/common/main-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck2, Dumbbell, Flame, History, House, Shield, Sparkles, UserRound, Zap } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { usePlans, useProfile, useStreakStats } from '@/lib/hooks/useApi';

export function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: streak } = useStreakStats();
  const { data: plans } = usePlans();
  const hideNav =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/dashboard/track');

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: House },
    { name: 'Skills', href: '/dashboard/skills', icon: Zap },
    { name: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
    { name: 'Exercises', href: '/dashboard/exercises', icon: Dumbbell },
    { name: 'Planning', href: '/dashboard/planning', icon: CalendarCheck2 },
    { name: 'History', href: '/dashboard/history', icon: History },
    { name: 'Profile', href: '/dashboard/profile', icon: UserRound },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin', href: '/admin', icon: Shield });
  }

  if (hideNav) return null;

  const sessionsLast7Days = streak?.sessionsLast7Days || 0;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-border bg-surface-1 p-6 md:flex">
        <Link href="/" className="mb-6 flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-surface-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Calispro</p>
            <p className="text-[11px] text-soft">Skills MVP</p>
          </div>
        </Link>

        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all',
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-soft hover:bg-surface-2 hover:text-foreground'
                  : pathname.startsWith(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-soft hover:bg-surface-2 hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-5 space-y-3">
          <div className="rounded-xl border border-border bg-surface-2/30 p-3">
            <div className="flex items-center gap-2 text-primary">
              <Flame className="h-3.5 w-3.5" />
              <p className="text-[10px] font-black uppercase tracking-widest">Streak</p>
            </div>
            <p className="mt-2 text-sm font-semibold text-white">{streak?.currentStreak || 0} day current</p>
            <p className="mt-1 text-[11px] text-soft">Best {streak?.longestStreak || 0} | Weekly {sessionsLast7Days} | Plans {plans?.length || 0}</p>
          </div>


        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-2 backdrop-blur-lg md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-soft hover:text-foreground'
                  : pathname.startsWith(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-soft hover:text-foreground'
              )}
              aria-label={item.name}
            >
              <item.icon className="h-[18px] w-[18px]" />
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

