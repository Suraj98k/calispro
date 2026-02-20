import { Response } from 'express';
import Exercise from '../models/Exercise.js';
import { AuthRequest } from '../middleware/auth.js';

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
};

const buildExercisePayload = (body: Record<string, unknown>, { partial }: { partial: boolean }) => {
  const payload: Record<string, unknown> = {};

  const requiredFields = ['name', 'description', 'level', 'category'];
  if (!partial) {
    for (const field of requiredFields) {
      if (typeof body[field] !== 'string' || !(body[field] as string).trim()) {
        return { error: `${field} is required` };
      }
    }
  }

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) return { error: 'name must be a non-empty string' };
    payload.name = body.name.trim();
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string' || !body.description.trim()) return { error: 'description must be a non-empty string' };
    payload.description = body.description.trim();
  }

  if (body.level !== undefined) {
    const allowed = ['Beginner', 'Intermediate', 'Advanced'];
    if (typeof body.level !== 'string' || !allowed.includes(body.level)) {
      return { error: 'level must be Beginner, Intermediate, or Advanced' };
    }
    payload.level = body.level;
  }

  if (body.category !== undefined) {
    const allowed = ['Push', 'Pull', 'Core', 'Legs', 'Full Body', 'Balance', 'Static'];
    if (typeof body.category !== 'string' || !allowed.includes(body.category)) {
      return { error: 'category is invalid' };
    }
    payload.category = body.category;
  }

  if (body.primaryMuscles !== undefined) payload.primaryMuscles = normalizeStringArray(body.primaryMuscles);
  if (body.secondaryMuscles !== undefined) payload.secondaryMuscles = normalizeStringArray(body.secondaryMuscles);
  if (body.formTips !== undefined) payload.formTips = normalizeStringArray(body.formTips);
  if (body.commonMistakes !== undefined) payload.commonMistakes = normalizeStringArray(body.commonMistakes);

  if (body.videoUrl !== undefined) {
    if (typeof body.videoUrl !== 'string' || !body.videoUrl.trim()) return { error: 'videoUrl must be a non-empty string' };
    payload.videoUrl = body.videoUrl.trim();
  }

  if (body.imageUrl !== undefined) {
    if (typeof body.imageUrl !== 'string' || !body.imageUrl.trim()) return { error: 'imageUrl must be a non-empty string' };
    payload.imageUrl = body.imageUrl.trim();
  }

  if (body.progressions !== undefined) {
    const progressions = body.progressions as { easier?: unknown; harder?: unknown };
    payload.progressions = {
      easier: normalizeStringArray(progressions?.easier),
      harder: normalizeStringArray(progressions?.harder),
    };
  }

  return { data: payload };
};

export const getExercises = async (_req: AuthRequest, res: Response) => {
  try {
    const exercises = await Exercise.find().sort({ name: 1 });
    res.json(exercises);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getExerciseById = async (req: AuthRequest, res: Response) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
    res.json(exercise);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAdminExercise = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = buildExercisePayload(req.body as Record<string, unknown>, { partial: false });
    if ('error' in parsed) return res.status(400).json({ message: parsed.error });

    const created = await Exercise.create({
      ...parsed.data,
      isGlobal: true,
      createdBy: req.user?.id,
    });

    res.status(201).json(created);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAdminExercise = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = buildExercisePayload(req.body as Record<string, unknown>, { partial: true });
    if ('error' in parsed) return res.status(400).json({ message: parsed.error });

    if (!Object.keys(parsed.data || {}).length) {
      return res.status(400).json({ message: 'No fields provided to update' });
    }

    const updated = await Exercise.findByIdAndUpdate(req.params.id, parsed.data, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: 'Exercise not found' });

    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAdminExercise = async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await Exercise.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Exercise not found' });
    res.json({ message: 'Exercise deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
