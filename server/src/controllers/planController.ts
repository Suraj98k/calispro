import { Response } from 'express';
import UserDayPlan from '../models/UserDayPlan.js';
import { AuthRequest } from '../middleware/auth.js';

type PlanBucket = {
  skills: string[];
  workouts: string[];
  exercises: string[];
};

const normalizeList = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0);
};

const normalizeBucket = (value: unknown): PlanBucket => {
  const v = (value || {}) as Record<string, unknown>;
  return {
    skills: normalizeList(v.skills),
    workouts: normalizeList(v.workouts),
    exercises: normalizeList(v.exercises),
  };
};

const hasAnyItem = (bucket: PlanBucket) => bucket.skills.length || bucket.workouts.length || bucket.exercises.length;

export const getPlans = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const plans = await UserDayPlan.find({ userId }).sort({ updatedAt: -1 });
    res.json(plans);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPlanById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const plan = await UserDayPlan.findOne({ _id: req.params.id, userId });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    res.json(plan);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const body = req.body as Record<string, unknown>;
    const title = typeof body.title === 'string' ? body.title.trim() : '';

    if (!title) {
      return res.status(400).json({ message: 'Plan title is required' });
    }

    const slotsRaw = (body.slots || {}) as Record<string, unknown>;
    const morning = normalizeBucket(slotsRaw.morning);
    const afternoon = normalizeBucket(slotsRaw.afternoon);
    const evening = normalizeBucket(slotsRaw.evening);

    if (!hasAnyItem(morning) && !hasAnyItem(afternoon) && !hasAnyItem(evening)) {
      return res.status(400).json({ message: 'Plan must contain at least one item' });
    }

    const dateLabel = typeof body.dateLabel === 'string' && body.dateLabel.trim() ? body.dateLabel.trim() : undefined;
    const notes = typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : undefined;

    const created = await UserDayPlan.create({
      userId,
      title,
      dateLabel,
      notes,
      slots: {
        morning,
        afternoon,
        evening,
      },
    });

    res.status(201).json(created);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const deleted = await UserDayPlan.findOneAndDelete({ _id: req.params.id, userId });
    if (!deleted) return res.status(404).json({ message: 'Plan not found' });

    res.json({ message: 'Plan deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
