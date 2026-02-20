// client/src/types/index.ts

export interface MasteryLevel {
  level: number;
  label: string;
  pointsRequired: number;
  unlockedExercises: string[]; // IDs of exercises
}

export interface SkillProgramExercise {
  name: string;
  sets: number;
  reps: number;
  image: string;
  video?: string;
}

export interface SkillProgramWorkout {
  name: string;
  image: string;
  video?: string;
  exercises: SkillProgramExercise[];
}

export interface SkillProgramProgression {
  name: string;
  image: string;
  video?: string;
  workouts: SkillProgramWorkout[];
}

export interface SkillProgram {
  id?: string;
  slug: string;
  skill: string;
  image: string;
  video?: string;
  progressions: SkillProgramProgression[];
}

export interface SkillProgramActiveSession {
  stepNumber: number;
  sessionKey: string;
  warmupDoneCount: number;
  workoutDoneCount: number;
  status: 'active' | 'completed';
}

export interface SkillProgramUserProgress {
  skillSlug: string;
  completedSteps: number[];
  totalSessions: number;
  lastSessionAt: string | null;
  activeSession: SkillProgramActiveSession | null;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: 'Push' | 'Pull' | 'Core' | 'Legs' | 'Balance' | 'Static';
  icon: string; // Lucide icon name
  masteryLevels: MasteryLevel[];
  prerequisites?: string[]; // IDs of other skills
}

export interface UserSkillMastery {
  skillId: string;
  currentPoints: number;
  currentLevel: number;
  lastTrained?: string; // ISO string
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan?: 'free' | 'pro';
  role?: 'user' | 'admin';
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  goals?: string[];
  avatarUrl?: string;
  mastery?: UserSkillMastery[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Push' | 'Pull' | 'Core' | 'Legs' | 'Full Body' | 'Balance' | 'Static';
  primaryMuscles: string[];
  secondaryMuscles: string[];
  formTips: string[];
  commonMistakes: string[];
  videoUrl?: string;
  imageUrl?: string;
  progressions?: {
    easier?: string[];
    harder?: string[];
  };
}

export interface WorkoutExercise {
  exerciseId: string;
  sets?: number;
  reps?: number | string;
  duration?: number;
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  exercises: WorkoutExercise[];
  durationEstimate?: number;
  isRecommended?: boolean;
  isGlobal?: boolean;
  creatorId?: string;
}

export interface RoutinePlanBucket {
  skills: string[];
  workouts: string[];
  exercises: string[];
}

export interface DayRoutinePlan {
  id: string;
  title: string;
  dateLabel?: string;
  notes?: string;
  slots: {
    morning: RoutinePlanBucket;
    afternoon: RoutinePlanBucket;
    evening: RoutinePlanBucket;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPerformance {
  exerciseId: string;
  setsCompleted: { reps?: number | string; duration?: number }[];
  notes?: string;
}

export interface WorkoutHistory {
  id: string;
  userId: string;
  sessionType?: 'workout' | 'skill' | 'exercise';
  workoutId?: string;
  skillId?: string;
  exerciseId?: string;
  sessionName?: string;
  date: string;
  durationActual: number;
  exercises?: {
    exerciseId: string;
    repsCompleted?: number;
    durationCompleted?: number;
    weight?: number;
  }[];
  xpGained?: number;
  notes?: string;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  totalSessions?: number;
  sessionsLast7Days?: number;
  sessionsToday?: number;
  hasTrainedToday: boolean;
  lastActiveDate: string | null;
}
