'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3, Dumbbell, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { name: 'Overview', href: '/admin', icon: BarChart3 },
  { name: 'Skills', href: '/admin/skills', icon: Zap },
  { name: 'Exercises', href: '/admin/exercises', icon: Dumbbell },
  { name: 'Workouts', href: '/admin/workouts', icon: Dumbbell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-[240px] border-r border-border bg-surface-1 p-6 md:block">
        <Link href="/admin" className="mb-6 flex items-center gap-2 text-lg font-black uppercase tracking-wide">
          <Shield className="h-4 w-4 text-primary" />
          Admin
        </Link>

        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-soft hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>

        <nav className="space-y-2">
          {adminNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold',
                pathname === item.href ? 'bg-primary text-primary-foreground' : 'text-soft hover:bg-surface-2 hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-h-screen p-4 md:ml-[240px] md:p-8">{children}</main>
    </div>
  );
}
