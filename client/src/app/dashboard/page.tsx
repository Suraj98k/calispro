'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { BarChart3, CalendarCheck2, Dumbbell, Flame, PlayCircle, Sparkles, Target, Zap } from 'lucide-react';

import { useExercises, usePlans, useProfile, useSkillProgramProgress, useSkillPrograms, useStreakStats, useWorkoutHistory, useWorkouts } from '@/lib/hooks/useApi';

export default function DashboardPage() {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: programs, isLoading: isProgramsLoading } = useSkillPrograms();
  const { data: progress, isLoading: isProgressLoading } = useSkillProgramProgress();
  const { data: workouts, isLoading: isWorkoutsLoading } = useWorkouts();
  const { data: exercises, isLoading: isExercisesLoading } = useExercises();
  const { data: plans, isLoading: isPlansLoading } = usePlans();
  const { data: history, isLoading: isHistoryLoading } = useWorkoutHistory(40);
  const { data: streakStats, isLoading: isStreakLoading } = useStreakStats();

  const isLoading =
    isProfileLoading ||
    isProgramsLoading ||
    isProgressLoading ||
    isWorkoutsLoading ||
    isExercisesLoading ||
    isPlansLoading ||
    isHistoryLoading ||
    isStreakLoading;

  const todayIso = new Date().toISOString().slice(0, 10);

  const analytics = useMemo(() => {
    const all = history || [];
    const skillLogs = all.filter((entry) => (entry.sessionType || 'workout') === 'skill' || entry.sessionType === undefined);
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const skillLogsThisWeek = skillLogs.filter((entry) => new Date(entry.date) >= thisWeek).length;
    const totalSkillMinutes = skillLogs.reduce((sum, entry) => sum + (entry.durationActual || 0), 0);
    const trainedToday = skillLogs.some((entry) => entry.date.slice(0, 10) === todayIso);

    return {
      totalSkills: programs?.length || 0,
      totalExercises: exercises?.length || 0,
      totalWorkouts: workouts?.length || 0,
      totalPlans: plans?.length || 0,
      totalSteps:
        programs?.reduce(
          (sum, skill) => sum + skill.progressions.reduce((inner, step) => inner + step.workouts.length, 0),
          0,
        ) || 0,
      skillLogsThisWeek,
      totalSkillMinutes,
      trainedToday,
    };
  }, [history, programs, exercises, workouts, plans, todayIso]);

  const resumeTarget = useMemo(() => {
    const active = (progress || []).find((entry) => entry.activeSession && entry.activeSession.status === 'active');
    if (!active) return null;
    return {
      slug: active.skillSlug,
      step: active.activeSession?.stepNumber || 1,
      sessionKey: active.activeSession?.sessionKey || '',
    };
  }, [progress]);

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const userName = profile?.name?.split(' ')[0] || 'Athlete';
  const quickStartSlug = programs?.[0]?.slug || '';
  const lastSession = (history || [])[0];

  return (
    <div className="animate-fade-in space-y-6 pb-16">
      <section className="app-surface overflow-hidden p-6 md:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Skills MVP</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Overview for {userName}</h1>
        <p className="mt-2 max-w-2xl text-sm text-soft">Priority is skill progression. Start or resume your skill session, then support it with workouts, exercises, and daily plans.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {resumeTarget && (
            <Link
              href={
                resumeTarget.sessionKey
                  ? `/dashboard/skills/${resumeTarget.slug}/workout/${resumeTarget.step}/session?startedAt=${resumeTarget.sessionKey}`
                  : `/dashboard/skills/${resumeTarget.slug}/workout/${resumeTarget.step}/session`
              }
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-5 py-3 text-xs font-black uppercase tracking-widest text-primary"
            >
              <PlayCircle className="h-4 w-4" />
              Resume Session
            </Link>
          )}
          <Link
            href={quickStartSlug ? `/dashboard/skills/${quickStartSlug}` : '/dashboard/skills'}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-primary-foreground"
          >
            <PlayCircle className="h-4 w-4" />
            Start Skill Now
          </Link>
          <Link
            href="/dashboard/workouts"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-5 py-3 text-xs font-black uppercase tracking-widest text-soft"
          >
            <Dumbbell className="h-4 w-4" />
            Open Workouts
          </Link>
          <Link
            href="/dashboard/planning"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-5 py-3 text-xs font-black uppercase tracking-widest text-soft"
          >
            <CalendarCheck2 className="h-4 w-4" />
            Plan Day
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <article className="app-surface p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Today</p>
          <p className="mt-2 text-lg font-black text-white">{analytics.trainedToday ? 'Skill session done' : 'No skill session yet'}</p>
          <p className="mt-2 text-xs text-soft">{analytics.trainedToday ? 'Keep momentum and recover well.' : 'Open your skill roadmap and finish one session.'}</p>
        </article>

        <article className="app-surface p-5">
          <div className="flex items-center gap-2 text-primary">
            <Flame className="h-4 w-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Streak System</p>
          </div>
          <p className="mt-3 text-sm text-soft">Current streak: <span className="font-black text-white">{streakStats?.currentStreak || 0} days</span></p>
          <p className="mt-2 text-sm text-soft">Longest streak: <span className="font-black text-white">{streakStats?.longestStreak || 0} days</span></p>
          <p className="mt-2 text-sm text-soft">Sessions in 7d: <span className="font-black text-white">{streakStats?.sessionsLast7Days || 0}</span></p>
        </article>

        <article className="app-surface p-5">
          <div className="flex items-center gap-2 text-primary">
            <BarChart3 className="h-4 w-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Tracking</p>
          </div>
          <p className="mt-3 text-sm text-soft">Skill minutes logged: <span className="font-black text-white">{analytics.totalSkillMinutes}</span></p>
          <p className="mt-2 text-sm text-soft">Latest session: <span className="font-black text-white">{lastSession?.sessionName || 'No session yet'}</span></p>
        </article>

        <article className="app-surface p-5">
          <div className="flex items-center gap-2 text-primary">
            <Target className="h-4 w-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Plan Focus</p>
          </div>
          <p className="mt-3 text-sm text-soft">{analytics.totalPlans ? `${analytics.totalPlans} daily plan(s) saved.` : 'No plans saved yet.'}</p>
          <Link href="/dashboard/planning" className="mt-3 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Update Plan
          </Link>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="app-surface p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-soft">Skills</p>
          <p className="mt-2 text-3xl font-black text-white">{analytics.totalSkills}</p>
        </div>
        <div className="app-surface p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-soft">Exercises</p>
          <p className="mt-2 text-3xl font-black text-white">{analytics.totalExercises}</p>
        </div>
        <div className="app-surface p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-soft">Workouts</p>
          <p className="mt-2 text-3xl font-black text-white">{analytics.totalWorkouts}</p>
        </div>
        <div className="app-surface p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-soft">Plans</p>
          <p className="mt-2 text-3xl font-black text-white">{analytics.totalPlans}</p>
        </div>
        <div className="app-surface p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-soft">Current Streak</p>
          <p className="mt-2 text-3xl font-black text-white">{streakStats?.currentStreak || 0}</p>
        </div>
      </section>

      <section className="space-y-4">
        <article className="app-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-white">Quick Skill Access</h2>
            <Link href="/dashboard/skills" className="text-xs font-black uppercase tracking-wider text-primary">
              Open All
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(programs || []).slice(0, 6).map((skill) => (
              <Link
                key={skill.slug}
                href={`/dashboard/skills/${skill.slug}`}
                className="rounded-xl border border-white/10 bg-surface-2/40 p-3 transition hover:border-primary/40"
              >
                <div className="relative h-24 overflow-hidden rounded-lg border border-border-subtle bg-surface-2">
                  <img src={skill.image} alt={skill.skill} className="h-full w-full object-cover" />
                </div>
                <p className="mt-3 text-sm font-black text-white">{skill.skill}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/dashboard/skills/${skill.slug}/workout/1`}
                    className="inline-flex flex-1 items-center justify-center rounded-md bg-primary px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-primary-foreground"
                  >
                    Quick Start
                  </Link>
                  <Link
                    href={`/dashboard/skills/${skill.slug}`}
                    className="inline-flex flex-1 items-center justify-center rounded-md border border-border bg-surface-2 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-soft"
                  >
                    Open
                  </Link>
                </div>
              </Link>
            ))}
          </div>
        </article>


      </section>
    </div>
  );
}
