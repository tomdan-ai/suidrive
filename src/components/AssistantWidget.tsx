/**
 * AI Assistant Widget
 * Floating chat bubble at bottom-right corner (like Intercom)
 * Click to expand, click again or click outside to collapse
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useZkLogin } from '@/contexts/ZkLoginProvider';

const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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

export function AssistantWidget() {
  const { address, suiClient: client } = useZkLogin();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileContext, setFileContext] = useState<FileContext[]>([]);
  const [contextLoaded, setContextLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load file context when widget opens and wallet is connected
  useEffect(() => {
    if (!open || !address || !PACKAGE_ID || contextLoaded) return;

    async function loadContext() {
      try {
        const fileObjects = await client.getOwnedObjects({
          owner: address!,
          filter: { StructType: `${PACKAGE_ID}::file_object::FileObject` },
          options: { showContent: true },
        });

        const versionObjects = await client.getOwnedObjects({
          owner: address!,
          filter: { StructType: `${PACKAGE_ID}::version_object::VersionObject` },
          options: { showContent: true },
        });

        const versionMap = new Map<string, any[]>();
        for (const obj of versionObjects.data) {
          if (obj.data?.content?.dataType === 'moveObject') {
            const fields = obj.data.content.fields as any;
            const fid = fields.file_id;
            if (!versionMap.has(fid)) versionMap.set(fid, []);
            versionMap.get(fid)!.push({
              version: versionMap.get(fid)!.length + 1,
              timestamp: parseInt(fields.timestamp),
              blobId: fields.walrus_blob_id,
              summary: fields.ai_summary || undefined,
            });
          }
        }

        const ctx: FileContext[] = [];
        for (const obj of fileObjects.data) {
          if (obj.data?.content?.dataType === 'moveObject') {
            const fields = obj.data.content.fields as any;
            const versions = versionMap.get(fields.file_id) || [];
            versions.sort((a: any, b: any) => a.timestamp - b.timestamp);
            ctx.push({
              name: fields.name,
              fileId: fields.file_id,
              objectId: obj.data.objectId,
              mimeType: fields.mime_type,
              createdAt: parseInt(fields.created_at),
              versions,
            });
          }
        }

        ctx.sort((a, b) => b.createdAt - a.createdAt);
        setFileContext(ctx);
        setContextLoaded(true);

        setMessages([{
          role: 'assistant',
          content: `Hey! I know about your **${ctx.length} file${ctx.length !== 1 ? 's' : ''}**. Ask me anything — like "find that PDF from last week" or "what changed in my latest upload?"`,
        }]);
      } catch (err) {
        console.error('Assistant context load failed:', err);
        setContextLoaded(true);
        setMessages([{
          role: 'assistant',
          content: 'I had trouble loading your files. Make sure your wallet is connected.',
        }]);
      }
    }

    loadContext();
  }, [open, address, client, contextLoaded]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const conversationHistory = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

      const resp = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          files: fileContext,
          conversationHistory,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-[100] w-[380px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[70vh] bg-[#0a0f1a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#070c15]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-sm">
                🤖
              </div>
              <div>
                <span className="text-sm font-bold text-white">SuiDrive AI</span>
                {contextLoaded && (
                  <span className="ml-2 text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
                    {fileContext.length} files
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white text-lg leading-none">
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {!address && (
              <div className="text-center py-8 text-gray-500 text-xs">
                Sign in with Google to chat about your files
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    🤖
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white/5 text-gray-300 rounded-bl-sm border border-white/5'
                }`}>
                  <FormattedContent content={msg.content} />
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-[10px] shrink-0">
                  🤖
                </div>
                <div className="bg-white/5 rounded-xl rounded-bl-sm px-3 py-2 border border-white/5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-white/5 bg-[#070c15]">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask about your files..."
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs focus:border-blue-500 focus:outline-none placeholder:text-gray-600"
                disabled={loading || !address}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading || !address}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-xs font-bold transition"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 ${
          open
            ? 'bg-gray-700 hover:bg-gray-600 rotate-0'
            : 'bg-gradient-to-br from-purple-600 to-blue-600 hover:scale-110 shadow-[0_0_30px_rgba(147,51,234,0.4)]'
        }`}
        title="SuiDrive AI Assistant"
      >
        {open ? (
          <span className="text-white text-xl">×</span>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>
    </>
  );
}

function FormattedContent({ content }: { content: string }) {
  const parts = content.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\)|\n)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          return <Link key={i} href={linkMatch[2]} className="text-blue-400 hover:underline">{linkMatch[1]}</Link>;
        }
        if (part === '\n') return <br key={i} />;
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
