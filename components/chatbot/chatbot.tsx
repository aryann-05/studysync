"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bot,
  Send,
  X,
  Trash2,
  Sparkles,
  ArrowUp,
  User,
  Lightbulb,
  Copy,
  Check,
  Code2,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendChatMessage, type ChatMessage } from "@/services/chat";
import { useStudyContext } from "@/context/StudyContext";

const STORAGE_KEY = "studysync_chat_history";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome-msg",
  role: "assistant",
  content:
    "Hi! 👋 I'm **StudySync AI**, your personal AI study assistant.\n\nI can answer **any reasonable question**, including:\n- 💡 **General Concepts & Theory** (OOP, DBMS, SDLC, Operating Systems, Networks, Cloud)\n- 💻 **Programming & Code** (Java, Python, C++, SQL, React, Web Dev)\n- 📝 **Exam & Interview Prep** (Notes, 5-mark / 10-mark answers, MCQs, QA questions)\n- 📅 **Custom Study Plans** (7-day Java plan, daily revision strategies)\n- 📄 **Your Syllabus & Coursework** (Ask questions about your uploaded materials)\n\nAsk me anything to get started!",
  timestamp: "Just now",
};

const QUICK_PROMPTS = [
  { label: "💡 Explain a concept", prompt: "Explain polymorphism in simple language with a real-life example." },
  { label: "💻 Ask a programming question", prompt: "Write a Python program to reverse a string and explain how it works." },
  { label: "📝 Generate MCQs", prompt: "Create 10 MCQs on operating systems with answer keys and explanations." },
  { label: "📅 Create a study plan", prompt: "Make a 7-day study plan for Java." },
  { label: "🎯 Interview questions", prompt: "Give me 10 manual testing and QA interview questions." },
  { label: "🚀 Help me study", prompt: "Explain DBMS normalization (1NF, 2NF, 3NF, BCNF) for an MCA student." },
];

function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-3.5 py-1.5 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
          <Code2 className="h-3.5 w-3.5" />
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          title="Copy code"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-3 text-xs font-mono leading-relaxed text-zinc-200 scrollbar-thin">
        <pre className="whitespace-pre">{code}</pre>
      </div>
    </div>
  );
}

// Full Markdown, Table, and Code Block renderer
function FormattedContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";

  let inTable = false;
  let tableBuffer: string[] = [];

  const renderInline = (str: string) => {
    // Process **bold** and `code` inline
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="rounded bg-muted-foreground/15 px-1 py-0.5 text-xs font-mono text-primary font-medium"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const flushTable = (keyPrefix: number) => {
    if (tableBuffer.length < 2) {
      tableBuffer = [];
      inTable = false;
      return;
    }

    const headerLine = tableBuffer[0];
    const dataLines = tableBuffer.slice(2);

    const parseCells = (line: string) =>
      line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());

    const headers = parseCells(headerLine);

    renderedElements.push(
      <div key={`table-${keyPrefix}`} className="my-2.5 overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse rounded-lg border border-border text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/60 font-semibold text-foreground">
              {headers.map((h, i) => (
                <th key={i} className="px-2.5 py-1.5 text-left border-r border-border last:border-r-0">
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataLines.map((row, rIdx) => {
              const cells = parseCells(row);
              return (
                <tr key={rIdx} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                  {cells.map((cell, cIdx) => (
                    <td key={cIdx} className="px-2.5 py-1.5 text-left border-r border-border last:border-r-0">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );

    tableBuffer = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block fences
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        renderedElements.push(
          <CodeBlock key={`code-${i}`} code={codeBuffer.join("\n")} language={codeLang} />
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = "";
      } else {
        if (inTable) flushTable(i);
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Table rows
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      tableBuffer.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // Empty lines
    if (!trimmed) {
      renderedElements.push(<div key={`spacer-${i}`} className="h-1" />);
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      renderedElements.push(
        <h4 key={`h4-${i}`} className="mt-3 mb-1 text-sm font-bold text-foreground first:mt-0">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      renderedElements.push(
        <h3 key={`h3-${i}`} className="mt-3.5 mb-1 text-sm font-extrabold text-foreground first:mt-0">
          {renderInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }

    // Bullet lists
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      renderedElements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 pl-1 my-0.5">
          <span className="text-primary font-bold leading-tight">•</span>
          <span className="flex-1">{renderInline(trimmed.slice(2))}</span>
        </div>
      );
      continue;
    }

    // Numbered lists
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      renderedElements.push(
        <div key={`ordered-${i}`} className="flex items-start gap-2 pl-1 my-0.5">
          <span className="font-semibold text-primary text-xs pt-0.5 min-w-[16px]">
            {orderedMatch[1]}.
          </span>
          <span className="flex-1">{renderInline(orderedMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Standard paragraph
    renderedElements.push(
      <p key={`p-${i}`} className="my-0.5">
        {renderInline(trimmed)}
      </p>
    );
  }

  if (inCodeBlock && codeBuffer.length > 0) {
    renderedElements.push(
      <CodeBlock key="code-end" code={codeBuffer.join("\n")} language={codeLang} />
    );
  }
  if (inTable && tableBuffer.length > 0) {
    flushTable(lines.length);
  }

  return <div className="space-y-1 text-sm leading-relaxed">{renderedElements}</div>;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const { activePlan, topics } = useStudyContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore chat history from localStorage on client mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // Storage parse fallback
    }
    setMessages([WELCOME_MESSAGE]);
  }, []);

  // Sync messages to localStorage
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage error fallback
    }
  }, [messages, isMounted]);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading, scrollToBottom]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: text,
      timestamp: formatTime(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputValue("");
    setIsLoading(true);

    // Provide active syllabus context if available
    const syllabusContext =
      activePlan && activePlan.name
        ? {
            course_name: activePlan.name,
            exam_date: activePlan.examDate,
            topics: topics.map((t) => t.name),
          }
        : null;

    try {
      const { reply } = await sendChatMessage(text, nextMessages, syllabusContext);

      const assistantMessage: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        content: reply,
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        content: "Sorry, I couldn't generate a response right now. Please try again.",
        timestamp: formatTime(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleNewChat = () => {
    setMessages([
      {
        ...WELCOME_MESSAGE,
        timestamp: formatTime(),
      },
    ]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage error fallback
    }
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-primary via-indigo-600 to-secondary px-4 py-3 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95"
          aria-label="Open StudySync AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <span className="hidden sm:inline font-medium text-sm">
            StudySync AI
          </span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex flex-col w-auto sm:w-[450px] md:w-[480px] h-[calc(100dvh-5rem)] sm:h-[640px] max-h-[700px] rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden transition-all duration-200 animate-scale-in"
          role="dialog"
          aria-modal="true"
          aria-label="StudySync AI Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 via-card to-secondary/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                <Bot className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-card"></span>
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight text-foreground flex items-center gap-1.5">
                  StudySync AI
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </h3>
                <p className="text-xs text-muted-foreground">
                  LLM-Powered General Study Assistant • Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                onClick={handleNewChat}
                title="Start a new chat"
                aria-label="Start new chat"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleNewChat}
                title="Clear conversation"
                aria-label="Clear chat conversation"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close StudySync Assistant"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Conversation Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[88%] rounded-2xl px-4 py-2.5 shadow-xs ${
                      isUser
                        ? "bg-primary text-primary-foreground rounded-br-xs"
                        : "bg-muted text-foreground border border-border/60 rounded-bl-xs"
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    ) : (
                      <FormattedContent content={msg.content} />
                    )}

                    <div className="mt-1 flex items-center justify-between gap-2 text-[10px]">
                      <span
                        className={
                          isUser
                            ? "text-primary-foreground/75"
                            : "text-muted-foreground"
                        }
                      >
                        {msg.timestamp}
                      </span>

                      {!isUser && msg.id !== "welcome-msg" && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-opacity"
                          title="Copy message"
                          aria-label="Copy assistant message"
                        >
                          {copiedMsgId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-500 text-[10px]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span className="text-[10px]">Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary border border-secondary/20">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick Prompts when conversation is fresh */}
            {messages.length <= 1 && (
              <div className="mt-3 pt-2">
                <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  Quick prompts:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="text-xs rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-primary/40 transition-all text-left"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading / Typing Indicator */}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-bl-xs border border-border/60 bg-muted px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      StudySync AI is typing...
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="border-t border-border bg-card p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any question... (Shift + Enter for newline)"
                disabled={isLoading}
                className="flex-1 max-h-28 min-h-[42px] resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all disabled:opacity-50"
                aria-label="Type your message"
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-40 transition-all"
                aria-label="Send message"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Powered by real LLM • Press <kbd className="font-mono">Enter</kbd> to send, <kbd className="font-mono">Shift+Enter</kbd> for newline
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;

