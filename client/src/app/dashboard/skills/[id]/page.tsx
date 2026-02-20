'use client';

import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, CircleDot, History, Info, Lock, Play } from 'lucide-react';
import { useSkillProgramBySlug, useSkillProgramProgress } from '@/lib/hooks/useApi';

export default function SkillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: skill, isLoading } = useSkillProgramBySlug(id);
  const { data: progress } = useSkillProgramProgress();
  const [openStep, setOpenStep] = useState<number>(0);
  const steps = useMemo(
    () =>
      (skill?.progressions || []).flatMap((progression) =>
        progression.workouts.map((workout, index) => ({
          key: `${progression.name}-${index}`,
          title: progression.workouts.length === 1 ? progression.name : `${progression.name} ${index + 1}`,
          image: progression.image,
          workout,
        })),
      ),
    [skill],
  );

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

  const userProgress = progress?.find((entry) => entry.skillSlug === id);
  const completedSteps = new Set(userProgress?.completedSteps || []);
  const activeSession = userProgress?.activeSession;

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <header className="app-surface overflow-hidden p-6 md:p-8">
        <Link href="/dashboard/skills" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-soft hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Skills
        </Link>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Skill Program</p>
            <h1 className="mt-2 text-4xl font-black text-white">{skill.skill}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-soft">
                <Info className="h-3.5 w-3.5" />
                Details
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-soft">
                <History className="h-3.5 w-3.5" />
                History
              </span>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            {skill.video ? (
              <video
                src={skill.video}
                poster={skill.image}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <img src={skill.image} alt={skill.skill} className="h-full w-full object-cover" />
            )}
          </div>
        </div>
      </header>

      <section className="space-y-4">
        {steps.map((step, index) => {
          const isOpen = openStep === index;
          const stepNumber = index + 1;
          const previousDone = index === 0 || completedSteps.has(index);
          const locked = !previousDone;
          const isCompleted = completedSteps.has(stepNumber);
          const totalExercises = step.workout.exercises.length;
          const activeProgressPercent =
            activeSession && activeSession.stepNumber === stepNumber
              ? Math.min(99, Math.round((activeSession.workoutDoneCount / Math.max(1, totalExercises)) * 100))
              : 0;
          const progressPercent = isCompleted ? 100 : activeProgressPercent;

          return (
            <article key={step.key} className="overflow-hidden rounded-2xl border border-white/10 bg-surface-1">
              <button
                onClick={() => setOpenStep((prev) => (prev === index ? -1 : index))}
                className="flex w-full items-center justify-between gap-3 bg-white/5 px-4 py-4 text-left"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-xl font-black text-white/90">{index + 1}</span>
                  <div className="h-10 w-10 overflow-hidden rounded-md border border-white/10">
                    {step.workout.video ? (
                      <video
                        src={step.workout.video}
                        poster={step.image}
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img src={step.image} alt={step.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <p className="truncate text-xl font-semibold text-white">{step.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-xs font-black text-white">
                    {progressPercent}%
                  </span>
                  <ChevronRight className={`h-5 w-5 text-soft transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {isOpen && (
                <div className="space-y-4 bg-black/20 p-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    {step.workout.exercises.map((exercise) => (
                      <div key={exercise.name} className="rounded-xl bg-surface-2/60 p-3">
                        <div className="mb-3 h-24 w-full overflow-hidden rounded-lg border border-white/10">
                          {exercise.video ? (
                            <video
                              src={exercise.video}
                              poster={exercise.image}
                              className="h-full w-full object-cover"
                              autoPlay
                              muted
                              loop
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            <img src={exercise.image} alt={exercise.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <p className="text-base font-semibold text-white">{exercise.name}</p>
                        <p className="mt-2 text-sm text-soft">
                          {exercise.sets} Sets <span className="ml-2 font-semibold">{exercise.reps}x</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <p className="inline-flex items-center gap-2 text-sm text-soft">
                      <CircleDot className="h-4 w-4" />
                      {step.workout.exercises[0]?.reps || 0}x {step.workout.exercises[0]?.name || 'Exercise'}
                    </p>
                    <button
                      onClick={() => {
                        if (locked) return;
                        router.push(`/dashboard/skills/${id}/workout/${index + 1}?startedAt=${Date.now()}`);
                      }}
                      disabled={locked}
                      className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-black uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {locked ? <Lock className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                      Workout
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
