const mongoose = require('mongoose');
const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://db:27017/language-tracker';

const ProfileSchema = new mongoose.Schema({
  userId: String,
  cvUrl: String,
  cvText: String,
  cvUploadedAt: Date,
}, { timestamps: true, strict: false });

const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

async function reExtractCvText() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const userId = 'anup.biswas@miaki.com.bd';
    const profile = await Profile.findOne({ userId });

    if (!profile || !profile.cvUrl) {
      console.log('❌ No CV found for user');
      return;
    }

    console.log('Found profile with CV:', profile.cvUrl);
    
    // Read the CV file
    const cvPath = path.join(process.cwd(), 'public', profile.cvUrl);
    
    if (!fs.existsSync(cvPath)) {
      console.log('❌ CV file not found at:', cvPath);
      return;
    }

    console.log('Reading PDF file:', cvPath);
    const buffer = fs.readFileSync(cvPath);
    console.log('File size:', buffer.length, 'bytes');
    
    // Extract text using pdf-parse v2
    console.log('\nExtracting text with pdf-parse v2 API...');
    const uint8Array = new Uint8Array(buffer);
    const parser = new PDFParse({ data: uint8Array });
    const result = await parser.getText();
    
    console.log('✅ Text extraction successful!');
    console.log('Extracted text length:', result.text.length, 'characters');
    
    // Truncate if too long
    const truncatedText = result.text.length > 10000 
      ? result.text.substring(0, 10000) + '...\n[Text truncated for storage]'
      : result.text;
    
    // Update database
    console.log('\nUpdating database...');
    await Profile.findOneAndUpdate(
      { userId },
      { 
        cvText: truncatedText,
        cvUploadedAt: new Date(),
      }
    );
    
    console.log('✅ Database updated successfully!');
    console.log('\nFirst 500 characters of extracted text:');
    console.log('─'.repeat(80));
    console.log(result.text.substring(0, 500));
    console.log('─'.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

reExtractCvText();
