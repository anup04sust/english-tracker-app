export interface LearningGoal {
  value: string;
  label: string;
  description: string;
  icon?: string;
}

export const LEARNING_GOALS: LearningGoal[] = [
  {
    value: 'career-advancement',
    label: 'Career Advancement',
    description: 'Improve professional opportunities and job prospects',
    icon: '📈',
  },
  {
    value: 'business-communication',
    label: 'Business Communication',
    description: 'Communicate effectively with international clients and colleagues',
    icon: '💼',
  },
  {
    value: 'travel',
    label: 'Travel & Tourism',
    description: 'Navigate and enjoy traveling in foreign countries',
    icon: '✈️',
  },
  {
    value: 'relocation',
    label: 'Relocation',
    description: 'Prepare for moving to a new country',
    icon: '🏡',
  },
  {
    value: 'academic',
    label: 'Academic Studies',
    description: 'Study at a foreign university or institution',
    icon: '🎓',
  },
  {
    value: 'family-friends',
    label: 'Family & Friends',
    description: 'Connect with family, friends, or partner in their language',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    value: 'cultural-interest',
    label: 'Cultural Interest',
    description: 'Explore and understand different cultures',
    icon: '🌍',
  },
  {
    value: 'entertainment',
    label: 'Entertainment',
    description: 'Enjoy movies, books, music, and games in original language',
    icon: '🎬',
  },
  {
    value: 'personal-growth',
    label: 'Personal Growth',
    description: 'Challenge yourself and develop new skills',
    icon: '🌱',
  },
  {
    value: 'exam-preparation',
    label: 'Exam Preparation',
    description: 'Prepare for language proficiency tests (TOEFL, IELTS, etc.)',
    icon: '📝',
  },
  {
    value: 'volunteer-work',
    label: 'Volunteer Work',
    description: 'Communicate while volunteering abroad or with communities',
    icon: '🤝',
  },
  {
    value: 'retirement',
    label: 'Retirement Activity',
    description: 'Stay mentally active and engaged during retirement',
    icon: '🌅',
  },
  {
    value: 'hobby',
    label: 'Hobby & Fun',
    description: 'Learn for enjoyment and personal satisfaction',
    icon: '🎯',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Custom learning goal',
    icon: '📋',
  },
];

export function getLearningGoal(value: string): LearningGoal | undefined {
  return LEARNING_GOALS.find(goal => goal.value === value);
}

export function getLearningGoalLabel(value: string): string {
  const goal = getLearningGoal(value);
  return goal ? goal.label : value;
}
