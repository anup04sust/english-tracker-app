import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProfileModel from '@/lib/models/Profile';

// GET: Fetch user profile
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    let profile = await ProfileModel.findOne({ userId });

    // Create default profile if doesn't exist
    if (!profile) {
      profile = await ProfileModel.create({
        userId,
        onboardingCompleted: false,
        onboardingStep: 0,
      });
    }

    // Normalize targetLanguages to ensure consistent format
    if (profile.targetLanguages && Array.isArray(profile.targetLanguages)) {
      profile.targetLanguages = profile.targetLanguages.map((item: any) => {
        // Convert string format to object format
        if (typeof item === 'string') {
          return { code: item, proficiency: 'beginner' };
        }
        // Ensure object format has required properties
        if (item && typeof item === 'object' && item.code) {
          return { code: item.code, proficiency: item.proficiency || 'beginner' };
        }
        return null;
      }).filter(Boolean) as any; // Remove any null values
    }

    // Normalize learningGoals to ensure consistent format (array)
    if (profile.learningGoals) {
      if (typeof profile.learningGoals === 'string' && profile.learningGoals.trim()) {
        // Convert old string format to array
        profile.learningGoals = [profile.learningGoals];
      } else if (!Array.isArray(profile.learningGoals)) {
        profile.learningGoals = [];
      }
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create or update user profile
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, ...profileData } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    console.log('POST /api/profile - Raw targetLanguages:', 
      JSON.stringify(profileData.targetLanguages, null, 2),
      'Type:', typeof profileData.targetLanguages,
      'IsArray:', Array.isArray(profileData.targetLanguages)
    );

    // Handle case where targetLanguages might be stringified
    if (typeof profileData.targetLanguages === 'string') {
      try {
        profileData.targetLanguages = JSON.parse(profileData.targetLanguages);
      } catch (e) {
        console.error('Failed to parse targetLanguages string:', e);
      }
    }

    // Normalize targetLanguages to ensure consistent format
    if (profileData.targetLanguages && Array.isArray(profileData.targetLanguages)) {
      profileData.targetLanguages = profileData.targetLanguages.map((item: any) => {
        // Convert string format to object format
        if (typeof item === 'string') {
          return { code: item, proficiency: 'beginner' };
        }
        // Ensure object format has required properties
        if (item && typeof item === 'object' && item.code) {
          return { code: item.code, proficiency: item.proficiency || 'beginner' };
        }
        return null;
      }).filter(Boolean); // Remove any null values
    }

    // Normalize learningGoals to ensure it's properly formatted
    if (profileData.learningGoals) {
      if (typeof profileData.learningGoals === 'string' && profileData.learningGoals.trim()) {
        // Keep as string if it's a non-empty string
      } else if (!Array.isArray(profileData.learningGoals)) {
        // Convert to array if needed
        profileData.learningGoals = [];
      }
    }

    console.log('POST /api/profile - Normalized targetLanguages:', 
      JSON.stringify(profileData.targetLanguages, null, 2)
    );

    const profile = await ProfileModel.findOneAndUpdate(
      { userId },
      { ...profileData },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('POST /api/profile error:', error);
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
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Normalize targetLanguages if it's being updated
    if (updates.targetLanguages && Array.isArray(updates.targetLanguages)) {
      updates.targetLanguages = updates.targetLanguages.map((item: any) => {
        // Convert string format to object format
        if (typeof item === 'string') {
          return { code: item, proficiency: 'beginner' };
        }
        // Ensure object format has required properties
        if (item && typeof item === 'object' && item.code) {
          return { code: item.code, proficiency: item.proficiency || 'beginner' };
        }
        return null;
      }).filter(Boolean); // Remove any null values
    }

    // Normalize learningGoals if it's being updated
    if (updates.learningGoals !== undefined) {
      if (typeof updates.learningGoals === 'string' && updates.learningGoals.trim()) {
        // Keep as is or convert to array based on your preference
      } else if (!Array.isArray(updates.learningGoals)) {
        updates.learningGoals = [];
      }
    }

    const profile = await ProfileModel.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true }
    );

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('PATCH /api/profile error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
