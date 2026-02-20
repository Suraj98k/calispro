'use client';

import Link from 'next/link';
import { Eye, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminWorkouts, useDeleteAdminWorkout } from '@/lib/hooks/useApi';

export default function AdminWorkoutsPage() {
  const { data: workouts, isLoading } = useAdminWorkouts();
  const deleteMutation = useDeleteAdminWorkout();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const onDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Workout deleted');
      setOpenMenuId(null);
    } catch {
      toast.error('Failed to delete workout');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="app-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-primary">Admin Workouts</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white">Workout List</h1>
            <p className="mt-1 text-sm text-soft">Manage workout cards with quick actions.</p>
          </div>
          <Link
            href="/admin/workouts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-black uppercase tracking-wider text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Create New
          </Link>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(workouts || []).map((workout) => (
          <article key={workout.id} className="relative app-surface p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-white">{workout.name}</p>
                <p className="mt-1 text-xs text-soft">
                  {workout.level} | {workout.durationEstimate || 0} min | {workout.exercises.length} exercises
                </p>
              </div>
              <button
                onClick={() => setOpenMenuId((prev) => (prev === workout.id ? null : workout.id))}
                className="rounded-md border border-border bg-surface-2 p-1.5 text-soft hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <p className="line-clamp-3 text-xs text-soft">{workout.description}</p>
            <p className="mt-2 text-[11px] text-soft">{workout.isGlobal ? 'Global' : 'Private'}{workout.isRecommended ? ' | Recommended' : ''}</p>

            {openMenuId === workout.id && (
              <div className="absolute right-3 top-12 z-20 min-w-36 rounded-md border border-border bg-surface-1 p-1 shadow-lg">
                <Link
                  href={`/dashboard/workouts/${workout.id}`}
                  className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-soft hover:bg-surface-2 hover:text-white"
                  onClick={() => setOpenMenuId(null)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Link>
                <Link
                  href={`/admin/workouts/${workout.id}/edit`}
                  className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-soft hover:bg-surface-2 hover:text-white"
                  onClick={() => setOpenMenuId(null)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(workout.id, workout.name)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-red-400 hover:bg-surface-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
