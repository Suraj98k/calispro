import type { SkillProgramExercise } from '@/types';

export type WarmupExercise = {
  name: string;
  reps: number;
  note: string;
  image: string;
  video?: string;
  videoUrl?: string;
};

export const warmupExercises: WarmupExercise[] = [
  {
    name: 'Jumping Jacks',
    reps: 30,
    note: 'Raise heart rate and body temperature.',
    image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=1200&auto=format&fit=crop',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-jumping-jacks-40560-large.mp4',
    videoUrl: 'https://www.youtube.com/watch?v=c4DAnQ6DtF8',
  },
  {
    name: 'Scapular Pull Ups',
    reps: 12,
    note: 'Activate scapular control before pulling work.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-on-a-bar-3560-large.mp4',
    videoUrl: 'https://www.youtube.com/watch?v=J4l4T2f4Q2w',
  },
  {
    name: 'Wrist + Shoulder Circles',
    reps: 20,
    note: 'Prepare wrists and shoulders for load-bearing positions.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-female-sportswoman-stretching-her-arms-40572-large.mp4',
    videoUrl: 'https://www.youtube.com/watch?v=6jyk6K4QfY8',
  },
  {
    name: 'Hollow Body Hold',
    reps: 20,
    note: 'Prime core tension used in most calisthenics skills.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-poses-1747-large.mp4',
    videoUrl: 'https://www.youtube.com/watch?v=LlDNef_Ztsc',
  },
];

export const getExerciseGuidance = (exercise: SkillProgramExercise) => {
  const lower = exercise.name.toLowerCase();

  if (lower.includes('pull')) {
    return {
      description: 'Drive elbows down, keep ribs tucked, and avoid swinging.',
      note: 'Use full range and control each rep.',
      videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    };
  }

  if (lower.includes('dip') || lower.includes('push')) {
    return {
      description: 'Keep shoulders packed and elbows tracking with control.',
      note: 'Do not rush lockout; own the bottom position.',
      videoUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As',
    };
  }

  if (lower.includes('handstand') || lower.includes('planche')) {
    return {
      description: 'Stack shoulders over hands and keep core braced.',
      note: 'Quality position beats extra reps.',
      videoUrl: 'https://www.youtube.com/watch?v=tA6x8QWQ9dU',
    };
  }

  if (lower.includes('squat') || lower.includes('lunge') || lower.includes('pistol')) {
    return {
      description: 'Control the descent and keep pressure through mid-foot.',
      note: 'Prioritize stable knees and depth you can own.',
      videoUrl: 'https://www.youtube.com/watch?v=aclHkVaku9U',
    };
  }

  return {
    description: 'Stay controlled, maintain alignment, and keep breathing steady.',
    note: 'Stop if sharp pain appears and extend warm-up if needed.',
    videoUrl: undefined,
  };
};

export const toEmbedUrl = (url?: string) => {
  if (!url) return null;
  const params = '?autoplay=1&mute=1&rel=0';
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}${params}`;
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}${params}`;
  if (url.includes('youtube.com/embed/')) return url.includes('?') ? `${url}&autoplay=1&mute=1&rel=0` : `${url}${params}`;
  return null;
};
