import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Bot, User, X, Trash2, Zap, Terminal, Copy, Check, ChevronRight } from 'lucide-react';
import { devPulseApi } from '../utils/api';
import { soundFx } from '../utils/audio';
import { Developer } from '../types';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Developer;
  activeTaskCount?: number;
  velocityScore?: number;
  onOpenTaskGenerator?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  '⚡ Break down my next sprint feature',
  '📊 Analyze our current sprint bottlenecks',
  '🗄️ Optimize MongoDB schemas & indexes',
  '🚀 Draft release notes for this sprint',
];

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeTaskCount = 5,
  velocityScore = 88,
  onOpenTaskGenerator,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `👋 **DevPulse AI Copilot Active**!\n\nI am your AI systems architect and agile sprint coach. Ask me to break down features into Jira tasks, analyze sprint bottlenecks, optimize API schemas, or draft code solutions.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isLoading) return;

    soundFx.playClick(700, 0.03);
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await devPulseApi.chatWithAICopilot(apiMessages, {
        activeTaskCount,
        velocityScore,
        userName: currentUser.name,
      });

      if (res.success && res.data?.reply) {
        soundFx.playSuccess();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(res.error?.message || 'Failed to get copilot response');
      }
    } catch (err: any) {
      console.warn('[Copilot Error]', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Error: ${err.message || 'Could not reach AI copilot service. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    soundFx.playClick(900, 0.02);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'init-1',
        role: 'assistant',
        content: `Chat history cleared. How can I assist with your workspace?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-950 border-l border-cyan-500/30 shadow-2xl flex flex-col font-mono animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-[1px] shadow-md shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">DevPulse AI Copilot</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400">Context-Aware Developer Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClearChat}
            title="Clear Chat"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((m) => {
          const isBot = m.role === 'assistant';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                  isBot
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}
              >
                {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isBot
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-100 font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[9px] text-slate-500">
                  <span>{m.timestamp}</span>
                  {isBot && (
                    <button
                      type="button"
                      onClick={() => handleCopy(m.content, m.id)}
                      className="hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>DevPulse Copilot is generating response...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/90 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Quick Prompts</span>
          {onOpenTaskGenerator && (
            <button
              type="button"
              onClick={onOpenTaskGenerator}
              className="text-cyan-400 hover:underline flex items-center gap-0.5 lowercase"
            >
              <span>task generator</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-900 hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-slate-800 text-[10px] text-slate-300 text-left transition-all truncate cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot (e.g. Generate tasks, debug latency)..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold disabled:opacity-50 transition-all cursor-pointer"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
