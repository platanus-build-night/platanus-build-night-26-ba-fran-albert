"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  MoreHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  patientId: string;
  patientName: string;
}

export function ChatPanel({ patientId, patientName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, streamingText, isStreaming]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);
    setStreamingText("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          message: text,
          history: messages,
        }),
      });

      if (!res.ok) throw new Error("Error del servidor");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const raw of lines) {
          const line = raw.trimEnd();
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setStreamingText(fullText);
              }
            } catch (e) { /* ignore json error */ }
          }
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: fullText }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Lo siento, hubo un error al procesar tu consulta. Por favor intentá nuevamente." }]);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-2xl overflow-hidden shadow-sm border border-border/50 relative">
      {/* Header */}
      <div className="h-14 px-4 border-b bg-muted/30 flex items-center justify-between shrink-0 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-primary to-purple-500 opacity-20 blur-sm animate-pulse" />
            <div className="relative h-8 w-8 rounded-full bg-background flex items-center justify-center border border-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Asistente IA</h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Conectado a Historia Clínica
            </p>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
        <div className="space-y-6 pb-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-12 px-4 text-center space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-2 ring-1 ring-primary/10">
                <Sparkles className="h-8 w-8 text-primary/80" />
              </div>
              <h3 className="font-medium text-lg">¿En qué puedo ayudarte hoy?</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Puedo responder preguntas sobre {patientName}, resumir su historia o buscar interacciones.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md mt-6">
                {[ 
                  "Resumí los antecedentes",
                  "¿Qué medicación toma?",
                  "¿Tiene alergias conocidas?",
                  "Analizá sus últimos labs"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-xs text-left px-4 py-3 rounded-xl border border-border/50 bg-card hover:bg-muted hover:border-primary/20 transition-all duration-200 shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8 mt-1 border border-primary/10 bg-primary/5">
                  <AvatarFallback className="bg-transparent"><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                </Avatar>
              )}
              
              <div className={`
                max-w-[85%] px-4 py-3 text-sm shadow-sm
                ${msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" 
                  : "bg-muted/50 border border-border/50 text-foreground rounded-2xl rounded-tl-sm"}
              `}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-background/50">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}
              </div>

              {msg.role === "user" && (
                <Avatar className="h-8 w-8 mt-1 border border-border bg-muted">
                  <AvatarFallback><User className="h-4 w-4 text-muted-foreground" /></AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}

          {/* Streaming Indicator */}
          {isStreaming && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <Avatar className="h-8 w-8 mt-1 border border-primary/10 bg-primary/5">
                 <AvatarFallback className="bg-transparent"><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
              </Avatar>
              <div className="max-w-[85%] bg-muted/50 border border-border/50 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                {streamingText ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{streamingText}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex gap-1 h-5 items-center px-1">
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-background border-t">
        <div className="relative flex items-end gap-2 bg-muted/30 p-2 rounded-2xl border border-border/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
          <Textarea
            ref={textareaRef}
            placeholder="Escribí un mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            rows={1}
            className="min-h-[24px] max-h-[120px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 px-3 py-2 text-sm placeholder:text-muted-foreground/50 shadow-none"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className={`h-9 w-9 mb-0.5 rounded-xl transition-all duration-300 ${input.trim() ? "bg-primary text-primary-foreground shadow-md hover:scale-105" : "bg-transparent text-muted-foreground hover:bg-muted"}`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground/40 mt-2">
          La IA puede cometer errores. Verificá la información clínica importante.
        </p>
      </div>
    </div>
  );
}