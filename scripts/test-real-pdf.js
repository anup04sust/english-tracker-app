const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function testRealPdf() {
  try {
    // Read the actual uploaded PDF
    const pdfPath = path.join(process.cwd(), 'public/uploads/cvs/anup_biswas_miaki_com_bd_1773480573939.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      console.log('PDF file not found at:', pdfPath);
      return;
    }
    
    console.log('Reading PDF from:', pdfPath);
    const buffer = fs.readFileSync(pdfPath);
    console.log('Buffer size:', buffer.length, 'bytes');
    
    console.log('\nParsing with pdf-parse v2 API...');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    
    console.log('\n✅ Success!');
    console.log('Text length:', result.text.length);
    console.log('\nFirst 500 characters:');
    console.log(result.text.substring(0, 500));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testRealPdf();
