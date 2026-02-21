'use client';

import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminWorkouts, useExercises, useUpdateAdminWorkout, useUploadAdminImage } from '@/lib/hooks/useApi';

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
  videoUrl: string;
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
  videoUrl: '',
  isRecommended: false,
  isGlobal: true,
};

export default function AdminWorkoutEditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: exercises } = useExercises();
  const { data: workouts, isLoading } = useAdminWorkouts();
  const updateMutation = useUpdateAdminWorkout();
  const uploadMutation = useUploadAdminImage();
  const [overrides, setOverrides] = useState<Partial<FormState>>({});
  const [draftExercises, setDraftExercises] = useState<DraftExercise[] | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string>('');
  const workout = (workouts || []).find((item) => item.id === id);
  const fallbackRows = useMemo(
    () =>
      (workout?.exercises || []).map((entry, idx) => ({
        id: `${id}-${idx}`,
        exerciseId: entry.exerciseId,
        sets: entry.sets || 1,
        mode: entry.duration ? ('duration' as const) : ('reps' as const),
        target: entry.duration || (typeof entry.reps === 'number' ? entry.reps : 10),
      })),
    [workout, id],
  );
  const rows = draftExercises ?? fallbackRows;

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

  const setDraft = (rowId: string, updater: (prev: DraftExercise) => DraftExercise) => {
    setDraftExercises((prev) => {
      const source = prev ?? fallbackRows;
      return source.map((row) => (row.id === rowId ? updater(row) : row));
    });
  };

  const onUploadSelected = async () => {
    if (!selectedImageFile) {
      toast.error('Select an image first');
      return;
    }
    try {
      const uploaded = await uploadMutation.mutateAsync({ file: selectedImageFile, folder: 'calispro/workouts' });
      setOverrides((prev) => ({ ...prev, imageUrl: uploaded.url }));
      setSelectedImageFile(null);
      if (selectedImagePreview) URL.revokeObjectURL(selectedImagePreview);
      setSelectedImagePreview('');
      toast.success('Workout image uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  const onSubmit = async () => {
    const form: FormState = {
      name: overrides.name ?? workout?.name ?? initialForm.name,
      description: overrides.description ?? workout?.description ?? initialForm.description,
      level: overrides.level ?? workout?.level ?? initialForm.level,
      durationEstimate: overrides.durationEstimate ?? workout?.durationEstimate ?? initialForm.durationEstimate,
      imageUrl: overrides.imageUrl ?? workout?.imageUrl ?? initialForm.imageUrl,
      videoUrl: overrides.videoUrl ?? workout?.videoUrl ?? initialForm.videoUrl,
      isRecommended: overrides.isRecommended ?? !!workout?.isRecommended,
      isGlobal: overrides.isGlobal ?? (workout?.isGlobal !== false),
    };

    if (!form.name.trim() || !form.description.trim()) {
      toast.error('Name and description are required');
      return;
    }

    const selectedRows = rows.filter((entry) => entry.exerciseId);
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
      videoUrl: form.videoUrl.trim() || undefined,
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
      await updateMutation.mutateAsync({ id, payload });
      toast.success('Workout updated');
      router.push('/admin/workouts');
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

  if (!workout) return <p className="text-sm text-soft">Workout not found.</p>;

  const form: FormState = {
    name: overrides.name ?? workout.name,
    description: overrides.description ?? workout.description,
    level: overrides.level ?? workout.level,
    durationEstimate: overrides.durationEstimate ?? workout.durationEstimate ?? 30,
    imageUrl: overrides.imageUrl ?? workout.imageUrl ?? '',
    videoUrl: overrides.videoUrl ?? workout.videoUrl ?? '',
    isRecommended: overrides.isRecommended ?? !!workout.isRecommended,
    isGlobal: overrides.isGlobal ?? (workout.isGlobal !== false),
  };

  return (
    <div className="space-y-6">
      <header className="app-surface p-6">
        <Link href="/admin/workouts" className="inline-flex items-center gap-2 text-xs font-semibold text-soft hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Workout List
        </Link>
        <h1 className="mt-3 text-2xl font-black text-white">Edit Workout</h1>
      </header>

      <section className="app-surface p-5">
        <div className="space-y-3">
          <label className="text-xs font-semibold text-soft">Workout Name</label>
          <Input value={form.name} onChange={(e) => setOverrides((prev) => ({ ...prev, name: e.target.value }))} placeholder="Workout name" />
          <label className="text-xs font-semibold text-soft">Description</label>
          <textarea
            className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            value={form.description}
            onChange={(e) => setOverrides((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
          />

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-soft">Level</label>
              <select
                value={form.level}
                onChange={(e) => setOverrides((prev) => ({ ...prev, level: e.target.value as FormState['level'] }))}
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
                onChange={(e) => setOverrides((prev) => ({ ...prev, durationEstimate: Number(e.target.value) }))}
                placeholder="Duration (minutes)"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 rounded-md border border-border bg-surface-2/30 p-3">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-soft">
              <input
                type="checkbox"
                checked={form.isGlobal}
                onChange={(e) => setOverrides((prev) => ({ ...prev, isGlobal: e.target.checked }))}
              />
              Global workout
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-soft">
              <input
                type="checkbox"
                checked={form.isRecommended}
                onChange={(e) => setOverrides((prev) => ({ ...prev, isRecommended: e.target.checked }))}
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
                <button type="button" onClick={() => setOverrides((prev) => ({ ...prev, imageUrl: '' }))} className="mt-2 rounded-md border border-border px-3 py-1.5 text-xs text-soft">
                  Remove Uploaded
                </button>
              </div>
            ) : null}
          </div>

          <label className="text-xs font-semibold text-soft">Workout Video URL (optional)</label>
          <Input
            value={form.videoUrl}
            onChange={(e) => setOverrides((prev) => ({ ...prev, videoUrl: e.target.value }))}
            placeholder="https://.../workout-video.mp4 or YouTube URL"
          />

          <div className="space-y-3 rounded-md border border-border bg-surface-2/20 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-soft">Exercises</p>
              <button
                onClick={() => setDraftExercises((prev) => [...(prev ?? fallbackRows), createDraftExercise()])}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] font-semibold"
              >
                <Plus className="h-3 w-3" />
                Add Exercise
              </button>
            </div>

            {rows.map((row) => (
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
                    onClick={() => setDraftExercises((prev) => (prev ?? fallbackRows).filter((item) => item.id !== row.id))}
                    disabled={rows.length === 1}
                    className="inline-flex items-center gap-1 text-[11px] text-red-400 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={onSubmit} disabled={updateMutation.isPending || uploadMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Update Workout'}
          </Button>
        </div>
      </section>
    </div>
  );
}
