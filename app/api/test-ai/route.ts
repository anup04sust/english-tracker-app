import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Profile from '@/lib/models/Profile';
import { logAIRequest } from '@/lib/elasticsearch';

export async function POST(req: Request) {
  const startTime = Date.now();
  let requestBody: any;
  
  try {
    requestBody = await req.json();
    const { userId } = requestBody;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await connectDB();
    const profile = await Profile.findOne({ userId });
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Prioritize environment config (Ollama default) over user API key
    const baseUrl = process.env.AI_BASE_URL || 'http://ollama:11434/v1';
    const model = process.env.AI_MODEL || 'codellama';
    const apiKey = process.env.AI_API_KEY || profile.aiApiKey;

    // Ollama doesn't require a real API key
    const isOllama = baseUrl.includes('ollama');
    const effectiveApiKey = isOllama ? 'ollama' : apiKey;

    if (!effectiveApiKey && !isOllama) {
      return NextResponse.json({ 
        connected: false, 
        message: 'No API key configured' 
      });
    }

    // Test the API with a minimal request
    const aiRequestBody = {
      model: model,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    };
    
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveApiKey}`,
        },
        body: JSON.stringify(aiRequestBody),
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        const result = { 
          connected: true, 
          message: isOllama ? 'Ollama connected' : 'AI Assistant connected',
          model: model,
          provider: isOllama ? 'Ollama (Local)' : 'OpenAI'
        };
        
        // Log to Elasticsearch
        logAIRequest({
          timestamp: new Date().toISOString(),
          userId: userId,
          endpoint: '/api/test-ai',
          provider: isOllama ? 'Ollama' : 'OpenAI',
          model: model,
          request: {
            method: 'POST',
            body: aiRequestBody,
          },
          response: {
            status: 200,
            body: result,
            latency,
          },
        }).catch(err => console.error('ES log failed:', err));
        
        return NextResponse.json(result);
      } else {
        const errorData = await response.json();
        const result = { 
          connected: false, 
          message: errorData.error?.message || 'API connection failed',
          error: errorData
        };
        
        // Log error to Elasticsearch
        logAIRequest({
          timestamp: new Date().toISOString(),
          userId: userId,
          endpoint: '/api/test-ai',
          provider: isOllama ? 'Ollama' : 'OpenAI',
          model: model,
          request: {
            method: 'POST',
            body: aiRequestBody,
          },
          response: {
            status: response.status,
            body: result,
            latency: Date.now() - startTime,
          },
          error: errorData.error?.message || 'API connection failed',
        }).catch(err => console.error('ES log failed:', err));
        
        return NextResponse.json(result);
      }
    } catch (apiError) {
      console.error('API test error:', apiError);
      const errorMsg = isOllama ? 'Ollama service not available' : 'Failed to connect to AI service';
      
      // Log error to Elasticsearch
      logAIRequest({
        timestamp: new Date().toISOString(),
        userId: userId,
        endpoint: '/api/test-ai',
        provider: isOllama ? 'Ollama' : 'OpenAI',
        model: model,
        request: {
          method: 'POST',
          body: aiRequestBody,
        },
        response: {
          status: 500,
          body: { connected: false, message: errorMsg },
          latency: Date.now() - startTime,
        },
        error: apiError instanceof Error ? apiError.message : String(apiError),
      }).catch(err => console.error('ES log failed:', err));
      
      return NextResponse.json({ 
        connected: false, 
        message: errorMsg
      });
    }
  } catch (error) {
    console.error('Test AI error:', error);
    return NextResponse.json({ 
      connected: false, 
      message: 'Server error' 
    }, { status: 500 });
  }
}
