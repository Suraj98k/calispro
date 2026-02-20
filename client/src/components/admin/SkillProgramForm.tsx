'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useUploadAdminImage } from '@/lib/hooks/useApi';
import { SkillProgram } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SkillProgramFormPayload = {
  slug: string;
  skill: string;
  image: string;
  video?: string;
  progressions: SkillProgram['progressions'];
};

type Props = {
  initialValue?: SkillProgram;
  submitLabel: string;
  onSubmit: (payload: SkillProgramFormPayload) => Promise<void>;
  isSubmitting?: boolean;
};

type PendingUploadState = {
  main?: File;
  progression: Record<string, File>;
  workout: Record<string, File>;
  exercise: Record<string, File>;
};

type PreviewState = {
  main?: string;
  progression: Record<string, string>;
  workout: Record<string, string>;
  exercise: Record<string, string>;
};
type FormErrors = Record<string, string>;

const isFilled = (value?: string) => Boolean(value && value.trim().length > 0);

function ImagePreview({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  return <img src={src} alt={alt} className="mt-2 h-24 w-24 rounded-md border border-border object-cover" />;
}

const defaultExercise = () => ({
  name: '',
  sets: 3,
  reps: 8,
  image: '',
  video: '',
});

const defaultWorkout = () => ({
  name: '',
  image: '',
  video: '',
  exercises: [defaultExercise()],
});

const defaultProgression = () => ({
  name: '',
  image: '',
  video: '',
  workouts: [defaultWorkout()],
});

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export function SkillProgramForm({ initialValue, submitLabel, onSubmit, isSubmitting = false }: Props) {
  const uploadMutation = useUploadAdminImage();

  const [form, setForm] = useState<SkillProgramFormPayload>(() => ({
    slug: initialValue?.slug || '',
    skill: initialValue?.skill || '',
    image: initialValue?.image || '',
    video: initialValue?.video || '',
    progressions: initialValue?.progressions?.length ? initialValue.progressions : [defaultProgression()],
  }));
  const [pendingUploads, setPendingUploads] = useState<PendingUploadState>({
    progression: {},
    workout: {},
    exercise: {},
  });
  const [previews, setPreviews] = useState<PreviewState>({
    progression: {},
    workout: {},
    exercise: {},
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const uploadLoading = uploadMutation.isPending;
  const canSubmit = useMemo(() => {
    return !isSubmitting && !uploadLoading;
  }, [isSubmitting, uploadLoading]);

  const getPreviewUrl = (file: File) => URL.createObjectURL(file);

  const onTopImageUpload = (file?: File | null) => {
    if (!file) return;
    setPendingUploads((prev) => ({ ...prev, main: file }));
    setPreviews((prev) => ({ ...prev, main: getPreviewUrl(file) }));
    toast.success('Image selected. It will upload when you save.');
  };

  const onProgressionImageUpload = (progressionIndex: number, file?: File | null) => {
    if (!file) return;
    const key = `${progressionIndex}`;
    setPendingUploads((prev) => ({
      ...prev,
      progression: { ...prev.progression, [key]: file },
    }));
    setPreviews((prev) => ({
      ...prev,
      progression: { ...prev.progression, [key]: getPreviewUrl(file) },
    }));
    toast.success('Image selected. It will upload when you save.');
  };

  const onWorkoutImageUpload = (progressionIndex: number, workoutIndex: number, file?: File | null) => {
    if (!file) return;
    const key = `${progressionIndex}-${workoutIndex}`;
    setPendingUploads((prev) => ({
      ...prev,
      workout: { ...prev.workout, [key]: file },
    }));
    setPreviews((prev) => ({
      ...prev,
      workout: { ...prev.workout, [key]: getPreviewUrl(file) },
    }));
    toast.success('Image selected. It will upload when you save.');
  };

  const onExerciseImageUpload = (
    progressionIndex: number,
    workoutIndex: number,
    exerciseIndex: number,
    file?: File | null,
  ) => {
    if (!file) return;
    const key = `${progressionIndex}-${workoutIndex}-${exerciseIndex}`;
    setPendingUploads((prev) => ({
      ...prev,
      exercise: { ...prev.exercise, [key]: file },
    }));
    setPreviews((prev) => ({
      ...prev,
      exercise: { ...prev.exercise, [key]: getPreviewUrl(file) },
    }));
    toast.success('Image selected. It will upload when you save.');
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setErrors({});

    const fail = (key: string, message: string) => {
      setErrors({ [key]: message });
      toast.error(message);
      return true;
    };

    const payload: SkillProgramFormPayload = {
      ...form,
      slug: form.slug.trim(),
      skill: form.skill.trim(),
      image: form.image.trim(),
      video: form.video?.trim() || undefined,
      progressions: form.progressions.map((progression) => ({
        ...progression,
        video: progression.video?.trim() || undefined,
        workouts: progression.workouts.map((workout) => ({
          ...workout,
          video: workout.video?.trim() || undefined,
          exercises: workout.exercises.map((exercise) => ({
            ...exercise,
            video: exercise.video?.trim() || undefined,
          })),
        })),
      })),
    };

    if (!isFilled(payload.skill)) {
      if (fail('skill', 'Skill title is required')) return;
    }
    if (!isFilled(payload.slug)) {
      if (fail('slug', 'Slug is required')) return;
    }
    if (!isFilled(payload.image) && !pendingUploads.main) {
      if (fail('main_image', 'Main image is required')) return;
    }

    for (let pIdx = 0; pIdx < payload.progressions.length; pIdx += 1) {
      const progression = payload.progressions[pIdx];
      if (!isFilled(progression.name)) {
        if (fail(`progression_name_${pIdx}`, `Progression ${pIdx + 1} title is required`)) return;
      }
      if (!isFilled(progression.image) && !pendingUploads.progression[`${pIdx}`]) {
        if (fail(`progression_image_${pIdx}`, `Progression ${pIdx + 1} image is required`)) return;
      }

      for (let wIdx = 0; wIdx < progression.workouts.length; wIdx += 1) {
        const workout = progression.workouts[wIdx];
        if (!isFilled(workout.name)) {
          if (fail(`workout_name_${pIdx}_${wIdx}`, `Workout ${wIdx + 1} title is required (Progression ${pIdx + 1})`)) return;
        }
        if (!isFilled(workout.image) && !pendingUploads.workout[`${pIdx}-${wIdx}`]) {
          if (fail(`workout_image_${pIdx}_${wIdx}`, `Workout ${wIdx + 1} image is required (Progression ${pIdx + 1})`)) return;
        }

        for (let eIdx = 0; eIdx < workout.exercises.length; eIdx += 1) {
          const exercise = workout.exercises[eIdx];
          if (!isFilled(exercise.name)) {
            if (fail(`exercise_name_${pIdx}_${wIdx}_${eIdx}`, `Exercise ${eIdx + 1} name is required (Progression ${pIdx + 1}, Workout ${wIdx + 1})`)) return;
          }
          if (!isFilled(exercise.image) && !pendingUploads.exercise[`${pIdx}-${wIdx}-${eIdx}`]) {
            if (fail(`exercise_image_${pIdx}_${wIdx}_${eIdx}`, `Exercise ${eIdx + 1} image is required (Progression ${pIdx + 1}, Workout ${wIdx + 1})`)) return;
          }
        }
      }
    }

    try {
      if (pendingUploads.main) {
        const uploaded = await uploadMutation.mutateAsync({ file: pendingUploads.main, folder: 'calispro/skills' });
        payload.image = uploaded.url;
      }

      for (const [key, file] of Object.entries(pendingUploads.progression)) {
        const progressionIndex = Number(key);
        if (Number.isNaN(progressionIndex) || !payload.progressions[progressionIndex]) continue;
        const uploaded = await uploadMutation.mutateAsync({ file, folder: 'calispro/skills/progressions' });
        payload.progressions[progressionIndex].image = uploaded.url;
      }

      for (const [key, file] of Object.entries(pendingUploads.workout)) {
        const [pStr, wStr] = key.split('-');
        const progressionIndex = Number(pStr);
        const workoutIndex = Number(wStr);
        if (
          Number.isNaN(progressionIndex) ||
          Number.isNaN(workoutIndex) ||
          !payload.progressions[progressionIndex] ||
          !payload.progressions[progressionIndex].workouts[workoutIndex]
        ) {
          continue;
        }
        const uploaded = await uploadMutation.mutateAsync({ file, folder: 'calispro/skills/workouts' });
        payload.progressions[progressionIndex].workouts[workoutIndex].image = uploaded.url;
      }

      for (const [key, file] of Object.entries(pendingUploads.exercise)) {
        const [pStr, wStr, eStr] = key.split('-');
        const progressionIndex = Number(pStr);
        const workoutIndex = Number(wStr);
        const exerciseIndex = Number(eStr);
        if (
          Number.isNaN(progressionIndex) ||
          Number.isNaN(workoutIndex) ||
          Number.isNaN(exerciseIndex) ||
          !payload.progressions[progressionIndex] ||
          !payload.progressions[progressionIndex].workouts[workoutIndex] ||
          !payload.progressions[progressionIndex].workouts[workoutIndex].exercises[exerciseIndex]
        ) {
          continue;
        }
        const uploaded = await uploadMutation.mutateAsync({ file, folder: 'calispro/skills/exercises' });
        payload.progressions[progressionIndex].workouts[workoutIndex].exercises[exerciseIndex].image = uploaded.url;
      }

      await onSubmit(payload);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save skill';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface-1 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-soft">Basic Details</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="space-y-2 text-xs font-semibold text-soft">
            Skill Title
            <Input
              placeholder="e.g. Handstand"
              value={form.skill}
              onChange={(e) => {
                const nextSkill = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  skill: nextSkill,
                  slug: toSlug(nextSkill),
                }));
              }}
            />
            {errors.skill ? <p className="text-[11px] text-red-500">{errors.skill}</p> : null}
          </label>
          <label className="space-y-2 text-xs font-semibold text-soft">
            Slug (Auto Generated)
            <Input placeholder="e.g. handstand" value={form.slug} readOnly disabled />
            {errors.slug ? <p className="text-[11px] text-red-500">{errors.slug}</p> : null}
          </label>
          <label className="space-y-2 text-xs font-semibold text-soft">
            Main Video URL (Optional)
            <Input placeholder="https://..." value={form.video || ''} onChange={(e) => setForm((prev) => ({ ...prev, video: e.target.value }))} />
          </label>
        </div>
        <div className="mt-3 rounded-md border border-dashed border-border bg-surface-2 p-3">
          <label className="space-y-2 text-xs font-semibold text-soft">
            Upload Main Image
            <input type="file" accept="image/*" onChange={(e) => onTopImageUpload(e.target.files?.[0])} disabled={uploadLoading} />
          </label>
          <ImagePreview src={previews.main || form.image} alt="Main skill preview" />
          {errors.main_image ? <p className="mt-1 text-[11px] text-red-500">{errors.main_image}</p> : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-soft">Progressions</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => setForm((prev) => ({ ...prev, progressions: [...prev.progressions, defaultProgression()] }))}>
            Add Progression
          </Button>
        </div>

        {form.progressions.map((progression, progressionIndex) => (
          <details
            key={`progression-${progressionIndex}`}
            className="rounded-xl border border-border bg-surface-1"
            open={progressionIndex === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-bold">
                  Progression {progressionIndex + 1}
                  {progression.name ? ` - ${progression.name}` : ''}
                </p>
                <p className="text-xs text-soft">{progression.workouts.length} workout(s)</p>
              </div>
              <span className="text-xs font-semibold text-soft">Expand</span>
            </summary>

            <div className="space-y-3 border-t border-border p-4">
              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="xs"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      progressions: prev.progressions.filter((_, idx) => idx !== progressionIndex),
                    }))
                  }
                >
                  Remove
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-2 text-xs font-semibold text-soft">
                  Progression Title
                  <Input
                    placeholder="e.g. Wall Support"
                    value={progression.name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        progressions: prev.progressions.map((item, idx) => (idx === progressionIndex ? { ...item, name: e.target.value } : item)),
                      }))
                    }
                  />
                  {errors[`progression_name_${progressionIndex}`] ? (
                    <p className="text-[11px] text-red-500">{errors[`progression_name_${progressionIndex}`]}</p>
                  ) : null}
                </label>
                <label className="space-y-2 text-xs font-semibold text-soft">
                  Progression Video URL
                  <Input
                    placeholder="https://..."
                    value={progression.video || ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        progressions: prev.progressions.map((item, idx) => (idx === progressionIndex ? { ...item, video: e.target.value } : item)),
                      }))
                    }
                  />
                </label>
              </div>
              <div className="rounded-md border border-dashed border-border bg-surface-2 p-3">
                <label className="space-y-2 text-xs font-semibold text-soft">
                  Upload Progression Image
                  <input type="file" accept="image/*" onChange={(e) => onProgressionImageUpload(progressionIndex, e.target.files?.[0])} disabled={uploadLoading} />
                </label>
                <ImagePreview src={previews.progression[`${progressionIndex}`] || progression.image} alt={`Progression ${progressionIndex + 1} preview`} />
                {errors[`progression_image_${progressionIndex}`] ? (
                  <p className="mt-1 text-[11px] text-red-500">{errors[`progression_image_${progressionIndex}`]}</p>
                ) : null}
              </div>

              <div className="space-y-3 rounded-lg border border-border bg-surface-2 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-soft">Workouts</p>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      progressions: prev.progressions.map((item, idx) =>
                        idx === progressionIndex ? { ...item, workouts: [...item.workouts, defaultWorkout()] } : item,
                      ),
                    }))
                  }
                >
                  Add Workout
                </Button>
              </div>

                {progression.workouts.map((workout, workoutIndex) => (
                <div key={`workout-${workoutIndex}`} className="space-y-3 rounded-md border border-border bg-surface-1 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold">Workout {workoutIndex + 1}</p>
                    <Button
                      type="button"
                      variant="destructive"
                      size="xs"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          progressions: prev.progressions.map((item, idx) => {
                            if (idx !== progressionIndex) return item;
                            return {
                              ...item,
                              workouts: item.workouts.filter((_, wIdx) => wIdx !== workoutIndex),
                            };
                          }),
                        }))
                      }
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-2 text-xs font-semibold text-soft">
                      Workout Title
                      <Input
                        placeholder="e.g. Tuck Holds"
                        value={workout.name}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            progressions: prev.progressions.map((item, idx) => {
                              if (idx !== progressionIndex) return item;
                              return {
                                ...item,
                                workouts: item.workouts.map((entry, wIdx) =>
                                  wIdx === workoutIndex ? { ...entry, name: e.target.value } : entry,
                                ),
                              };
                            }),
                          }))
                        }
                      />
                      {errors[`workout_name_${progressionIndex}_${workoutIndex}`] ? (
                        <p className="text-[11px] text-red-500">{errors[`workout_name_${progressionIndex}_${workoutIndex}`]}</p>
                      ) : null}
                    </label>
                    <label className="space-y-2 text-xs font-semibold text-soft">
                      Workout Video URL
                      <Input
                        placeholder="https://..."
                        value={workout.video || ''}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            progressions: prev.progressions.map((item, idx) => {
                              if (idx !== progressionIndex) return item;
                              return {
                                ...item,
                                workouts: item.workouts.map((entry, wIdx) =>
                                  wIdx === workoutIndex ? { ...entry, video: e.target.value } : entry,
                                ),
                              };
                            }),
                          }))
                        }
                      />
                    </label>
                  </div>

                  <div className="rounded-md border border-dashed border-border bg-surface-2 p-3">
                    <label className="space-y-2 text-xs font-semibold text-soft">
                      Upload Workout Image
                      <input type="file" accept="image/*" onChange={(e) => onWorkoutImageUpload(progressionIndex, workoutIndex, e.target.files?.[0])} disabled={uploadLoading} />
                    </label>
                    <ImagePreview src={previews.workout[`${progressionIndex}-${workoutIndex}`] || workout.image} alt={`Workout ${workoutIndex + 1} preview`} />
                    {errors[`workout_image_${progressionIndex}_${workoutIndex}`] ? (
                      <p className="mt-1 text-[11px] text-red-500">{errors[`workout_image_${progressionIndex}_${workoutIndex}`]}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2 rounded border border-border bg-surface-2 p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wide text-soft">Exercises</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            progressions: prev.progressions.map((item, idx) => {
                              if (idx !== progressionIndex) return item;
                              return {
                                ...item,
                                workouts: item.workouts.map((entry, wIdx) =>
                                  wIdx === workoutIndex ? { ...entry, exercises: [...entry.exercises, defaultExercise()] } : entry,
                                ),
                              };
                            }),
                          }))
                        }
                      >
                        Add Exercise
                      </Button>
                    </div>

                    {workout.exercises.map((exercise, exerciseIndex) => (
                      <div key={`exercise-${exerciseIndex}`} className="space-y-2 rounded border border-border bg-surface-1 p-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold">Exercise {exerciseIndex + 1}</p>
                          <Button
                            type="button"
                            variant="destructive"
                            size="xs"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                progressions: prev.progressions.map((item, idx) => {
                                  if (idx !== progressionIndex) return item;
                                  return {
                                    ...item,
                                    workouts: item.workouts.map((entry, wIdx) => {
                                      if (wIdx !== workoutIndex) return entry;
                                      return {
                                        ...entry,
                                        exercises: entry.exercises.filter((_, eIdx) => eIdx !== exerciseIndex),
                                      };
                                    }),
                                  };
                                }),
                              }))
                            }
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid gap-2 md:grid-cols-4">
                          <label className="space-y-1 text-[11px] font-semibold text-soft">
                            Exercise Name
                            <Input
                              aria-label="Exercise Name"
                              placeholder="Exercise Name"
                              value={exercise.name}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  progressions: prev.progressions.map((item, idx) => {
                                    if (idx !== progressionIndex) return item;
                                    return {
                                      ...item,
                                      workouts: item.workouts.map((entry, wIdx) => {
                                        if (wIdx !== workoutIndex) return entry;
                                        return {
                                          ...entry,
                                          exercises: entry.exercises.map((ex, eIdx) => (eIdx === exerciseIndex ? { ...ex, name: e.target.value } : ex)),
                                        };
                                      }),
                                    };
                                  }),
                                }))
                              }
                            />
                            {errors[`exercise_name_${progressionIndex}_${workoutIndex}_${exerciseIndex}`] ? (
                              <p className="text-[11px] text-red-500">{errors[`exercise_name_${progressionIndex}_${workoutIndex}_${exerciseIndex}`]}</p>
                            ) : null}
                          </label>
                          <label className="space-y-1 text-[11px] font-semibold text-soft">
                            Sets
                            <Input
                              aria-label="Exercise Sets"
                              placeholder="Sets"
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => {
                                const value = Number(e.target.value || 0);
                                setForm((prev) => ({
                                  ...prev,
                                  progressions: prev.progressions.map((item, idx) => {
                                    if (idx !== progressionIndex) return item;
                                    return {
                                      ...item,
                                      workouts: item.workouts.map((entry, wIdx) => {
                                        if (wIdx !== workoutIndex) return entry;
                                        return {
                                          ...entry,
                                          exercises: entry.exercises.map((ex, eIdx) => (eIdx === exerciseIndex ? { ...ex, sets: value } : ex)),
                                        };
                                      }),
                                    };
                                  }),
                                }));
                              }}
                            />
                          </label>
                          <label className="space-y-1 text-[11px] font-semibold text-soft">
                            Reps
                            <Input
                              aria-label="Exercise Reps"
                              placeholder="Reps"
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => {
                                const value = Number(e.target.value || 0);
                                setForm((prev) => ({
                                  ...prev,
                                  progressions: prev.progressions.map((item, idx) => {
                                    if (idx !== progressionIndex) return item;
                                    return {
                                      ...item,
                                      workouts: item.workouts.map((entry, wIdx) => {
                                        if (wIdx !== workoutIndex) return entry;
                                        return {
                                          ...entry,
                                          exercises: entry.exercises.map((ex, eIdx) => (eIdx === exerciseIndex ? { ...ex, reps: value } : ex)),
                                        };
                                      }),
                                    };
                                  }),
                                }));
                              }}
                            />
                          </label>
                          <label className="space-y-1 text-[11px] font-semibold text-soft">
                            Video URL
                            <Input
                              aria-label="Exercise Video URL"
                              placeholder="Video URL"
                              value={exercise.video || ''}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  progressions: prev.progressions.map((item, idx) => {
                                    if (idx !== progressionIndex) return item;
                                    return {
                                      ...item,
                                      workouts: item.workouts.map((entry, wIdx) => {
                                        if (wIdx !== workoutIndex) return entry;
                                        return {
                                          ...entry,
                                          exercises: entry.exercises.map((ex, eIdx) => (eIdx === exerciseIndex ? { ...ex, video: e.target.value } : ex)),
                                        };
                                      }),
                                    };
                                  }),
                                }))
                              }
                            />
                          </label>
                        </div>

                        <div className="rounded-md border border-dashed border-border bg-surface-2 p-2">
                          <label className="space-y-2 text-xs font-semibold text-soft">
                            Upload Exercise Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => onExerciseImageUpload(progressionIndex, workoutIndex, exerciseIndex, e.target.files?.[0])}
                              disabled={uploadLoading}
                            />
                          </label>
                          <ImagePreview
                            src={previews.exercise[`${progressionIndex}-${workoutIndex}-${exerciseIndex}`] || exercise.image}
                            alt={`Exercise ${exerciseIndex + 1} preview`}
                          />
                          {errors[`exercise_image_${progressionIndex}_${workoutIndex}_${exerciseIndex}`] ? (
                            <p className="mt-1 text-[11px] text-red-500">{errors[`exercise_image_${progressionIndex}_${workoutIndex}_${exerciseIndex}`]}</p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                ))}
              </div>
            </div>
          </details>
        ))}
      </section>

      <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
        {isSubmitting ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}
