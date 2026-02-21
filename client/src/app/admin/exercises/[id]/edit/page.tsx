'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useExercises, useUpdateAdminExercise, useUploadAdminImage } from '@/lib/hooks/useApi';

const parseList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

type FormState = {
  name: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Push' | 'Pull' | 'Core' | 'Legs' | 'Full Body' | 'Balance' | 'Static';
  primaryMuscles: string;
  secondaryMuscles: string;
  formTips: string;
  commonMistakes: string;
  videoUrl: string;
  imageUrl: string;
};

const initialForm: FormState = {
  name: '',
  description: '',
  level: 'Beginner',
  category: 'Push',
  primaryMuscles: '',
  secondaryMuscles: '',
  formTips: '',
  commonMistakes: '',
  videoUrl: '',
  imageUrl: '',
};

export default function AdminExerciseEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: exercises, isLoading } = useExercises();
  const updateMutation = useUpdateAdminExercise();
  const uploadMutation = useUploadAdminImage();
  const [overrides, setOverrides] = useState<Partial<FormState>>({});
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string>('');
  const exercise = (exercises || []).find((item) => item.id === id);

  const onSelectImage = (file?: File | null) => {
    if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview);
    if (!file) {
      setSelectedImageFile(null);
      setSelectedImagePreview('');
      return;
    }
    setSelectedImageFile(file);
    setSelectedImagePreview(URL.createObjectURL(file));
  };

  const onUploadSelected = async () => {
    if (!selectedImageFile) {
      toast.error('Select an image first');
      return;
    }
    try {
      const uploaded = await uploadMutation.mutateAsync({ file: selectedImageFile, folder: 'calispro/exercises' });
      setOverrides((prev) => ({ ...prev, imageUrl: uploaded.url }));
      setSelectedImageFile(null);
      if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview);
      setSelectedImagePreview('');
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  const onSubmit = async () => {
    const form: FormState = {
      name: overrides.name ?? exercise?.name ?? initialForm.name,
      description: overrides.description ?? exercise?.description ?? initialForm.description,
      level: overrides.level ?? exercise?.level ?? initialForm.level,
      category: overrides.category ?? exercise?.category ?? initialForm.category,
      primaryMuscles: overrides.primaryMuscles ?? (exercise?.primaryMuscles || []).join(', '),
      secondaryMuscles: overrides.secondaryMuscles ?? (exercise?.secondaryMuscles || []).join(', '),
      formTips: overrides.formTips ?? (exercise?.formTips || []).join(', '),
      commonMistakes: overrides.commonMistakes ?? (exercise?.commonMistakes || []).join(', '),
      videoUrl: overrides.videoUrl ?? exercise?.videoUrl ?? initialForm.videoUrl,
      imageUrl: overrides.imageUrl ?? exercise?.imageUrl ?? initialForm.imageUrl,
    };

    if (!form.name.trim()) {
      toast.error('Exercise name is required');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Exercise description is required');
      return;
    }

    const payload: Parameters<typeof updateMutation.mutateAsync>[0]['payload'] = {
      name: form.name.trim(),
      description: form.description.trim(),
      level: form.level,
      category: form.category,
      primaryMuscles: parseList(form.primaryMuscles),
      secondaryMuscles: parseList(form.secondaryMuscles),
      formTips: parseList(form.formTips),
      commonMistakes: parseList(form.commonMistakes),
    };

    if (form.videoUrl.trim()) {
      payload.videoUrl = form.videoUrl.trim();
    }
    
    if (form.imageUrl.trim()) {
      payload.imageUrl = form.imageUrl.trim();
    }

    try {
      await updateMutation.mutateAsync({ id, payload });
      toast.success('Exercise updated');
      router.push('/admin/exercises');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Request failed';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!exercise) {
    return <p className="text-sm text-soft">Exercise not found.</p>;
  }

  const form: FormState = {
    name: overrides.name ?? exercise.name,
    description: overrides.description ?? exercise.description,
    level: overrides.level ?? exercise.level,
    category: overrides.category ?? exercise.category,
    primaryMuscles: overrides.primaryMuscles ?? (exercise.primaryMuscles || []).join(', '),
    secondaryMuscles: overrides.secondaryMuscles ?? (exercise.secondaryMuscles || []).join(', '),
    formTips: overrides.formTips ?? (exercise.formTips || []).join(', '),
    commonMistakes: overrides.commonMistakes ?? (exercise.commonMistakes || []).join(', '),
    videoUrl: overrides.videoUrl ?? exercise.videoUrl ?? '',
    imageUrl: overrides.imageUrl ?? exercise.imageUrl ?? '',
  };

  return (
    <div className="space-y-6">
      <header className="app-surface p-6">
        <Link href="/admin/exercises" className="inline-flex items-center gap-2 text-xs font-semibold text-soft hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Exercise List
        </Link>
        <h1 className="mt-3 text-2xl font-black text-white">Edit Exercise</h1>
      </header>

      <section className="app-surface p-5">
        <div className="grid gap-3">
          <label className="text-xs font-semibold text-soft">Exercise Name</label>
          <Input placeholder="Exercise name" value={form.name} onChange={(e) => setOverrides((prev) => ({ ...prev, name: e.target.value }))} />
          <label className="text-xs font-semibold text-soft">Description</label>
          <textarea className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={(e) => setOverrides((prev) => ({ ...prev, description: e.target.value }))} />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-soft">Level</label>
              <select className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.level} onChange={(e) => setOverrides((prev) => ({ ...prev, level: e.target.value as FormState['level'] }))}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-soft">Category</label>
              <select className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.category} onChange={(e) => setOverrides((prev) => ({ ...prev, category: e.target.value as FormState['category'] }))}>
                <option value="Push">Push</option>
                <option value="Pull">Pull</option>
                <option value="Core">Core</option>
                <option value="Legs">Legs</option>
                <option value="Full Body">Full Body</option>
                <option value="Balance">Balance</option>
                <option value="Static">Static</option>
              </select>
            </div>
          </div>
          <label className="text-xs font-semibold text-soft">Primary Muscles (comma separated)</label>
          <Input placeholder="Primary muscles (comma separated)" value={form.primaryMuscles} onChange={(e) => setOverrides((prev) => ({ ...prev, primaryMuscles: e.target.value }))} />
          <label className="text-xs font-semibold text-soft">Secondary Muscles (comma separated)</label>
          <Input placeholder="Secondary muscles (comma separated)" value={form.secondaryMuscles} onChange={(e) => setOverrides((prev) => ({ ...prev, secondaryMuscles: e.target.value }))} />
          <label className="text-xs font-semibold text-soft">Form Tips (comma separated)</label>
          <Input placeholder="Form tips (comma separated)" value={form.formTips} onChange={(e) => setOverrides((prev) => ({ ...prev, formTips: e.target.value }))} />
          <label className="text-xs font-semibold text-soft">Common Mistakes (comma separated)</label>
          <Input placeholder="Common mistakes (comma separated)" value={form.commonMistakes} onChange={(e) => setOverrides((prev) => ({ ...prev, commonMistakes: e.target.value }))} />
          <label className="text-xs font-semibold text-soft">Video URL (optional)</label>
          <Input placeholder="Video URL (optional)" value={form.videoUrl} onChange={(e) => setOverrides((prev) => ({ ...prev, videoUrl: e.target.value }))} />
          <div className="rounded-md border border-dashed border-border p-3">
            <label className="text-xs font-semibold text-soft">Upload Exercise Image</label>
            <input type="file" accept="image/*" onChange={(e) => onSelectImage(e.target.files?.[0])} className="mt-2 block" />
            {selectedImagePreview ? <img src={selectedImagePreview} alt="selected preview" className="mt-3 h-24 w-24 rounded-md border border-border object-cover" /> : null}
            {selectedImageFile ? (
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={onUploadSelected} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                  Upload Image
                </button>
                <button type="button" onClick={() => onSelectImage(null)} className="rounded-md border border-border px-3 py-1.5 text-xs text-soft">
                  Remove Selected
                </button>
              </div>
            ) : null}
            {form.imageUrl ? (
              <div className="mt-2">
                <img src={form.imageUrl} alt="uploaded preview" className="h-24 w-24 rounded-md border border-border object-cover" />
                <button type="button" onClick={() => setOverrides((prev) => ({ ...prev, imageUrl: '' }))} className="mt-2 rounded-md border border-border px-3 py-1.5 text-xs text-soft">
                  Remove Uploaded
                </button>
              </div>
            ) : null}
          </div>
          <Button onClick={onSubmit} disabled={updateMutation.isPending || uploadMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Update Exercise'}
          </Button>
        </div>
      </section>
    </div>
  );
}
