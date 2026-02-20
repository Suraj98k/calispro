'use client';

import Link from 'next/link';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Play, ShieldAlert, SkipForward } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSkillProgramBySlug } from '@/lib/hooks/useApi';
import { warmupExercises } from '@/lib/skillSession';

export default function SkillWorkoutDisclaimerPage() {
  const { id, step } = useParams<{ id: string; step: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: skill, isLoading } = useSkillProgramBySlug(id);
  const [fallbackStartedAt] = useState(() => String(Date.now()));

  const startedAt = searchParams.get('startedAt') || fallbackStartedAt;

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

  const currentStep = steps[stepIndex];

  const toSession = (skipWarmup: boolean) =>
    `/dashboard/skills/${id}/workout/${step}/session?startedAt=${startedAt}${skipWarmup ? '&skipWarmup=1' : ''}`;

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <header className="app-surface p-6 md:p-8">
        <Link href={`/dashboard/skills/${id}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-soft hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.25em] text-primary">Pre-Workout Check</p>
        <h1 className="mt-2 text-3xl font-black text-white">{skill.skill} | {currentStep.title}</h1>
        <p className="mt-2 text-sm text-soft">
          Prepare your body before training. Calisthenics movements are technical and loading your joints cold increases injury risk.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <article className="app-surface p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
            Safety Disclaimer
          </h2>
          <ul className="space-y-3 text-sm text-soft">
            <li className="rounded-lg border border-white/10 bg-surface-2/40 p-3">Warm up properly to reduce muscle, tendon, and shoulder injury risk.</li>
            <li className="rounded-lg border border-white/10 bg-surface-2/40 p-3">All exercises are performed at your own risk. Stop immediately if you feel sharp pain.</li>
            <li className="rounded-lg border border-white/10 bg-surface-2/40 p-3">Adjust volume if needed and extend warm-up when your body feels tight or fatigued.</li>
            <li className="rounded-lg border border-white/10 bg-surface-2/40 p-3">Maintain strict form; quality reps matter more than total reps.</li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => router.push(toSession(true))}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-soft"
            >
              <SkipForward className="h-4 w-4" />
              Skip Warm-Up
            </button>
            <button
              onClick={() => router.push(toSession(false))}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-widest text-primary-foreground"
            >
              <Play className="h-4 w-4 fill-current" />
              Start Workout
            </button>
          </div>
        </article>

        <aside className="app-surface p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Warm-Up Preview
          </h3>
          <div className="space-y-2">
            {warmupExercises.map((entry) => (
              <div key={entry.name} className="rounded-lg border border-white/10 bg-surface-2/40 px-3 py-2">
                <p className="text-sm font-semibold text-white">{entry.name}</p>
                <p className="text-[11px] text-soft">{entry.reps} reps</p>
              </div>
            ))}
          </div>
          <Link href={`/dashboard/skills/${id}`} className="mt-4 inline-flex text-xs font-semibold text-primary hover:underline">
            Back to steps
          </Link>
        </aside>
      </section>
    </div>
  );
}
