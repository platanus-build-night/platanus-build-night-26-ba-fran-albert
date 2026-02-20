"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Loader2 } from "lucide-react";
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);
    setStreamingText("");

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

      if (!res.ok) {
        throw new Error("Error del servidor");
      }

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
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                fullText += parsed.text;
                setStreamingText(fullText);
              }
            } catch (e) {
              if (e instanceof Error && e.message !== "Unexpected end of JSON input") throw e;
            }
          }
        }
      }

      buffer += decoder.decode();
      if (buffer.trimEnd().startsWith("data: ")) {
        const data = buffer.trimEnd().slice(6);
        if (data !== "[DONE]") {
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullText += parsed.text;
            }
          } catch { /* ignore trailing partial */ }
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fullText },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error al procesar la consulta. Intenta nuevamente." },
      ]);
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat sobre {patientName}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 pr-3" ref={scrollRef}>
          <div className="space-y-4 pb-2">
            {messages.length === 0 && !isStreaming && (
              <div className="text-center py-8 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Preguntale lo que necesites sobre este paciente.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {[
                    "Resumi los antecedentes",
                    "Que medicacion toma?",
                    "Tiene alergias?",
                    "Cuando fue su ultimo control?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-xs border rounded-full px-3 py-1.5 hover:bg-muted transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {isStreaming && streamingText && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-2.5 bg-muted text-sm">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{streamingText}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {isStreaming && !streamingText && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-3 border-t mt-2">
          <Textarea
            placeholder="Escribi tu pregunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] max-h-[100px] resize-none"
            rows={1}
            disabled={isStreaming}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
