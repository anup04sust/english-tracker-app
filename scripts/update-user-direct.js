// Direct MongoDB update script
const mongoose = require('mongoose');

async function updateUser() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://db:27017/english_tracker';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    const userId = 'upm.01.wpo@gmail.com';
    
    // Update using MongoDB native operations
    const result = await mongoose.connection.db.collection('profiles').updateOne(
      { userId: userId },
      { 
        $set: { 
          targetLanguages: [
            { code: 'en', proficiency: 'intermediate' }
          ]
        } 
      }
    );

    console.log('Update result:', result);
    
    // Fetch and display updated data
    const updated = await mongoose.connection.db.collection('profiles').findOne({ userId: userId });
    console.log('\n=== Updated Profile ===');
    console.log('Target Languages:', JSON.stringify(updated.targetLanguages, null, 2));

    await mongoose.disconnect();
    console.log('\n✓ Done');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateUser();
