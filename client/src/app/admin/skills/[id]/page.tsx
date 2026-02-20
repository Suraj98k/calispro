'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAdminSkillProgramById } from '@/lib/hooks/useApi';
import { Button } from '@/components/ui/button';

export default function AdminSkillViewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const { data, isLoading } = useAdminSkillProgramById(id, { enabled: !!id });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-soft">Skill not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">{data.skill}</h1>
          <p className="mt-1 text-sm text-soft">Slug: {data.slug}</p>
        </div>
        <Button asChild>
          <Link href={`/admin/skills/${id}/edit`}>Edit Skill</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-surface-1 p-4">
        <pre className="overflow-auto text-xs text-soft">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
