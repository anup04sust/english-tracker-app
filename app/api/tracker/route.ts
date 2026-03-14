import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TrackerModel from '@/lib/models/Tracker';

// GET: Fetch tracker state
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    const language = searchParams.get('language') || 'en';

    let tracker = await TrackerModel.findOne({ userId, selectedLanguage: language });

    // If no tracker exists, create default one
    if (!tracker) {
      const defaultDays: Record<number, any> = {};
      for (let i = 1; i <= 15; i++) {
        defaultDays[i] = {
          completed: false,
          confidence: 0,
          notes: '',
          transcript: '',
          aiFeedback: '',
          vocabulary: '',
          audioEntries: [],
        };
      }

      tracker = await TrackerModel.create({
        userId,
        selectedDay: 1,
        selectedLanguage: language,
        days: defaultDays,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        selectedDay: tracker.selectedDay,
        selectedLanguage: tracker.selectedLanguage,
        days: tracker.days,
      },
    });
  } catch (error: any) {
    console.error('GET /api/tracker error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create or update tracker state
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId = 'default-user', selectedDay, selectedLanguage = 'en', days } = body;

    const tracker = await TrackerModel.findOneAndUpdate(
      { userId, selectedLanguage },
      {
        selectedDay,
        selectedLanguage,
        days,
      },
      {
        new: true,
        upsert: true,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        selectedDay: tracker.selectedDay,
        selectedLanguage: tracker.selectedLanguage,
        days: tracker.days,
      },
    });
  } catch (error: any) {
    console.error('POST /api/tracker error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update specific fields
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId = 'default-user', language = 'en', dayId, field, value } = body;

    if (!dayId || !field) {
      return NextResponse.json(
        { success: false, error: 'dayId and field are required' },
        { status: 400 }
      );
    }

    const updateKey = `days.${dayId}.${field}`;
    const tracker = await TrackerModel.findOneAndUpdate(
      { userId, selectedLanguage: language },
      { $set: { [updateKey]: value } },
      { new: true }
    );

    if (!tracker) {
      return NextResponse.json(
        { success: false, error: 'Tracker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        selectedDay: tracker.selectedDay,
        selectedLanguage: tracker.selectedLanguage,
        days: tracker.days,
      },
    });
  } catch (error: any) {
    console.error('PATCH /api/tracker error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Reset tracker
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    const language = searchParams.get('language') || 'en';

    await TrackerModel.findOneAndDelete({ userId, selectedLanguage: language });

    return NextResponse.json({
      success: true,
      message: 'Tracker reset successfully',
    });
  } catch (error: any) {
    console.error('DELETE /api/tracker error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
