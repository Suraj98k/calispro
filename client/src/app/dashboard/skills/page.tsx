'use client';

import Link from 'next/link';
import { ArrowRight, Dumbbell } from 'lucide-react';
import { useSkillProgramProgress, useSkillPrograms } from '@/lib/hooks/useApi';

export default function SkillsPage() {
  const { data, isLoading } = useSkillPrograms();
  const { data: progress } = useSkillProgramProgress();

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const programs = data || [];

  return (
    <div className="animate-fade-in space-y-6 pb-14">
      <header className="app-surface p-6 md:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Skill Program</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Skills Section</h1>
        <p className="mt-2 max-w-3xl text-sm text-soft">Dedicated progression system rebuilt around skill to progression to workout to exercises.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {programs.map((entry) => {
          const userProgress = progress?.find((item) => item.skillSlug === entry.slug);
          const totalSteps = entry.progressions.reduce((sum, progression) => sum + progression.workouts.length, 0);
          const completedSteps = userProgress?.completedSteps.length || 0;
          const activeSession = userProgress?.activeSession;

          return (
          <article key={entry.slug} className="app-surface overflow-hidden">
            <div className="h-40 w-full bg-black/30">
              {entry.video ? (
                <video
                  src={entry.video}
                  poster={entry.image}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img src={entry.image} alt={entry.skill} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white">{entry.skill}</h2>
                <Dumbbell className="h-4 w-4 text-primary" />
              </div>
              <div className="text-xs text-soft">
                <p>{entry.progressions.length} progressions</p>
                <p>{entry.progressions.reduce((sum, p) => sum + p.workouts.length, 0)} workouts</p>
                <p>{completedSteps}/{totalSteps} steps completed</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/skills/${entry.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-widest text-primary-foreground"
                >
                  Open Skill
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                {activeSession && (
                  <Link
                    href={`/dashboard/skills/${entry.slug}/workout/${activeSession.stepNumber}/session?startedAt=${activeSession.sessionKey}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-primary"
                  >
                    Resume
                  </Link>
                )}
              </div>
            </div>
          </article>
        )})}
      </section>
    </div>
  );
}
