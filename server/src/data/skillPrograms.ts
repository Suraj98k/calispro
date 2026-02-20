export type SkillProgramExercise = {
  name: string;
  sets: number;
  reps: number;
  image: string;
  video?: string;
};

export type SkillProgramWorkout = {
  name: string;
  image: string;
  video?: string;
  exercises: SkillProgramExercise[];
};

export type SkillProgramProgression = {
  name: string;
  image: string;
  video?: string;
  workouts: SkillProgramWorkout[];
};

export type SkillProgram = {
  slug: string;
  skill: string;
  image: string;
  video?: string;
  progressions: SkillProgramProgression[];
};

const toSkillSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

const IMG = {
  pull: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
  pullExplosive: 'https://images.unsplash.com/photo-1598971639058-a3776f9a90e2?q=80&w=1200&auto=format&fit=crop',
  push: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=1200&auto=format&fit=crop',
  pushup: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=1200&auto=format&fit=crop',
  staticCore: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
  balance: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
  handstand: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop',
  legs: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?q=80&w=1200&auto=format&fit=crop',
  vsit: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop',
  bar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
};

const VIDEO = {
  pull: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-on-a-bar-3560-large.mp4',
  pullExplosive: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-on-a-bar-3560-large.mp4',
  push: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-push-ups-3512-large.mp4',
  pushup: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-push-ups-3512-large.mp4',
  staticCore: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-poses-1747-large.mp4',
  balance: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-poses-1747-large.mp4',
  handstand: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-handstand-against-a-wall-4057-large.mp4',
  legs: 'https://assets.mixkit.co/videos/preview/mixkit-man-performing-squats-with-barbells-at-the-gym-43770-large.mp4',
  vsit: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-poses-1747-large.mp4',
  bar: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pull-ups-on-a-bar-3560-large.mp4',
};

const VIDEO_BY_IMAGE: Record<string, string> = {
  [IMG.pull]: VIDEO.pull,
  [IMG.pullExplosive]: VIDEO.pullExplosive,
  [IMG.push]: VIDEO.push,
  [IMG.pushup]: VIDEO.pushup,
  [IMG.staticCore]: VIDEO.staticCore,
  [IMG.balance]: VIDEO.balance,
  [IMG.handstand]: VIDEO.handstand,
  [IMG.legs]: VIDEO.legs,
  [IMG.vsit]: VIDEO.vsit,
  [IMG.bar]: VIDEO.bar,
};

const resolveVideo = (image: string) => VIDEO_BY_IMAGE[image];

const ex = (name: string, sets: number, reps: number, image: string): SkillProgramExercise => ({
  name,
  sets,
  reps,
  image,
  video: resolveVideo(image),
});

const step = (name: string, image: string, exercises: SkillProgramExercise[], workoutName = 'Workout A'): SkillProgramProgression => ({
  name,
  image,
  video: resolveVideo(image),
  workouts: [
    {
      name: workoutName,
      image,
      video: resolveVideo(image),
      exercises,
    },
  ],
});

const rawPrograms: Omit<SkillProgram, 'slug'>[] = [
  {
    skill: 'Muscle Up',
    image: IMG.bar,
    progressions: [
      step('Pull Up', IMG.pull, [
        ex('Scap Pull Up', 3, 8, IMG.pull),
        ex('Strict Pull Up', 4, 5, IMG.pull),
        ex('Body Row', 3, 10, IMG.pull),
        ex('Straight Bar Dip', 3, 6, IMG.push),
      ]),
      step('High Pull Up', IMG.pullExplosive, [
        ex('Chest to Bar Pull Up', 5, 3, IMG.pullExplosive),
        ex('High Pull Up', 4, 4, IMG.pullExplosive),
        ex('Russian Dip', 4, 6, IMG.push),
        ex('Hollow Body Hold', 3, 25, IMG.staticCore),
      ]),
      step('Jumping Muscle Up', IMG.bar, [
        ex('Jumping Muscle Up', 5, 3, IMG.bar),
        ex('Box Bar Muscle Up', 4, 4, IMG.bar),
        ex('Negative Muscle Up', 4, 3, IMG.bar),
        ex('Straight Bar Dip', 4, 8, IMG.push),
      ]),
      step('Kipping Muscle Up', IMG.bar, [
        ex('Kip Swing', 4, 8, IMG.bar),
        ex('Kipping Chest to Bar Pull Up', 4, 4, IMG.pullExplosive),
        ex('Kipping Muscle Up', 5, 2, IMG.bar),
        ex('Bar Dip', 4, 10, IMG.push),
      ]),
      step('Muscle Up', IMG.bar, [
        ex('Bar Muscle Up Attempt', 6, 1, IMG.bar),
        ex('Banded Bar Muscle Up', 4, 2, IMG.bar),
        ex('Weighted Chest to Bar Pull Up', 4, 3, IMG.pullExplosive),
        ex('Russian Dip', 4, 8, IMG.push),
      ]),
    ],
  },
  {
    skill: 'Front Lever',
    image: IMG.bar,
    progressions: [
      step('Tuck Front Lever', IMG.bar, [
        ex('Tuck Front Lever Hold', 4, 12, IMG.bar),
        ex('Scap Pull Up', 4, 8, IMG.pull),
        ex('Hanging Knee Raise', 4, 10, IMG.staticCore),
        ex('Inverted Row', 3, 12, IMG.pull),
      ]),
      step('Advanced Tuck Front Lever', IMG.bar, [
        ex('Advanced Tuck Front Lever Hold', 4, 10, IMG.bar),
        ex('Front Lever Raises (Tuck)', 4, 6, IMG.bar),
        ex('Weighted Pull Up', 4, 4, IMG.pullExplosive),
        ex('Hollow Body Hold', 3, 30, IMG.staticCore),
      ]),
      step('One Leg Front Lever', IMG.bar, [
        ex('One Leg Front Lever Hold', 5, 8, IMG.bar),
        ex('Front Lever Negatives', 4, 4, IMG.bar),
        ex('Toes to Bar', 4, 8, IMG.staticCore),
        ex('Straight Arm Pulldown (Band)', 3, 12, IMG.pull),
      ]),
      step('Straddle Front Lever', IMG.bar, [
        ex('Straddle Front Lever Hold', 5, 6, IMG.bar),
        ex('Front Lever Pull (Straddle)', 4, 4, IMG.bar),
        ex('Weighted Chin Up', 4, 4, IMG.pullExplosive),
        ex('Dragon Flag Negative', 3, 6, IMG.staticCore),
      ]),
      step('Full Front Lever', IMG.bar, [
        ex('Full Front Lever Hold', 6, 5, IMG.bar),
        ex('Front Lever Pull', 4, 3, IMG.bar),
        ex('Dead Hang + Scap Depression', 3, 30, IMG.pull),
        ex('Hollow to Arch Swings', 3, 10, IMG.staticCore),
      ]),
    ],
  },
  {
    skill: 'Planche',
    image: IMG.staticCore,
    progressions: [
      step('Planche Lean', IMG.staticCore, [
        ex('Planche Lean Hold', 4, 20, IMG.staticCore),
        ex('Pseudo Push Up', 4, 8, IMG.push),
        ex('Frog Stand', 4, 15, IMG.balance),
        ex('Wrist Push Up', 3, 12, IMG.pushup),
      ]),
      step('Tuck Planche', IMG.staticCore, [
        ex('Tuck Planche Hold', 5, 10, IMG.staticCore),
        ex('Planche Lean Push Up', 4, 6, IMG.push),
        ex('Band Assisted Tuck Planche', 4, 8, IMG.staticCore),
        ex('Hollow Body Hold', 3, 25, IMG.staticCore),
      ]),
      step('Advanced Tuck Planche', IMG.staticCore, [
        ex('Advanced Tuck Planche Hold', 5, 8, IMG.staticCore),
        ex('Tuck Planche Push Up', 4, 4, IMG.push),
        ex('Planche Lean', 4, 25, IMG.staticCore),
        ex('Parallette L Sit', 4, 15, IMG.vsit),
      ]),
      step('Straddle Planche', IMG.staticCore, [
        ex('Straddle Planche Hold', 5, 6, IMG.staticCore),
        ex('Band Assisted Straddle Planche', 4, 8, IMG.staticCore),
        ex('Pseudo Push Up (Feet Elevated)', 4, 8, IMG.push),
        ex('Planche Lean to Tuck', 3, 6, IMG.staticCore),
      ]),
      step('Full Planche', IMG.staticCore, [
        ex('Full Planche Hold Attempt', 6, 4, IMG.staticCore),
        ex('Straddle Planche Hold', 5, 6, IMG.staticCore),
        ex('Planche Negative', 4, 3, IMG.staticCore),
        ex('Weighted Dip', 4, 5, IMG.push),
      ]),
    ],
  },
  {
    skill: 'Handstand Push Up',
    image: IMG.handstand,
    progressions: [
      step('Pike Push Up', IMG.handstand, [
        ex('Pike Push Up', 4, 10, IMG.handstand),
        ex('Wall Walk', 4, 4, IMG.handstand),
        ex('Downward Dog Shoulder Tap', 3, 12, IMG.handstand),
        ex('Plank', 3, 40, IMG.staticCore),
      ]),
      step('Elevated Pike Push Up', IMG.handstand, [
        ex('Elevated Pike Push Up', 5, 8, IMG.handstand),
        ex('Deficit Pike Push Up', 4, 6, IMG.handstand),
        ex('Wall Handstand Hold', 4, 30, IMG.handstand),
        ex('Dumbbell Shoulder Press', 3, 10, IMG.handstand),
      ]),
      step('Wall HSPU Negative', IMG.handstand, [
        ex('Wall Handstand Push Up Negative', 5, 4, IMG.handstand),
        ex('Partial ROM Wall HSPU', 4, 5, IMG.handstand),
        ex('Box Pike Push Up', 4, 8, IMG.handstand),
        ex('Hollow Body Hold', 3, 30, IMG.staticCore),
      ]),
      step('Wall HSPU', IMG.handstand, [
        ex('Wall Handstand Push Up', 5, 5, IMG.handstand),
        ex('Deficit Wall HSPU', 4, 3, IMG.handstand),
        ex('Strict Pike Push Up', 4, 10, IMG.handstand),
        ex('Wall Shoulder Tap', 3, 12, IMG.handstand),
      ]),
      step('Strict HSPU', IMG.handstand, [
        ex('Freestanding HSPU Negative', 5, 2, IMG.handstand),
        ex('Strict Wall HSPU', 5, 6, IMG.handstand),
        ex('Deficit Pike Push Up', 4, 8, IMG.handstand),
        ex('Handstand Hold', 4, 25, IMG.handstand),
      ]),
    ],
  },
  {
    skill: 'Human Flag',
    image: IMG.balance,
    progressions: [
      step('Vertical Flag', IMG.balance, [
        ex('Vertical Flag Hold', 4, 15, IMG.balance),
        ex('Side Plank', 4, 25, IMG.staticCore),
        ex('Hanging Oblique Raise', 3, 10, IMG.pull),
        ex('Towel Row', 3, 12, IMG.pull),
      ]),
      step('Tuck Human Flag', IMG.balance, [
        ex('Tuck Human Flag Hold', 5, 10, IMG.balance),
        ex('Pole Side Pull', 4, 8, IMG.pull),
        ex('One Arm Push Away Drill', 4, 10, IMG.push),
        ex('Hollow Side Hold', 3, 20, IMG.staticCore),
      ]),
      step('Straddle Human Flag', IMG.balance, [
        ex('Straddle Human Flag Hold', 5, 8, IMG.balance),
        ex('Human Flag Negative (Straddle)', 4, 4, IMG.balance),
        ex('Windshield Wiper', 4, 8, IMG.staticCore),
        ex('Straight Arm Lat Pulldown', 3, 12, IMG.pull),
      ]),
      step('Human Flag Negative', IMG.balance, [
        ex('Human Flag Negative', 5, 4, IMG.balance),
        ex('Assisted Human Flag Hold', 4, 10, IMG.balance),
        ex('Weighted Side Plank', 3, 20, IMG.staticCore),
        ex('Explosive Pull Up', 4, 4, IMG.pullExplosive),
      ]),
      step('Full Human Flag', IMG.balance, [
        ex('Full Human Flag Hold', 6, 5, IMG.balance),
        ex('Human Flag Kick Up', 5, 3, IMG.balance),
        ex('Flag Press Drill', 4, 5, IMG.balance),
        ex('Oblique Knee Raise', 4, 12, IMG.staticCore),
      ]),
    ],
  },
  {
    skill: 'Pistol Squat',
    image: IMG.legs,
    progressions: [
      step('Assisted Pistol Squat', IMG.legs, [
        ex('TRX Assisted Pistol Squat', 4, 8, IMG.legs),
        ex('Deep Squat Hold', 4, 30, IMG.legs),
        ex('Bulgarian Split Squat', 4, 10, IMG.legs),
        ex('Calf Raise', 3, 20, IMG.legs),
      ]),
      step('Box Pistol Squat', IMG.legs, [
        ex('Box Pistol Squat', 5, 6, IMG.legs),
        ex('Slow Eccentric Squat', 4, 8, IMG.legs),
        ex('Step Down', 4, 10, IMG.legs),
        ex('Hip Flexor Raise', 3, 12, IMG.staticCore),
      ]),
      step('Counterbalance Pistol Squat', IMG.legs, [
        ex('Counterbalance Pistol Squat', 5, 6, IMG.legs),
        ex('Pistol Squat Negative', 4, 5, IMG.legs),
        ex('Cossack Squat', 4, 8, IMG.legs),
        ex('Single Leg Glute Bridge', 4, 12, IMG.legs),
      ]),
      step('Full Pistol Squat', IMG.legs, [
        ex('Full Pistol Squat', 6, 4, IMG.legs),
        ex('Paused Pistol Squat', 4, 4, IMG.legs),
        ex('Jump Squat', 3, 10, IMG.legs),
        ex('Ankle Mobility Drill', 3, 20, IMG.legs),
      ]),
      step('Tempo Pistol Squat', IMG.legs, [
        ex('Tempo Pistol Squat (5-1-1)', 5, 4, IMG.legs),
        ex('Weighted Pistol Squat', 4, 3, IMG.legs),
        ex('Bulgarian Split Squat', 4, 8, IMG.legs),
        ex('Nordic Curl', 3, 6, IMG.legs),
      ]),
    ],
  },
  {
    skill: 'Back Lever',
    image: IMG.bar,
    progressions: [
      step('Skin the Cat', IMG.bar, [
        ex('Skin the Cat', 4, 5, IMG.bar),
        ex('German Hang Hold', 4, 20, IMG.bar),
        ex('Scap Pull Up', 4, 8, IMG.pull),
        ex('Hollow Body Hold', 3, 25, IMG.staticCore),
      ]),
      step('Tuck Back Lever', IMG.bar, [
        ex('Tuck Back Lever Hold', 5, 10, IMG.bar),
        ex('Back Lever Negative (Tuck)', 4, 4, IMG.bar),
        ex('Ring Support Hold', 4, 20, IMG.push),
        ex('Reverse Plank', 3, 25, IMG.staticCore),
      ]),
      step('Advanced Tuck Back Lever', IMG.bar, [
        ex('Advanced Tuck Back Lever Hold', 5, 8, IMG.bar),
        ex('Back Lever Raises (Tuck)', 4, 5, IMG.bar),
        ex('Straight Bar Dip', 4, 8, IMG.push),
        ex('Arch Hold', 3, 25, IMG.staticCore),
      ]),
      step('Straddle Back Lever', IMG.bar, [
        ex('Straddle Back Lever Hold', 5, 6, IMG.bar),
        ex('Band Assisted Back Lever', 4, 8, IMG.bar),
        ex('Weighted Pull Up', 4, 4, IMG.pullExplosive),
        ex('Shoulder Extension Mobility', 3, 20, IMG.staticCore),
      ]),
      step('Full Back Lever', IMG.bar, [
        ex('Full Back Lever Hold', 6, 5, IMG.bar),
        ex('Back Lever Negative', 5, 3, IMG.bar),
        ex('Back Lever Pull Through', 4, 4, IMG.bar),
        ex('Ring Dip', 4, 6, IMG.push),
      ]),
    ],
  },
  {
    skill: 'Dragon Flag',
    image: IMG.staticCore,
    progressions: [
      step('Reverse Crunch', IMG.staticCore, [
        ex('Reverse Crunch', 4, 15, IMG.staticCore),
        ex('Hollow Body Hold', 4, 25, IMG.staticCore),
        ex('Leg Raise', 4, 10, IMG.staticCore),
        ex('Plank', 3, 45, IMG.staticCore),
      ]),
      step('Dragon Flag Negative', IMG.staticCore, [
        ex('Dragon Flag Negative', 5, 5, IMG.staticCore),
        ex('Bench Leg Raise', 4, 12, IMG.staticCore),
        ex('Hollow Rock', 4, 12, IMG.staticCore),
        ex('Dead Bug', 3, 16, IMG.staticCore),
      ]),
      step('Tuck Dragon Flag', IMG.staticCore, [
        ex('Tuck Dragon Flag', 5, 6, IMG.staticCore),
        ex('Dragon Flag Negative', 4, 5, IMG.staticCore),
        ex('Toes to Bar', 4, 8, IMG.pull),
        ex('V Up', 3, 12, IMG.vsit),
      ]),
      step('Straddle Dragon Flag', IMG.staticCore, [
        ex('Straddle Dragon Flag', 5, 5, IMG.staticCore),
        ex('Hip Lift to Candlestick', 4, 8, IMG.staticCore),
        ex('Hanging Leg Raise', 4, 10, IMG.pull),
        ex('Side Plank', 3, 30, IMG.staticCore),
      ]),
      step('Full Dragon Flag', IMG.staticCore, [
        ex('Full Dragon Flag', 6, 4, IMG.staticCore),
        ex('Dragon Flag Eccentric + Pause', 4, 4, IMG.staticCore),
        ex('Weighted Reverse Crunch', 4, 10, IMG.staticCore),
        ex('L Sit Hold', 4, 15, IMG.vsit),
      ]),
    ],
  },
  {
    skill: 'V Sit',
    image: IMG.vsit,
    progressions: [
      step('L Sit', IMG.vsit, [
        ex('L Sit Hold', 4, 15, IMG.vsit),
        ex('Tuck Sit Hold', 4, 20, IMG.vsit),
        ex('Compression Lift', 4, 10, IMG.vsit),
        ex('Pike Stretch', 3, 30, IMG.vsit),
      ]),
      step('L Sit Leg Lift', IMG.vsit, [
        ex('L Sit Leg Lift', 5, 8, IMG.vsit),
        ex('Seated Pike Leg Lift', 4, 12, IMG.vsit),
        ex('Parallette Knee Raise', 4, 10, IMG.vsit),
        ex('Hollow Body Hold', 3, 30, IMG.staticCore),
      ]),
      step('Tuck V Sit', IMG.vsit, [
        ex('Tuck V Sit Hold', 5, 10, IMG.vsit),
        ex('L Sit to Tuck V Sit', 4, 6, IMG.vsit),
        ex('Compression Pulse', 4, 12, IMG.vsit),
        ex('Hip Flexor Raise', 3, 12, IMG.vsit),
      ]),
      step('Straddle V Sit', IMG.vsit, [
        ex('Straddle V Sit Hold', 5, 8, IMG.vsit),
        ex('Straddle Compression Lift', 4, 10, IMG.vsit),
        ex('Pike Press Drill', 4, 6, IMG.vsit),
        ex('V Up', 3, 15, IMG.vsit),
      ]),
      step('Full V Sit', IMG.vsit, [
        ex('Full V Sit Hold', 6, 6, IMG.vsit),
        ex('L Sit to V Sit Press', 4, 5, IMG.vsit),
        ex('Weighted Compression Lift', 4, 8, IMG.vsit),
        ex('Long Lever Hollow Hold', 3, 25, IMG.staticCore),
      ]),
    ],
  },
  {
    skill: 'Handstand',
    image: IMG.handstand,
    progressions: [
      step('Wall Handstand Hold', IMG.handstand, [
        ex('Wall Handstand Hold', 4, 30, IMG.handstand),
        ex('Wall Walk', 4, 4, IMG.handstand),
        ex('Pike Push Up', 4, 8, IMG.handstand),
        ex('Wrist Prep Drill', 3, 20, IMG.handstand),
      ]),
      step('Wall Shoulder Tap', IMG.handstand, [
        ex('Wall Shoulder Tap', 5, 10, IMG.handstand),
        ex('Wall Handstand Hold', 4, 35, IMG.handstand),
        ex('Box Handstand Shift', 4, 12, IMG.handstand),
        ex('Plank Shoulder Tap', 3, 20, IMG.staticCore),
      ]),
      step('Freestanding Kick Up', IMG.handstand, [
        ex('Kick Up Drill', 6, 5, IMG.handstand),
        ex('Chest to Wall Handstand Hold', 4, 30, IMG.handstand),
        ex('Handstand Line Drill', 4, 20, IMG.handstand),
        ex('Pike Compression', 3, 12, IMG.vsit),
      ]),
      step('Freestanding Hold', IMG.handstand, [
        ex('Freestanding Handstand Hold', 6, 10, IMG.handstand),
        ex('Kick Up + Hold', 5, 4, IMG.handstand),
        ex('Wall Toe Pull', 4, 8, IMG.handstand),
        ex('Handstand Shoulder Shrug', 4, 10, IMG.handstand),
      ]),
      step('Handstand Walk', IMG.handstand, [
        ex('Handstand Walk Drill', 6, 8, IMG.handstand),
        ex('Freestanding Hold', 5, 15, IMG.handstand),
        ex('Box Shoulder Taps', 4, 12, IMG.handstand),
        ex('Wall Handstand Push Up Negative', 4, 4, IMG.handstand),
      ]),
    ],
  },
];

export const skillPrograms: SkillProgram[] = rawPrograms.map((entry) => ({
  ...entry,
  slug: toSkillSlug(entry.skill),
  video: resolveVideo(entry.image),
}));
