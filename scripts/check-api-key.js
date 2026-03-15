const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  nativeLanguage: { type: String, default: 'bn' },
  targetLanguages: { type: mongoose.Schema.Types.Mixed, default: ['en'] },
  currentLevel: { type: String },
  profession: { type: String },
  industry: { type: String },
  learningGoals: { type: mongoose.Schema.Types.Mixed, default: [] },
  cvText: { type: String },
  milestones: { type: Array, default: [] },
  onboardingCompleted: { type: Boolean, default: false },
  aiApiKey: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'profiles' });

async function checkUser() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/english-tracker';
    console.log('Connecting to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    const Profile = mongoose.model('Profile', ProfileSchema);
    const userId = 'upm.01.wpo@gmail.com';

    console.log(`Checking user: ${userId}\n`);
    
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      console.log('❌ User not found');
      return;
    }

    console.log('✓ User found!');
    console.log('\n=== User Profile ===');
    console.log('User ID:', profile.userId);
    console.log('Email:', profile.email);
    console.log('Name:', profile.name);
    console.log('Native Language:', profile.nativeLanguage);
    console.log('Target Languages:', JSON.stringify(profile.targetLanguages, null, 2));
    console.log('Profession:', profile.profession);
    console.log('Industry:', profile.industry);
    console.log('Learning Goals:', JSON.stringify(profile.learningGoals, null, 2));
    console.log('Onboarding Completed:', profile.onboardingCompleted);
    console.log('Milestones:', profile.milestones?.length || 0, 'total');
    console.log('\n=== AI API Key Status ===');
    
    if (profile.aiApiKey) {
      const keyLength = profile.aiApiKey.length;
      const maskedKey = profile.aiApiKey.substring(0, 7) + '...' + profile.aiApiKey.substring(keyLength - 4);
      console.log('API Key:', maskedKey);
      console.log('Key Length:', keyLength, 'characters');
      console.log('Status: ✓ API Key is configured');
      
      // Test the API key
      console.log('\n=== Testing API Connection ===');
      const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
      const model = process.env.AI_MODEL || 'gpt-4o-mini';
      
      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${profile.aiApiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 5,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✓ API Connection successful!');
          console.log('Model:', model);
          console.log('Response:', data.choices[0]?.message?.content || 'OK');
        } else {
          const errorData = await response.json();
          console.log('❌ API Connection failed');
          console.log('Status:', response.status);
          console.log('Error:', errorData.error?.message || 'Unknown error');
        }
      } catch (error) {
        console.log('❌ API Connection error:', error.message);
      }
    } else {
      console.log('Status: ❌ No API Key configured');
      console.log('\nThe user needs to configure their AI API key in Settings.');
    }

    console.log('\n=== Additional Info ===');
    console.log('Profile Created:', profile.createdAt);
    console.log('Last Updated:', profile.updatedAt);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

checkUser();
