/**
 * AI Assistant API
 * Chat-style endpoint that answers questions about the user's files
 * Uses their file metadata + AI summaries as context
 */

import { NextRequest, NextResponse } from 'next/server';

const NVIDIA_MODEL = 'nvidia/nemotron-3-super-120b-a12b';
const OPENROUTER_MODEL = 'nvidia/nemotron-3-super-120b-a12b:free';

interface FileContext {
  name: string;
  fileId: string;
  objectId?: string;
  mimeType: string;
  createdAt: number;
  versions: {
    version: number;
    timestamp: number;
    blobId: string;
    summary?: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, files, conversationHistory } = body as {
      message: string;
      files: FileContext[];
      conversationHistory?: { role: string; content: string }[];
    };

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Build the file context for the AI
    const fileContext = buildFileContext(files || []);

    // Build conversation
    const systemPrompt = `You are Delta, the personal AI assistant for SuiDrive — a decentralized file storage platform built on Sui blockchain and Walrus decentralized storage.

ABOUT SUIDRIVE:
SuiDrive is a decentralized "Google Drive + Git" that provides:
- Permanent, immutable file storage on Walrus (content-addressed blobs)
- Verifiable version history anchored as Move objects on Sui blockchain
- AI-powered file analysis and change summaries (NVIDIA Nemotron)
- Google Sign-In via Sui zkLogin (no wallet extension needed)
- Client-side encryption (AES-256-GCM) for private files
- Public verification portal — anyone can verify file authenticity with a blob ID
- Sponsored transactions — users never pay gas fees
- File sharing with public links and wallet-based access control

TECH STACK:
- Sui blockchain (smart contracts in Move language)
- Walrus decentralized storage (content-addressed permanent blobs)
- Next.js frontend with Tailwind CSS
- NVIDIA Nemotron 120B for AI summaries
- Tatum for managed Sui RPC
- zkLogin for passwordless auth via Google

YOUR ROLE:
You are Delta. You help users navigate their files, understand their content, find specific documents, and explain how SuiDrive works. You are knowledgeable about blockchain, decentralized storage, file versioning, and the Sui ecosystem.

CURRENT DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

USER'S FILE LIBRARY:
${fileContext}

INSTRUCTIONS:
- When you find a matching file, mention its name, type, upload date, and the objectId so they can navigate to it
- Format links like: [View File](/files/OBJECT_ID)
- If multiple files match, list all of them ranked by relevance
- You can reference AI summaries to describe file content
- Be conversational, warm, and helpful
- If asked about versions, describe the version history accurately
- If asked about SuiDrive features, explain them clearly
- If you can't find a file, suggest similar ones or ask for more details
- Keep responses concise but informative
- Always introduce yourself as Delta when appropriate
- Never invent files that don't exist in the library above`;

    const messages: { role: string; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (last 10 messages max)
    if (conversationHistory && conversationHistory.length > 0) {
      const recent = conversationHistory.slice(-10);
      messages.push(...recent);
    }

    messages.push({ role: 'user', content: message });

    // Call AI
    const response = await callAI(messages);
    return NextResponse.json({ reply: response });
  } catch (error) {
    console.error('Assistant error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Assistant failed' },
      { status: 500 }
    );
  }
}

function buildFileContext(files: FileContext[]): string {
  if (files.length === 0) {
    return '(No files uploaded yet)';
  }

  return files.map((f, i) => {
    const created = new Date(f.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const versions = f.versions.map((v) => {
      const vDate = new Date(v.timestamp).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
      return `  - Version ${v.version}: ${vDate} | blobId: ${v.blobId.slice(0, 12)}... ${v.summary ? `| Summary: "${v.summary}"` : ''}`;
    }).join('\n');

    return `[${i + 1}] "${f.name}" (${f.mimeType})
  Created: ${created}
  File ID: ${f.fileId}
  Object ID: ${f.objectId || 'N/A'}
  Versions (${f.versions.length}):
${versions}`;
  }).join('\n\n');
}

async function callAI(messages: { role: string; content: string }[]): Promise<string> {
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  // Try NVIDIA first
  if (nvidiaKey) {
    try {
      const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${nvidiaKey}`,
        },
        body: JSON.stringify({
          model: NVIDIA_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 1024,
          chat_template_kwargs: { enable_thinking: false },
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return cleanResponse(content);
      }
    } catch (e) {
      console.warn('NVIDIA failed for assistant:', e);
    }
  }

  // Fallback to OpenRouter
  if (openRouterKey) {
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'SuiDrive Assistant',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        chat_template_kwargs: { enable_thinking: false },
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) return cleanResponse(content);
    }
  }

  throw new Error('No AI provider available');
}

function cleanResponse(text: string): string {
  // Strip <think> blocks
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  // Strip leading reasoning patterns
  const reasoningStarts = /^(the user (says|wants|asked)|let me think|first,|i need to|okay,|so the user)/i;
  if (reasoningStarts.test(cleaned)) {
    const parts = cleaned.split(/\n\s*\n/).filter(Boolean);
    if (parts.length > 1) cleaned = parts.slice(1).join('\n\n');
  }
  return cleaned || text;
}
