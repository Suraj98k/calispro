'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SkillProgramForm } from '@/components/admin/SkillProgramForm';
import { useCreateAdminSkillProgram } from '@/lib/hooks/useApi';

export default function CreateAdminSkillPage() {
  const router = useRouter();
  const createMutation = useCreateAdminSkillProgram();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Create Skill</h1>
          <p className="mt-1 text-sm text-soft">Fill the full structure and upload images where needed.</p>
        </div>
      </div>

      <SkillProgramForm
        submitLabel="Create Skill"
        isSubmitting={createMutation.isPending}
        onSubmit={async (payload) => {
          await createMutation.mutateAsync(payload);
          toast.success('Skill created successfully');
          router.push('/admin/skills');
        }}
      />
    </div>
  );
}
