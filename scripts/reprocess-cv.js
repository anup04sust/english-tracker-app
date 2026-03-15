const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Import PDFParse
async function extractTextFromPDF(filePath) {
  try {
    const { PDFParse } = await import('pdf-parse');
    const buffer = await fs.readFile(filePath);
    
    // Convert Buffer to Uint8Array
    const uint8Array = new Uint8Array(buffer);
    
    const parser = new PDFParse(uint8Array);
    await parser.load();
    const result = await parser.getText();
    
    // getText() returns an array of text strings, one per page
    if (Array.isArray(result)) {
      return result.join('\n').trim();
    }
    
    // If it's already a string, just return it
    if (typeof result === 'string') {
      return result.trim();
    }
    
    // If it's an object with text property
    if (result && typeof result === 'object' && result.text) {
      return result.text.trim();
    }
    
    console.log('Unexpected getText() result type:', typeof result);
    console.log('Result:', result);
    return String(result).trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw error;
  }
}

async function reprocessCV(userId, cvFileName) {
  try {
    await mongoose.connect('mongodb://root:root@mongodb:27017/english_tracker?authSource=admin');
    
    const Profile = mongoose.model('Profile', new mongoose.Schema({}, { strict: false }));
    
    // Find the CV file
    const cvPath = path.join(process.cwd(), 'public', 'uploads', 'cvs', cvFileName);
    
    console.log(`📄 Processing CV: ${cvPath}`);
    console.log('⏳ Extracting text...');
    
    // Extract text
    const cvText = await extractTextFromPDF(cvPath);
    
    // Truncate if too long
    const truncatedText = cvText.length > 10000 
      ? cvText.substring(0, 10000) + '...\n[Text truncated for storage]'
      : cvText;
    
    console.log(`✅ Extracted ${cvText.length} characters`);
    console.log(`📝 First 200 characters:\n${cvText.substring(0, 200)}...`);
    
    // Update profile
    await Profile.findOneAndUpdate(
      { userId },
      {
        cvText: truncatedText,
        cvUploadedAt: new Date(),
      }
    );
    
    console.log(`\n✅ Profile updated for: ${userId}`);
    console.log(`📊 CV Text Length: ${cvText.length} characters`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Run
const userId = process.argv[2] || 'upm.01.wpo@gmail.com';
const cvFileName = process.argv[3] || 'upm_01_wpo_gmail_com_1773476283388.pdf';

reprocessCV(userId, cvFileName)
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
