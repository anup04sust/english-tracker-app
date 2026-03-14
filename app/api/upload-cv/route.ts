import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import connectDB from '@/lib/mongodb';
import ProfileModel from '@/lib/models/Profile';
import mammoth from 'mammoth';

async function extractTextFromFile(buffer: Buffer, fileType: string, fileName: string): Promise<string> {
  try {
    // PDF files
    if (fileType === 'application/pdf') {
      try {
        // pdf-parse v2 API - use PDFParse class with 'data' option
        const { PDFParse } = await import('pdf-parse');
        
        // Convert Buffer to Uint8Array which PDFParse accepts
        const uint8Array = new Uint8Array(buffer);
        
        // Create parser with buffer as 'data'
        const parser = new PDFParse({ data: uint8Array });
        
        // Extract text
        const result = await parser.getText();
        return result.text || 'Unable to extract text from PDF';
      } catch (pdfError: any) {
        console.error('PDF parsing error:', pdfError);
        return `PDF text extraction failed: ${pdfError.message}. File saved but text not extracted.`;
      }
    }
    
    // DOCX files
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || 'Unable to extract text from DOCX';
    }
    
    // DOC files (older Word format)
    if (fileType === 'application/msword') {
      try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || 'Unable to extract text from DOC';
      } catch (err) {
        return 'Unable to extract text from DOC (legacy format not fully supported)';
      }
    }
    
    // TXT files
    if (fileType === 'text/plain') {
      return buffer.toString('utf-8');
    }
    
    return `Unable to extract text from file type: ${fileType}`;
  } catch (error: any) {
    console.error('Text extraction error:', error);
    return `Text extraction failed: ${error.message}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { success: false, error: 'File and userId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'cvs');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9]/g, '_');
    const fileExt = file.name.split('.').pop();
    const filename = `${sanitizedUserId}_${timestamp}.${fileExt}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer as any);

    // Generate public URL
    const cvUrl = `/uploads/cvs/${filename}`;

    // Extract text content from the uploaded file
    console.log(`Extracting text from ${file.type} file: ${file.name}`);
    const cvText = await extractTextFromFile(buffer, file.type, file.name);
    
    // Truncate if too long (keep first 10,000 characters for AI processing)
    const truncatedText = cvText.length > 10000 
      ? cvText.substring(0, 10000) + '...\n[Text truncated for storage]'
      : cvText;

    console.log(`Extracted ${cvText.length} characters from CV`);

    // Update profile
    await ProfileModel.findOneAndUpdate(
      { userId },
      {
        cvUrl,
        cvText: truncatedText,
        cvUploadedAt: new Date(),
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      cvUrl,
      cvText: truncatedText,
      textLength: cvText.length,
      message: 'CV uploaded and text extracted successfully',
    });
  } catch (error: any) {
    console.error('POST /api/upload-cv error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
