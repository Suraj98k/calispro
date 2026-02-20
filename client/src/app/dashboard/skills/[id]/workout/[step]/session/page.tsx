'use client';

import Link from 'next/link';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock3, PlayCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLogWorkout, useSkillProgramBySlug, useTrackSkillSession } from '@/lib/hooks/useApi';
import { getExerciseGuidance, toEmbedUrl, warmupExercises } from '@/lib/skillSession';
import type { SkillProgramExercise } from '@/types';

type Phase = 'warmup' | 'workout' | 'completed';

const formatSeconds = (total: number) => {
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function SkillWorkoutSessionPage() {
  const { id, step } = useParams<{ id: string; step: string }>();
  const searchParams = useSearchParams();
  const { data: skill, isLoading } = useSkillProgramBySlug(id);
  const { mutateAsync: trackSkillSession, isPending: isTracking } = useTrackSkillSession();
  const { mutateAsync: logWorkout, isPending: isLogging } = useLogWorkout();
  const [fallbackStartedAt] = useState(() => Date.now());

  const startedAt = Number(searchParams.get('startedAt') || fallbackStartedAt);
  const skipWarmup = searchParams.get('skipWarmup') === '1';

  const steps = useMemo(
    () =>
      (skill?.progressions || []).flatMap((progression) =>
        progression.workouts.map((workout, index) => ({
          key: `${progression.name}-${index}`,
          title: progression.workouts.length === 1 ? progression.name : `${progression.name} ${index + 1}`,
          workout,
        })),
      ),
    [skill],
  );

  const [phase, setPhase] = useState<Phase>(skipWarmup ? 'workout' : 'warmup');
  const [warmupIndex, setWarmupIndex] = useState(0);
  const [workoutIndex, setWorkoutIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(() => Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!skill) {
    notFound();
  }

  const stepIndex = Number(step) - 1;
  if (Number.isNaN(stepIndex) || stepIndex < 0 || stepIndex >= steps.length) {
    notFound();
  }

  const workout = steps[stepIndex].workout;
  const totalWorkoutExercises = workout.exercises.length;
  const workoutProgress = Math.min(100, ((workoutIndex + (phase === 'completed' ? 1 : 0)) / totalWorkoutExercises) * 100);

  const currentWarmup = warmupExercises[warmupIndex];
  const currentWorkoutExercise = workout.exercises[workoutIndex] as SkillProgramExercise | undefined;
  const workoutGuide = currentWorkoutExercise ? getExerciseGuidance(currentWorkoutExercise) : null;
  const warmupInlineVideo = currentWarmup?.video;
  const warmupVideo = toEmbedUrl(currentWarmup?.videoUrl);
  const workoutInlineVideo = currentWorkoutExercise?.video;
  const workoutGuideVideo = toEmbedUrl(workoutGuide?.videoUrl);

  const sessionKey = String(startedAt);
  const isSaving = isTracking || isLogging;

  const handleDoneWarmup = async () => {
    if (!currentWarmup) return;
    try {
      await trackSkillSession({
        skillSlug: id,
        stepNumber: stepIndex + 1,
        sessionKey,
        phase: 'warmup',
        exerciseName: currentWarmup.name,
        elapsedSeconds,
      });
    } catch {
      // Keep local flow responsive even when tracking fails temporarily.
    }

    if (warmupIndex < warmupExercises.length - 1) {
      setWarmupIndex((prev) => prev + 1);
      return;
    }
    setPhase('workout');
  };

  const handleDoneWorkout = async () => {
    if (!currentWorkoutExercise) return;
    try {
      await trackSkillSession({
        skillSlug: id,
        stepNumber: stepIndex + 1,
        sessionKey,
        phase: 'workout',
        exerciseName: currentWorkoutExercise.name,
        elapsedSeconds,
      });
    } catch {
      // Keep local flow responsive even when tracking fails temporarily.
    }

    if (workoutIndex < totalWorkoutExercises - 1) {
      setWorkoutIndex((prev) => prev + 1);
      return;
    }

    try {
      await trackSkillSession({
        skillSlug: id,
        stepNumber: stepIndex + 1,
        sessionKey,
        phase: 'workout',
        elapsedSeconds,
        completeSession: true,
      });

      await logWorkout({
        sessionType: 'skill',
        skillId: skill.skill,
        sessionName: `${skill.skill} - Step ${stepIndex + 1}`,
        durationActual: Math.max(1, Math.round(elapsedSeconds / 60)),
        notes: `Completed ${steps[stepIndex].title}`,
        xpGained: Math.max(10, totalWorkoutExercises * 8),
        exercises: workout.exercises.map((entry) => ({
          exerciseId: entry.name,
          repsCompleted: entry.reps,
        })),
      });
    } catch {
      // Local completion still proceeds to avoid blocking user flow.
    }

    setPhase('completed');
  };

  return (
    <div className="animate-fade-in space-y-6 pb-28">
      <header className="app-surface p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Live Session</p>
            <h1 className="mt-2 text-3xl font-black text-white">{skill.skill} · Step {step}</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-surface-2/50 px-3 py-2 text-sm text-white">
            <Clock3 className="h-4 w-4 text-primary" />
            {formatSeconds(elapsedSeconds)}
          </div>
        </div>
      </header>

      {phase === 'warmup' && currentWarmup && (
        <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <article className="app-surface p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Warm-Up {warmupIndex + 1}/{warmupExercises.length}</p>
            <h2 className="mt-2 text-2xl font-black text-white">{currentWarmup.name}</h2>
            <p className="mt-1 text-sm text-soft">{currentWarmup.note}</p>

            <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/20">
              {warmupInlineVideo ? (
                <video
                  src={warmupInlineVideo}
                  poster={currentWarmup.image}
                  className="h-[260px] w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : warmupVideo ? (
                <iframe
                  src={warmupVideo}
                  title={`${currentWarmup.name} demonstration`}
                  className="h-[260px] w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img src={currentWarmup.image} alt={currentWarmup.name} className="h-[260px] w-full object-cover" />
              )}
            </div>

            <p className="mt-4 text-lg font-black text-white">{currentWarmup.reps} reps</p>

          </article>

          <aside className="app-surface p-5">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Warm-Up Queue</h3>
            <div className="mt-4 space-y-2">
              {warmupExercises.map((entry, index) => (
                <div
                  key={entry.name}
                  className={`rounded-lg border px-3 py-2 ${index === warmupIndex ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-surface-2/40'}`}
                >
                  <p className="text-sm font-semibold text-white">{entry.name}</p>
                  <p className="text-[11px] text-soft">{entry.reps} reps</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      )}

      {phase === 'warmup' && currentWarmup && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{currentWarmup.name}</p>
              <p className="text-[11px] text-soft">{currentWarmup.reps} reps</p>
            </div>
            <button
              onClick={handleDoneWarmup}
              disabled={isSaving}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Done'}
            </button>
          </div>
        </div>
      )}

      {(phase === 'workout' || phase === 'completed') && (
        <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <article className="app-surface p-6">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                Workout Exercise {Math.min(workoutIndex + 1, totalWorkoutExercises)}/{totalWorkoutExercises}
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/30">
                <div className="h-full bg-primary transition-all" style={{ width: `${workoutProgress}%` }} />
              </div>
            </div>

            {phase === 'completed' ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                <p className="text-2xl font-black text-white">Workout Complete</p>
                <p className="mt-2 text-sm text-soft">Great work. You completed all exercises for this step.</p>
                <Link
                  href={`/dashboard/skills/${id}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground"
                >
                  <PlayCircle className="h-4 w-4" />
                  Back to Skill
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                  <div>
                    <h2 className="text-2xl font-black text-white">{currentWorkoutExercise?.name}</h2>
                    <p className="mt-1 text-sm text-soft">
                      {currentWorkoutExercise?.sets} sets target
                    </p>
                    <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Rep Target</p>
                      <p className="mt-1 text-5xl font-black leading-none tracking-tight text-white">
                        {currentWorkoutExercise?.reps}
                        <span className="ml-1 text-primary">X</span>
                      </p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
                    {workoutInlineVideo ? (
                      <video
                        src={workoutInlineVideo}
                        poster={currentWorkoutExercise?.image}
                        className="h-[190px] w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : workoutGuideVideo ? (
                      <iframe
                        src={workoutGuideVideo}
                        title={`${currentWorkoutExercise?.name} demonstration`}
                        className="h-[190px] w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <img src={currentWorkoutExercise?.image} alt={currentWorkoutExercise?.name} className="h-[190px] w-full object-cover" />
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-surface-2/30 p-4">
                  <p className="text-sm font-semibold text-white">Guide</p>
                  <p className="text-sm text-soft">{workoutGuide?.description}</p>
                  <p className="text-sm text-primary">Note: {workoutGuide?.note}</p>
                </div>

              </>
            )}
          </article>

          <aside className="app-surface p-5">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Exercise Queue</h3>
            <div className="mt-4 space-y-2">
              {workout.exercises.map((entry, index) => (
                <div
                  key={entry.name}
                  className={`rounded-lg border px-3 py-2 ${index === workoutIndex && phase !== 'completed' ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-surface-2/40'}`}
                >
                  <p className="text-sm font-semibold text-white">{entry.name}</p>
                  <p className="text-[11px] text-soft">{entry.sets} sets x {entry.reps} reps</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      )}

      {phase === 'workout' && currentWorkoutExercise && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{currentWorkoutExercise.name}</p>
              <p className="text-[11px] text-soft">{currentWorkoutExercise.sets} sets x {currentWorkoutExercise.reps} reps</p>
            </div>
            <button
              onClick={handleDoneWorkout}
              disabled={isSaving}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
