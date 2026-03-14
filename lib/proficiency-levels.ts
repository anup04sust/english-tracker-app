export interface ProficiencyLevel {
  value: string;
  label: string;
  description: string;
}

export const PROFICIENCY_LEVELS: ProficiencyLevel[] = [
  { value: 'absolute-beginner', label: 'Absolute Beginner', description: 'No knowledge' },
  { value: 'beginner', label: 'Beginner', description: 'Basic words & phrases' },
  { value: 'elementary', label: 'Elementary', description: 'Simple conversations' },
  { value: 'intermediate', label: 'Intermediate', description: 'Daily conversations' },
  { value: 'upper-intermediate', label: 'Upper Intermediate', description: 'Complex topics' },
  { value: 'advanced', label: 'Advanced', description: 'Fluent speaker' },
];

export function getProficiencyLevel(value: string): ProficiencyLevel | undefined {
  return PROFICIENCY_LEVELS.find(level => level.value === value);
}

export function getProficiencyLabel(value: string): string {
  const level = getProficiencyLevel(value);
  return level ? level.label : value;
}
