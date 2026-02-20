import mongoose, { Document, Schema } from 'mongoose';

export interface IPlanBucket {
  skills: string[];
  workouts: string[];
  exercises: string[];
}

export interface IUserDayPlan extends Document {
  userId: string;
  title: string;
  dateLabel?: string;
  notes?: string;
  slots: {
    morning: IPlanBucket;
    afternoon: IPlanBucket;
    evening: IPlanBucket;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PlanBucketSchema = new Schema<IPlanBucket>(
  {
    skills: { type: [String], default: [] },
    workouts: { type: [String], default: [] },
    exercises: { type: [String], default: [] },
  },
  { _id: false },
);

const UserDayPlanSchema = new Schema<IUserDayPlan>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    dateLabel: { type: String },
    notes: { type: String },
    slots: {
      morning: { type: PlanBucketSchema, default: () => ({}) },
      afternoon: { type: PlanBucketSchema, default: () => ({}) },
      evening: { type: PlanBucketSchema, default: () => ({}) },
    },
  },
  { timestamps: true },
);

UserDayPlanSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret) {
    const value = ret as unknown as Record<string, unknown>;
    value.id = value._id;
    delete value._id;
  },
});

export default mongoose.model<IUserDayPlan>('UserDayPlan', UserDayPlanSchema);
