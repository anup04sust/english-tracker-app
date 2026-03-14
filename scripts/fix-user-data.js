// Script to fix user data: update target languages format and re-extract CV
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const ProfileSchema = new mongoose.Schema({}, { strict: false });
const Profile = mongoose.model('Profile', ProfileSchema);

async function fixUserData() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://db:27017/english_tracker';
    console.log('Connecting to:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    const userId = 'upm.01.wpo@gmail.com';
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      console.log('No profile found for user:', userId);
      return;
    }

    console.log('=== Current Profile ===');
    console.log('Target Languages (old):', profile.targetLanguages);
    console.log('CV Text:', profile.cvText?.substring(0, 100) + '...\n');

    let updated = false;

    // Fix 1: Update target languages format
    if (profile.targetLanguages && Array.isArray(profile.targetLanguages)) {
      const needsUpdate = profile.targetLanguages.some(item => typeof item === 'string');
      
      if (needsUpdate) {
        profile.targetLanguages = profile.targetLanguages.map(item => {
          if (typeof item === 'string') {
            return { code: item, proficiency: 'intermediate' }; // Based on user's currentLevel
          }
          return item;
        });
        console.log('✓ Updated target languages to new format');
        updated = true;
      }
    }

    // Fix 2: Re-extract CV text if extraction failed
    if (profile.cvText?.includes('Text extraction failed') || profile.cvText?.includes('pdfParse is not a function')) {
      if (profile.cvUrl) {
        const cvPath = path.join(process.cwd(), 'public', profile.cvUrl);
        
        if (fs.existsSync(cvPath)) {
          console.log('✓ CV file found, re-extracting text...');
          
          try {
            const buffer = fs.readFileSync(cvPath);
            const pdfParse = require('pdf-parse');
            const data = await pdfParse(buffer);
            
            if (data.text && data.text.length > 0) {
              profile.cvText = data.text.length > 10000 
                ? data.text.substring(0, 10000) + '...\n[Text truncated for storage]'
                : data.text;
              
              console.log('✓ CV text extracted successfully');
              console.log(`  Text length: ${profile.cvText.length} characters`);
              console.log(`  Preview: ${profile.cvText.substring(0, 200)}...\n`);
              updated = true;
            } else {
              console.log('✗ No text extracted from PDF');
            }
          } catch (error) {
            console.error('✗ CV re-extraction failed:', error.message);
          }
        } else {
          console.log('✗ CV file not found at:', cvPath);
        }
      }
    }

    if (updated) {
      await profile.save();
      console.log('\n=== Updated Profile ===');
      console.log('Target Languages (new):', JSON.stringify(profile.targetLanguages, null, 2));
      console.log('CV Text length:', profile.cvText?.length);
      console.log('\n✓ Profile updated successfully');
    } else {
      console.log('\n✓ No updates needed');
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixUserData();
