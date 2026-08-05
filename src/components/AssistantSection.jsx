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

      <div className="relative z-10 w-full max-w-3xl mt-56 md:mt-72 bg-neutral-900/50 backdrop-blur-2xl border-2 border-red-700/70 shadow-lg flex flex-col">
        <span className="absolute -top-4 left-3 bg-red-600 border-2 border-red-400 px-3 py-1 pixel-font text-[10px] md:text-xs text-white z-10">
          DEV_X AI
        </span>

        <div ref={messagesContainerRef} className="flex-1 h-[55vh] overflow-y-auto p-4 pt-8 space-y-4">
          {!isLoading && lastAssistantMessage && (
            <div className="text-left text-sm pixel-font text-neutral-200">
              {typedReply}
            </div>
          )}
          {isLoading && (
            <div className="text-left text-sm text-neutral-200 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
              <span className="pixel-font text-neutral-400">Mengetik...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-3 border-t border-red-700/50">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya sesuatu tentang Deva..."
              className="w-full pl-4 pr-12 py-3 bg-neutral-800 border border-neutral-700 focus:ring-2 focus:ring-red-500/50 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-red-600 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
