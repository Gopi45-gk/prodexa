import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { ChatMessage, generateChatResponse } from "@/lib/llm";
import { useStore } from "@/contexts/StoreContext";

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

      <div className={`fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-50 w-[calc(100vw-2rem)] md:w-96 h-[500px] max-h-[75vh] glass rounded-2xl border border-white/10 shadow-elegant flex flex-col transition-all origin-bottom-right duration-300 ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 gradient-primary rounded-t-2xl">
          <div className="flex items-center gap-2 text-white">
            <Bot className="h-5 w-5" />
            <h3 className="font-display font-bold">PRODEXA AI Coach</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm mt-10">
              <Bot className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Hi! I'm your personal productivity coach.</p>
              <p>Ask me for advice, task prioritization, or motivation!</p>
            </div>
          )}
          
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${m.role === "user" ? "bg-accent/20 text-accent" : "gradient-primary text-white"}`}>
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`p-3 rounded-2xl max-w-[75%] text-sm ${m.role === "user" ? "bg-accent/10 text-foreground rounded-tr-none" : "bg-white/5 border border-white/5 rounded-tl-none"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-full gradient-primary text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
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
    </>
  );
}
