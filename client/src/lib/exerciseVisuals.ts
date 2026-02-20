import {
  Crown,
  Dumbbell,
  Library,
  Medal,
  Waves,
  Anchor,
  Activity,
  type LucideIcon,
} from 'lucide-react';

import type { Exercise } from '@/types';

type ExerciseVisual = {
  Icon: LucideIcon;
  iconUrl?: string;
  panelClassName: string;
  badgeClassName: string;
};

const normalizeName = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

const exerciseIconByName: Record<string, string> = {
  'muscle up': 'https://cdn-icons-png.flaticon.com/512/1545/1545576.png',
  'pull up': 'https://cdn-icons-png.flaticon.com/512/1545/1545576.png',
  'one arm pull up': 'https://cdn-icons-png.flaticon.com/512/1545/1545635.png',
  'high pull up': 'https://cdn-icons-png.flaticon.com/512/1545/1545635.png',
  'jumping muscle up': 'https://cdn-icons-png.flaticon.com/512/17639/17639456.png',
  'kipping muscle up': 'https://cdn-icons-png.flaticon.com/512/17639/17639456.png',
  planche: 'https://cdn-icons-png.flaticon.com/512/7119/7119054.png',
  'one arm push up': 'https://cdn-icons-png.flaticon.com/512/7119/7119054.png',
  'push up': 'https://cdn-icons-png.flaticon.com/512/7119/7119054.png',
  'handstand push up': 'https://cdn-icons-png.flaticon.com/512/17639/17639456.png',
  'one arm handstand': 'https://cdn-icons-png.flaticon.com/512/17639/17639456.png',
  'front lever': 'https://cdn-icons-png.flaticon.com/512/2418/2418457.png',
  'tuck front lever': 'https://cdn-icons-png.flaticon.com/512/2418/2418457.png',
  'back lever': 'https://cdn-icons-png.flaticon.com/512/2418/2418690.png',
  'human flag': 'https://cdn-icons-png.flaticon.com/512/2418/2418457.png',
  'dragon flag': 'https://cdn-icons-png.flaticon.com/512/2418/2418457.png',
  hefesto: 'https://cdn-icons-png.flaticon.com/512/2418/2418690.png',
  'v-sit': 'https://cdn-icons-png.flaticon.com/512/7119/7119054.png',
  'pistol squat': 'https://cdn-icons-png.flaticon.com/512/7119/7119023.png',
  'shrimp squat': 'https://cdn-icons-png.flaticon.com/512/7119/7119023.png',
  'deep squat': 'https://cdn-icons-png.flaticon.com/512/7119/7119023.png',
  'reverse lunge': 'https://cdn-icons-png.flaticon.com/512/7119/7119023.png',
};

const categoryIconUrl: Record<Exercise['category'], string> = {
  Push: 'https://cdn-icons-png.flaticon.com/512/7119/7119054.png',
  Pull: 'https://cdn-icons-png.flaticon.com/512/1545/1545576.png',
  Core: 'https://cdn-icons-png.flaticon.com/512/2418/2418457.png',
  Legs: 'https://cdn-icons-png.flaticon.com/512/7119/7119023.png',
  'Full Body': 'https://cdn-icons-png.flaticon.com/512/17639/17639456.png',
  Static: 'https://cdn-icons-png.flaticon.com/512/2418/2418690.png',
  Balance: 'https://cdn-icons-png.flaticon.com/512/17639/17639456.png',
};

const categoryVisuals: Record<Exercise['category'], ExerciseVisual> = {
  Push: {
    Icon: Dumbbell,
    panelClassName: 'bg-gradient-to-br from-[#1a2240] to-[#0f1528]',
    badgeClassName: 'bg-blue-500/10 text-blue-300 border border-blue-500/15',
  },
  Pull: {
    Icon: Library,
    panelClassName: 'bg-gradient-to-br from-[#182030] to-[#0e1420]',
    badgeClassName: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/15',
  },
  Core: {
    Icon: Waves,
    panelClassName: 'bg-gradient-to-br from-[#1c1a38] to-[#110f24]',
    badgeClassName: 'bg-violet-500/10 text-violet-300 border border-violet-500/15',
  },
  Legs: {
    Icon: Medal,
    panelClassName: 'bg-gradient-to-br from-[#221c18] to-[#15100d]',
    badgeClassName: 'bg-amber-500/10 text-amber-300 border border-amber-500/15',
  },
  'Full Body': {
    Icon: Crown,
    panelClassName: 'bg-gradient-to-br from-[#1e1c10] to-[#131108]',
    badgeClassName: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/15',
  },
  Static: {
    Icon: Anchor,
    panelClassName: 'bg-gradient-to-br from-[#1a2e38] to-[#0f1b22]',
    badgeClassName: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/15',
  },
  Balance: {
    Icon: Activity,
    panelClassName: 'bg-gradient-to-br from-[#1d1a2e] to-[#110f1c]',
    badgeClassName: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/15',
  },
};

export function getExerciseVisual(category: Exercise['category'], exerciseName?: string): ExerciseVisual {
  const baseVisual = categoryVisuals[category] || categoryVisuals['Full Body'];
  const byName = exerciseName ? exerciseIconByName[normalizeName(exerciseName)] : undefined;
  return {
    ...baseVisual,
    iconUrl: byName || categoryIconUrl[category] || categoryIconUrl['Full Body'],
  };
}
