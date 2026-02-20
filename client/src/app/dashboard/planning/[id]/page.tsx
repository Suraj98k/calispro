'use client';

import Link from 'next/link';
import { ArrowLeft, CirclePlay } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';

import { useExercises, usePlanById, useSkillPrograms, useWorkouts } from '@/lib/hooks/useApi';

type SlotKey = 'morning' | 'afternoon' | 'evening';

const slots: SlotKey[] = ['morning', 'afternoon', 'evening'];

export default function PlanningDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: plan, isLoading: isPlanLoading } = usePlanById(id);
  const { data: skills, isLoading: isSkillsLoading } = useSkillPrograms();
  const { data: workouts, isLoading: isWorkoutsLoading } = useWorkouts();
  const { data: exercises, isLoading: isExercisesLoading } = useExercises();

  if (isPlanLoading || isSkillsLoading || isWorkoutsLoading || isExercisesLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!plan) {
    notFound();
  }

  const skillsMap = new Map((skills || []).map((item) => [item.slug, item]));
  const workoutsMap = new Map((workouts || []).map((item) => [item.id, item]));
  const exercisesMap = new Map((exercises || []).map((item) => [item.id, item]));

  return (
    <div className="animate-fade-in space-y-6 pb-16">
      <header className="app-surface p-6 md:p-8">
        <Link href="/dashboard/planning" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-soft hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </Link>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-primary">Day Roadmap</p>
        <h1 className="mt-2 text-3xl font-black text-white">{plan.title}</h1>
        <p className="mt-2 text-sm text-soft">{plan.dateLabel || 'No date label'}</p>
        {plan.notes && <p className="mt-3 text-sm text-soft">{plan.notes}</p>}
      </header>

      <section className="space-y-4">
        {slots.map((slot) => {
          const bucket = plan.slots[slot];
          const hasItems = bucket.skills.length > 0 || bucket.workouts.length > 0 || bucket.exercises.length > 0;

          return (
            <article key={slot} className="app-surface p-5">
              <h2 className="text-lg font-black capitalize text-white">{slot}</h2>

              {!hasItems && <p className="mt-3 text-sm text-soft">No items in this slot.</p>}

              {bucket.skills.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-black uppercase tracking-wider text-soft">Skills</p>
                  {bucket.skills.map((skillSlug) => {
                    const skill = skillsMap.get(skillSlug);
                    return (
                      <div key={`${slot}-skill-${skillSlug}`} className="flex items-center justify-between rounded-lg border border-border bg-surface-2/40 px-3 py-2">
                        <p className="text-sm text-white">{skill?.skill || 'Skill unavailable'}</p>
                        {skill ? (
                          <Link
                            href={`/dashboard/skills/${skill.slug}`}
                            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-black uppercase tracking-wide text-primary-foreground"
                          >
                            <CirclePlay className="h-3.5 w-3.5" />
                            Start
                          </Link>
                        ) : (
                          <span className="text-xs text-soft">Missing</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {bucket.workouts.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-black uppercase tracking-wider text-soft">Workouts</p>
                  {bucket.workouts.map((workoutId) => {
                    const workout = workoutsMap.get(workoutId);
                    return (
                      <div key={`${slot}-workout-${workoutId}`} className="flex items-center justify-between rounded-lg border border-border bg-surface-2/40 px-3 py-2">
                        <p className="text-sm text-white">{workout?.name || 'Workout unavailable'}</p>
                        {workout ? (
                          <Link
                            href={`/dashboard/track/${workout.id}?mode=workout`}
                            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-black uppercase tracking-wide text-primary-foreground"
                          >
                            <CirclePlay className="h-3.5 w-3.5" />
                            Start
                          </Link>
                        ) : (
                          <span className="text-xs text-soft">Missing</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {bucket.exercises.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-black uppercase tracking-wider text-soft">Exercises</p>
                  {bucket.exercises.map((exerciseId) => {
                    const exercise = exercisesMap.get(exerciseId);
                    return (
                      <div key={`${slot}-exercise-${exerciseId}`} className="flex items-center justify-between rounded-lg border border-border bg-surface-2/40 px-3 py-2">
                        <p className="text-sm text-white">{exercise?.name || 'Exercise unavailable'}</p>
                        {exercise ? (
                          <Link
                            href={`/dashboard/track/${exercise.id}?mode=exercise`}
                            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-black uppercase tracking-wide text-primary-foreground"
                          >
                            <CirclePlay className="h-3.5 w-3.5" />
                            Start
                          </Link>
                        ) : (
                          <span className="text-xs text-soft">Missing</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
