'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateAdminExercise, useUploadAdminImage } from '@/lib/hooks/useApi';

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

export default function AdminExerciseCreatePage() {
  const router = useRouter();
  const createMutation = useCreateAdminExercise();
  const uploadMutation = useUploadAdminImage();
  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string>('');

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
      setForm((prev) => ({ ...prev, imageUrl: uploaded.url }));
      setSelectedImageFile(null);
      if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview);
      setSelectedImagePreview('');
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  const onSubmit = async () => {
    if (!form.name.trim() || !form.description.trim() || !form.imageUrl.trim()) {
      toast.error('Name, description, and image are required');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      level: form.level,
      category: form.category,
      primaryMuscles: parseList(form.primaryMuscles),
      secondaryMuscles: parseList(form.secondaryMuscles),
      formTips: parseList(form.formTips),
      commonMistakes: parseList(form.commonMistakes),
      videoUrl: form.videoUrl.trim() || undefined,
      imageUrl: form.imageUrl.trim(),
    };

    try {
      await createMutation.mutateAsync(payload);
      toast.success('Exercise created');
      router.push('/admin/exercises');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Request failed';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <header className="app-surface p-6">
        <Link href="/admin/exercises" className="inline-flex items-center gap-2 text-xs font-semibold text-soft hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Exercise List
        </Link>
        <h1 className="mt-3 text-2xl font-black text-white">Create Exercise</h1>
      </header>

      <section className="app-surface p-5">
        <div className="grid gap-3">
          <label className="text-xs font-semibold text-soft">Exercise Name</label>
          <Input placeholder="Exercise name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          <label className="text-xs font-semibold text-soft">Description</label>
          <textarea className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-soft">Level</label>
              <select className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.level} onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value as FormState['level'] }))}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-soft">Category</label>
              <select className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as FormState['category'] }))}>
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
          <Input placeholder="Primary muscles (comma separated)" value={form.primaryMuscles} onChange={(e) => setForm((prev) => ({ ...prev, primaryMuscles: e.target.value }))} />
          <label className="text-xs font-semibold text-soft">Secondary Muscles (comma separated)</label>
          <Input placeholder="Secondary muscles (comma separated)" value={form.secondaryMuscles} onChange={(e) => setForm((prev) => ({ ...prev, secondaryMuscles: e.target.value }))} />
          <label className="text-xs font-semibold text-soft">Form Tips (comma separated)</label>
          <Input placeholder="Form tips (comma separated)" value={form.formTips} onChange={(e) => setForm((prev) => ({ ...prev, formTips: e.target.value }))} />
          <label className="text-xs font-semibold text-soft">Common Mistakes (comma separated)</label>
          <Input placeholder="Common mistakes (comma separated)" value={form.commonMistakes} onChange={(e) => setForm((prev) => ({ ...prev, commonMistakes: e.target.value }))} />
          <label className="text-xs font-semibold text-soft">Video URL (optional)</label>
          <Input placeholder="Video URL (optional)" value={form.videoUrl} onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))} />
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
                <button type="button" onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))} className="mt-2 rounded-md border border-border px-3 py-1.5 text-xs text-soft">
                  Remove Uploaded
                </button>
              </div>
            ) : null}
          </div>
          <Button onClick={onSubmit} disabled={createMutation.isPending || uploadMutation.isPending}>
            {createMutation.isPending ? 'Saving...' : 'Create Exercise'}
          </Button>
        </div>
      </section>
    </div>
  );
}
