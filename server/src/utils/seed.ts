import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SkillProgram from '../models/SkillProgram.js';
import UserSkillSession from '../models/UserSkillSession.js';
import Exercise from '../models/Exercise.js';
import Workout from '../models/Workout.js';
import { skillPrograms } from '../data/skillPrograms.js';
import { prebuiltExercises } from '../data/exercises.js';
import { prebuiltWorkouts } from '../data/workouts.js';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/calispro');
    console.log('Connected to MongoDB for seeding...');

    await SkillProgram.deleteMany({});
    await UserSkillSession.deleteMany({});

    console.log('Inserting Skill Programs...');
    await SkillProgram.insertMany(skillPrograms);

    console.log('Seeding prebuilt exercises (upsert by name)...');
    for (const exercise of prebuiltExercises) {
      await Exercise.updateOne(
        { name: exercise.name },
        {
          $setOnInsert: {
            ...exercise,
            createdBy: 'system-seed',
          },
        },
        { upsert: true },
      );
    }

    console.log('Seeding prebuilt workouts (global for all users)...');
    for (const workout of prebuiltWorkouts) {
      const resolvedExercises = [];
      for (const item of workout.exercises) {
        const match = await Exercise.findOne({ name: item.exerciseName }).select('_id');
        if (!match) continue;
        resolvedExercises.push({
          exerciseId: match._id.toString(),
          sets: item.sets,
          reps: item.reps,
          duration: item.duration,
        });
      }

      if (!resolvedExercises.length) continue;

      await Workout.updateOne(
        { name: workout.name, isGlobal: true },
        {
          $setOnInsert: {
            name: workout.name,
            description: workout.description,
            level: workout.level,
            durationEstimate: workout.durationEstimate,
            isRecommended: !!workout.isRecommended,
            imageUrl: workout.imageUrl,
            exercises: resolvedExercises,
            isGlobal: true,
            creatorId: 'system-seed',
          },
        },
        { upsert: true },
      );
    }

    console.log('Skill Programs, exercises, and workouts seeded successfully');
    process.exit();
  } catch (err) {
    console.error('Seeding error details:', err);
    process.exit(1);
  }
};

seedDB();
