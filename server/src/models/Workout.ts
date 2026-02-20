import mongoose, { Document, Schema } from 'mongoose';

interface IWorkoutExercise {
  exerciseId: string;
  sets?: number;
  reps?: number | string;
  duration?: number;
  notes?: string;
}

export interface IWorkout extends Document {
  name: string;
  description: string;
  imageUrl?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  exercises: IWorkoutExercise[];
  durationEstimate?: number;
  isRecommended?: boolean;
  isGlobal?: boolean;
  creatorId?: string;
}

const WorkoutExerciseSchema = new Schema<IWorkoutExercise>(
  {
    exerciseId: { type: String, required: true },
    sets: { type: Number },
    reps: { type: Schema.Types.Mixed },
    duration: { type: Number },
    notes: { type: String },
  },
  { _id: false },
);

const WorkoutSchema = new Schema<IWorkout>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    exercises: { type: [WorkoutExerciseSchema], default: [] },
    durationEstimate: { type: Number },
    isRecommended: { type: Boolean, default: false },
    isGlobal: { type: Boolean, default: false },
    creatorId: { type: String },
  },
  { timestamps: true },
);

WorkoutSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret) {
    const value = ret as unknown as Record<string, unknown>;
    value.id = value._id;
    delete value._id;
  },
});

export default mongoose.model<IWorkout>('Workout', WorkoutSchema);
