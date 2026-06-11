import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { ChatMessage, generateChatResponse } from "@/lib/llm";
import { useStore } from "@/contexts/StoreContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  
  const { tasks, goals, focusSessions, xp, level } = useStore();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const contextData = { xp, level, tasks, goals, focusSessions };
      const response = await generateChatResponse(input, contextData);
      setMessages([...newMessages, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I am having trouble connecting to my neural network right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-40 h-14 w-14 rounded-full gradient-primary shadow-glow flex items-center justify-center text-white transition-transform ${isOpen ? "scale-0" : "scale-100 hover:scale-110"}`}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <div className={`fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-50 w-[calc(100vw-2rem)] md:w-[450px] h-[600px] max-h-[80vh] bg-[#0B1120]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col transition-all origin-bottom-right duration-300 ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 gradient-primary rounded-t-2xl">
          <div className="flex items-center gap-2 text-white">
            <Bot className="h-5 w-5" />
            <h3 className="font-display font-bold text-white shadow-sm">PRODEXA AI Coach</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-[15px] mt-10">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Hi! I'm your personal productivity coach.</p>
              <p>Ask me for advice, task prioritization, or motivation!</p>
            </div>
          )}
          
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-lg ${m.role === "user" ? "bg-accent/20 text-accent" : "gradient-primary text-white"}`}>
                {m.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
              <div className={`p-4 rounded-2xl max-w-[85%] text-[15px] shadow-sm ${m.role === "user" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-none" : "bg-slate-800/80 border border-slate-700/50 rounded-tl-none text-slate-200"}`}>
                {m.role === "user" ? (
                  m.content
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className="markdown-body">
                    {m.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-full gradient-primary text-white flex items-center justify-center shadow-lg">
                <Bot className="h-5 w-5" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/50 rounded-tl-none flex items-center gap-3 shadow-sm">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[15px] font-medium text-slate-300">PRODEXA AI is analyzing...</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-white/5 bg-black/20 rounded-b-2xl">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-white disabled:opacity-50 transition-opacity"
            >
              <Send className="h-4 w-4 translate-x-px translate-y-px" />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .markdown-body {
          font-size: 15px;
          line-height: 1.6;
          color: #e2e8f0;
        }
        .markdown-body p {
          margin-bottom: 0.75em;
        }
        .markdown-body p:last-child {
          margin-bottom: 0;
        }
        .markdown-body ul, .markdown-body ol {
          margin-bottom: 0.75em;
          padding-left: 1.5em;
        }
        .markdown-body ul {
          list-style-type: disc;
        }
        .markdown-body ol {
          list-style-type: decimal;
        }
        .markdown-body li {
          margin-bottom: 0.25em;
        }
        .markdown-body code {
          background-color: rgba(0, 0, 0, 0.3);
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: monospace;
        }
        .markdown-body pre {
          background-color: #020617;
          padding: 1em;
          border-radius: 8px;
          overflow-x: auto;
          margin-bottom: 0.75em;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .markdown-body pre code {
          background-color: transparent;
          padding: 0;
          font-size: 0.9em;
        }
        .markdown-body strong {
          font-weight: 600;
          color: white;
        }
        .markdown-body a {
          color: #60a5fa;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
