import { Response } from 'express';
import Workout from '../models/Workout.js';
import Exercise from '../models/Exercise.js';
import { AuthRequest } from '../middleware/auth.js';

const FREE_WORKOUT_LIMIT = 4;

const validateWorkoutPayload = async (body: Record<string, unknown>, { partial = false }: { partial?: boolean } = {}) => {
  const { name, description, level, exercises, durationEstimate, imageUrl, videoUrl, isRecommended } = body;

  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) return { error: 'name is required' };
  }
  if (!partial || description !== undefined) {
    if (typeof description !== 'string' || !description.trim()) return { error: 'description is required' };
  }
  if (!partial || level !== undefined) {
    if (typeof level !== 'string' || !['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
      return { error: 'level is invalid' };
    }
  }

  let normalizedExercises:
    | {
        exerciseId: string;
        sets: number;
        reps: string | number | undefined;
        duration: number | undefined;
      }[]
    | undefined = undefined;

  if (!partial || exercises !== undefined) {
    if (!Array.isArray(exercises) || exercises.length === 0) {
      return { error: 'at least one exercise is required' };
    }

    normalizedExercises = exercises.map((entry) => {
      const item = entry as Record<string, unknown>;
      return {
        exerciseId: typeof item.exerciseId === 'string' ? item.exerciseId : '',
        sets: typeof item.sets === 'number' ? item.sets : 1,
        reps: typeof item.reps === 'number' || typeof item.reps === 'string' ? item.reps : undefined,
        duration: typeof item.duration === 'number' ? item.duration : undefined,
      };
    });

    if (normalizedExercises.some((entry) => !entry.exerciseId)) {
      return { error: 'all exercises must include exerciseId' };
    }

    const ids = normalizedExercises.map((entry) => entry.exerciseId);
    const existing = await Exercise.countDocuments({ _id: { $in: ids } });
    if (existing !== ids.length) {
      return { error: 'one or more selected exercises were not found' };
    }
  }

  const payload: Record<string, unknown> = {};
  if (name !== undefined) payload.name = (name as string).trim();
  if (description !== undefined) payload.description = (description as string).trim();
  if (level !== undefined) payload.level = level;
  if (imageUrl !== undefined) {
    payload.imageUrl = typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : undefined;
  }
  if (videoUrl !== undefined) {
    payload.videoUrl = typeof videoUrl === 'string' && videoUrl.trim() ? videoUrl.trim() : undefined;
  }
  if (durationEstimate !== undefined) {
    payload.durationEstimate = typeof durationEstimate === 'number' ? durationEstimate : undefined;
  }
  if (normalizedExercises !== undefined) payload.exercises = normalizedExercises;
  if (isRecommended !== undefined) payload.isRecommended = Boolean(isRecommended);

  return {
    data: payload,
  };
};

export const getWorkouts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const workouts = await Workout.find({
      $or: [{ isGlobal: true }, { creatorId: userId }],
    }).sort({ createdAt: -1 });

    res.json(workouts);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getWorkoutById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });

    if (!workout.isGlobal && workout.creatorId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(workout);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });



    const parsed = await validateWorkoutPayload(req.body as Record<string, unknown>, { partial: false });
    if ('error' in parsed) return res.status(400).json({ message: parsed.error });

    const created = await Workout.create({
      ...parsed.data,
      creatorId: userId,
      isGlobal: false,
    });

    res.status(201).json(created);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAdminWorkouts = async (_req: AuthRequest, res: Response) => {
  try {
    const workouts = await Workout.find().sort({ createdAt: -1 });
    res.json(workouts);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAdminWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = await validateWorkoutPayload(req.body as Record<string, unknown>, { partial: false });
    if ('error' in parsed) return res.status(400).json({ message: parsed.error });

    const body = req.body as Record<string, unknown>;
    const created = await Workout.create({
      ...parsed.data,
      isGlobal: body.isGlobal === undefined ? true : Boolean(body.isGlobal),
      creatorId: req.user?.id || 'admin',
    });

    res.status(201).json(created);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAdminWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = await validateWorkoutPayload(req.body as Record<string, unknown>, { partial: true });
    if ('error' in parsed) return res.status(400).json({ message: parsed.error });

    const body = req.body as Record<string, unknown>;
    const updates: Record<string, unknown> = { ...parsed.data };
    if (body.isGlobal !== undefined) updates.isGlobal = Boolean(body.isGlobal);

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'No fields provided to update' });
    }

    const updated = await Workout.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: 'Workout not found' });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAdminWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await Workout.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Workout not found' });
    res.json({ message: 'Workout deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
