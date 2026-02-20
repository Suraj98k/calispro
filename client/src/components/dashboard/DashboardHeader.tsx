'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, CircleUser, LogOut, Play, Shield } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSkillPrograms } from '@/lib/hooks/useApi';

const PLAN_STORAGE_KEY = 'skills-mvp-plan-v1';

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const { data: programs } = useSkillPrograms();
  const [time, setTime] = useState(new Date());

  const quickStartHref = useMemo(() => {
    if (!programs?.length) return '/dashboard/skills';

    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
      if (raw) {
        try {
          const planned = JSON.parse(raw) as string[];
          const next = planned.find((slug) => programs.some((entry) => entry.slug === slug));
          if (next) return `/dashboard/skills/${next}`;
        } catch {
          // ignore malformed local storage
        }
      }
    }

    return `/dashboard/skills/${programs[0].slug}`;
  }, [programs]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });

  const pathSegments = pathname.split('/').filter(Boolean);

  const getLabel = (path: string) => {
    const mapping: Record<string, string> = {
      dashboard: 'Overview',
      planning: 'Skill Planning',
      skills: 'Skills',
      profile: 'Profile',
      track: 'Session',
    };
    return mapping[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  if (pathname.startsWith('/dashboard/track')) return null;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md md:px-8">
      <nav className="flex items-center text-[10px] font-black uppercase tracking-widest text-white/40">
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          const label = getLabel(segment);

          return (
            <React.Fragment key={href}>
              {index > 0 && <ChevronRight className="mx-2 h-3 w-3 text-white/20" />}
              {isLast ? (
                <span className="text-white">{label}</span>
              ) : (
                <Link href={href} className="hover:text-primary transition-colors">
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(quickStartHref)}
          className="hidden items-center gap-2 rounded-xl bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary-foreground md:flex"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          Start Skill
        </button>

        <p className="hidden text-xs font-black text-white tabular-nums tracking-widest border border-white/5 bg-black/20 px-3 py-1 rounded-md md:block">
          {formattedTime}
        </p>

        <button
          onClick={logout}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-black/20 text-soft transition-all hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>

        <button
          onClick={() => router.push(user?.role === 'admin' ? '/admin' : '/dashboard/profile')}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-black/20 text-soft transition-all hover:bg-surface-2 hover:text-white hover:border-primary/30"
          title={user?.role === 'admin' ? 'Open Admin Panel' : 'Profile'}
        >
          {user?.role === 'admin' ? <Shield className="h-5 w-5" /> : <CircleUser className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}

