import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import {
  Skill,
  Exercise,
  UserProfile,
  UserSkillMastery,
  Workout,
  WorkoutHistory,
  StreakStats,
  SkillProgram,
  SkillProgramUserProgress,
  DayRoutinePlan,
} from '@/types';

type AdminSkillProgramPayload = {
  slug: string;
  skill: string;
  image: string;
  video?: string;
  progressions: SkillProgram['progressions'];
};

type AdminExercisePayload = {
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
};

type AdminWorkoutPayload = {
  name: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationEstimate?: number;
  isRecommended?: boolean;
  isGlobal?: boolean;
  exercises: {
    exerciseId: string;
    sets: number;
    reps?: number | string;
    duration?: number;
  }[];
};

export type CreateDayRoutinePlanPayload = {
  title: string;
  dateLabel?: string;
  notes?: string;
  slots: DayRoutinePlan['slots'];
};

const getAuthScope = () => {
  if (typeof window === 'undefined') return 'server';
  const token = window.localStorage.getItem('authToken');
  if (!token) return 'anonymous';

  try {
    const parts = token.split('.');
    if (parts.length < 2) return 'anonymous';

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(window.atob(padded)) as { id?: string };
    return typeof payload.id === 'string' && payload.id.length ? payload.id : 'anonymous';
  } catch {
    return 'anonymous';
  }
};

// Profile Hooks
export const useProfile = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserProfile>('/auth/me');
      return data;
    },
    enabled: options?.enabled ?? true,
    retry: false,
  });
};

// Skill Hooks
export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data } = await apiClient.get<Skill[]>('/skills');
      return data;
    },
  });
};

export const useUserMastery = () => {
  return useQuery({
    queryKey: ['user-mastery'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserSkillMastery[]>('/skills/user/progress');
      return data;
    },
  });
};

// Exercise Hooks
export const useExercises = () => {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data } = await apiClient.get<Exercise[]>('/exercises');
      return data;
    },
  });
};

export const useExerciseById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['exercises', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Exercise>(`/exercises/${id}`);
      return data;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};

export const useCreateAdminExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminExercisePayload) => {
      const { data } = await apiClient.post<Exercise>('/exercises/admin', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
};

export const useUpdateAdminExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<AdminExercisePayload> }) => {
      const { data } = await apiClient.patch<Exercise>(`/exercises/admin/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
};

export const useDeleteAdminExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/exercises/admin/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
};

// Workout Hooks
export const useWorkouts = () => {
  const authScope = getAuthScope();

  return useQuery({
    queryKey: ['workouts', authScope],
    queryFn: async () => {
      const { data } = await apiClient.get<Workout[]>('/workouts');
      return data;
    },
  });
};

export const useWorkoutById = (id: string, options?: { enabled?: boolean }) => {
  const authScope = getAuthScope();

  return useQuery({
    queryKey: ['workouts', authScope, id],
    queryFn: async () => {
      const { data } = await apiClient.get<Workout>(`/workouts/${id}`);
      return data;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description: string;
      imageUrl?: string;
      videoUrl?: string;
      level: 'Beginner' | 'Intermediate' | 'Advanced';
      durationEstimate: number;
      exercises: {
        exerciseId: string;
        sets: number;
        reps?: number | string;
        duration?: number;
      }[];
    }) => {
      const { data } = await apiClient.post<Workout>('/workouts', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

export const useAdminWorkouts = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-workouts'],
    queryFn: async () => {
      const { data } = await apiClient.get<Workout[]>('/workouts/admin/all');
      return data;
    },
    enabled: options?.enabled ?? true,
  });
};

export const useCreateAdminWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminWorkoutPayload) => {
      const { data } = await apiClient.post<Workout>('/workouts/admin', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

export const useUpdateAdminWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<AdminWorkoutPayload> }) => {
      const { data } = await apiClient.patch<Workout>(`/workouts/admin/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

export const useDeleteAdminWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/workouts/admin/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
};

export const useSkillById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['skills', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Skill>(`/skills/${id}`);
      return data;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};

export const useSkillPrograms = () => {
  return useQuery({
    queryKey: ['skill-programs'],
    queryFn: async () => {
      const { data } = await apiClient.get<SkillProgram[]>('/skill-programs');
      return data;
    },
  });
};

export const useSkillProgramBySlug = (slug: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['skill-programs', slug],
    queryFn: async () => {
      const { data } = await apiClient.get<SkillProgram>(`/skill-programs/${slug}`);
      return data;
    },
    enabled: !!slug && (options?.enabled ?? true),
  });
};

export const useSkillProgramProgress = () => {
  const authScope = getAuthScope();
  return useQuery({
    queryKey: ['skill-program-progress', authScope],
    queryFn: async () => {
      const { data } = await apiClient.get<SkillProgramUserProgress[]>('/skill-programs/user/progress');
      return data;
    },
  });
};

export const useTrackSkillSession = () => {
  const queryClient = useQueryClient();
  const authScope = getAuthScope();

  return useMutation({
    mutationFn: async (payload: {
      skillSlug: string;
      stepNumber: number;
      sessionKey: string;
      phase: 'warmup' | 'workout';
      exerciseName?: string;
      elapsedSeconds: number;
      completeSession?: boolean;
    }) => {
      const { data } = await apiClient.post('/skill-programs/user/session', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-program-progress', authScope] });
      queryClient.invalidateQueries({ queryKey: ['streak-stats', authScope] });
      queryClient.invalidateQueries({ queryKey: ['workout-history', authScope] });
    },
  });
};

export const usePlans = () => {
  const authScope = getAuthScope();
  return useQuery({
    queryKey: ['plans', authScope],
    queryFn: async () => {
      const { data } = await apiClient.get<DayRoutinePlan[]>('/plans');
      return data;
    },
  });
};

export const usePlanById = (id: string, options?: { enabled?: boolean }) => {
  const authScope = getAuthScope();
  return useQuery({
    queryKey: ['plans', authScope, id],
    queryFn: async () => {
      const { data } = await apiClient.get<DayRoutinePlan>(`/plans/${id}`);
      return data;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDayRoutinePlanPayload) => {
      const { data } = await apiClient.post<DayRoutinePlan>('/plans', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/plans/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
};

export const useAdminSkillPrograms = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-skill-programs'],
    queryFn: async () => {
      const { data } = await apiClient.get<SkillProgram[]>('/skill-programs/admin');
      return data;
    },
    enabled: options?.enabled ?? true,
  });
};

export const useAdminSkillProgramById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-skill-programs', id],
    queryFn: async () => {
      const { data } = await apiClient.get<SkillProgram>(`/skill-programs/admin/${id}`);
      return data;
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};

export const useCreateAdminSkillProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdminSkillProgramPayload) => {
      const { data } = await apiClient.post<SkillProgram>('/skill-programs/admin', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skill-programs'] });
      queryClient.invalidateQueries({ queryKey: ['skill-programs'] });
    },
  });
};

export const useUpdateAdminSkillProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<AdminSkillProgramPayload> }) => {
      const { data } = await apiClient.patch<SkillProgram>(`/skill-programs/admin/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skill-programs'] });
      queryClient.invalidateQueries({ queryKey: ['skill-programs'] });
    },
  });
};

export const useDeleteAdminSkillProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/skill-programs/admin/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skill-programs'] });
      queryClient.invalidateQueries({ queryKey: ['skill-programs'] });
    },
  });
};

export const useBulkUploadAdminSkillPrograms = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programs: AdminSkillProgramPayload[]) => {
      const { data } = await apiClient.post('/skill-programs/admin/bulk', { programs });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skill-programs'] });
      queryClient.invalidateQueries({ queryKey: ['skill-programs'] });
    },
  });
};

export const useUploadAdminImage = () => {
  return useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: string }) => {
      const formData = new FormData();
      formData.append('image', file);
      if (folder) {
        formData.append('folder', folder);
      }

      const { data } = await apiClient.post<{ url: string; publicId: string }>('/uploads/image', formData);

      return data;
    },
  });
};

// Workout History Hook
export const useWorkoutHistory = (limit: number = 5) => {
  const authScope = getAuthScope();

  return useQuery({
    queryKey: ['workout-history', authScope, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<WorkoutHistory[]>('/logs/history', { params: { limit } });
      return data;
    },
  });
};

export const useStreakStats = () => {
  const authScope = getAuthScope();

  return useQuery({
    queryKey: ['streak-stats', authScope],
    queryFn: async () => {
      const { data } = await apiClient.get<StreakStats>('/logs/streaks');
      return data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: Partial<UserProfile> & { goals?: string[] }) => {
      const { data } = await apiClient.patch('/auth/profile', profileData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Logging / Mutation Hooks
export const useLogWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workoutData: {
      sessionType?: 'workout' | 'skill' | 'exercise';
      workoutId?: string;
      skillId?: string;
      exerciseId?: string;
      sessionName?: string;
      durationActual: number;
      notes: string;
      xpGained: number;
      exercises: { exerciseId: string; repsCompleted?: number; durationCompleted?: number }[];
    }) => {
      const { data } = await apiClient.post('/logs', workoutData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-mastery'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['workout-history'] });
      queryClient.invalidateQueries({ queryKey: ['streak-stats'] });
    },
  });
};

export const useUpdateMasteryPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { skillId: string; points: number }) => {
      const { data } = await apiClient.post('/skills/user/progress', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-mastery'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
};

export const useDeleteHistoryEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (historyId: string) => {
      await apiClient.delete(`/logs/history/${historyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-history'] });
      queryClient.invalidateQueries({ queryKey: ['streak-stats'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-mastery'] });
    },
  });
};

export const useDeleteAllHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/logs/history');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-history'] });
      queryClient.invalidateQueries({ queryKey: ['streak-stats'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-mastery'] });
    },
  });
};
