// Quick script to check user data in MongoDB
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({}, { strict: false });
const Profile = mongoose.model('Profile', ProfileSchema);

async function checkUser() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://db:27017/english_tracker';
    console.log('Connecting to:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    const userId = 'upm.01.wpo@gmail.com';
    const profile = await Profile.findOne({ userId });

    if (profile) {
      console.log('=== User Profile Found ===\n');
      console.log(JSON.stringify(profile.toObject(), null, 2));
    } else {
      console.log('No profile found for user:', userId);
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUser();
