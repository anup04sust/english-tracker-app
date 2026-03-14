import mongoose, { Schema, Model } from 'mongoose';

export interface IMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  createdBy: 'ai' | 'user';
}

export interface ITargetLanguage {
  code: string;
  proficiency: string; // absolute-beginner, beginner, elementary, intermediate, upper-intermediate, advanced
}

export interface IProfile {
  userId: string; // Email from NextAuth
  nativeLanguage: string; // User's native language
  targetLanguages: ITargetLanguage[] | string[]; // Languages they want to learn with proficiency levels
  
  // AI Configuration
  aiApiKey?: string; // User's personal OpenAI/Anthropic API key
  aiProvider?: 'openai' | 'anthropic' | 'custom';
  aiModel?: string;
  
  // CV/Resume
  cvUrl?: string; // Uploaded CV file URL
  cvText?: string; // Extracted text from CV
  cvUploadedAt?: Date;
  
  // Profile Information
  profession?: string;
  industry?: string;
  learningGoals?: string | string[]; // Support both string and array formats
  currentLevel?: string; // beginner, intermediate, advanced
  
  // Personalized Milestones
  milestones: IMilestone[];
  
  // Onboarding Status
  onboardingCompleted: boolean;
  onboardingStep: number; // Track which step they're on
  
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetDate: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdBy: { type: String, enum: ['ai', 'user'], required: true },
});

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    nativeLanguage: { type: String, default: '' },
    // Support both old format (string[]) and new format (object[])
    targetLanguages: { type: Schema.Types.Mixed, default: [] },
    
    aiApiKey: { type: String, default: '' },
    aiProvider: { type: String, enum: ['openai', 'anthropic', 'custom'], default: 'openai' },
    aiModel: { type: String, default: 'gpt-4o-mini' },
    
    cvUrl: { type: String, default: '' },
    cvText: { type: String, default: '' },
    cvUploadedAt: { type: Date },
    
    profession: { type: String, default: '' },
    industry: { type: String, default: '' },
    learningGoals: { type: Schema.Types.Mixed, default: [] }, // Support both string and array
    currentLevel: { type: String, default: 'beginner' },
    
    milestones: { type: [MilestoneSchema], default: [] },
    
    onboardingCompleted: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ProfileModel: Model<IProfile> =
  mongoose.models?.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default ProfileModel;
