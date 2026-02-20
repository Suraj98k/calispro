'use client';

import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateAdminWorkout, useExercises, useUploadAdminImage } from '@/lib/hooks/useApi';

type DraftExercise = {
  id: string;
  exerciseId: string;
  sets: number;
  mode: 'reps' | 'duration';
  target: number;
};

type FormState = {
  name: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationEstimate: number;
  imageUrl: string;
  isRecommended: boolean;
  isGlobal: boolean;
};

const createDraftExercise = (): DraftExercise => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  exerciseId: '',
  sets: 3,
  mode: 'reps',
  target: 10,
});

const initialForm: FormState = {
  name: '',
  description: '',
  level: 'Beginner',
  durationEstimate: 30,
  imageUrl: '',
  isRecommended: false,
  isGlobal: true,
};

export default function AdminWorkoutCreatePage() {
  const router = useRouter();
  const { data: exercises } = useExercises();
  const createMutation = useCreateAdminWorkout();
  const uploadMutation = useUploadAdminImage();
  const [form, setForm] = useState<FormState>(initialForm);
  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([createDraftExercise()]);
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

  const setDraft = (id: string, updater: (prev: DraftExercise) => DraftExercise) => {
    setDraftExercises((prev) => prev.map((row) => (row.id === id ? updater(row) : row)));
  };

  const onUploadSelected = async () => {
    if (!selectedImageFile) {
      toast.error('Select an image first');
      return;
    }
    try {
      const uploaded = await uploadMutation.mutateAsync({ file: selectedImageFile, folder: 'calispro/workouts' });
      setForm((prev) => ({ ...prev, imageUrl: uploaded.url }));
      setSelectedImageFile(null);
      if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview);
      setSelectedImagePreview('');
      toast.success('Workout image uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  const onSubmit = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      toast.error('Name and description are required');
      return;
    }

    const selectedRows = draftExercises.filter((entry) => entry.exerciseId);
    if (!selectedRows.length) {
      toast.error('Select at least one exercise');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      level: form.level,
      durationEstimate: Math.max(5, form.durationEstimate),
      imageUrl: form.imageUrl.trim() || undefined,
      isRecommended: form.isRecommended,
      isGlobal: form.isGlobal,
      exercises: selectedRows.map((entry) => ({
        exerciseId: entry.exerciseId,
        sets: Math.max(1, entry.sets),
        reps: entry.mode === 'reps' ? Math.max(1, entry.target) : undefined,
        duration: entry.mode === 'duration' ? Math.max(5, entry.target) : undefined,
      })),
    };

    try {
      await createMutation.mutateAsync(payload);
      toast.success('Workout created');
      router.push('/admin/workouts');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Request failed';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <header className="app-surface p-6">
        <Link href="/admin/workouts" className="inline-flex items-center gap-2 text-xs font-semibold text-soft hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Workout List
        </Link>
        <h1 className="mt-3 text-2xl font-black text-white">Create Workout</h1>
      </header>

      <section className="app-surface p-5">
        <div className="space-y-3">
          <label className="text-xs font-semibold text-soft">Workout Name</label>
          <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Workout name" />
          <label className="text-xs font-semibold text-soft">Description</label>
          <textarea
            className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
          />

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-soft">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value as FormState['level'] }))}
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-soft">Duration (minutes)</label>
              <Input
                type="number"
                min={5}
                value={form.durationEstimate}
                onChange={(e) => setForm((prev) => ({ ...prev, durationEstimate: Number(e.target.value) }))}
                placeholder="Duration (minutes)"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 rounded-md border border-border bg-surface-2/30 p-3">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-soft">
              <input
                type="checkbox"
                checked={form.isGlobal}
                onChange={(e) => setForm((prev) => ({ ...prev, isGlobal: e.target.checked }))}
              />
              Global workout
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-soft">
              <input
                type="checkbox"
                checked={form.isRecommended}
                onChange={(e) => setForm((prev) => ({ ...prev, isRecommended: e.target.checked }))}
              />
              Recommended
            </label>
          </div>

          <div className="rounded-md border border-dashed border-border p-3">
            <label className="text-xs font-semibold text-soft">Upload workout image</label>
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
                <img src={form.imageUrl} alt="workout preview" className="h-24 w-24 rounded-md border border-border object-cover" />
                <button type="button" onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))} className="mt-2 rounded-md border border-border px-3 py-1.5 text-xs text-soft">
                  Remove Uploaded
                </button>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 rounded-md border border-border bg-surface-2/20 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-soft">Exercises</p>
              <button
                onClick={() => setDraftExercises((prev) => [...prev, createDraftExercise()])}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] font-semibold"
              >
                <Plus className="h-3 w-3" />
                Add Exercise
              </button>
            </div>

            {draftExercises.map((row) => (
              <div key={row.id} className="rounded-md border border-border bg-surface-2/30 p-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-soft">Exercise</label>
                    <select
                      value={row.exerciseId}
                      onChange={(e) => setDraft(row.id, (prev) => ({ ...prev, exerciseId: e.target.value }))}
                      className="h-9 w-full rounded border border-border bg-surface-2 px-2 text-xs"
                    >
                      <option value="">Select exercise</option>
                      {(exercises || []).map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-soft">Sets</label>
                      <Input
                        type="number"
                        min={1}
                        value={row.sets}
                        onChange={(e) => setDraft(row.id, (prev) => ({ ...prev, sets: Number(e.target.value) }))}
                        placeholder="Sets"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-soft">Mode</label>
                      <select
                        value={row.mode}
                        onChange={(e) => setDraft(row.id, (prev) => ({ ...prev, mode: e.target.value as DraftExercise['mode'] }))}
                        className="h-9 w-full rounded border border-border bg-surface-2 px-2 text-xs"
                      >
                        <option value="reps">Reps</option>
                        <option value="duration">Secs</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-soft">Target</label>
                      <Input
                        type="number"
                        min={1}
                        value={row.target}
                        onChange={(e) => setDraft(row.id, (prev) => ({ ...prev, target: Number(e.target.value) }))}
                        placeholder="Target"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => setDraftExercises((prev) => prev.filter((item) => item.id !== row.id))}
                    disabled={draftExercises.length === 1}
                    className="inline-flex items-center gap-1 text-[11px] text-red-400 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={onSubmit} disabled={createMutation.isPending || uploadMutation.isPending}>
            {createMutation.isPending ? 'Saving...' : 'Create Workout'}
          </Button>
        </div>
      </section>
    </div>
  );
}
