import { NextRequest, NextResponse } from 'next/server';
import { logAIRequest } from '@/lib/elasticsearch';

function fallback(d:any){const words=(d.userTranscript||'').trim().split(/\s+/).filter(Boolean).length;const strengths=[] as string[];const improves=[] as string[];const next=[] as string[];if(words>0)strengths.push(`You submitted ${words} words of speaking/transcript, which means you practiced seriously.`);else improves.push('Add a transcript or short summary for more accurate feedback.');if((d.confidence||0)>=4)strengths.push('Your confidence score is strong. Keep focusing on clarity over perfection.');else improves.push('Read the script aloud 3 times before free speaking to warm up your mouth and confidence.');if((d.vocabulary||'').trim())strengths.push('Tracking vocabulary is a smart habit.');else next.push('Write 3 new phrases from today and use each in a sentence.');next.push('Record one more version and focus on slower pace and clear word endings.');next.push('Use short sentences first. This usually helps Bengali learners speak more smoothly.');return [`Day ${d.dayId} review`,'','What went well:',...(strengths.length?strengths:['- You showed up and practiced. That matters.']).map((x:string)=>`- ${x}`),'','What to improve next:',...improves.map((x:string)=>`- ${x}`),'','Next practice step:',...next.map((x:string)=>`- ${x}`)].join('\n')}

async function remote(d:any, startTime: number){
  const base=process.env.AI_BASE_URL||'http://ollama:11434/v1';
  const model=process.env.AI_MODEL||'codellama';
  const key=process.env.AI_API_KEY||'ollama';
  const isOllama=base.includes('ollama');
  const effectiveKey=isOllama?'ollama':key;
  
  if(!effectiveKey&&!isOllama)return null;
  
  const prompt=`You are an English speaking coach for a Bengali learner. Give practical feedback in simple English.\n\nDay: ${d.dayId}\nGoal: ${d.goal}\nTarget reading script: ${d.targetScript}\nUser transcript: ${d.userTranscript||'(none)'}\nUser notes: ${d.notes||'(none)'}\nConfidence: ${d.confidence}/5\nVocabulary: ${d.vocabulary||'(none)'}\n\nReturn plain text with exactly these sections:\n1. What went well\n2. Main mistakes or weak points\n3. Better version of 3 sample lines\n4. Pronunciation focus\n5. Next 10-minute practice task`;
  
  const requestBody = {
    model,
    messages:[
      {role:'system',content:'You are a supportive but accurate English speaking coach.'},
      {role:'user',content:prompt}
    ],
    temperature:.4
  };
  
  const r=await fetch(`${base}/chat/completions`,{
    method:'POST',
    headers:{'Content-Type':'application/json',Authorization:`Bearer ${effectiveKey}`},
    body:JSON.stringify(requestBody)
  });
  
  const latency = Date.now() - startTime;
  const responseData = await r.json();
  
  if(!r.ok){
    // Log error to Elasticsearch
    logAIRequest({
      timestamp: new Date().toISOString(),
      userId: d.userId || 'unknown',
      endpoint: '/api/ai-feedback',
      provider: isOllama ? 'Ollama' : 'OpenAI',
      model,
      request: { method: 'POST', body: { dayId: d.dayId, goal: d.goal } },
      response: { status: r.status, body: responseData, latency },
      error: responseData.error?.message || 'AI request failed',
    }).catch(err => console.error('ES log failed:', err));
    
    throw new Error(await r.text());
  }
  
  const feedback = responseData.choices?.[0]?.message?.content?.trim()||null;
  
  // Log success to Elasticsearch
  logAIRequest({
    timestamp: new Date().toISOString(),
    userId: d.userId || 'unknown',
    endpoint: '/api/ai-feedback',
    provider: isOllama ? 'Ollama' : 'OpenAI',
    model,
    request: { method: 'POST', body: { dayId: d.dayId, goal: d.goal, transcriptLength: (d.userTranscript||'').length } },
    response: { status: 200, body: { feedbackLength: feedback?.length || 0 }, latency },
  }).catch(err => console.error('ES log failed:', err));
  
  return feedback;
}

export async function POST(req:NextRequest){
  const startTime = Date.now();
  try{
    const d=await req.json();
    if(!d.dayId||!d.goal||!d.targetScript)return NextResponse.json({error:'Missing required fields.'},{status:400});
    const feedback=await remote(d, startTime)||fallback(d);
    return NextResponse.json({feedback})
  }catch{
    return NextResponse.json({error:'Could not generate feedback.'},{status:500})
  }
}

