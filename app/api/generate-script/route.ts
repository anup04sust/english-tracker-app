import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/lib/models/Profile';
import { logAIRequest } from '@/lib/elasticsearch';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let requestBody: any;
  
  try {
    requestBody = await req.json();
    const { userId, dayId, goal, language, templateScript } = requestBody;

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
    const cvText = profile?.cvText || '';
    const learningGoals = Array.isArray(profile?.learningGoals) 
      ? profile.learningGoals.join(', ') 
      : profile?.learningGoals || '';
    const currentLevel = profile?.currentLevel || 'intermediate';

    // Extract CV information (use more for better personalization)
    // For Ollama with larger context windows, we can send more CV data
    const cvContext = cvText ? cvText.substring(0, 2000) : '';

    // Get user's name from profile or email
    const userName = profile?.userId?.split('@')[0] || 'learner';

    // Build AI prompt with CV information and template
    const prompt = `Generate a natural, conversational reading script for a ${targetLang} language learner.

Context:
- Day ${dayId} of learning
- Goal: ${goal}
- Learner's profession: ${profession}
- Industry: ${industry}
- Native language: ${nativeLanguage}
- Current level: ${currentLevel}
- Learning goals: ${learningGoals}

${cvContext ? `Professional Background from CV:
${cvContext}

Use the above professional experience, skills, and background to personalize the script.
` : ''}
${templateScript ? `Template to expand upon (keep the general structure and tone):
"${templateScript}"

` : ''}Requirements:
1. Create a realistic, engaging dialogue or monologue (300-450 words for 2-3 minutes of speaking)
2. Match the topic to the day's goal: ${goal}
3. ${templateScript ? 'Expand upon the template above, keeping its friendly and encouraging tone' : 'Create an encouraging introduction'}
4. Use the learner's specific professional background, skills, and experiences from their CV above
5. Include real examples from their career journey (e.g., projects, technologies, achievements)
6. Incorporate industry-specific vocabulary naturally (e.g., Drupal, APIs, enterprise solutions)
7. Structure it with natural pauses and clear sections for comfortable reading
8. Use appropriate complexity for ${currentLevel} level learners
9. Make it practical for their real-world work situations (e.g., UK remote agency work)
10. Include natural expressions, common phrases, and transitional words
11. Add realistic details that relate to their specific industry and experience
12. Keep the tone supportive, confidence-building, and professional

Return ONLY the script text, no additional formatting, headers, or explanations. Make it sound natural and conversational as if they're speaking about their own career.`;

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
              content: 'You are an expert language learning script writer who creates natural, engaging, and personalized reading scripts for language learners. You specialize in creating content that is relevant to their professional background and career.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 800,
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
          body: { userId, dayId, goal, language, profession, industry, hasCVInfo: !!cvContext, hasTemplate: !!templateScript },
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
      
      // Return a fallback script (use template if available)
      const fallbackScript = requestBody.templateScript || generateFallbackScript(requestBody.dayId, requestBody.goal, profession, profile?.cvText);
      
      const result = {
        success: true,
        script: fallbackScript,
        fallback: true,
        message: requestBody.templateScript ? 'Using default template (AI unavailable)' : 'Using fallback script (AI unavailable)',
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

function generateFallbackScript(dayId: number, goal: string, profession: string, cvText?: string): string {
  const hasCV = cvText && cvText.length > 50;
  
  const scripts: Record<number, string> = {
    1: `Hello everyone! My name is Alex, and I'm really excited to start this English learning journey with you today. I work as a ${profession}, and I've been in this field for quite some time now. Communication is absolutely essential in my line of work, which is why I've decided to dedicate myself to improving my English speaking skills.

Let me tell you a bit more about my background and why this is so important to me. In my daily work, I interact with colleagues, clients, and stakeholders from various backgrounds. Sometimes I find it challenging to express my ideas clearly and confidently, especially during important meetings or presentations. I know that with better English skills, I could be more effective in my role and potentially open up new career opportunities.

${hasCV ? `Based on my professional experience, I've developed strong skills in my field, but I recognize that language shouldn't be a barrier to showcasing my expertise.` : `I believe that language skills are just as important as technical skills in today's globalized workplace.`} 

My goal for the next 15 days is not just to improve my pronunciation or grammar, but to build genuine confidence in speaking English naturally. I want to be able to engage in conversations without constantly translating in my head. I want to think in English and respond spontaneously.

I'm committed to practicing every single day, even if it's just for a few minutes. I know that consistency is key to language learning. Some days will be easier than others, but I'm ready for this challenge. Let's make this journey together, and I'm looking forward to seeing my progress over time. Thank you for being part of this experience with me!`,
    
    2: `Good morning! Today, I'd like to take a deeper dive into who I am professionally and what drives me to improve my English communication skills. As I mentioned, I work as a ${profession}, and this role requires me to be clear, precise, and persuasive in my communication.

Let me share a typical situation from my work life. Last week, I had an important project meeting where I needed to present my ideas to a group of senior managers. I had prepared thoroughly and knew my material inside and out. However, when it came time to speak, I found myself struggling to find the right words. I could see the concepts clearly in my mind, but translating them into English in real-time was challenging. This experience really highlighted for me the importance of not just knowing English, but being fluent and comfortable with it.

${hasCV ? `My professional background has given me many technical skills and domain knowledge, but I realize that to advance further in my career, I need to bridge this communication gap.` : `In today's professional world, clear communication can make the difference between success and missed opportunities.`}

What I've learned is that language learning isn't just about memorizing vocabulary or grammar rules. It's about building confidence, developing intuition for the language, and learning to express yourself naturally. It's about being able to share your expertise without the language barrier holding you back.

That's why I'm here, practicing every day. I'm working on thinking in English rather than translating from my native language. I'm trying to expand my vocabulary with words and phrases that are relevant to my work. And most importantly, I'm building the confidence to speak up, even when I'm not 100% sure about my grammar or pronunciation.

I know this journey will have ups and downs, but I'm committed to pushing through. Every practice session brings me one step closer to my goal. Thank you for listening to my story, and I hope it resonates with you!`,
    
    3: `Hi there! Today I want to talk about my typical workday and how English plays a role in almost everything I do. As a ${profession}, my daily routine involves a variety of tasks that require clear and effective communication.

My day usually starts around 8 AM when I check my emails. Many of these emails are in English, and I need to understand them quickly and respond appropriately. Sometimes I spend too much time crafting the perfect response because I'm worried about making mistakes. I know that as I become more comfortable with English, this will become faster and more natural.

Around mid-morning, I usually have my first meeting of the day. This is where the real challenge begins. During meetings, I need to not only understand what others are saying, but also contribute my own ideas and insights. In my role as a ${profession}, my technical knowledge is solid, but expressing that knowledge clearly in English requires constant effort.

${hasCV ? `Over the years, I've built up considerable experience in my field, working on various challenging projects and developing specialized skills. But I've noticed that my career progression has sometimes been limited by my communication abilities.` : `I've realized that professional growth isn't just about technical skills – it's equally about how well you can communicate your ideas and collaborate with others.`}

In the afternoon, I often work on detailed tasks that require focus and concentration. Sometimes I need to read technical documentation, write reports, or prepare presentations. All of this is typically done in English, which adds an extra layer of complexity to my work. What might take a native speaker an hour might take me two hours, simply because I'm processing everything in a second language.

What I'm working towards is fluency that allows me to work as efficiently in English as I do in my native language. I want to be able to participate in spontaneous conversations without anxiety. I want to be able to present my work confidently without over-rehearsing.

That's why this daily practice is so important to me. Each day, I'm building not just my language skills, but also my confidence and my professional capabilities. I'm grateful for this opportunity to improve, and I'm excited to see where this journey takes me. Thank you for being part of my learning process!`,
  };

  const defaultScript = `Hello! Today's practice focuses on: ${goal}. As a ${profession}, I understand deeply how important clear and effective communication is in the professional world. Let me tell you why I'm so committed to this learning journey.

Every day in my work, I face situations where strong English skills would make a significant difference. Whether it's writing emails, participating in meetings, giving presentations, or just having casual conversations with colleagues, language ability impacts everything I do.

${hasCV ? `Looking at my career history, I've achieved many things and developed valuable skills in my field. However, I know that to reach the next level in my career, I need to overcome the language barrier that sometimes holds me back.` : `In today's interconnected business environment, English has become the universal language of professional communication.`}

What motivates me most is the potential for growth. I see how my colleagues who are fluent in English have more opportunities, can build stronger professional networks, and advance more quickly in their careers. I want those same opportunities for myself.

But beyond professional reasons, there's also a personal dimension to this. Learning a language is about expanding your horizons, connecting with more people, and understanding different perspectives. It's about confidence and self-improvement.

I'm working hard to improve my speaking skills and build confidence in using English naturally. Each practice session, including this one right now, brings me closer to my goals. I'm learning to embrace mistakes as part of the learning process rather than fearing them. I'm training myself to think in English rather than constantly translating in my head.

The journey isn't always easy. Some days I feel like I'm making great progress, while other days I struggle with concepts I thought I had mastered. But that's all part of the learning process. What matters is consistency and persistence.

I'm excited about the progress I'll make over the coming weeks and months. I know that with dedication and regular practice, I can achieve the fluency I'm aiming for. Thank you for being part of this journey with me. Let's continue to learn and grow together, making steady progress toward our goals every single day!`;

  return scripts[dayId] || defaultScript;
}
