'use client';

import Link from 'next/link';
import { ArrowLeft, CirclePlay, Video } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';

import { useExerciseById } from '@/lib/hooks/useApi';
import type { Exercise } from '@/types';

const exerciseFallbackImages: Record<Exercise['category'], string> = {
  Push: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
  Pull: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1200&auto=format&fit=crop',
  Core: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop',
  Legs: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1200&auto=format&fit=crop',
  'Full Body': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200&auto=format&fit=crop',
  Balance: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1200&auto=format&fit=crop',
  Static: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop',
};

const getYouTubeEmbedUrl = (url?: string) => {
  if (!url) return null;
  const trimmed = url.trim();
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&mute=1&rel=0`;

  const regularMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (regularMatch?.[1]) return `https://www.youtube.com/embed/${regularMatch[1]}?autoplay=1&mute=1&rel=0`;

  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed.includes('?') ? `${trimmed}&autoplay=1&mute=1&rel=0` : `${trimmed}?autoplay=1&mute=1&rel=0`;
  }
  return null;
};

const getInlineVideoUrl = (url?: string) => {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^https?:\/\/.+\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) return trimmed;
  if (trimmed.includes('/video/upload/') || trimmed.includes('/videos/')) return trimmed;
  return null;
};

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: exercise, isLoading } = useExerciseById(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!exercise) {
    notFound();
  }

  const inlineVideoUrl = getInlineVideoUrl(exercise.videoUrl);
  const embedVideoUrl = getYouTubeEmbedUrl(exercise.videoUrl);
  const fallbackImage = exercise.imageUrl || exerciseFallbackImages[exercise.category];
  const instructions = [
    ...(exercise.formTips || []),
    ...(exercise.commonMistakes || []).map((item) => `Avoid: ${item}`),
  ];

  return (
    <section className="animate-fade-in space-y-5 pb-20">
      <header className="app-surface p-5">
        <Link href="/dashboard/exercises" className="inline-flex items-center gap-1.5 text-xs text-soft transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to exercises
        </Link>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-white">{exercise.name}</h1>
        <p className="mt-1 text-sm text-soft">{exercise.description}</p>
        <Link
          href={`/dashboard/track/${exercise.id}?mode=exercise`}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110"
        >
          <CirclePlay className="h-4 w-4" />
          Start exercise session
        </Link>
      </header>

      <section className="app-surface space-y-4 p-5">
        <h2 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white">
          <Video className="h-4 w-4 text-primary" />
          Video + Instructions
        </h2>

        <div className="overflow-hidden rounded-xl border border-border bg-black/20">
          {inlineVideoUrl ? (
            <video
              src={inlineVideoUrl}
              className="h-[260px] w-full object-cover md:h-[360px]"
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
            />
          ) : embedVideoUrl ? (
            <iframe
              src={embedVideoUrl}
              title={`${exercise.name} demo`}
              className="h-[260px] w-full md:h-[360px]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img src={fallbackImage} alt={exercise.name} className="h-[260px] w-full object-cover md:h-[360px]" />
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface-2/30 p-4">
          <p className="text-xs font-black uppercase tracking-widest text-soft">Instructions</p>
          <div className="mt-3 space-y-2">
            {instructions.length ? (
              instructions.map((item, idx) => (
                <p key={`${item}-${idx}`} className="text-sm text-white/90">
                  {idx + 1}. {item}
                </p>
              ))
            ) : (
              <p className="text-sm text-soft">No instructions available.</p>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
