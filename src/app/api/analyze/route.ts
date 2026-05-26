/**
 * AI Analysis API Route
 * Server-side endpoint that calls NVIDIA Nemotron / OpenRouter
 * Keeps API keys off the browser
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeFile } from '@/lib/ai/analyze';
import type { AIAnalysisRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AIAnalysisRequest;

    if (!body.fileName || !body.mimeType) {
      return NextResponse.json(
        { error: 'fileName and mimeType are required' },
        { status: 400 }
      );
    }

    const result = await analyzeFile(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Analysis failed',
      },
      { status: 500 }
    );
  }
}
