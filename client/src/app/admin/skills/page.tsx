'use client';

import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminSkillPrograms, useDeleteAdminSkillProgram } from '@/lib/hooks/useApi';
import { Button } from '@/components/ui/button';

export default function AdminSkillsPage() {
  const { data: programs, isLoading } = useAdminSkillPrograms();
  const deleteMutation = useDeleteAdminSkillProgram();

  const handleDelete = async (id?: string, name?: string) => {
    if (!id) return;
    if (!window.confirm(`Delete ${name || 'this skill'}? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Skill deleted');
    } catch {
      toast.error('Failed to delete skill');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Skills</h1>
          <p className="mt-1 text-sm text-soft">All available skills are listed below.</p>
        </div>
        <Button asChild>
          <Link href="/admin/skills/new">Create Skill</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(programs || []).map((program) => (
          <article key={program.id || program.slug} className="rounded-xl border border-border bg-surface-1 p-4">
            {program.image ? (
              <img src={program.image} alt={program.skill} className="mb-3 h-32 w-full rounded-md object-cover" />
            ) : null}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">{program.skill}</h2>
                <p className="mt-1 text-xs text-soft">{program.slug}</p>
              </div>

              <details className="relative">
                <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md border border-border text-soft hover:bg-surface-2">
                  <MoreVertical className="h-4 w-4" />
                </summary>
                <div className="absolute right-0 z-10 mt-2 w-28 rounded-md border border-border bg-surface-1 p-1 shadow-lg">
                  <Link href={`/admin/skills/${program.id}`} className="block rounded px-2 py-1 text-sm hover:bg-surface-2">
                    View
                  </Link>
                  <Link href={`/admin/skills/${program.id}/edit`} className="block rounded px-2 py-1 text-sm hover:bg-surface-2">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="block w-full rounded px-2 py-1 text-left text-sm text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDelete(program.id, program.skill)}
                  >
                    Delete
                  </button>
                </div>
              </details>
            </div>

            <p className="mt-3 text-xs text-soft">{program.progressions.length} progression step(s)</p>
          </article>
        ))}
      </div>

      {!programs?.length && <p className="text-sm text-soft">No skills found.</p>}
    </div>
  );
}
