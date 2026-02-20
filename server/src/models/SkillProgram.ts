import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillProgramExercise {
  name: string;
  sets: number;
  reps: number;
  image: string;
  video?: string;
}

export interface ISkillProgramWorkout {
  name: string;
  image: string;
  video?: string;
  exercises: ISkillProgramExercise[];
}

export interface ISkillProgramProgression {
  name: string;
  image: string;
  video?: string;
  workouts: ISkillProgramWorkout[];
}

export interface ISkillProgram extends Document {
  slug: string;
  skill: string;
  image: string;
  video?: string;
  progressions: ISkillProgramProgression[];
}

const SkillProgramExerciseSchema = new Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  image: { type: String, required: true },
  video: { type: String, required: false },
});

const SkillProgramWorkoutSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  video: { type: String, required: false },
  exercises: [SkillProgramExerciseSchema],
});

const SkillProgramProgressionSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  video: { type: String, required: false },
  workouts: [SkillProgramWorkoutSchema],
});

const SkillProgramSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true, index: true },
  skill: { type: String, required: true },
  image: { type: String, required: true },
  video: { type: String, required: false },
  progressions: [SkillProgramProgressionSchema],
});

SkillProgramSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export default mongoose.model<ISkillProgram>('SkillProgram', SkillProgramSchema);
