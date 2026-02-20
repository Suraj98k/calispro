'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreatePlan, useDeletePlan, useExercises, usePlans, useSkillPrograms, useWorkouts } from '@/lib/hooks/useApi';
import type { DayRoutinePlan } from '@/types';

type SlotKey = 'morning' | 'afternoon' | 'evening';
const slots: SlotKey[] = ['morning', 'afternoon', 'evening'];

const emptySlots: DayRoutinePlan['slots'] = {
  morning: { skills: [], workouts: [], exercises: [] },
  afternoon: { skills: [], workouts: [], exercises: [] },
  evening: { skills: [], workouts: [], exercises: [] },
};

export default function PlanningPage() {
  const { data: plans, isLoading: isPlansLoading } = usePlans();
  const { data: skills, isLoading: isSkillsLoading } = useSkillPrograms();
  const { data: workouts, isLoading: isWorkoutsLoading } = useWorkouts();
  const { data: exercises, isLoading: isExercisesLoading } = useExercises();
  const createPlan = useCreatePlan();
  const deletePlan = useDeletePlan();

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [activeSlot, setActiveSlot] = useState<SlotKey>('morning');
  const [draftSlots, setDraftSlots] = useState<DayRoutinePlan['slots']>(emptySlots);

  const toggle = (slot: SlotKey, bucket: 'skills' | 'workouts' | 'exercises', id: string) => {
    const current = draftSlots[slot][bucket];
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];

    setDraftSlots((prev) => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        [bucket]: next,
      },
    }));
  };

  const create = async () => {
    if (!title.trim()) {
      toast.error('Plan title is required');
      return;
    }

    const total = slots.reduce((sum, slot) => sum + draftSlots[slot].skills.length + draftSlots[slot].workouts.length + draftSlots[slot].exercises.length, 0);
    if (total === 0) {
      toast.error('Select at least one item');
      return;
    }

    try {
      await createPlan.mutateAsync({
        title: title.trim(),
        dateLabel: dateLabel.trim() || undefined,
        slots: draftSlots,
      });

      setTitle('');
      setDateLabel('');
      setDraftSlots(emptySlots);
      setActiveSlot('morning');
      setShowCreate(false);
      toast.success('Plan created');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create plan';
      toast.error(message);
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await deletePlan.mutateAsync(id);
      toast.success('Plan deleted');
    } catch {
      toast.error('Failed to delete plan');
    }
  };

  const planStats = useMemo(() => {
    return (plans || []).map((plan) => {
      const items = slots.reduce(
        (sum, slot) => sum + plan.slots[slot].skills.length + plan.slots[slot].workouts.length + plan.slots[slot].exercises.length,
        0,
      );
      return { id: plan.id, items };
    });
  }, [plans]);

  if (isPlansLoading || isSkillsLoading || isWorkoutsLoading || isExercisesLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeDraft = draftSlots[activeSlot];

  return (
    <div className="animate-fade-in space-y-6 pb-16">
      <header className="app-surface p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Planning</p>
            <h1 className="mt-2 text-3xl font-black text-white">Your Day Plans</h1>
            <p className="mt-2 text-sm text-soft">Create day plans and open any plan card to view detailed roadmap and start actions.</p>
          </div>
          <button
            onClick={() => setShowCreate((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            {showCreate ? 'Close' : 'Create New Plan'}
          </button>
        </div>
      </header>

      {showCreate && (
        <section className="app-surface p-5 space-y-4">
          <h2 className="text-lg font-black text-white">Create Plan</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-soft">Plan Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Plan title"
                className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-soft">Date Label (optional)</label>
              <input
                value={dateLabel}
                onChange={(e) => setDateLabel(e.target.value)}
                placeholder="Date label (optional)"
                className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button key={slot} onClick={() => setActiveSlot(slot)} className={`pill ${activeSlot === slot ? 'pill-active' : ''}`}>
                {slot}
              </button>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <article className="rounded-xl border border-border bg-surface-2/30 p-3">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-soft">Skills</p>
              <div className="space-y-2">
                {(skills || []).map((item) => {
                  const selected = activeDraft.skills.includes(item.slug);
                  return (
                    <button key={item.slug} onClick={() => toggle(activeSlot, 'skills', item.slug)} className={`w-full rounded-md border px-3 py-2 text-left text-xs ${selected ? 'border-primary bg-primary/10 text-white' : 'border-border text-soft'}`}>
                      {item.skill}
                    </button>
                  );
                })}
              </div>
            </article>

            <article className="rounded-xl border border-border bg-surface-2/30 p-3">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-soft">Workouts</p>
              <div className="space-y-2">
                {(workouts || []).map((item) => {
                  const selected = activeDraft.workouts.includes(item.id);
                  return (
                    <button key={item.id} onClick={() => toggle(activeSlot, 'workouts', item.id)} className={`w-full rounded-md border px-3 py-2 text-left text-xs ${selected ? 'border-primary bg-primary/10 text-white' : 'border-border text-soft'}`}>
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </article>

            <article className="rounded-xl border border-border bg-surface-2/30 p-3">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-soft">Exercises</p>
              <div className="space-y-2">
                {(exercises || []).map((item) => {
                  const selected = activeDraft.exercises.includes(item.id);
                  return (
                    <button key={item.id} onClick={() => toggle(activeSlot, 'exercises', item.id)} className={`w-full rounded-md border px-3 py-2 text-left text-xs ${selected ? 'border-primary bg-primary/10 text-white' : 'border-border text-soft'}`}>
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </article>
          </div>

          <button onClick={create} disabled={createPlan.isPending} className="rounded-lg bg-primary px-4 py-2 text-xs font-black uppercase tracking-wider text-primary-foreground disabled:opacity-50">
            {createPlan.isPending ? 'Creating...' : 'Save Plan'}
          </button>
        </section>
      )}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(plans || []).map((plan) => {
          const count = planStats.find((entry) => entry.id === plan.id)?.items || 0;
          return (
            <article key={plan.id} className="app-surface p-5">
              <Link href={`/dashboard/planning/${plan.id}`} className="block">
                <p className="text-lg font-black text-white">{plan.title}</p>
                <p className="mt-1 text-xs text-soft">{plan.dateLabel || 'No date label'} | {count} items</p>
              </Link>
              <div className="mt-3 flex items-center justify-between">
                <Link href={`/dashboard/planning/${plan.id}`} className="text-xs font-black uppercase tracking-wider text-primary">Open Roadmap</Link>
                <button onClick={() => onDelete(plan.id)} className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </article>
          );
        })}
        {!plans?.length && <p className="text-sm text-soft">No plans yet. Create your first plan.</p>}
      </section>
    </div>
  );
}
