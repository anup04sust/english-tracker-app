export interface Industry {
  value: string;
  label: string;
  icon?: string;
}

export const INDUSTRIES: Industry[] = [
  { value: 'technology', label: 'Technology & IT', icon: '💻' },
  { value: 'healthcare', label: 'Healthcare & Medicine', icon: '🏥' },
  { value: 'education', label: 'Education & Training', icon: '🎓' },
  { value: 'finance', label: 'Finance & Banking', icon: '💰' },
  { value: 'consulting', label: 'Consulting & Professional Services', icon: '💼' },
  { value: 'retail', label: 'Retail & E-commerce', icon: '🛍️' },
  { value: 'manufacturing', label: 'Manufacturing & Production', icon: '🏭' },
  { value: 'marketing', label: 'Marketing & Advertising', icon: '📢' },
  { value: 'media', label: 'Media & Entertainment', icon: '🎬' },
  { value: 'hospitality', label: 'Hospitality & Tourism', icon: '🏨' },
  { value: 'construction', label: 'Construction & Real Estate', icon: '🏗️' },
  { value: 'transportation', label: 'Transportation & Logistics', icon: '🚚' },
  { value: 'energy', label: 'Energy & Utilities', icon: '⚡' },
  { value: 'telecommunications', label: 'Telecommunications', icon: '📱' },
  { value: 'automotive', label: 'Automotive', icon: '🚗' },
  { value: 'aerospace', label: 'Aerospace & Defense', icon: '✈️' },
  { value: 'agriculture', label: 'Agriculture & Food', icon: '🌾' },
  { value: 'pharmaceutical', label: 'Pharmaceutical & Biotechnology', icon: '💊' },
  { value: 'legal', label: 'Legal Services', icon: '⚖️' },
  { value: 'government', label: 'Government & Public Sector', icon: '🏛️' },
  { value: 'nonprofit', label: 'Non-Profit & NGO', icon: '🤝' },
  { value: 'research', label: 'Research & Development', icon: '🔬' },
  { value: 'arts', label: 'Arts & Design', icon: '🎨' },
  { value: 'sports', label: 'Sports & Recreation', icon: '⚽' },
  { value: 'other', label: 'Other', icon: '📋' },
];

export function getIndustry(value: string): Industry | undefined {
  return INDUSTRIES.find(ind => ind.value === value);
}

export function getIndustryLabel(value: string): string {
  const industry = getIndustry(value);
  return industry ? industry.label : value;
}
