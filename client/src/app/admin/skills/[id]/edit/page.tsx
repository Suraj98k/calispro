'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SkillProgramForm } from '@/components/admin/SkillProgramForm';
import { useAdminSkillProgramById, useUpdateAdminSkillProgram } from '@/lib/hooks/useApi';

export default function EditAdminSkillPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id || '';

  const { data, isLoading } = useAdminSkillProgramById(id, { enabled: !!id });
  const updateMutation = useUpdateAdminSkillProgram();

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
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight">Edit Skill</h1>
        <p className="mt-1 text-sm text-soft">Update details, structure, and images.</p>
      </div>

      <SkillProgramForm
        initialValue={data}
        submitLabel="Update Skill"
        isSubmitting={updateMutation.isPending}
        onSubmit={async (payload) => {
          await updateMutation.mutateAsync({ id, payload });
          toast.success('Skill updated successfully');
          router.push('/admin/skills');
        }}
      />
    </div>
  );
}
