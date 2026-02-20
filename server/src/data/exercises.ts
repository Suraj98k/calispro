type SeedExercise = {
  name: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Push' | 'Pull' | 'Core' | 'Legs' | 'Full Body' | 'Balance' | 'Static';
  instructions: string[];
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
  isGlobal: boolean;
};

export const prebuiltExercises: SeedExercise[] = [
  {
    name: 'Push Ups',
    description: 'Classic horizontal pushing exercise for chest, shoulders, and triceps.',
    level: 'Beginner',
    category: 'Push',
    instructions: ['Start in a strong plank', 'Lower chest under control', 'Press back up without sagging hips'],
    primaryMuscles: ['Chest', 'Triceps'],
    secondaryMuscles: ['Front Delts', 'Core'],
    formTips: ['Keep elbows 30-45 degrees', 'Brace core and glutes'],
    commonMistakes: ['Hips dropping', 'Half range reps'],
    progressions: {
      easier: ['Incline Push Ups', 'Knee Push Ups'],
      harder: ['Decline Push Ups', 'Archer Push Ups'],
    },
    isGlobal: true,
  },
  {
    name: 'Bodyweight Squats',
    description: 'Foundational lower body pattern for strength, mobility, and control.',
    level: 'Beginner',
    category: 'Legs',
    instructions: ['Stand shoulder-width', 'Sit down and back', 'Drive through full foot to stand'],
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    formTips: ['Keep chest tall', 'Track knees over toes'],
    commonMistakes: ['Heels lifting', 'Knees collapsing inward'],
    progressions: {
      easier: ['Box Squat'],
      harder: ['Jump Squat', 'Pistol Squat'],
    },
    isGlobal: true,
  },
  {
    name: 'Plank Hold',
    description: 'Static core drill that builds trunk stiffness and posture control.',
    level: 'Beginner',
    category: 'Core',
    instructions: ['Elbows under shoulders', 'Maintain straight line head to heel', 'Breathe slowly through the hold'],
    primaryMuscles: ['Rectus Abdominis', 'Transverse Abdominis'],
    secondaryMuscles: ['Obliques', 'Glutes'],
    formTips: ['Squeeze glutes', 'Do not shrug shoulders'],
    commonMistakes: ['Lower back arch', 'Head dropping'],
    progressions: {
      easier: ['Knee Plank'],
      harder: ['RKC Plank', 'Plank Shoulder Taps'],
    },
    isGlobal: true,
  },
  {
    name: 'Pike Push Ups',
    description: 'Vertical pressing pattern to build shoulder pressing strength.',
    level: 'Intermediate',
    category: 'Push',
    instructions: ['Start in pike position', 'Lower head toward floor', 'Press away strongly'],
    primaryMuscles: ['Shoulders', 'Triceps'],
    secondaryMuscles: ['Upper Chest', 'Core'],
    formTips: ['Stack hips over hands as much as possible', 'Control tempo'],
    commonMistakes: ['Too much lumbar extension', 'Elbows flaring wide'],
    progressions: {
      easier: ['Incline Pike Push Ups'],
      harder: ['Wall Handstand Push Ups'],
    },
    isGlobal: true,
  },
  {
    name: 'Australian Rows',
    description: 'Horizontal pull variation that improves back strength and posture.',
    level: 'Beginner',
    category: 'Pull',
    instructions: ['Set body in straight line under bar', 'Pull chest toward bar', 'Lower under control'],
    primaryMuscles: ['Lats', 'Mid Back'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    formTips: ['Lead with chest', 'Keep ribcage down'],
    commonMistakes: ['Shrugging shoulders', 'Hips sagging'],
    progressions: {
      easier: ['Higher Bar Rows'],
      harder: ['Feet Elevated Rows'],
    },
    isGlobal: true,
  },
  {
    name: 'Hollow Body Hold',
    description: 'Gymnastics core shape drill for skill transfer and bodyline control.',
    level: 'Intermediate',
    category: 'Core',
    instructions: ['Press lower back into floor', 'Lift shoulders and legs', 'Hold tension without losing shape'],
    primaryMuscles: ['Abs', 'Hip Flexors'],
    secondaryMuscles: ['Quads', 'Obliques'],
    formTips: ['Keep ribs tucked', 'Use short controlled breaths'],
    commonMistakes: ['Lower back lifting', 'Neck strain'],
    progressions: {
      easier: ['Tuck Hollow Hold'],
      harder: ['Hollow Rocks'],
    },
    isGlobal: true,
  },
  {
    name: 'Wall Sit',
    description: 'Isometric leg endurance exercise for quads and mental toughness.',
    level: 'Beginner',
    category: 'Legs',
    instructions: ['Back against wall', 'Slide to 90 degree knee bend', 'Hold position with steady breathing'],
    primaryMuscles: ['Quadriceps'],
    secondaryMuscles: ['Glutes', 'Calves'],
    formTips: ['Keep knees aligned with feet', 'Stay relaxed in shoulders'],
    commonMistakes: ['Knees collapsing', 'Standing too high'],
    progressions: {
      easier: ['Higher Wall Sit'],
      harder: ['Single-Leg Wall Sit'],
    },
    isGlobal: true,
  },
  {
    name: 'L-Sit Tuck Hold',
    description: 'Static compression strength drill for abs, hip flexors, and shoulder stability.',
    level: 'Advanced',
    category: 'Static',
    instructions: ['Support body on parallel bars or floor blocks', 'Lift knees toward chest', 'Hold with locked elbows'],
    primaryMuscles: ['Hip Flexors', 'Abs'],
    secondaryMuscles: ['Triceps', 'Shoulders'],
    formTips: ['Push down hard through hands', 'Keep chest open'],
    commonMistakes: ['Bending elbows', 'Leaning too far back'],
    progressions: {
      easier: ['Seated Tuck Lifts'],
      harder: ['Full L-Sit Hold'],
    },
    isGlobal: true,
  },
];
