type SeedWorkoutExercise = {
  exerciseName: string;
  sets: number;
  reps?: number;
  duration?: number;
};

type SeedWorkout = {
  name: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationEstimate: number;
  isRecommended?: boolean;
  imageUrl?: string;
  exercises: SeedWorkoutExercise[];
};

export const prebuiltWorkouts: SeedWorkout[] = [
  {
    name: 'Beginner Push Foundation',
    description: 'Introductory push session to build control and volume tolerance.',
    level: 'Beginner',
    durationEstimate: 25,
    isRecommended: true,
    exercises: [
      { exerciseName: 'Push Ups', sets: 4, reps: 10 },
      { exerciseName: 'Pike Push Ups', sets: 3, reps: 8 },
      { exerciseName: 'Plank Hold', sets: 3, duration: 30 },
    ],
  },
  {
    name: 'Core Stability Builder',
    description: 'Core-centered plan for anti-extension strength and trunk endurance.',
    level: 'Beginner',
    durationEstimate: 20,
    isRecommended: true,
    exercises: [
      { exerciseName: 'Plank Hold', sets: 4, duration: 40 },
      { exerciseName: 'Hollow Body Hold', sets: 3, duration: 25 },
      { exerciseName: 'Wall Sit', sets: 3, duration: 45 },
    ],
  },
  {
    name: 'Pull and Posture Session',
    description: 'Back and pulling mechanics to support calisthenics progression.',
    level: 'Intermediate',
    durationEstimate: 30,
    isRecommended: true,
    exercises: [
      { exerciseName: 'Australian Rows', sets: 5, reps: 10 },
      { exerciseName: 'Hollow Body Hold', sets: 3, duration: 30 },
      { exerciseName: 'Bodyweight Squats', sets: 4, reps: 15 },
    ],
  },
  {
    name: 'Legs and Engine',
    description: 'Lower-body endurance and strength base for daily training capacity.',
    level: 'Beginner',
    durationEstimate: 28,
    exercises: [
      { exerciseName: 'Bodyweight Squats', sets: 5, reps: 15 },
      { exerciseName: 'Wall Sit', sets: 4, duration: 45 },
      { exerciseName: 'Plank Hold', sets: 3, duration: 35 },
    ],
  },
  {
    name: 'Static Strength Circuit',
    description: 'Advanced static session for compression and shoulder stability.',
    level: 'Advanced',
    durationEstimate: 35,
    exercises: [
      { exerciseName: 'L-Sit Tuck Hold', sets: 5, duration: 20 },
      { exerciseName: 'Hollow Body Hold', sets: 4, duration: 30 },
      { exerciseName: 'Pike Push Ups', sets: 4, reps: 8 },
    ],
  },
];
