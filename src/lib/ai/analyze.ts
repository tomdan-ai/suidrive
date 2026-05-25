/**
 * AI Analysis Client
 * Handles file analysis using NVIDIA NIM + DeepSeek fallback
 */

import type { AIAnalysisRequest, AIAnalysisResponse } from "@/types";

/**
 * Analyze a file and generate summary
 */
export async function analyzeFile(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  const apiKey = process.env.NVIDIA_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  // Try NVIDIA NIM first
  if (apiKey) {
    try {
      return await analyzeWithNvidia(request, apiKey);
    } catch (error) {
      console.warn('NVIDIA NIM failed, falling back to DeepSeek:', error);
    }
  }

  // Fallback to DeepSeek via OpenRouter
  if (openRouterKey) {
    return await analyzeWithDeepSeek(request, openRouterKey);
  }

  throw new Error('No AI provider configured. Set NVIDIA_API_KEY or OPENROUTER_API_KEY');
}

/**
 * Analyze using NVIDIA NIM
 */
async function analyzeWithNvidia(
  request: AIAnalysisRequest,
  apiKey: string
): Promise<AIAnalysisResponse> {
  const prompt = buildAnalysisPrompt(request);

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [
        {
          role: 'system',
          content: 'You are a file analysis assistant. Provide concise, helpful summaries.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`NVIDIA NIM API error: ${response.statusText}`);
  }

  const data = await response.json();
  const summary = data.choices[0]?.message?.content || 'No summary generated';

  return {
    summary,
    provider: 'nvidia',
  };
}

/**
 * Analyze using DeepSeek via OpenRouter
 */
async function analyzeWithDeepSeek(
  request: AIAnalysisRequest,
  apiKey: string
): Promise<AIAnalysisResponse> {
  const prompt = buildAnalysisPrompt(request);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'SuiDrive',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a file analysis assistant. Provide concise, helpful summaries.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  const summary = data.choices[0]?.message?.content || 'No summary generated';

  return {
    summary,
    provider: 'deepseek',
  };
}

/**
 * Build analysis prompt based on file type and context
 */
function buildAnalysisPrompt(request: AIAnalysisRequest): string {
  const { fileName, mimeType, fileContent, previousSummary } = request;

  let prompt = `Analyze this file and provide a concise summary:\n\n`;
  prompt += `File: ${fileName}\n`;
  prompt += `Type: ${mimeType}\n\n`;

  if (previousSummary) {
    prompt += `Previous version summary: ${previousSummary}\n\n`;
    prompt += `Focus on what changed in this new version.\n\n`;
  }

  if (fileContent) {
    // Truncate content if too long
    const maxLength = 2000;
    const content =
      fileContent.length > maxLength
        ? fileContent.substring(0, maxLength) + '...[truncated]'
        : fileContent;
    prompt += `Content preview:\n${content}\n\n`;
  }

  prompt += `Provide:\n`;
  prompt += `1. A brief summary (2-3 sentences)\n`;
  prompt += `2. Key insights or notable features\n`;
  if (previousSummary) {
    prompt += `3. What changed from the previous version\n`;
  }

  return prompt;
}

/**
 * Compare two versions and explain differences
 */
export async function compareVersions(
  oldSummary: string,
  newSummary: string,
  fileName: string
): Promise<string> {
  const prompt = `Compare these two versions of "${fileName}":\n\n`;
  const fullPrompt =
    prompt +
    `Version 1: ${oldSummary}\n\n` +
    `Version 2: ${newSummary}\n\n` +
    `Explain what changed in 2-3 sentences.`;

  try {
    const result = await analyzeFile({
      fileName,
      mimeType: 'text/plain',
      fileContent: fullPrompt,
    });
    return result.summary;
  } catch (error) {
    console.error('Version comparison failed:', error);
    return 'Unable to compare versions';
  }
}
