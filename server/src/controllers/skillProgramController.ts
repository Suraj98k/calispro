import { Request, Response } from 'express';
import SkillProgram, {
  ISkillProgramExercise,
  ISkillProgramProgression,
  ISkillProgramWorkout,
} from '../models/SkillProgram.js';
import UserSkillSession from '../models/UserSkillSession.js';
import { AuthRequest } from '../middleware/auth.js';

type SessionPhase = 'warmup' | 'workout';

type SkillProgramPayload = {
  slug: string;
  skill: string;
  image: string;
  video?: string;
  progressions: ISkillProgramProgression[];
};

const parseStartedAt = (sessionKey: string) => {
  const numeric = Number(sessionKey);
  if (!Number.isNaN(numeric) && numeric > 0) return new Date(numeric);
  return new Date();
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const isValidExercise = (value: unknown): value is ISkillProgramExercise => {
  if (!value || typeof value !== 'object') return false;
  const exercise = value as Record<string, unknown>;
  return (
    isNonEmptyString(exercise.name) &&
    isPositiveNumber(exercise.sets) &&
    isPositiveNumber(exercise.reps) &&
    isNonEmptyString(exercise.image) &&
    (exercise.video === undefined || isNonEmptyString(exercise.video))
  );
};

const isValidWorkout = (value: unknown): value is ISkillProgramWorkout => {
  if (!value || typeof value !== 'object') return false;
  const workout = value as Record<string, unknown>;

  return (
    isNonEmptyString(workout.name) &&
    isNonEmptyString(workout.image) &&
    (workout.video === undefined || isNonEmptyString(workout.video)) &&
    Array.isArray(workout.exercises) &&
    workout.exercises.length > 0 &&
    workout.exercises.every(isValidExercise)
  );
};

const isValidProgression = (value: unknown): value is ISkillProgramProgression => {
  if (!value || typeof value !== 'object') return false;
  const progression = value as Record<string, unknown>;

  return (
    isNonEmptyString(progression.name) &&
    isNonEmptyString(progression.image) &&
    (progression.video === undefined || isNonEmptyString(progression.video)) &&
    Array.isArray(progression.workouts) &&
    progression.workouts.length > 0 &&
    progression.workouts.every(isValidWorkout)
  );
};

const parseSkillProgramPayload = (
  payload: unknown,
  { partial }: { partial: boolean },
): { data?: Partial<SkillProgramPayload>; error?: string } => {
  if (!payload || typeof payload !== 'object') {
    return { error: 'Body must be a JSON object' };
  }

  const body = payload as Record<string, unknown>;
  const data: Partial<SkillProgramPayload> = {};

  const requiredFields: (keyof SkillProgramPayload)[] = ['slug', 'skill', 'image', 'progressions'];

  if (!partial) {
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return { error: `Missing required field: ${field}` };
      }
    }
  }

  if (body.slug !== undefined) {
    if (!isNonEmptyString(body.slug)) return { error: 'slug must be a non-empty string' };
    data.slug = body.slug.trim().toLowerCase();
  }

  if (body.skill !== undefined) {
    if (!isNonEmptyString(body.skill)) return { error: 'skill must be a non-empty string' };
    data.skill = body.skill.trim();
  }

  if (body.image !== undefined) {
    if (!isNonEmptyString(body.image)) return { error: 'image must be a non-empty string' };
    data.image = body.image.trim();
  }

  if (body.video !== undefined) {
    if (!isNonEmptyString(body.video)) return { error: 'video must be a non-empty string when provided' };
    data.video = body.video.trim();
  }

  if (body.progressions !== undefined) {
    if (!Array.isArray(body.progressions) || body.progressions.length === 0) {
      return { error: 'progressions must be a non-empty array' };
    }
    if (!body.progressions.every(isValidProgression)) {
      return { error: 'progressions contains invalid items' };
    }
    data.progressions = body.progressions as ISkillProgramProgression[];
  }

  return { data };
};

const buildProgress = async (userId: string) => {
  const sessions = await UserSkillSession.find({ userId }).sort({ updatedAt: -1 });
  const bucket = new Map<
    string,
    {
      skillSlug: string;
      completedSteps: Set<number>;
      totalSessions: number;
      lastSessionAt: Date | null;
      activeSession: {
        stepNumber: number;
        sessionKey: string;
        warmupDoneCount: number;
        workoutDoneCount: number;
        status: 'active' | 'completed';
      } | null;
    }
  >();

  sessions.forEach((entry) => {
    const existing = bucket.get(entry.skillSlug) || {
      skillSlug: entry.skillSlug,
      completedSteps: new Set<number>(),
      totalSessions: 0,
      lastSessionAt: null,
      activeSession: null,
    };

    existing.totalSessions += 1;
    if (!existing.lastSessionAt || new Date(entry.updatedAt) > existing.lastSessionAt) {
      existing.lastSessionAt = new Date(entry.updatedAt);
    }

    if (entry.status === 'completed') {
      existing.completedSteps.add(entry.stepNumber);
    }

    if (entry.status === 'active' && !existing.activeSession) {
      existing.activeSession = {
        stepNumber: entry.stepNumber,
        sessionKey: entry.sessionKey,
        warmupDoneCount: entry.warmupDoneExercises.length,
        workoutDoneCount: entry.workoutDoneExercises.length,
        status: entry.status,
      };
    }

    bucket.set(entry.skillSlug, existing);
  });

  return Array.from(bucket.values()).map((entry) => ({
    skillSlug: entry.skillSlug,
    completedSteps: Array.from(entry.completedSteps).sort((a, b) => a - b),
    totalSessions: entry.totalSessions,
    lastSessionAt: entry.lastSessionAt ? entry.lastSessionAt.toISOString() : null,
    activeSession: entry.activeSession,
  }));
};

export const getSkillPrograms = async (_req: Request, res: Response) => {
  try {
    const programs = await SkillProgram.find().sort({ skill: 1 });
    res.json(programs);
  } catch (_err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSkillProgramBySlug = async (req: Request, res: Response) => {
  try {
    const program = await SkillProgram.findOne({ slug: req.params.slug });
    if (!program) {
      return res.status(404).json({ message: 'Skill program not found' });
    }
    res.json(program);
  } catch (_err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserSkillProgramProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const progress = await buildProgress(userId);
    res.json(progress);
  } catch (_err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const trackUserSkillSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      skillSlug,
      stepNumber,
      sessionKey,
      phase,
      exerciseName,
      elapsedSeconds = 0,
      completeSession = false,
    } = req.body as {
      skillSlug?: string;
      stepNumber?: number;
      sessionKey?: string;
      phase?: SessionPhase;
      exerciseName?: string;
      elapsedSeconds?: number;
      completeSession?: boolean;
    };

    if (!skillSlug || !stepNumber || !sessionKey || !phase) {
      return res.status(400).json({ message: 'Missing required tracking fields' });
    }

    if (phase !== 'warmup' && phase !== 'workout') {
      return res.status(400).json({ message: 'Invalid phase value' });
    }

    const update: Record<string, unknown> = {
      $set: {
        elapsedSeconds: isNonNegativeNumber(elapsedSeconds) ? elapsedSeconds : 0,
      },
      $setOnInsert: {
        startedAt: parseStartedAt(sessionKey),
      },
    };

    if (exerciseName) {
      if (phase === 'warmup') {
        update.$addToSet = { warmupDoneExercises: exerciseName };
      } else {
        update.$addToSet = { workoutDoneExercises: exerciseName };
      }
    }

    if (completeSession) {
      update.$set = {
        ...(update.$set as Record<string, unknown>),
        status: 'completed',
        completedAt: new Date(),
      };
    }

    const session = await UserSkillSession.findOneAndUpdate(
      { userId, skillSlug, stepNumber, sessionKey },
      update,
      { returnDocument: 'after', upsert: true },
    );

    const progress = await buildProgress(userId);
    res.json({ session, progress });
  } catch (_err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAdminSkillPrograms = async (_req: AuthRequest, res: Response) => {
  try {
    const programs = await SkillProgram.find().sort({ skill: 1 });
    res.json(programs);
  } catch (_err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAdminSkillProgramById = async (req: AuthRequest, res: Response) => {
  try {
    const program = await SkillProgram.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Skill program not found' });
    }
    res.json(program);
  } catch (_err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAdminSkillProgram = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = parseSkillProgramPayload(req.body, { partial: false });
    if (parsed.error || !parsed.data) {
      return res.status(400).json({ message: parsed.error || 'Invalid payload' });
    }

    const created = await SkillProgram.create(parsed.data);
    res.status(201).json(created);
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return res.status(409).json({ message: 'A skill program with this slug already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAdminSkillProgram = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = parseSkillProgramPayload(req.body, { partial: true });
    if (parsed.error || !parsed.data) {
      return res.status(400).json({ message: parsed.error || 'Invalid payload' });
    }

    if (Object.keys(parsed.data).length === 0) {
      return res.status(400).json({ message: 'No fields provided to update' });
    }

    const updated = await SkillProgram.findByIdAndUpdate(req.params.id, parsed.data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Skill program not found' });
    }

    res.json(updated);
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return res.status(409).json({ message: 'A skill program with this slug already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAdminSkillProgram = async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await SkillProgram.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Skill program not found' });
    }

    res.json({ message: 'Skill program deleted successfully' });
  } catch (_err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const bulkUpsertAdminSkillPrograms = async (req: AuthRequest, res: Response) => {
  try {
    const { programs } = req.body as { programs?: unknown[] };

    if (!Array.isArray(programs) || programs.length === 0) {
      return res.status(400).json({ message: 'programs must be a non-empty array' });
    }

    const validPrograms: SkillProgramPayload[] = [];

    for (let index = 0; index < programs.length; index += 1) {
      const parsed = parseSkillProgramPayload(programs[index], { partial: false });
      if (parsed.error || !parsed.data) {
        return res.status(400).json({
          message: `Invalid program at index ${index}: ${parsed.error || 'Invalid payload'}`,
        });
      }
      validPrograms.push(parsed.data as SkillProgramPayload);
    }

    let created = 0;
    let updated = 0;

    for (const program of validPrograms) {
      const exists = await SkillProgram.exists({ slug: program.slug });
      await SkillProgram.findOneAndUpdate({ slug: program.slug }, program, {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      });

      if (exists) {
        updated += 1;
      } else {
        created += 1;
      }
    }

    res.json({
      message: 'Bulk upload completed successfully',
      total: validPrograms.length,
      created,
      updated,
    });
  } catch (_err) {
    res.status(500).json({ message: 'Server error' });
  }
};
