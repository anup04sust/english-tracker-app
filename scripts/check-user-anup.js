const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://db:27017/language-tracker';

const ProfileSchema = new mongoose.Schema({
  userId: String,
  nativeLanguage: String,
  targetLanguages: mongoose.Schema.Types.Mixed,
  aiApiKey: String,
  aiProvider: String,
  aiModel: String,
  cvUrl: String,
  cvText: String,
  cvUploadedAt: Date,
  profession: String,
  industry: String,
  learningGoals: mongoose.Schema.Types.Mixed,
  currentLevel: String,
  milestones: Array,
  onboardingCompleted: Boolean,
  onboardingStep: Number,
}, { timestamps: true });

const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

async function checkUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const userId = 'anup.biswas@miaki.com.bd';
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      console.log(`\n❌ No profile found for user: ${userId}\n`);
      return;
    }

    console.log('\n✅ User Profile Found:\n');
    console.log('User ID:', profile.userId);
    console.log('Native Language:', profile.nativeLanguage);
    console.log('\nTarget Languages:');
    console.log('  Type:', typeof profile.targetLanguages);
    console.log('  Is Array:', Array.isArray(profile.targetLanguages));
    console.log('  Value:', JSON.stringify(profile.targetLanguages, null, 2));
    
    console.log('\nLearning Goals:');
    console.log('  Type:', typeof profile.learningGoals);
    console.log('  Is Array:', Array.isArray(profile.learningGoals));
    console.log('  Value:', JSON.stringify(profile.learningGoals, null, 2));
    
    console.log('\nProfile Information:');
    console.log('  Profession:', profile.profession);
    console.log('  Industry:', profile.industry);
    console.log('  Current Level:', profile.currentLevel);
    
    console.log('\nOnboarding Status:');
    console.log('  Completed:', profile.onboardingCompleted);
    console.log('  Step:', profile.onboardingStep);
    
    console.log('\nAI Configuration:');
    console.log('  Provider:', profile.aiProvider);
    console.log('  Has API Key:', profile.aiApiKey ? 'Yes' : 'No');
    
    console.log('\nCV Information:');
    console.log('  CV Uploaded:', profile.cvUrl ? 'Yes' : 'No');
    console.log('  CV URL:', profile.cvUrl || 'N/A');
    console.log('  CV Text Length:', profile.cvText ? profile.cvText.length : 0);
    
    console.log('\nMilestones:', profile.milestones?.length || 0);
    
    console.log('\nTimestamps:');
    console.log('  Created:', profile.createdAt);
    console.log('  Updated:', profile.updatedAt);
    
    console.log('\n=== Raw Document ===');
    console.log(JSON.stringify(profile.toObject(), null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

checkUser();
