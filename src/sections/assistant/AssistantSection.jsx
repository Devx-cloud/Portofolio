import { useChatAgent } from "@/hooks/useChatAgent";
import { useTypewriter } from "@/hooks/useTypewriter";
import { ChatPanel } from "./components/ChatPanel";
import { RoomScene } from "./components/RoomScene";

const GREETING =
  "Halo! Saya asisten AI Deva Surya. Tanyakan apa saja tentang profil, skill, atau proyek Deva.";

export const AssistantSection = () => {
  const { messages, input, setInput, isLoading, handleSubmit, messagesContainerRef } =
    useChatAgent(GREETING);

  const lastReply = [...messages].reverse().find((m) => m.role === "assistant");
  const typedReply = useTypewriter(lastReply?.content ?? "");

  return (
    <section className="relative flex min-h-[75vh] flex-col items-center overflow-hidden bg-background px-4 py-16">
      <RoomScene />

      <ChatPanel
        containerRef={messagesContainerRef}
        reply={lastReply ? typedReply : ""}
        isLoading={isLoading}
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
      />
    </section>
  );
};
