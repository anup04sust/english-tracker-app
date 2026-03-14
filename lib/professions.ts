export interface Profession {
  value: string;
  label: string;
  category: string;
}

export const PROFESSIONS: Profession[] = [
  // Technology & IT
  { value: 'software-engineer', label: 'Software Engineer', category: 'Technology' },
  { value: 'web-developer', label: 'Web Developer', category: 'Technology' },
  { value: 'data-scientist', label: 'Data Scientist', category: 'Technology' },
  { value: 'it-specialist', label: 'IT Specialist', category: 'Technology' },
  { value: 'ux-ui-designer', label: 'UX/UI Designer', category: 'Technology' },
  { value: 'product-manager', label: 'Product Manager', category: 'Technology' },
  { value: 'devops-engineer', label: 'DevOps Engineer', category: 'Technology' },
  
  // Healthcare
  { value: 'doctor', label: 'Doctor', category: 'Healthcare' },
  { value: 'nurse', label: 'Nurse', category: 'Healthcare' },
  { value: 'pharmacist', label: 'Pharmacist', category: 'Healthcare' },
  { value: 'therapist', label: 'Therapist', category: 'Healthcare' },
  { value: 'dentist', label: 'Dentist', category: 'Healthcare' },
  
  // Education
  { value: 'teacher', label: 'Teacher', category: 'Education' },
  { value: 'professor', label: 'Professor', category: 'Education' },
  { value: 'researcher', label: 'Researcher', category: 'Education' },
  { value: 'tutor', label: 'Tutor', category: 'Education' },
  
  // Business & Finance
  { value: 'accountant', label: 'Accountant', category: 'Business' },
  { value: 'financial-analyst', label: 'Financial Analyst', category: 'Business' },
  { value: 'business-analyst', label: 'Business Analyst', category: 'Business' },
  { value: 'consultant', label: 'Consultant', category: 'Business' },
  { value: 'banker', label: 'Banker', category: 'Business' },
  { value: 'entrepreneur', label: 'Entrepreneur', category: 'Business' },
  
  // Marketing & Sales
  { value: 'marketing-manager', label: 'Marketing Manager', category: 'Marketing' },
  { value: 'sales-representative', label: 'Sales Representative', category: 'Marketing' },
  { value: 'content-creator', label: 'Content Creator', category: 'Marketing' },
  { value: 'social-media-manager', label: 'Social Media Manager', category: 'Marketing' },
  
  // Legal
  { value: 'lawyer', label: 'Lawyer', category: 'Legal' },
  { value: 'paralegal', label: 'Paralegal', category: 'Legal' },
  
  // Engineering
  { value: 'mechanical-engineer', label: 'Mechanical Engineer', category: 'Engineering' },
  { value: 'civil-engineer', label: 'Civil Engineer', category: 'Engineering' },
  { value: 'electrical-engineer', label: 'Electrical Engineer', category: 'Engineering' },
  
  // Creative & Arts
  { value: 'graphic-designer', label: 'Graphic Designer', category: 'Creative' },
  { value: 'writer', label: 'Writer', category: 'Creative' },
  { value: 'photographer', label: 'Photographer', category: 'Creative' },
  { value: 'artist', label: 'Artist', category: 'Creative' },
  
  // Hospitality & Service
  { value: 'chef', label: 'Chef', category: 'Hospitality' },
  { value: 'hotel-manager', label: 'Hotel Manager', category: 'Hospitality' },
  { value: 'customer-service', label: 'Customer Service', category: 'Service' },
  
  // Other
  { value: 'student', label: 'Student', category: 'Other' },
  { value: 'freelancer', label: 'Freelancer', category: 'Other' },
  { value: 'retired', label: 'Retired', category: 'Other' },
  { value: 'other', label: 'Other', category: 'Other' },
];

export function getProfession(value: string): Profession | undefined {
  return PROFESSIONS.find(prof => prof.value === value);
}

export function getProfessionLabel(value: string): string {
  const profession = getProfession(value);
  return profession ? profession.label : value;
}

export function getProfessionsByCategory(category: string): Profession[] {
  return PROFESSIONS.filter(prof => prof.category === category);
}

export const PROFESSION_CATEGORIES = [
  'Technology',
  'Healthcare',
  'Education',
  'Business',
  'Marketing',
  'Legal',
  'Engineering',
  'Creative',
  'Hospitality',
  'Service',
  'Other',
];
