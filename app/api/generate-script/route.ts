import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/lib/models/Profile';
import { logAIRequest } from '@/lib/elasticsearch';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let requestBody: any;
  
  try {
    requestBody = await req.json();
    const { userId, dayId, goal, language } = requestBody;

    if (!userId || !dayId || !goal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    const profile = await Profile.findOne({ userId });

    // Get API configuration (Ollama default)
    const baseUrl = process.env.AI_BASE_URL || 'http://ollama:11434/v1';
    const model = process.env.AI_MODEL || 'codellama';
    const apiKey = process.env.AI_API_KEY || profile?.aiApiKey || 'ollama';
    
    const isOllama = baseUrl.includes('ollama');
    const effectiveApiKey = isOllama ? 'ollama' : apiKey;

    if (!effectiveApiKey && !isOllama) {
      return NextResponse.json({ 
        error: 'No AI API key configured',
        fallback: true 
      }, { status: 400 });
    }

    // Get user context for personalization
    const profession = profile?.profession || 'professional';
    const industry = profile?.industry || 'general';
    const nativeLanguage = profile?.nativeLanguage || 'bn';
    const targetLang = language || 'English';

    // Build AI prompt
    const prompt = `Generate a natural, conversational reading script for a ${targetLang} language learner.

Context:
- Day ${dayId} of learning
- Goal: ${goal}
- Learner's profession: ${profession}
- Industry: ${industry}
- Native language: ${nativeLanguage}

Requirements:
1. Create a realistic dialogue or monologue (150-250 words)
2. Match the topic to the day's goal
3. Include profession/industry-relevant vocabulary where appropriate
4. Use simple, clear sentences for intermediate learners
5. Make it practical and useful for daily speaking practice
6. Include natural expressions and common phrases

Return ONLY the script text, no additional formatting or explanations.`;

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a language learning script writer who creates natural, engaging reading scripts for language learners.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AI API error:', errorData);
        throw new Error('AI request failed');
      }

      const data = await response.json();
      const script = data.choices?.[0]?.message?.content?.trim();

      if (!script) {
        throw new Error('No script generated');
      }

      const result = {
        success: true,
        script,
        provider: isOllama ? 'Ollama' : 'OpenAI',
      };
      
      const latency = Date.now() - startTime;
      
      // Log to Elasticsearch
      logAIRequest({
        timestamp: new Date().toISOString(),
        userId,
        endpoint: '/api/generate-script',
        provider: isOllama ? 'Ollama' : 'OpenAI',
        model,
        request: {
          method: 'POST',
          body: { userId, dayId, goal, language, profession, industry },
        },
        response: {
          status: 200,
          body: { ...result, scriptLength: script.length },
          latency,
        },
      }).catch(err => console.error('ES log failed:', err));

      return NextResponse.json(result);

    } catch (aiError) {
      console.error('AI generation error:', aiError);
      
      // Return a fallback script
      const fallbackScript = generateFallbackScript(requestBody.dayId, requestBody.goal, profession);
      
      const result = {
        success: true,
        script: fallbackScript,
        fallback: true,
        message: 'Using fallback script (AI unavailable)',
      };
      
      // Log error to Elasticsearch
      logAIRequest({
        timestamp: new Date().toISOString(),
        userId: requestBody.userId,
        endpoint: '/api/generate-script',
        provider: isOllama ? 'Ollama' : 'OpenAI',
        model,
        request: {
          method: 'POST',
          body: { ...requestBody, profession, industry },
        },
        response: {
          status: 200,
          body: result,
          latency: Date.now() - startTime,
        },
        error: aiError instanceof Error ? aiError.message : String(aiError),
      }).catch(err => console.error('ES log failed:', err));
      
      return NextResponse.json(result);
    }

  } catch (error) {
    console.error('Generate script error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate script' 
    }, { status: 500 });
  }
}

function generateFallbackScript(dayId: number, goal: string, profession: string): string {
  const scripts: Record<number, string> = {
    1: `Hello! My name is Alex, and I'm a ${profession}. Today is my first day practicing English speaking. I feel a bit nervous, but I'm also excited to improve my communication skills. I want to speak more confidently at work and in daily conversations. I believe that with consistent practice, I can achieve my goals. Let's start this journey together!`,
    
    2: `Good morning! I'd like to introduce myself more formally. I work as a ${profession}, and I've been in this field for several years. In my daily work, I need to communicate with colleagues and clients regularly. That's why improving my English is so important to me. I'm committed to practicing every day and making steady progress. Thank you for listening!`,
    
    3: `Hi there! Today I want to talk about my typical workday. I usually start my morning by checking emails and planning tasks. During the day, I attend meetings and collaborate with my team. Communication is essential in my role as a ${profession}. Sometimes it's challenging, but I'm improving every day. I'm grateful for this learning opportunity.`,
  };

  return scripts[dayId] || `Hello! Today's practice focuses on: ${goal}. As a ${profession}, I understand the importance of clear communication. I'm working hard to improve my speaking skills and build confidence. Every practice session brings me closer to my goals. Let's continue this journey together and make progress every day!`;
}
