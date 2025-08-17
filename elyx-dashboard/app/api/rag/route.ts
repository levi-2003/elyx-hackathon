import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag-service';
import fs from 'fs';
import path from 'path';

// Load conversation data
const conversationLogPath = path.join(process.cwd(), '..', 'full_conversation_log_langgraph_detailed (2).txt');
let ragService: RAGService | null = null;

function getRAGService(): RAGService {
  if (!ragService) {
    const conversationLog = fs.readFileSync(conversationLogPath, 'utf-8');
    ragService = new RAGService(conversationLog);
  }
  return ragService;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const weekNumber = searchParams.get('week') ? parseInt(searchParams.get('week')!) : undefined;
    const type = searchParams.get('type') || 'profile';

    const service = getRAGService();

    switch (type) {
      case 'profile':
        const profile = await service.queryMemberProfile(weekNumber);
        return NextResponse.json(profile);
      
      case 'decisions':
        const decisions = await service.queryDecisions(weekNumber);
        return NextResponse.json(decisions);
      
      case 'summary':
        if (!weekNumber) {
          return NextResponse.json({ error: 'Week number required for summary' }, { status: 400 });
        }
        const summary = await service.queryWeekSummary(weekNumber);
        return NextResponse.json({ summary });
      
      case 'progress':
        const progress = await service.queryProgressAnalysis();
        return NextResponse.json({ analysis: progress });
      
      case 'weeks':
        const weeks = service.getWeeks();
        return NextResponse.json(weeks);
      
      default:
        return NextResponse.json({ error: 'Invalid query type' }, { status: 400 });
    }
  } catch (error) {
    console.error('RAG API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, weekNumber, type = 'profile' } = body;

    const service = getRAGService();

    switch (type) {
      case 'profile':
        const profile = await service.queryMemberProfile(weekNumber);
        return NextResponse.json(profile);
      
      case 'decisions':
        const decisions = await service.queryDecisions(weekNumber);
        return NextResponse.json(decisions);
      
      case 'summary':
        if (!weekNumber) {
          return NextResponse.json({ error: 'Week number required for summary' }, { status: 400 });
        }
        const summary = await service.queryWeekSummary(weekNumber);
        return NextResponse.json({ summary });
      
      case 'progress':
        const progress = await service.queryProgressAnalysis();
        return NextResponse.json({ analysis: progress });
      
      default:
        return NextResponse.json({ error: 'Invalid query type' }, { status: 400 });
    }
  } catch (error) {
    console.error('RAG API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
