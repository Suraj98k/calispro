import mongoose, { Document, Schema } from 'mongoose';

export interface IExercise extends Document {
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
  createdBy?: string;
  isGlobal: boolean;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    category: { type: String, enum: ['Push', 'Pull', 'Core', 'Legs', 'Full Body', 'Balance', 'Static'], required: true },
    primaryMuscles: { type: [String], default: [] },
    secondaryMuscles: { type: [String], default: [] },
    formTips: { type: [String], default: [] },
    commonMistakes: { type: [String], default: [] },
    videoUrl: { type: String },
    imageUrl: { type: String },
    progressions: {
      easier: { type: [String], default: [] },
      harder: { type: [String], default: [] },
    },
    createdBy: { type: String },
    isGlobal: { type: Boolean, default: true },
  },
  { timestamps: true },
);

ExerciseSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret) {
    const value = ret as unknown as Record<string, unknown>;
    value.id = value._id;
    delete value._id;
  },
});

export default mongoose.model<IExercise>('Exercise', ExerciseSchema);
