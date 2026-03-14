import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProfileModel from '@/lib/models/Profile';

export async function POST(request: NextRequest) {
  let userId: string = '';
  
  try {
    await connectDB();

    const body = await request.json();
    userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Fetch user profile
    const profile = await ProfileModel.findOne({ userId });
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Use user's API key or fallback
    const apiKey = profile.aiApiKey || process.env.AI_API_KEY;
    const aiProvider = profile.aiProvider || 'openai';
    const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
    const model = profile.aiModel || 'gpt-4o-mini';

    if (!apiKey) {
      // Generate default milestones without AI
      const defaultMilestones = generateDefaultMilestones(profile);
      await ProfileModel.findOneAndUpdate(
        { userId },
        { milestones: defaultMilestones }
      );

      return NextResponse.json({
        success: true,
        milestones: defaultMilestones,
        message: 'Generated default milestones',
      });
    }

    // Prepare prompt for AI
    const prompt = buildMilestonePrompt(profile);

    // Call AI API
    const aiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a language learning expert who creates personalized learning milestones based on user profiles and career goals.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI API request failed');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0]?.message?.content || '';

    // Parse AI response to extract milestones
    const milestones = parseAiMilestones(aiContent);

    // Save milestones to profile
    await ProfileModel.findOneAndUpdate(
      { userId },
      { milestones }
    );

    return NextResponse.json({
      success: true,
      milestones,
      message: 'AI-generated milestones created successfully',
    });
  } catch (error: any) {
    console.error('POST /api/generate-milestones error:', error);
    
    // Fallback to default milestones on error
    try {
      const { userId } = await request.json();
      const profile = await ProfileModel.findOne({ userId });
      if (profile) {
        const defaultMilestones = generateDefaultMilestones(profile);
        await ProfileModel.findOneAndUpdate(
          { userId },
          { milestones: defaultMilestones }
        );
        
        return NextResponse.json({
          success: true,
          milestones: defaultMilestones,
          message: 'Generated default milestones (AI unavailable)',
        });
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function buildMilestonePrompt(profile: any): string {
  return `Create 5 personalized language learning milestones for this user:

Profile:
- Native Language: ${profile.nativeLanguage}
- Target Languages: ${profile.targetLanguages.join(', ')}
- Profession: ${profile.profession || 'Not specified'}
- Industry: ${profile.industry || 'Not specified'}
- Current Level: ${profile.currentLevel}
- Learning Goals: ${profile.learningGoals || 'General language improvement'}
- CV Summary: ${profile.cvText || 'No CV provided'}

Please create 5 specific, measurable milestones that:
1. Align with their profession and industry
2. Progress from their current level
3. Support their stated learning goals
4. Are achievable in 1-3 months each

Format each milestone as:
TITLE: [clear, specific title]
DESCRIPTION: [detailed description with actionable steps]
TARGET_DATE: [date in YYYY-MM-DD format, 1-3 months from today]

Separate each milestone with "---"`;
}

function parseAiMilestones(content: string): any[] {
  const milestones: any[] = [];
  const sections = content.split('---').filter(s => s.trim());

  sections.forEach((section, index) => {
    const titleMatch = section.match(/TITLE:\s*(.+)/);
    // Use [\s\S] instead of 's' flag for wider compatibility
    const descMatch = section.match(/DESCRIPTION:\s*([\s\S]+?)(?=TARGET_DATE:|$)/);
    const dateMatch = section.match(/TARGET_DATE:\s*(\d{4}-\d{2}-\d{2})/);

    if (titleMatch && descMatch) {
      milestones.push({
        id: `milestone_${Date.now()}_${index}`,
        title: titleMatch[1].trim(),
        description: descMatch[1].trim(),
        targetDate: dateMatch ? dateMatch[1] : getDefaultTargetDate(index + 1),
        completed: false,
        createdBy: 'ai',
      });
    }
  });

  // If parsing failed, return default milestones
  return milestones.length > 0 ? milestones : generateDefaultMilestones({ targetLanguages: ['en'] });
}

function generateDefaultMilestones(profile: any): any[] {
  const targetLang = profile.targetLanguages?.[0] || 'target language';
  const today = new Date();

  return [
    {
      id: `milestone_${Date.now()}_1`,
      title: `Complete 15-Day ${targetLang.toUpperCase()} Speaking Plan`,
      description: 'Follow the structured 15-day program with daily speaking practice, recording, and self-assessment.',
      targetDate: getDefaultTargetDate(1),
      completed: false,
      createdBy: 'ai',
    },
    {
      id: `milestone_${Date.now()}_2`,
      title: 'Build Professional Vocabulary',
      description: `Learn 50 industry-specific terms related to your profession (${profile.profession || 'your field'}) in ${targetLang}.`,
      targetDate: getDefaultTargetDate(2),
      completed: false,
      createdBy: 'ai',
    },
    {
      id: `milestone_${Date.now()}_3`,
      title: 'Hold 5-Minute Conversation',
      description: `Practice speaking for 5 minutes continuously about topics relevant to your goals: ${profile.learningGoals || 'general topics'}.`,
      targetDate: getDefaultTargetDate(2),
      completed: false,
      createdBy: 'ai',
    },
    {
      id: `milestone_${Date.now()}_4`,
      title: 'Record Professional Introduction',
      description: 'Create a polished 2-minute introduction about yourself, your profession, and your goals.',
      targetDate: getDefaultTargetDate(1),
      completed: false,
      createdBy: 'ai',
    },
    {
      id: `milestone_${Date.now()}_5`,
      title: 'Practice Daily for 30 Days',
      description: 'Establish a consistent daily practice routine of at least 15 minutes speaking practice.',
      targetDate: getDefaultTargetDate(3),
      completed: false,
      createdBy: 'ai',
    },
  ];
}

function getDefaultTargetDate(monthsFromNow: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);
  return date.toISOString().split('T')[0];
}
