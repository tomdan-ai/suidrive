/**
 * AI Analysis Client
 * Handles file analysis using NVIDIA NIM (Nemotron) + OpenRouter fallback
 *
 * IMPORTANT: This module reads server-only env vars (NVIDIA_API_KEY, OPENROUTER_API_KEY).
 * It must be called from server-side code (API routes), NOT directly from client components.
 */

import type { AIAnalysisRequest, AIAnalysisResponse } from "@/types";

const NVIDIA_MODEL = 'nvidia/nemotron-3-super-120b-a12b';
const OPENROUTER_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

/**
 * Analyze a file and generate summary
 */
export async function analyzeFile(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  // Try NVIDIA NIM first
  if (nvidiaKey) {
    try {
      return await analyzeWithNvidia(request, nvidiaKey);
    } catch (error) {
      console.warn('NVIDIA NIM failed, falling back to OpenRouter:', error);
    }
  }

  // Fallback to OpenRouter (free Nemotron tier)
  if (openRouterKey) {
    return await analyzeWithOpenRouter(request, openRouterKey);
  }

  throw new Error('No AI provider configured. Set NVIDIA_API_KEY or OPENROUTER_API_KEY');
}

/**
 * Analyze using NVIDIA NIM (Nemotron)
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
      model: NVIDIA_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a file analysis assistant. Provide concise, helpful summaries directly without showing your reasoning.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      top_p: 0.95,
      max_tokens: 1024,
      // Nemotron's "thinking" mode exposes chain-of-thought as the answer.
      // Disable it so we get a clean final summary.
      chat_template_kwargs: { enable_thinking: false },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`NVIDIA NIM API error (${response.status}): ${errText || response.statusText}`);
  }

  const data = await response.json();
  const summary = extractCleanSummary(data);

  return {
    summary,
    provider: 'nvidia',
  };
}

/**
 * Analyze using Nemotron via OpenRouter (free tier)
 */
async function analyzeWithOpenRouter(
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
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a file analysis assistant. Provide concise, helpful summaries directly without showing your reasoning.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      top_p: 0.95,
      max_tokens: 1024,
      chat_template_kwargs: { enable_thinking: false },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`OpenRouter API error (${response.status}): ${errText || response.statusText}`);
  }

  const data = await response.json();
  const summary = extractCleanSummary(data);

  return {
    summary,
    provider: 'openrouter',
  };
}

/**
 * Extract the final answer from a Nemotron response, stripping any
 * leaked reasoning/thinking content.
 */
function extractCleanSummary(data: any): string {
  const choice = data.choices?.[0];
  if (!choice) return 'No summary generated';

  const message = choice.message || {};
  let content: string = (message.content || '').trim();

  // Some providers split reasoning into a separate field. If `content` is empty
  // but we have reasoning, use it (last resort) — otherwise prefer content.
  if (!content && message.reasoning_content) {
    content = String(message.reasoning_content).trim();
  }

  // Strip <think>...</think> blocks if the model leaked them into content
  content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // If the response still looks like raw reasoning ("The user says...", "Let me think..."),
  // try to keep only the last paragraph which usually contains the final answer.
  const reasoningStarts = /^(the user (says|wants|asked)|let me think|first,|i need to|okay,|so the user)/i;
  if (reasoningStarts.test(content)) {
    const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    if (paragraphs.length > 1) {
      content = paragraphs[paragraphs.length - 1];
    }
  }

  return content || 'No summary generated';
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
    const maxLength = 3000;
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
  prompt += `\nKeep the response under 200 words. Plain text only, no markdown headers.`;

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
  const prompt =
    `Compare these two versions of "${fileName}":\n\n` +
    `Version 1:\n${oldSummary}\n\n` +
    `Version 2:\n${newSummary}\n\n` +
    `Explain what changed in 3-4 sentences. Focus on substantive differences. ` +
    `If the content is similar, say so. Plain text only.`;

  try {
    const result = await analyzeFile({
      fileName,
      mimeType: 'text/plain',
      fileContent: prompt,
    });
    return result.summary;
  } catch (error) {
    console.error('Version comparison failed:', error);
    return 'Unable to compare versions';
  }
}
