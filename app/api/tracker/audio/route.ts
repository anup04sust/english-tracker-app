import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TrackerModel from '@/lib/models/Tracker';

// POST: Add audio entry to a specific day
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId = 'default-user', dayId, entry } = body;

    if (!dayId || !entry) {
      return NextResponse.json(
        { success: false, error: 'dayId and entry are required' },
        { status: 400 }
      );
    }

    const tracker = await TrackerModel.findOne({ userId });
    
    if (!tracker) {
      return NextResponse.json(
        { success: false, error: 'Tracker not found' },
        { status: 404 }
      );
    }

    const dayData = tracker.days[dayId];
    if (!dayData) {
      return NextResponse.json(
        { success: false, error: 'Day not found' },
        { status: 404 }
      );
    }

    // Add entry to the beginning of the array
    dayData.audioEntries.unshift(entry);
    tracker.days[dayId] = dayData;
    tracker.markModified('days');
    
    await tracker.save();

    return NextResponse.json({
      success: true,
      data: {
        selectedDay: tracker.selectedDay,
        days: tracker.days,
      },
    });
  } catch (error: any) {
    console.error('POST /api/tracker/audio error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove audio entry from a specific day
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId = 'default-user', dayId, entryId } = body;

    if (!dayId || !entryId) {
      return NextResponse.json(
        { success: false, error: 'dayId and entryId are required' },
        { status: 400 }
      );
    }

    const tracker = await TrackerModel.findOne({ userId });
    
    if (!tracker) {
      return NextResponse.json(
        { success: false, error: 'Tracker not found' },
        { status: 404 }
      );
    }

    const dayData = tracker.days[dayId];
    if (!dayData) {
      return NextResponse.json(
        { success: false, error: 'Day not found' },
        { status: 404 }
      );
    }

    // Filter out the entry with matching id
    dayData.audioEntries = dayData.audioEntries.filter((e: any) => e.id !== entryId);
    tracker.days[dayId] = dayData;
    tracker.markModified('days');
    
    await tracker.save();

    return NextResponse.json({
      success: true,
      data: {
        selectedDay: tracker.selectedDay,
        days: tracker.days,
      },
    });
  } catch (error: any) {
    console.error('DELETE /api/tracker/audio error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
