'use client';

import Link from 'next/link';
import { MoreVertical, Pencil, Plus, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDeleteAdminExercise, useExercises } from '@/lib/hooks/useApi';

export default function AdminExercisesPage() {
  const { data: exercises, isLoading } = useExercises();
  const deleteMutation = useDeleteAdminExercise();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const onDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Exercise deleted');
      setOpenMenuId(null);
    } catch {
      toast.error('Failed to delete exercise');
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
            <p className="text-[11px] font-black uppercase tracking-widest text-primary">Admin Exercises</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white">Exercise List</h1>
            <p className="mt-1 text-sm text-soft">Manage exercise cards with quick actions.</p>
          </div>
          <Link
            href="/admin/exercises/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-black uppercase tracking-wider text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Create New
          </Link>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(exercises || []).map((exercise) => (
          <article key={exercise.id} className="relative app-surface p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-white">{exercise.name}</p>
                <p className="mt-1 text-xs text-soft">
                  {exercise.category} | {exercise.level}
                </p>
              </div>
              <button
                onClick={() => setOpenMenuId((prev) => (prev === exercise.id ? null : exercise.id))}
                className="rounded-md border border-border bg-surface-2 p-1.5 text-soft hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <p className="line-clamp-3 text-xs text-soft">{exercise.description}</p>

            {openMenuId === exercise.id && (
              <div className="absolute right-3 top-12 z-20 min-w-36 rounded-md border border-border bg-surface-1 p-1 shadow-lg">
                <Link
                  href={`/dashboard/exercises/${exercise.id}`}
                  className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-soft hover:bg-surface-2 hover:text-white"
                  onClick={() => setOpenMenuId(null)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Link>
                <Link
                  href={`/admin/exercises/${exercise.id}/edit`}
                  className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-soft hover:bg-surface-2 hover:text-white"
                  onClick={() => setOpenMenuId(null)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(exercise.id, exercise.name)}
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
