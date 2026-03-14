// Test script to check pdf-parse functionality
const fs = require('fs');
const path = require('path');

async function testPdfParse() {
  console.log('Testing pdf-parse library...\n');
  
  try {
    // Method 1: Direct require
    console.log('Method 1: Direct require');
    const pdfParse = require('pdf-parse');
    console.log('✓ pdf-parse loaded via require');
    console.log('  Type:', typeof pdfParse);
    console.log('  Keys:', Object.keys(pdfParse || {}));
    
    // Method 2: Dynamic import
    console.log('\nMethod 2: Dynamic import');
    const pdfModule = await import('pdf-parse');
    console.log('✓ pdf-parse loaded via import');
    console.log('  Type:', typeof pdfModule);
    console.log('  Default type:', typeof pdfModule.default);
    console.log('  Keys:', Object.keys(pdfModule));
    
    // Method 3: Specific path import
    console.log('\nMethod 3: Specific path import');
    try {
      const pdfModulePath = await import('pdf-parse/lib/pdf-parse.js');
      console.log('✓ pdf-parse loaded via lib/pdf-parse.js');
      console.log('  Type:', typeof pdfModulePath);
      console.log('  Default type:', typeof pdfModulePath.default);
    } catch (e) {
      console.log('✗ Could not load via lib/pdf-parse.js:', e.message);
    }
    
    // Try to parse a simple PDF buffer (create minimal PDF)
    console.log('\nTesting actual parsing with v2 API...');
    try {
      // Use a more realistic minimal PDF
      const dummyBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\n%%EOF');
      
      // Try using PDFParse v2 API with 'data' option
      console.log('Trying PDFParse v2 API with data option...');
      const PDFParseClass = pdfParse.PDFParse || pdfModule.PDFParse;
      
      if (PDFParseClass) {
        console.log('✓ Found PDFParse class, attempting to parse with data...');
        const parser = new PDFParseClass({ data: dummyBuffer });
        const result = await parser.getText();
        console.log('✓ Parse successful');
        console.log('  Result type:', typeof result);
        console.log('  Result keys:', Object.keys(result || {}));
        if (result && result.text) {
          console.log('  Text length:', result.text.length);
          console.log('  Text preview:', result.text.substring(0, 100));
        }
      } else {
        console.log('✗ PDFParse class not found');
      }
    } catch (e) {
      console.log('✗ Parse error:', e.message);
      console.error('Stack:', e.stack);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPdfParse();
