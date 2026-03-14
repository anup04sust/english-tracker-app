import mongoose, { Schema, Model } from 'mongoose';

// Audio Entry Schema
export interface IAudioEntry {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  source: 'recorded' | 'uploaded';
  size: number;
}

const AudioEntrySchema = new Schema<IAudioEntry>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: String, required: true },
  source: { type: String, enum: ['recorded', 'uploaded'], required: true },
  size: { type: Number, required: true },
});

// Day Progress Schema
export interface IDayProgress {
  completed: boolean;
  confidence: number;
  notes: string;
  transcript: string;
  aiFeedback: string;
  vocabulary: string;
  audioEntries: IAudioEntry[];
}

const DayProgressSchema = new Schema<IDayProgress>({
  completed: { type: Boolean, default: false },
  confidence: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  transcript: { type: String, default: '' },
  aiFeedback: { type: String, default: '' },
  vocabulary: { type: String, default: '' },
  audioEntries: { type: [AudioEntrySchema], default: [] },
});

// Tracker State Schema
export interface ITrackerState {
  userId: string; // For multi-user support in the future
  selectedDay: number;
  selectedLanguage: string; // Language selection (en, es, de, ru, zh, ja, etc.)
  days: Record<number, IDayProgress>; // Changed from Map to Record
  createdAt: Date;
  updatedAt: Date;
}

const TrackerStateSchema = new Schema<ITrackerState>(
  {
    userId: { type: String, required: true, unique: true, default: 'default-user' },
    selectedDay: { type: Number, default: 1 },
    selectedLanguage: { type: String, default: 'en' },
    days: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries by user and language
TrackerStateSchema.index({ userId: 1, selectedLanguage: 1 });

// Prevent model recompilation in development
const TrackerModel: Model<ITrackerState> =
  mongoose.models?.Tracker || mongoose.model<ITrackerState>('Tracker', TrackerStateSchema);

export default TrackerModel;
