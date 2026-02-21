'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Star } from 'lucide-react';

import { useExercises } from '@/lib/hooks/useApi';
import { getExerciseVisual } from '@/lib/exerciseVisuals';
import type { Exercise } from '@/types';

const categoryFilters = ['All', 'Push', 'Pull', 'Core', 'Legs', 'Full Body', 'Balance', 'Static'] as const;
const levelFilters = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

const exerciseFallbackImages: Record<Exercise['category'], string> = {
  Push: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
  Pull: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1200&auto=format&fit=crop',
  Core: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop',
  Legs: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1200&auto=format&fit=crop',
  'Full Body': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200&auto=format&fit=crop',
  Balance: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1200&auto=format&fit=crop',
  Static: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop',
};

export default function ExercisesPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof categoryFilters)[number]>('All');
  const [level, setLevel] = useState<(typeof levelFilters)[number]>('All');

  const { data: exercises, isLoading } = useExercises();

  const filtered = useMemo(
    () => {
      if (!exercises) return [];
      return exercises.filter((exercise) => {
        const matchesQuery =
          exercise.name.toLowerCase().includes(query.toLowerCase()) ||
          exercise.description.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === 'All' || exercise.category === category;
        const matchesLevel = level === 'All' || exercise.level === level;
        return matchesQuery && matchesCategory && matchesLevel;
      });
    },
    [exercises, category, level, query]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="animate-fade-in space-y-5">
      <header className="app-surface overflow-hidden p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-primary">Exercise Library</p>
            <h1 className="mt-1.5 text-3xl font-black tracking-tight text-white">Train by movement, not guesswork</h1>
            <p className="mt-2 text-sm text-soft">Pick exercises by category and level, then open any card to start training.</p>
          </div>
          <div className="surface-muted min-w-32 px-4 py-2.5 text-right">
            <p className="text-[11px] uppercase tracking-wide text-soft">Results</p>
            <p className="mt-0.5 text-xl font-semibold">{filtered.length}</p>
          </div>
        </div>

        <label className="relative mt-4 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises..."
            className="h-10 w-full rounded-lg border border-border bg-surface-2 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-soft focus:border-primary/40"
          />
        </label>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface-2/40 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-soft">Total</p>
            <p className="mt-1 text-sm font-semibold text-white">{exercises?.length || 0} exercises</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2/40 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-soft">Beginner</p>
            <p className="mt-1 text-sm font-semibold text-white">{(exercises || []).filter((e) => e.level === 'Beginner').length} options</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2/40 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-soft">Advanced</p>
            <p className="mt-1 text-sm font-semibold text-white">{(exercises || []).filter((e) => e.level === 'Advanced').length} options</p>
          </div>
        </div>
      </header>

      <section className="app-surface p-5">
        <p className="mb-2 text-[11px] uppercase tracking-widest text-soft">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {categoryFilters.map((item) => (
            <button key={item} onClick={() => setCategory(item)} className={`pill ${category === item ? 'pill-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>
        <p className="mb-2 mt-4 text-[11px] uppercase tracking-widest text-soft">Level</p>
        <div className="flex flex-wrap gap-1.5">
          {levelFilters.map((item) => (
            <button key={item} onClick={() => setLevel(item)} className={`pill ${level === item ? 'pill-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((exercise) => {
          const visual = getExerciseVisual(exercise.category, exercise.name);
          const displayImage = exercise.imageUrl || exerciseFallbackImages[exercise.category];
          return (
            <article key={exercise.id} className="app-surface block p-4 transition-all hover:border-border-strong hover-lift overflow-hidden rounded-xl">
              <div className={`relative h-28 overflow-hidden rounded-lg border border-border-subtle ${visual.panelClassName}`}>
                <img
                  src={displayImage}
                  alt={exercise.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute bottom-2 right-2 rounded-md border border-white/10 bg-black/20 p-1.5">
                  {visual.iconUrl ? (
                    <img src={visual.iconUrl} alt={`${exercise.name} icon`} className="h-5 w-5 object-contain brightness-0 invert opacity-90" />
                  ) : (
                    <visual.Icon className="h-5 w-5 text-white/70" />
                  )}
                </div>
                <span className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${visual.badgeClassName}`}>
                  {exercise.category}
                </span>
              </div>
              <p className="mt-3 font-semibold">{exercise.name}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-soft">{exercise.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="rounded-full bg-surface-3 px-2.5 py-1 text-soft">{exercise.level}</span>
                <span className="flex items-center gap-1 text-primary">
                  <Star className="h-3 w-3 fill-current" />
                  {(exercise.primaryMuscles?.length || 0) + (exercise.secondaryMuscles?.length || 0) + 2}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/dashboard/track/${exercise.id}?mode=exercise`}
                  className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-[11px] font-black uppercase tracking-wider text-primary-foreground"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Start
                </Link>
              </div>
            </article>
          );
        })}
        {!filtered.length && (
          <div className="app-surface col-span-full p-10 text-center">
            <p className="text-lg font-semibold">No exercises found</p>
            <p className="mt-1 text-sm text-soft">Try adjusting your search or filters.</p>
          </div>
        )}
      </section>
    </section>
  );
}
