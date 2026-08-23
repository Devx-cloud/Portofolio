import { Send, Loader2 } from "lucide-react";
import { useChatAgent } from "../hooks/useChatAgent";
import { useTypewriter } from "../hooks/useTypewriter";

export const AssistantSection = () => {
  const { messages, input, setInput, isLoading, handleSubmit, messagesContainerRef } = useChatAgent(
    "Halo! Saya asisten AI Deva Surya. Tanyakan apa saja tentang profil, skill, atau proyek Deva."
  );

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
  const typedReply = useTypewriter(lastAssistantMessage?.content ?? "");

  return (
    <section className="min-h-[75vh] flex flex-col items-center px-4 py-16 relative">
      <img
        src="/ai-ask.png"
        alt="Deva Surya"
        style={{ imageRendering: "pixelated" }}
        className="absolute left-1/2 -translate-x-1/2 top-0 w-80 h-80 md:w-[28rem] md:h-[28rem] object-cover z-0 pointer-events-none drop-shadow-[0_0_35px_rgba(220,38,38,0.4)]"
      />

      <div className="relative z-10 w-full max-w-3xl mt-56 md:mt-72 glass-panel scanlines flex flex-col">
        <span className="absolute -top-4 left-3 glass-chip stage-border stage-bg-soft stage-text px-3 py-1 pixel-font text-[10px] md:text-xs z-10">
          DEV_X AI
        </span>

        <div ref={messagesContainerRef} className="flex-1 h-[55vh] overflow-y-auto p-4 pt-8 space-y-4">
          {!isLoading && lastAssistantMessage && (
            <div className="text-left text-sm pixel-font text-foreground/90">
              {typedReply}
            </div>
          )}
          {isLoading && (
            <div className="text-left text-sm text-foreground/90 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin stage-text" />
              <span className="pixel-font text-muted-foreground">Mengetik...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-3 border-t-2 stage-border-soft">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya sesuatu tentang Deva..."
              className="w-full pl-4 pr-12 py-3 glass-input text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 stage-bg-soft stage-border stage-text border-2 hover:stage-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
