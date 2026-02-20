import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSkillSession extends Document {
  userId: mongoose.Types.ObjectId;
  skillSlug: string;
  stepNumber: number;
  sessionKey: string;
  status: 'active' | 'completed';
  warmupDoneExercises: string[];
  workoutDoneExercises: string[];
  elapsedSeconds: number;
  startedAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

const UserSkillSessionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    skillSlug: { type: String, required: true, index: true },
    stepNumber: { type: Number, required: true },
    sessionKey: { type: String, required: true },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    warmupDoneExercises: [{ type: String }],
    workoutDoneExercises: [{ type: String }],
    elapsedSeconds: { type: Number, default: 0 },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

UserSkillSessionSchema.index({ userId: 1, skillSlug: 1, stepNumber: 1, sessionKey: 1 }, { unique: true });

UserSkillSessionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export default mongoose.model<IUserSkillSession>('UserSkillSession', UserSkillSessionSchema);
